// TypeScript interfaces for Actor Coffee Shop Example
interface Order {
  id: string;
  customerName: string;
  beverage: string;
  size: 'small' | 'medium' | 'large';
  timestamp: number;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  price: number;
}

interface CoffeeShopContext {
  orders: Order[];
  totalRevenue: number;
  errorCount: number;
  isOverwhelmed: boolean;
  currentOrder?: Order;
}

interface CoffeeShopEvents {
  type: 'PLACE_ORDER' | 'PROCESS_ORDER' | 'COMPLETE_ORDER' | 'HANDLE_ERROR' | 'RESET_SHOP';
  order?: Partial<Order>;
  orderId?: string;
  error?: string;
}

/**
 * Actor Coffee Shop - Proper State Management Example
 * 
 * This code demonstrates best practices with actor-based architecture:
 * - Isolated state management
 * - Predictable state transitions
 * - Proper error handling
 * - Event-driven communication
 * - Easy testing and debugging
 * 
 * Used for educational purposes to show proper state management patterns.
 */

// ✅ State machine configuration (pure, no side effects)
const coffeeShopMachine = {
  id: 'coffeeShop',
  initial: 'idle',
  context: {
    orders: [],
    totalRevenue: 0,
    errorCount: 0,
    isOverwhelmed: false
  } as CoffeeShopContext,
  
  states: {
    idle: {
      on: {
        PLACE_ORDER: {
          target: 'processing',
          actions: ['addOrder']
        }
      }
    },
    
    processing: {
      on: {
        PROCESS_ORDER: {
          target: 'brewing',
          actions: ['updateOrderStatus']
        },
        HANDLE_ERROR: {
          target: 'error',
          actions: ['recordError']
        }
      }
    },
    
    brewing: {
      after: {
        2000: { // 2 second brewing time
          target: 'ready',
          actions: ['completeOrder']
        }
      },
      on: {
        HANDLE_ERROR: {
          target: 'error',
          actions: ['recordError']
        }
      }
    },
    
    ready: {
      on: {
        COMPLETE_ORDER: {
          target: 'idle',
          actions: ['finalizeOrder', 'updateRevenue']
        }
      }
    },
    
    error: {
      on: {
        PLACE_ORDER: {
          target: 'processing',
          actions: ['addOrder', 'clearError']
        },
        RESET_SHOP: {
          target: 'idle',
          actions: ['resetShop']
        }
      }
    }
  }
};

// ✅ Pure action functions (no side effects, easy to test)
const actions = {
  addOrder: (context: CoffeeShopContext, event: CoffeeShopEvents): CoffeeShopContext => {
    if (event.type !== 'PLACE_ORDER' || !event.order) return context;
    
    const prices = { small: 3.50, medium: 4.50, large: 5.50 };
    const order: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      customerName: event.order.customerName || 'Anonymous',
      beverage: event.order.beverage || 'Coffee',
      size: event.order.size || 'medium',
      timestamp: Date.now(),
      status: 'pending',
      price: prices[event.order.size || 'medium']
    };

    return {
      ...context,
      orders: [...context.orders, order],
      currentOrder: order
    };
  },

  updateOrderStatus: (context: CoffeeShopContext, event: CoffeeShopEvents): CoffeeShopContext => {
    if (!context.currentOrder) return context;

    const updatedOrder = {
      ...context.currentOrder,
      status: 'in-progress' as const
    };

    return {
      ...context,
      currentOrder: updatedOrder,
      orders: context.orders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    };
  },

  completeOrder: (context: CoffeeShopContext, event: CoffeeShopEvents): CoffeeShopContext => {
    if (!context.currentOrder) return context;

    const completedOrder = {
      ...context.currentOrder,
      status: 'completed' as const
    };

    return {
      ...context,
      currentOrder: completedOrder,
      orders: context.orders.map(order => 
        order.id === completedOrder.id ? completedOrder : order
      )
    };
  },

  finalizeOrder: (context: CoffeeShopContext, event: CoffeeShopEvents): CoffeeShopContext => {
    return {
      ...context,
      currentOrder: undefined
    };
  },

  updateRevenue: (context: CoffeeShopContext, event: CoffeeShopEvents): CoffeeShopContext => {
    const completedOrder = context.orders.find(order => order.status === 'completed');
    if (!completedOrder) return context;

    return {
      ...context,
      totalRevenue: context.totalRevenue + completedOrder.price
    };
  },

  recordError: (context: CoffeeShopContext, event: CoffeeShopEvents): CoffeeShopContext => {
    const newErrorCount = context.errorCount + 1;
    
    return {
      ...context,
      errorCount: newErrorCount,
      isOverwhelmed: newErrorCount > 3,
      currentOrder: context.currentOrder ? {
        ...context.currentOrder,
        status: 'error' as const
      } : undefined
    };
  },

  clearError: (context: CoffeeShopContext, event: CoffeeShopEvents): CoffeeShopContext => {
    return {
      ...context,
      errorCount: Math.max(0, context.errorCount - 1),
      isOverwhelmed: false
    };
  },

  resetShop: (context: CoffeeShopContext, event: CoffeeShopEvents): CoffeeShopContext => {
    return {
      orders: [],
      totalRevenue: 0,
      errorCount: 0,
      isOverwhelmed: false
    };
  }
};

// ✅ Selectors for derived state (pure functions)
const selectors = {
  getOrderCount: (context: CoffeeShopContext): number => context.orders.length,
  
  getTotalRevenue: (context: CoffeeShopContext): number => context.totalRevenue,
  
  isShopOverwhelmed: (context: CoffeeShopContext): boolean => context.isOverwhelmed,
  
  getPendingOrders: (context: CoffeeShopContext): Order[] => 
    context.orders.filter(order => order.status === 'pending'),
    
  getCompletedOrders: (context: CoffeeShopContext): Order[] => 
    context.orders.filter(order => order.status === 'completed'),
    
  getCurrentOrder: (context: CoffeeShopContext): Order | undefined => context.currentOrder,
  
  getShopStats: (context: CoffeeShopContext) => ({
    totalOrders: context.orders.length,
    completedOrders: context.orders.filter(o => o.status === 'completed').length,
    revenue: context.totalRevenue,
    errorRate: context.orders.length > 0 ? context.errorCount / context.orders.length : 0
  })
};

// ✅ Event creators (type-safe event creation)
const eventCreators = {
  placeOrder: (customerName: string, beverage: string, size: 'small' | 'medium' | 'large'): CoffeeShopEvents => ({
    type: 'PLACE_ORDER',
    order: { customerName, beverage, size }
  }),

  processOrder: (orderId: string): CoffeeShopEvents => ({
    type: 'PROCESS_ORDER',
    orderId
  }),

  completeOrder: (orderId: string): CoffeeShopEvents => ({
    type: 'COMPLETE_ORDER',
    orderId
  }),

  handleError: (error: string): CoffeeShopEvents => ({
    type: 'HANDLE_ERROR',
    error
  }),

  resetShop: (): CoffeeShopEvents => ({
    type: 'RESET_SHOP'
  })
};

// Educational component to display this proper architecture
class ActorCoffeeShopExample extends HTMLElement {
  private context: CoffeeShopContext;
  private intervalId: number | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.context = {
      orders: [],
      totalRevenue: 0,
      errorCount: 0,
      isOverwhelmed: false
    };
  }

  connectedCallback(): void {
    this.render();
    this.startOrderSimulation();
  }

  disconnectedCallback(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startOrderSimulation(): void {
    const customers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    const beverages = ['Latte', 'Cappuccino', 'Espresso', 'Americano'];
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];

    this.intervalId = window.setInterval(() => {
      // ✅ Predictable operations using event creators
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const beverage = beverages[Math.floor(Math.random() * beverages.length)];
      const size = sizes[Math.floor(Math.random() * sizes.length)];

      const event = eventCreators.placeOrder(customer, beverage, size);
      this.processEvent(event);

      // Simulate processing
      setTimeout(() => {
        this.processEvent(eventCreators.processOrder('current'));
      }, 500);

      this.updateDisplay();
    }, 3000);
  }

  private processEvent(event: CoffeeShopEvents): void {
    // ✅ Pure state transitions - easy to test and debug
    switch (event.type) {
      case 'PLACE_ORDER':
        this.context = actions.addOrder(this.context, event);
        break;
      case 'PROCESS_ORDER':
        this.context = actions.updateOrderStatus(this.context, event);
        // Simulate brewing delay
        setTimeout(() => {
          this.context = actions.completeOrder(this.context, event);
          this.context = actions.finalizeOrder(this.context, event);
          this.context = actions.updateRevenue(this.context, event);
          this.updateDisplay();
        }, 2000);
        break;
    }
  }

  private updateDisplay(): void {
    const statusElement = this.shadowRoot?.querySelector('.actor-status');
    const stats = selectors.getShopStats(this.context);
    
    if (statusElement) {
      statusElement.textContent = 
        `Orders: ${stats.totalOrders}, Completed: ${stats.completedOrders}, Revenue: $${stats.revenue.toFixed(2)}`;
    }
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 2rem;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          border-radius: 12px;
          color: white;
          margin: 1rem 0;
        }
        
        .actor-header {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .actor-description {
          margin-bottom: 1.5rem;
          line-height: 1.6;
          opacity: 0.9;
        }
        
        .actor-status {
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        
        .actor-benefits {
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        
        .actor-benefits h4 {
          margin: 0 0 0.5rem 0;
          color: #fbbf24;
        }
        
        .actor-benefits ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        
        .actor-benefits li {
          margin-bottom: 0.5rem;
        }
      </style>
      
      <div class="actor-header">✅ Actor Coffee Shop (Best Practice)</div>
      
      <div class="actor-description">
        This example demonstrates proper state management using the actor model.
        Notice the predictable behavior, clean error handling, and easy debugging.
      </div>
      
      <div class="actor-status">
        Live Status: Loading...
      </div>
      
      <div class="actor-benefits">
        <h4>Benefits Demonstrated:</h4>
        <ul>
          <li>✅ Isolated state management</li>
          <li>✅ Predictable state transitions</li>
          <li>✅ Event-driven communication</li>
          <li>✅ Proper error handling</li>
          <li>✅ Easy testing & debugging</li>
          <li>✅ Type-safe operations</li>
        </ul>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('actor-coffee-shop-example', ActorCoffeeShopExample);

// Export everything for educational and testing purposes
export {
  coffeeShopMachine,
  actions,
  selectors,
  eventCreators,
  ActorCoffeeShopExample
};

export default ActorCoffeeShopExample; 
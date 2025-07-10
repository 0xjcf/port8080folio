// ✅ REACTIVE: Actor-SPA Framework imports
import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, html, type RawHTML } from '../../framework/core/index.js';

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
  animationState: 'idle' | 'brewing' | 'complete';
}

type CoffeeShopEvent =
  | { type: 'PLACE_ORDER'; order: Partial<Order> }
  | { type: 'PROCESS_ORDER'; orderId?: string }
  | { type: 'COMPLETE_ORDER'; orderId?: string }
  | { type: 'HANDLE_ERROR'; error?: string }
  | { type: 'RESET_SHOP' }
  | { type: 'START_DEMO' }
  | { type: 'BREWING_COMPLETE' };

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

const createOrder = (orderData: Partial<Order>): Order => {
  const prices = { small: 3.5, medium: 4.5, large: 5.5 };
  return {
    id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    customerName: orderData.customerName || 'Anonymous',
    beverage: orderData.beverage || 'Coffee',
    size: orderData.size || 'medium',
    timestamp: Date.now(),
    status: 'pending',
    price: prices[orderData.size || 'medium'],
  };
};

const coffeeShopMachine = setup({
  types: {
    context: {} as CoffeeShopContext,
    events: {} as CoffeeShopEvent,
  },
  actions: {
    addOrder: assign({
      orders: ({ context, event }) => {
        if (event.type !== 'PLACE_ORDER') return context.orders;
        const newOrder = createOrder(event.order);
        return [...context.orders, newOrder];
      },
      currentOrder: ({ context, event }) => {
        if (event.type !== 'PLACE_ORDER') return context.currentOrder;
        return createOrder(event.order);
      },
    }),
    updateOrderStatus: assign({
      currentOrder: ({ context }) => {
        if (!context.currentOrder) return context.currentOrder;
        return { ...context.currentOrder, status: 'in-progress' as const };
      },
      orders: ({ context }) => {
        if (!context.currentOrder) return context.orders;
        const updatedOrder = { ...context.currentOrder, status: 'in-progress' as const };
        return context.orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order));
      },
      animationState: 'brewing',
    }),
    completeOrder: assign({
      currentOrder: ({ context }) => {
        if (!context.currentOrder) return context.currentOrder;
        return { ...context.currentOrder, status: 'completed' as const };
      },
      orders: ({ context }) => {
        if (!context.currentOrder) return context.orders;
        const completedOrder = { ...context.currentOrder, status: 'completed' as const };
        return context.orders.map((order) =>
          order.id === completedOrder.id ? completedOrder : order
        );
      },
      animationState: 'complete',
    }),
    finalizeOrder: assign({
      currentOrder: undefined,
      totalRevenue: ({ context }) => {
        if (!context.currentOrder) return context.totalRevenue;
        return context.totalRevenue + context.currentOrder.price;
      },
      animationState: 'idle',
    }),
    recordError: assign({
      errorCount: ({ context }) => context.errorCount + 1,
      isOverwhelmed: ({ context }) => context.errorCount >= 2,
      currentOrder: ({ context }) => {
        if (!context.currentOrder) return context.currentOrder;
        return { ...context.currentOrder, status: 'error' as const };
      },
    }),
    clearError: assign({
      errorCount: ({ context }) => Math.max(0, context.errorCount - 1),
      isOverwhelmed: false,
    }),
    resetShop: assign({
      orders: [],
      totalRevenue: 0,
      errorCount: 0,
      isOverwhelmed: false,
      currentOrder: undefined,
      animationState: 'idle',
    }),
    startDemo: assign({
      animationState: 'idle',
    }),
  },
  guards: {
    hasCurrentOrder: ({ context }) => context.currentOrder !== undefined,
    isNotOverwhelmed: ({ context }) => !context.isOverwhelmed,
  },
}).createMachine({
  id: 'coffee-shop',
  initial: 'idle',
  context: {
    orders: [],
    totalRevenue: 0,
    errorCount: 0,
    isOverwhelmed: false,
    currentOrder: undefined,
    animationState: 'idle',
  },
  states: {
    idle: {
      on: {
        START_DEMO: { target: 'demo', actions: 'startDemo' },
        PLACE_ORDER: { target: 'processing', actions: 'addOrder' },
        RESET_SHOP: { actions: 'resetShop' },
      },
    },
    demo: {
      entry: assign({
        orders: [],
        totalRevenue: 0,
        errorCount: 0,
        isOverwhelmed: false,
      }),
      after: {
        500: { target: 'processing', actions: 'addOrder' },
      },
      on: {
        PLACE_ORDER: { target: 'processing', actions: 'addOrder' },
      },
    },
    processing: {
      entry: 'updateOrderStatus',
      after: {
        1000: { target: 'brewing', guard: 'hasCurrentOrder' },
      },
      on: {
        HANDLE_ERROR: { target: 'error', actions: 'recordError' },
        PLACE_ORDER: { target: 'processing', actions: 'addOrder' },
      },
    },
    brewing: {
      after: {
        2000: { target: 'ready', actions: 'completeOrder' },
      },
      on: {
        HANDLE_ERROR: { target: 'error', actions: 'recordError' },
        BREWING_COMPLETE: { target: 'ready', actions: 'completeOrder' },
      },
    },
    ready: {
      after: {
        500: { target: 'idle', actions: 'finalizeOrder' },
      },
      on: {
        COMPLETE_ORDER: { target: 'idle', actions: 'finalizeOrder' },
      },
    },
    error: {
      on: {
        PLACE_ORDER: { target: 'processing', actions: ['addOrder', 'clearError'] },
        RESET_SHOP: { target: 'idle', actions: 'resetShop' },
      },
    },
  },
});

// ✅ REACTIVE: Selectors for derived state (pure functions)
const getShopStats = (context: CoffeeShopContext) => ({
  totalOrders: context.orders.length,
  completedOrders: context.orders.filter((o) => o.status === 'completed').length,
  revenue: context.totalRevenue,
  errorRate: context.orders.length > 0 ? context.errorCount / context.orders.length : 0,
  pendingOrders: context.orders.filter((o) => o.status === 'pending').length,
  processingOrders: context.orders.filter((o) => o.status === 'in-progress').length,
});

// ✅ REACTIVE: Template for order status display
const renderOrderStatus = (context: CoffeeShopContext): RawHTML => {
  const stats = getShopStats(context);
  const statusText = context.currentOrder
    ? `Processing: ${context.currentOrder.customerName}'s ${context.currentOrder.beverage}`
    : 'Ready for orders';

  return html`
    <div class="actor-status ${context.animationState}">
      <div class="status-line">Status: ${statusText}</div>
      <div class="stats-line">
        Orders: ${stats.totalOrders} | Completed: ${stats.completedOrders} | Revenue: $${stats.revenue.toFixed(2)}
      </div>
      <div class="progress-line">
        Pending: ${stats.pendingOrders} | Processing: ${stats.processingOrders}
      </div>
    </div>
  `;
};

// ✅ REACTIVE: Template for interactive controls
const renderControls = (state: SnapshotFrom<typeof coffeeShopMachine>): RawHTML => {
  const isIdle = state.matches('idle');
  const isProcessing = state.matches('processing') || state.matches('brewing');

  return html`
    <div class="actor-controls">
      <button send="START_DEMO" class="control-button demo-button" ?disabled=${!isIdle}>
        Start Demo
      </button>
      <button send="PLACE_ORDER" order=${{ customerName: 'Alice', beverage: 'Latte', size: 'medium' }} class="control-button order-button">
        Place Order
      </button>
      <button send="HANDLE_ERROR" error="Equipment malfunction" class="control-button error-button" ?disabled=${!isProcessing}>
        Simulate Error
      </button>
      <button send="RESET_SHOP" class="control-button reset-button">
        Reset Shop
      </button>
    </div>
  `;
};

// ✅ REACTIVE: Template for benefits display
const renderBenefits = (): RawHTML => html`
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

// ✅ REACTIVE: Main template function
const coffeeShopTemplate = (state: SnapshotFrom<typeof coffeeShopMachine>): RawHTML => {
  const { context } = state;

  return html`
    <div class="actor-header">✅ Actor Coffee Shop (Best Practice)</div>
    
    <div class="actor-description">
      This example demonstrates proper state management using the actor model.
      Notice the predictable behavior, clean error handling, and easy debugging.
      Current state: <strong>${state.value}</strong>
    </div>
    
    ${renderOrderStatus(context)}
    ${renderControls(state)}
    ${renderBenefits()}
  `;
};

// ✅ REACTIVE: Component styles
const coffeeShopStyles = `
  :host {
    display: block;
    padding: 2rem;
    background: linear-gradient(135deg, #4ade80, #22c55e);
    border-radius: 12px;
    color: white;
    margin: 1rem 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    text-align: center;
  }
  
  .actor-status {
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    border-radius: 8px;
    font-family: monospace;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
  }
  
  .actor-status.brewing {
    background: rgba(255, 165, 0, 0.3);
    border: 2px solid #ffa500;
    animation: brewing-pulse 2s infinite;
  }
  
  .actor-status.complete {
    background: rgba(0, 255, 0, 0.3);
    border: 2px solid #00ff00;
  }
  
  @keyframes brewing-pulse {
    0%, 100% { opacity: 0.7; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.02); }
  }
  
  .status-line {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .stats-line, .progress-line {
    opacity: 0.8;
    margin-bottom: 0.25rem;
  }
  
  .actor-controls {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .control-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 100px;
  }
  
  .demo-button {
    background: #3b82f6;
    color: white;
  }
  
  .order-button {
    background: #10b981;
    color: white;
  }
  
  .error-button {
    background: #ef4444;
    color: white;
  }
  
  .reset-button {
    background: #6b7280;
    color: white;
  }
  
  .control-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  
  @media (max-width: 768px) {
    :host {
      padding: 1rem;
    }
    
    .actor-controls {
      flex-direction: column;
      align-items: stretch;
    }
    
    .control-button {
      min-width: auto;
    }
  }
`;

// ✅ REACTIVE: Create component using Actor-SPA framework
const ActorCoffeeShopComponent = createComponent({
  machine: coffeeShopMachine,
  template: coffeeShopTemplate,
  styles: coffeeShopStyles,
  tagName: 'actor-coffee-shop-example',
});

// ✅ REACTIVE: Export helper functions for educational purposes
export { getShopStats };

export const createOrderHelper = (
  customerName: string,
  beverage: string,
  size: 'small' | 'medium' | 'large'
) => ({ customerName, beverage, size });

// ✅ REACTIVE: Export the component and types
export default ActorCoffeeShopComponent;
export type { CoffeeShopContext, CoffeeShopEvent, Order };

// TypeScript interfaces for Chaos Coffee Shop Example
interface Order {
  id: string;
  customerName: string;
  beverage: string;
  size: 'small' | 'medium' | 'large';
  timestamp: number;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

interface CoffeeShopState {
  orders: Order[];
  totalRevenue: number;
  errorCount: number;
  isOverwhelmed: boolean;
}

interface GlobalState {
  [key: string]: any;
  coffeeShop?: CoffeeShopState;
  networkConnected?: boolean;
  currentUser?: any;
}

/**
 * Chaos Coffee Shop - Anti-pattern Example
 * 
 * This code demonstrates common problems in frontend applications:
 * - Global state mutations
 * - Callback hell
 * - No error handling
 * - Race conditions
 * - Unpredictable state updates
 * 
 * Used for educational purposes to contrast with proper state management.
 */

// ❌ Global state - anyone can modify this
let globalState: GlobalState = {
  coffeeShop: {
    orders: [],
    totalRevenue: 0,
    errorCount: 0,
    isOverwhelmed: false
  },
  networkConnected: true,
  currentUser: null
};

// ❌ Multiple functions can modify global state simultaneously
function addOrder(customerName: string, beverage: string, size: 'small' | 'medium' | 'large'): void {
  const order: Order = {
    id: Math.random().toString(36).substr(2, 9),
    customerName,
    beverage,
    size,
    timestamp: Date.now(),
    status: 'pending'
  };

  // ❌ Direct global state mutation
  globalState.coffeeShop!.orders.push(order);
  
  // ❌ Callback hell starts here
  processOrder(order.id, () => {
    updateOrderStatus(order.id, 'in-progress', () => {
      setTimeout(() => {
        // ❌ Random failures to simulate chaos
        if (Math.random() < 0.3) {
          handleOrderError(order.id, () => {
            // ❌ More nested callbacks
            retryOrder(order.id, () => {
              console.log('Order eventually completed');
            });
          });
        } else {
          completeOrder(order.id, () => {
            updateRevenue(order, () => {
              console.log('Order completed successfully');
            });
          });
        }
      }, Math.random() * 2000);
    });
  });
}

// ❌ Callback-based functions with no error handling
function processOrder(orderId: string, callback: () => void): void {
  setTimeout(() => {
    const order = globalState.coffeeShop!.orders.find(o => o.id === orderId);
    if (order) {
      // ❌ Direct mutation again
      order.status = 'in-progress';
      callback();
    }
  }, 100);
}

function updateOrderStatus(orderId: string, status: Order['status'], callback: () => void): void {
  const order = globalState.coffeeShop!.orders.find(o => o.id === orderId);
  if (order) {
    // ❌ No validation or error checking
    order.status = status;
    callback();
  }
}

function handleOrderError(orderId: string, callback: () => void): void {
  // ❌ Global state mutation from error handler
  globalState.coffeeShop!.errorCount++;
  globalState.coffeeShop!.isOverwhelmed = globalState.coffeeShop!.errorCount > 5;
  
  const order = globalState.coffeeShop!.orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'error';
    callback();
  }
}

function retryOrder(orderId: string, callback: () => void): void {
  setTimeout(() => {
    // ❌ Race condition - multiple retries could happen
    const order = globalState.coffeeShop!.orders.find(o => o.id === orderId);
    if (order && order.status === 'error') {
      order.status = 'in-progress';
      
      // ❌ Recursive callback without exit condition
      setTimeout(() => {
        if (Math.random() < 0.7) {
          order.status = 'completed';
          callback();
        } else {
          retryOrder(orderId, callback); // ❌ Infinite recursion possible
        }
      }, 1000);
    }
  }, 500);
}

function completeOrder(orderId: string, callback: () => void): void {
  const order = globalState.coffeeShop!.orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'completed';
    callback();
  }
}

function updateRevenue(order: Order, callback: () => void): void {
  const prices = { small: 3.50, medium: 4.50, large: 5.50 };
  const price = prices[order.size];
  
  // ❌ Another global state mutation
  globalState.coffeeShop!.totalRevenue += price;
  callback();
}

// ❌ Functions that depend on global state in unpredictable ways
function getOrderCount(): number {
  return globalState.coffeeShop?.orders.length || 0;
}

function getTotalRevenue(): number {
  return globalState.coffeeShop?.totalRevenue || 0;
}

function isShopOverwhelmed(): boolean {
  return globalState.coffeeShop?.isOverwhelmed || false;
}

// ❌ Event handlers that directly modify global state
function handleNetworkChange(connected: boolean): void {
  globalState.networkConnected = connected;
  
  if (!connected) {
    // ❌ Side effects in event handlers
    globalState.coffeeShop!.orders.forEach(order => {
      if (order.status === 'pending') {
        order.status = 'error';
      }
    });
  }
}

// ❌ Functions with hidden side effects
function displayOrders(): string {
  // ❌ UI function that modifies state
  globalState.coffeeShop!.orders = globalState.coffeeShop!.orders.filter(
    order => order.status !== 'error'
  );
  
  return globalState.coffeeShop!.orders
    .map(order => `${order.customerName}: ${order.beverage} (${order.status})`)
    .join('\n');
}

// ❌ Race condition simulator
function simulateConcurrentOrders(): void {
  // Multiple orders being placed simultaneously
  addOrder('Alice', 'Latte', 'large');
  addOrder('Bob', 'Espresso', 'small');
  addOrder('Charlie', 'Cappuccino', 'medium');
  
  // ❌ Global state accessed by multiple operations
  setTimeout(() => {
    globalState.coffeeShop!.isOverwhelmed = true;
  }, 50);
  
  setTimeout(() => {
    globalState.coffeeShop!.orders = [];
  }, 100);
}

// ❌ Debugging nightmare - state can be modified anywhere
function debugCurrentState(): void {
  console.log('Current Global State:', JSON.stringify(globalState, null, 2));
  console.log('This state could be modified by any function at any time!');
  
  // ❌ Even debug functions modify state
  globalState.lastDebugTime = Date.now();
}

// Educational component to display this chaos
class ChaosCoffeeShopExample extends HTMLElement {
  private intervalId: number | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this.startChaosSimulation();
  }

  disconnectedCallback(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startChaosSimulation(): void {
    // Start the chaos!
    this.intervalId = window.setInterval(() => {
      // Random operations that modify global state
      const operations = [
        () => addOrder(`Customer${Math.floor(Math.random() * 100)}`, 'Coffee', 'medium'),
        () => handleNetworkChange(Math.random() > 0.5),
        () => simulateConcurrentOrders(),
        () => debugCurrentState()
      ];
      
      const randomOperation = operations[Math.floor(Math.random() * operations.length)];
      randomOperation();
      
      // Update display with current chaos
      this.updateDisplay();
    }, 2000);
  }

  private updateDisplay(): void {
    const statusElement = this.shadowRoot?.querySelector('.chaos-status');
    if (statusElement) {
      statusElement.textContent = `Orders: ${getOrderCount()}, Revenue: $${getTotalRevenue().toFixed(2)}, Overwhelmed: ${isShopOverwhelmed()}`;
    }
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 2rem;
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          border-radius: 12px;
          color: white;
          margin: 1rem 0;
        }
        
        .chaos-header {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .chaos-description {
          margin-bottom: 1.5rem;
          line-height: 1.6;
          opacity: 0.9;
        }
        
        .chaos-status {
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        
        .chaos-problems {
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        
        .chaos-problems h4 {
          margin: 0 0 0.5rem 0;
          color: #ffff00;
        }
        
        .chaos-problems ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        
        .chaos-problems li {
          margin-bottom: 0.5rem;
        }
      </style>
      
      <div class="chaos-header">⚠️ Chaos Coffee Shop (Anti-Pattern)</div>
      
      <div class="chaos-description">
        This example demonstrates what happens when you don't use proper state management.
        Watch the unpredictable behavior caused by global state mutations, callback hell, and race conditions.
      </div>
      
      <div class="chaos-status">
        Live Status: Loading chaos...
      </div>
      
      <div class="chaos-problems">
        <h4>Problems Demonstrated:</h4>
        <ul>
          <li>❌ Global state mutations</li>
          <li>❌ Callback hell</li>
          <li>❌ Race conditions</li>
          <li>❌ No error handling</li>
          <li>❌ Unpredictable side effects</li>
          <li>❌ Debugging nightmares</li>
        </ul>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('chaos-coffee-shop-example', ChaosCoffeeShopExample);

// Export the chaos functions for educational purposes
export {
  addOrder,
  getOrderCount,
  getTotalRevenue,
  isShopOverwhelmed,
  simulateConcurrentOrders,
  debugCurrentState,
  globalState,
  ChaosCoffeeShopExample
};

export default ChaosCoffeeShopExample; 
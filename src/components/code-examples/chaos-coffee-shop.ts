// ChaosCoffeeShopExample refactored to use Actor-SPA Framework API
import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, html, type RawHTML } from '../../framework/core/index.js';

// ✅ Type-safe interfaces following framework patterns
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

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'barista' | 'manager';
}

// ✅ State machine context interface
interface ChaosCoffeeShopContext {
  coffeeShop: CoffeeShopState;
  networkConnected: boolean;
  currentUser: User | null;
  isSimulationRunning: boolean;
  lastDebugTime: number | null;
  chaosLevel: 'low' | 'medium' | 'high';
  demonstratedProblems: string[];
}

// ✅ Event types for type safety
type ChaosCoffeeShopEvent =
  | { type: 'START_SIMULATION' }
  | { type: 'STOP_SIMULATION' }
  | { type: 'RESET_CHAOS' }
  | {
      type: 'ADD_ORDER';
      customerName: string;
      beverage: string;
      size: 'small' | 'medium' | 'large';
    }
  | { type: 'NETWORK_CHANGE'; connected: boolean }
  | { type: 'SIMULATE_CONCURRENT_ORDERS' }
  | { type: 'DEBUG_STATE' }
  | { type: 'CHAOS_TICK' }
  | { type: 'INCREASE_CHAOS_LEVEL' }
  | { type: 'PROCESS_ORDER'; orderId: string }
  | { type: 'UPDATE_ORDER_STATUS'; orderId: string; status: Order['status'] }
  | { type: 'HANDLE_ORDER_ERROR'; orderId: string }
  | { type: 'RETRY_ORDER'; orderId: string }
  | { type: 'COMPLETE_ORDER'; orderId: string }
  | { type: 'UPDATE_REVENUE'; orderId: string };

// ✅ Helper functions for chaos simulation (educational anti-patterns)
const generateRandomOrder = (): {
  customerName: string;
  beverage: string;
  size: 'small' | 'medium' | 'large';
} => {
  const customers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
  const beverages = ['Latte', 'Espresso', 'Cappuccino', 'Americano', 'Macchiato'];
  const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];

  return {
    customerName: customers[Math.floor(Math.random() * customers.length)],
    beverage: beverages[Math.floor(Math.random() * beverages.length)],
    size: sizes[Math.floor(Math.random() * sizes.length)],
  };
};

const calculatePrice = (size: 'small' | 'medium' | 'large'): number => {
  const prices = { small: 3.5, medium: 4.5, large: 5.5 };
  return prices[size];
};

// ✅ XState machine for component state management
const chaosCoffeeShopMachine = setup({
  types: {
    context: {} as ChaosCoffeeShopContext,
    events: {} as ChaosCoffeeShopEvent,
  },
  actions: {
    startSimulation: assign({
      isSimulationRunning: true,
      demonstratedProblems: ({ context }) => [
        ...context.demonstratedProblems,
        'Simulation started - random state changes will occur',
      ],
    }),
    stopSimulation: assign({
      isSimulationRunning: false,
      demonstratedProblems: ({ context }) => [
        ...context.demonstratedProblems,
        'Simulation stopped - chaos contained',
      ],
    }),
    resetChaos: assign({
      coffeeShop: {
        orders: [],
        totalRevenue: 0,
        errorCount: 0,
        isOverwhelmed: false,
      },
      networkConnected: true,
      currentUser: null,
      isSimulationRunning: false,
      lastDebugTime: null,
      chaosLevel: 'low',
      demonstratedProblems: [],
    }),
    addOrder: assign({
      coffeeShop: ({ context, event }) => {
        if (event.type === 'ADD_ORDER') {
          const order: Order = {
            id: Math.random().toString(36).substr(2, 9),
            customerName: event.customerName,
            beverage: event.beverage,
            size: event.size,
            timestamp: Date.now(),
            status: 'pending',
          };

          return {
            ...context.coffeeShop,
            orders: [...context.coffeeShop.orders, order],
          };
        }
        return context.coffeeShop;
      },
      demonstratedProblems: ({ context, event }) => {
        if (event.type === 'ADD_ORDER') {
          return [
            ...context.demonstratedProblems,
            `❌ Global state mutation: Added order for ${event.customerName}`,
          ];
        }
        return context.demonstratedProblems;
      },
    }),
    networkChange: assign({
      networkConnected: ({ event }) => (event.type === 'NETWORK_CHANGE' ? event.connected : true),
      coffeeShop: ({ context, event }) => {
        if (event.type === 'NETWORK_CHANGE' && !event.connected) {
          // Simulate network failure affecting orders
          const updatedOrders = context.coffeeShop.orders.map((order) =>
            order.status === 'pending' ? { ...order, status: 'error' as const } : order
          );
          return {
            ...context.coffeeShop,
            orders: updatedOrders,
            errorCount: context.coffeeShop.errorCount + 1,
          };
        }
        return context.coffeeShop;
      },
      demonstratedProblems: ({ context, event }) => {
        if (event.type === 'NETWORK_CHANGE') {
          return [
            ...context.demonstratedProblems,
            `❌ Side effect: Network ${event.connected ? 'connected' : 'disconnected'} - orders affected`,
          ];
        }
        return context.demonstratedProblems;
      },
    }),
    simulateConcurrentOrders: assign({
      coffeeShop: ({ context }) => {
        const orders = [generateRandomOrder(), generateRandomOrder(), generateRandomOrder()];

        const newOrders = orders.map((orderData) => ({
          id: Math.random().toString(36).substr(2, 9),
          customerName: orderData.customerName,
          beverage: orderData.beverage,
          size: orderData.size,
          timestamp: Date.now(),
          status: 'pending' as const,
        }));

        return {
          ...context.coffeeShop,
          orders: [...context.coffeeShop.orders, ...newOrders],
          isOverwhelmed: true,
        };
      },
      demonstratedProblems: ({ context }) => [
        ...context.demonstratedProblems,
        '❌ Race condition: Multiple concurrent orders added simultaneously',
      ],
    }),
    debugState: assign({
      lastDebugTime: Date.now(),
      demonstratedProblems: ({ context }) => [
        ...context.demonstratedProblems,
        '❌ Debug function with side effects: Modified lastDebugTime',
      ],
    }),
    chaosTick: assign({
      chaosLevel: ({ context }) => {
        const levels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
        const currentIndex = levels.indexOf(context.chaosLevel);
        return levels[(currentIndex + 1) % levels.length];
      },
      demonstratedProblems: ({ context }) => [
        ...context.demonstratedProblems,
        '❌ Unpredictable state change: Chaos level increased randomly',
      ],
    }),
    updateOrderStatus: assign({
      coffeeShop: ({ context, event }) => {
        if (event.type === 'UPDATE_ORDER_STATUS') {
          const updatedOrders = context.coffeeShop.orders.map((order) =>
            order.id === event.orderId ? { ...order, status: event.status } : order
          );
          return {
            ...context.coffeeShop,
            orders: updatedOrders,
          };
        }
        return context.coffeeShop;
      },
    }),
    handleOrderError: assign({
      coffeeShop: ({ context, event }) => {
        if (event.type === 'HANDLE_ORDER_ERROR') {
          const updatedOrders = context.coffeeShop.orders.map((order) =>
            order.id === event.orderId ? { ...order, status: 'error' as const } : order
          );
          return {
            ...context.coffeeShop,
            orders: updatedOrders,
            errorCount: context.coffeeShop.errorCount + 1,
            isOverwhelmed: context.coffeeShop.errorCount + 1 > 5,
          };
        }
        return context.coffeeShop;
      },
      demonstratedProblems: ({ context }) => [
        ...context.demonstratedProblems,
        '❌ Error handling without proper recovery: Error count increased',
      ],
    }),
    completeOrder: assign({
      coffeeShop: ({ context, event }) => {
        if (event.type === 'COMPLETE_ORDER') {
          const order = context.coffeeShop.orders.find((o) => o.id === event.orderId);
          if (order) {
            const updatedOrders = context.coffeeShop.orders.map((o) =>
              o.id === event.orderId ? { ...o, status: 'completed' as const } : o
            );
            const revenue = calculatePrice(order.size);
            return {
              ...context.coffeeShop,
              orders: updatedOrders,
              totalRevenue: context.coffeeShop.totalRevenue + revenue,
            };
          }
        }
        return context.coffeeShop;
      },
    }),
    increaseChaosLevel: assign({
      chaosLevel: ({ context }) => {
        const levels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
        const currentIndex = levels.indexOf(context.chaosLevel);
        return levels[Math.min(currentIndex + 1, levels.length - 1)];
      },
    }),
  },
}).createMachine({
  id: 'chaosCoffeeShop',
  initial: 'idle',
  context: {
    coffeeShop: {
      orders: [],
      totalRevenue: 0,
      errorCount: 0,
      isOverwhelmed: false,
    },
    networkConnected: true,
    currentUser: null,
    isSimulationRunning: false,
    lastDebugTime: null,
    chaosLevel: 'low',
    demonstratedProblems: [],
  },
  states: {
    idle: {
      on: {
        START_SIMULATION: { target: 'simulating', actions: 'startSimulation' },
        RESET_CHAOS: { actions: 'resetChaos' },
        ADD_ORDER: { actions: 'addOrder' },
        NETWORK_CHANGE: { actions: 'networkChange' },
        SIMULATE_CONCURRENT_ORDERS: { actions: 'simulateConcurrentOrders' },
        DEBUG_STATE: { actions: 'debugState' },
      },
    },
    simulating: {
      on: {
        STOP_SIMULATION: { target: 'idle', actions: 'stopSimulation' },
        CHAOS_TICK: { actions: 'chaosTick' },
        ADD_ORDER: { actions: 'addOrder' },
        NETWORK_CHANGE: { actions: 'networkChange' },
        SIMULATE_CONCURRENT_ORDERS: { actions: 'simulateConcurrentOrders' },
        DEBUG_STATE: { actions: 'debugState' },
        UPDATE_ORDER_STATUS: { actions: 'updateOrderStatus' },
        HANDLE_ORDER_ERROR: { actions: 'handleOrderError' },
        COMPLETE_ORDER: { actions: 'completeOrder' },
        INCREASE_CHAOS_LEVEL: { actions: 'increaseChaosLevel' },
      },
    },
  },
});

// ✅ Helper templates to fix nesting violations
const renderControlButton = (
  send: string,
  className: string,
  icon: string,
  text: string,
  attributes?: Record<string, string>
): RawHTML => {
  const attrs = attributes
    ? Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ')
    : '';

  return html`
    <button send="${send}" class="btn-chaos ${className}" ${attrs}>
      ${icon} ${text}
    </button>
  `;
};

const renderOrderItem = (order: Order): RawHTML => html`
  <div class="order-item ${order.status}">
    <strong>${order.customerName}</strong>: ${order.beverage} (${order.size}) - 
    <span class="status-${order.status}">${order.status}</span>
  </div>
`;

const renderProblemItem = (problem: string): RawHTML => html`
  <div class="problem-item">${problem}</div>
`;

const renderStatusGrid = (
  coffeeShop: CoffeeShopState,
  networkConnected: boolean,
  isSimulationRunning: boolean
): RawHTML => html`
  <div class="status-grid">
    <div class="status-item">
      <strong>Orders:</strong> ${coffeeShop.orders.length}
    </div>
    <div class="status-item">
      <strong>Revenue:</strong> $${coffeeShop.totalRevenue.toFixed(2)}
    </div>
    <div class="status-item">
      <strong>Errors:</strong> ${coffeeShop.errorCount}
    </div>
    <div class="status-item">
      <strong>Overwhelmed:</strong> ${coffeeShop.isOverwhelmed ? 'YES' : 'NO'}
    </div>
    <div class="status-item">
      <strong>Network:</strong> ${networkConnected ? 'Connected' : 'Disconnected'}
    </div>
    <div class="status-item">
      <strong>Simulation:</strong> ${isSimulationRunning ? 'Running' : 'Stopped'}
    </div>
  </div>
`;

const renderAntiPatternList = (): RawHTML => html`
  <ul>
    <li>❌ Global state mutations</li>
    <li>❌ Callback hell</li>
    <li>❌ Race conditions</li>
    <li>❌ No error handling</li>
    <li>❌ Unpredictable side effects</li>
    <li>❌ Debugging nightmares</li>
    <li>❌ Functions with hidden side effects</li>
    <li>❌ Shared mutable state</li>
  </ul>
`;

const renderSolutionList = (): RawHTML => html`
  <ul>
    <li>✅ Immutable state updates via XState</li>
    <li>✅ Predictable state machines</li>
    <li>✅ Proper error handling</li>
    <li>✅ No global state</li>
    <li>✅ Declarative event handling</li>
    <li>✅ Type-safe state management</li>
    <li>✅ Isolated component state</li>
  </ul>
`;

const renderHeader = (): RawHTML => html`
  <div class="chaos-header">⚠️ Chaos Coffee Shop (Anti-Pattern)</div>
  
  <div class="chaos-description">
    This example demonstrates what happens when you don't use proper state management.
    Watch the unpredictable behavior caused by global state mutations, callback hell, and race conditions.
  </div>
`;

const renderControls = (isSimulationRunning: boolean, networkConnected: boolean): RawHTML => html`
  <div class="chaos-controls">
    ${
      !isSimulationRunning
        ? renderControlButton('START_SIMULATION', 'start', '🚀', 'Start Chaos Simulation')
        : renderControlButton('STOP_SIMULATION', 'stop', '⏹️', 'Stop Simulation')
    }
    
    ${renderControlButton('RESET_CHAOS', 'reset', '🔄', 'Reset Everything')}
    
    ${renderControlButton('ADD_ORDER', 'add', '➕', 'Add Random Order', {
      'customer-name': 'Walk-in Customer',
      beverage: 'Coffee',
      size: 'medium',
    })}
    
    ${renderControlButton('SIMULATE_CONCURRENT_ORDERS', 'concurrent', '⚡', 'Simulate Race Conditions')}
    
    ${renderControlButton(
      'NETWORK_CHANGE',
      'network',
      networkConnected ? '📡' : '🔗',
      networkConnected ? 'Disconnect Network' : 'Connect Network',
      { connected: String(!networkConnected) }
    )}
  </div>
`;

const renderLiveStatus = (
  chaosLevel: string,
  coffeeShop: CoffeeShopState,
  networkConnected: boolean,
  isSimulationRunning: boolean
): RawHTML => html`
  <div class="chaos-status">
    <h4>🔥 Live Chaos Status (Chaos Level: ${chaosLevel})</h4>
    ${renderStatusGrid(coffeeShop, networkConnected, isSimulationRunning)}
  </div>
`;

const renderCurrentOrders = (orders: Order[]): RawHTML => {
  if (orders.length === 0) return html``;

  return html`
    <div class="current-orders">
      <h4>📋 Current Orders</h4>
      <div class="orders-list">
        ${orders.map(renderOrderItem)}
      </div>
    </div>
  `;
};

const renderDemonstratedProblems = (problems: string[]): RawHTML => {
  if (problems.length === 0) return html``;

  return html`
    <div class="demonstrated-problems">
      <h4>🚨 Problems Demonstrated in Real-Time</h4>
      <div class="problems-list">
        ${problems.slice(-10).map(renderProblemItem)}
      </div>
    </div>
  `;
};

const renderEducationalContent = (): RawHTML => html`
  <div class="chaos-problems">
    <h4>❌ Anti-Patterns This Demo Shows:</h4>
    ${renderAntiPatternList()}
  </div>
  
  <div class="solution-contrast">
    <h4>✅ How Actor-SPA Framework Solves This:</h4>
    ${renderSolutionList()}
  </div>
`;

// ✅ Pure template function using framework patterns
const chaosCoffeeShopTemplate = (state: SnapshotFrom<typeof chaosCoffeeShopMachine>): RawHTML => {
  const { coffeeShop, networkConnected, isSimulationRunning, chaosLevel, demonstratedProblems } =
    state.context;

  return html`
    <div class="chaos-container">
      ${renderHeader()}
      ${renderControls(isSimulationRunning, networkConnected)}
      ${renderLiveStatus(chaosLevel, coffeeShop, networkConnected, isSimulationRunning)}
      ${renderCurrentOrders(coffeeShop.orders)}
      ${renderDemonstratedProblems(demonstratedProblems)}
      ${renderEducationalContent()}
    </div>
  `;
};

// ✅ Component styles using framework patterns
const chaosCoffeeShopStyles = `
  :host {
    display: block;
    padding: 2rem;
    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
    border-radius: 12px;
    color: white;
    margin: 1rem 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .chaos-container {
    max-width: 100%;
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
  
  .chaos-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .btn-chaos {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s;
  }
  
  .btn-chaos.start {
    background: #28a745;
    color: white;
  }
  
  .btn-chaos.stop {
    background: #dc3545;
    color: white;
  }
  
  .btn-chaos.reset {
    background: #6c757d;
    color: white;
  }
  
  .btn-chaos.add {
    background: #007bff;
    color: white;
  }
  
  .btn-chaos.concurrent {
    background: #ffc107;
    color: #212529;
  }
  
  .btn-chaos.network {
    background: #17a2b8;
    color: white;
  }
  
  .btn-chaos:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
  
  .chaos-status {
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }
  
  .chaos-status h4 {
    margin: 0 0 1rem 0;
    color: #ffff00;
  }
  
  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.5rem;
  }
  
  .status-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.5rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9rem;
  }
  
  .current-orders {
    background: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }
  
  .current-orders h4 {
    margin: 0 0 1rem 0;
    color: #ffff00;
  }
  
  .orders-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .order-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .order-item.error {
    border-left: 4px solid #dc3545;
  }
  
  .order-item.completed {
    border-left: 4px solid #28a745;
  }
  
  .order-item.in-progress {
    border-left: 4px solid #ffc107;
  }
  
  .order-item.pending {
    border-left: 4px solid #6c757d;
  }
  
  .status-error {
    color: #ff6b6b;
  }
  
  .status-completed {
    color: #28a745;
  }
  
  .status-in-progress {
    color: #ffc107;
  }
  
  .status-pending {
    color: #6c757d;
  }
  
  .demonstrated-problems {
    background: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }
  
  .demonstrated-problems h4 {
    margin: 0 0 1rem 0;
    color: #ff6b6b;
  }
  
  .problems-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .problem-item {
    background: rgba(255, 107, 107, 0.2);
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    border-left: 3px solid #ff6b6b;
  }
  
  .chaos-problems {
    background: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
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
  
  .solution-contrast {
    background: rgba(40, 167, 69, 0.2);
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #28a745;
  }
  
  .solution-contrast h4 {
    margin: 0 0 0.5rem 0;
    color: #28a745;
  }
  
  .solution-contrast ul {
    margin: 0;
    padding-left: 1.5rem;
  }
  
  .solution-contrast li {
    margin-bottom: 0.5rem;
    color: #e8f5e8;
  }
  
  @media (max-width: 768px) {
    :host {
      padding: 1rem;
    }
    
    .chaos-controls {
      flex-direction: column;
    }
    
    .btn-chaos {
      width: 100%;
    }
    
    .status-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// ✅ Create the component using the Actor-SPA framework
const ChaosCoffeeShopExampleComponent = createComponent({
  machine: chaosCoffeeShopMachine,
  template: chaosCoffeeShopTemplate,
  styles: chaosCoffeeShopStyles,
  tagName: 'chaos-coffee-shop-example',
});

// ✅ Public API for external interactions (maintained for backward compatibility)
export const getOrderCount = (context: ChaosCoffeeShopContext): number => {
  return context.coffeeShop.orders.length;
};

export const getTotalRevenue = (context: ChaosCoffeeShopContext): number => {
  return context.coffeeShop.totalRevenue;
};

export const isShopOverwhelmed = (context: ChaosCoffeeShopContext): boolean => {
  return context.coffeeShop.isOverwhelmed;
};

// Export for manual registration if needed
export { ChaosCoffeeShopExampleComponent };
export default ChaosCoffeeShopExampleComponent;
export type { Order, CoffeeShopState, User, ChaosCoffeeShopContext, ChaosCoffeeShopEvent };

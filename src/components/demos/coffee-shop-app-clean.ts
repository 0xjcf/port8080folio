// Coffee Shop App refactored to use Actor-SPA Framework API
import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, css, html, type RawHTML } from '../../framework/core/index.js';

// ✅ Type-safe interfaces following framework patterns
interface CoffeeOrder {
  id: string;
  customerName: string;
  drinkType: 'espresso' | 'latte' | 'cappuccino' | 'americano' | 'macchiato';
  size: 'small' | 'medium' | 'large';
  status: 'ordered' | 'preparing' | 'ready' | 'delivered';
  timestamp: number;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  order?: CoffeeOrder;
  state: 'idle' | 'ordering' | 'waiting' | 'receiving' | 'leaving';
  patience: number;
  satisfaction: number;
}

interface CoffeeShopContext {
  customers: Customer[];
  orders: CoffeeOrder[];
  revenue: number;
  servedOrders: number;
  totalOrders: number;
  simulationSpeed: number;
  maxCustomers: number;
}

type CoffeeShopEvents =
  | { type: 'START_SIMULATION' }
  | { type: 'STOP_SIMULATION' }
  | { type: 'RESET_SHOP' }
  | { type: 'SIMULATION_TICK' }
  | { type: 'GENERATE_CUSTOMER' }
  | { type: 'CUSTOMER_ARRIVES'; customer: Customer }
  | {
      type: 'PLACE_ORDER';
      customerId: string;
      order: Omit<CoffeeOrder, 'id' | 'timestamp' | 'status'>;
    }
  | { type: 'ORDER_READY'; orderId: string }
  | { type: 'ORDER_DELIVERED'; orderId: string }
  | { type: 'CUSTOMER_LEAVES'; customerId: string };

// ✅ Helper functions (pure functions)
function generateCustomer(): Customer {
  const names = [
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Edward',
    'Fiona',
    'George',
    'Hannah',
    'Ian',
    'Julia',
    'Kevin',
    'Luna',
  ];

  return {
    id: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: names[Math.floor(Math.random() * names.length)],
    state: 'idle',
    patience: 80 + Math.random() * 40, // 80-120 patience
    satisfaction: 50 + Math.random() * 30, // 50-80 initial satisfaction
  };
}

function generateOrder(customer: Customer): CoffeeOrder {
  const drinkTypes: CoffeeOrder['drinkType'][] = [
    'espresso',
    'latte',
    'cappuccino',
    'americano',
    'macchiato',
  ];
  const sizes: CoffeeOrder['size'][] = ['small', 'medium', 'large'];
  const prices = { small: 3.5, medium: 4.5, large: 5.5 };

  const drinkType = drinkTypes[Math.floor(Math.random() * drinkTypes.length)];
  const size = sizes[Math.floor(Math.random() * sizes.length)];

  return {
    id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerName: customer.name,
    drinkType,
    size,
    status: 'ordered',
    timestamp: Date.now(),
    price: prices[size] + Math.random() * 1.0, // Add some variation
  };
}

// ✅ XState machine for coffee shop state management
const coffeeShopMachine = setup({
  types: {
    context: {} as CoffeeShopContext,
    events: {} as CoffeeShopEvents,
  },
  actions: {
    resetShop: assign({
      customers: [],
      orders: [],
      revenue: 0,
      servedOrders: 0,
      totalOrders: 0,
    }),
    generateCustomer: assign({
      customers: ({ context }) => {
        if (context.customers.length < context.maxCustomers) {
          return [...context.customers, generateCustomer()];
        }
        return context.customers;
      },
    }),
    updateSimulation: assign({
      customers: ({ context }) => {
        return context.customers
          .map((customer) => {
            switch (customer.state) {
              case 'idle':
                if (Math.random() < 0.7) {
                  const order = generateOrder(customer);
                  return { ...customer, state: 'ordering' as const, order };
                }
                return customer;

              case 'ordering':
                return { ...customer, state: 'waiting' as const };

              case 'waiting': {
                const updatedCustomer = {
                  ...customer,
                  patience: customer.patience - 10,
                };

                if (updatedCustomer.patience <= 0) {
                  return { ...updatedCustomer, state: 'leaving' as const, satisfaction: 0 };
                }

                if (customer.order && customer.order.status === 'ready') {
                  return { ...updatedCustomer, state: 'receiving' as const };
                }

                return updatedCustomer;
              }

              case 'receiving':
                if (customer.order) {
                  return {
                    ...customer,
                    state: 'leaving' as const,
                    satisfaction: Math.min(100, customer.satisfaction + 30),
                  };
                }
                return customer;

              default:
                return customer;
            }
          })
          .filter((customer) => customer.state !== 'leaving');
      },
      orders: ({ context }) => {
        return context.orders
          .map((order) => {
            switch (order.status) {
              case 'ordered':
                if (Math.random() < 0.3) {
                  return { ...order, status: 'preparing' as const };
                }
                return order;

              case 'preparing':
                if (Math.random() < 0.4) {
                  return { ...order, status: 'ready' as const };
                }
                return order;

              default:
                return order;
            }
          })
          .filter((order) => order.status !== 'delivered');
      },
      revenue: ({ context }) => {
        let additionalRevenue = 0;
        const completedOrders = context.customers.filter(
          (customer) => customer.state === 'receiving' && customer.order
        );

        completedOrders.forEach((customer) => {
          if (customer.order) {
            additionalRevenue += customer.order.price;
          }
        });

        return context.revenue + additionalRevenue;
      },
      servedOrders: ({ context }) => {
        const completedOrders = context.customers.filter(
          (customer) => customer.state === 'receiving' && customer.order
        );
        return context.servedOrders + completedOrders.length;
      },
      totalOrders: ({ context }) => {
        const newOrders = context.customers.filter(
          (customer) => customer.state === 'ordering' && customer.order
        );
        return context.totalOrders + newOrders.length;
      },
    }),
  },
}).createMachine({
  id: 'coffee-shop',
  initial: 'closed',
  context: {
    customers: [],
    orders: [],
    revenue: 0,
    servedOrders: 0,
    totalOrders: 0,
    simulationSpeed: 1000,
    maxCustomers: 8,
  },
  states: {
    closed: {
      on: {
        START_SIMULATION: 'running',
        RESET_SHOP: { actions: 'resetShop' },
      },
    },
    running: {
      // ✅ XState delayed transitions replace setInterval
      after: {
        1000: {
          target: 'running',
          actions: 'updateSimulation',
        },
        3000: {
          target: 'running',
          actions: 'generateCustomer',
        },
      },
      on: {
        STOP_SIMULATION: 'closed',
        RESET_SHOP: { target: 'closed', actions: 'resetShop' },
      },
    },
  },
});

// ✅ Template components (extracted for better organization)
const renderCustomerOrder = (order: CoffeeOrder | undefined): RawHTML => {
  if (!order) return html``;
  return html`
    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.5rem;">
      Order: ${order.drinkType} (${order.size})
    </div>
  `;
};

const customerItem = (customer: Customer): RawHTML => html`
  <div class="customer-item">
    <div class="customer-name">${customer.name}</div>
    <div class="customer-status">
      Status: ${customer.state}
      <span class="status-badge status-${customer.state}">${customer.state}</span>
    </div>
    ${renderCustomerOrder(customer.order)}
  </div>
`;

const orderItem = (order: CoffeeOrder): RawHTML => html`
  <div class="order-item">
    <div class="order-id">Order #${order.id.slice(-4)}</div>
    <div class="order-status">
      ${order.drinkType} (${order.size})
      <span class="status-badge status-${order.status}">${order.status}</span>
    </div>
    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.5rem;">
      Customer: ${order.customerName} • $${order.price.toFixed(2)}
    </div>
  </div>
`;

const statCard = (value: string, label: string): RawHTML => html`
  <div class="stat-card">
    <div class="stat-value">${value}</div>
    <div class="stat-label">${label}</div>
  </div>
`;

// ✅ Pure template function using framework html``
const coffeeShopTemplate = (state: SnapshotFrom<typeof coffeeShopMachine>): RawHTML => {
  const { customers, orders, revenue, servedOrders } = state.context;
  const isRunning = state.matches('running');

  return html`
    <div class="coffee-shop-container">
      <div class="shop-header">
        <h2 class="shop-title">☕ Actor Coffee Shop</h2>
        <p class="shop-subtitle">Watch actors coordinate a coffee shop simulation</p>
      </div>
      
      <div class="shop-controls">
        <button 
          class="control-button" 
          send="START_SIMULATION" 
          ${isRunning ? 'disabled' : ''}
        >
          Start Simulation
        </button>
        <button 
          class="control-button stop" 
          send="STOP_SIMULATION" 
          ${!isRunning ? 'disabled' : ''}
        >
          Stop Simulation
        </button>
        <button 
          class="control-button" 
          send="RESET_SHOP" 
          ${isRunning ? 'disabled' : ''}
        >
          Reset Shop
        </button>
      </div>
      
      <div class="shop-stats">
        ${statCard(revenue.toFixed(2), 'Revenue ($)')}
        ${statCard(servedOrders.toString(), 'Orders Served')}
        ${statCard(customers.length.toString(), 'Current Customers')}
        ${statCard(orders.length.toString(), 'Pending Orders')}
      </div>
      
      <div class="simulation-area">
        <div class="customers-section">
          <h3 class="section-title">👥 Customers</h3>
          <div class="customers-list">
            ${
              customers.length === 0
                ? html`<div class="empty-state">No customers yet... 🌟</div>`
                : customers.map((customer) => customerItem(customer))
            }
          </div>
        </div>
        
        <div class="orders-section">
          <h3 class="section-title">📋 Orders</h3>
          <div class="orders-list">
            ${
              orders.length === 0
                ? html`<div class="empty-state">No pending orders 📝</div>`
                : orders.map((order) => orderItem(order))
            }
          </div>
        </div>
      </div>
      
      <div class="educational-note">
        <h3>Actor Model in Action</h3>
        <p>
          Each customer and barista is an independent actor with its own state machine. 
          Actors communicate through messages, creating a decentralized system where no single 
          point coordinates everything. This makes the system resilient and easy to reason about.
        </p>
      </div>
    </div>
  `;
};

// ✅ Static styles (preserving the existing comprehensive styles)
const coffeeShopStyles = css`
  :host {
    display: block;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  .coffee-shop-container {
    background: rgba(15, 17, 21, 0.95);
    border: 1px solid rgba(13, 153, 255, 0.2);
    border-radius: 16px;
    padding: 2rem;
    margin: 2rem 0;
  }
  
  .shop-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .shop-title {
    color: var(--jasper, #0D99FF);
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }
  
  .shop-subtitle {
    color: var(--teagreen, #F5F5F5);
    font-size: 1rem;
    margin: 0;
    opacity: 0.9;
  }
  
  .shop-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }
  
  .control-button {
    background: linear-gradient(135deg, var(--jasper, #0D99FF), #47B4FF);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;
  }
  
  .control-button:hover:not([disabled]) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(13, 153, 255, 0.4);
  }
  
  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  .control-button.stop {
    background: linear-gradient(135deg, #dc3545, #c82333);
  }
  
  .control-button.stop:hover:not([disabled]) {
    box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
  }
  
  .shop-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background: rgba(13, 153, 255, 0.08);
    border: 1px solid rgba(13, 153, 255, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
  }
  
  .stat-value {
    color: var(--jasper, #0D99FF);
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }
  
  .stat-label {
    color: var(--teagreen, #F5F5F5);
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  .simulation-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .customers-section,
  .orders-section {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(13, 153, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
  }
  
  .section-title {
    color: var(--jasper-light, #47B4FF);
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
  }
  
  .customers-list,
  .orders-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
  }
  
  .customer-item,
  .order-item {
    background: rgba(13, 153, 255, 0.05);
    border: 1px solid rgba(13, 153, 255, 0.1);
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.3s ease;
    animation: fadeIn 0.5s ease forwards;
  }
  
  .customer-item:hover,
  .order-item:hover {
    border-color: rgba(13, 153, 255, 0.3);
    transform: translateY(-2px);
  }
  
  .customer-name,
  .order-id {
    color: var(--teagreen, #F5F5F5);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .customer-status,
  .order-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--teagreen, #F5F5F5);
    font-size: 0.9rem;
    opacity: 0.9;
  }
  
  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  .status-idle,
  .status-waiting {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
  }
  
  .status-ordering,
  .status-preparing {
    background: rgba(13, 153, 255, 0.2);
    color: #0D99FF;
  }
  
  .status-receiving,
  .status-ready {
    background: rgba(40, 167, 69, 0.2);
    color: #28a745;
  }
  
  .status-leaving {
    background: rgba(108, 117, 125, 0.2);
    color: #6c757d;
  }
  
  .status-ordered {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
  }
  
  .empty-state {
    text-align: center;
    color: var(--teagreen, #F5F5F5);
    opacity: 0.6;
    padding: 2rem;
    font-style: italic;
  }
  
  .educational-note {
    background: rgba(13, 153, 255, 0.08);
    border: 1px solid rgba(13, 153, 255, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 2rem;
    position: relative;
  }
  
  .educational-note::before {
    content: '💡';
    position: absolute;
    top: 1rem;
    left: 1rem;
    font-size: 1.5rem;
  }
  
  .educational-note h3 {
    color: var(--jasper, #0D99FF);
    margin: 0 0 1rem 2.5rem;
    font-size: 1.1rem;
  }
  
  .educational-note p {
    color: var(--teagreen, #F5F5F5);
    margin: 0 0 0 2.5rem;
    line-height: 1.6;
    opacity: 0.95;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    .simulation-area {
      grid-template-columns: 1fr;
    }
    
    .shop-controls {
      flex-direction: column;
      align-items: center;
    }
    
    .control-button {
      width: 200px;
    }
  }
`;

// ✅ Create the component using framework API
const CoffeeShopAppComponent = createComponent({
  machine: coffeeShopMachine,
  template: coffeeShopTemplate,
  styles: coffeeShopStyles,
  tagName: 'coffee-shop-app-clean', // Maintain compatibility
});

// ✅ Export the component class for programmatic access
export default CoffeeShopAppComponent;

// ✅ Export types for external use
export type { CoffeeOrder, Customer, CoffeeShopContext, CoffeeShopEvents };

// ✅ Usage Examples:
//
// 1. Basic usage (registered as <coffee-shop-app-clean>):
//    <coffee-shop-app-clean></coffee-shop-app-clean>
//
// 2. Programmatic usage:
//    const coffeeShop = new CoffeeShopAppComponent();
//    document.body.appendChild(coffeeShop);
//
//    // Control simulation
//    coffeeShop.send({ type: 'START_SIMULATION' });
//    coffeeShop.send({ type: 'STOP_SIMULATION' });
//    coffeeShop.send({ type: 'RESET_SHOP' });
//
// Benefits of the new approach:
// ✅ No DOM queries - everything is reactive through state
// ✅ Declarative event handling with framework send attributes
// ✅ XState delayed transitions replace setInterval/setTimeout
// ✅ Type-safe state management with proper actor patterns
// ✅ Pure template functions with automatic XSS protection
// ✅ Automatic lifecycle management - no manual cleanup needed
// ✅ Better performance with efficient state-driven updates
// ✅ Improved testability with isolated state machine logic

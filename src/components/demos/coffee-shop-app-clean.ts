// TypeScript interfaces for Coffee Shop Demo
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

interface CoffeeShopState {
  customers: Customer[];
  orders: CoffeeOrder[];
  revenue: number;
  servedOrders: number;
  totalOrders: number;
  isOpen: boolean;
}

interface CoffeeShopEvents {
  CUSTOMER_ARRIVES: { customer: Customer };
  PLACE_ORDER: { customerId: string; order: Omit<CoffeeOrder, 'id' | 'timestamp' | 'status'> };
  ORDER_READY: { orderId: string };
  ORDER_DELIVERED: { orderId: string };
  CUSTOMER_LEAVES: { customerId: string };
  OPEN_SHOP: {};
  CLOSE_SHOP: {};
}

interface ActorSnapshot {
  value: string;
  context: any;
}

interface Actor {
  getSnapshot(): ActorSnapshot;
  send(event: any): void;
  start(): void;
  stop(): void;
}

// Note: gtag is already declared in main.ts

class CoffeeShopAppClean extends HTMLElement {
  private shopState: CoffeeShopState;
  private updateInterval: number | null = null;
  private customerGenerationInterval: number | null = null;
  private actors: Map<string, Actor> = new Map();
  private isRunning: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shopState = {
      customers: [],
      orders: [],
      revenue: 0,
      servedOrders: 0,
      totalOrders: 0,
      isOpen: false
    };
  }

  static get observedAttributes(): string[] {
    return ['auto-start', 'simulation-speed', 'max-customers'];
  }

  connectedCallback(): void {
    this.render();
    this.addEventListeners();
    
    if (this.getAttribute('auto-start') === 'true') {
      setTimeout(() => this.startSimulation(), 1000);
    }
  }

  disconnectedCallback(): void {
    this.stopSimulation();
    this.removeEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue && this.shadowRoot) {
      this.render();
    }
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .coffee-shop-container {
          background: linear-gradient(135deg, rgba(15, 17, 21, 0.95) 0%, rgba(8, 8, 8, 0.98) 100%);
          border: 2px solid rgba(13, 153, 255, 0.2);
          border-radius: 16px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        
        .coffee-shop-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--jasper), var(--jasper-light), transparent);
          opacity: 0.8;
        }
        
        .shop-header {
          text-align: center;
          margin-bottom: 2rem;
          position: relative;
        }
        
        .shop-title {
          color: var(--jasper, #0D99FF);
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
        }
        
        .shop-subtitle {
          color: var(--teagreen, #F5F5F5);
          font-size: 1.1rem;
          margin: 0 0 1.5rem 0;
          opacity: 0.9;
        }
        
        .shop-controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        
        .control-button {
          background: linear-gradient(135deg, var(--jasper, #0D99FF) 0%, var(--jasper-light, #47B4FF) 100%);
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .control-button:disabled {
          background: rgba(13, 153, 255, 0.3);
          cursor: not-allowed;
        }
        
        .control-button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(13, 153, 255, 0.3);
        }
        
        .control-button.stop {
          background: linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%);
        }
        
        .control-button.stop:not(:disabled):hover {
          box-shadow: 0 8px 24px rgba(255, 71, 87, 0.3);
        }
        
        .shop-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: rgba(13, 153, 255, 0.08);
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
        }
        
        .stat-value {
          color: var(--jasper-light, #47B4FF);
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }
        
        .stat-label {
          color: var(--teagreen, #F5F5F5);
          font-size: 0.85rem;
          margin: 0.25rem 0 0 0;
          opacity: 0.8;
        }
        
        .simulation-area {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
          .simulation-area {
            grid-template-columns: 1fr;
          }
        }
        
        .customers-section,
        .orders-section {
          background: rgba(15, 17, 21, 0.6);
          border: 1px solid rgba(13, 153, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
        }
        
        .section-title {
          color: var(--jasper, #0D99FF);
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .customer-item,
        .order-item {
          background: rgba(13, 153, 255, 0.06);
          border: 1px solid rgba(13, 153, 255, 0.15);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
        }
        
        .customer-item:hover,
        .order-item:hover {
          border-color: rgba(13, 153, 255, 0.3);
          background: rgba(13, 153, 255, 0.1);
        }
        
        .customer-name,
        .order-id {
          color: var(--jasper-light, #47B4FF);
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }
        
        .customer-status,
        .order-status {
          color: var(--teagreen, #F5F5F5);
          font-size: 0.9rem;
          opacity: 0.9;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          margin-left: 0.5rem;
        }
        
        .status-ordered {
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }
        
        .status-preparing {
          background: rgba(13, 153, 255, 0.2);
          color: #0D99FF;
        }
        
        .status-ready {
          background: rgba(40, 167, 69, 0.2);
          color: #28a745;
        }
        
        .status-waiting {
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }
        
        .status-receiving {
          background: rgba(40, 167, 69, 0.2);
          color: #28a745;
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
        
        .loading-state {
          text-align: center;
          padding: 2rem;
          color: var(--jasper, #0D99FF);
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(13, 153, 255, 0.3);
          border-top: 3px solid var(--jasper, #0D99FF);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
        
        .customer-item,
        .order-item {
          animation: fadeIn 0.5s ease forwards;
        }
      </style>
      
      <div class="coffee-shop-container">
        <div class="shop-header">
          <h2 class="shop-title">☕ Actor Coffee Shop</h2>
          <p class="shop-subtitle">Watch actors coordinate a coffee shop simulation</p>
        </div>
        
        <div class="shop-controls">
          <button class="control-button" id="start-btn" ${this.isRunning ? 'disabled' : ''}>
            Start Simulation
          </button>
          <button class="control-button stop" id="stop-btn" ${!this.isRunning ? 'disabled' : ''}>
            Stop Simulation
          </button>
          <button class="control-button" id="reset-btn" ${this.isRunning ? 'disabled' : ''}>
            Reset Shop
          </button>
        </div>
        
        <div class="shop-stats">
          <div class="stat-card">
            <div class="stat-value">${this.shopState.revenue.toFixed(2)}</div>
            <div class="stat-label">Revenue ($)</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.shopState.servedOrders}</div>
            <div class="stat-label">Orders Served</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.shopState.customers.length}</div>
            <div class="stat-label">Current Customers</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.shopState.orders.length}</div>
            <div class="stat-label">Pending Orders</div>
          </div>
        </div>
        
        <div class="simulation-area">
          <div class="customers-section">
            <h3 class="section-title">👥 Customers</h3>
            <div id="customers-list">
              ${this.renderCustomers()}
            </div>
          </div>
          
          <div class="orders-section">
            <h3 class="section-title">📋 Orders</h3>
            <div id="orders-list">
              ${this.renderOrders()}
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
  }

  private renderCustomers(): string {
    if (this.shopState.customers.length === 0) {
      return '<div class="empty-state">No customers yet... 🌟</div>';
    }

    return this.shopState.customers.map(customer => `
      <div class="customer-item">
        <div class="customer-name">${this.escapeHtml(customer.name)}</div>
        <div class="customer-status">
          Status: ${this.escapeHtml(customer.state)}
          <span class="status-badge status-${customer.state}">${customer.state}</span>
        </div>
        ${customer.order ? `
          <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.5rem;">
            Order: ${this.escapeHtml(customer.order.drinkType)} (${this.escapeHtml(customer.order.size)})
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  private renderOrders(): string {
    if (this.shopState.orders.length === 0) {
      return '<div class="empty-state">No pending orders 📝</div>';
    }

    return this.shopState.orders.map(order => `
      <div class="order-item">
        <div class="order-id">Order #${order.id.slice(-4)}</div>
        <div class="order-status">
          ${this.escapeHtml(order.drinkType)} (${this.escapeHtml(order.size)})
          <span class="status-badge status-${order.status}">${order.status}</span>
        </div>
        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.5rem;">
          Customer: ${this.escapeHtml(order.customerName)} • $${order.price.toFixed(2)}
        </div>
      </div>
    `).join('');
  }

  private addEventListeners(): void {
    if (!this.shadowRoot) return;

    const startBtn = this.shadowRoot.getElementById('start-btn');
    const stopBtn = this.shadowRoot.getElementById('stop-btn');
    const resetBtn = this.shadowRoot.getElementById('reset-btn');

    startBtn?.addEventListener('click', () => this.startSimulation());
    stopBtn?.addEventListener('click', () => this.stopSimulation());
    resetBtn?.addEventListener('click', () => this.resetShop());
  }

  private removeEventListeners(): void {
    // Event listeners are automatically removed when shadow DOM is destroyed
  }

  private startSimulation(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.shopState.isOpen = true;
    
    // Update UI every second
    this.updateInterval = window.setInterval(() => {
      this.updateSimulation();
      this.render();
    }, 1000);

    // Generate customers every 3-5 seconds
    this.customerGenerationInterval = window.setInterval(() => {
      if (this.shopState.customers.length < 8) { // Max customers
        this.generateCustomer();
      }
    }, 3000 + Math.random() * 2000);

    this.render();
    this.trackEvent('simulation_started', { timestamp: Date.now() });
  }

  private stopSimulation(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.shopState.isOpen = false;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.customerGenerationInterval) {
      clearInterval(this.customerGenerationInterval);
      this.customerGenerationInterval = null;
    }

    this.render();
    this.trackEvent('simulation_stopped', { 
      revenue: this.shopState.revenue,
      ordersServed: this.shopState.servedOrders
    });
  }

  private resetShop(): void {
    this.stopSimulation();
    
    this.shopState = {
      customers: [],
      orders: [],
      revenue: 0,
      servedOrders: 0,
      totalOrders: 0,
      isOpen: false
    };

    this.actors.clear();
    this.render();
    this.trackEvent('shop_reset', { timestamp: Date.now() });
  }

  private updateSimulation(): void {
    // Update customer states
    this.shopState.customers.forEach(customer => {
      this.updateCustomerState(customer);
    });

    // Update order states
    this.shopState.orders.forEach(order => {
      this.updateOrderState(order);
    });

    // Remove customers who have left
    this.shopState.customers = this.shopState.customers.filter(
      customer => customer.state !== 'leaving'
    );

    // Remove completed orders
    this.shopState.orders = this.shopState.orders.filter(
      order => order.status !== 'delivered'
    );
  }

  private updateCustomerState(customer: Customer): void {
    switch (customer.state) {
      case 'idle':
        // Customer decides to order
        if (Math.random() < 0.7) {
          customer.state = 'ordering';
          this.generateOrder(customer);
        }
        break;
        
      case 'ordering':
        customer.state = 'waiting';
        break;
        
      case 'waiting':
        // Decrease patience
        customer.patience -= 10;
        if (customer.patience <= 0) {
          customer.state = 'leaving';
          customer.satisfaction = 0;
        }
        // Check if order is ready
        if (customer.order && customer.order.status === 'ready') {
          customer.state = 'receiving';
        }
        break;
        
      case 'receiving':
        if (customer.order) {
          customer.order.status = 'delivered';
          this.shopState.revenue += customer.order.price;
          this.shopState.servedOrders++;
          customer.satisfaction = Math.min(100, customer.satisfaction + 30);
        }
        customer.state = 'leaving';
        break;
    }
  }

  private updateOrderState(order: CoffeeOrder): void {
    switch (order.status) {
      case 'ordered':
        // Simulate preparation time
        if (Math.random() < 0.3) {
          order.status = 'preparing';
        }
        break;
        
      case 'preparing':
        // Simulate completion
        if (Math.random() < 0.4) {
          order.status = 'ready';
        }
        break;
    }
  }

  private generateCustomer(): void {
    const names = [
      'Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona',
      'George', 'Hannah', 'Ian', 'Julia', 'Kevin', 'Luna'
    ];

    const customer: Customer = {
      id: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: names[Math.floor(Math.random() * names.length)],
      state: 'idle',
      patience: 80 + Math.random() * 40, // 80-120 patience
      satisfaction: 50 + Math.random() * 30 // 50-80 initial satisfaction
    };

    this.shopState.customers.push(customer);
  }

  private generateOrder(customer: Customer): void {
    const drinkTypes: CoffeeOrder['drinkType'][] = ['espresso', 'latte', 'cappuccino', 'americano', 'macchiato'];
    const sizes: CoffeeOrder['size'][] = ['small', 'medium', 'large'];
    const prices = { small: 3.50, medium: 4.50, large: 5.50 };

    const drinkType = drinkTypes[Math.floor(Math.random() * drinkTypes.length)];
    const size = sizes[Math.floor(Math.random() * sizes.length)];

    const order: CoffeeOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customerName: customer.name,
      drinkType,
      size,
      status: 'ordered',
      timestamp: Date.now(),
      price: prices[size] + (Math.random() * 1.0) // Add some variation
    };

    customer.order = order;
    this.shopState.orders.push(order);
    this.shopState.totalOrders++;
  }

  private trackEvent(eventName: string, data: any): void {
    // Analytics tracking
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, {
        'event_category': 'coffee_shop_demo',
        'event_label': eventName,
        'custom_parameters': data
      });
    }

    // Custom analytics
    if (window.customAnalytics) {
      window.customAnalytics.track(eventName, {
        component: 'coffee-shop-demo',
        ...data
      });
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API methods
  public start(): void {
    this.startSimulation();
  }

  public stop(): void {
    this.stopSimulation();
  }

  public reset(): void {
    this.resetShop();
  }

  public getStats(): CoffeeShopState {
    return { ...this.shopState };
  }

  public isActive(): boolean {
    return this.isRunning;
  }
}

// Register the custom element
customElements.define('coffee-shop-app-clean', CoffeeShopAppClean);

export default CoffeeShopAppClean; 
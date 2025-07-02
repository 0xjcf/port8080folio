// TypeScript interfaces for Customer Actor UI
interface ActorSnapshot {
  value: string;
  context: any;
  [key: string]: any;
}

interface Actor {
  getSnapshot(): ActorSnapshot;
  send(event: any): void;
  subscribe(observer: (snapshot: ActorSnapshot) => void): { unsubscribe(): void };
}

interface CustomerContext {
  customerName?: string;
  currentOrder?: any;
  satisfaction?: number;
  waitingTime?: number;
  orderHistory?: any[];
  preferences?: any;
}

// Import loading state component for TypeScript
import '../../ui/loading-state.js';

class CustomerActorUI extends HTMLElement {
  private _actor: Actor | null = null;
  private subscription: { unsubscribe(): void } | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes(): string[] {
    return ['show-details'];
  }

  get actor(): Actor | null {
    return this._actor;
  }

  set actor(newActor: Actor | null) {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this._actor = newActor;

    if (this._actor) {
      this.subscription = this._actor.subscribe((snapshot) => {
        this.updateUI(snapshot);
      });
      this.updateUI(this._actor.getSnapshot());
    }
  }

  connectedCallback(): void {
    this.render();
  }

  disconnectedCallback(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue && this.shadowRoot) {
      this.render();
    }
  }

  private updateUI(snapshot: ActorSnapshot): void {
    if (!this.shadowRoot) return;

    const state = snapshot.value;
    const context = snapshot.context as CustomerContext;

    // Update state display
    const stateElement = this.shadowRoot.querySelector('.actor-state');
    if (stateElement) {
      stateElement.textContent = this.formatState(state);
      stateElement.className = `actor-state state-${state.replace(/\./g, '-')}`;
    }

    // Update context information
    const contextElement = this.shadowRoot.querySelector('.actor-context');
    if (contextElement) {
      contextElement.innerHTML = this.formatContext(context);
    }

    // Update visual indicator
    const indicatorElement = this.shadowRoot.querySelector('.actor-indicator');
    if (indicatorElement) {
      indicatorElement.className = `actor-indicator ${this.getIndicatorClass(state)}`;
    }

    // Update order status
    const orderElement = this.shadowRoot.querySelector('.order-status');
    if (orderElement) {
      orderElement.innerHTML = this.formatOrderStatus(context);
    }
  }

  private formatState(state: string): string {
    return state.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  private formatContext(context: CustomerContext): string {
    const details = [];
    
    if (context.customerName) {
      details.push(`Name: ${this.escapeHtml(context.customerName)}`);
    }
    
    if (context.satisfaction !== undefined) {
      details.push(`Satisfaction: ${context.satisfaction}%`);
    }
    
    if (context.waitingTime !== undefined) {
      details.push(`Wait Time: ${context.waitingTime}s`);
    }
    
    if (context.orderHistory && context.orderHistory.length > 0) {
      details.push(`Orders: ${context.orderHistory.length}`);
    }

    return details.length > 0 ? details.join('<br>') : 'No additional details';
  }

  private formatOrderStatus(context: CustomerContext): string {
    if (context.currentOrder) {
      const order = context.currentOrder;
      return `
        <div class="current-order">
          <strong>Current Order:</strong><br>
          ${this.escapeHtml(order.item || 'Coffee')}<br>
          <span class="order-price">$${(order.price || 4.50).toFixed(2)}</span>
        </div>
      `;
    }
    return '<div class="no-order">No current order</div>';
  }

  private getIndicatorClass(state: string): string {
    const stateClasses: { [key: string]: string } = {
      'idle': 'idle',
      'browsing': 'browsing',
      'ordering': 'ordering',
      'waiting': 'waiting',
      'receiving': 'receiving',
      'enjoying': 'enjoying',
      'leaving': 'leaving'
    };
    
    return stateClasses[state] || 'unknown';
  }

  private render(): void {
    if (!this.shadowRoot) return;

    const showDetails = this.getAttribute('show-details') !== 'false';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
        }

        .customer-actor {
          background: linear-gradient(135deg, rgba(34, 211, 153, 0.1) 0%, rgba(15, 17, 21, 0.9) 100%);
          border: 2px solid rgba(34, 211, 153, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          position: relative;
          transition: all 0.3s ease;
          min-height: 200px;
        }

        .customer-actor:hover {
          border-color: rgba(34, 211, 153, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(34, 211, 153, 0.2);
        }

        .actor-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .actor-icon {
          font-size: 2.5rem;
          filter: drop-shadow(0 0 8px rgba(34, 211, 153, 0.4));
        }

        .actor-title {
          flex: 1;
        }

        .actor-name {
          color: var(--teagreen, #F5F5F5);
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0;
        }

        .actor-role {
          color: rgba(34, 211, 153, 0.8);
          font-size: 0.9rem;
          margin: 0.25rem 0 0 0;
          font-weight: 500;
        }

        .actor-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #6B7280;
          transition: all 0.3s ease;
          position: relative;
        }

        .actor-indicator::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 50%;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .actor-indicator.idle {
          background: #6B7280;
        }

        .actor-indicator.browsing {
          background: #F59E0B;
          animation: pulse 2s infinite;
        }

        .actor-indicator.ordering {
          background: #3B82F6;
          animation: pulse 1.5s infinite;
        }

        .actor-indicator.waiting {
          background: #EF4444;
          animation: pulse 1s infinite;
        }

        .actor-indicator.receiving {
          background: #10B981;
          animation: pulse 0.8s infinite;
        }

        .actor-indicator.enjoying {
          background: #8B5CF6;
        }

        .actor-indicator.leaving {
          background: #6B7280;
          opacity: 0.5;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
        }

        .actor-state {
          background: rgba(34, 211, 153, 0.1);
          color: rgb(34, 211, 153);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          text-align: center;
          margin-bottom: 1rem;
          border: 1px solid rgba(34, 211, 153, 0.3);
          text-transform: capitalize;
        }

        .state-idle {
          background: rgba(107, 114, 128, 0.1);
          color: rgb(107, 114, 128);
          border-color: rgba(107, 114, 128, 0.3);
        }

        .state-browsing {
          background: rgba(245, 158, 11, 0.1);
          color: rgb(245, 158, 11);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .state-ordering {
          background: rgba(59, 130, 246, 0.1);
          color: rgb(59, 130, 246);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .state-waiting {
          background: rgba(239, 68, 68, 0.1);
          color: rgb(239, 68, 68);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .state-receiving {
          background: rgba(16, 185, 129, 0.1);
          color: rgb(16, 185, 129);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .state-enjoying {
          background: rgba(139, 92, 246, 0.1);
          color: rgb(139, 92, 246);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .state-leaving {
          background: rgba(107, 114, 128, 0.1);
          color: rgb(107, 114, 128);
          border-color: rgba(107, 114, 128, 0.3);
          opacity: 0.7;
        }

        .actor-content {
          display: grid;
          gap: 1rem;
        }

        .order-status {
          background: rgba(15, 17, 21, 0.6);
          border: 1px solid rgba(34, 211, 153, 0.2);
          border-radius: 8px;
          padding: 1rem;
        }

        .current-order {
          color: var(--teagreen, #F5F5F5);
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .order-price {
          color: rgb(34, 211, 153);
          font-weight: 600;
          font-size: 1.1rem;
        }

        .no-order {
          color: rgba(107, 114, 128, 0.8);
          font-style: italic;
          text-align: center;
          padding: 0.5rem;
        }

        .actor-context {
          background: rgba(15, 17, 21, 0.6);
          border: 1px solid rgba(34, 211, 153, 0.2);
          border-radius: 8px;
          padding: 1rem;
          color: var(--teagreen, #F5F5F5);
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .details-hidden {
          display: none;
        }

        @media (max-width: 768px) {
          .customer-actor {
            padding: 1rem;
            min-height: 160px;
          }

          .actor-header {
            margin-bottom: 1rem;
          }

          .actor-icon {
            font-size: 2rem;
          }

          .actor-name {
            font-size: 1.1rem;
          }
        }
      </style>

      <div class="customer-actor">
        <div class="actor-header">
          <div class="actor-icon">👤</div>
          <div class="actor-title">
            <h3 class="actor-name">Customer</h3>
            <p class="actor-role">Orders coffee and experiences the service</p>
          </div>
          <div class="actor-indicator idle"></div>
        </div>

        <div class="actor-state">Idle</div>

        <div class="actor-content">
          <div class="order-status">
            <div class="no-order">No current order</div>
          </div>

          ${showDetails ? `
            <div class="actor-context">
              No additional details
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API methods
  public getState(): string | null {
    return this._actor?.getSnapshot().value || null;
  }

  public getContext(): CustomerContext | null {
    return this._actor?.getSnapshot().context || null;
  }

  public sendEvent(event: any): void {
    this._actor?.send(event);
  }

  public showDetails(show: boolean): void {
    this.setAttribute('show-details', show.toString());
  }
}

// Register the custom element
customElements.define('customer-actor-ui', CustomerActorUI);

export default CustomerActorUI; 
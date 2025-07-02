// TypeScript interfaces for Barista Actor UI
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

interface BaristaContext {
  currentOrder?: any;
  ordersCompleted?: number;
  beverageType?: string;
  preparationTime?: number;
  specialty?: string;
  shift?: string;
}

// Import loading state component for TypeScript
import '../../ui/loading-state.js';

class BaristaActorUI extends HTMLElement {
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
    const context = snapshot.context as BaristaContext;

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

    // Update brewing status
    const brewingElement = this.shadowRoot.querySelector('.brewing-status');
    if (brewingElement) {
      brewingElement.innerHTML = this.formatBrewingStatus(context);
    }
  }

  private formatState(state: string): string {
    return state.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  private formatContext(context: BaristaContext): string {
    const details = [];
    
    if (context.ordersCompleted !== undefined) {
      details.push(`Orders Completed: ${context.ordersCompleted}`);
    }
    
    if (context.specialty) {
      details.push(`Specialty: ${this.escapeHtml(context.specialty)}`);
    }
    
    if (context.preparationTime !== undefined) {
      details.push(`Prep Time: ${context.preparationTime}s`);
    }
    
    if (context.shift) {
      details.push(`Shift: ${this.escapeHtml(context.shift)}`);
    }

    return details.length > 0 ? details.join('<br>') : 'No additional details';
  }

  private formatBrewingStatus(context: BaristaContext): string {
    if (context.currentOrder) {
      const order = context.currentOrder;
      return `
        <div class="current-brewing">
          <strong>Now Brewing:</strong><br>
          ${this.escapeHtml(order.beverageType || 'Coffee')}<br>
          <span class="brewing-time">Est. ${order.prepTime || 180}s</span>
          ${order.specialty ? `<br>Special: ${this.escapeHtml(order.specialty)}` : ''}
        </div>
      `;
    }
    return '<div class="no-brewing">Ready to brew</div>';
  }

  private getIndicatorClass(state: string): string {
    const stateClasses: { [key: string]: string } = {
      'idle': 'idle',
      'preparing': 'preparing',
      'grinding': 'grinding',
      'brewing': 'brewing',
      'steaming': 'steaming',
      'finishing': 'finishing',
      'complete': 'complete'
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

        .barista-actor {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(15, 17, 21, 0.9) 100%);
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          position: relative;
          transition: all 0.3s ease;
          min-height: 200px;
        }

        .barista-actor:hover {
          border-color: rgba(139, 92, 246, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
        }

        .actor-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .actor-icon {
          font-size: 2.5rem;
          filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4));
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
          color: rgba(139, 92, 246, 0.8);
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

        .actor-indicator.idle {
          background: #6B7280;
        }

        .actor-indicator.preparing {
          background: #F59E0B;
          animation: pulse 2s infinite;
        }

        .actor-indicator.grinding {
          background: #EF4444;
          animation: pulse 1s infinite;
        }

        .actor-indicator.brewing {
          background: #3B82F6;
          animation: pulse 1.5s infinite;
        }

        .actor-indicator.steaming {
          background: #F97316;
          animation: pulse 1.2s infinite;
        }

        .actor-indicator.finishing {
          background: #8B5CF6;
          animation: pulse 0.8s infinite;
        }

        .actor-indicator.complete {
          background: #10B981;
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
          background: rgba(139, 92, 246, 0.1);
          color: rgb(139, 92, 246);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          text-align: center;
          margin-bottom: 1rem;
          border: 1px solid rgba(139, 92, 246, 0.3);
          text-transform: capitalize;
        }

        .brewing-status {
          background: rgba(15, 17, 21, 0.6);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          padding: 1rem;
        }

        .current-brewing {
          color: var(--teagreen, #F5F5F5);
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .brewing-time {
          color: rgb(139, 92, 246);
          font-weight: 600;
          font-size: 1.1rem;
        }

        .no-brewing {
          color: rgba(107, 114, 128, 0.8);
          font-style: italic;
          text-align: center;
          padding: 0.5rem;
        }

        .actor-context {
          background: rgba(15, 17, 21, 0.6);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          padding: 1rem;
          color: var(--teagreen, #F5F5F5);
          font-size: 0.85rem;
          line-height: 1.4;
        }
      </style>

      <div class="barista-actor">
        <div class="actor-header">
          <div class="actor-icon">☕</div>
          <div class="actor-title">
            <h3 class="actor-name">Barista</h3>
            <p class="actor-role">Crafts coffee beverages with expertise</p>
          </div>
          <div class="actor-indicator idle"></div>
        </div>

        <div class="actor-state">Idle</div>

        <div class="actor-content">
          <div class="brewing-status">
            <div class="no-brewing">Ready to brew</div>
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

  public getContext(): BaristaContext | null {
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
customElements.define('barista-actor-ui', BaristaActorUI);

export default BaristaActorUI; 
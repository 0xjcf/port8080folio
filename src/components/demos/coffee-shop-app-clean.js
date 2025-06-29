import { createActor } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';
import { coffeeShopOrchestratorMachine } from './actors/coffee-shop-orchestrator.js';
import './actors/customer-actor-ui.js';
import './actors/cashier-actor-ui.js';
import './actors/barista-actor-ui.js';

class CoffeeShopAppClean extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.orchestrator = null;
    this.messageLogSubscription = null;
  }

  connectedCallback() {
    this.initializeOrchestrator();
    this.render();
  }

  disconnectedCallback() {
    this.orchestrator?.stop();
    this.messageLogSubscription?.unsubscribe();
  }

  initializeOrchestrator() {
    this.orchestrator = createActor(coffeeShopOrchestratorMachine);
    this.actorsInitialized = false;

    this.orchestrator.subscribe((snapshot) => {
      this.updateStats(snapshot.context);
      
      // Only update actor references once when they're first created
      if (!this.actorsInitialized && snapshot.context.customerActor) {
        requestAnimationFrame(() => {
          this.updateActorReferences(snapshot.context);
          this.subscribeToMessageLog(snapshot.context);
          this.actorsInitialized = true;
        });
      }
    });

    this.orchestrator.start();
    this.orchestrator.send({ type: 'OPEN' });
  }

  subscribeToMessageLog(context) {
    if (context.messageLogActor && !this.messageLogSubscription) {
      this.messageLogSubscription = context.messageLogActor.subscribe((snapshot) => {
        this.renderMessages(snapshot.context.messages);
      });
    }
  }

  updateActorReferences(context) {
    const customerUI = this.shadowRoot.querySelector('customer-actor-ui');
    const cashierUI = this.shadowRoot.querySelector('cashier-actor-ui');
    const baristaUI = this.shadowRoot.querySelector('barista-actor-ui');

    if (customerUI && context.customerActor) {
      customerUI.actor = context.customerActor;
    }
    if (cashierUI && context.cashierActor) {
      cashierUI.actor = context.cashierActor;
    }
    if (baristaUI && context.baristaActor) {
      baristaUI.actor = context.baristaActor;
    }
  }

  updateStats(context) {
    const ordersCompletedEl = this.shadowRoot.getElementById('orders-completed');
    const queueSizeEl = this.shadowRoot.getElementById('queue-size');

    if (ordersCompletedEl) {
      ordersCompletedEl.textContent = context.ordersCompleted || 0;
    }
    if (queueSizeEl) {
      queueSizeEl.textContent = context.ordersInQueue || 0;
    }
  }

  renderMessages(messages = []) {
    const messagesEl = this.shadowRoot.getElementById('messages');
    if (messagesEl) {
      messagesEl.innerHTML = messages
        .map(({ timestamp, message, type }) => `
          <div class="message">
            <span class="message-time" style="color: #666; font-size: 0.85rem;">${timestamp}</span>
            <span class="message-text">${message}</span>
          </div>
        `)
        .join('');
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  handleOrder() {
    // Send ORDER event to customer actor to start the flow
    const customerActor = this.orchestrator.getSnapshot().context.customerActor;
    if (customerActor) {
      customerActor.send({ type: 'ORDER' });
    }
  }

  handleReset() {
    // Send clear message to log actor before stopping
    const messageLogActor = this.orchestrator?.getSnapshot().context.messageLogActor;
    if (messageLogActor) {
      messageLogActor.send({ type: 'CLEAR_LOG' });
    }
    
    // Stop current orchestrator and restart
    this.orchestrator?.stop();
    this.messageLogSubscription?.unsubscribe();
    this.messageLogSubscription = null;
    this.actorsInitialized = false;

    // Clear the message display immediately
    this.renderMessages([]);

    // Reinitialize
    this.initializeOrchestrator();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/src/styles/state-machine-education.css">
      
      <div class="container">
        <div class="demo-container">
          <h3 class="concept-title">☕ Actor-Based Coffee Shop Demo</h3>
          <p class="concept-description" style="text-align: center; margin-bottom: 30px;">
            Each UI component manages its own actor, coordinated by an orchestrator - with a dedicated message log actor for observability!
          </p>

          <div class="coffee-shop">
            <customer-actor-ui></customer-actor-ui>
            <cashier-actor-ui></cashier-actor-ui>
            <barista-actor-ui></barista-actor-ui>
          </div>

          <div class="controls">
            <button class="action-button" id="order-button">Customer Orders Coffee</button>
            <button class="action-button" id="reset-button">Reset Demo</button>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="stat-value" id="orders-completed">0</div>
              <div class="stat-label">Orders Completed</div>
            </div>
            <div class="stat">
              <div class="stat-value" id="queue-size">0</div>
              <div class="stat-label">Orders in Queue</div>
            </div>
          </div>

          <div class="message-log">
            <div class="message-log-title">📨 Message Log (Actor)</div>
            <div id="messages"></div>
          </div>
          
          <!-- CTA after demo -->
          <div style="text-align: center; margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <h3 style="color: var(--jasper); margin-bottom: 1rem;">Ready to Build Something This Clean?</h3>
            <p style="color: var(--teagreen); margin-bottom: 1.5rem;">
              Transform your complex state management into visual, testable, maintainable code.
            </p>
            <a href="#contact" class="demo-cta-button" style="
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              padding: 1rem 2rem;
              background: var(--jasper);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(13, 153, 255, 0.3);
              cursor: pointer;
            ">
              Get Your Free Architecture Review
              <span style="transition: transform 0.3s ease;">→</span>
            </a>
          </div>
        </div>
      </div>
    `;

    // Attach event listeners
    this.shadowRoot.getElementById('order-button')
      ?.addEventListener('click', () => this.handleOrder());

    this.shadowRoot.getElementById('reset-button')
      ?.addEventListener('click', () => this.handleReset());

    // Add smooth scrolling for CTA
    const ctaButton = this.shadowRoot.querySelector('.demo-cta-button');
    if (ctaButton) {
      ctaButton.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector('#contact');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }
}

customElements.define('coffee-shop-app-clean', CoffeeShopAppClean);
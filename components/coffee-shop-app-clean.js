import { createActor } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';
import { coffeeShopOrchestratorMachine } from './actors/coffee-shop-orchestrator.js';
import './actors/customer/customer-actor-ui.js';
import './actors/cashier/cashier-actor-ui.js';
import './actors/barista/barista-actor-ui.js';

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
    
    this.orchestrator.subscribe((snapshot) => {
      this.updateStats(snapshot.context);
      // Delay actor reference updates to ensure DOM is ready
      requestAnimationFrame(() => {
        this.updateActorReferences(snapshot.context);
        this.subscribeToMessageLog(snapshot.context);
      });
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
        .map(({ timestamp, message }) => `
          <div class="message">[${timestamp}] ${message}</div>
        `)
        .join('');
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  handleOrder() {
    const customerActor = this.orchestrator.getSnapshot().context.customerActor;
    if (customerActor) {
      customerActor.send({ type: 'ORDER' });
    }
  }

  handleReset() {
    this.orchestrator.send({ type: 'RESET' });
    // Clear the message log
    const messageLogActor = this.orchestrator.getSnapshot().context.messageLogActor;
    if (messageLogActor) {
      messageLogActor.send({ type: 'CLEAR_LOG' });
      messageLogActor.send({ 
        type: 'LOG_MESSAGE', 
        message: '🔄 System reset - All actors returned to initial states' 
      });
      messageLogActor.send({ 
        type: 'LOG_MESSAGE', 
        message: '📊 Actor-based architecture ready for new orders!' 
      });
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./components/state-machine-education.css">
      
      <div class="container">
        <div class="demo-container">
          <h3 class="concept-title">☕ Actor-Based Coffee Shop Demo</h3>
          <p class="concept-description" style="text-align: center; margin-bottom: 30px;">
            Each component owns its actor - with a dedicated message log actor!
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
        </div>
      </div>
    `;

    // Attach event listeners
    this.shadowRoot.getElementById('order-button')
      ?.addEventListener('click', () => this.handleOrder());
    
    this.shadowRoot.getElementById('reset-button')
      ?.addEventListener('click', () => this.handleReset());
  }
}

customElements.define('coffee-shop-app-clean', CoffeeShopAppClean);
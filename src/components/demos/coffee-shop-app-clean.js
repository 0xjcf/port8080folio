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
    this.uiStateSubscription = null;
    this.currentUIState = 'idle';
  }

  connectedCallback() {
    this.initializeOrchestrator();
    this.render();
  }

  disconnectedCallback() {
    this.orchestrator?.stop();
    this.messageLogSubscription?.unsubscribe();
    this.uiStateSubscription?.unsubscribe();
  }

  initializeOrchestrator() {
    this.orchestrator = createActor(coffeeShopOrchestratorMachine);
    this.actorsInitialized = false;

    this.orchestrator.subscribe((snapshot) => {
      this.updateStats(snapshot.context);

      // Only update actor references once when they're first created
      if (!this.actorsInitialized && snapshot.context.customerActor && snapshot.context.uiStateActor) {
        requestAnimationFrame(() => {
          this.updateActorReferences(snapshot.context);
          this.subscribeToMessageLog(snapshot.context);
          this.subscribeToUIState(snapshot.context);
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

  subscribeToUIState(context) {
    if (context.uiStateActor && !this.uiStateSubscription) {
      this.uiStateSubscription = context.uiStateActor.subscribe((snapshot) => {
        this.currentUIState = snapshot.value;
        this.updateOrderButton();
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

  updateOrderButton() {
    const orderButton = this.shadowRoot.getElementById('order-button');
    if (orderButton) {
      // Derive UI behavior from state - no booleans needed!
      const isEnabled = this.currentUIState === 'idle';
      const buttonText = this.getButtonTextForState(this.currentUIState);

      orderButton.disabled = !isEnabled;
      orderButton.textContent = buttonText;

      if (isEnabled) {
        orderButton.classList.remove('disabled');
      } else {
        orderButton.classList.add('disabled');
      }
    }
  }

  getButtonTextForState(state) {
    const stateTextMap = {
      'idle': 'Customer Orders Coffee',
      'orderPlacing': 'Order Being Placed...',
      'paymentProcessing': 'Processing Payment...',
      'coffeePreparation': 'Coffee Being Prepared...',
      'coffeeReady': 'Coffee Ready - Being Served!',
      'orderComplete': 'Order Complete - Customer Enjoying!'
    };

    return stateTextMap[state] || 'Order in Progress...';
  }

  renderMessages(messages = []) {
    const messagesEl = this.shadowRoot.getElementById('messages');
    if (messagesEl) {
      if (messages.length === 0) {
        messagesEl.innerHTML = '<div style="color: rgba(245, 245, 245, 0.5); text-align: center; padding: 1rem; font-style: italic;">No messages yet... Try ordering some coffee!</div>';
      } else {
        messagesEl.innerHTML = messages
          .map(({ timestamp, message, type }) => `
            <div class="message">
              <span class="message-time">${timestamp}</span>
              <span class="message-text">${message}</span>
            </div>
          `)
          .join('');
      }
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  handleOrder() {
    // Only allow ordering if UI is in idle state
    if (this.currentUIState !== 'idle') {
      return;
    }

    // Send ORDER event to customer actor to start the flow
    const customerActor = this.orchestrator.getSnapshot().context.customerActor;
    if (customerActor) {
      customerActor.send({ type: 'ORDER' });
    }
  }

  handleReset() {
    // For robust mid-demo reset, completely restart the orchestrator
    // This ensures all timers, subscriptions, and state are properly cleared

    // Clean up existing subscriptions and orchestrator
    this.orchestrator?.stop();
    this.messageLogSubscription?.unsubscribe();
    this.uiStateSubscription?.unsubscribe();

    // Reset all local state
    this.messageLogSubscription = null;
    this.uiStateSubscription = null;
    this.currentUIState = 'idle';
    this.actorsInitialized = false;

    // Clear the message display immediately
    this.renderMessages([]);

    // Update button to show reset state
    this.updateOrderButton();

    // Reinitialize everything
    this.initializeOrchestrator();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          padding: 3rem 0;
          background: linear-gradient(
            135deg,
            rgba(15, 17, 21, 0.95) 0%,
            rgba(18, 22, 32, 0.95) 100%
          );
          position: relative;
          overflow: hidden;
        }
        
        :host::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(1px 1px at 30px 40px, rgba(13, 153, 255, 0.08) 50%, transparent 100%),
            radial-gradient(1.5px 1.5px at 60px 80px, rgba(13, 153, 255, 0.06) 50%, transparent 100%),
            radial-gradient(1px 1px at 90px 20px, rgba(13, 153, 255, 0.08) 50%, transparent 100%);
          background-size: 140px 140px;
          opacity: 0.4;
          animation: gentle-float 25s ease-in-out infinite alternate;
        }
        
        @keyframes gentle-float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-8px, 5px); }
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          position: relative;
          z-index: 1;
        }
        
        @media (min-width: 768px) {
          .container {
            padding: 0 2rem;
          }
        }
        
        .demo-container {
          background: linear-gradient(
            135deg,
            rgba(13, 153, 255, 0.06) 0%,
            rgba(13, 153, 255, 0.02) 100%
          );
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 16px;
          padding: 2.5rem;
          backdrop-filter: blur(15px);
          box-shadow: 0 12px 48px rgba(13, 153, 255, 0.1);
          position: relative;
          overflow: hidden;
        }
        
        .demo-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--jasper), transparent);
          opacity: 0.4;
        }
        
        @media (min-width: 768px) {
          .demo-container {
            padding: 3.5rem;
          }
        }
        
        .demo-title {
          font-size: 2rem;
          color: var(--heading-color, #FFFFFF);
          text-align: center;
          margin: 0 0 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        @media (min-width: 768px) {
          .demo-title {
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
          }
        }
        
        .demo-description {
          color: var(--teagreen, #F5F5F5);
          text-align: center;
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 3rem;
          opacity: 0.9;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }
        
        @media (min-width: 768px) {
          .demo-description {
            font-size: 1.2rem;
            margin-bottom: 3.5rem;
          }
        }
        
        .actors-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        
        @media (min-width: 768px) {
          .actors-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            margin-bottom: 3rem;
          }
        }
        
        .controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2.5rem;
        }
        
        @media (min-width: 480px) {
          .controls {
            flex-direction: row;
            gap: 1.5rem;
          }
        }
        
        .demo-button {
          padding: 0.875rem 1.5rem;
          background: linear-gradient(45deg, var(--jasper, #0D99FF) 0%, var(--jasper-light, #47B4FF) 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: var(--primary-font);
          position: relative;
          overflow: hidden;
          flex: 1;
        }
        
        .demo-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s ease;
        }
        
        .demo-button:hover {
          background: linear-gradient(45deg, var(--jasper-light, #47B4FF) 0%, var(--jasper, #0D99FF) 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(13, 153, 255, 0.4);
        }
        
        .demo-button:hover::before {
          left: 100%;
        }
        
        .demo-button:disabled,
        .demo-button.disabled {
          background: linear-gradient(45deg, rgba(107, 114, 128, 0.8) 0%, rgba(156, 163, 175, 0.8) 100%);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
          opacity: 0.6;
        }
        
        .demo-button:disabled:hover,
        .demo-button.disabled:hover {
          background: linear-gradient(45deg, rgba(107, 114, 128, 0.8) 0%, rgba(156, 163, 175, 0.8) 100%);
          transform: none;
          box-shadow: none;
        }
        
        .demo-button:disabled::before,
        .demo-button.disabled::before {
          display: none;
        }
        
        .stats-container {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-bottom: 2.5rem;
        }
        
        .stat-item {
          text-align: center;
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(13, 153, 255, 0.2);
          min-width: 120px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        
        .stat-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--jasper), transparent);
          opacity: 0.4;
        }
        
        .stat-item:hover {
          border-color: rgba(13, 153, 255, 0.4);
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.08) 0%, rgba(13, 153, 255, 0.04) 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(13, 153, 255, 0.15);
        }
        
        .stat-item:hover::before {
          opacity: 0.6;
        }
        
        .stat-value {
          font-size: 2.5rem;
          color: var(--jasper, #0D99FF);
          font-weight: 700;
          margin: 0;
          text-shadow: 0 0 10px rgba(13, 153, 255, 0.3);
        }
        
        .stat-label {
          color: var(--teagreen, #F5F5F5);
          font-size: 0.9rem;
          margin: 0.5rem 0 0;
          opacity: 0.8;
        }
        
        .message-log-container {
          background: linear-gradient(
            135deg,
            rgba(13, 153, 255, 0.06) 0%,
            rgba(13, 153, 255, 0.02) 100%
          );
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        
        .message-log-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--jasper), transparent);
          opacity: 0.4;
        }
        
        .message-log-title {
          color: var(--jasper, #0D99FF);
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .message-log-content {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(13, 153, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          max-height: 200px;
          overflow-y: auto;
          min-height: 100px;
        }
        
        .message {
          color: var(--teagreen, #F5F5F5);
          padding: 0.5rem 0;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(13, 153, 255, 0.1);
          line-height: 1.4;
        }
        
        .message:last-child {
          border-bottom: none;
        }
        
        .message-time {
          color: rgba(13, 153, 255, 0.7);
          font-size: 0.8rem;
          margin-right: 0.5rem;
        }
        
        @media (max-width: 480px) {
          :host {
            padding: 2rem 0;
          }
          
          .demo-container {
            padding: 1.5rem;
          }
          
          .demo-title {
            font-size: 1.75rem;
          }
          
          .demo-description {
            font-size: 1rem;
            margin-bottom: 2rem;
          }
          
          .stats-container {
            gap: 1.5rem;
          }
          
          .stat-item {
            padding: 1rem;
            min-width: 100px;
          }
          
          .stat-value {
            font-size: 2rem;
          }
        }
      </style>
      
      <div class="container">
        <div class="demo-container">
          <h2 class="demo-title">☕ Actor-Based Coffee Shop Demo</h2>
          <p class="demo-description">
            Each UI component manages its own actor, coordinated by an orchestrator - with a dedicated message log actor for observability!
          </p>

          <div class="actors-grid">
            <customer-actor-ui></customer-actor-ui>
            <cashier-actor-ui></cashier-actor-ui>
            <barista-actor-ui></barista-actor-ui>
          </div>

          <div class="controls">
            <button class="demo-button" id="order-button">Customer Orders Coffee</button>
            <button class="demo-button" id="reset-button">Reset Demo</button>
          </div>

          <div class="stats-container">
            <div class="stat-item">
              <div class="stat-value" id="orders-completed">0</div>
              <div class="stat-label">Orders Completed</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" id="queue-size">0</div>
              <div class="stat-label">Orders in Queue</div>
            </div>
          </div>

          <div class="message-log-container">
            <div class="message-log-title">📨 Message Log (Actor)</div>
            <div class="message-log-content" id="messages"></div>
          </div>
        </div>
      </div>
    `;

    // Attach event listeners
    this.shadowRoot.getElementById('order-button')
      ?.addEventListener('click', () => this.handleOrder());

    this.shadowRoot.getElementById('reset-button')
      ?.addEventListener('click', () => this.handleReset());

    // Set initial button state
    this.updateOrderButton();
  }
}

customElements.define('coffee-shop-app-clean', CoffeeShopAppClean);
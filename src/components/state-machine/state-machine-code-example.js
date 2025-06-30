import '../ui/syntax-highlighter-with-themes.js';

class StateMachineCodeExample extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // Calculate the base path using import.meta.url
    const componentPath = new URL(import.meta.url).pathname;
    const basePath = componentPath.substring(0, componentPath.indexOf('/src/'));
    const styleHref = `${basePath}/src/styles/state-machine-education.css`;
    
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${styleHref}">
      
      <div class="container">
        <div class="concept-section">
          <h3 class="concept-title">💻 Scaling Up: The Actor Model</h3>
          <p class="concept-description">
            Now that you understand state machines, let's see how to orchestrate multiple actors for complex apps. 
            Each actor runs independently, communicating only through messages:
          </p>
          <syntax-highlighter-with-themes language="javascript">
// Now with multiple actors coordinating through an orchestrator!
export const coffeeShopOrchestrator = setup({
  actors: {
    customer: customerMachine,  // We already know how this works
    cashier: cashierMachine,    // Each actor has its own logic
    barista: baristaMachine,    // No shared state!
    messageLog: messageLogMachine
  },
  actions: {
    announceToShop: ({ context, event }) => {
      // Announce what's happening so everyone knows!
      if (event.message && context.messageLogActor) {
        context.messageLogActor.send({ 
          type: 'LOG_MESSAGE', 
          message: event.message 
        });
      }
    }
  }
}).createMachine({
  entry: assign({
    // Spawn all actors when shop opens
    customerActor: ({ spawn }) => spawn('customer', { id: 'customer' }),
    cashierActor: ({ spawn }) => spawn('cashier', { id: 'cashier' }),
    baristaActor: ({ spawn }) => spawn('barista', { id: 'barista' }),
    messageLogActor: ({ spawn }) => spawn('messageLog', { id: 'messageLog' })
  }),
  on: {
    // Actors communicate through the orchestrator
    'customer.WANTS_TO_ORDER': {
      actions: [
        'announceToShop',
        sendTo(({ context }) => context.cashierActor, { type: 'TAKE_ORDER' })
      ]
    }
    // ... more event routing
  }
});
          </syntax-highlighter-with-themes>
          <p class="concept-description" style="margin-top: 20px;">
            <strong>Why Actor Model?</strong> Each actor is completely isolated, managing its own state and lifecycle. 
            They communicate only through events, making the system modular, testable, and scalable. 
            No shared state, no race conditions, just clean actor-to-actor communication.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="#projects" class="action-button">
              See Real World Examples →
            </a>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('state-machine-code-example', StateMachineCodeExample);
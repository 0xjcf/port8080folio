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
          <h3 class="concept-title">🎯 Step 1: Clean Actor-Based Architecture</h3>
          <p class="concept-description">
            Remember that chaotic useState mess? Here's how XState transforms it into clean, predictable state machines.
            Let's break this down into two parts: the state machine logic and how you use it in React.
          </p>
          
          <!-- State Machine Definition -->
          <div class="code-subsection" style="margin: 2rem 0;">
            <h4 style="color: var(--jasper); margin-bottom: 1rem;">Part A: Define Your State Machine</h4>
            <p style="color: var(--teagreen); margin-bottom: 1rem; line-height: 1.6;">
              First, you define the state logic. No more scattered useEffects - just clear states and transitions:
            </p>
            
            <syntax-highlighter-with-themes language="javascript">
// Define the customer state machine - pure logic, no UI
const customerMachine = createMachine({
  id: 'customer',
  initial: 'browsing',
  context: {
    coffeeReady: false
  },
  states: {
    browsing: {
      on: { 
        ORDER: {
          target: 'ordering',
          actions: sendParent({
            type: 'customer.WANTS_TO_ORDER',
            message: '☕ Customer: "I\'d like a cappuccino please!"'
          })
        }
      } 
    },
    ordering: { 
      on: { ORDER_CONFIRMED: 'paying' } 
    },
    paying: { 
      on: { PAYMENT_COMPLETE: 'waiting' } 
    },
    waiting: { 
      on: { RECEIVE_COFFEE: 'enjoying' } 
    },
    enjoying: {
      // Customer is happy! Maybe they'll order again?
      after: {
        5000: 'browsing' // Browse menu again after 5 seconds
      }
    }
  }
});
            </syntax-highlighter-with-themes>
          </div>
          
          <!-- React Component Usage -->
          <div class="code-subsection" style="margin: 2rem 0;">
            <h4 style="color: var(--jasper); margin-bottom: 1rem;">Part B: Use It in Your React Component</h4>
            <p style="color: var(--teagreen); margin-bottom: 1rem; line-height: 1.6;">
              Then you connect it to your UI with one simple hook. The state machine handles all the complexity:
            </p>
            
            <syntax-highlighter-with-themes language="jsx">
// Your React component - clean and declarative!
const CoffeeShopUI = () => {
  const [state, send] = useMachine(customerMachine);
  
  return (
    &lt;div&gt;
      &lt;h2&gt;Customer: {state.value}&lt;/h2&gt;
      
      {state.matches('browsing') && (
        &lt;button onClick={() => send('ORDER')}&gt;
          Order Coffee ☕
        &lt;/button&gt;
      )}
      
      {state.matches('ordering') && (
        &lt;button onClick={() => send('ORDER_CONFIRMED')}&gt;
          Confirm Order ✓
        &lt;/button&gt;
      )}
      
      {state.matches('paying') && (
        &lt;button onClick={() => send('PAYMENT_COMPLETE')}&gt;
          Complete Payment 💳
        &lt;/button&gt;
      )}
      
      {state.matches('waiting') && (
        &lt;div&gt;
          &lt;p&gt;Waiting for coffee...&lt;/p&gt;
          &lt;button onClick={() => send('RECEIVE_COFFEE')}&gt;
            Receive Coffee ☕
          &lt;/button&gt;
        &lt;/div&gt;
      )}
      
      {state.matches('enjoying') && (
        &lt;p&gt;☕ Enjoying coffee! (Will browse again soon...)&lt;/p&gt;
      )}
    &lt;/div&gt;
  );
};
            </syntax-highlighter-with-themes>
          </div>
          
          <p class="concept-description" style="margin-top: 20px;">
            <strong>Notice the difference:</strong> No more race conditions, no complex useEffects, no impossible states. 
            The state machine defines the logic, and your React component just renders the current state.
          </p>
        </div>
        
        <div class="concept-section" style="margin-top: 3rem;">
          <h3 class="concept-title">🚀 Step 2: Scaling Up with Orchestration</h3>
          <p class="concept-description">
            For complex apps with multiple features, you coordinate actors through an orchestrator. 
            Each actor stays focused on its own domain:
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
        </div>
        
        <!-- Implementation summary -->
        <div style="text-align: center; margin-top: 3rem; padding: 2rem; background: linear-gradient(135deg, rgba(13, 153, 255, 0.1), rgba(15, 17, 21, 0.9)); border-radius: 12px; border: 1px solid rgba(13, 153, 255, 0.3);">
          <h4 style="color: var(--jasper); margin-bottom: 1rem;">🎉 From Chaos to Clean Architecture</h4>
          <p style="color: var(--teagreen); font-size: 1.1rem; margin-bottom: 1rem;">
            You've seen the transformation: useState chaos → visual state machines → clean XState implementation
          </p>
          <p style="color: rgba(255, 255, 255, 0.7); font-style: italic;">
            But what are the real-world results? Let's look at the numbers...
          </p>
        </div>
      </div>
    `;
  }
}

customElements.define('state-machine-code-example', StateMachineCodeExample);
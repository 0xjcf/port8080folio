import '../ui/syntax-highlighter-with-themes.js';

class ActorCoffeeShopCode extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <syntax-highlighter-with-themes language="jsx">
// The actor-based approach - clean and simple!
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
            message: '☕ Customer: "I\\'d like a cappuccino please!"'
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

// In your React component - clean and simple!
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
    `;
  }
}

customElements.define('actor-coffee-shop-code', ActorCoffeeShopCode);
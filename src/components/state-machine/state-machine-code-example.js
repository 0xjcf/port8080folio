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
    coffeeReady: false,
    orderDetails: null,
    orderCount: 0
  },
  states: {
    browsing: {
      on: { 
        ORDER: {
          target: 'ordering',
          actions: [
            assign({
              orderDetails: (context, event) => event.order
            }),
            sendParent({
              type: 'customer.WANTS_TO_ORDER',
              message: '☕ Customer: "I\'d like a cappuccino please!"'
            })
          ]
        }
      } 
    },
    ordering: { 
      on: { 
        ORDER_CONFIRMED: {
          target: 'paying',
          actions: 'notifyOrderConfirmed'
        },
        CANCEL_ORDER: {
          target: 'browsing',
          actions: assign({ orderDetails: null })
        }
      } 
    },
    paying: { 
      invoke: {
        id: 'processPayment',
        src: 'paymentService',
        onDone: {
          target: 'waiting',
          actions: [
            'logPaymentSuccess',
            assign({ orderCount: (context) => context.orderCount + 1 })
          ]
        },
        onError: {
          target: 'paymentFailed',
          actions: 'logPaymentError'
        }
      }
    },
    paymentFailed: {
      on: {
        RETRY_PAYMENT: 'paying',
        CANCEL_ORDER: {
          target: 'browsing',
          actions: assign({ orderDetails: null })
        }
      }
    },
    waiting: { 
      on: { 
        RECEIVE_COFFEE: {
          target: 'enjoying',
          cond: 'coffeeIsReady',
          actions: assign({ coffeeReady: true })
        }
      },
      after: {
        30000: {
          target: 'checkingStatus',
          actions: 'notifyLongWait'
        }
      }
    },
    checkingStatus: {
      entry: 'askAboutOrder',
      on: {
        COFFEE_COMING: 'waiting',
        RECEIVE_COFFEE: 'enjoying'
      }
    },
    enjoying: {
      entry: 'celebrateCoffee',
      after: {
        5000: 'browsing' // Browse menu again after 5 seconds
      }
    }
  }
}, {
  actions: {
    notifyOrderConfirmed: () => console.log('Order confirmed!'),
    logPaymentSuccess: () => console.log('Payment successful'),
    logPaymentError: (context, event) => console.error('Payment failed:', event.data),
    notifyLongWait: () => console.log('This is taking a while...'),
    askAboutOrder: () => console.log('Checking on your order...'),
    celebrateCoffee: () => console.log('☕ Enjoying that coffee!')
  },
  services: {
    paymentService: (context) => 
      // Simulate payment processing
      new Promise((resolve, reject) => {
        setTimeout(() => {
          Math.random() > 0.1 ? resolve() : reject('Card declined')
        }, 2000)
      })
  },
  guards: {
    coffeeIsReady: (context) => context.coffeeReady
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
  const { orderDetails, orderCount } = state.context;
  
  return (
    &lt;div className="coffee-shop"&gt;
      &lt;h2&gt;Customer Status: {state.value}&lt;/h2&gt;
      {orderCount > 0 && &lt;p&gt;Orders today: {orderCount}&lt;/p&gt;}
      
      {state.matches('browsing') && (
        &lt;button onClick={() => send({ 
          type: 'ORDER',
          order: { type: 'cappuccino', size: 'large' }
        })}&gt;
          Order Coffee ☕
        &lt;/button&gt;
      )}
      
      {state.matches('ordering') && (
        &lt;div&gt;
          &lt;p&gt;Confirming your {orderDetails?.type}...&lt;/p&gt;
          &lt;button onClick={() => send('ORDER_CONFIRMED')}&gt;
            Confirm Order ✓
          &lt;/button&gt;
          &lt;button onClick={() => send('CANCEL_ORDER')}&gt;
            Cancel ✗
          &lt;/button&gt;
        &lt;/div&gt;
      )}
      
      {state.matches('paying') && (
        &lt;div className="payment-processing"&gt;
          &lt;span className="spinner" /&gt;
          Processing payment...
        &lt;/div&gt;
      )}
      
      {state.matches('paymentFailed') && (
        &lt;div className="error"&gt;
          &lt;p&gt;Payment failed! 😞&lt;/p&gt;
          &lt;button onClick={() => send('RETRY_PAYMENT')}&gt;
            Retry Payment 💳
          &lt;/button&gt;
          &lt;button onClick={() => send('CANCEL_ORDER')}&gt;
            Cancel Order
          &lt;/button&gt;
        &lt;/div&gt;
      )}
      
      {state.matches('waiting') && (
        &lt;div&gt;
          &lt;p&gt;Waiting for coffee...&lt;/p&gt;
          &lt;button 
            onClick={() => send('RECEIVE_COFFEE')}
            disabled={!state.context.coffeeReady}
          &gt;
            {state.context.coffeeReady ? 'Receive Coffee ☕' : 'Coffee not ready yet...'}
          &lt;/button&gt;
        &lt;/div&gt;
      )}
      
      {state.matches('checkingStatus') && (
        &lt;div&gt;
          &lt;p&gt;Let me check on that order for you...&lt;/p&gt;
          &lt;button onClick={() => send('COFFEE_COMING')}&gt;
            It's coming!
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
// The orchestrator coordinates multiple actors
export const coffeeShopOrchestrator = createMachine({
  id: 'coffeeShop',
  context: {
    customerActor: null,
    cashierActor: null,
    baristaActor: null,
    messageLogActor: null,
    shopStatus: 'closed'
  },
  initial: 'closed',
  states: {
    closed: {
      on: {
        OPEN_SHOP: {
          target: 'open',
          actions: assign({
            shopStatus: 'open',
            customerActor: ({ spawn }) => spawn(customerMachine, { id: 'customer' }),
            cashierActor: ({ spawn }) => spawn(cashierMachine, { id: 'cashier' }),
            baristaActor: ({ spawn }) => spawn(baristaMachine, { id: 'barista' }),
            messageLogActor: ({ spawn }) => spawn(messageLogMachine, { id: 'messageLog' })
          })
        }
      }
    },
    open: {
      on: {
        // Customer → Cashier communication
        'customer.WANTS_TO_ORDER': {
          actions: [
            (context, event) => {
              context.messageLogActor.send({ 
                type: 'LOG_MESSAGE', 
                message: event.message,
                timestamp: Date.now()
              });
              context.cashierActor.send({ 
                type: 'TAKE_ORDER',
                order: event.order 
              });
            }
          ]
        },
        
        // Cashier → Barista communication
        'cashier.ORDER_PLACED': {
          actions: [
            (context, event) => {
              context.baristaActor.send({ 
                type: 'MAKE_COFFEE',
                order: event.order 
              });
            }
          ]
        },
        
        // Barista → Customer communication
        'barista.COFFEE_READY': {
          actions: [
            (context, event) => {
              context.customerActor.send({ 
                type: 'COFFEE_READY',
                coffee: event.coffee 
              });
              context.messageLogActor.send({ 
                type: 'LOG_MESSAGE', 
                message: '☕ Coffee is ready!',
                timestamp: Date.now()
              });
            }
          ]
        },
        
        CLOSE_SHOP: {
          target: 'closing',
          actions: [
            // Stop all actors gracefully
            (context) => {
              context.customerActor?.stop();
              context.cashierActor?.stop();
              context.baristaActor?.stop();
              context.messageLogActor?.stop();
            }
          ]
        }
      }
    },
    closing: {
      after: {
        1000: 'closed'
      }
    }
  }
});

// Example of a barista actor with parallel states
const baristaMachine = createMachine({
  id: 'barista',
  type: 'parallel',
  states: {
    workStatus: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            MAKE_COFFEE: 'makingCoffee'
          }
        },
        makingCoffee: {
          invoke: {
            src: 'brewCoffee',
            onDone: {
              target: 'idle',
              actions: sendParent((context, event) => ({
                type: 'barista.COFFEE_READY',
                coffee: event.data
              }))
            }
          }
        }
      }
    },
    equipment: {
      initial: 'ready',
      states: {
        ready: {
          on: {
            EQUIPMENT_MALFUNCTION: 'maintenance'
          }
        },
        maintenance: {
          after: {
            10000: 'ready'
          }
        }
      }
    }
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
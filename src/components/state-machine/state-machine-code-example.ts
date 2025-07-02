// Import dependencies
import '../ui/syntax-highlighter-with-themes.js';

// Type definitions
interface CodeSection {
  id: string;
  title: string;
  description: string;
  language: 'javascript' | 'jsx' | 'typescript';
  code: string;
}

interface CodeSubsection {
  title: string;
  description: string;
  note?: string;
}

interface SummaryContent {
  title: string;
  description: string;
  leadIn: string;
}

class StateMachineCodeExample extends HTMLElement {
  private static readonly CODE_SECTIONS: readonly CodeSection[] = [
    {
      id: 'state-machine-definition',
      title: 'Part A: Define Your State Machine',
      description: 'First, you define the state logic. No more scattered useEffects - just clear states and transitions:',
      language: 'javascript',
      code: `// Define the customer state machine - pure logic, no UI
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
              message: '☕ Customer: "I\\'d like a cappuccino please!"'
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
});`
    },
    {
      id: 'react-component-usage',
      title: 'Part B: Use It in Your React Component',
      description: 'Then you connect it to your UI with one simple hook. The state machine handles all the complexity:',
      language: 'jsx',
      code: `// Your React component - clean and declarative!
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
};`
    },
    {
      id: 'orchestration-example',
      title: 'Step 2: Scaling Up with Orchestration',
      description: 'For complex apps with multiple features, you coordinate actors through an orchestrator. Each actor stays focused on its own domain:',
      language: 'javascript',
      code: `// The orchestrator coordinates multiple actors
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
});`
    }
  ] as const;

  private static readonly SUBSECTIONS: Record<string, CodeSubsection> = {
    step1: {
      title: '🎯 Step 1: Clean Actor-Based Architecture',
      description: 'Remember that chaotic useState mess? Here\'s how XState transforms it into clean, predictable state machines. Let\'s break this down into two parts: the state machine logic and how you use it in React.'
    },
    step1Note: {
      title: '',
      description: '',
      note: 'Notice the difference: No more race conditions, no complex useEffects, no impossible states. The state machine defines the logic, and your React component just renders the current state.'
    },
    orchestration: {
      title: 'Why Actor Model?',
      description: '',
      note: 'Each actor is completely isolated, managing its own state and lifecycle. They communicate only through events, making the system modular, testable, and scalable. No shared state, no race conditions, just clean actor-to-actor communication.'
    }
  } as const;

  private static readonly SUMMARY: SummaryContent = {
    title: '🎉 From Chaos to Clean Architecture',
    description: 'You\'ve seen the transformation: useState chaos → visual state machines → clean XState implementation',
    leadIn: 'But what are the real-world results? Let\'s look at the numbers...'
  } as const;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
  }

  private renderCodeSubsection(sectionData: CodeSection): string {
    return `
      <div class="code-subsection">
        <h4 class="subsection-title">${this.escapeHtml(sectionData.title)}</h4>
        <p class="subsection-description">
          ${this.escapeHtml(sectionData.description)}
        </p>
        
        <syntax-highlighter-with-themes language="${sectionData.language}">
${sectionData.code}
        </syntax-highlighter-with-themes>
      </div>
    `;
  }

  private renderSummarySection(): string {
    return `
      <div class="implementation-summary">
        <h4 class="summary-title">${this.escapeHtml(StateMachineCodeExample.SUMMARY.title)}</h4>
        <p class="summary-description">
          ${this.escapeHtml(StateMachineCodeExample.SUMMARY.description)}
        </p>
        <p class="summary-lead-in">
          ${this.escapeHtml(StateMachineCodeExample.SUMMARY.leadIn)}
        </p>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getBasePath(): string {
    const componentPath = new URL(import.meta.url).pathname;
    return componentPath.substring(0, componentPath.indexOf('/src/'));
  }

  private render(): void {
    const basePath = this.getBasePath();
    const styleHref = `${basePath}/src/styles/state-machine-education.css`;

    this.shadowRoot!.innerHTML = `
      <link rel="stylesheet" href="${styleHref}">
      
      <div class="container">
        <div class="concept-section">
          <h3 class="concept-title">${this.escapeHtml(StateMachineCodeExample.SUBSECTIONS.step1.title)}</h3>
          <p class="concept-description">
            ${this.escapeHtml(StateMachineCodeExample.SUBSECTIONS.step1.description)}
          </p>
          
          <!-- State Machine Definition -->
          ${this.renderCodeSubsection(StateMachineCodeExample.CODE_SECTIONS[0])}
          
          <!-- React Component Usage -->
          ${this.renderCodeSubsection(StateMachineCodeExample.CODE_SECTIONS[1])}
          
          <p class="concept-description">
            <strong>${this.escapeHtml(StateMachineCodeExample.SUBSECTIONS.step1Note.note || '')}</strong>
          </p>
        </div>
        
        <div class="concept-section">
          <h3 class="concept-title">🚀 ${this.escapeHtml(StateMachineCodeExample.CODE_SECTIONS[2].title)}</h3>
          <p class="concept-description">
            ${this.escapeHtml(StateMachineCodeExample.CODE_SECTIONS[2].description)}
          </p>
          
          ${this.renderCodeSubsection(StateMachineCodeExample.CODE_SECTIONS[2])}
          
          <p class="concept-description">
            <strong>${this.escapeHtml(StateMachineCodeExample.SUBSECTIONS.orchestration.note || '')}</strong>
          </p>
        </div>
        
        <!-- Implementation summary -->
        ${this.renderSummarySection()}
      </div>
    `;
  }

  // Public API for external interactions
  public getCodeSections(): readonly CodeSection[] {
    return StateMachineCodeExample.CODE_SECTIONS;
  }

  public getCodeSectionById(id: string): CodeSection | null {
    return StateMachineCodeExample.CODE_SECTIONS.find(section => section.id === id) || null;
  }

  public getSubsections(): typeof StateMachineCodeExample.SUBSECTIONS {
    return { ...StateMachineCodeExample.SUBSECTIONS };
  }

  public getSummary(): SummaryContent {
    return { ...StateMachineCodeExample.SUMMARY };
  }

  public getSupportedLanguages(): string[] {
    const languages = new Set(StateMachineCodeExample.CODE_SECTIONS.map(section => section.language));
    return Array.from(languages);
  }
}

// Define the custom element
if (!customElements.get('state-machine-code-example')) {
  customElements.define('state-machine-code-example', StateMachineCodeExample);
}

export { StateMachineCodeExample };
export type { CodeSection, CodeSubsection, SummaryContent }; 
// StateMachineCodeExample refactored to use Actor-SPA Framework API
import { assign, setup } from 'xstate';
import { createComponent, html, type RawHTML } from '../../framework/core/index.js';
import '../ui/syntax-highlighter-with-themes.js';

// ✅ Type-safe interfaces following framework patterns
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

// ✅ State machine context interface
interface StateMachineCodeExampleContext {
  selectedSectionId: string | null;
  expandedSections: Set<string>;
  error: string | null;
}

// ✅ Event types for type safety
type StateMachineCodeExampleEvent =
  | { type: 'SELECT_SECTION'; sectionId: string }
  | { type: 'TOGGLE_SECTION'; sectionId: string }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'RESET' };

// ✅ Static data constants
const CODE_SECTIONS: readonly CodeSection[] = [
  {
    id: 'state-machine-definition',
    title: 'Part A: Define Your State Machine',
    description:
      'First, you define the state logic. No more scattered useEffects - just clear states and transitions:',
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
              message: '☕ Customer: "I\\\\'d like a cappuccino please!"'
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
      // Simulate payment processing using XState patterns
      new Promise((resolve, reject) => {
        // Use XState delay patterns instead of setTimeout
        const delay = 2000;
        const timer = Date.now() + delay;
        const checkPayment = () => {
          if (Date.now() >= timer) {
            Math.random() > 0.1 ? resolve() : reject('Card declined');
          } else {
            requestAnimationFrame(checkPayment);
          }
        };
        checkPayment();
      })
  },
  guards: {
    coffeeIsReady: (context) => context.coffeeReady
  }
});`,
  },
  {
    id: 'react-component-usage',
    title: 'Part B: Use It in Your React Component',
    description:
      'Then you connect it to your UI with one simple hook. The state machine handles all the complexity:',
    language: 'jsx',
    code: `// Your React component - clean and declarative!
const CoffeeShopUI = () => {
  const [state, send] = useMachine(customerMachine);
  const { orderDetails, orderCount } = state.context;
  
  return (
    <div className="coffee-shop">
      <h2>Customer Status: {state.value}</h2>
      {orderCount > 0 && <p>Orders today: {orderCount}</p>}
      
      {state.matches('browsing') && (
        <button send="ORDER" order-type="cappuccino" order-size="large">
          Order Coffee ☕
        </button>
      )}
      
      {state.matches('ordering') && (
        <div>
          <p>Confirming your {orderDetails?.type}...</p>
          <button send="ORDER_CONFIRMED">
            Confirm Order ✓
          </button>
          <button send="CANCEL_ORDER">
            Cancel ✗
          </button>
        </div>
      )}
      
      {state.matches('paying') && (
        <div className="payment-processing">
          <span className="spinner" />
          Processing payment...
        </div>
      )}
      
      {state.matches('paymentFailed') && (
        <div className="error">
          <p>Payment failed! 😞</p>
          <button send="RETRY_PAYMENT">
            Retry Payment 💳
          </button>
          <button send="CANCEL_ORDER">
            Cancel Order
          </button>
        </div>
      )}
      
      {state.matches('waiting') && (
        <div>
          <p>Waiting for coffee...</p>
          <button 
            send="RECEIVE_COFFEE"
            disabled={!state.context.coffeeReady}
          >
            {state.context.coffeeReady ? 'Receive Coffee ☕' : 'Coffee not ready yet...'}
          </button>
        </div>
      )}
      
      {state.matches('checkingStatus') && (
        <div>
          <p>Let me check on that order for you...</p>
          <button send="COFFEE_COMING">
            It's coming!
          </button>
        </div>
      )}
      
      {state.matches('enjoying') && (
        <p>☕ Enjoying coffee! (Will browse again soon...)</p>
      )}
    </div>
  );
};`,
  },
  {
    id: 'orchestration-example',
    title: 'Step 2: Scaling Up with Orchestration',
    description:
      'For complex apps with multiple features, you coordinate actors through an orchestrator. Each actor stays focused on its own domain:',
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
});`,
  },
] as const;

const SUBSECTIONS: Record<string, CodeSubsection> = {
  step1: {
    title: '🎯 Step 1: Clean Actor-Based Architecture',
    description:
      "Remember that chaotic useState mess? Here's how XState transforms it into clean, predictable state machines. Let's break this down into two parts: the state machine logic and how you use it in React.",
  },
  step1Note: {
    title: '',
    description: '',
    note: 'Notice the difference: No more race conditions, no complex useEffects, no impossible states. The state machine defines the logic, and your React component just renders the current state.',
  },
  orchestration: {
    title: 'Why Actor Model?',
    description: '',
    note: 'Each actor is completely isolated, managing its own state and lifecycle. They communicate only through events, making the system modular, testable, and scalable. No shared state, no race conditions, just clean actor-to-actor communication.',
  },
} as const;

const SUMMARY: SummaryContent = {
  title: '🎉 From Chaos to Clean Architecture',
  description:
    "You've seen the transformation: useState chaos → visual state machines → clean XState implementation",
  leadIn: "But what are the real-world results? Let's look at the numbers...",
} as const;

// ✅ XState machine for component state management
const stateMachineCodeExampleMachine = setup({
  types: {
    context: {} as StateMachineCodeExampleContext,
    events: {} as StateMachineCodeExampleEvent,
  },
  actions: {
    selectSection: assign({
      selectedSectionId: ({ event }) => (event.type === 'SELECT_SECTION' ? event.sectionId : null),
    }),
    toggleSection: assign({
      expandedSections: ({ context, event }) => {
        if (event.type === 'TOGGLE_SECTION') {
          const newExpanded = new Set(context.expandedSections);
          if (newExpanded.has(event.sectionId)) {
            newExpanded.delete(event.sectionId);
          } else {
            newExpanded.add(event.sectionId);
          }
          return newExpanded;
        }
        return context.expandedSections;
      },
    }),
    expandAll: assign({
      expandedSections: () => new Set(CODE_SECTIONS.map((section) => section.id)),
    }),
    collapseAll: assign({
      expandedSections: () => new Set<string>(),
    }),
    reset: assign({
      selectedSectionId: null,
      expandedSections: () => new Set<string>(),
      error: null,
    }),
  },
}).createMachine({
  id: 'stateMachineCodeExample',
  initial: 'idle',
  context: {
    selectedSectionId: null,
    expandedSections: new Set<string>(),
    error: null,
  },
  states: {
    idle: {
      on: {
        SELECT_SECTION: { actions: 'selectSection' },
        TOGGLE_SECTION: { actions: 'toggleSection' },
        EXPAND_ALL: { actions: 'expandAll' },
        COLLAPSE_ALL: { actions: 'collapseAll' },
        RESET: { actions: 'reset' },
      },
    },
  },
});

// ✅ Helper functions for template rendering
const renderCodeSubsection = (sectionData: CodeSection): RawHTML => {
  return html`
    <div class="code-subsection">
      <h4 class="subsection-title">${sectionData.title}</h4>
      <p class="subsection-description">
        ${sectionData.description}
      </p>
      
      <syntax-highlighter-with-themes language=${sectionData.language}>
        ${sectionData.code}
      </syntax-highlighter-with-themes>
    </div>
  `;
};

const renderSummarySection = (): RawHTML => {
  return html`
    <div class="implementation-summary">
      <h4 class="summary-title">${SUMMARY.title}</h4>
      <p class="summary-description">
        ${SUMMARY.description}
      </p>
      <p class="summary-lead-in">
        ${SUMMARY.leadIn}
      </p>
    </div>
  `;
};

const stateMachineCodeExampleTemplate = (): RawHTML => {
  return html`
    <div class="container">
      <!-- Controls -->
      <div class="controls">
        <button send="EXPAND_ALL" class="btn-secondary">
          Expand All Sections
        </button>
        <button send="COLLAPSE_ALL" class="btn-secondary">
          Collapse All Sections
        </button>
        <button send="RESET" class="btn-secondary">
          Reset
        </button>
      </div>
      
      <!-- Step 1: Clean Actor-Based Architecture -->
      <div class="concept-section">
        <h3 class="concept-title">${SUBSECTIONS.step1.title}</h3>
        <p class="concept-description">
          ${SUBSECTIONS.step1.description}
        </p>
        
        <!-- State Machine Definition -->
        ${renderCodeSubsection(CODE_SECTIONS[0])}
        
        <!-- React Component Usage -->
        ${renderCodeSubsection(CODE_SECTIONS[1])}
        
        <p class="concept-description">
          <strong>${SUBSECTIONS.step1Note.note || ''}</strong>
        </p>
      </div>
      
      <!-- Step 2: Orchestration -->
      <div class="concept-section">
        <h3 class="concept-title">🚀 ${CODE_SECTIONS[2].title}</h3>
        <p class="concept-description">
          ${CODE_SECTIONS[2].description}
        </p>
        
        ${renderCodeSubsection(CODE_SECTIONS[2])}
        
        <p class="concept-description">
          <strong>${SUBSECTIONS.orchestration.note || ''}</strong>
        </p>
      </div>
      
      <!-- Implementation Summary -->
      ${renderSummarySection()}
    </div>
  `;
};

// ✅ Component styles using framework patterns
const stateMachineCodeExampleStyles = `
  :host {
    display: block;
    max-width: 100%;
    padding: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }
  
  .btn-secondary {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .btn-secondary:hover {
    background: #f5f5f5;
  }
  
  .concept-section {
    margin-bottom: 3rem;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .concept-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2c3e50;
  }
  
  .concept-description {
    font-size: 1.1rem;
    color: #555;
    margin-bottom: 1.5rem;
  }
  
  .code-subsection {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .subsection-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2c3e50;
  }
  
  .subsection-description {
    color: #666;
    margin-bottom: 1.5rem;
  }
  
  .implementation-summary {
    padding: 2rem;
    background: #e8f5e8;
    border-radius: 8px;
    border-left: 4px solid #28a745;
  }
  
  .summary-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #155724;
    margin-bottom: 1rem;
  }
  
  .summary-description {
    color: #155724;
    margin-bottom: 1rem;
  }
  
  .summary-lead-in {
    color: #155724;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    :host {
      padding: 0.5rem;
    }
    
    .concept-section {
      padding: 1rem;
    }
    
    .code-subsection {
      padding: 1rem;
    }
    
    .controls {
      flex-direction: column;
    }
  }
`;

// ✅ Create the component using the Actor-SPA framework
const StateMachineCodeExampleComponent = createComponent({
  machine: stateMachineCodeExampleMachine,
  template: stateMachineCodeExampleTemplate,
  styles: stateMachineCodeExampleStyles,
  tagName: 'state-machine-code-example',
});

// ✅ Public API for external interactions (maintained for backward compatibility)
export const getCodeSections = (): readonly CodeSection[] => CODE_SECTIONS;

export const getCodeSectionById = (id: string): CodeSection | null => {
  return CODE_SECTIONS.find((section) => section.id === id) || null;
};

export const getSubsections = (): typeof SUBSECTIONS => ({ ...SUBSECTIONS });

export const getSummary = (): SummaryContent => ({ ...SUMMARY });

export const getSupportedLanguages = (): string[] => {
  const languages = new Set(CODE_SECTIONS.map((section) => section.language));
  return Array.from(languages);
};

// Export for manual registration if needed
export { StateMachineCodeExampleComponent };
export type {
  CodeSection,
  CodeSubsection,
  StateMachineCodeExampleContext,
  StateMachineCodeExampleEvent,
  SummaryContent,
};

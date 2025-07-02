// TypeScript interfaces for Customer State Machine
import { createMachine, sendParent, assign } from 'xstate';

interface CustomerContext {
  hasCompletedOrder: boolean;
}

type CustomerEvents =
  | { type: 'ORDER' }
  | { type: 'PAYMENT_REQUEST' }
  | { type: 'RECEIVE_COFFEE' }
  | { type: 'RESET' };

type CustomerStates =
  | 'browsing'
  | 'ordering'
  | 'paying'
  | 'waiting'
  | 'enjoying';

// Parent events that customer sends to coffee shop orchestrator
interface CustomerParentEvents {
  type: 'customer.SAYS_ORDER' | 'customer.WANTS_TO_ORDER' | 'customer.PAYING' | 'PAID' | 'customer.ORDER_CONFIRMED' | 'customer.COFFEE_RECEIVED' | 'customer.ENJOYING' | 'customer.BROWSING_AGAIN';
  message?: string;
}

export const customerMachine = createMachine({
  id: 'customer',
  initial: 'browsing' as CustomerStates,
  context: {
    hasCompletedOrder: false
  } as CustomerContext,
  
  states: {
    browsing: {
      on: {
        ORDER: {
          target: 'ordering',
          actions: [
            sendParent({
              type: 'customer.SAYS_ORDER',
              message: '🗣️ Customer → Cashier: "I\'d like a large cappuccino please!"'
            } as CustomerParentEvents),
            sendParent({
              type: 'customer.WANTS_TO_ORDER'
            } as CustomerParentEvents)
          ]
        },
        RESET: {
          target: 'browsing',
          actions: assign({ hasCompletedOrder: false })
        }
      }
    },
    
    ordering: {
      on: {
        PAYMENT_REQUEST: {
          target: 'paying'
        }
      }
    },
    
    paying: {
      after: {
        5000: { // 5 seconds to take out and hand over payment
          target: 'waiting',
          actions: [
            sendParent({
              type: 'customer.PAYING',
              message: '💵 Customer → Cashier: *Handing over payment*'
            } as CustomerParentEvents),
            sendParent({ type: 'PAID' } as CustomerParentEvents), // Trigger cashier payment flow
            sendParent({
              type: 'customer.ORDER_CONFIRMED',
              message: '⏳ Customer: *Waiting patiently for coffee*'
            } as CustomerParentEvents)
          ]
        }
      }
    },
    
    waiting: {
      on: {
        RECEIVE_COFFEE: {
          target: 'enjoying',
          actions: sendParent({
            type: 'customer.COFFEE_RECEIVED',
            message: '😌 Customer → Cashier: "This is exactly what I needed!"'
          } as CustomerParentEvents)
        }
      }
    },
    
    enjoying: {
      entry: sendParent({
        type: 'customer.ENJOYING',
        message: '☕ Customer: *Savoring the coffee*'
      } as CustomerParentEvents),
      
      after: {
        5000: { // 5 seconds to enjoy coffee
          target: 'browsing',
          actions: [
            assign({ hasCompletedOrder: true }),
            sendParent({
              type: 'customer.BROWSING_AGAIN',
              message: '👀 Customer: *Browsing menu again*'
            } as CustomerParentEvents)
          ]
        }
      },
      
      on: {
        ORDER: { // Customer can order again while enjoying
          target: 'ordering',
          actions: sendParent({
            type: 'customer.WANTS_TO_ORDER',
            message: '🗣️ Customer → Cashier: "Actually, I\'ll have another!"'
          } as CustomerParentEvents)
        }
      }
    }
  }
});

// Type exports for external usage
export type { CustomerContext, CustomerEvents, CustomerStates, CustomerParentEvents }; 
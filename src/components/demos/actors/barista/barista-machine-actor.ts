// TypeScript interfaces for Barista State Machine
import { createMachine, sendParent, assign } from 'xstate';

interface BaristaContext {
  hasCraftedCoffee: boolean;
}

type BaristaEvents =
  | { type: 'MAKE_COFFEE' }
  | { type: 'RESET' };

type BaristaStates =
  | 'idle'
  | 'receivingOrder'
  | 'grindingBeans'
  | 'brewing'
  | 'finishingCoffee'
  | 'coffeeReady';

// Parent events that barista sends to coffee shop orchestrator
interface BaristaParentEvents {
  type: 'barista.RECEIVED_ORDER' | 'barista.GRINDING_BEANS' | 'barista.BREWING' | 'barista.ADDING_TOUCHES' | 'barista.COFFEE_READY' | 'barista.CLEANING';
  message?: string;
}

export const baristaMachine = createMachine({
  id: 'barista',
  initial: 'idle' as BaristaStates,
  context: {
    hasCraftedCoffee: false
  } as BaristaContext,
  
  states: {
    idle: {
      on: {
        MAKE_COFFEE: {
          target: 'receivingOrder',
          actions: sendParent({
            type: 'barista.RECEIVED_ORDER',
            message: '👍 Barista → Cashier: "Got it! One cappuccino coming up!"'
          } as BaristaParentEvents)
        },
        RESET: {
          target: 'idle',
          actions: assign({ hasCraftedCoffee: false })
        }
      }
    },
    
    receivingOrder: {
      after: {
        5000: { // 5 seconds
          target: 'grindingBeans',
          actions: sendParent({
            type: 'barista.GRINDING_BEANS',
            message: '🌱 Barista: *Grinding fresh beans*'
          } as BaristaParentEvents)
        }
      }
    },
    
    grindingBeans: {
      after: {
        5000: { // 5 seconds
          target: 'brewing',
          actions: sendParent({
            type: 'barista.BREWING',
            message: '🔥 Barista: *Pulling the perfect shot*'
          } as BaristaParentEvents)
        }
      }
    },
    
    brewing: {
      after: {
        5000: { // 5 seconds
          target: 'finishingCoffee',
          actions: sendParent({
            type: 'barista.ADDING_TOUCHES',
            message: '✨ Barista: *Adding final touches*'
          } as BaristaParentEvents)
        }
      }
    },
    
    finishingCoffee: {
      after: {
        5000: { // 5 seconds
          target: 'coffeeReady'
        }
      }
    },
    
    coffeeReady: {
      entry: sendParent({
        type: 'barista.COFFEE_READY',
        message: '☕ Barista → Cashier: "Cappuccino up! Extra foam!"'
      } as BaristaParentEvents),
      
      after: {
        5000: { // 5 seconds
          target: 'idle',
          actions: assign({ hasCraftedCoffee: true })
        },
        7000: { // 7 seconds - cleanup happens after transition
          actions: sendParent({
            type: 'barista.CLEANING',
            message: '🧹 Barista: *Cleaning equipment*'
          } as BaristaParentEvents)
        }
      }
    }
  }
});

// Type exports for external usage
export type { BaristaContext, BaristaEvents, BaristaStates, BaristaParentEvents }; 
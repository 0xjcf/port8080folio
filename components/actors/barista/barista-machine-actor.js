import { createMachine, sendParent, assign } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';

export const baristaMachine = createMachine({
  id: 'barista',
  initial: 'idle',
  context: {
    hasCraftedCoffee: false
  },
  states: {
    idle: {
      on: { 
        MAKE_COFFEE: {
          target: 'receivedOrder',
          actions: sendParent({ 
            type: 'barista.RECEIVED_ORDER',
            message: '👍 Barista → Cashier: "Got it! One cappuccino coming up!"' 
          })
        },
        RESET: {
          target: 'idle',
          actions: assign({ hasCraftedCoffee: false })
        }
      }
    },
    receivedOrder: {
      after: {
        300: {
          target: 'makingCoffee',
          actions: sendParent({ 
            type: 'barista.GRINDING_BEANS',
            message: '🌱 Barista: *Grinding fresh beans*' 
          })
        }
      }
    },
    makingCoffee: {
      after: {
        1500: {  // Time to grind beans and prepare
          target: 'brewing',
          actions: sendParent({ 
            type: 'barista.BREWING',
            message: '🔥 Barista: *Pulling the perfect shot*' 
          })
        }
      }
    },
    brewing: {
      after: {
        4000: {  // Time to brew the perfect coffee
          target: 'coffeeReady',
          actions: sendParent({ 
            type: 'barista.ADDING_TOUCHES',
            message: '✨ Barista: *Adding final touches*' 
          })
        }
      }
    },
    coffeeReady: {
      entry: sendParent({ 
        type: 'barista.COFFEE_READY',
        message: '🎆 Barista → Cashier: "Cappuccino up! Extra foam!"' 
      }),
      after: {
        2500: {  // Display coffee ready state before returning to idle
          target: 'idle',
          actions: [
            assign({ hasCraftedCoffee: true }),
            sendParent({ 
              type: 'barista.CLEANING',
              message: '🧹 Barista: *Cleaning equipment*' 
            })
          ]
        }
      }
    }
  }
});
import { createMachine, sendParent, assign } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';

export const cashierMachine = createMachine({
  id: 'cashier',
  initial: 'waiting',
  context: {
    hasServedCustomer: false
  },
  states: {
    waiting: {
      on: { 
        CUSTOMER_SPEAKS_ORDER: {
          target: 'readyToTakeOrder'
        },
        RESET: {
          target: 'waiting',
          actions: assign({ hasServedCustomer: false })
        }
      }
    },
    readyToTakeOrder: {
      on: {
        TAKE_ORDER: {
          target: 'takingOrder'
        }
      }
    },
    takingOrder: {
      entry: sendParent({ 
        type: 'cashier.REQUESTS_PAYMENT',
        message: '✍️ Cashier → Customer: "That\'ll be $4.50 please"' 
      }),
      after: {
        500: {
          target: 'processingPayment'
        }
      }
    },
    processingPayment: {
      entry: sendParent({ 
        type: 'cashier.PROCESSING_PAYMENT',
        message: '💵 Cashier: *Processing payment*' 
      }),
      after: {
        1500: {  // Time to process payment
          target: 'waitingForCoffee',
          actions: [
            sendParent({ 
              type: 'cashier.PAYMENT_PROCESSED',
              message: '✅ Cashier: *Payment processed successfully*' 
            }),
            sendParent({ 
              type: 'cashier.ORDER_TAKEN',
              message: '💬 Cashier → Barista: "One cappuccino order!"' 
            })
          ]
        }
      }
    },
    waitingForCoffee: {
      on: {
        COFFEE_READY: {
          target: 'preparingToServe',
          actions: sendParent({ 
            type: 'cashier.PICKING_UP_COFFEE',
            message: '🤲 Cashier: *Picking up coffee*' 
          })
        }
      }
    },
    preparingToServe: {
      after: {
        500: {
          target: 'servingCoffee',
          actions: sendParent({ 
            type: 'cashier.READY_TO_SERVE',
            message: '🤝 Cashier → Customer: "Here\'s your cappuccino!"' 
          })
        }
      }
    },
    servingCoffee: {
      on: {
        CUSTOMER_SERVED: {
          target: 'waiting',
          actions: [
            assign({ hasServedCustomer: true }),
            sendParent({ 
              type: 'cashier.BACK_TO_WAITING',
              message: '💼 Cashier: *Ready for next customer*' 
            })
          ]
        }
      }
    }
  }
});
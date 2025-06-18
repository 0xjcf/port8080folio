import { setup, createMachine, assign, sendTo } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';
import { customerMachine } from './customer/customer-machine-actor.js';
import { cashierMachine } from './cashier/cashier-machine-actor.js';
import { baristaMachine } from './barista/barista-machine-actor.js';
import { messageLogMachine } from './message-log-actor.js';

// Orchestrator that spawns and manages child actors
export const coffeeShopOrchestratorMachine = setup({
  types: {
    context: {},
    events: {}
  },
  actions: {
    forwardWithLog: ({ context, event }) => {
      // Log the message if present
      if (event.message && context.messageLogActor) {
        context.messageLogActor.send({ 
          type: 'LOG_MESSAGE', 
          message: event.message 
        });
      }
    }
  },
  actors: {
    customer: customerMachine,
    cashier: cashierMachine,
    barista: baristaMachine,
    messageLog: messageLogMachine
  }
}).createMachine({
  id: 'coffeeShopOrchestrator',
  context: {
    customerActor: null,
    cashierActor: null,
    baristaActor: null,
    messageLogActor: null,
    ordersInQueue: 0,
    ordersCompleted: 0
  },
  initial: 'closed',
  states: {
    closed: {
      on: {
        OPEN: 'opening'
      }
    },
    opening: {
      entry: assign({
        // Spawn child actors
        messageLogActor: ({ spawn }) => spawn('messageLog', { id: 'messageLog' }),
        customerActor: ({ spawn }) => spawn('customer', { id: 'customer' }),
        cashierActor: ({ spawn }) => spawn('cashier', { id: 'cashier' }),
        baristaActor: ({ spawn }) => spawn('barista', { id: 'barista' })
      }),
      always: 'open'
    },
    open: {
      on: {
        // Customer says their order
        'customer.SAYS_ORDER': {
          actions: [
            'forwardWithLog',
            sendTo(({ context }) => context.cashierActor, { type: 'CUSTOMER_SPEAKS_ORDER' })
          ]
        },
        
        // Customer wants to order
        'customer.WANTS_TO_ORDER': {
          actions: [
            'forwardWithLog',
            sendTo(({ context }) => context.cashierActor, { type: 'TAKE_ORDER' }),
            assign({ ordersInQueue: ({ context }) => context.ordersInQueue + 1 })
          ]
        },
        
        // Cashier requests payment
        'cashier.REQUESTS_PAYMENT': {
          actions: [
            'forwardWithLog',
            sendTo(({ context }) => context.customerActor, { type: 'PAYMENT_REQUEST' })
          ]
        },
        
        // Cashier took order
        'cashier.ORDER_TAKEN': {
          actions: [
            'forwardWithLog',
            sendTo(({ context }) => context.customerActor, { type: 'ORDER_CONFIRMED' }),
            sendTo(({ context }) => context.baristaActor, { type: 'MAKE_COFFEE' })
          ]
        },
        
        // Barista finished coffee
        'barista.COFFEE_READY': {
          actions: [
            'forwardWithLog',
            sendTo(({ context }) => context.cashierActor, { type: 'COFFEE_READY' })
          ]
        },
        
        // Cashier ready to serve
        'cashier.READY_TO_SERVE': {
          actions: [
            'forwardWithLog',
            sendTo(({ context }) => context.customerActor, { type: 'RECEIVE_COFFEE' })
          ]
        },
        
        // Customer received coffee
        'customer.COFFEE_RECEIVED': {
          actions: [
            'forwardWithLog',
            sendTo(({ context }) => context.cashierActor, { type: 'CUSTOMER_SERVED' }),
            assign({
              ordersInQueue: ({ context }) => Math.max(0, context.ordersInQueue - 1),
              ordersCompleted: ({ context }) => context.ordersCompleted + 1
            })
          ]
        },
        
        // Customer events with messages
        'customer.PAYING': {
          actions: 'forwardWithLog'
        },
        'customer.ORDER_CONFIRMED': {
          actions: 'forwardWithLog'
        },
        'customer.ENJOYING': {
          actions: 'forwardWithLog'
        },
        'customer.BROWSING_AGAIN': {
          actions: 'forwardWithLog'
        },
        
        // Cashier events with messages
        'cashier.PROCESSING_PAYMENT': {
          actions: 'forwardWithLog'
        },
        'cashier.PAYMENT_PROCESSED': {
          actions: 'forwardWithLog'
        },
        'cashier.PICKING_UP_COFFEE': {
          actions: 'forwardWithLog'
        },
        'cashier.BACK_TO_WAITING': {
          actions: 'forwardWithLog'
        },
        
        // Barista events with messages
        'barista.RECEIVED_ORDER': {
          actions: 'forwardWithLog'
        },
        'barista.GRINDING_BEANS': {
          actions: 'forwardWithLog'
        },
        'barista.BREWING': {
          actions: 'forwardWithLog'
        },
        'barista.ADDING_TOUCHES': {
          actions: 'forwardWithLog'
        },
        'barista.CLEANING': {
          actions: 'forwardWithLog'
        },
        
        // Forward log messages to message log actor (deprecated, but keep for compatibility)
        LOG_MESSAGE: {
          actions: sendTo(({ context }) => context.messageLogActor, ({ event }) => event)
        },
        
        // Reset everything
        RESET: {
          target: 'resetting'
        }
      }
    },
    resetting: {
      entry: [
        // Send reset to all actors
        sendTo(({ context }) => context.customerActor, { type: 'RESET' }),
        sendTo(({ context }) => context.cashierActor, { type: 'RESET' }),
        sendTo(({ context }) => context.baristaActor, { type: 'RESET' }),
        assign({
          ordersInQueue: 0,
          ordersCompleted: 0
        })
      ],
      always: 'open'
    }
  }
});
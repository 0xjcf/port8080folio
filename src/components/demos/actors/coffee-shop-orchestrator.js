import { setup, createMachine, assign, sendTo } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';
import { customerMachine } from './customer/customer-machine-actor.js';
import { cashierMachine } from './cashier/cashier-machine-actor.js';
import { baristaMachine } from './barista/barista-machine-actor.js';
import { messageLogMachine } from './message-log-actor.js';
import { uiStateMachine } from './ui-state-machine.js';

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
        },
        incrementOrderQueue: assign({
            ordersInQueue: ({ context }) => context.ordersInQueue + 1
        }),
        completeOrder: assign({
            ordersCompleted: ({ context }) => context.ordersCompleted + 1,
            ordersInQueue: ({ context }) => Math.max(0, context.ordersInQueue - 1)
        }),
        resetStats: assign({
            ordersCompleted: 0,
            ordersInQueue: 0
        })
    },
    actors: {
        customer: customerMachine,
        cashier: cashierMachine,
        barista: baristaMachine,
        messageLog: messageLogMachine,
        uiState: uiStateMachine
    }
}).createMachine({
    id: 'coffeeShopOrchestrator',
    context: {
        customerActor: null,
        cashierActor: null,
        baristaActor: null,
        messageLogActor: null,
        uiStateActor: null,
        ordersCompleted: 0,
        ordersInQueue: 0
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
                uiStateActor: ({ spawn }) => spawn('uiState', { id: 'uiState' }),
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
                        'incrementOrderQueue',
                        sendTo(({ context }) => context.uiStateActor, { type: 'ORDER_STARTED' })
                    ]
                },

                // Cashier requests payment
                'cashier.REQUESTS_PAYMENT': {
                    actions: [
                        'forwardWithLog',
                        sendTo(({ context }) => context.customerActor, { type: 'PAYMENT_REQUEST' }),
                        sendTo(({ context }) => context.uiStateActor, { type: 'PAYMENT_REQUESTED' })
                    ]
                },

                // Cashier took order
                'cashier.ORDER_TAKEN': {
                    actions: [
                        'forwardWithLog',
                        sendTo(({ context }) => context.baristaActor, { type: 'MAKE_COFFEE' })
                    ]
                },

                // Barista finished coffee
                'barista.COFFEE_READY': {
                    actions: [
                        'forwardWithLog',
                        sendTo(({ context }) => context.cashierActor, { type: 'COFFEE_READY' }),
                        sendTo(({ context }) => context.uiStateActor, { type: 'COFFEE_READY' })
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
                        'completeOrder',
                        sendTo(({ context }) => context.uiStateActor, { type: 'COFFEE_DELIVERED' })
                    ]
                },

                // Customer events with messages
                'customer.PAYING': {
                    actions: 'forwardWithLog'
                },
                // Handle PAID event from customer
                'PAID': {
                    actions: sendTo(({ context }) => context.cashierActor, { type: 'CUSTOMER_PAYS' })
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
                'cashier.TAKING_ORDER': {
                    actions: 'forwardWithLog'
                },
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
                    actions: [
                        'forwardWithLog',
                        sendTo(({ context }) => context.uiStateActor, { type: 'BARISTA_STARTED' })
                    ]
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
                // Reset stats
                'resetStats',
                // Send reset to all actors
                sendTo(({ context }) => context.customerActor, { type: 'RESET' }),
                sendTo(({ context }) => context.cashierActor, { type: 'RESET' }),
                sendTo(({ context }) => context.baristaActor, { type: 'RESET' }),
                sendTo(({ context }) => context.uiStateActor, { type: 'RESET' }),
                // Clear message log
                sendTo(({ context }) => context.messageLogActor, { type: 'CLEAR_LOG' })
            ],
            always: 'open'
        }
    }
}); 
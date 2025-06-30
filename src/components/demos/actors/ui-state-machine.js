import { createMachine, assign } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';

export const uiStateMachine = createMachine({
    id: 'uiState',
    initial: 'idle',
    context: {},
    states: {
        idle: {
            on: {
                ORDER_STARTED: 'orderPlacing'
            }
        },
        orderPlacing: {
            on: {
                PAYMENT_REQUESTED: 'paymentProcessing',
                RESET: 'idle'
            }
        },
        paymentProcessing: {
            on: {
                BARISTA_STARTED: 'coffeePreparation',
                RESET: 'idle'
            }
        },
        coffeePreparation: {
            on: {
                COFFEE_READY: 'coffeeReady',
                RESET: 'idle'
            }
        },
        coffeeReady: {
            on: {
                COFFEE_DELIVERED: 'orderComplete',
                RESET: 'idle'
            }
        },
        orderComplete: {
            after: {
                5000: 'idle' // Auto-transition back to idle after 5 seconds
            },
            on: {
                RESET: 'idle'
            }
        }
    }
}); 
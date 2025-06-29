import { createMachine, sendParent, assign } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';

export const customerMachine = createMachine({
    id: 'customer',
    initial: 'browsing',
    context: {
        hasCompletedOrder: false
    },
    states: {
        browsing: {
            on: {
                ORDER: {
                    target: 'ordering',
                    actions: [
                        sendParent({
                            type: 'customer.SAYS_ORDER',
                            message: '🗣️ Customer → Cashier: "I\'d like a large cappuccino please!"'
                        }),
                        sendParent({
                            type: 'customer.WANTS_TO_ORDER'
                        })
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
                5000: {  // 5 seconds to take out and hand over payment
                    target: 'waiting',
                    actions: [
                        sendParent({
                            type: 'customer.PAYING',
                            message: '💵 Customer → Cashier: *Handing over payment*'
                        }),
                        sendParent({ type: 'PAID' }),  // Trigger cashier payment flow
                        sendParent({
                            type: 'customer.ORDER_CONFIRMED',
                            message: '⏳ Customer: *Waiting patiently for coffee*'
                        })
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
                    })
                }
            }
        },
        enjoying: {
            entry: sendParent({
                type: 'customer.ENJOYING',
                message: '☕ Customer: *Savoring the coffee*'
            }),
            after: {
                5000: {  // 5 seconds to enjoy coffee
                    target: 'browsing',
                    actions: [
                        assign({ hasCompletedOrder: true }),
                        sendParent({
                            type: 'customer.BROWSING_AGAIN',
                            message: '👀 Customer: *Browsing menu again*'
                        })
                    ]
                }
            },
            on: {
                ORDER: {  // Customer can order again while enjoying
                    target: 'ordering',
                    actions: sendParent({
                        type: 'customer.WANTS_TO_ORDER',
                        message: '🗣️ Customer → Cashier: "Actually, I\'ll have another!"'
                    })
                }
            }
        }
    }
}); 
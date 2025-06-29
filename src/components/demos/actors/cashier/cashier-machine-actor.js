import { createMachine, sendParent, assign } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';

export const cashierMachine = createMachine({
    id: 'cashier',
    initial: 'waiting',
    context: {
        hasServedCustomer: false,
        ordersInQueue: 0,
        ordersCompleted: 0
    },
    states: {
        waiting: {
            on: {
                CUSTOMER_SPEAKS_ORDER: {
                    target: 'readyToTakeOrder',
                    actions: assign({ ordersInQueue: ({ context }) => context.ordersInQueue + 1 })
                },
                RESET: {
                    target: 'waiting',
                    actions: assign({ 
                        hasServedCustomer: false,
                        ordersInQueue: 0,
                        ordersCompleted: 0
                    })
                }
            }
        },
        readyToTakeOrder: {
            after: {
                5000: {  // 5 seconds
                    target: 'takingOrder'
                }
            }
        },
        takingOrder: {
            entry: sendParent({
                type: 'cashier.TAKING_ORDER',
                message: '✍️ Cashier: *Writing down order*'
            }),
            after: {
                5000: {  // 5 seconds
                    target: 'requestingPayment',
                    actions: sendParent({
                        type: 'cashier.REQUESTS_PAYMENT',
                        message: '💬 Cashier → Customer: "That\'ll be $4.50 please"'
                    })
                }
            }
        },
        requestingPayment: {
            on: {
                CUSTOMER_PAYS: {
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
                5000: {  // 5 seconds
                    target: 'waitingForCoffee',
                    actions: [
                        sendParent({
                            type: 'cashier.PAYMENT_PROCESSED',
                            message: '✅ Cashier: *Payment complete - Thank you!*'
                        }),
                        sendParent({
                            type: 'cashier.ORDER_TAKEN',
                            message: '📢 Cashier → Barista: "One cappuccino order!"'
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
                5000: {  // 5 seconds
                    target: 'servingCoffee',
                    actions: sendParent({
                        type: 'cashier.READY_TO_SERVE',
                        message: '☕ Cashier → Customer: "Here\'s your cappuccino!"'
                    })
                }
            }
        },
        servingCoffee: {
            after: {
                5000: {  // 5 seconds
                    target: 'waiting',
                    actions: [
                        assign({ 
                            hasServedCustomer: true,
                            ordersInQueue: ({ context }) => Math.max(0, context.ordersInQueue - 1),
                            ordersCompleted: ({ context }) => context.ordersCompleted + 1
                        }),
                        sendParent({
                            type: 'cashier.BACK_TO_WAITING',
                            message: '😊 Cashier: *Ready for next customer*'
                        })
                    ]
                }
            }
        }
    }
}); 
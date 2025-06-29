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
                    target: 'receivingOrder',
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
        receivingOrder: {
            after: {
                5000: {  // 5 seconds
                    target: 'grindingBeans',
                    actions: sendParent({
                        type: 'barista.GRINDING_BEANS',
                        message: '🌱 Barista: *Grinding fresh beans*'
                    })
                }
            }
        },
        grindingBeans: {
            after: {
                5000: {  // 5 seconds
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
                5000: {  // 5 seconds
                    target: 'finishingCoffee',
                    actions: sendParent({
                        type: 'barista.ADDING_TOUCHES',
                        message: '✨ Barista: *Adding final touches*'
                    })
                }
            }
        },
        finishingCoffee: {
            after: {
                5000: {  // 5 seconds
                    target: 'coffeeReady'
                }
            }
        },
        coffeeReady: {
            entry: sendParent({
                type: 'barista.COFFEE_READY',
                message: '☕ Barista → Cashier: "Cappuccino up! Extra foam!"'
            }),
            after: {
                5000: {  // 5 seconds
                    target: 'idle',
                    actions: assign({ hasCraftedCoffee: true })
                },
                7000: {  // 7 seconds - cleanup happens after transition
                    actions: sendParent({
                        type: 'barista.CLEANING',
                        message: '🧹 Barista: *Cleaning equipment*'
                    })
                }
            }
        }
    }
}); 
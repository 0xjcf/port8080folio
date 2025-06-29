import { createMachine, assign } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';

export const messageLogMachine = createMachine({
    id: 'messageLog',
    initial: 'active',
    context: {
        messages: []
    },
    states: {
        active: {
            on: {
                LOG_MESSAGE: {
                    actions: assign({
                        messages: ({ context, event }) => [
                            ...context.messages,
                            {
                                timestamp: new Date().toLocaleTimeString(),
                                message: event.message,
                                type: event.messageType || 'info'
                            }
                        ]
                    })
                },
                CLEAR_LOG: {
                    actions: assign({
                        messages: []
                    })
                }
            }
        }
    }
}); 
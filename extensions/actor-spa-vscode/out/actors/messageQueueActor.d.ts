/**
 * Message Queue Actor
 *
 * This actor manages a persistent message queue with retry logic,
 * dead letter queue, and various delivery guarantees.
 */
import type { DebugLogger } from '../core/debugLogger';
import { type AIMessage } from '../types/aiCommunication';
/**
 * Queue entry with metadata
 */
export interface QueueEntry {
    id: string;
    message: AIMessage;
    attempts: number;
    lastAttempt?: number;
    nextRetry?: number;
    status: 'pending' | 'processing' | 'failed' | 'delivered' | 'dead';
    error?: string;
}
/**
 * Queue configuration
 */
export interface QueueConfig {
    maxSize: number;
    maxRetries: number;
    retryDelayMs: number;
    deadLetterQueueSize: number;
    persistencePath?: string;
    processingTimeout: number;
    priorityQueuing: boolean;
}
/**
 * Queue context
 */
export interface MessageQueueContext {
    queue: QueueEntry[];
    deadLetterQueue: QueueEntry[];
    processing: Map<string, QueueEntry>;
    config: QueueConfig;
    stats: {
        enqueued: number;
        delivered: number;
        failed: number;
        deadLettered: number;
        retried: number;
        dropped: number;
    };
    errors: Error[];
}
/**
 * Queue events
 */
export type MessageQueueEvent = {
    type: 'ENQUEUE';
    message: AIMessage;
} | {
    type: 'DEQUEUE';
} | {
    type: 'PROCESS_NEXT';
} | {
    type: 'DELIVERY_SUCCESS';
    entryId: string;
} | {
    type: 'DELIVERY_FAILURE';
    entryId: string;
    error: string;
} | {
    type: 'RETRY_FAILED';
} | {
    type: 'CLEAR_DLQ';
} | {
    type: 'PERSIST';
} | {
    type: 'RESTORE';
} | {
    type: 'GET_STATS';
};
/**
 * Create the message queue state machine
 */
export declare const messageQueueMachine: import("xstate").StateMachine<MessageQueueContext, {
    type: "ENQUEUE";
    message: AIMessage;
} | {
    type: "DEQUEUE";
} | {
    type: "PROCESS_NEXT";
} | {
    type: "DELIVERY_SUCCESS";
    entryId: string;
} | {
    type: "DELIVERY_FAILURE";
    entryId: string;
    error: string;
} | {
    type: "RETRY_FAILED";
} | {
    type: "CLEAR_DLQ";
} | {
    type: "PERSIST";
} | {
    type: "RESTORE";
} | {
    type: "GET_STATS";
}, {
    [x: string]: import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<void, {
        queue: QueueEntry[];
        dlq: QueueEntry[];
        path?: string;
    }, import("xstate").EventObject>> | import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<{
        queue: any;
        deadLetterQueue: any;
    }, {
        path?: string;
    }, import("xstate").EventObject>> | undefined;
}, import("xstate").Values<{
    persistQueue: {
        src: "persistQueue";
        logic: import("xstate").PromiseActorLogic<void, {
            queue: QueueEntry[];
            dlq: QueueEntry[];
            path?: string;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
    restoreQueue: {
        src: "restoreQueue";
        logic: import("xstate").PromiseActorLogic<{
            queue: any;
            deadLetterQueue: any;
        }, {
            path?: string;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
}>, import("xstate").Values<{
    logError: {
        type: "logError";
        params: import("xstate").NonReducibleUnknown;
    };
    enqueueMessage: {
        type: "enqueueMessage";
        params: import("xstate").NonReducibleUnknown;
    };
    startProcessing: {
        type: "startProcessing";
        params: import("xstate").NonReducibleUnknown;
    };
    handleDeliverySuccess: {
        type: "handleDeliverySuccess";
        params: import("xstate").NonReducibleUnknown;
    };
    handleDeliveryFailure: {
        type: "handleDeliveryFailure";
        params: import("xstate").NonReducibleUnknown;
    };
    clearDeadLetterQueue: {
        type: "clearDeadLetterQueue";
        params: import("xstate").NonReducibleUnknown;
    };
}>, import("xstate").Values<{
    hasMessages: {
        type: "hasMessages";
        params: unknown;
    };
    isRetryReady: {
        type: "isRetryReady";
        params: unknown;
    };
}>, never, "initializing" | {
    active: "idle" | "processing" | "checkingQueue" | "waitingForRetry" | "persisting";
}, string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "messageQueue";
    readonly initial: "initializing";
    readonly context: {
        readonly queue: [];
        readonly deadLetterQueue: [];
        readonly processing: Map<any, any>;
        readonly config: QueueConfig;
        readonly stats: {
            readonly enqueued: 0;
            readonly delivered: 0;
            readonly failed: 0;
            readonly deadLettered: 0;
            readonly retried: 0;
            readonly dropped: 0;
        };
        readonly errors: [];
    };
    readonly states: {
        readonly initializing: {
            readonly invoke: {
                readonly id: "restore";
                readonly src: "restoreQueue";
                readonly input: ({ context }: {
                    context: MessageQueueContext;
                    event: {
                        type: "ENQUEUE";
                        message: AIMessage;
                    } | {
                        type: "DEQUEUE";
                    } | {
                        type: "PROCESS_NEXT";
                    } | {
                        type: "DELIVERY_SUCCESS";
                        entryId: string;
                    } | {
                        type: "DELIVERY_FAILURE";
                        entryId: string;
                        error: string;
                    } | {
                        type: "RETRY_FAILED";
                    } | {
                        type: "CLEAR_DLQ";
                    } | {
                        type: "PERSIST";
                    } | {
                        type: "RESTORE";
                    } | {
                        type: "GET_STATS";
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<MessageQueueContext, {
                        type: "ENQUEUE";
                        message: AIMessage;
                    } | {
                        type: "DEQUEUE";
                    } | {
                        type: "PROCESS_NEXT";
                    } | {
                        type: "DELIVERY_SUCCESS";
                        entryId: string;
                    } | {
                        type: "DELIVERY_FAILURE";
                        entryId: string;
                        error: string;
                    } | {
                        type: "RETRY_FAILED";
                    } | {
                        type: "CLEAR_DLQ";
                    } | {
                        type: "PERSIST";
                    } | {
                        type: "RESTORE";
                    } | {
                        type: "GET_STATS";
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "ENQUEUE";
                        message: AIMessage;
                    } | {
                        type: "DEQUEUE";
                    } | {
                        type: "PROCESS_NEXT";
                    } | {
                        type: "DELIVERY_SUCCESS";
                        entryId: string;
                    } | {
                        type: "DELIVERY_FAILURE";
                        entryId: string;
                        error: string;
                    } | {
                        type: "RETRY_FAILED";
                    } | {
                        type: "CLEAR_DLQ";
                    } | {
                        type: "PERSIST";
                    } | {
                        type: "RESTORE";
                    } | {
                        type: "GET_STATS";
                    }, import("xstate").AnyEventObject>;
                }) => {
                    path: string | undefined;
                };
                readonly onDone: {
                    readonly target: "active";
                    readonly actions: import("xstate").ActionFunction<MessageQueueContext, import("xstate").DoneActorEvent<{
                        queue: any;
                        deadLetterQueue: any;
                    }, string>, {
                        type: "ENQUEUE";
                        message: AIMessage;
                    } | {
                        type: "DEQUEUE";
                    } | {
                        type: "PROCESS_NEXT";
                    } | {
                        type: "DELIVERY_SUCCESS";
                        entryId: string;
                    } | {
                        type: "DELIVERY_FAILURE";
                        entryId: string;
                        error: string;
                    } | {
                        type: "RETRY_FAILED";
                    } | {
                        type: "CLEAR_DLQ";
                    } | {
                        type: "PERSIST";
                    } | {
                        type: "RESTORE";
                    } | {
                        type: "GET_STATS";
                    }, undefined, import("xstate").Values<{
                        persistQueue: {
                            src: "persistQueue";
                            logic: import("xstate").PromiseActorLogic<void, {
                                queue: QueueEntry[];
                                dlq: QueueEntry[];
                                path?: string;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        restoreQueue: {
                            src: "restoreQueue";
                            logic: import("xstate").PromiseActorLogic<{
                                queue: any;
                                deadLetterQueue: any;
                            }, {
                                path?: string;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
                readonly onError: {
                    readonly target: "active";
                    readonly actions: "logError";
                };
            };
        };
        readonly active: {
            readonly on: {
                readonly ENQUEUE: {
                    readonly actions: "enqueueMessage";
                };
                readonly DEQUEUE: {
                    readonly target: ".processing";
                    readonly guard: "hasMessages";
                };
                readonly CLEAR_DLQ: {
                    readonly actions: "clearDeadLetterQueue";
                };
                readonly PERSIST: {
                    readonly target: ".persisting";
                };
            };
            readonly initial: "idle";
            readonly states: {
                readonly idle: {
                    readonly always: readonly [{
                        readonly target: "checkingQueue";
                        readonly guard: "hasMessages";
                    }];
                };
                readonly checkingQueue: {
                    readonly always: readonly [{
                        readonly target: "processing";
                        readonly guard: "isRetryReady";
                    }, {
                        readonly target: "waitingForRetry";
                    }];
                };
                readonly waitingForRetry: {
                    readonly after: {
                        readonly 1000: "checkingQueue";
                    };
                };
                readonly processing: {
                    readonly entry: "startProcessing";
                    readonly on: {
                        readonly DELIVERY_SUCCESS: {
                            readonly actions: "handleDeliverySuccess";
                            readonly target: "idle";
                        };
                        readonly DELIVERY_FAILURE: {
                            readonly actions: "handleDeliveryFailure";
                            readonly target: "idle";
                        };
                    };
                    readonly after: {
                        readonly PROCESSING_TIMEOUT: {
                            readonly target: "idle";
                            readonly actions: ({ context }: {
                                context: MessageQueueContext;
                            }) => void;
                        };
                    };
                };
                readonly persisting: {
                    readonly invoke: {
                        readonly id: "persist";
                        readonly src: "persistQueue";
                        readonly input: ({ context }: {
                            context: MessageQueueContext;
                            event: {
                                type: "ENQUEUE";
                                message: AIMessage;
                            } | {
                                type: "DEQUEUE";
                            } | {
                                type: "PROCESS_NEXT";
                            } | {
                                type: "DELIVERY_SUCCESS";
                                entryId: string;
                            } | {
                                type: "DELIVERY_FAILURE";
                                entryId: string;
                                error: string;
                            } | {
                                type: "RETRY_FAILED";
                            } | {
                                type: "CLEAR_DLQ";
                            } | {
                                type: "PERSIST";
                            } | {
                                type: "RESTORE";
                            } | {
                                type: "GET_STATS";
                            };
                            self: import("xstate").ActorRef<import("xstate").MachineSnapshot<MessageQueueContext, {
                                type: "ENQUEUE";
                                message: AIMessage;
                            } | {
                                type: "DEQUEUE";
                            } | {
                                type: "PROCESS_NEXT";
                            } | {
                                type: "DELIVERY_SUCCESS";
                                entryId: string;
                            } | {
                                type: "DELIVERY_FAILURE";
                                entryId: string;
                                error: string;
                            } | {
                                type: "RETRY_FAILED";
                            } | {
                                type: "CLEAR_DLQ";
                            } | {
                                type: "PERSIST";
                            } | {
                                type: "RESTORE";
                            } | {
                                type: "GET_STATS";
                            }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                                type: "ENQUEUE";
                                message: AIMessage;
                            } | {
                                type: "DEQUEUE";
                            } | {
                                type: "PROCESS_NEXT";
                            } | {
                                type: "DELIVERY_SUCCESS";
                                entryId: string;
                            } | {
                                type: "DELIVERY_FAILURE";
                                entryId: string;
                                error: string;
                            } | {
                                type: "RETRY_FAILED";
                            } | {
                                type: "CLEAR_DLQ";
                            } | {
                                type: "PERSIST";
                            } | {
                                type: "RESTORE";
                            } | {
                                type: "GET_STATS";
                            }, import("xstate").AnyEventObject>;
                        }) => {
                            queue: QueueEntry[];
                            dlq: QueueEntry[];
                            path: string | undefined;
                        };
                        readonly onDone: "idle";
                        readonly onError: {
                            readonly target: "idle";
                            readonly actions: "logError";
                        };
                    };
                };
            };
        };
    };
}>;
/**
 * Create and start a message queue actor
 */
export declare function createMessageQueue(config?: Partial<QueueConfig>, debugLogger?: DebugLogger): import("xstate").Actor<import("xstate").StateMachine<MessageQueueContext, {
    type: "ENQUEUE";
    message: AIMessage;
} | {
    type: "DEQUEUE";
} | {
    type: "PROCESS_NEXT";
} | {
    type: "DELIVERY_SUCCESS";
    entryId: string;
} | {
    type: "DELIVERY_FAILURE";
    entryId: string;
    error: string;
} | {
    type: "RETRY_FAILED";
} | {
    type: "CLEAR_DLQ";
} | {
    type: "PERSIST";
} | {
    type: "RESTORE";
} | {
    type: "GET_STATS";
}, {
    [x: string]: import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<void, {
        queue: QueueEntry[];
        dlq: QueueEntry[];
        path?: string;
    }, import("xstate").EventObject>> | import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<{
        queue: any;
        deadLetterQueue: any;
    }, {
        path?: string;
    }, import("xstate").EventObject>> | undefined;
}, import("xstate").Values<{
    persistQueue: {
        src: "persistQueue";
        logic: import("xstate").PromiseActorLogic<void, {
            queue: QueueEntry[];
            dlq: QueueEntry[];
            path?: string;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
    restoreQueue: {
        src: "restoreQueue";
        logic: import("xstate").PromiseActorLogic<{
            queue: any;
            deadLetterQueue: any;
        }, {
            path?: string;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
}>, import("xstate").Values<{
    logError: {
        type: "logError";
        params: import("xstate").NonReducibleUnknown;
    };
    enqueueMessage: {
        type: "enqueueMessage";
        params: import("xstate").NonReducibleUnknown;
    };
    startProcessing: {
        type: "startProcessing";
        params: import("xstate").NonReducibleUnknown;
    };
    handleDeliverySuccess: {
        type: "handleDeliverySuccess";
        params: import("xstate").NonReducibleUnknown;
    };
    handleDeliveryFailure: {
        type: "handleDeliveryFailure";
        params: import("xstate").NonReducibleUnknown;
    };
    clearDeadLetterQueue: {
        type: "clearDeadLetterQueue";
        params: import("xstate").NonReducibleUnknown;
    };
}>, import("xstate").Values<{
    hasMessages: {
        type: "hasMessages";
        params: unknown;
    };
    isRetryReady: {
        type: "isRetryReady";
        params: unknown;
    };
}>, never, "initializing" | {
    active: "idle" | "processing" | "checkingQueue" | "waitingForRetry" | "persisting";
}, string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "messageQueue";
    readonly initial: "initializing";
    readonly context: {
        readonly queue: [];
        readonly deadLetterQueue: [];
        readonly processing: Map<any, any>;
        readonly config: QueueConfig;
        readonly stats: {
            readonly enqueued: 0;
            readonly delivered: 0;
            readonly failed: 0;
            readonly deadLettered: 0;
            readonly retried: 0;
            readonly dropped: 0;
        };
        readonly errors: [];
    };
    readonly states: {
        readonly initializing: {
            readonly invoke: {
                readonly id: "restore";
                readonly src: "restoreQueue";
                readonly input: ({ context }: {
                    context: MessageQueueContext;
                    event: {
                        type: "ENQUEUE";
                        message: AIMessage;
                    } | {
                        type: "DEQUEUE";
                    } | {
                        type: "PROCESS_NEXT";
                    } | {
                        type: "DELIVERY_SUCCESS";
                        entryId: string;
                    } | {
                        type: "DELIVERY_FAILURE";
                        entryId: string;
                        error: string;
                    } | {
                        type: "RETRY_FAILED";
                    } | {
                        type: "CLEAR_DLQ";
                    } | {
                        type: "PERSIST";
                    } | {
                        type: "RESTORE";
                    } | {
                        type: "GET_STATS";
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<MessageQueueContext, {
                        type: "ENQUEUE";
                        message: AIMessage;
                    } | {
                        type: "DEQUEUE";
                    } | {
                        type: "PROCESS_NEXT";
                    } | {
                        type: "DELIVERY_SUCCESS";
                        entryId: string;
                    } | {
                        type: "DELIVERY_FAILURE";
                        entryId: string;
                        error: string;
                    } | {
                        type: "RETRY_FAILED";
                    } | {
                        type: "CLEAR_DLQ";
                    } | {
                        type: "PERSIST";
                    } | {
                        type: "RESTORE";
                    } | {
                        type: "GET_STATS";
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "ENQUEUE";
                        message: AIMessage;
                    } | {
                        type: "DEQUEUE";
                    } | {
                        type: "PROCESS_NEXT";
                    } | {
                        type: "DELIVERY_SUCCESS";
                        entryId: string;
                    } | {
                        type: "DELIVERY_FAILURE";
                        entryId: string;
                        error: string;
                    } | {
                        type: "RETRY_FAILED";
                    } | {
                        type: "CLEAR_DLQ";
                    } | {
                        type: "PERSIST";
                    } | {
                        type: "RESTORE";
                    } | {
                        type: "GET_STATS";
                    }, import("xstate").AnyEventObject>;
                }) => {
                    path: string | undefined;
                };
                readonly onDone: {
                    readonly target: "active";
                    readonly actions: import("xstate").ActionFunction<MessageQueueContext, import("xstate").DoneActorEvent<{
                        queue: any;
                        deadLetterQueue: any;
                    }, string>, {
                        type: "ENQUEUE";
                        message: AIMessage;
                    } | {
                        type: "DEQUEUE";
                    } | {
                        type: "PROCESS_NEXT";
                    } | {
                        type: "DELIVERY_SUCCESS";
                        entryId: string;
                    } | {
                        type: "DELIVERY_FAILURE";
                        entryId: string;
                        error: string;
                    } | {
                        type: "RETRY_FAILED";
                    } | {
                        type: "CLEAR_DLQ";
                    } | {
                        type: "PERSIST";
                    } | {
                        type: "RESTORE";
                    } | {
                        type: "GET_STATS";
                    }, undefined, import("xstate").Values<{
                        persistQueue: {
                            src: "persistQueue";
                            logic: import("xstate").PromiseActorLogic<void, {
                                queue: QueueEntry[];
                                dlq: QueueEntry[];
                                path?: string;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        restoreQueue: {
                            src: "restoreQueue";
                            logic: import("xstate").PromiseActorLogic<{
                                queue: any;
                                deadLetterQueue: any;
                            }, {
                                path?: string;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
                readonly onError: {
                    readonly target: "active";
                    readonly actions: "logError";
                };
            };
        };
        readonly active: {
            readonly on: {
                readonly ENQUEUE: {
                    readonly actions: "enqueueMessage";
                };
                readonly DEQUEUE: {
                    readonly target: ".processing";
                    readonly guard: "hasMessages";
                };
                readonly CLEAR_DLQ: {
                    readonly actions: "clearDeadLetterQueue";
                };
                readonly PERSIST: {
                    readonly target: ".persisting";
                };
            };
            readonly initial: "idle";
            readonly states: {
                readonly idle: {
                    readonly always: readonly [{
                        readonly target: "checkingQueue";
                        readonly guard: "hasMessages";
                    }];
                };
                readonly checkingQueue: {
                    readonly always: readonly [{
                        readonly target: "processing";
                        readonly guard: "isRetryReady";
                    }, {
                        readonly target: "waitingForRetry";
                    }];
                };
                readonly waitingForRetry: {
                    readonly after: {
                        readonly 1000: "checkingQueue";
                    };
                };
                readonly processing: {
                    readonly entry: "startProcessing";
                    readonly on: {
                        readonly DELIVERY_SUCCESS: {
                            readonly actions: "handleDeliverySuccess";
                            readonly target: "idle";
                        };
                        readonly DELIVERY_FAILURE: {
                            readonly actions: "handleDeliveryFailure";
                            readonly target: "idle";
                        };
                    };
                    readonly after: {
                        readonly PROCESSING_TIMEOUT: {
                            readonly target: "idle";
                            readonly actions: ({ context }: {
                                context: MessageQueueContext;
                            }) => void;
                        };
                    };
                };
                readonly persisting: {
                    readonly invoke: {
                        readonly id: "persist";
                        readonly src: "persistQueue";
                        readonly input: ({ context }: {
                            context: MessageQueueContext;
                            event: {
                                type: "ENQUEUE";
                                message: AIMessage;
                            } | {
                                type: "DEQUEUE";
                            } | {
                                type: "PROCESS_NEXT";
                            } | {
                                type: "DELIVERY_SUCCESS";
                                entryId: string;
                            } | {
                                type: "DELIVERY_FAILURE";
                                entryId: string;
                                error: string;
                            } | {
                                type: "RETRY_FAILED";
                            } | {
                                type: "CLEAR_DLQ";
                            } | {
                                type: "PERSIST";
                            } | {
                                type: "RESTORE";
                            } | {
                                type: "GET_STATS";
                            };
                            self: import("xstate").ActorRef<import("xstate").MachineSnapshot<MessageQueueContext, {
                                type: "ENQUEUE";
                                message: AIMessage;
                            } | {
                                type: "DEQUEUE";
                            } | {
                                type: "PROCESS_NEXT";
                            } | {
                                type: "DELIVERY_SUCCESS";
                                entryId: string;
                            } | {
                                type: "DELIVERY_FAILURE";
                                entryId: string;
                                error: string;
                            } | {
                                type: "RETRY_FAILED";
                            } | {
                                type: "CLEAR_DLQ";
                            } | {
                                type: "PERSIST";
                            } | {
                                type: "RESTORE";
                            } | {
                                type: "GET_STATS";
                            }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                                type: "ENQUEUE";
                                message: AIMessage;
                            } | {
                                type: "DEQUEUE";
                            } | {
                                type: "PROCESS_NEXT";
                            } | {
                                type: "DELIVERY_SUCCESS";
                                entryId: string;
                            } | {
                                type: "DELIVERY_FAILURE";
                                entryId: string;
                                error: string;
                            } | {
                                type: "RETRY_FAILED";
                            } | {
                                type: "CLEAR_DLQ";
                            } | {
                                type: "PERSIST";
                            } | {
                                type: "RESTORE";
                            } | {
                                type: "GET_STATS";
                            }, import("xstate").AnyEventObject>;
                        }) => {
                            queue: QueueEntry[];
                            dlq: QueueEntry[];
                            path: string | undefined;
                        };
                        readonly onDone: "idle";
                        readonly onError: {
                            readonly target: "idle";
                            readonly actions: "logError";
                        };
                    };
                };
            };
        };
    };
}>>;
//# sourceMappingURL=messageQueueActor.d.ts.map
/**
 * AI Communication Bridge Actor
 *
 * This actor manages communication between different AI agents (Claude, Cursor, etc.)
 * using the actor model pattern with XState v5.
 */
import { type DebugLogger } from '../core/debugLogger';
import { type AIAgent, type AICommunicationContext, type AIMessage, CommunicationChannel, type CommunicationConfig, MessagePriority, type MessageType } from '../types/aiCommunication';
/**
 * Create the AI Communication Bridge state machine
 */
export declare const aiCommunicationBridgeMachine: import("xstate").StateMachine<AICommunicationContext, {
    type: "SEND_MESSAGE";
    message: AIMessage;
} | {
    type: "MESSAGE_RECEIVED";
    message: AIMessage;
} | {
    type: "SUBSCRIBE";
    channel: CommunicationChannel;
    callback: import("../types/aiCommunication").MessageHandler;
} | {
    type: "UNSUBSCRIBE";
    channel: CommunicationChannel;
    handlerId: string;
} | {
    type: "CONNECT";
    agent: AIAgent;
} | {
    type: "DISCONNECT";
    agentId: string;
} | {
    type: "HEARTBEAT";
    agentId: string;
} | {
    type: "GET_STATS";
} | {
    type: "CLEAR_HISTORY";
} | {
    type: "REPLAY_MESSAGES";
    since: number;
} | {
    type: "ERROR";
    error: Error;
}, {
    [x: string]: import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<string, {
        message: AIMessage;
        storagePath: string;
    }, import("xstate").EventObject>> | import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<AIMessage<unknown>[], {
        storagePath: string;
        since?: number;
    }, import("xstate").EventObject>> | import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<{
        signature: string;
        id: string;
        timestamp: number;
        source: AIAgent;
        target: AIAgent | "broadcast";
        type: MessageType;
        payload: unknown;
        metadata: import("../types/aiCommunication").MessageMetadata;
    }, {
        message: AIMessage;
        config: CommunicationConfig;
        debugLogger?: DebugLogger;
    }, import("xstate").EventObject>> | undefined;
}, import("xstate").Values<{
    persistMessage: {
        src: "persistMessage";
        logic: import("xstate").PromiseActorLogic<string, {
            message: AIMessage;
            storagePath: string;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
    loadMessageHistory: {
        src: "loadMessageHistory";
        logic: import("xstate").PromiseActorLogic<AIMessage<unknown>[], {
            storagePath: string;
            since?: number;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
    processOutgoingMessage: {
        src: "processOutgoingMessage";
        logic: import("xstate").PromiseActorLogic<{
            signature: string;
            id: string;
            timestamp: number;
            source: AIAgent;
            target: AIAgent | "broadcast";
            type: MessageType;
            payload: unknown;
            metadata: import("../types/aiCommunication").MessageMetadata;
        }, {
            message: AIMessage;
            config: CommunicationConfig;
            debugLogger?: DebugLogger;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
}>, import("xstate").Values<{
    initialize: {
        type: "initialize";
        params: import("xstate").NonReducibleUnknown;
    };
    queueMessage: {
        type: "queueMessage";
        params: import("xstate").NonReducibleUnknown;
    };
    processReceivedMessage: {
        type: "processReceivedMessage";
        params: import("xstate").NonReducibleUnknown;
    };
    notifySubscribers: {
        type: "notifySubscribers";
        params: unknown;
    };
    addSubscription: {
        type: "addSubscription";
        params: import("xstate").NonReducibleUnknown;
    };
    removeSubscription: {
        type: "removeSubscription";
        params: import("xstate").NonReducibleUnknown;
    };
    registerAgent: {
        type: "registerAgent";
        params: import("xstate").NonReducibleUnknown;
    };
    unregisterAgent: {
        type: "unregisterAgent";
        params: import("xstate").NonReducibleUnknown;
    };
    clearHistory: {
        type: "clearHistory";
        params: import("xstate").NonReducibleUnknown;
    };
    logError: {
        type: "logError";
        params: import("xstate").NonReducibleUnknown;
    };
}>, never, never, "initializing" | {
    active: "idle" | "processingQueue" | "sendingMessage" | "persistingMessage";
}, string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "aiCommunicationBridge";
    readonly initial: "initializing";
    readonly context: {
        readonly agents: Map<any, any>;
        readonly messageQueue: [];
        readonly messageHistory: [];
        readonly subscriptions: Map<any, any>;
        readonly stats: {
            readonly messagesSent: 0;
            readonly messagesReceived: 0;
            readonly messagesDropped: 0;
            readonly averageLatency: 0;
            readonly activeConnections: 0;
            readonly lastActivity: number;
        };
        readonly config: CommunicationConfig;
        readonly errors: [];
    };
    readonly states: {
        readonly initializing: {
            readonly entry: "initialize";
            readonly invoke: {
                readonly id: "loadHistory";
                readonly src: "loadMessageHistory";
                readonly input: ({ context }: {
                    context: AICommunicationContext;
                    event: {
                        type: "SEND_MESSAGE";
                        message: AIMessage;
                    } | {
                        type: "MESSAGE_RECEIVED";
                        message: AIMessage;
                    } | {
                        type: "SUBSCRIBE";
                        channel: CommunicationChannel;
                        callback: import("../types/aiCommunication").MessageHandler;
                    } | {
                        type: "UNSUBSCRIBE";
                        channel: CommunicationChannel;
                        handlerId: string;
                    } | {
                        type: "CONNECT";
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECT";
                        agentId: string;
                    } | {
                        type: "HEARTBEAT";
                        agentId: string;
                    } | {
                        type: "GET_STATS";
                    } | {
                        type: "CLEAR_HISTORY";
                    } | {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    } | {
                        type: "ERROR";
                        error: Error;
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<AICommunicationContext, {
                        type: "SEND_MESSAGE";
                        message: AIMessage;
                    } | {
                        type: "MESSAGE_RECEIVED";
                        message: AIMessage;
                    } | {
                        type: "SUBSCRIBE";
                        channel: CommunicationChannel;
                        callback: import("../types/aiCommunication").MessageHandler;
                    } | {
                        type: "UNSUBSCRIBE";
                        channel: CommunicationChannel;
                        handlerId: string;
                    } | {
                        type: "CONNECT";
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECT";
                        agentId: string;
                    } | {
                        type: "HEARTBEAT";
                        agentId: string;
                    } | {
                        type: "GET_STATS";
                    } | {
                        type: "CLEAR_HISTORY";
                    } | {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "SEND_MESSAGE";
                        message: AIMessage;
                    } | {
                        type: "MESSAGE_RECEIVED";
                        message: AIMessage;
                    } | {
                        type: "SUBSCRIBE";
                        channel: CommunicationChannel;
                        callback: import("../types/aiCommunication").MessageHandler;
                    } | {
                        type: "UNSUBSCRIBE";
                        channel: CommunicationChannel;
                        handlerId: string;
                    } | {
                        type: "CONNECT";
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECT";
                        agentId: string;
                    } | {
                        type: "HEARTBEAT";
                        agentId: string;
                    } | {
                        type: "GET_STATS";
                    } | {
                        type: "CLEAR_HISTORY";
                    } | {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, import("xstate").AnyEventObject>;
                }) => {
                    storagePath: string;
                    since: number;
                };
                readonly onDone: {
                    readonly target: "active";
                    readonly actions: import("xstate").ActionFunction<AICommunicationContext, import("xstate").DoneActorEvent<AIMessage<unknown>[], string>, {
                        type: "SEND_MESSAGE";
                        message: AIMessage;
                    } | {
                        type: "MESSAGE_RECEIVED";
                        message: AIMessage;
                    } | {
                        type: "SUBSCRIBE";
                        channel: CommunicationChannel;
                        callback: import("../types/aiCommunication").MessageHandler;
                    } | {
                        type: "UNSUBSCRIBE";
                        channel: CommunicationChannel;
                        handlerId: string;
                    } | {
                        type: "CONNECT";
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECT";
                        agentId: string;
                    } | {
                        type: "HEARTBEAT";
                        agentId: string;
                    } | {
                        type: "GET_STATS";
                    } | {
                        type: "CLEAR_HISTORY";
                    } | {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, undefined, import("xstate").Values<{
                        persistMessage: {
                            src: "persistMessage";
                            logic: import("xstate").PromiseActorLogic<string, {
                                message: AIMessage;
                                storagePath: string;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        loadMessageHistory: {
                            src: "loadMessageHistory";
                            logic: import("xstate").PromiseActorLogic<AIMessage<unknown>[], {
                                storagePath: string;
                                since?: number;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        processOutgoingMessage: {
                            src: "processOutgoingMessage";
                            logic: import("xstate").PromiseActorLogic<{
                                signature: string;
                                id: string;
                                timestamp: number;
                                source: AIAgent;
                                target: AIAgent | "broadcast";
                                type: MessageType;
                                payload: unknown;
                                metadata: import("../types/aiCommunication").MessageMetadata;
                            }, {
                                message: AIMessage;
                                config: CommunicationConfig;
                                debugLogger?: DebugLogger;
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
                readonly SEND_MESSAGE: {
                    readonly actions: readonly ["queueMessage"];
                    readonly target: ".processingQueue";
                };
                readonly MESSAGE_RECEIVED: {
                    readonly actions: readonly ["processReceivedMessage", "notifySubscribers"];
                };
                readonly SUBSCRIBE: {
                    readonly actions: "addSubscription";
                };
                readonly UNSUBSCRIBE: {
                    readonly actions: "removeSubscription";
                };
                readonly CONNECT: {
                    readonly actions: "registerAgent";
                };
                readonly DISCONNECT: {
                    readonly actions: "unregisterAgent";
                };
                readonly HEARTBEAT: {
                    readonly actions: import("xstate").ActionFunction<AICommunicationContext, {
                        type: "HEARTBEAT";
                        agentId: string;
                    }, {
                        type: "SEND_MESSAGE";
                        message: AIMessage;
                    } | {
                        type: "MESSAGE_RECEIVED";
                        message: AIMessage;
                    } | {
                        type: "SUBSCRIBE";
                        channel: CommunicationChannel;
                        callback: import("../types/aiCommunication").MessageHandler;
                    } | {
                        type: "UNSUBSCRIBE";
                        channel: CommunicationChannel;
                        handlerId: string;
                    } | {
                        type: "CONNECT";
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECT";
                        agentId: string;
                    } | {
                        type: "HEARTBEAT";
                        agentId: string;
                    } | {
                        type: "GET_STATS";
                    } | {
                        type: "CLEAR_HISTORY";
                    } | {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, undefined, import("xstate").Values<{
                        persistMessage: {
                            src: "persistMessage";
                            logic: import("xstate").PromiseActorLogic<string, {
                                message: AIMessage;
                                storagePath: string;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        loadMessageHistory: {
                            src: "loadMessageHistory";
                            logic: import("xstate").PromiseActorLogic<AIMessage<unknown>[], {
                                storagePath: string;
                                since?: number;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        processOutgoingMessage: {
                            src: "processOutgoingMessage";
                            logic: import("xstate").PromiseActorLogic<{
                                signature: string;
                                id: string;
                                timestamp: number;
                                source: AIAgent;
                                target: AIAgent | "broadcast";
                                type: MessageType;
                                payload: unknown;
                                metadata: import("../types/aiCommunication").MessageMetadata;
                            }, {
                                message: AIMessage;
                                config: CommunicationConfig;
                                debugLogger?: DebugLogger;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
                readonly CLEAR_HISTORY: {
                    readonly actions: "clearHistory";
                };
                readonly REPLAY_MESSAGES: {
                    readonly actions: ({ context, event, self }: import("xstate").ActionArgs<AICommunicationContext, {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    }, {
                        type: "SEND_MESSAGE";
                        message: AIMessage;
                    } | {
                        type: "MESSAGE_RECEIVED";
                        message: AIMessage;
                    } | {
                        type: "SUBSCRIBE";
                        channel: CommunicationChannel;
                        callback: import("../types/aiCommunication").MessageHandler;
                    } | {
                        type: "UNSUBSCRIBE";
                        channel: CommunicationChannel;
                        handlerId: string;
                    } | {
                        type: "CONNECT";
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECT";
                        agentId: string;
                    } | {
                        type: "HEARTBEAT";
                        agentId: string;
                    } | {
                        type: "GET_STATS";
                    } | {
                        type: "CLEAR_HISTORY";
                    } | {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    } | {
                        type: "ERROR";
                        error: Error;
                    }>) => void;
                };
                readonly ERROR: {
                    readonly actions: "logError";
                };
            };
            readonly initial: "idle";
            readonly states: {
                readonly idle: {};
                readonly processingQueue: {
                    readonly always: readonly [{
                        readonly target: "sendingMessage";
                        readonly guard: ({ context }: import("xstate/dist/declarations/src/guards").GuardArgs<AICommunicationContext, {
                            type: "SEND_MESSAGE";
                            message: AIMessage;
                        } | {
                            type: "MESSAGE_RECEIVED";
                            message: AIMessage;
                        } | {
                            type: "SUBSCRIBE";
                            channel: CommunicationChannel;
                            callback: import("../types/aiCommunication").MessageHandler;
                        } | {
                            type: "UNSUBSCRIBE";
                            channel: CommunicationChannel;
                            handlerId: string;
                        } | {
                            type: "CONNECT";
                            agent: AIAgent;
                        } | {
                            type: "DISCONNECT";
                            agentId: string;
                        } | {
                            type: "HEARTBEAT";
                            agentId: string;
                        } | {
                            type: "GET_STATS";
                        } | {
                            type: "CLEAR_HISTORY";
                        } | {
                            type: "REPLAY_MESSAGES";
                            since: number;
                        } | {
                            type: "ERROR";
                            error: Error;
                        }>) => boolean;
                    }, {
                        readonly target: "idle";
                    }];
                };
                readonly sendingMessage: {
                    readonly invoke: {
                        readonly id: "processOutgoing";
                        readonly src: "processOutgoingMessage";
                        readonly input: ({ context }: {
                            context: AICommunicationContext;
                            event: {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            };
                            self: import("xstate").ActorRef<import("xstate").MachineSnapshot<AICommunicationContext, {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            }, import("xstate").AnyEventObject>;
                        }) => {
                            message: AIMessage<unknown>;
                            config: CommunicationConfig;
                            debugLogger: DebugLogger;
                        };
                        readonly onDone: {
                            readonly target: "persistingMessage";
                            readonly actions: import("xstate").ActionFunction<AICommunicationContext, import("xstate").DoneActorEvent<{
                                signature: string;
                                id: string;
                                timestamp: number;
                                source: AIAgent;
                                target: AIAgent | "broadcast";
                                type: MessageType;
                                payload: unknown;
                                metadata: import("../types/aiCommunication").MessageMetadata;
                            }, string>, {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            }, undefined, import("xstate").Values<{
                                persistMessage: {
                                    src: "persistMessage";
                                    logic: import("xstate").PromiseActorLogic<string, {
                                        message: AIMessage;
                                        storagePath: string;
                                    }, import("xstate").EventObject>;
                                    id: string | undefined;
                                };
                                loadMessageHistory: {
                                    src: "loadMessageHistory";
                                    logic: import("xstate").PromiseActorLogic<AIMessage<unknown>[], {
                                        storagePath: string;
                                        since?: number;
                                    }, import("xstate").EventObject>;
                                    id: string | undefined;
                                };
                                processOutgoingMessage: {
                                    src: "processOutgoingMessage";
                                    logic: import("xstate").PromiseActorLogic<{
                                        signature: string;
                                        id: string;
                                        timestamp: number;
                                        source: AIAgent;
                                        target: AIAgent | "broadcast";
                                        type: MessageType;
                                        payload: unknown;
                                        metadata: import("../types/aiCommunication").MessageMetadata;
                                    }, {
                                        message: AIMessage;
                                        config: CommunicationConfig;
                                        debugLogger?: DebugLogger;
                                    }, import("xstate").EventObject>;
                                    id: string | undefined;
                                };
                            }>, never, never, never, never>;
                        };
                        readonly onError: {
                            readonly target: "idle";
                            readonly actions: readonly ["logError", import("xstate").ActionFunction<AICommunicationContext, import("xstate").ErrorActorEvent<unknown, string>, {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            }, undefined, import("xstate").Values<{
                                persistMessage: {
                                    src: "persistMessage";
                                    logic: import("xstate").PromiseActorLogic<string, {
                                        message: AIMessage;
                                        storagePath: string;
                                    }, import("xstate").EventObject>;
                                    id: string | undefined;
                                };
                                loadMessageHistory: {
                                    src: "loadMessageHistory";
                                    logic: import("xstate").PromiseActorLogic<AIMessage<unknown>[], {
                                        storagePath: string;
                                        since?: number;
                                    }, import("xstate").EventObject>;
                                    id: string | undefined;
                                };
                                processOutgoingMessage: {
                                    src: "processOutgoingMessage";
                                    logic: import("xstate").PromiseActorLogic<{
                                        signature: string;
                                        id: string;
                                        timestamp: number;
                                        source: AIAgent;
                                        target: AIAgent | "broadcast";
                                        type: MessageType;
                                        payload: unknown;
                                        metadata: import("../types/aiCommunication").MessageMetadata;
                                    }, {
                                        message: AIMessage;
                                        config: CommunicationConfig;
                                        debugLogger?: DebugLogger;
                                    }, import("xstate").EventObject>;
                                    id: string | undefined;
                                };
                            }>, never, never, never, never>];
                        };
                    };
                };
                readonly persistingMessage: {
                    readonly invoke: {
                        readonly id: "persist";
                        readonly src: "persistMessage";
                        readonly input: ({ context }: {
                            context: AICommunicationContext;
                            event: {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            };
                            self: import("xstate").ActorRef<import("xstate").MachineSnapshot<AICommunicationContext, {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            }, import("xstate").AnyEventObject>;
                        }) => {
                            message: AIMessage<unknown>;
                            storagePath: string;
                        };
                        readonly onDone: {
                            readonly target: "processingQueue";
                        };
                        readonly onError: {
                            readonly target: "processingQueue";
                            readonly actions: "logError";
                        };
                    };
                };
            };
        };
    };
}>;
/**
 * Create and start the AI Communication Bridge actor
 */
export declare function createAICommunicationBridge(debugLogger?: DebugLogger): import("xstate").Actor<import("xstate").StateMachine<AICommunicationContext, {
    type: "SEND_MESSAGE";
    message: AIMessage;
} | {
    type: "MESSAGE_RECEIVED";
    message: AIMessage;
} | {
    type: "SUBSCRIBE";
    channel: CommunicationChannel;
    callback: import("../types/aiCommunication").MessageHandler;
} | {
    type: "UNSUBSCRIBE";
    channel: CommunicationChannel;
    handlerId: string;
} | {
    type: "CONNECT";
    agent: AIAgent;
} | {
    type: "DISCONNECT";
    agentId: string;
} | {
    type: "HEARTBEAT";
    agentId: string;
} | {
    type: "GET_STATS";
} | {
    type: "CLEAR_HISTORY";
} | {
    type: "REPLAY_MESSAGES";
    since: number;
} | {
    type: "ERROR";
    error: Error;
}, {
    [x: string]: import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<string, {
        message: AIMessage;
        storagePath: string;
    }, import("xstate").EventObject>> | import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<AIMessage<unknown>[], {
        storagePath: string;
        since?: number;
    }, import("xstate").EventObject>> | import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<{
        signature: string;
        id: string;
        timestamp: number;
        source: AIAgent;
        target: AIAgent | "broadcast";
        type: MessageType;
        payload: unknown;
        metadata: import("../types/aiCommunication").MessageMetadata;
    }, {
        message: AIMessage;
        config: CommunicationConfig;
        debugLogger?: DebugLogger;
    }, import("xstate").EventObject>> | undefined;
}, import("xstate").Values<{
    persistMessage: {
        src: "persistMessage";
        logic: import("xstate").PromiseActorLogic<string, {
            message: AIMessage;
            storagePath: string;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
    loadMessageHistory: {
        src: "loadMessageHistory";
        logic: import("xstate").PromiseActorLogic<AIMessage<unknown>[], {
            storagePath: string;
            since?: number;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
    processOutgoingMessage: {
        src: "processOutgoingMessage";
        logic: import("xstate").PromiseActorLogic<{
            signature: string;
            id: string;
            timestamp: number;
            source: AIAgent;
            target: AIAgent | "broadcast";
            type: MessageType;
            payload: unknown;
            metadata: import("../types/aiCommunication").MessageMetadata;
        }, {
            message: AIMessage;
            config: CommunicationConfig;
            debugLogger?: DebugLogger;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
}>, import("xstate").Values<{
    initialize: {
        type: "initialize";
        params: import("xstate").NonReducibleUnknown;
    };
    queueMessage: {
        type: "queueMessage";
        params: import("xstate").NonReducibleUnknown;
    };
    processReceivedMessage: {
        type: "processReceivedMessage";
        params: import("xstate").NonReducibleUnknown;
    };
    notifySubscribers: {
        type: "notifySubscribers";
        params: unknown;
    };
    addSubscription: {
        type: "addSubscription";
        params: import("xstate").NonReducibleUnknown;
    };
    removeSubscription: {
        type: "removeSubscription";
        params: import("xstate").NonReducibleUnknown;
    };
    registerAgent: {
        type: "registerAgent";
        params: import("xstate").NonReducibleUnknown;
    };
    unregisterAgent: {
        type: "unregisterAgent";
        params: import("xstate").NonReducibleUnknown;
    };
    clearHistory: {
        type: "clearHistory";
        params: import("xstate").NonReducibleUnknown;
    };
    logError: {
        type: "logError";
        params: import("xstate").NonReducibleUnknown;
    };
}>, never, never, "initializing" | {
    active: "idle" | "processingQueue" | "sendingMessage" | "persistingMessage";
}, string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "aiCommunicationBridge";
    readonly initial: "initializing";
    readonly context: {
        readonly agents: Map<any, any>;
        readonly messageQueue: [];
        readonly messageHistory: [];
        readonly subscriptions: Map<any, any>;
        readonly stats: {
            readonly messagesSent: 0;
            readonly messagesReceived: 0;
            readonly messagesDropped: 0;
            readonly averageLatency: 0;
            readonly activeConnections: 0;
            readonly lastActivity: number;
        };
        readonly config: CommunicationConfig;
        readonly errors: [];
    };
    readonly states: {
        readonly initializing: {
            readonly entry: "initialize";
            readonly invoke: {
                readonly id: "loadHistory";
                readonly src: "loadMessageHistory";
                readonly input: ({ context }: {
                    context: AICommunicationContext;
                    event: {
                        type: "SEND_MESSAGE";
                        message: AIMessage;
                    } | {
                        type: "MESSAGE_RECEIVED";
                        message: AIMessage;
                    } | {
                        type: "SUBSCRIBE";
                        channel: CommunicationChannel;
                        callback: import("../types/aiCommunication").MessageHandler;
                    } | {
                        type: "UNSUBSCRIBE";
                        channel: CommunicationChannel;
                        handlerId: string;
                    } | {
                        type: "CONNECT";
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECT";
                        agentId: string;
                    } | {
                        type: "HEARTBEAT";
                        agentId: string;
                    } | {
                        type: "GET_STATS";
                    } | {
                        type: "CLEAR_HISTORY";
                    } | {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    } | {
                        type: "ERROR";
                        error: Error;
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<AICommunicationContext, {
                        type: "SEND_MESSAGE";
                        message: AIMessage;
                    } | {
                        type: "MESSAGE_RECEIVED";
                        message: AIMessage;
                    } | {
                        type: "SUBSCRIBE";
                        channel: CommunicationChannel;
                        callback: import("../types/aiCommunication").MessageHandler;
                    } | {
                        type: "UNSUBSCRIBE";
                        channel: CommunicationChannel;
                        handlerId: string;
                    } | {
                        type: "CONNECT";
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECT";
                        agentId: string;
                    } | {
                        type: "HEARTBEAT";
                        agentId: string;
                    } | {
                        type: "GET_STATS";
                    } | {
                        type: "CLEAR_HISTORY";
                    } | {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "SEND_MESSAGE";
                        message: AIMessage;
                    } | {
                        type: "MESSAGE_RECEIVED";
                        message: AIMessage;
                    } | {
                        type: "SUBSCRIBE";
                        channel: CommunicationChannel;
                        callback: import("../types/aiCommunication").MessageHandler;
                    } | {
                        type: "UNSUBSCRIBE";
                        channel: CommunicationChannel;
                        handlerId: string;
                    } | {
                        type: "CONNECT";
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECT";
                        agentId: string;
                    } | {
                        type: "HEARTBEAT";
                        agentId: string;
                    } | {
                        type: "GET_STATS";
                    } | {
                        type: "CLEAR_HISTORY";
                    } | {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, import("xstate").AnyEventObject>;
                }) => {
                    storagePath: string;
                    since: number;
                };
                readonly onDone: {
                    readonly target: "active";
                    readonly actions: import("xstate").ActionFunction<AICommunicationContext, import("xstate").DoneActorEvent<AIMessage<unknown>[], string>, {
                        type: "SEND_MESSAGE";
                        message: AIMessage;
                    } | {
                        type: "MESSAGE_RECEIVED";
                        message: AIMessage;
                    } | {
                        type: "SUBSCRIBE";
                        channel: CommunicationChannel;
                        callback: import("../types/aiCommunication").MessageHandler;
                    } | {
                        type: "UNSUBSCRIBE";
                        channel: CommunicationChannel;
                        handlerId: string;
                    } | {
                        type: "CONNECT";
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECT";
                        agentId: string;
                    } | {
                        type: "HEARTBEAT";
                        agentId: string;
                    } | {
                        type: "GET_STATS";
                    } | {
                        type: "CLEAR_HISTORY";
                    } | {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, undefined, import("xstate").Values<{
                        persistMessage: {
                            src: "persistMessage";
                            logic: import("xstate").PromiseActorLogic<string, {
                                message: AIMessage;
                                storagePath: string;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        loadMessageHistory: {
                            src: "loadMessageHistory";
                            logic: import("xstate").PromiseActorLogic<AIMessage<unknown>[], {
                                storagePath: string;
                                since?: number;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        processOutgoingMessage: {
                            src: "processOutgoingMessage";
                            logic: import("xstate").PromiseActorLogic<{
                                signature: string;
                                id: string;
                                timestamp: number;
                                source: AIAgent;
                                target: AIAgent | "broadcast";
                                type: MessageType;
                                payload: unknown;
                                metadata: import("../types/aiCommunication").MessageMetadata;
                            }, {
                                message: AIMessage;
                                config: CommunicationConfig;
                                debugLogger?: DebugLogger;
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
                readonly SEND_MESSAGE: {
                    readonly actions: readonly ["queueMessage"];
                    readonly target: ".processingQueue";
                };
                readonly MESSAGE_RECEIVED: {
                    readonly actions: readonly ["processReceivedMessage", "notifySubscribers"];
                };
                readonly SUBSCRIBE: {
                    readonly actions: "addSubscription";
                };
                readonly UNSUBSCRIBE: {
                    readonly actions: "removeSubscription";
                };
                readonly CONNECT: {
                    readonly actions: "registerAgent";
                };
                readonly DISCONNECT: {
                    readonly actions: "unregisterAgent";
                };
                readonly HEARTBEAT: {
                    readonly actions: import("xstate").ActionFunction<AICommunicationContext, {
                        type: "HEARTBEAT";
                        agentId: string;
                    }, {
                        type: "SEND_MESSAGE";
                        message: AIMessage;
                    } | {
                        type: "MESSAGE_RECEIVED";
                        message: AIMessage;
                    } | {
                        type: "SUBSCRIBE";
                        channel: CommunicationChannel;
                        callback: import("../types/aiCommunication").MessageHandler;
                    } | {
                        type: "UNSUBSCRIBE";
                        channel: CommunicationChannel;
                        handlerId: string;
                    } | {
                        type: "CONNECT";
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECT";
                        agentId: string;
                    } | {
                        type: "HEARTBEAT";
                        agentId: string;
                    } | {
                        type: "GET_STATS";
                    } | {
                        type: "CLEAR_HISTORY";
                    } | {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, undefined, import("xstate").Values<{
                        persistMessage: {
                            src: "persistMessage";
                            logic: import("xstate").PromiseActorLogic<string, {
                                message: AIMessage;
                                storagePath: string;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        loadMessageHistory: {
                            src: "loadMessageHistory";
                            logic: import("xstate").PromiseActorLogic<AIMessage<unknown>[], {
                                storagePath: string;
                                since?: number;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        processOutgoingMessage: {
                            src: "processOutgoingMessage";
                            logic: import("xstate").PromiseActorLogic<{
                                signature: string;
                                id: string;
                                timestamp: number;
                                source: AIAgent;
                                target: AIAgent | "broadcast";
                                type: MessageType;
                                payload: unknown;
                                metadata: import("../types/aiCommunication").MessageMetadata;
                            }, {
                                message: AIMessage;
                                config: CommunicationConfig;
                                debugLogger?: DebugLogger;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
                readonly CLEAR_HISTORY: {
                    readonly actions: "clearHistory";
                };
                readonly REPLAY_MESSAGES: {
                    readonly actions: ({ context, event, self }: import("xstate").ActionArgs<AICommunicationContext, {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    }, {
                        type: "SEND_MESSAGE";
                        message: AIMessage;
                    } | {
                        type: "MESSAGE_RECEIVED";
                        message: AIMessage;
                    } | {
                        type: "SUBSCRIBE";
                        channel: CommunicationChannel;
                        callback: import("../types/aiCommunication").MessageHandler;
                    } | {
                        type: "UNSUBSCRIBE";
                        channel: CommunicationChannel;
                        handlerId: string;
                    } | {
                        type: "CONNECT";
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECT";
                        agentId: string;
                    } | {
                        type: "HEARTBEAT";
                        agentId: string;
                    } | {
                        type: "GET_STATS";
                    } | {
                        type: "CLEAR_HISTORY";
                    } | {
                        type: "REPLAY_MESSAGES";
                        since: number;
                    } | {
                        type: "ERROR";
                        error: Error;
                    }>) => void;
                };
                readonly ERROR: {
                    readonly actions: "logError";
                };
            };
            readonly initial: "idle";
            readonly states: {
                readonly idle: {};
                readonly processingQueue: {
                    readonly always: readonly [{
                        readonly target: "sendingMessage";
                        readonly guard: ({ context }: import("xstate/dist/declarations/src/guards").GuardArgs<AICommunicationContext, {
                            type: "SEND_MESSAGE";
                            message: AIMessage;
                        } | {
                            type: "MESSAGE_RECEIVED";
                            message: AIMessage;
                        } | {
                            type: "SUBSCRIBE";
                            channel: CommunicationChannel;
                            callback: import("../types/aiCommunication").MessageHandler;
                        } | {
                            type: "UNSUBSCRIBE";
                            channel: CommunicationChannel;
                            handlerId: string;
                        } | {
                            type: "CONNECT";
                            agent: AIAgent;
                        } | {
                            type: "DISCONNECT";
                            agentId: string;
                        } | {
                            type: "HEARTBEAT";
                            agentId: string;
                        } | {
                            type: "GET_STATS";
                        } | {
                            type: "CLEAR_HISTORY";
                        } | {
                            type: "REPLAY_MESSAGES";
                            since: number;
                        } | {
                            type: "ERROR";
                            error: Error;
                        }>) => boolean;
                    }, {
                        readonly target: "idle";
                    }];
                };
                readonly sendingMessage: {
                    readonly invoke: {
                        readonly id: "processOutgoing";
                        readonly src: "processOutgoingMessage";
                        readonly input: ({ context }: {
                            context: AICommunicationContext;
                            event: {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            };
                            self: import("xstate").ActorRef<import("xstate").MachineSnapshot<AICommunicationContext, {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            }, import("xstate").AnyEventObject>;
                        }) => {
                            message: AIMessage<unknown>;
                            config: CommunicationConfig;
                            debugLogger: DebugLogger;
                        };
                        readonly onDone: {
                            readonly target: "persistingMessage";
                            readonly actions: import("xstate").ActionFunction<AICommunicationContext, import("xstate").DoneActorEvent<{
                                signature: string;
                                id: string;
                                timestamp: number;
                                source: AIAgent;
                                target: AIAgent | "broadcast";
                                type: MessageType;
                                payload: unknown;
                                metadata: import("../types/aiCommunication").MessageMetadata;
                            }, string>, {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            }, undefined, import("xstate").Values<{
                                persistMessage: {
                                    src: "persistMessage";
                                    logic: import("xstate").PromiseActorLogic<string, {
                                        message: AIMessage;
                                        storagePath: string;
                                    }, import("xstate").EventObject>;
                                    id: string | undefined;
                                };
                                loadMessageHistory: {
                                    src: "loadMessageHistory";
                                    logic: import("xstate").PromiseActorLogic<AIMessage<unknown>[], {
                                        storagePath: string;
                                        since?: number;
                                    }, import("xstate").EventObject>;
                                    id: string | undefined;
                                };
                                processOutgoingMessage: {
                                    src: "processOutgoingMessage";
                                    logic: import("xstate").PromiseActorLogic<{
                                        signature: string;
                                        id: string;
                                        timestamp: number;
                                        source: AIAgent;
                                        target: AIAgent | "broadcast";
                                        type: MessageType;
                                        payload: unknown;
                                        metadata: import("../types/aiCommunication").MessageMetadata;
                                    }, {
                                        message: AIMessage;
                                        config: CommunicationConfig;
                                        debugLogger?: DebugLogger;
                                    }, import("xstate").EventObject>;
                                    id: string | undefined;
                                };
                            }>, never, never, never, never>;
                        };
                        readonly onError: {
                            readonly target: "idle";
                            readonly actions: readonly ["logError", import("xstate").ActionFunction<AICommunicationContext, import("xstate").ErrorActorEvent<unknown, string>, {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            }, undefined, import("xstate").Values<{
                                persistMessage: {
                                    src: "persistMessage";
                                    logic: import("xstate").PromiseActorLogic<string, {
                                        message: AIMessage;
                                        storagePath: string;
                                    }, import("xstate").EventObject>;
                                    id: string | undefined;
                                };
                                loadMessageHistory: {
                                    src: "loadMessageHistory";
                                    logic: import("xstate").PromiseActorLogic<AIMessage<unknown>[], {
                                        storagePath: string;
                                        since?: number;
                                    }, import("xstate").EventObject>;
                                    id: string | undefined;
                                };
                                processOutgoingMessage: {
                                    src: "processOutgoingMessage";
                                    logic: import("xstate").PromiseActorLogic<{
                                        signature: string;
                                        id: string;
                                        timestamp: number;
                                        source: AIAgent;
                                        target: AIAgent | "broadcast";
                                        type: MessageType;
                                        payload: unknown;
                                        metadata: import("../types/aiCommunication").MessageMetadata;
                                    }, {
                                        message: AIMessage;
                                        config: CommunicationConfig;
                                        debugLogger?: DebugLogger;
                                    }, import("xstate").EventObject>;
                                    id: string | undefined;
                                };
                            }>, never, never, never, never>];
                        };
                    };
                };
                readonly persistingMessage: {
                    readonly invoke: {
                        readonly id: "persist";
                        readonly src: "persistMessage";
                        readonly input: ({ context }: {
                            context: AICommunicationContext;
                            event: {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            };
                            self: import("xstate").ActorRef<import("xstate").MachineSnapshot<AICommunicationContext, {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                                type: "SEND_MESSAGE";
                                message: AIMessage;
                            } | {
                                type: "MESSAGE_RECEIVED";
                                message: AIMessage;
                            } | {
                                type: "SUBSCRIBE";
                                channel: CommunicationChannel;
                                callback: import("../types/aiCommunication").MessageHandler;
                            } | {
                                type: "UNSUBSCRIBE";
                                channel: CommunicationChannel;
                                handlerId: string;
                            } | {
                                type: "CONNECT";
                                agent: AIAgent;
                            } | {
                                type: "DISCONNECT";
                                agentId: string;
                            } | {
                                type: "HEARTBEAT";
                                agentId: string;
                            } | {
                                type: "GET_STATS";
                            } | {
                                type: "CLEAR_HISTORY";
                            } | {
                                type: "REPLAY_MESSAGES";
                                since: number;
                            } | {
                                type: "ERROR";
                                error: Error;
                            }, import("xstate").AnyEventObject>;
                        }) => {
                            message: AIMessage<unknown>;
                            storagePath: string;
                        };
                        readonly onDone: {
                            readonly target: "processingQueue";
                        };
                        readonly onError: {
                            readonly target: "processingQueue";
                            readonly actions: "logError";
                        };
                    };
                };
            };
        };
    };
}>>;
/**
 * Helper function to create an AI agent
 */
export declare function createAIAgent(type: 'claude' | 'cursor' | 'custom', name: string): AIAgent;
/**
 * Helper function to create a message
 */
export declare function createMessage<T = unknown>(source: AIAgent, target: AIAgent | 'broadcast', type: MessageType, payload: T, options?: Partial<{
    priority: MessagePriority;
    channel: CommunicationChannel;
    correlationId: string;
    replyTo: string;
}>): AIMessage<T>;
//# sourceMappingURL=aiCommunicationBridge.d.ts.map
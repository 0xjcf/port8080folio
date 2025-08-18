/**
 * WebSocket Server Actor
 *
 * This actor manages a WebSocket server for real-time AI-to-AI communication.
 * It handles connections, message routing, and connection health monitoring.
 */
import * as http from 'node:http';
import * as WebSocket from 'ws';
import type { DebugLogger } from '../core/debugLogger';
import type { AIAgent, AIMessage } from '../types/aiCommunication';
/**
 * WebSocket client connection
 */
export interface WSConnection {
    id: string;
    ws: WebSocket.WebSocket;
    agent: AIAgent;
    connectedAt: number;
    lastActivity: number;
    messageCount: number;
}
/**
 * WebSocket server configuration
 */
export interface WSServerConfig {
    port: number;
    host: string;
    maxConnections: number;
    heartbeatInterval: number;
    connectionTimeout: number;
    messageTimeout: number;
    maxMessageSize: number;
}
/**
 * WebSocket server context
 */
export interface WSServerContext {
    server: WebSocket.Server | null;
    httpServer: http.Server | null;
    connections: Map<string, WSConnection>;
    config: WSServerConfig;
    stats: {
        totalConnections: number;
        activeConnections: number;
        messagesSent: number;
        messagesReceived: number;
        errors: number;
    };
    errors: Error[];
}
/**
 * WebSocket server events
 */
export type WSServerEvent = {
    type: 'START';
} | {
    type: 'STOP';
} | {
    type: 'CONNECTION';
    ws: WebSocket.WebSocket;
    agent: AIAgent;
} | {
    type: 'DISCONNECTION';
    connectionId: string;
} | {
    type: 'MESSAGE';
    connectionId: string;
    message: AIMessage;
} | {
    type: 'BROADCAST';
    message: AIMessage;
    excludeId?: string;
} | {
    type: 'SEND_TO';
    connectionId: string;
    message: AIMessage;
} | {
    type: 'HEARTBEAT';
} | {
    type: 'ERROR';
    error: Error;
};
/**
 * Create the WebSocket server state machine
 */
export declare const webSocketServerMachine: import("xstate").StateMachine<WSServerContext, {
    type: "START";
} | {
    type: "STOP";
} | {
    type: "CONNECTION";
    ws: WebSocket.WebSocket;
    agent: AIAgent;
} | {
    type: "DISCONNECTION";
    connectionId: string;
} | {
    type: "MESSAGE";
    connectionId: string;
    message: AIMessage;
} | {
    type: "BROADCAST";
    message: AIMessage;
    excludeId?: string;
} | {
    type: "SEND_TO";
    connectionId: string;
    message: AIMessage;
} | {
    type: "HEARTBEAT";
} | {
    type: "ERROR";
    error: Error;
}, {
    [x: string]: import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<{
        server: WebSocket.Server;
        httpServer: http.Server;
    }, {
        config: WSServerConfig;
        onConnection: (ws: WebSocket.WebSocket) => void;
        debugLogger?: DebugLogger;
    }, import("xstate").EventObject>> | import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<void, {
        server: WebSocket.Server | null;
        httpServer: http.Server | null;
        connections: Map<string, WSConnection>;
    }, import("xstate").EventObject>> | undefined;
}, import("xstate").Values<{
    startServer: {
        src: "startServer";
        logic: import("xstate").PromiseActorLogic<{
            server: WebSocket.Server;
            httpServer: http.Server;
        }, {
            config: WSServerConfig;
            onConnection: (ws: WebSocket.WebSocket) => void;
            debugLogger?: DebugLogger;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
    stopServer: {
        src: "stopServer";
        logic: import("xstate").PromiseActorLogic<void, {
            server: WebSocket.Server | null;
            httpServer: http.Server | null;
            connections: Map<string, WSConnection>;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
}>, import("xstate").Values<{
    initialize: {
        type: "initialize";
        params: import("xstate").NonReducibleUnknown;
    };
    logError: {
        type: "logError";
        params: import("xstate").NonReducibleUnknown;
    };
    setServer: {
        type: "setServer";
        params: import("xstate").NonReducibleUnknown;
    };
    addConnection: {
        type: "addConnection";
        params: import("xstate").NonReducibleUnknown;
    };
    removeConnection: {
        type: "removeConnection";
        params: import("xstate").NonReducibleUnknown;
    };
    handleMessage: {
        type: "handleMessage";
        params: import("xstate").NonReducibleUnknown;
    };
    broadcastMessage: {
        type: "broadcastMessage";
        params: unknown;
    };
    sendToConnection: {
        type: "sendToConnection";
        params: unknown;
    };
    checkConnections: {
        type: "checkConnections";
        params: unknown;
    };
    clearServer: {
        type: "clearServer";
        params: import("xstate").NonReducibleUnknown;
    };
}>, never, never, "stopped" | "starting" | "running" | "stopping", string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "webSocketServer";
    readonly initial: "stopped";
    readonly context: {
        readonly server: null;
        readonly httpServer: null;
        readonly connections: Map<any, any>;
        readonly config: WSServerConfig;
        readonly stats: {
            readonly totalConnections: 0;
            readonly activeConnections: 0;
            readonly messagesSent: 0;
            readonly messagesReceived: 0;
            readonly errors: 0;
        };
        readonly errors: [];
    };
    readonly states: {
        readonly stopped: {
            readonly entry: "initialize";
            readonly on: {
                readonly START: "starting";
            };
        };
        readonly starting: {
            readonly invoke: {
                readonly id: "startServer";
                readonly src: "startServer";
                readonly input: ({ context, self }: {
                    context: WSServerContext;
                    event: {
                        type: "START";
                    } | {
                        type: "STOP";
                    } | {
                        type: "CONNECTION";
                        ws: WebSocket.WebSocket;
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECTION";
                        connectionId: string;
                    } | {
                        type: "MESSAGE";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "BROADCAST";
                        message: AIMessage;
                        excludeId?: string;
                    } | {
                        type: "SEND_TO";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "HEARTBEAT";
                    } | {
                        type: "ERROR";
                        error: Error;
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<WSServerContext, {
                        type: "START";
                    } | {
                        type: "STOP";
                    } | {
                        type: "CONNECTION";
                        ws: WebSocket.WebSocket;
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECTION";
                        connectionId: string;
                    } | {
                        type: "MESSAGE";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "BROADCAST";
                        message: AIMessage;
                        excludeId?: string;
                    } | {
                        type: "SEND_TO";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "HEARTBEAT";
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "START";
                    } | {
                        type: "STOP";
                    } | {
                        type: "CONNECTION";
                        ws: WebSocket.WebSocket;
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECTION";
                        connectionId: string;
                    } | {
                        type: "MESSAGE";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "BROADCAST";
                        message: AIMessage;
                        excludeId?: string;
                    } | {
                        type: "SEND_TO";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "HEARTBEAT";
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, import("xstate").AnyEventObject>;
                }) => {
                    config: WSServerConfig;
                    onConnection: (ws: WebSocket.WebSocket) => void;
                    debugLogger: undefined;
                };
                readonly onDone: {
                    readonly target: "running";
                    readonly actions: "setServer";
                };
                readonly onError: {
                    readonly target: "stopped";
                    readonly actions: "logError";
                };
            };
        };
        readonly running: {
            readonly on: {
                readonly CONNECTION: {
                    readonly actions: "addConnection";
                };
                readonly DISCONNECTION: {
                    readonly actions: "removeConnection";
                };
                readonly MESSAGE: {
                    readonly actions: "handleMessage";
                };
                readonly BROADCAST: {
                    readonly actions: "broadcastMessage";
                };
                readonly SEND_TO: {
                    readonly actions: "sendToConnection";
                };
                readonly HEARTBEAT: {
                    readonly actions: "checkConnections";
                };
                readonly STOP: "stopping";
                readonly ERROR: {
                    readonly actions: "logError";
                };
            };
        };
        readonly stopping: {
            readonly invoke: {
                readonly id: "stopServer";
                readonly src: "stopServer";
                readonly input: ({ context }: {
                    context: WSServerContext;
                    event: {
                        type: "START";
                    } | {
                        type: "STOP";
                    } | {
                        type: "CONNECTION";
                        ws: WebSocket.WebSocket;
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECTION";
                        connectionId: string;
                    } | {
                        type: "MESSAGE";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "BROADCAST";
                        message: AIMessage;
                        excludeId?: string;
                    } | {
                        type: "SEND_TO";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "HEARTBEAT";
                    } | {
                        type: "ERROR";
                        error: Error;
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<WSServerContext, {
                        type: "START";
                    } | {
                        type: "STOP";
                    } | {
                        type: "CONNECTION";
                        ws: WebSocket.WebSocket;
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECTION";
                        connectionId: string;
                    } | {
                        type: "MESSAGE";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "BROADCAST";
                        message: AIMessage;
                        excludeId?: string;
                    } | {
                        type: "SEND_TO";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "HEARTBEAT";
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "START";
                    } | {
                        type: "STOP";
                    } | {
                        type: "CONNECTION";
                        ws: WebSocket.WebSocket;
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECTION";
                        connectionId: string;
                    } | {
                        type: "MESSAGE";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "BROADCAST";
                        message: AIMessage;
                        excludeId?: string;
                    } | {
                        type: "SEND_TO";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "HEARTBEAT";
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, import("xstate").AnyEventObject>;
                }) => {
                    server: WebSocket.Server<typeof import("ws"), typeof http.IncomingMessage> | null;
                    httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> | null;
                    connections: Map<string, WSConnection>;
                };
                readonly onDone: {
                    readonly target: "stopped";
                    readonly actions: "clearServer";
                };
                readonly onError: {
                    readonly target: "stopped";
                    readonly actions: readonly ["logError", "clearServer"];
                };
            };
        };
    };
}>;
/**
 * Create and start a WebSocket server actor
 */
export declare function createWebSocketServer(config?: Partial<WSServerConfig>, debugLogger?: DebugLogger): import("xstate").Actor<import("xstate").StateMachine<WSServerContext, {
    type: "START";
} | {
    type: "STOP";
} | {
    type: "CONNECTION";
    ws: WebSocket.WebSocket;
    agent: AIAgent;
} | {
    type: "DISCONNECTION";
    connectionId: string;
} | {
    type: "MESSAGE";
    connectionId: string;
    message: AIMessage;
} | {
    type: "BROADCAST";
    message: AIMessage;
    excludeId?: string;
} | {
    type: "SEND_TO";
    connectionId: string;
    message: AIMessage;
} | {
    type: "HEARTBEAT";
} | {
    type: "ERROR";
    error: Error;
}, {
    [x: string]: import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<{
        server: WebSocket.Server;
        httpServer: http.Server;
    }, {
        config: WSServerConfig;
        onConnection: (ws: WebSocket.WebSocket) => void;
        debugLogger?: DebugLogger;
    }, import("xstate").EventObject>> | import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<void, {
        server: WebSocket.Server | null;
        httpServer: http.Server | null;
        connections: Map<string, WSConnection>;
    }, import("xstate").EventObject>> | undefined;
}, import("xstate").Values<{
    startServer: {
        src: "startServer";
        logic: import("xstate").PromiseActorLogic<{
            server: WebSocket.Server;
            httpServer: http.Server;
        }, {
            config: WSServerConfig;
            onConnection: (ws: WebSocket.WebSocket) => void;
            debugLogger?: DebugLogger;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
    stopServer: {
        src: "stopServer";
        logic: import("xstate").PromiseActorLogic<void, {
            server: WebSocket.Server | null;
            httpServer: http.Server | null;
            connections: Map<string, WSConnection>;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
}>, import("xstate").Values<{
    initialize: {
        type: "initialize";
        params: import("xstate").NonReducibleUnknown;
    };
    logError: {
        type: "logError";
        params: import("xstate").NonReducibleUnknown;
    };
    setServer: {
        type: "setServer";
        params: import("xstate").NonReducibleUnknown;
    };
    addConnection: {
        type: "addConnection";
        params: import("xstate").NonReducibleUnknown;
    };
    removeConnection: {
        type: "removeConnection";
        params: import("xstate").NonReducibleUnknown;
    };
    handleMessage: {
        type: "handleMessage";
        params: import("xstate").NonReducibleUnknown;
    };
    broadcastMessage: {
        type: "broadcastMessage";
        params: unknown;
    };
    sendToConnection: {
        type: "sendToConnection";
        params: unknown;
    };
    checkConnections: {
        type: "checkConnections";
        params: unknown;
    };
    clearServer: {
        type: "clearServer";
        params: import("xstate").NonReducibleUnknown;
    };
}>, never, never, "stopped" | "starting" | "running" | "stopping", string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "webSocketServer";
    readonly initial: "stopped";
    readonly context: {
        readonly server: null;
        readonly httpServer: null;
        readonly connections: Map<any, any>;
        readonly config: WSServerConfig;
        readonly stats: {
            readonly totalConnections: 0;
            readonly activeConnections: 0;
            readonly messagesSent: 0;
            readonly messagesReceived: 0;
            readonly errors: 0;
        };
        readonly errors: [];
    };
    readonly states: {
        readonly stopped: {
            readonly entry: "initialize";
            readonly on: {
                readonly START: "starting";
            };
        };
        readonly starting: {
            readonly invoke: {
                readonly id: "startServer";
                readonly src: "startServer";
                readonly input: ({ context, self }: {
                    context: WSServerContext;
                    event: {
                        type: "START";
                    } | {
                        type: "STOP";
                    } | {
                        type: "CONNECTION";
                        ws: WebSocket.WebSocket;
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECTION";
                        connectionId: string;
                    } | {
                        type: "MESSAGE";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "BROADCAST";
                        message: AIMessage;
                        excludeId?: string;
                    } | {
                        type: "SEND_TO";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "HEARTBEAT";
                    } | {
                        type: "ERROR";
                        error: Error;
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<WSServerContext, {
                        type: "START";
                    } | {
                        type: "STOP";
                    } | {
                        type: "CONNECTION";
                        ws: WebSocket.WebSocket;
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECTION";
                        connectionId: string;
                    } | {
                        type: "MESSAGE";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "BROADCAST";
                        message: AIMessage;
                        excludeId?: string;
                    } | {
                        type: "SEND_TO";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "HEARTBEAT";
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "START";
                    } | {
                        type: "STOP";
                    } | {
                        type: "CONNECTION";
                        ws: WebSocket.WebSocket;
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECTION";
                        connectionId: string;
                    } | {
                        type: "MESSAGE";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "BROADCAST";
                        message: AIMessage;
                        excludeId?: string;
                    } | {
                        type: "SEND_TO";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "HEARTBEAT";
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, import("xstate").AnyEventObject>;
                }) => {
                    config: WSServerConfig;
                    onConnection: (ws: WebSocket.WebSocket) => void;
                    debugLogger: undefined;
                };
                readonly onDone: {
                    readonly target: "running";
                    readonly actions: "setServer";
                };
                readonly onError: {
                    readonly target: "stopped";
                    readonly actions: "logError";
                };
            };
        };
        readonly running: {
            readonly on: {
                readonly CONNECTION: {
                    readonly actions: "addConnection";
                };
                readonly DISCONNECTION: {
                    readonly actions: "removeConnection";
                };
                readonly MESSAGE: {
                    readonly actions: "handleMessage";
                };
                readonly BROADCAST: {
                    readonly actions: "broadcastMessage";
                };
                readonly SEND_TO: {
                    readonly actions: "sendToConnection";
                };
                readonly HEARTBEAT: {
                    readonly actions: "checkConnections";
                };
                readonly STOP: "stopping";
                readonly ERROR: {
                    readonly actions: "logError";
                };
            };
        };
        readonly stopping: {
            readonly invoke: {
                readonly id: "stopServer";
                readonly src: "stopServer";
                readonly input: ({ context }: {
                    context: WSServerContext;
                    event: {
                        type: "START";
                    } | {
                        type: "STOP";
                    } | {
                        type: "CONNECTION";
                        ws: WebSocket.WebSocket;
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECTION";
                        connectionId: string;
                    } | {
                        type: "MESSAGE";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "BROADCAST";
                        message: AIMessage;
                        excludeId?: string;
                    } | {
                        type: "SEND_TO";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "HEARTBEAT";
                    } | {
                        type: "ERROR";
                        error: Error;
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<WSServerContext, {
                        type: "START";
                    } | {
                        type: "STOP";
                    } | {
                        type: "CONNECTION";
                        ws: WebSocket.WebSocket;
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECTION";
                        connectionId: string;
                    } | {
                        type: "MESSAGE";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "BROADCAST";
                        message: AIMessage;
                        excludeId?: string;
                    } | {
                        type: "SEND_TO";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "HEARTBEAT";
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "START";
                    } | {
                        type: "STOP";
                    } | {
                        type: "CONNECTION";
                        ws: WebSocket.WebSocket;
                        agent: AIAgent;
                    } | {
                        type: "DISCONNECTION";
                        connectionId: string;
                    } | {
                        type: "MESSAGE";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "BROADCAST";
                        message: AIMessage;
                        excludeId?: string;
                    } | {
                        type: "SEND_TO";
                        connectionId: string;
                        message: AIMessage;
                    } | {
                        type: "HEARTBEAT";
                    } | {
                        type: "ERROR";
                        error: Error;
                    }, import("xstate").AnyEventObject>;
                }) => {
                    server: WebSocket.Server<typeof import("ws"), typeof http.IncomingMessage> | null;
                    httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> | null;
                    connections: Map<string, WSConnection>;
                };
                readonly onDone: {
                    readonly target: "stopped";
                    readonly actions: "clearServer";
                };
                readonly onError: {
                    readonly target: "stopped";
                    readonly actions: readonly ["logError", "clearServer"];
                };
            };
        };
    };
}>>;
/**
 * WebSocket client for AI agents to connect to the server
 */
export declare class AIWebSocketClient {
    private ws;
    private agent;
    private url;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    constructor(agent: AIAgent, url?: string);
    connect(): Promise<void>;
    private handleDisconnect;
    send(message: AIMessage): void;
    onMessage(handler: (message: AIMessage) => void): void;
    close(): void;
}
//# sourceMappingURL=webSocketServerActor.d.ts.map
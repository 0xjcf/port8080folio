/**
 * WebSocket Server Actor
 *
 * This actor manages a WebSocket server for real-time AI-to-AI communication.
 * It handles connections, message routing, and connection health monitoring.
 */

import { randomUUID } from 'node:crypto';
import * as http from 'node:http';
import * as WebSocket from 'ws';
import { assign, createActor, fromPromise, setup } from 'xstate';
import type { DebugLogger } from '../core/debugLogger';
import type { AIAgent, AIMessage } from '../types/aiCommunication';

const WS_COMPONENT = 'WEBSOCKET_SERVER';

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
export type WSServerEvent =
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'CONNECTION'; ws: WebSocket.WebSocket; agent: AIAgent }
  | { type: 'DISCONNECTION'; connectionId: string }
  | { type: 'MESSAGE'; connectionId: string; message: AIMessage }
  | { type: 'BROADCAST'; message: AIMessage; excludeId?: string }
  | { type: 'SEND_TO'; connectionId: string; message: AIMessage }
  | { type: 'HEARTBEAT' }
  | { type: 'ERROR'; error: Error };

/**
 * Default server configuration
 */
const defaultServerConfig: WSServerConfig = {
  port: 8765,
  host: 'localhost',
  maxConnections: 100,
  heartbeatInterval: 30000, // 30 seconds
  connectionTimeout: 60000, // 60 seconds
  messageTimeout: 30000, // 30 seconds
  maxMessageSize: 1024 * 1024, // 1MB
};

/**
 * Actor for starting the WebSocket server
 */
const startServerActor = fromPromise(
  async ({
    input,
  }: {
    input: {
      config: WSServerConfig;
      onConnection: (ws: WebSocket.WebSocket) => void;
      debugLogger?: DebugLogger;
    };
  }) => {
    const { config, onConnection, debugLogger } = input;

    return new Promise<{ server: WebSocket.Server; httpServer: http.Server }>((resolve, reject) => {
      // Create HTTP server
      const httpServer = http.createServer();

      // Create WebSocket server
      const wsServer = new WebSocket.Server({
        server: httpServer,
        maxPayload: config.maxMessageSize,
      });

      // Set up connection handler
      wsServer.on('connection', (ws) => {
        debugLogger?.info(WS_COMPONENT, 'New WebSocket connection');
        onConnection(ws);
      });

      // Set up error handler
      wsServer.on('error', (error) => {
        debugLogger?.error(WS_COMPONENT, 'WebSocket server error', undefined, error);
        reject(error);
      });

      // Start HTTP server
      httpServer.listen(config.port, config.host, () => {
        debugLogger?.info(
          WS_COMPONENT,
          `WebSocket server started on ${config.host}:${config.port}`
        );
        resolve({ server: wsServer, httpServer });
      });

      httpServer.on('error', (error) => {
        debugLogger?.error(WS_COMPONENT, 'HTTP server error', undefined, error);
        reject(error);
      });
    });
  }
);

/**
 * Actor for stopping the WebSocket server
 */
const stopServerActor = fromPromise(
  async ({
    input,
  }: {
    input: {
      server: WebSocket.Server | null;
      httpServer: http.Server | null;
      connections: Map<string, WSConnection>;
    };
  }) => {
    const { server, httpServer, connections } = input;

    // Close all connections
    connections.forEach((conn) => {
      if (conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.close(1000, 'Server shutting down');
      }
    });

    // Close WebSocket server
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }

    // Close HTTP server
    if (httpServer) {
      await new Promise<void>((resolve) => {
        httpServer.close(() => resolve());
      });
    }
  }
);

/**
 * Create the WebSocket server state machine
 */
export const webSocketServerMachine = setup({
  types: {
    context: {} as WSServerContext,
    events: {} as WSServerEvent,
  },
  actors: {
    startServer: startServerActor,
    stopServer: stopServerActor,
  },
  actions: {
    /**
     * Initialize context
     */
    initialize: assign({
      config: () => defaultServerConfig,
      connections: () => new Map(),
      stats: () => ({
        totalConnections: 0,
        activeConnections: 0,
        messagesSent: 0,
        messagesReceived: 0,
        errors: 0,
      }),
      errors: () => [],
    }),

    /**
     * Set server instances
     */
    setServer: assign({
      server: ({ event }) => {
        if ('output' in event) {
          const doneEvent = event as {
            output: { server: WebSocket.Server; httpServer: http.Server };
          };
          return doneEvent.output.server;
        }
        return null;
      },
      httpServer: ({ event }) => {
        if ('output' in event) {
          const doneEvent = event as {
            output: { server: WebSocket.Server; httpServer: http.Server };
          };
          return doneEvent.output.httpServer;
        }
        return null;
      },
    }),

    /**
     * Add connection
     */
    addConnection: assign({
      connections: ({ context, event }) => {
        if (event.type !== 'CONNECTION') return context.connections;

        const connection: WSConnection = {
          id: randomUUID(),
          ws: event.ws,
          agent: event.agent,
          connectedAt: Date.now(),
          lastActivity: Date.now(),
          messageCount: 0,
        };

        const connections = new Map(context.connections);
        connections.set(connection.id, connection);

        // Set up message handler
        event.ws.on('message', (data) => {
          try {
            const _message = JSON.parse(data.toString()) as AIMessage;
            // Send message event to actor system - can't send from here
            // Messages should be handled through the actor system's event handling
          } catch (_error) {}
        });

        // Set up close handler
        event.ws.on('close', () => {
          // Disconnection will be handled when the connection is checked
          connections.delete(connection.id);
        });

        // Set up error handler
        event.ws.on('error', (_error) => {
          // Errors will be handled through the actor system
        });

        return connections;
      },
      stats: ({ context, event }) => {
        if (event.type !== 'CONNECTION') return context.stats;

        return {
          ...context.stats,
          totalConnections: context.stats.totalConnections + 1,
          activeConnections: context.stats.activeConnections + 1,
        };
      },
    }),

    /**
     * Remove connection
     */
    removeConnection: assign({
      connections: ({ context, event }) => {
        if (event.type !== 'DISCONNECTION') return context.connections;

        const connections = new Map(context.connections);
        connections.delete(event.connectionId);

        return connections;
      },
      stats: ({ context, event }) => {
        if (event.type !== 'DISCONNECTION') return context.stats;

        return {
          ...context.stats,
          activeConnections: Math.max(0, context.stats.activeConnections - 1),
        };
      },
    }),

    /**
     * Handle incoming message
     */
    handleMessage: assign({
      connections: ({ context, event }) => {
        if (event.type !== 'MESSAGE') return context.connections;

        const connections = new Map(context.connections);
        const connection = connections.get(event.connectionId);

        if (connection) {
          connection.lastActivity = Date.now();
          connection.messageCount++;
        }

        return connections;
      },
      stats: ({ context, event }) => {
        if (event.type !== 'MESSAGE') return context.stats;

        return {
          ...context.stats,
          messagesReceived: context.stats.messagesReceived + 1,
        };
      },
    }),

    /**
     * Broadcast message to all connections
     */
    broadcastMessage: ({ context, event }) => {
      if (event.type !== 'BROADCAST') return;

      const { message, excludeId } = event;
      let sentCount = 0;

      context.connections.forEach((conn, id) => {
        if (id !== excludeId && conn.ws.readyState === WebSocket.OPEN) {
          try {
            conn.ws.send(JSON.stringify(message));
            sentCount++;
          } catch (_error) {}
        }
      });

      context.stats.messagesSent += sentCount;
    },

    /**
     * Send message to specific connection
     */
    sendToConnection: ({ context, event }) => {
      if (event.type !== 'SEND_TO') return;

      const { connectionId, message } = event;
      const connection = context.connections.get(connectionId);

      if (connection && connection.ws.readyState === WebSocket.OPEN) {
        try {
          connection.ws.send(JSON.stringify(message));
          context.stats.messagesSent++;
        } catch (_error) {}
      }
    },

    /**
     * Check connection health
     */
    checkConnections: ({ context }) => {
      const now = Date.now();
      const timeout = context.config.connectionTimeout;

      context.connections.forEach((conn, _id) => {
        if (now - conn.lastActivity > timeout) {
          // Connection timed out
          if (conn.ws.readyState === WebSocket.OPEN) {
            conn.ws.close(1000, 'Connection timeout');
          }
        } else if (conn.ws.readyState === WebSocket.OPEN) {
          // Send ping
          conn.ws.ping();
        }
      });
    },

    /**
     * Clear server instances
     */
    clearServer: assign({
      server: () => null,
      httpServer: () => null,
    }),

    /**
     * Log error
     */
    logError: assign({
      errors: ({ context, event }) => {
        if (event.type === 'ERROR') {
          return [...context.errors, event.error];
        }
        return context.errors;
      },
      stats: ({ context, event }) => {
        if (event.type === 'ERROR') {
          return {
            ...context.stats,
            errors: context.stats.errors + 1,
          };
        }
        return context.stats;
      },
    }),
  },
}).createMachine({
  id: 'webSocketServer',
  initial: 'stopped',
  context: {
    server: null,
    httpServer: null,
    connections: new Map(),
    config: defaultServerConfig,
    stats: {
      totalConnections: 0,
      activeConnections: 0,
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0,
    },
    errors: [],
  },
  states: {
    stopped: {
      entry: 'initialize',
      on: {
        START: 'starting',
      },
    },

    starting: {
      invoke: {
        id: 'startServer',
        src: 'startServer',
        input: ({ context, self }) => ({
          config: context.config,
          onConnection: (ws: WebSocket.WebSocket) => {
            // This will be called for each new connection
            // We need to wait for the agent handshake
            ws.once('message', (data) => {
              try {
                const handshake = JSON.parse(data.toString());
                if (handshake.type === 'HANDSHAKE' && handshake.agent) {
                  self.send({
                    type: 'CONNECTION',
                    ws,
                    agent: handshake.agent,
                  });
                }
              } catch (_error) {
                ws.close(1002, 'Invalid handshake');
              }
            });
          },
          debugLogger: undefined,
        }),
        onDone: {
          target: 'running',
          actions: 'setServer',
        },
        onError: {
          target: 'stopped',
          actions: 'logError',
        },
      },
    },

    running: {
      // TODO: Add heartbeat functionality
      on: {
        CONNECTION: {
          actions: 'addConnection',
        },
        DISCONNECTION: {
          actions: 'removeConnection',
        },
        MESSAGE: {
          actions: 'handleMessage',
        },
        BROADCAST: {
          actions: 'broadcastMessage',
        },
        SEND_TO: {
          actions: 'sendToConnection',
        },
        HEARTBEAT: {
          actions: 'checkConnections',
        },
        STOP: 'stopping',
        ERROR: {
          actions: 'logError',
        },
      },
    },

    stopping: {
      invoke: {
        id: 'stopServer',
        src: 'stopServer',
        input: ({ context }) => ({
          server: context.server,
          httpServer: context.httpServer,
          connections: context.connections,
        }),
        onDone: {
          target: 'stopped',
          actions: 'clearServer',
        },
        onError: {
          target: 'stopped',
          actions: ['logError', 'clearServer'],
        },
      },
    },
  },
});

/**
 * Create and start a WebSocket server actor
 */
export function createWebSocketServer(config?: Partial<WSServerConfig>, debugLogger?: DebugLogger) {
  const actor = createActor(webSocketServerMachine, {
    input: {
      config: { ...defaultServerConfig, ...config },
    },
  });

  if (debugLogger) {
    actor.subscribe((state) => {
      debugLogger.debug(WS_COMPONENT, `State: ${JSON.stringify(state.value)}`, {
        activeConnections: state.context.connections.size,
        stats: state.context.stats,
      });
    });
  }

  return actor;
}

/**
 * WebSocket client for AI agents to connect to the server
 */
export class AIWebSocketClient {
  private ws: WebSocket.WebSocket | null = null;
  private agent: AIAgent;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(agent: AIAgent, url = 'ws://localhost:8765') {
    this.agent = agent;
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket.WebSocket(this.url);

      this.ws.on('open', () => {
        // Send handshake
        this.ws?.send(
          JSON.stringify({
            type: 'HANDSHAKE',
            agent: this.agent,
          })
        );

        this.reconnectAttempts = 0;
        resolve();
      });

      this.ws.on('error', (error) => {
        reject(error);
      });

      this.ws.on('close', () => {
        this.handleDisconnect();
      });
    });
  }

  private handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  send(message: AIMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket not connected');
    }
  }

  onMessage(handler: (message: AIMessage) => void): void {
    if (this.ws) {
      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString()) as AIMessage;
          handler(message);
        } catch (_error) {}
      });
    }
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

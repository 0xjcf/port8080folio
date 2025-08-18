/**
 * AI Communication Bridge Actor
 *
 * This actor manages communication between different AI agents (Claude, Cursor, etc.)
 * using the actor model pattern with XState v5.
 */

import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { assign, createActor, fromPromise, setup } from 'xstate';
import { createDebugLogger, type DebugLogger } from '../core/debugLogger';
import {
  type AIAgent,
  type AICommunicationContext,
  type AICommunicationEvent,
  type AIMessage,
  CommunicationChannel,
  type CommunicationConfig,
  MessagePriority,
  type MessageSubscription,
  type MessageType,
} from '../types/aiCommunication';

// Create a dedicated component for AI communication logging
const AI_COMM_COMPONENT = 'AI_COMMUNICATION';

/**
 * Default configuration for AI communication
 */
const defaultConfig: CommunicationConfig = {
  maxQueueSize: 1000,
  maxHistorySize: 10000,
  messageTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  enableEncryption: false,
  enableCompression: false,
  communicationMethod: 'file',
  fileStoragePath: '.ai-messages',
};

/**
 * Actor for persisting messages to file system
 */
const persistMessageActor = fromPromise(
  async ({
    input,
  }: {
    input: {
      message: AIMessage;
      storagePath: string;
    };
  }) => {
    const { message, storagePath } = input;

    // Ensure storage directory exists
    const storageDir = path.join(
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd(),
      storagePath
    );

    await fs.mkdir(storageDir, { recursive: true });

    // Write message to file
    const fileName = `${message.timestamp}-${message.id}.json`;
    const filePath = path.join(storageDir, fileName);

    await fs.writeFile(filePath, JSON.stringify(message, null, 2), 'utf8');

    return filePath;
  }
);

/**
 * Actor for reading message history from file system
 */
const loadMessageHistoryActor = fromPromise(
  async ({
    input,
  }: {
    input: {
      storagePath: string;
      since?: number;
    };
  }) => {
    const { storagePath, since = 0 } = input;

    const storageDir = path.join(
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd(),
      storagePath
    );

    try {
      const files = await fs.readdir(storageDir);
      const messages: AIMessage[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(storageDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const message = JSON.parse(content) as AIMessage;

          if (message.timestamp >= since) {
            messages.push(message);
          }
        }
      }

      return messages.sort((a, b) => a.timestamp - b.timestamp);
    } catch (_error) {
      // Directory might not exist yet
      return [];
    }
  }
);

/**
 * Actor for processing outgoing messages
 */
const processOutgoingMessageActor = fromPromise(
  async ({
    input,
  }: {
    input: {
      message: AIMessage;
      config: CommunicationConfig;
      debugLogger?: DebugLogger;
    };
  }) => {
    const { message, config, debugLogger } = input;

    debugLogger?.info(AI_COMM_COMPONENT, 'Processing outgoing message', {
      messageId: message.id,
      type: message.type,
      target: typeof message.target === 'string' ? message.target : message.target.id,
    });

    // Apply encryption if enabled
    if (config.enableEncryption && !message.metadata.encrypted) {
      // TODO: Implement encryption
      debugLogger?.debug(AI_COMM_COMPONENT, 'Encryption not yet implemented');
    }

    // Apply compression if enabled
    if (config.enableCompression && !message.metadata.compressed) {
      // TODO: Implement compression
      debugLogger?.debug(AI_COMM_COMPONENT, 'Compression not yet implemented');
    }

    // Sign the message
    // TODO: Implement message signing
    const signedMessage = {
      ...message,
      signature: 'not-implemented',
    };

    return signedMessage;
  }
);

/**
 * Create the AI Communication Bridge state machine
 */
export const aiCommunicationBridgeMachine = setup({
  types: {
    context: {} as AICommunicationContext,
    events: {} as AICommunicationEvent,
  },
  actors: {
    persistMessage: persistMessageActor,
    loadMessageHistory: loadMessageHistoryActor,
    processOutgoingMessage: processOutgoingMessageActor,
  },
  actions: {
    /**
     * Initialize context with configuration
     */
    initialize: assign({
      agents: () => new Map<string, AIAgent>(),
      messageQueue: () => [],
      messageHistory: () => [],
      subscriptions: () =>
        new Map<CommunicationChannel, Set<MessageSubscription>>([
          [CommunicationChannel.CODE_REVIEW, new Set()],
          [CommunicationChannel.REFACTORING, new Set()],
          [CommunicationChannel.ARCHITECTURE, new Set()],
          [CommunicationChannel.TASK_COORDINATION, new Set()],
          [CommunicationChannel.KNOWLEDGE_SHARING, new Set()],
          [CommunicationChannel.SYSTEM, new Set()],
          [CommunicationChannel.GENERAL, new Set()],
        ]),
      stats: () => ({
        messagesSent: 0,
        messagesReceived: 0,
        messagesDropped: 0,
        averageLatency: 0,
        activeConnections: 0,
        lastActivity: Date.now(),
      }),
      config: () => ({
        ...defaultConfig,
        ...vscode.workspace.getConfiguration('actor-spa.aiCommunication').get('config', {}),
      }),
      errors: () => [],
    }),

    /**
     * Queue a message for sending
     */
    queueMessage: assign({
      messageQueue: ({ context, event }) => {
        if (event.type !== 'SEND_MESSAGE') return context.messageQueue;

        const { message } = event;
        const queue = [...context.messageQueue, message];

        // Enforce max queue size
        if (queue.length > context.config.maxQueueSize) {
          // Remove oldest messages
          const dropped = queue.splice(0, queue.length - context.config.maxQueueSize);
          // Update stats
          context.stats.messagesDropped += dropped.length;
        }

        return queue;
      },
      stats: ({ context, event }) => {
        if (event.type !== 'SEND_MESSAGE') return context.stats;

        return {
          ...context.stats,
          messagesSent: context.stats.messagesSent + 1,
          lastActivity: Date.now(),
        };
      },
    }),

    /**
     * Process received message
     */
    processReceivedMessage: assign({
      messageHistory: ({ context, event }) => {
        if (event.type !== 'MESSAGE_RECEIVED') return context.messageHistory;

        const history = [...context.messageHistory, event.message];

        // Enforce max history size
        if (history.length > context.config.maxHistorySize) {
          history.splice(0, history.length - context.config.maxHistorySize);
        }

        return history;
      },
      stats: ({ context, event }) => {
        if (event.type !== 'MESSAGE_RECEIVED') return context.stats;

        const latency = Date.now() - event.message.timestamp;
        const totalMessages = context.stats.messagesReceived + 1;
        const newAverageLatency =
          (context.stats.averageLatency * context.stats.messagesReceived + latency) / totalMessages;

        return {
          ...context.stats,
          messagesReceived: totalMessages,
          averageLatency: newAverageLatency,
          lastActivity: Date.now(),
        };
      },
    }),

    /**
     * Notify subscribers of a message
     */
    notifySubscribers: ({ context, event }) => {
      if (event.type !== 'MESSAGE_RECEIVED') return;

      const { message } = event;
      const channelSubscribers = context.subscriptions.get(message.metadata.channel);

      if (channelSubscribers) {
        channelSubscribers.forEach((subscription) => {
          // Apply filters
          if (subscription.filter) {
            const { types, sources, priority } = subscription.filter;

            if (types && !types.includes(message.type)) return;
            if (sources && !sources.includes(message.source.id)) return;
            if (priority !== undefined && message.metadata.priority < priority) return;
          }

          // Call handler
          try {
            subscription.handler(message);
          } catch (_error) {}
        });
      }
    },

    /**
     * Add subscription
     */
    addSubscription: assign({
      subscriptions: ({ context, event }) => {
        if (event.type !== 'SUBSCRIBE') return context.subscriptions;

        const { channel, callback } = event;
        const subscription: MessageSubscription = {
          id: randomUUID(),
          channel,
          handler: callback,
        };

        const channelSubscriptions = context.subscriptions.get(channel) || new Set();
        channelSubscriptions.add(subscription);

        const newSubscriptions = new Map(context.subscriptions);
        newSubscriptions.set(channel, channelSubscriptions);

        return newSubscriptions;
      },
    }),

    /**
     * Remove subscription
     */
    removeSubscription: assign({
      subscriptions: ({ context, event }) => {
        if (event.type !== 'UNSUBSCRIBE') return context.subscriptions;

        const { channel, handlerId } = event;
        const channelSubscriptions = context.subscriptions.get(channel);

        if (channelSubscriptions) {
          const filtered = new Set(
            Array.from(channelSubscriptions).filter((sub) => sub.id !== handlerId)
          );

          const newSubscriptions = new Map(context.subscriptions);
          newSubscriptions.set(channel, filtered);

          return newSubscriptions;
        }

        return context.subscriptions;
      },
    }),

    /**
     * Register an AI agent
     */
    registerAgent: assign({
      agents: ({ context, event }) => {
        if (event.type !== 'CONNECT') return context.agents;

        const { agent } = event;
        const agents = new Map(context.agents);
        agents.set(agent.id, agent);

        return agents;
      },
      stats: ({ context, event }) => {
        if (event.type !== 'CONNECT') return context.stats;

        return {
          ...context.stats,
          activeConnections: context.stats.activeConnections + 1,
          lastActivity: Date.now(),
        };
      },
    }),

    /**
     * Unregister an AI agent
     */
    unregisterAgent: assign({
      agents: ({ context, event }) => {
        if (event.type !== 'DISCONNECT') return context.agents;

        const { agentId } = event;
        const agents = new Map(context.agents);
        agents.delete(agentId);

        return agents;
      },
      stats: ({ context, event }) => {
        if (event.type !== 'DISCONNECT') return context.stats;

        return {
          ...context.stats,
          activeConnections: Math.max(0, context.stats.activeConnections - 1),
          lastActivity: Date.now(),
        };
      },
    }),

    /**
     * Clear message history
     */
    clearHistory: assign({
      messageHistory: () => [],
      stats: ({ context }) => ({
        ...context.stats,
        lastActivity: Date.now(),
      }),
    }),

    /**
     * Log error
     */
    logError: assign({
      errors: ({ context, event }) => {
        if (event.type !== 'ERROR') return context.errors;

        return [...context.errors, event.error];
      },
    }),
  },
}).createMachine({
  id: 'aiCommunicationBridge',
  initial: 'initializing',
  context: {
    agents: new Map(),
    messageQueue: [],
    messageHistory: [],
    subscriptions: new Map(),
    stats: {
      messagesSent: 0,
      messagesReceived: 0,
      messagesDropped: 0,
      averageLatency: 0,
      activeConnections: 0,
      lastActivity: Date.now(),
    },
    config: defaultConfig,
    errors: [],
  },
  states: {
    initializing: {
      entry: 'initialize',
      invoke: {
        id: 'loadHistory',
        src: 'loadMessageHistory',
        input: ({ context }) => ({
          storagePath: context.config.fileStoragePath || '.ai-messages',
          since: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
        }),
        onDone: {
          target: 'active',
          actions: assign({
            messageHistory: ({ event }) => {
              // XState done event contains output from the actor
              const doneEvent = event as { output: AIMessage[] };
              return doneEvent.output || [];
            },
          }),
        },
        onError: {
          target: 'active',
          actions: 'logError',
        },
      },
    },

    active: {
      on: {
        SEND_MESSAGE: {
          actions: ['queueMessage'],
          target: '.processingQueue',
        },
        MESSAGE_RECEIVED: {
          actions: ['processReceivedMessage', 'notifySubscribers'],
        },
        SUBSCRIBE: {
          actions: 'addSubscription',
        },
        UNSUBSCRIBE: {
          actions: 'removeSubscription',
        },
        CONNECT: {
          actions: 'registerAgent',
        },
        DISCONNECT: {
          actions: 'unregisterAgent',
        },
        HEARTBEAT: {
          actions: assign({
            stats: ({ context }) => ({
              ...context.stats,
              lastActivity: Date.now(),
            }),
          }),
        },
        CLEAR_HISTORY: {
          actions: 'clearHistory',
        },
        REPLAY_MESSAGES: {
          actions: ({ context, event, self }) => {
            if (event.type !== 'REPLAY_MESSAGES') return;

            const messagesToReplay = context.messageHistory.filter(
              (msg) => msg.timestamp >= event.since
            );

            messagesToReplay.forEach((msg) => {
              self.send({ type: 'MESSAGE_RECEIVED', message: msg });
            });
          },
        },
        ERROR: {
          actions: 'logError',
        },
      },

      initial: 'idle',
      states: {
        idle: {},

        processingQueue: {
          always: [
            {
              target: 'sendingMessage',
              guard: ({ context }) => context.messageQueue.length > 0,
            },
            {
              target: 'idle',
            },
          ],
        },

        sendingMessage: {
          invoke: {
            id: 'processOutgoing',
            src: 'processOutgoingMessage',
            input: ({ context }) => {
              const message = context.messageQueue[0];
              return {
                message,
                config: context.config,
                debugLogger: createDebugLogger(
                  vscode.window.createOutputChannel('AI Communication')
                ),
              };
            },
            onDone: {
              target: 'persistingMessage',
              actions: assign({
                messageQueue: ({ context }) => context.messageQueue.slice(1),
              }),
            },
            onError: {
              target: 'idle',
              actions: [
                'logError',
                assign({
                  messageQueue: ({ context }) => context.messageQueue.slice(1),
                }),
              ],
            },
          },
        },

        persistingMessage: {
          invoke: {
            id: 'persist',
            src: 'persistMessage',
            input: ({ context }) => ({
              message: context.messageQueue[0],
              storagePath: context.config.fileStoragePath || '.ai-messages',
            }),
            onDone: {
              target: 'processingQueue',
            },
            onError: {
              target: 'processingQueue',
              actions: 'logError',
            },
          },
        },
      },
    },
  },
});

/**
 * Create and start the AI Communication Bridge actor
 */
export function createAICommunicationBridge(debugLogger?: DebugLogger) {
  const actor = createActor(aiCommunicationBridgeMachine);

  if (debugLogger) {
    actor.subscribe((state) => {
      debugLogger.debug(AI_COMM_COMPONENT, `State: ${JSON.stringify(state.value)}`, {
        agents: state.context.agents.size,
        queueLength: state.context.messageQueue.length,
        historyLength: state.context.messageHistory.length,
        stats: state.context.stats,
      });
    });
  }

  return actor;
}

/**
 * Helper function to create an AI agent
 */
export function createAIAgent(type: 'claude' | 'cursor' | 'custom', name: string): AIAgent {
  return {
    id: randomUUID(),
    type,
    name,
    version: '1.0.0',
    capabilities: [],
  };
}

/**
 * Helper function to create a message
 */
export function createMessage<T = unknown>(
  source: AIAgent,
  target: AIAgent | 'broadcast',
  type: MessageType,
  payload: T,
  options?: Partial<{
    priority: MessagePriority;
    channel: CommunicationChannel;
    correlationId: string;
    replyTo: string;
  }>
): AIMessage<T> {
  return {
    id: randomUUID(),
    timestamp: Date.now(),
    source,
    target,
    type,
    payload,
    metadata: {
      priority: options?.priority ?? MessagePriority.NORMAL,
      channel: options?.channel ?? CommunicationChannel.GENERAL,
      correlationId: options?.correlationId,
      replyTo: options?.replyTo,
    },
  };
}

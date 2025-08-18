/**
 * Message Queue Actor
 *
 * This actor manages a persistent message queue with retry logic,
 * dead letter queue, and various delivery guarantees.
 */

import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { assign, createActor, fromPromise, setup } from 'xstate';
import type { DebugLogger } from '../core/debugLogger';
import { type AIMessage, MessagePriority } from '../types/aiCommunication';

const QUEUE_COMPONENT = 'MESSAGE_QUEUE';

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
export type MessageQueueEvent =
  | { type: 'ENQUEUE'; message: AIMessage }
  | { type: 'DEQUEUE' }
  | { type: 'PROCESS_NEXT' }
  | { type: 'DELIVERY_SUCCESS'; entryId: string }
  | { type: 'DELIVERY_FAILURE'; entryId: string; error: string }
  | { type: 'RETRY_FAILED' }
  | { type: 'CLEAR_DLQ' }
  | { type: 'PERSIST' }
  | { type: 'RESTORE' }
  | { type: 'GET_STATS' };

/**
 * Default queue configuration
 */
const defaultQueueConfig: QueueConfig = {
  maxSize: 1000,
  maxRetries: 3,
  retryDelayMs: 1000,
  deadLetterQueueSize: 100,
  processingTimeout: 30000,
  priorityQueuing: true,
};

/**
 * Actor for persisting queue state
 */
const persistQueueActor = fromPromise(
  async ({
    input,
  }: {
    input: {
      queue: QueueEntry[];
      dlq: QueueEntry[];
      path?: string;
    };
  }) => {
    const { queue, dlq, path: persistPath } = input;

    if (!persistPath) return;

    const queueState = {
      queue,
      deadLetterQueue: dlq,
      timestamp: Date.now(),
    };

    await fs.mkdir(path.dirname(persistPath), { recursive: true });
    await fs.writeFile(persistPath, JSON.stringify(queueState, null, 2), 'utf8');
  }
);

/**
 * Actor for restoring queue state
 */
const restoreQueueActor = fromPromise(
  async ({
    input,
  }: {
    input: {
      path?: string;
    };
  }) => {
    const { path: persistPath } = input;

    if (!persistPath) {
      return { queue: [], deadLetterQueue: [] };
    }

    try {
      const content = await fs.readFile(persistPath, 'utf8');
      const state = JSON.parse(content);
      return {
        queue: state.queue || [],
        deadLetterQueue: state.deadLetterQueue || [],
      };
    } catch {
      return { queue: [], deadLetterQueue: [] };
    }
  }
);

/**
 * Create the message queue state machine
 */
export const messageQueueMachine = setup({
  types: {
    context: {} as MessageQueueContext,
    events: {} as MessageQueueEvent,
  },
  actors: {
    persistQueue: persistQueueActor,
    restoreQueue: restoreQueueActor,
  },
  actions: {
    /**
     * Enqueue a message
     */
    enqueueMessage: assign({
      queue: ({ context, event }) => {
        if (event.type !== 'ENQUEUE') return context.queue;

        const entry: QueueEntry = {
          id: randomUUID(),
          message: event.message,
          attempts: 0,
          status: 'pending',
        };

        const newQueue = [...context.queue, entry];

        // Sort by priority if enabled
        if (context.config.priorityQueuing) {
          newQueue.sort((a, b) => {
            const aPriority = a.message.metadata.priority || MessagePriority.NORMAL;
            const bPriority = b.message.metadata.priority || MessagePriority.NORMAL;
            return bPriority - aPriority;
          });
        }

        // Enforce max size
        if (newQueue.length > context.config.maxSize) {
          const dropped = newQueue.splice(context.config.maxSize);
          context.stats.dropped += dropped.length;
        }

        return newQueue;
      },
      stats: ({ context, event }) => {
        if (event.type !== 'ENQUEUE') return context.stats;

        return {
          ...context.stats,
          enqueued: context.stats.enqueued + 1,
        };
      },
    }),

    /**
     * Move entry to processing
     */
    startProcessing: assign({
      queue: ({ context }) => {
        if (context.queue.length === 0) return context.queue;
        return context.queue.slice(1);
      },
      processing: ({ context }) => {
        if (context.queue.length === 0) return context.processing;

        const entry = context.queue[0];
        const processing = new Map(context.processing);
        processing.set(entry.id, {
          ...entry,
          status: 'processing',
          attempts: entry.attempts + 1,
          lastAttempt: Date.now(),
        });

        return processing;
      },
    }),

    /**
     * Handle successful delivery
     */
    handleDeliverySuccess: assign({
      processing: ({ context, event }) => {
        if (event.type !== 'DELIVERY_SUCCESS') return context.processing;

        const processing = new Map(context.processing);
        processing.delete(event.entryId);

        return processing;
      },
      stats: ({ context, event }) => {
        if (event.type !== 'DELIVERY_SUCCESS') return context.stats;

        return {
          ...context.stats,
          delivered: context.stats.delivered + 1,
        };
      },
    }),

    /**
     * Handle delivery failure
     */
    handleDeliveryFailure: assign({
      processing: ({ context, event }) => {
        if (event.type !== 'DELIVERY_FAILURE') return context.processing;

        const processing = new Map(context.processing);
        const entry = processing.get(event.entryId);

        if (entry) {
          processing.delete(event.entryId);
        }

        return processing;
      },
      queue: ({ context, event }) => {
        if (event.type !== 'DELIVERY_FAILURE') return context.queue;

        const entry = context.processing.get(event.entryId);
        if (!entry) return context.queue;

        // Check if we should retry
        if (entry.attempts < context.config.maxRetries) {
          const updatedEntry: QueueEntry = {
            ...entry,
            status: 'pending',
            error: event.error,
            nextRetry: Date.now() + context.config.retryDelayMs * 2 ** entry.attempts,
          };

          // Add back to queue
          const newQueue = [...context.queue, updatedEntry];

          // Re-sort if priority queuing is enabled
          if (context.config.priorityQueuing) {
            newQueue.sort((a, b) => {
              const aPriority = a.message.metadata.priority || MessagePriority.NORMAL;
              const bPriority = b.message.metadata.priority || MessagePriority.NORMAL;
              return bPriority - aPriority;
            });
          }

          return newQueue;
        }

        return context.queue;
      },
      deadLetterQueue: ({ context, event }) => {
        if (event.type !== 'DELIVERY_FAILURE') return context.deadLetterQueue;

        const entry = context.processing.get(event.entryId);
        if (!entry || entry.attempts < context.config.maxRetries) {
          return context.deadLetterQueue;
        }

        // Move to dead letter queue
        const dlqEntry: QueueEntry = {
          ...entry,
          status: 'dead',
          error: event.error,
        };

        const newDLQ = [...context.deadLetterQueue, dlqEntry];

        // Enforce DLQ size
        if (newDLQ.length > context.config.deadLetterQueueSize) {
          newDLQ.shift();
        }

        return newDLQ;
      },
      stats: ({ context, event }) => {
        if (event.type !== 'DELIVERY_FAILURE') return context.stats;

        const entry = context.processing.get(event.entryId);
        if (!entry) return context.stats;

        if (entry.attempts < context.config.maxRetries) {
          return {
            ...context.stats,
            retried: context.stats.retried + 1,
          };
        }
        return {
          ...context.stats,
          failed: context.stats.failed + 1,
          deadLettered: context.stats.deadLettered + 1,
        };
      },
    }),

    /**
     * Clear dead letter queue
     */
    clearDeadLetterQueue: assign({
      deadLetterQueue: () => [],
    }),

    /**
     * Log error
     */
    logError: assign({
      errors: ({ context, event }) => {
        if ('error' in event && event.error) {
          const error =
            typeof event.error === 'string' ? new Error(event.error) : (event.error as Error);
          return [...context.errors, error];
        }
        return context.errors;
      },
    }),
  },
  guards: {
    hasMessages: ({ context }) => context.queue.length > 0,
    isRetryReady: ({ context }) => {
      if (context.queue.length === 0) return false;

      const nextEntry = context.queue[0];
      if (nextEntry.nextRetry && nextEntry.nextRetry > Date.now()) {
        return false;
      }

      return true;
    },
  },
}).createMachine({
  id: 'messageQueue',
  initial: 'initializing',
  context: {
    queue: [],
    deadLetterQueue: [],
    processing: new Map(),
    config: defaultQueueConfig,
    stats: {
      enqueued: 0,
      delivered: 0,
      failed: 0,
      deadLettered: 0,
      retried: 0,
      dropped: 0,
    },
    errors: [],
  },
  states: {
    initializing: {
      invoke: {
        id: 'restore',
        src: 'restoreQueue',
        input: ({ context }) => ({
          path: context.config.persistencePath,
        }),
        onDone: {
          target: 'active',
          actions: assign({
            queue: ({ event }) => event.output.queue || [],
            deadLetterQueue: ({ event }) => event.output.deadLetterQueue || [],
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
        ENQUEUE: {
          actions: 'enqueueMessage',
        },
        DEQUEUE: {
          target: '.processing',
          guard: 'hasMessages',
        },
        CLEAR_DLQ: {
          actions: 'clearDeadLetterQueue',
        },
        PERSIST: {
          target: '.persisting',
        },
      },

      initial: 'idle',
      states: {
        idle: {
          always: [
            {
              target: 'checkingQueue',
              guard: 'hasMessages',
            },
          ],
        },

        checkingQueue: {
          always: [
            {
              target: 'processing',
              guard: 'isRetryReady',
            },
            {
              target: 'waitingForRetry',
            },
          ],
        },

        waitingForRetry: {
          after: {
            1000: 'checkingQueue', // Check every second
          },
        },

        processing: {
          entry: 'startProcessing',
          on: {
            DELIVERY_SUCCESS: {
              actions: 'handleDeliverySuccess',
              target: 'idle',
            },
            DELIVERY_FAILURE: {
              actions: 'handleDeliveryFailure',
              target: 'idle',
            },
          },
          after: {
            PROCESSING_TIMEOUT: {
              target: 'idle',
              actions: ({ context }: { context: MessageQueueContext }) => {
                // Handle timeout - move all processing entries back to queue or DLQ
                const processing = context.processing;
                processing.forEach((entry: QueueEntry) => {
                  // Simulate delivery failure
                  context.queue.push({
                    ...entry,
                    status: 'pending',
                    error: 'Processing timeout',
                    attempts: entry.attempts + 1,
                  });
                });
                context.processing.clear();
              },
            },
          },
        },

        persisting: {
          invoke: {
            id: 'persist',
            src: 'persistQueue',
            input: ({ context }) => ({
              queue: context.queue,
              dlq: context.deadLetterQueue,
              path: context.config.persistencePath,
            }),
            onDone: 'idle',
            onError: {
              target: 'idle',
              actions: 'logError',
            },
          },
        },
      },
    },
  },
});

/**
 * Create and start a message queue actor
 */
export function createMessageQueue(config?: Partial<QueueConfig>, debugLogger?: DebugLogger) {
  const actor = createActor(messageQueueMachine, {
    input: {
      config: { ...defaultQueueConfig, ...config },
    },
  });

  if (debugLogger) {
    actor.subscribe((state) => {
      debugLogger.debug(QUEUE_COMPONENT, `State: ${JSON.stringify(state.value)}`, {
        queueLength: state.context.queue.length,
        dlqLength: state.context.deadLetterQueue.length,
        processingCount: state.context.processing.size,
        stats: state.context.stats,
      });
    });
  }

  return actor;
}

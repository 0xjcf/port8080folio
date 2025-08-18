import { assign, createMachine } from 'xstate';
import type { Violation } from '../types.js';

interface OrchestratorContext {
  files: string[];
  completedFiles: string[];
  violations: Violation[];
  errors: string[];
  startTime: number | null;
  endTime: number | null;
}

/**
 * Create the root orchestrator machine
 * Manages the overall linting process with parallel file scanning
 */
export function createRootMachine() {
  return createMachine({
    id: 'lintOrchestrator',
    initial: 'idle',
    context: {
      files: [],
      completedFiles: [],
      violations: [],
      errors: [],
      startTime: null,
      endTime: null,
    } as OrchestratorContext,

    states: {
      idle: {
        on: {
          START: 'discovering',
        },
      },

      discovering: {
        entry: assign({
          startTime: () => Date.now(),
        }),

        on: {
          FILES_DISCOVERED: {
            target: 'scanning',
            actions: assign({
              files: ({ event }) => event.files || [],
            }),
          },

          DISCOVERY_ERROR: {
            target: 'error',
            actions: assign({
              errors: ({ context, event }) => [
                ...context.errors,
                event.error || 'Discovery failed',
              ],
            }),
          },
        },
      },

      scanning: {
        type: 'parallel',

        states: {
          fileScanning: {
            initial: 'active',

            states: {
              active: {
                on: {
                  FILE_COMPLETE: {
                    actions: assign({
                      completedFiles: ({ context, event }) => [
                        ...context.completedFiles,
                        event.file || '',
                      ],
                    }),
                  },

                  VIOLATION_FOUND: {
                    actions: assign({
                      violations: ({ context, event }) =>
                        [...context.violations, event.violation].filter(Boolean) as Violation[],
                    }),
                  },

                  FILE_ERROR: {
                    actions: assign({
                      errors: ({ context, event }) => [
                        ...context.errors,
                        event.error || 'File processing failed',
                      ],
                    }),
                  },
                },
              },
            },
          },

          progressTracking: {
            initial: 'tracking',

            states: {
              tracking: {
                always: {
                  target: 'complete',
                  guard: ({ context }) => context.completedFiles.length === context.files.length,
                },
              },

              complete: {
                type: 'final',
              },
            },
          },
        },

        onDone: {
          target: 'complete',
          actions: assign({
            endTime: () => Date.now(),
          }),
        },
      },

      complete: {
        type: 'final',
      },

      error: {
        type: 'final',
      },
    },
  });
}

export default createRootMachine;

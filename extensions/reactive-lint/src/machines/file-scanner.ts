import { assign, createMachine } from 'xstate';
import type { Violation } from '../types.js';

interface FileScannerContext {
  file: string | null;
  violations: Violation[];
  error: string | null;
}

/**
 * Create a file scanner machine
 * Handles scanning individual files with rules
 */
export function createFileScannerMachine() {
  return createMachine({
    id: 'fileScanner',
    initial: 'idle',
    context: {
      file: null,
      violations: [],
      error: null,
    } as FileScannerContext,

    states: {
      idle: {
        on: {
          SCAN: 'scanning',
        },
      },

      scanning: {
        entry: assign({
          file: ({ event }: { event: unknown }) => {
            return (event as { file: string }).file;
          },
        }),

        invoke: {
          id: 'scanFile',
          src: 'scanFile',
          onDone: {
            target: 'complete',
            actions: assign({
              violations: ({ event }: { event: unknown }) => {
                return (event as { data: Violation[] }).data;
              },
            }),
          },
          onError: {
            target: 'error',
            actions: assign({
              error: ({ event }: { event: unknown }) => {
                return (event as { data: string }).data;
              },
            }),
          },
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

export default createFileScannerMachine;

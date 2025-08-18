// Test file for enhanced XState state highlighting
// @ts-nocheck

import { assign, createActor, createMachine } from 'xstate';

// Test machine with various state types and configurations
const testMachine = createMachine({
  id: 'enhanced-state-test',
  initial: 'idle', // Should be highlighted in green
  context: {
    count: 0,
    user: null,
  },
  states: {
    // Each state name should be prominently highlighted in purple with underline
    idle: {
      on: {
        START: {
          target: 'loading',
          actions: ['logStart'],
        },
      },
    },

    loading: {
      invoke: {
        src: 'fetchData',
        onDone: {
          target: 'processing',
          actions: assign({
            data: ({ event }) => event.output,
          }),
        },
        onError: 'error',
      },
    },

    processing: {
      entry: ['processData'],
      on: {
        COMPLETE: 'success',
        FAIL: 'error',
      },
      // Nested states should also be highlighted
      states: {
        validating: {
          on: {
            VALID: 'transforming',
          },
        },
        transforming: {
          on: {
            DONE: '#enhanced-state-test.success',
          },
        },
      },
    },

    success: {
      type: 'final', // Should be highlighted in red
      entry: ['celebrate'],
    },

    error: {
      on: {
        RETRY: 'loading',
        RESET: 'idle',
      },
    },
  },
});

// Parallel states example
const parallelMachine = createMachine({
  id: 'parallel-example',
  type: 'parallel',
  states: {
    // These parallel states should be clearly distinct
    upload: {
      initial: 'idle',
      states: {
        idle: {},
        uploading: {},
        complete: { type: 'final' },
      },
    },

    download: {
      initial: 'idle',
      states: {
        idle: {},
        downloading: {},
        complete: { type: 'final' },
      },
    },

    monitor: {
      initial: 'watching',
      states: {
        watching: {},
        alerting: {},
      },
    },
  },
});

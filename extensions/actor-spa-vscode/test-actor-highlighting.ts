// Test file for Actor Model and XState syntax highlighting
// @ts-nocheck

import {
  type Actor,
  type ActorRef,
  type AnyStateMachine,
  assign,
  createActor,
  createMachine,
  type EventObject,
  sendTo,
  spawnChild,
  stopChild,
} from 'xstate';

// Mock machines for testing
const someMachine = {} as AnyStateMachine;
const childMachine = {} as AnyStateMachine;

// Actor model core concepts - should be highlighted prominently
const actor = createActor(someMachine);
const actorRef = {} as ActorRef<any, any>;

// XState machine creation - prominent highlighting
const authMachine = createMachine({
  id: 'auth',
  initial: 'idle',
  context: {
    user: null,
    actors: {} as Record<string, ActorRef<any>>,
  },
  states: {
    idle: {
      on: {
        // Event names should stand out
        LOGIN: {
          target: 'authenticating',
          actions: ['logAttempt'],
        },
      },
    },
    authenticating: {
      invoke: {
        src: 'authService',
        onDone: {
          target: 'authenticated',
          actions: assign({
            user: ({ event }) => event.output,
          }),
        },
        onError: 'idle',
      },
    },
    authenticated: {
      entry: [
        // Actor actions should be highlighted
        spawnChild('userSessionMachine', { id: 'session' }),
        sendTo('session', { type: 'START' }),
      ],
      on: {
        LOGOUT: {
          target: 'idle',
          actions: [stopChild('session'), assign({ user: null })],
        },
      },
    },
  },
  actions: {
    logAttempt: ({ context }) => {
      // Actor communication
      sendTo('logger', { type: 'LOG_EVENT', data: 'login attempt' });
    },
  },
});

// Actor references and methods - should be highlighted
actor.send({ type: 'LOGIN' });
actor.subscribe((snapshot) => {
  console.log(snapshot.value);
});
actor.start();
actor.stop();

// Event objects
const loginEvent: EventObject = {
  type: 'LOGIN',
};

// State checks
const state = actor.getSnapshot();
if (state.matches('authenticated')) {
  // State methods should be highlighted
  const canLogout = state.can({ type: 'LOGOUT' });
  const hasUser = state.context.user !== null;
}

// More actor patterns
const childActor = actorRef.getSnapshot();
actorRef.send({ type: 'UPDATE' });

// Complex event types - constants should stand out
const MACHINE_EVENTS = {
  // These should be highlighted as event constants
  'xstate.init': 'xstate.init',
  'xstate.stop': 'xstate.stop',
  'xstate.done': 'xstate.done',
  'xstate.error': 'xstate.error',
};

// Actor system concepts
class ActorSystem {
  private actors: Map<string, Actor<any>>;

  spawn(machine: any): ActorRef<any> {
    // Implementation
    return {} as ActorRef<any>;
  }

  publish(event: EventObject): void {
    // Broadcast to all actors
    this.actors.forEach((actor) => actor.send(event));
  }
}

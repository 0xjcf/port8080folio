// Test file for actor vs actorRef highlighting consistency
import { ActorRef, assign, createActor, createMachine } from 'xstate';

// Mock functions for testing
declare function getParentActor(): any;
declare function getSystemActor(): any;
declare function spawn(machine: any): any;
const someMachine = createMachine({});

// Test 1: Direct actor usage
const machine = createMachine({
  // machine config
});

const actor = createActor(machine);
actor.start(); // 'actor' should be red/pink, 'start' should be purple
actor.send({ type: 'TOGGLE' }); // 'actor' should be red/pink, 'send' should be purple
actor.subscribe((snapshot) => {
  console.log(snapshot.value);
});
actor.stop(); // 'actor' should be red/pink, 'stop' should be purple

// Test 2: ActorRef usage (should have same highlighting as above)
const actorRef = actor;
actorRef.getSnapshot(); // 'actorRef' should be red/pink, 'getSnapshot' should be purple
actorRef.send({ type: 'UPDATE' }); // 'actorRef' should be red/pink, 'send' should be purple
actorRef.subscribe((snapshot) => {
  console.log(snapshot.value);
});
actorRef.start(); // 'actorRef' should be red/pink, 'start' should be purple
actorRef.stop(); // 'actorRef' should be red/pink, 'stop' should be purple

// Test 3: Other actor variations
const childActor = spawn(someMachine);
childActor.send({ type: 'INIT' }); // 'childActor' should be red/pink

const parentActor = getParentActor();
parentActor.send({ type: 'NOTIFY' }); // 'parentActor' should be red/pink

const systemActor = getSystemActor();
systemActor.getSnapshot(); // 'systemActor' should be red/pink

// Test 4: Just the word 'actor' without method (should still be red/pink but from keyword pattern)
const myActor = actor; // 'actor' here should be red/pink
const actors = [actor, actorRef]; // 'actors' should be red/pink, 'actor' and 'actorRef' too

// Test 5: State object for comparison (should be different color - yellow/orange)
const state = actor.getSnapshot();
if (state.matches('active')) {
  // 'state' should be yellow/orange, 'matches' should be blue
  const canLogout = state.can({ type: 'LOGOUT' }); // 'state' should be yellow/orange, 'can' should be blue
  const hasUser = state.context.user !== null; // 'state' should be yellow/orange, 'context' should be green
}

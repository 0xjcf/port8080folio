# XState v5 Migration Guide

## Current Status
We've temporarily disabled the XState-based UI orchestrator due to v5 compatibility issues and implemented a simple mobile navigation as a stopgap.

## Key XState v5 Changes

### 1. Services → Actors
```javascript
// v4 (OLD)
{
  services: {
    myService: () => Promise.resolve()
  }
}

// v5 (NEW)
{
  actors: {
    myService: fromPromise(() => Promise.resolve())
  }
}
```

### 2. Actor Function Signatures
```javascript
// v4 (OLD)
myActor: () => (callback) => {
  callback({ type: 'EVENT' });
}

// v5 (NEW)
myActor: ({ sendBack }) => {
  sendBack({ type: 'EVENT' });
}
```

### 3. Promise-based Actors
```javascript
// v4 (OLD)
myPromise: () => new Promise(resolve => {
  setTimeout(resolve, 1000);
})

// v5 (NEW)
myPromise: fromPromise(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
})
```

### 4. Context Initialization
```javascript
// v4 (OLD)
const actor = createActor(machine);
actor.getSnapshot().context.myProp = value;
actor.start();

// v5 (NEW)
const actor = createActor(machine, {
  context: {
    myProp: value
  }
});
actor.start();
```

## Migration Steps

### Phase 1: Fix Core State Machines ✅
- [x] Update `services` to `actors`
- [x] Add `fromPromise` wrapper for promise actors
- [x] Fix actor function signatures
- [x] Add proper context initialization

### Phase 2: Enhanced Type Safety
- [x] Add TypeScript configuration
- [x] Create XState v5 type definitions
- [ ] Convert JavaScript files to TypeScript
- [ ] Add strict typing for machine configs

### Phase 3: Complete Migration
- [ ] Test all state machines individually
- [ ] Re-enable UI orchestrator
- [ ] Add comprehensive error handling
- [ ] Update documentation

## Testing Strategy

### 1. Individual Machine Testing
```typescript
// Test each machine in isolation
describe('mobileNavMachine', () => {
  it('should transition from closed to open', () => {
    const actor = createActor(mobileNavMachine);
    actor.start();
    
    actor.send({ type: 'TOGGLE_MENU' });
    expect(actor.getSnapshot().matches('opening')).toBe(true);
  });
});
```

### 2. Integration Testing
```typescript
// Test machine orchestration
describe('uiOrchestrator', () => {
  it('should manage multiple modals', () => {
    const actor = createActor(uiOrchestratorMachine);
    actor.start();
    
    actor.send({ type: 'OPEN_MODAL', modalId: 'test' });
    expect(actor.getSnapshot().context.activeModals).toContain('test');
  });
});
```

## Error Handling Strategy

### 1. Graceful Degradation
```javascript
try {
  const actor = createActor(machine);
  actor.start();
} catch (error) {
  console.error('XState actor failed:', error);
  // Fall back to simple class-based approach
  return new SimpleMobileNav(element);
}
```

### 2. Development vs Production
```javascript
const isDev = window.location.hostname === 'localhost';

if (isDev) {
  // Enable XState dev tools
  // Verbose error logging
} else {
  // Production error handling
  // Silent fallbacks
}
```

## Performance Considerations

### 1. Lazy Loading
```javascript
// Only load XState machines when needed
const loadMobileNav = async () => {
  if (isMobile()) {
    const { mobileNavMachine } = await import('./mobile-nav-machine.ts');
    return createActor(mobileNavMachine);
  }
  return null;
};
```

### 2. Memory Management
```javascript
class ComponentManager {
  private actors: Set<Actor> = new Set();
  
  createActor(machine: StateMachine) {
    const actor = createActor(machine);
    this.actors.add(actor);
    return actor;
  }
  
  cleanup() {
    this.actors.forEach(actor => actor.stop());
    this.actors.clear();
  }
}
```

## Future Enhancements

### 1. TypeScript Migration
- Convert all `.js` files to `.ts`
- Add proper interfaces for machine configs
- Use XState's built-in TypeScript support

### 2. Testing Infrastructure
- Add Jest + @xstate/test
- Create machine test utilities
- Add visual regression tests

### 3. Developer Experience
- Add XState Inspector integration
- Create machine visualization tools
- Add debugging utilities

## Current Workaround

Until the XState v5 migration is complete, we're using:
- `SimpleMobileNav` class for navigation
- Direct DOM manipulation for interactions
- Event-based communication between components

This provides:
- ✅ Working mobile navigation
- ✅ No external dependencies
- ✅ Simple debugging
- ❌ Less sophisticated state management
- ❌ No state visualization tools 
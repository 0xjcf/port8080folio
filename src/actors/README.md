# Actor-Based Architecture

This directory contains feature-based actors that manage both state and UI components.

## Structure

Each actor follows this pattern:
```
actor-name/
├── types.ts        # TypeScript interfaces for context and events
├── machine.ts      # State machine configuration (serializable)
├── actions.ts      # Pure functions: actions, guards, services
├── controller.ts   # Actor lifecycle management
├── components/     # UI components (atoms → organisms)
├── tests/          # Actor-specific tests
└── index.ts        # Public API exports
```

## Actors

### 🧭 `navigation/`
Manages all navigation state and components:
- Main navbar
- Mobile navigation
- Breadcrumbs
- Navigation state (open/closed, active route)

### 📝 `forms/`
Handles form state and validation:
- Form inputs and buttons
- Newsletter signup
- Contact forms
- Validation states

### 🔍 `search/`
Search functionality:
- Search modal
- Search input with autocomplete
- Search results
- Recent searches

### 📄 `content/`
Page content and sections:
- Hero sections
- Content layouts
- Project cards
- Blog posts

### 🎭 `ui-orchestrator/`
Root actor that coordinates all other actors:
- Viewport management
- Theme switching
- Inter-actor communication
- Global app state

## Usage

### Creating a New Actor

1. Create the directory structure:
```bash
mkdir -p src/actors/my-feature/{components,tests}
```

2. Define types (`types.ts`):
```typescript
export interface MyFeatureContext {
  // Actor state
}

export type MyFeatureEvent =
  | { type: 'ACTION_ONE'; payload: string }
  | { type: 'ACTION_TWO' };
```

3. Create the state machine (`machine.ts`):
```typescript
import { createMachine } from 'xstate';
import type { MyFeatureContext, MyFeatureEvent } from './types';

export const myFeatureMachine = createMachine<MyFeatureContext, MyFeatureEvent>({
  id: 'myFeature',
  initial: 'idle',
  context: {
    // Initial context
  },
  states: {
    idle: {
      on: {
        ACTION_ONE: 'active'
      }
    },
    active: {
      // State configuration
    }
  }
});
```

4. Implement the controller (`controller.ts`):
```typescript
import { createActor } from 'xstate';
import { myFeatureMachine } from './machine';

export class MyFeatureController {
  private actor;
  
  constructor() {
    this.actor = createActor(myFeatureMachine);
    this.setupSubscriptions();
    this.actor.start();
  }
  
  private setupSubscriptions() {
    this.actor.subscribe((state) => {
      // Update UI based on state
    });
  }
}
```

5. Create components as needed in `components/`

6. Export public API (`index.ts`):
```typescript
export { MyFeatureController } from './controller';
export type { MyFeatureContext, MyFeatureEvent } from './types';
```

## Best Practices

1. **Keep actors focused** - One feature per actor
2. **Use TypeScript** - Type safety for all actors
3. **Pure functions** - Actions should have no side effects
4. **Component hierarchy** - Atoms → Molecules → Organisms
5. **Test everything** - Unit tests for machines, integration tests for actors 
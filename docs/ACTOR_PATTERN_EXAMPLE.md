# Actor Pattern Example

This demonstrates the correct way to connect web components with actors.

## File Structure

```
src/actors/todos/
├── types.ts        # TypeScript interfaces
├── machine.ts      # State machine definition
├── actions.ts      # Pure action functions
├── controller.ts   # Actor management
├── components/     # UI components
│   └── todo-list.ts
└── index.ts        # Public exports
```

## The Pattern

```typescript
// 1. Web Component (UI Layer)
export class TodoList extends HTMLElement {
  private controller: TodoController;
  
  connectedCallback() {
    // Pass the component instance to the controller
    this.controller = new TodoController(this); // ✅ Correct - passing component
    this.controller.start();
  }
  
  // UI update methods the controller will call
  updateTodos(todos: Todo[]) {
    // Update DOM
  }
  
  setLoading(loading: boolean) {
    // Update loading state
  }
}

// 2. Controller (Orchestration Layer)
// src/actors/todos/controller.ts
import { createActor } from 'xstate';
import { todoMachine } from './machine';
import { todoActions } from './actions';
import type { TodoList } from './components/todo-list';

export class TodoController {
  private actor: Actor<typeof todoMachine>;
  private component: TodoList;
  
  constructor(component: TodoList) { // ✅ Receives component instance
    this.component = component;
    
    // Controller creates the actor with actions
    this.actor = createActor(todoMachine, {
      actions: todoActions  // ✅ Actions imported from actions.ts
    });
    
    this.setupSubscriptions();
  }
  
  private setupSubscriptions() {
    // Subscribe to actor state changes
    this.actor.subscribe((state) => {
      // Update component based on state
      this.component.updateTodos(state.context.todos);
      this.component.setLoading(state.matches('loading'));
    });
  }
  
  start() {
    this.actor.start();
  }
  
  // Public methods for component to call
  addTodo(text: string) {
    this.actor.send({ type: 'ADD_TODO', text });
  }
}

// 3. Actions (Pure Functions)
// src/actors/todos/actions.ts
export const todoActions = {
  saveTodo: ({ context, event }) => {
    // Pure function - returns new context
    return {
      todos: [...context.todos, {
        id: Date.now(),
        text: event.text,
        completed: false
      }]
    };
  },
  
  toggleTodo: ({ context, event }) => {
    return {
      todos: context.todos.map(todo =>
        todo.id === event.id 
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    };
  },
  
  deleteTodo: ({ context, event }) => {
    return {
      todos: context.todos.filter(todo => todo.id !== event.id)
    };
  }
};

// 4. State Machine (Logic Layer)
// src/actors/todos/machine.ts
export const todoMachine = createMachine({
  id: 'todos',
  initial: 'idle',
  context: {
    todos: []
  },
  states: {
    idle: {
      on: {
        ADD_TODO: {
          target: 'saving',
          actions: 'saveTodo'
        },
        TOGGLE_TODO: {
          actions: 'toggleTodo'
        },
        DELETE_TODO: {
          actions: 'deleteTodo'
        }
      }
    },
    saving: {
      // Could add async save logic here
      after: {
        100: 'idle' // Simulate save delay
      }
    }
  }
});
```

## Why This Pattern?

1. **Component** doesn't know about XState
2. **Controller** manages the actor lifecycle
3. **Actor** contains pure business logic
4. **Clear data flow**: Component → Controller → Actor → Controller → Component

## Common Mistakes

```typescript
// ❌ Don't pass the actor to the component
class TodoList extends HTMLElement {
  constructor(actor) { // Bad - couples component to XState
    this.actor = actor;
  }
}

// ❌ Don't create actors in components
class TodoList extends HTMLElement {
  connectedCallback() {
    this.actor = createActor(todoMachine); // Bad - mixing concerns
  }
}

// ❌ Don't pass the machine directly
class TodoList extends HTMLElement {
  constructor(machine) { // Bad - component shouldn't know about machines
    this.machine = machine;
  }
}
```

## Why Separate Actions?

The `todoActions` are defined separately from the machine for several reasons:

1. **Serializable Machines**: The state machine configuration can be serialized (no functions)
2. **Testability**: Actions can be unit tested as pure functions
3. **Reusability**: Same actions can be used in different machines
4. **Hot Reloading**: Change action logic without recreating the machine

```typescript
// ✅ Machine is serializable (can be saved/loaded)
const machineConfig = {
  states: {
    idle: {
      on: {
        ADD_TODO: {
          actions: 'saveTodo' // String reference, not function
        }
      }
    }
  }
};

// ✅ Actions are pure functions (easy to test)
test('saveTodo adds a new todo', () => {
  const result = todoActions.saveTodo({
    context: { todos: [] },
    event: { type: 'ADD_TODO', text: 'Test' }
  });
  
  expect(result.todos).toHaveLength(1);
  expect(result.todos[0].text).toBe('Test');
});
```

## Benefits

- **Testable**: Test each layer independently
- **Reusable**: Same state machine can be used with different UI frameworks
- **Maintainable**: Clear separation of concerns
- **Type-safe**: Full TypeScript support throughout
- **Serializable**: State machines can be saved/loaded from storage 
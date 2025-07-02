# Actor-Based Web Components: The XState Architecture That Scales Without Frameworks

*A comprehensive guide to building enterprise-ready applications with state machines, web standards, and the data-state pattern. Includes real production patterns and anti-patterns to avoid.*

After years of React, Vue, and Angular projects, I discovered an architecture that changed everything: **actor-based state machines paired with TypeScript web components create a framework-free architecture that's more maintainable than anything I've built before.**

No bundlers. No virtual DOM. No dependency hell. Just web standards, XState v5, and a proven actor model that scales.

**The golden rule**: Components receive controllers, never actors or machines directly. This simple principle ensures clean separation of concerns throughout your architecture.

## The Problem Nobody Talks About

We've normalized 800KB bundles. We accept that "Hello World" requires a build system. We've convinced ourselves that managing UI state without a framework is impossible.

But here's what I learned: **The browser already gives us everything we need.**

## Enter: Actor-Based Architecture

Picture this structure:

```typescript
// src/actors/forms/types.ts
export interface FormsContext {
  todos: Todo[];
  currentTodo: string;
  validation: Record<string, string[]>;
}

// src/actors/forms/machine.ts
export const formsMachine = createMachine({
  id: 'forms',
  initial: 'idle',
  context: { todos: [], currentTodo: '', validation: {} },
  states: {
    idle: {
      on: { ADD_TODO: 'adding' }
    },
    adding: {
      on: { 
        SAVE: { 
          target: 'idle', 
          actions: ['saveTodo', 'clearForm']
        },
        CANCEL: 'idle'
      }
    }
  }
});

// src/actors/forms/components/todo-list.ts
export class TodoList extends HTMLElement {
  private controller: FormsController;
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    // Pass component instance to controller - key pattern!
    this.controller = new FormsController(this);
    this.controller.start();
  }
  
  // UI update methods the controller calls
  updateTodos(todos: Todo[]) {
    // Update DOM based on state
  }
}

customElements.define('todo-list', TodoList);
```

**Separation of concerns.** State logic separate from UI. TypeScript throughout. Actor model for scalability.

## Why This Changes Everything

### 1. True Feature Isolation
Each actor owns its complete feature - state, logic, and UI. No more hunting through files to understand a feature. Everything lives together.

### 2. Actor Communication Patterns
Actors communicate through a parent orchestrator, eliminating tight coupling:

```typescript
// Forms actor needs search functionality
formsActor.send({ type: 'REQUEST_SEARCH', query: email });

// UI Orchestrator forwards to search actor
orchestrator.on('REQUEST_SEARCH', (event) => {
  searchActor.send({ type: 'OPEN_WITH_QUERY', query: event.query });
});
```

### 3. Incremental Migration
You can migrate one feature at a time. Your existing code continues working while you gradually move to actors. No big bang rewrites.

### 4. Type Safety Throughout
Full TypeScript support means refactoring is safe. Change an event type? TypeScript tells you every place that needs updating. No runtime surprises.

## Real-World Example: Mobile Navigation Actor

Here's our actual mobile navigation implementation:

```typescript
// src/actors/navigation/machine.ts
export const mobileNavMachine = createMachine({
  id: 'mobileNav',
  initial: 'closed',
  context: {
    openSource: null,
    closeSource: null,
    lastFocusedElement: null
  },
  states: {
    closed: {
      entry: ['restoreFocus', 'enableBodyScroll'],
      on: {
        OPEN: {
          target: 'open',
          actions: ['setOpenSource', 'saveFocusedElement']
        }
      }
    },
    open: {
      entry: ['disableBodyScroll', 'focusFirstItem'],
      on: {
        CLOSE: {
          target: 'closed',
          actions: ['setCloseSource']
        },
        CLICK_OUTSIDE: {
          target: 'closed',
          actions: ['setCloseSource']
        },
        ESCAPE: {
          target: 'closed',
          actions: ['setCloseSource']
        }
      }
    }
  }
});

// src/actors/navigation/controller.ts
export class MobileNavController {
  private actor: Actor<typeof mobileNavMachine>;
  private component: MobileNavComponent;
  
  constructor(component: MobileNavComponent) {
    this.component = component;
    this.actor = createActor(mobileNavMachine, {
      actions: {
        // Pure functions defined in actions.ts
        setOpenSource,
        saveFocusedElement,
        restoreFocus,
        // ... more actions
      }
    });
    
    this.setupSubscriptions();
  }
  
  private setupSubscriptions(): void {
    this.actor.subscribe((state) => {
      // Sync state to data attributes - CSS handles the rest!
      this.component.dataset.state = state.value;
      
      // Update ARIA attributes for accessibility
      const isOpen = state.matches('open');
      this.component.setAttribute('aria-hidden', (!isOpen).toString());
    });
  }
}
```

**Production-ready.** Full TypeScript. Accessibility built-in. Testable architecture.

## The Data-State Pattern: CSS-Driven UI

Here's a pattern that eliminates most DOM manipulation code - let CSS handle visual states:

```css
/* mobile-nav.css */
mobile-nav[data-state="closed"] {
  transform: translateX(-100%);
  pointer-events: none;
}

mobile-nav[data-state="open"] {
  transform: translateX(0);
  pointer-events: auto;
}

mobile-nav[data-state="open"] .backdrop {
  opacity: 1;
}

/* Form states */
form[data-state="submitting"] button {
  cursor: wait;
  opacity: 0.7;
}

form[data-state="submitting"] .spinner {
  display: block;
}

form[data-state="error"] .error-message {
  display: block;
  color: var(--color-error);
}
```

No more `classList.add()`, no more `style.display = 'none'`. The controller syncs state to data attributes, CSS handles the rest. **Separation of concerns at its finest.**

## Common Pitfalls (And How to Avoid Them)

After building several production apps, here are the anti-patterns to avoid:

```typescript
// ❌ DON'T: Pass actors to components
class TodoList extends HTMLElement {
  constructor(actor) { // Components shouldn't know about XState
    this.actor = actor;
  }
}

// ✅ DO: Pass components to controllers
class TodoList extends HTMLElement {
  connectedCallback() {
    this.controller = new TodoController(this); // Controller manages actor
  }
}

// ❌ DON'T: Mix concerns in state machines
const machine = createMachine({
  actions: {
    updateDOM: () => {
      document.querySelector('.todo').innerHTML = '...'; // No DOM here!
    }
  }
});

// ✅ DO: Keep actions pure
const actions = {
  addTodo: ({ context, event }) => ({
    todos: [...context.todos, { id: Date.now(), text: event.text }]
  })
};
```

*For a deep dive into these patterns with comprehensive examples, check out our [Actor Pattern Example Guide](./docs/ACTOR_PATTERN_EXAMPLE.md).*

## The Architecture That Scales

After building several production apps this way, here's the actor-based pattern we use:

```
src/
├── actors/                      # Feature-based actors
│   ├── navigation/
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── machine.ts          # State machine (serializable)
│   │   ├── actions.ts          # Pure functions
│   │   ├── controller.ts       # Actor lifecycle
│   │   ├── components/         # UI components
│   │   │   ├── navbar.ts       
│   │   │   └── mobile-nav.ts   
│   │   └── index.ts            # Public API
│   ├── forms/
│   ├── search/
│   └── ui-orchestrator/        # Root actor
├── shared/                      # Cross-actor components
│   ├── atoms/
│   └── molecules/
└── styles/
    ├── tokens/                  # Design tokens
    └── themes/                  # Theme variations
```

Each actor is self-contained. Complete separation of concerns. Everything is typed and testable.

### Why Separate Actions from Machines?

This is crucial for scalability:

```typescript
// machine.ts - Pure configuration (serializable!)
export const todoMachine = createMachine({
  states: {
    idle: {
      on: {
        ADD_TODO: {
          actions: 'saveTodo' // String reference, not function
        }
      }
    }
  }
});

// actions.ts - Pure functions (testable!)
export const todoActions = {
  saveTodo: ({ context, event }) => ({
    todos: [...context.todos, { id: Date.now(), text: event.text }]
  })
};

// controller.ts - Wire them together
const actor = createActor(todoMachine, {
  actions: todoActions // Actions passed at runtime
});
```

**Benefits:**
- **Serializable machines** - Save/load state configurations
- **Hot reloading** - Change logic without recreating machines
- **Unit testable** - Test pure functions in isolation
- **Reusable actions** - Share across different machines

### Design System Integration

We pair this with atomic design principles:
- **Shared atoms** live in `src/shared/atoms/` (icons, typography)
- **Actor-specific components** live with their actor
- **Design tokens** provide consistency across all components
- **No global CSS** - each component owns its styles

## Performance That Surprises

Our production metrics after migrating to actors:
- **Zero Build Time**: Import maps + TypeScript = instant development
- **Bundle Size**: No bundler needed - modules load on demand
- **100% Type Coverage**: Full TypeScript across 2 pages and counting
- **Code Splitting**: Natural with ES modules and actors
- **Lighthouse Score**: 98-100 consistently

Additional benefits we discovered:
- **1,700-line component** → **12 clean actors**
- **Global state spaghetti** → **Isolated actor contexts**
- **Debugging nightmare** → **XState DevTools visualization**
- **Prop drilling** → **Actor-to-actor messaging**

Turns out, browsers are incredibly fast when you use web standards properly.

## When Frameworks Make Sense (And When They Don't)

I'm not anti-framework. But I've learned to ask: **"What am I actually getting for this complexity?"**

Use a framework when:
- You need complex data synchronization across many components
- Your team already knows it well
- You're building a large SPA with extensive routing needs

Skip the framework when:
- You're building document-based sites with islands of interactivity
- Performance is critical
- You want your code to work in 5 years without maintenance
- You're tired of the build step breaking

## Testing That Actually Works

The actor model makes testing straightforward:

```typescript
// Test the state machine logic in isolation
test('navigation opens on OPEN event', () => {
  const actor = createActor(mobileNavMachine);
  actor.start();
  
  actor.send({ type: 'OPEN', source: 'menu-button' });
  
  expect(actor.getSnapshot().value).toBe('open');
  expect(actor.getSnapshot().context.openSource).toBe('menu-button');
});

// Test UI components separately
test('mobile nav reflects state in data attributes', () => {
  const nav = new MobileNavComponent();
  document.body.appendChild(nav);
  
  // Controller sets data-state
  nav.dataset.state = 'closed';
  
  expect(nav.dataset.state).toBe('closed');
  expect(nav.getAttribute('aria-hidden')).toBe('true');
  
  // CSS handles visual state based on [data-state="closed"]
});
```

No mocking frameworks. No complex setup. Just pure functions and web standards.

## Start Small, Think Big

You don't need to rewrite your app. Here's how we migrate:

1. **Pick a feature** (navigation, forms, search)
2. **Create an actor** with its state machine
3. **Extract components** into the actor's folder
4. **Connect to ui-orchestrator** for coordination
5. **Add TypeScript** for full type safety

Our migration path:
- Week 1: Navigation actor (✅ Complete)
- Week 2: Forms actor (Newsletter, contact forms)
- Week 3: Search actor (Modal, autocomplete)
- Week 4: Content actors (Hero, sections)

Each migration makes the next one easier.

## Key Patterns Summary

After months of production use, these patterns have proven essential:

### ✅ The Four Layers
1. **Component (View)** - UI only, receives controller
2. **Controller (Bridge)** - Manages actor, syncs state to UI
3. **Machine (Logic)** - Pure configuration, serializable
4. **Actions (Functions)** - Pure business logic, testable

### ✅ Data-State CSS Pattern
```typescript
// Controller syncs state
this.component.dataset.state = state.value;
// ARIA updates automatically via AriaObserver!
```
```css
/* CSS handles visuals */
[data-state="loading"] { opacity: 0.5; }
[data-state="error"] { border-color: red; }
```
**Bonus**: Automate ARIA attributes - see our [ARIA Automation Guide](./docs/ARIA_AUTOMATION_PATTERNS.md)

### ✅ Communication Flow
```
Component → Controller → Actor → Controller → Component
         ↓                              ↓
    Custom Events                 Data Attributes
```

### ❌ Anti-Patterns to Avoid
- Don't pass actors to components
- Don't manipulate DOM in state machines
- Don't use classes for state representation
- Don't create actors inside components

## The Future Is Already Here

The actor model isn't new - it's battle-tested from distributed systems. XState isn't experimental - it's production-ready. Web components aren't bleeding edge - they're supported everywhere.

Our stack proves this architecture scales:

- **XState v5**: Actor-based state management
- **TypeScript**: Type safety without compilation
- **Web Components**: True encapsulation
- **Import Maps**: Zero-build development
- **ES Modules**: Natural code splitting

## Your Next Steps

1. **Study the patterns**: Read our [Actor Pattern Example](./docs/ACTOR_PATTERN_EXAMPLE.md) for implementation details
2. **Review the architecture**: Check our [Design System Guide](./docs/DESIGN_SYSTEM.md) for the complete picture
3. **Build one actor**: Start with navigation or forms using the patterns
4. **Use data-state CSS**: Let CSS handle visual states, not JavaScript
5. **Measure the difference**: No more bundle anxiety
6. **Share your results**: The community needs to know

The web platform has everything we need. It's time to stop fighting it.

---

*Ready to dive deeper? Explore our comprehensive guides:*
- *[Actor Pattern Example](./docs/ACTOR_PATTERN_EXAMPLE.md) - Implementation patterns and anti-patterns*
- *[Design System Architecture](./docs/DESIGN_SYSTEM.md) - Complete architectural guide with CSS patterns*
- *[ARIA Automation Patterns](./docs/ARIA_AUTOMATION_PATTERNS.md) - Automate accessibility with data-state*
- *[Accessibility & UX Guide](./docs/ACCESSIBILITY_UX_GUIDE.md) - Focus, keyboard, motion, and more*
- *[Implementation Plan](./docs/IMPLEMENTATION_PLAN.md) - Step-by-step migration guide*

*Have you tried the actor model with web components? What patterns have emerged in your projects?*

#ActorModel #XState #WebComponents #TypeScript #StateMachines #FrameworkFree #WebStandards #FrontendArchitecture
# Design System Architecture

## Overview

This design system follows **Atomic Design** principles adapted for Web Components with an **Actor-Based Architecture**, providing a scalable and maintainable approach to styling, state management, and component organization.

### Quick Reference: The Actor Pattern

```typescript
// 1. Component (View) - Handles UI only
class MyComponent extends HTMLElement {
  controller: MyController;
  connectedCallback() {
    this.controller = new MyController(this); // Pass component to controller
  }
}

// 2. Controller (Bridge) - Connects UI to State
class MyController {
  constructor(component: MyComponent) {
    this.actor = createActor(myMachine, { actions: myActions });
    this.actor.subscribe(state => {
      // Sync state to data attributes
      component.dataset.state = state.value;
      component.update(state);
    });
  }
}

// 3. Machine (Logic) - Pure configuration
const myMachine = createMachine({
  states: { idle: { on: { EVENT: { actions: 'myAction' }}}}
});

// 4. Actions (Functions) - Pure business logic
const myActions = {
  myAction: ({ context }) => ({ ...context, updated: true })
};

// 5. CSS (Styling) - State-driven styling
my-component[data-state="loading"] { opacity: 0.5; }
my-component[data-state="error"] { border: 1px solid red; }
```

**Key Rules:** 
- Components receive controllers, never actors or machines directly
- Use data-state attributes for CSS styling, not JavaScript DOM manipulation

## Table of Contents

1. [Core Principles](#core-principles)
2. [Atomic Design Hierarchy](#atomic-design-hierarchy)
3. [Design Tokens](#design-tokens)
4. [File Structure](#file-structure)
5. [The Actor Pattern](#the-actor-pattern)
6. [Minimal API Integration](#minimal-api-integration)
7. [Common Actor Pattern Mistakes](#common-actor-pattern-mistakes)
8. [CSS Architecture](#css-architecture)
   - [Data State Pattern](#data-state-pattern)
   - [Token-Based Styling](#token-based-styling)
   - [Component Encapsulation](#component-encapsulation)
9. [Component Guidelines](#component-guidelines)
10. [Component Examples](#component-examples)
11. [Inter-Actor Communication](#inter-actor-communication)
12. [Testing Strategy](#testing-strategy)
13. [Best Practices](#best-practices)
14. [ARIA Automation](./ARIA_AUTOMATION_PATTERNS.md)
15. [Migration Plan](#migration-plan)

## Core Principles

### 1. **Component-First Architecture**
- Each Web Component encapsulates its own styles
- Shared styles use CSS custom properties (design tokens)
- Progressive enhancement from atoms to organisms

### 2. **Type Safety**
- TypeScript for all components
- Typed design tokens and theme interfaces
- Compile-time validation

### 3. **Performance**
- CSS-in-JS within Shadow DOM for encapsulation
- Lazy loading for complex components
- Minimal runtime overhead

### 4. **Accessibility**
- ARIA attributes baked into components
- Keyboard navigation support
- Screen reader optimization

## Atomic Design Hierarchy

### 🔵 **Atoms** (Base Elements)
The smallest building blocks - cannot be broken down further.

**Current Examples:**
- `brand-icon` - Logo/brand mark
- `loading-state` - Loading spinner
- Buttons (need extraction from main.css)
- Typography elements
- Form inputs

**Location:** `src/components/atoms/`

### 🟢 **Molecules** (Simple Components)
Groups of atoms working together as a unit.

**Current Examples:**
- `breadcrumbs` - Navigation breadcrumb
- `project-card` - Project display card
- Form groups (label + input + helper text)
- Navigation items

**Location:** `src/components/molecules/`

### 🟡 **Organisms** (Complex Components)
Complex UI components composed of molecules and/or atoms.

**Current Examples:**
- `navbar` - Full navigation bar
- `mobile-nav` - Mobile navigation system
- `search-modal` - Search interface
- `privacy-notice` - Privacy consent banner
- Newsletter signup form

**Location:** `src/components/organisms/`

### 🟠 **Templates** (Layout Components)
Page-level layout structures.

**Current Examples:**
- `hero-section-enhanced` - Hero layout
- `about-section` - About page layout
- `projects-section` - Portfolio layout
- `blog-posts` - Blog listing layout

**Location:** `src/components/templates/`

### 🔴 **Pages** (Full Pages)
Complete pages combining all levels.

**Current Examples:**
- `index.html` - Homepage
- `about/index.html` - About page
- `blog/index.html` - Blog page
- `resources/index.html` - Resources page

**Location:** Root and subdirectories

## Design Tokens

### Structure
```
src/styles/
├── tokens/
│   ├── colors.css          # Color palette
│   ├── typography.css      # Font families, sizes, weights
│   ├── spacing.css         # Margin, padding scales
│   ├── shadows.css         # Box shadows
│   ├── animations.css      # Transitions, animations
│   └── breakpoints.css     # Responsive breakpoints
├── themes/
│   ├── dark.css           # Dark theme overrides
│   └── light.css          # Light theme (future)
└── utilities/
    ├── reset.css          # CSS reset
    ├── layout.css         # Layout utilities
    └── helpers.css        # Utility classes
```

### Current Design Tokens (from main.css)
```css
:root {
  /* Colors */
  --color-bg-primary: #080808;
  --color-bg-secondary: #0F1115;
  --color-bg-tertiary: #121620;
  --color-text-primary: #F5F5F5;
  --color-text-heading: #FFFFFF;
  --color-accent: #0D99FF;
  --color-accent-light: #47B4FF;
  
  /* Typography */
  --font-primary: "Inter", sans-serif;
  --font-display: "Inter", sans-serif;
  
  /* Spacing Scale (8px base) */
  --space-xs: 0.5rem;   /* 8px */
  --space-sm: 1rem;     /* 16px */
  --space-md: 1.5rem;   /* 24px */
  --space-lg: 2rem;     /* 32px */
  --space-xl: 3rem;     /* 48px */
  --space-2xl: 4rem;    /* 64px */
  
  /* Font Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
  --transition-slow: 500ms ease;
  
  /* Z-Index Scale */
  --z-base: 0;
  --z-dropdown: 1000;
  --z-overlay: 2000;
  --z-modal: 3000;
  --z-toast: 4000;
}
```

## File Structure

### Actor-Based Structure
```
src/
├── actors/                      # Feature-based actors with their components
│   ├── navigation/
│   │   ├── types.ts            # Navigation types & interfaces
│   │   ├── machine.ts          # Navigation state machine
│   │   ├── actions.ts          # Pure actions, guards, services
│   │   ├── controller.ts       # Actor management
│   │   ├── components/         # UI components for this actor
│   │   │   ├── navbar.ts       # Organism
│   │   │   ├── nav-item.ts     # Molecule
│   │   │   ├── nav-link.ts     # Atom
│   │   │   └── mobile-nav.ts   # Organism
│   │   └── index.ts
│   │
│   ├── forms/
│   │   ├── types.ts
│   │   ├── machine.ts
│   │   ├── actions.ts
│   │   ├── controller.ts
│   │   ├── components/
│   │   │   ├── newsletter-form.ts    # Organism
│   │   │   ├── form-group.ts         # Molecule
│   │   │   ├── input.ts              # Atom
│   │   │   ├── button.ts             # Atom
│   │   │   └── validation-message.ts # Atom
│   │   └── index.ts
│   │
│   ├── content/
│   │   ├── types.ts
│   │   ├── machine.ts
│   │   ├── actions.ts
│   │   ├── controller.ts
│   │   ├── components/
│   │   │   ├── hero-section.ts       # Template
│   │   │   ├── content-section.ts    # Template
│   │   │   ├── project-card.ts       # Molecule
│   │   │   └── stat-card.ts          # Molecule
│   │   └── index.ts
│   │
│   ├── search/
│   │   ├── types.ts
│   │   ├── machine.ts
│   │   ├── actions.ts
│   │   ├── controller.ts
│   │   ├── components/
│   │   │   ├── search-modal.ts       # Organism
│   │   │   ├── search-input.ts       # Molecule
│   │   │   └── search-result.ts      # Molecule
│   │   └── index.ts
│   │
│   └── ui-orchestrator/         # Root actor coordinating others
│       ├── types.ts
│       ├── machine.ts
│       ├── actions.ts
│       ├── controller.ts
│       └── index.ts
│
├── shared/                      # Shared components not tied to actors
│   ├── atoms/
│   │   ├── icon/
│   │   ├── typography/
│   │   └── loading/
│   ├── molecules/
│   │   └── breadcrumbs/
│   └── utilities/
│       ├── focus-trap.ts
│       └── viewport-observer.ts
│
├── styles/
│   ├── tokens/
│   │   ├── colors.css
│   │   ├── typography.css
│   │   ├── spacing.css
│   │   ├── shadows.css
│   │   ├── animations.css
│   │   └── breakpoints.css
│   ├── themes/
│   │   ├── dark.css
│   │   └── light.css
│   ├── mixins/
│   │   ├── glassmorphism.ts
│   │   ├── focus-ring.ts
│   │   └── hover-effects.ts
│   └── main.css
│
└── types/
    ├── design-system.ts
    ├── actors.ts
    └── components.ts
```

### Benefits of Actor-Based Structure

1. **Feature Cohesion**: All related code (state, UI, logic) lives together
2. **Clear Ownership**: Each actor owns its components and state
3. **Scalable**: New features are new actors, not scattered files
4. **Testable**: Each layer can be tested independently
   - Test UI components in isolation
   - Unit test pure action functions
   - Test state machines without DOM
5. **Reusable**: Actors can be composed and reused across projects
6. **Maintainable**: Clear separation of concerns
   - Changes to styling don't affect logic
   - Business logic changes don't break UI
   - Clear code organization
7. **Serializable**: State machines can be saved/loaded from storage
8. **Type-safe**: Full TypeScript support throughout
9. **Progressive Enhancement**: Works without JavaScript with graceful fallbacks

### Actor Anatomy

Each actor follows this structure:
```
actor-name/
├── types.ts        # TypeScript interfaces for context, events
├── machine.ts      # State machine configuration (serializable)
├── actions.ts      # Pure functions: actions, guards, services
├── controller.ts   # Actor lifecycle management
├── components/     # UI components (atoms → organisms)
│   ├── [component-name].ts
│   └── [component-name].styles.ts
├── tests/          # Actor-specific tests
│   ├── machine.test.ts
│   └── components.test.ts
└── index.ts        # Public API exports
```

### The Actor Pattern

The actor pattern provides clear separation of concerns:

```typescript
// 1. Web Component (UI Layer) - No XState knowledge
export class TodoList extends HTMLElement {
  private controller: TodoController;
  
  connectedCallback() {
    // Pass the component instance to the controller
    this.controller = new TodoController(this); // ✅ Correct
    this.controller.start();
  }
  
  // UI update methods the controller will call
  updateTodos(todos: Todo[]) { /* Update DOM */ }
  setLoading(loading: boolean) { /* Update loading state */ }
}

// 2. Controller (Bridge Layer) - Connects UI to State
export class TodoController {
  private actor: Actor<typeof todoMachine>;
  private component: TodoList;
  
  constructor(component: TodoList) {
    this.component = component;
    
    // Controller creates the actor with actions
    this.actor = createActor(todoMachine, {
      actions: todoActions
    });
    
    this.setupSubscriptions();
  }
  
  private setupSubscriptions() {
    // Subscribe to state changes and update UI
    this.actor.subscribe((state) => {
      this.component.updateTodos(state.context.todos);
      this.component.setLoading(state.matches('loading'));
    });
  }
}

// 3. Actions (Pure Functions) - Separate for testability
export const todoActions = {
  saveTodo: ({ context, event }) => ({
    todos: [...context.todos, {
      id: Date.now(),
      text: event.text,
      completed: false
    }]
  })
};

// 4. Machine (Pure Configuration) - Serializable
export const todoMachine = createMachine({
  id: 'todos',
  states: {
    idle: {
      on: {
        ADD_TODO: {
          target: 'saving',
          actions: 'saveTodo' // String reference
        }
      }
    }
  }
});
```

### Why Separate Actions?

Actions are defined separately from machines for important reasons:

1. **Serializable Machines**: State configurations can be saved/loaded
2. **Testability**: Pure functions are trivial to unit test
3. **Reusability**: Same actions across different machines
4. **Hot Reloading**: Change logic without recreating machines

```typescript
// ✅ Machine is serializable (no function references)
const config = JSON.stringify(todoMachine.config);

// ✅ Actions are testable pure functions
test('saveTodo adds a new todo', () => {
  const result = todoActions.saveTodo({
    context: { todos: [] },
    event: { type: 'ADD_TODO', text: 'Test' }
  });
  expect(result.todos).toHaveLength(1);
});
```

## CSS Architecture

### 1. **Data State Pattern**
Use data attributes to represent state machine states in the DOM for cleaner, more maintainable styling:

```typescript
// Controller syncs state machine state to data attributes
class TodoController {
  private setupSubscriptions(): void {
    this.actor.subscribe((state) => {
      // Sync state value to data-state attribute
      this.component.dataset.state = state.value;
      
      // Can also sync specific context values
      this.component.dataset.loading = state.context.loading.toString();
      this.component.dataset.error = state.context.error ? 'true' : 'false';
      
      // For nested states, use dot notation
      if (typeof state.value === 'object') {
        this.component.dataset.state = Object.keys(state.value).join('.');
      }
    });
  }
}
```

```css
/* Style components based on state machine states */
todo-list[data-state="idle"] {
  opacity: 1;
}

todo-list[data-state="loading"] {
  opacity: 0.6;
  pointer-events: none;
}

todo-list[data-state="error"] {
  border: 2px solid var(--color-error);
}

/* Target specific boolean flags */
todo-list[data-loading="true"] .spinner {
  display: block;
}

/* Target nested states */
form-wizard[data-state="filling.personalInfo"] .personal-section {
  display: block;
}

/* Combine with other attributes for complex states */
form-button[data-state="submitting"][data-valid="false"] {
  cursor: not-allowed;
  opacity: 0.5;
}
```

**Benefits of Data State Pattern:**
- ✅ **Explicit State**: State is visible in the DOM for debugging
- ✅ **No Class Conflicts**: Avoids CSS cascade issues from multiple classes
- ✅ **Direct Mapping**: State machine states map directly to styling
- ✅ **Type Safety**: TypeScript ensures valid state values
- ✅ **Scalable**: Easy to add new states without touching CSS

### 2. **Token-Based Styling**
All components use design tokens for consistency:

```typescript
// button.styles.ts
export const buttonStyles = `
  :host {
    --button-padding: var(--space-sm) var(--space-md);
    --button-font-size: var(--text-base);
    --button-font-weight: var(--font-semibold);
    --button-radius: var(--radius-md);
    --button-transition: var(--transition-base);
  }

  button {
    padding: var(--button-padding);
    font-size: var(--button-font-size);
    font-weight: var(--button-font-weight);
    border-radius: var(--button-radius);
    transition: all var(--button-transition);
    position: relative;
  }
  
  /* Hide spinner by default */
  .spinner {
    display: none;
    position: absolute;
    inset: 0;
    margin: auto;
  }
  
  /* State-based styling */
  button[data-state="idle"] {
    cursor: pointer;
  }
  
  button[data-state="submitting"] {
    cursor: wait;
    opacity: 0.7;
  }
  
  button[data-state="submitting"] .spinner {
    display: block;
  }
  
  button[data-state="submitting"] slot {
    visibility: hidden;
  }
  
  button[data-state="success"] {
    background-color: var(--color-success);
  }
  
  button[data-state="error"] {
    background-color: var(--color-error);
  }
`;
```

### 3. **Component Encapsulation**
Each component manages its own styles with data state awareness:

```css
/* mobile-nav.styles.ts */
export const mobileNavStyles = `
  :host {
    display: block;
    position: fixed;
    inset: 0;
    z-index: var(--z-modal);
    pointer-events: none;
  }
  
  /* Closed state */
  :host([data-state="closed"]) .backdrop {
    opacity: 0;
    pointer-events: none;
  }
  
  :host([data-state="closed"]) .panel {
    transform: translateX(-100%);
  }
  
  /* Open state */
  :host([data-state="mobileMenuOpen"]) {
    pointer-events: auto;
  }
  
  :host([data-state="mobileMenuOpen"]) .backdrop {
    opacity: 1;
    pointer-events: auto;
  }
  
  :host([data-state="mobileMenuOpen"]) .panel {
    transform: translateX(0);
  }
  
  /* Transitioning states */
  :host([data-state="opening"]) .panel,
  :host([data-state="closing"]) .panel {
    transition: transform var(--transition-base);
  }
  
  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    transition: opacity var(--transition-base);
  }
  
  .panel {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 80%;
    max-width: 320px;
    background: var(--color-bg-secondary);
    box-shadow: var(--shadow-xl);
  }
`;
```

### 4. **Component Implementation**
Components read their state from data attributes:

```typescript
// button.ts
import { buttonStyles } from './button.styles';

class Button extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot) return;
    
    this.shadowRoot.innerHTML = `
      <style>${buttonStyles}</style>
      <button>
        <slot></slot>
      </button>
    `;
  }
}
```

### 5. **Shared Styles**
Common patterns extracted as mixins:

```typescript
// src/styles/mixins.ts
export const focusRing = `
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
`;

export const glassmorphism = `
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;
```

## Component Guidelines

### Naming Convention
- **Actors:** Feature-based names (`navigation`, `forms`, `search`, `content`)
- **Components within actors:**
  - **Atoms:** Prefixed with actor name (`form-button`, `nav-link`, `search-icon`)
  - **Molecules:** Actor + descriptive (`form-group`, `nav-item`, `search-result`)
  - **Organisms:** Actor + feature (`newsletter-form`, `mobile-nav`, `search-modal`)
- **Shared components:** Generic names (`ds-icon`, `ds-typography`, `ds-loading`)

### Component Structure
```typescript
// Template for all components
interface ComponentConfig {
  // Component-specific configuration
}

class ComponentName extends HTMLElement {
  private config: ComponentConfig;
  
  static get observedAttributes(): string[] {
    return ['attribute-name'];
  }
  
  constructor(config?: ComponentConfig) {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = config || {};
  }
  
  connectedCallback(): void {
    this.render();
    this.attachEventListeners();
  }
  
  disconnectedCallback(): void {
    this.removeEventListeners();
  }
  
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    // Handle attribute changes
  }
  
  private render(): void {
    // Render component
  }
  
  private attachEventListeners(): void {
    // Add event listeners
  }
  
  private removeEventListeners(): void {
    // Clean up
  }
}
```

## Migration Plan

### Phase 1: Foundation & First Actor (Week 1)
1. Extract design tokens from `main.css`
2. Create token files structure
3. Set up `ui-orchestrator` actor as the root
4. Migrate `mobile-nav` to new `navigation` actor structure

### Phase 2: Forms Actor (Week 2)
1. Create `forms` actor structure
2. Extract button, input atoms into forms actor
3. Build newsletter form as first form organism
4. Implement form validation state machine

### Phase 3: Content Actor (Week 3)
1. Create `content` actor for page sections
2. Migrate hero-section to content actor
3. Extract project-card, stat-card molecules
4. Implement content loading states

### Phase 4: Search Actor (Week 4)
1. Create `search` actor structure
2. Migrate search-modal and search-component
3. Implement search state machine
4. Add keyboard navigation

### Phase 5: Integration & Polish (Week 5)
1. Connect all actors through ui-orchestrator
2. Implement inter-actor communication
3. Performance optimization
4. Documentation and examples

## Minimal API Integration

For simpler components that don't need the full Actor pattern complexity, the framework provides a **Minimal API** that offers automatic state management with just a machine and template function. This provides the benefits of the Actor pattern while maintaining simplicity for straightforward use cases.

### When to Use Minimal API vs Manual Actor Pattern

| Use Case | Minimal API | Manual Actor Pattern |
|----------|-------------|---------------------|
| **Simple Components** | ✅ Perfect | ❌ Overkill |
| **Quick Prototypes** | ✅ Rapid development | ❌ Too much setup |
| **Learning XState** | ✅ Easy entry point | ❌ Complex setup |
| **Complex UI Logic** | ❌ Limited flexibility | ✅ Full control |
| **Inter-Component Communication** | ❌ Basic events only | ✅ Rich messaging |
| **Custom Lifecycle Management** | ❌ Automatic only | ✅ Full control |
| **Framework Integration** | ✅ Automatic | ✅ Manual setup |

### Minimal API Approach

**Best for:** Standalone components, form widgets, simple UI state, rapid prototyping

```typescript
import { createComponent, html } from 'src/framework/core/minimal-api.js';
import { setup, assign } from 'xstate';

// 1. Define your state machine
const counterMachine = setup({
  types: {
    context: {} as { count: number },
    events: {} as { type: 'INCREMENT' } | { type: 'DECREMENT' }
  },
  actions: {
    increment: assign({ count: ({ context }) => context.count + 1 }),
    decrement: assign({ count: ({ context }) => context.count - 1 })
  }
}).createMachine({
  id: 'counter',
  initial: 'idle',
  context: { count: 0 },
  states: {
    idle: {
      on: {
        INCREMENT: { actions: 'increment' },
        DECREMENT: { actions: 'decrement' }
      }
    }
  }
});

// 2. Define your template function
const counterTemplate = (state: SnapshotFrom<typeof counterMachine>) => html`
  <div class="counter">
    <h3>Count: ${state.context.count}</h3>
    <button data-action="DECREMENT">-</button>
    <button data-action="INCREMENT">+</button>
  </div>
`;

// 3. Create the component
const CounterComponent = createComponent({
  machine: counterMachine,
  template: counterTemplate
});

// 4. That's it! ✨ Everything else is automatic:
// - Event binding via data-action attributes
// - State synchronization to data-state attributes  
// - DOM updates on state changes
// - Actor lifecycle management
// - Custom element registration
```

### Enhanced Minimal API with Actor Pattern Integration

For components that need Actor pattern benefits but want simplified API:

```typescript
import { createActorComponent } from 'src/framework/core/minimal-api.js';

// Creates component with full Actor pattern integration
const SmartCounterComponent = createActorComponent({
  machine: counterMachine,
  template: counterTemplate,
  integration: {
    useController: true,      // Enable Controller layer
    useEventBus: true,        // Declarative event handling via ReactiveEventBus
    useAriaObserver: true,    // Automatic ARIA updates
    componentId: 'smart-counter' // Custom ID for event bus
  }
});

// Now you get:
// ✅ ReactiveEventBus integration for cross-component communication
// ✅ AriaObserver for automatic accessibility
// ✅ Controller layer for complex interactions
// ✅ All the simplicity of the minimal API
```

### Comparison: All Three Approaches

#### 1. Minimal API (Simplest)
```typescript
// Just machine + template = working component
const SimpleComponent = createComponent({
  machine: myMachine,
  template: (state) => html`<div>Count: ${state.context.count}</div>`
});
```

#### 2. Enhanced Minimal API (Actor Pattern Benefits)
```typescript
// Machine + template + Actor pattern integration
const EnhancedComponent = createActorComponent({
  machine: myMachine,
  template: (state) => html`<div>Count: ${state.context.count}</div>`,
  integration: {
    useController: true,
    useEventBus: true,
    useAriaObserver: true
  }
});
```

#### 3. Manual Actor Pattern (Full Control)
```typescript
// Full control with explicit Controller layer
class MyComponent extends HTMLElement {
  private controller: MyController;
  
  connectedCallback() {
    this.controller = new MyController(this);
  }
}

class MyController {
  constructor(component: MyComponent) {
    this.actor = createActor(myMachine, { actions: myActions });
    this.setupSubscriptions();
  }
  
  private setupSubscriptions() {
    this.actor.subscribe(state => {
      this.component.dataset.state = state.value;
      this.component.update(state);
    });
  }
}
```

### Migration Strategy

**Start Simple, Evolve as Needed:**

1. **Begin with Minimal API** for rapid development
2. **Add Actor Integration** when you need ReactiveEventBus or AriaObserver  
3. **Move to Manual Pattern** when you need custom lifecycle or complex interactions

```typescript
// Phase 1: Start simple
const ButtonComponent = createComponent({ machine, template });

// Phase 2: Add framework integration
const SmartButtonComponent = createActorComponent({ 
  machine, 
  template,
  integration: { useEventBus: true, useAriaObserver: true }
});

// Phase 3: Full control when needed
class AdvancedButtonComponent extends HTMLElement {
  private controller: ButtonController;
  // ... full manual implementation
}
```

### Integration with Design System

**Minimal API components automatically work with the design system:**

```typescript
const StyledButtonComponent = createComponent({
  machine: buttonMachine,
  template: (state) => html`
    <button class="ds-button ds-button--${state.context.variant}">
      ${state.context.label}
    </button>
  `,
  styles: `
    /* Component-specific styles using design tokens */
    .ds-button {
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-md);
      font-weight: var(--font-semibold);
    }
    
    /* State-based styling via data-state attributes (automatic) */
    :host([data-state="loading"]) .ds-button {
      opacity: 0.7;
      cursor: wait;
    }
    
    :host([data-state="disabled"]) .ds-button {
      opacity: 0.5;
      pointer-events: none;
    }
  `
});
```

### Best Practices for Minimal API

1. **Keep machines simple** - Complex state logic should use manual Actor pattern
2. **Use data-action attributes** - Let the framework handle event binding
3. **Leverage state synchronization** - Style via data-state attributes
4. **Compose templates** - Use nested `html` calls for reusable pieces
5. **Progress enhance** - Start minimal, add Actor integration when needed

### Testing Minimal API Components

The framework provides testing utilities for both approaches:

```typescript
import { createComponent, createTestableComponent } from 'src/framework/core/minimal-api.js';

describe('Counter Component', () => {
  it('increments count on button click', async () => {
    // Create testable component instance
    const component = createTestableComponent({
      machine: counterMachine,
      template: counterTemplate
    });
    
    // Test using the same API as production
    expect(component.html()).toContain('Count: 0');
    
    component.send({ type: 'INCREMENT' });
    await waitForUpdate();
    
    expect(component.html()).toContain('Count: 1');
  });
});
```

This testing approach works identically for both minimal API and manually implemented Actor pattern components, ensuring consistency across your codebase.

## Common Actor Pattern Mistakes

Avoid these anti-patterns when implementing actors:

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

// ❌ Don't mix DOM manipulation in state machines
const machine = createMachine({
  actions: {
    updateDOM: () => {
      document.querySelector('.todo').innerHTML = '...'; // Bad
    }
  }
});
```

### Why This Pattern?

1. **Component Independence**: Components don't know about XState implementation
2. **Controller Responsibility**: Controllers manage the actor lifecycle
3. **Pure Business Logic**: Actors contain only state management logic
4. **Clear Data Flow**: Component → Controller → Actor → Controller → Component

## Component Examples

### Actor Example: Forms Actor
```typescript
// src/actors/forms/types.ts
export interface FormsContext {
  currentForm: string | null;
  validation: Record<string, string[]>;
  submitting: boolean;
}

export type FormsEvent =
  | { type: 'VALIDATE_FIELD'; fieldName: string; value: string }
  | { type: 'SUBMIT_FORM'; formId: string }
  | { type: 'CLEAR_ERRORS'; fieldName?: string };

// src/actors/forms/machine.ts
import { createMachine } from 'xstate';
import type { FormsContext, FormsEvent } from './types';

export const formsMachine = createMachine<FormsContext, FormsEvent>({
  id: 'forms',
  initial: 'idle',
  context: {
    currentForm: null,
    validation: {},
    submitting: false
  },
  states: {
    idle: {
      on: {
        VALIDATE_FIELD: 'validating',
        SUBMIT_FORM: 'submitting'
      }
    },
    validating: {
      // Validation logic
    },
    submitting: {
      // Submission logic
    }
  }
});

// src/actors/forms/components/button.ts
import { buttonStyles } from './button.styles';

interface ButtonConfig {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export class FormButton extends HTMLElement {
  private config: ButtonConfig;
  
  static get observedAttributes(): string[] {
    return ['variant', 'size', 'disabled', 'data-state'];
  }
  
  constructor(config: ButtonConfig = {}) {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      variant: 'primary',
      size: 'medium',
      ...config
    };
  }
  
  connectedCallback(): void {
    this.render();
    this.attachEventListeners();
  }
  
  private attachEventListeners(): void {
    const button = this.shadowRoot?.querySelector('button');
    button?.addEventListener('click', () => {
      // Emit custom event for parent form to handle
      this.dispatchEvent(new CustomEvent('form-submit', {
        bubbles: true,
        composed: true,
        detail: { 
          formId: this.closest('form')?.id 
        }
      }));
    });
  }
  
  private render(): void {
    if (!this.shadowRoot) return;
    
    const variant = this.getAttribute('variant') || this.config.variant;
    const size = this.getAttribute('size') || this.config.size;
    const state = this.dataset.state || 'idle';
    
    this.shadowRoot.innerHTML = `
      <style>${buttonStyles}</style>
      <button 
        class="btn btn--${variant} btn--${size}" 
        data-state="${state}"
        ${state === 'submitting' ? 'disabled' : ''}>
        <span class="spinner"></span>
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('form-button', FormButton);

// src/actors/forms/controller.ts
export class FormsController {
  private actor;
  private form: HTMLFormElement;
  
  constructor(form: HTMLFormElement) {
    this.form = form;
    
    this.actor = createActor(formsMachine, {
      actions: formsActions
    });
    
    this.setupEventListeners();
    this.setupSubscriptions();
    this.actor.start();
  }
  
  private setupEventListeners(): void {
    // Listen to custom events from child components
    this.form.addEventListener('form-submit', (event: CustomEvent) => {
      this.actor.send({ 
        type: 'SUBMIT_FORM', 
        formId: event.detail.formId 
      });
    });
  }
  
  private setupSubscriptions(): void {
    this.actor.subscribe((state) => {
      // Sync state machine state to data attributes
      this.form.dataset.state = state.value;
      
      // Also update child components
      const button = this.form.querySelector('form-button');
      if (button) {
        button.dataset.state = state.value;
      }
    });
  }
}
```

### Navigation Actor Integration
```typescript
// src/actors/navigation/controller.ts
import { createActor } from 'xstate';
import { navigationMachine } from './machine';
import { navigationActions } from './actions';
import type { NavBar } from './components/navbar';
import type { MobileNav } from './components/mobile-nav';

export class NavigationController {
  private actor;
  private navbar: NavBar;
  private mobileNav?: MobileNav;
  
  // Controller receives component instances
  constructor(navbar: NavBar) {
    this.navbar = navbar;
    this.mobileNav = navbar.querySelector('mobile-nav') as MobileNav;
    
    // Create actor with separated actions
    this.actor = createActor(navigationMachine, {
      actions: navigationActions
    });
    
    this.setupSubscriptions();
    this.actor.start();
  }
  
  private setupSubscriptions(): void {
    // Subscribe UI components to actor state changes
    this.actor.subscribe((state) => {
      // Sync state to data attributes
      this.navbar.dataset.state = state.value;
      if (this.mobileNav) {
        this.mobileNav.dataset.state = state.value;
      }
      
      // Update ARIA attributes based on state
      const isOpen = state.matches('mobileMenuOpen');
      this.mobileNav?.setAttribute('aria-hidden', (!isOpen).toString());
      this.navbar.querySelector('[aria-controls]')?.setAttribute('aria-expanded', isOpen.toString());
    });
    
    // Listen to UI events
    this.navbar?.addEventListener('menu-toggle', () => {
      this.actor.send({ type: 'TOGGLE_MOBILE_MENU' });
    });
  }
  
  // Public API for the component
  toggleMenu() {
    this.actor.send({ type: 'TOGGLE_MOBILE_MENU' });
  }
  
  closeMenu(source: string) {
    this.actor.send({ type: 'CLOSE_MENU', source });
  }
}

// Usage in the navbar component
class NavBar extends HTMLElement {
  private controller: NavigationController;
  
  connectedCallback() {
    // Pass component instance to controller
    this.controller = new NavigationController(this);
  }
}
```

## Inter-Actor Communication

### Communication Patterns

1. **Parent-Child Communication**
```typescript
// ui-orchestrator sends events to child actors
orchestrator.send({
  type: 'ROUTE_CHANGED',
  route: '/search'
});

// Child actors report back to parent
navigationActor.send({
  type: 'MENU_CLOSED',
  source: 'escape-key'
});
```

2. **Sibling Communication via Parent**
```typescript
// Forms actor needs to show search
formsActor.send({ 
  type: 'REQUEST_SEARCH',
  context: 'email-lookup' 
});

// UI Orchestrator forwards to search actor
orchestrator.on('REQUEST_SEARCH', (event) => {
  searchActor.send({ 
    type: 'OPEN_SEARCH',
    context: event.context 
  });
});
```

3. **Shared State via Context**
```typescript
// UI Orchestrator maintains shared state
interface OrchestratorContext {
  viewport: 'mobile' | 'tablet' | 'desktop';
  theme: 'light' | 'dark';
  user: User | null;
  activeActors: string[];
}
```

### Actor Lifecycle

```typescript
// Actor initialization in ui-orchestrator
class UIOrchestrator {
  private actors = new Map();
  
  initialize() {
    // Create child actors
    this.actors.set('navigation', createActor(navigationMachine));
    this.actors.set('forms', createActor(formsMachine));
    this.actors.set('search', createActor(searchMachine));
    
    // Start all actors
    this.actors.forEach(actor => actor.start());
    
    // Setup communication bridges
    this.setupActorCommunication();
  }
  
  private setupActorCommunication() {
    // Navigation → Forms communication
    this.actors.get('navigation')?.subscribe((state) => {
      if (state.matches('authenticated')) {
        this.actors.get('forms')?.send({ type: 'ENABLE_PREMIUM_FORMS' });
      }
    });
  }
}
```

## Testing Strategy

### Component Testing
Test UI components in isolation without state machines:

```typescript
// button.test.ts
describe('FormButton', () => {
  it('emits form-submit event on click', () => {
    const button = new FormButton();
    const spy = jest.fn();
    button.addEventListener('form-submit', spy);
    
    button.shadowRoot?.querySelector('button')?.click();
    
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { formId: expect.any(String) }
      })
    );
  });
});
```

### Action Testing
Test pure action functions without any UI:

```typescript
// actions.test.ts
describe('Form Actions', () => {
  it('saveTodo adds a new todo', () => {
    const result = todoActions.saveTodo({
      context: { todos: [] },
      event: { type: 'ADD_TODO', text: 'Test' }
    });
    
    expect(result.todos).toHaveLength(1);
    expect(result.todos[0].text).toBe('Test');
  });
});
```

### State Machine Testing
Test state transitions without implementation details:

```typescript
// machine.test.ts
import { createActor } from 'xstate';
import { todoMachine } from './machine';

describe('Todo Machine', () => {
  it('transitions to saving state on ADD_TODO', () => {
    const actor = createActor(todoMachine);
    actor.start();
    
    actor.send({ type: 'ADD_TODO', text: 'Test' });
    
    expect(actor.getSnapshot().value).toBe('saving');
  });
});
```

### Integration Testing
Test the full actor pattern integration:

```typescript
// integration.test.ts
describe('Todo Actor Integration', () => {
  it('updates UI when todo is added', async () => {
    const component = new TodoList();
    document.body.appendChild(component);
    
    const input = component.querySelector('input');
    const button = component.querySelector('button');
    
    input.value = 'New Todo';
    button.click();
    
    // Wait for state update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const todos = component.querySelectorAll('.todo-item');
    expect(todos).toHaveLength(1);
    expect(todos[0].textContent).toBe('New Todo');
  });
});
```

## Best Practices

### 1. **Component Independence**
- Components should work in isolation
- No external dependencies on global styles
- Self-contained functionality

### 2. **State Representation**
- Use `data-state` attributes instead of classes for state
- Sync state machine states directly to data attributes
- Let CSS handle visual changes based on state
- Keep state logic in controllers, styling in CSS

```typescript
// ✅ Good: State in data attributes
element.dataset.state = state.value;

// ❌ Avoid: State in classes or manual DOM updates
element.classList.toggle('is-loading');
element.style.display = 'none';
```

### 3. **Token Usage**
- Always use design tokens over hard-coded values
- Create component-specific tokens when needed
- Document token modifications

### 4. **Accessibility**
- Include ARIA attributes
- Support keyboard navigation
- Test with screen readers
- Maintain focus management
- Use automated ARIA patterns (see [ARIA Automation Guide](./ARIA_AUTOMATION_PATTERNS.md))

**Quick ARIA Automation:**
```typescript
// Recommended: Use AriaObserver for automatic ARIA updates
import { AriaObserver } from './shared/aria-observer';

class MyController {
  constructor(component: HTMLElement) {
    // Automatically sync ARIA based on data-state
    new AriaObserver(component);
    
    // Now just update data-state, ARIA follows automatically!
    this.actor.subscribe(state => {
      component.dataset.state = state.value;
    });
  }
}
```

### 5. **Performance**
- Lazy load heavy components
- Use CSS containment
- Minimize reflows/repaints
- Optimize for mobile first
- Let CSS handle animations via data-state

### 6. **Documentation**
- Include usage examples
- Document props/attributes
- Provide accessibility notes
- Show composition patterns
- Document state values and their meanings

## Implementation Resources

- **[Actor Pattern Example](./ACTOR_PATTERN_EXAMPLE.md)** - Detailed implementation guide
- **[ARIA Automation Patterns](./ARIA_AUTOMATION_PATTERNS.md)** - Automate accessibility attributes
- **[Accessibility & UX Guide](./ACCESSIBILITY_UX_GUIDE.md)** - Comprehensive patterns for all users
- **[Implementation Plan](./IMPLEMENTATION_PLAN.md)** - Step-by-step migration guide

## Next Steps

### Immediate Actions (This Week)

1. **Set Up Actor Structure**
   ```bash
   mkdir -p src/actors/{navigation,forms,search,content,ui-orchestrator}
   mkdir -p src/actors/navigation/{components,tests}
   mkdir -p src/shared/{atoms,molecules,utilities}
   mkdir -p src/styles/{tokens,themes,mixins}
   ```

2. **Extract Design Tokens**
   - Create `src/styles/tokens/colors.css` from existing variables
   - Create `src/styles/tokens/typography.css` for font system
   - Update main.css to import token files

3. **First Actor Migration**
   - Move `mobile-nav` to `src/actors/navigation/`
   - Create navigation state machine
   - Connect to ui-orchestrator

### Week 2: Forms Actor
- Extract button component from CSS
- Create newsletter form actor
- Implement form validation state machine

### Week 3: Search Actor  
- Migrate search-modal and search-component
- Create unified search state machine
- Add keyboard navigation

### Actor-Based Benefits

This actor-based design system provides:
- ✅ **Feature Isolation** - Each actor owns its complete feature
- ✅ **State Encapsulation** - State machines manage complexity
- ✅ **Component Reusability** - Atoms/molecules shared across actors
- ✅ **Type Safety** - Full TypeScript with XState v5
- ✅ **Testability** - Test features in isolation
- ✅ **Scalability** - New features = new actors
- ✅ **Communication Patterns** - Clear inter-actor messaging
- ✅ **Performance** - Lazy load actors as needed 
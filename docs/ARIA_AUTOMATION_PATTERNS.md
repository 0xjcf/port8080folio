# ARIA Automation Patterns for Data-State Architecture

## Overview

When using the data-state pattern, we want ARIA attributes to automatically update based on state changes without manual intervention. This document explores various approaches to achieve this automation.

## The Challenge

Currently, we manually sync ARIA attributes:

```typescript
// Current approach - manual updates
this.actor.subscribe((state) => {
  this.component.dataset.state = state.value;
  
  // Manual ARIA updates - error prone!
  const isOpen = state.matches('open');
  this.component.setAttribute('aria-hidden', (!isOpen).toString());
  this.component.setAttribute('aria-expanded', isOpen.toString());
});
```

## Approach 1: MutationObserver Pattern

Use MutationObserver to watch for data-state changes and automatically update ARIA attributes.

```typescript
// aria-observer.ts
export class AriaObserver {
  private observer: MutationObserver;
  
  // Define state-to-aria mappings
  private static ariaMappings = {
    'data-state': {
      'open': { 'aria-hidden': 'false', 'aria-expanded': 'true' },
      'closed': { 'aria-hidden': 'true', 'aria-expanded': 'false' },
      'loading': { 'aria-busy': 'true', 'aria-live': 'polite' },
      'error': { 'aria-invalid': 'true', 'role': 'alert' },
      'success': { 'aria-live': 'polite' }
    },
    'data-disabled': {
      'true': { 'aria-disabled': 'true' },
      'false': { 'aria-disabled': 'false' }
    }
  };
  
  constructor(element: HTMLElement) {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName?.startsWith('data-')) {
          this.updateAriaAttributes(element, mutation.attributeName);
        }
      });
    });
    
    // Start observing
    this.observer.observe(element, {
      attributes: true,
      attributeFilter: ['data-state', 'data-disabled', 'data-loading']
    });
    
    // Initial sync
    this.syncAllAriaAttributes(element);
  }
  
  private updateAriaAttributes(element: HTMLElement, dataAttribute: string): void {
    const value = element.getAttribute(dataAttribute);
    const mappings = AriaObserver.ariaMappings[dataAttribute];
    
    if (mappings && value && mappings[value]) {
      Object.entries(mappings[value]).forEach(([ariaAttr, ariaValue]) => {
        element.setAttribute(ariaAttr, ariaValue as string);
      });
    }
  }
  
  private syncAllAriaAttributes(element: HTMLElement): void {
    Object.keys(AriaObserver.ariaMappings).forEach(dataAttr => {
      if (element.hasAttribute(dataAttr)) {
        this.updateAriaAttributes(element, dataAttr);
      }
    });
  }
  
  disconnect(): void {
    this.observer.disconnect();
  }
}

// Usage in controller
class NavigationController {
  private ariaObserver: AriaObserver;
  
  constructor(component: HTMLElement) {
    // Automatically sync ARIA attributes
    this.ariaObserver = new AriaObserver(component);
    
    // Now we only need to update data-state!
    this.actor.subscribe((state) => {
      component.dataset.state = state.value;
      // ARIA updates happen automatically via observer
    });
  }
}
```

**Pros:**
- ✅ Declarative mapping configuration
- ✅ Works with any element
- ✅ Automatic synchronization
- ✅ No framework dependency

**Cons:**
- ❌ Performance overhead of MutationObserver
- ❌ Additional abstraction layer
- ❌ Mappings need to be maintained

## Approach 2: Web Component Lifecycle Hooks

Build ARIA automation into a base web component class.

```typescript
// base-component.ts
export abstract class BaseAccessibleComponent extends HTMLElement {
  // Override in subclasses
  protected ariaStateMap: Record<string, Record<string, string>> = {};
  
  static get observedAttributes(): string[] {
    return ['data-state', 'data-loading', 'data-error'];
  }
  
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name.startsWith('data-') && newValue !== null) {
      this.updateAriaFromDataAttribute(name, newValue);
    }
  }
  
  private updateAriaFromDataAttribute(dataAttr: string, value: string): void {
    const stateKey = dataAttr.replace('data-', '');
    const ariaMapping = this.ariaStateMap[stateKey]?.[value];
    
    if (ariaMapping) {
      Object.entries(ariaMapping).forEach(([attr, val]) => {
        this.setAttribute(attr, val);
      });
    }
  }
}

// Usage in components
class MobileNav extends BaseAccessibleComponent {
  protected ariaStateMap = {
    state: {
      'open': { 'aria-hidden': 'false', 'aria-expanded': 'true' },
      'closed': { 'aria-hidden': 'true', 'aria-expanded': 'false' },
      'opening': { 'aria-hidden': 'false', 'aria-busy': 'true' },
      'closing': { 'aria-hidden': 'true', 'aria-busy': 'true' }
    }
  };
  
  connectedCallback(): void {
    // Component logic
    this.controller = new MobileNavController(this);
  }
}

// Even simpler with decorators (if using TypeScript decorators)
@ariaState({
  state: {
    open: { hidden: false, expanded: true },
    closed: { hidden: true, expanded: false }
  }
})
class MobileNav extends HTMLElement {
  // Component implementation
}
```

**Pros:**
- ✅ Built into component lifecycle
- ✅ Type-safe with TypeScript
- ✅ No external dependencies
- ✅ Per-component customization

**Cons:**
- ❌ Only works with custom elements
- ❌ Requires base class inheritance
- ❌ Each component needs configuration

## Approach 3: Controller Mixin Pattern

Create a reusable mixin for controllers that handles ARIA automation.

```typescript
// aria-controller-mixin.ts
export interface AriaConfig {
  states: Record<string, Record<string, string | boolean>>;
  attributes?: Record<string, Record<string, string | boolean>>;
}

export function withAriaAutomation<T extends new (...args: any[]) => any>(
  Base: T,
  config: AriaConfig
) {
  return class extends Base {
    setupAriaAutomation(element: HTMLElement, actor: any): void {
      actor.subscribe((state: any) => {
        // Update data-state as usual
        element.dataset.state = state.value;
        
        // Auto-update ARIA based on config
        const ariaAttrs = config.states[state.value];
        if (ariaAttrs) {
          Object.entries(ariaAttrs).forEach(([attr, value]) => {
            const ariaAttr = attr.startsWith('aria-') ? attr : `aria-${attr}`;
            element.setAttribute(ariaAttr, String(value));
          });
        }
        
        // Handle context-based ARIA updates
        if (config.attributes) {
          Object.entries(config.attributes).forEach(([contextKey, mappings]) => {
            const contextValue = state.context[contextKey];
            if (contextValue !== undefined && mappings[contextValue]) {
              Object.entries(mappings[contextValue]).forEach(([attr, value]) => {
                element.setAttribute(attr, String(value));
              });
            }
          });
        }
      });
    }
  };
}

// Usage
const NavigationControllerWithAria = withAriaAutomation(
  NavigationController,
  {
    states: {
      open: { hidden: false, expanded: true },
      closed: { hidden: true, expanded: false }
    },
    attributes: {
      loading: {
        true: { 'aria-busy': true },
        false: { 'aria-busy': false }
      }
    }
  }
);
```

**Pros:**
- ✅ Reusable across controllers
- ✅ Flexible configuration
- ✅ Separation of concerns
- ✅ Works with existing controllers

**Cons:**
- ❌ Mixin complexity
- ❌ TypeScript typing can be tricky
- ❌ Another abstraction layer

## Approach 4: Declarative HTML Configuration

Use HTML attributes to declare ARIA mappings directly in markup.

```html
<!-- Declare ARIA mappings in HTML -->
<mobile-nav
  data-state="closed"
  data-aria-map-state='{"open": {"hidden": "false", "expanded": "true"}, "closed": {"hidden": "true", "expanded": "false"}}'
>
  <!-- Content -->
</mobile-nav>
```

```typescript
// aria-declarative.ts
export class DeclarativeAriaManager {
  static init(root: HTMLElement = document.body): void {
    const elements = root.querySelectorAll('[data-aria-map-state]');
    
    elements.forEach(element => {
      const mapData = element.getAttribute('data-aria-map-state');
      if (!mapData) return;
      
      try {
        const mappings = JSON.parse(mapData);
        this.observeElement(element as HTMLElement, mappings);
      } catch (e) {
        console.error('Invalid ARIA mapping:', e);
      }
    });
  }
  
  private static observeElement(element: HTMLElement, mappings: any): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'data-state') {
          const state = element.dataset.state;
          if (state && mappings[state]) {
            Object.entries(mappings[state]).forEach(([attr, value]) => {
              element.setAttribute(`aria-${attr}`, String(value));
            });
          }
        }
      });
    });
    
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['data-state']
    });
    
    // Initial sync
    const currentState = element.dataset.state;
    if (currentState && mappings[currentState]) {
      Object.entries(mappings[currentState]).forEach(([attr, value]) => {
        element.setAttribute(`aria-${attr}`, String(value));
      });
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  DeclarativeAriaManager.init();
});
```

**Pros:**
- ✅ No JavaScript configuration needed
- ✅ Visible in HTML
- ✅ Works with server-rendered content
- ✅ Easy to understand

**Cons:**
- ❌ JSON in HTML attributes
- ❌ Can become verbose
- ❌ Runtime parsing overhead

## Approach 5: CSS-Generated Content (Limited)

While CSS can't directly set ARIA attributes, it can provide visual indicators and some screen reader announcements.

```css
/* Visual indicators based on state */
[data-state="loading"]::before {
  content: "Loading...";
  position: absolute;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  width: 1px;
  overflow: hidden;
  white-space: nowrap;
}

/* Use CSS to show/hide screen reader text */
.sr-only {
  position: absolute;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  width: 1px;
  overflow: hidden;
}

[data-state="error"] .error-text {
  /* Visible to screen readers */
}

[data-state="success"] .success-text {
  /* Visible to screen readers */
}
```

**Note:** This approach is limited and should be combined with proper ARIA attributes.

## Approach 6: Proxy-Based Reactive System

Use JavaScript Proxies for a reactive ARIA system.

```typescript
// reactive-aria.ts
export class ReactiveAria {
  static create(element: HTMLElement, mappings: any): any {
    const state = new Proxy({}, {
      set(target: any, property: string, value: any) {
        target[property] = value;
        
        // Update data attribute
        if (property === 'state') {
          element.dataset.state = value;
        } else {
          element.dataset[property] = value;
        }
        
        // Update ARIA based on mappings
        if (mappings[property] && mappings[property][value]) {
          Object.entries(mappings[property][value]).forEach(([attr, val]) => {
            element.setAttribute(attr, String(val));
          });
        }
        
        return true;
      }
    });
    
    return state;
  }
}

// Usage
const nav = document.querySelector('mobile-nav');
const navState = ReactiveAria.create(nav, {
  state: {
    open: { 'aria-hidden': 'false', 'aria-expanded': 'true' },
    closed: { 'aria-hidden': 'true', 'aria-expanded': 'false' }
  }
});

// Changing state automatically updates ARIA
navState.state = 'open'; // Sets data-state="open" and aria-hidden="false"
```

**Pros:**
- ✅ Very clean API
- ✅ Truly reactive
- ✅ No observers needed
- ✅ Minimal code

**Cons:**
- ❌ Proxy browser support
- ❌ Hidden magic
- ❌ Debugging can be tricky

## Recommended Approach: Hybrid Solution

Combine the best aspects of multiple approaches:

```typescript
// recommended-aria-system.ts
export class AriaSystem {
  private static globalMappings = {
    // Common patterns
    state: {
      open: { hidden: false, expanded: true },
      closed: { hidden: true, expanded: false },
      loading: { busy: true, live: 'polite' },
      error: { invalid: true, live: 'assertive' },
      disabled: { disabled: true }
    },
    // Boolean attributes
    loading: {
      true: { busy: true },
      false: { busy: false }
    }
  };
  
  // Component-specific overrides
  static registerComponent(name: string, mappings: any): void {
    customElements.whenDefined(name).then(() => {
      const proto = customElements.get(name)!.prototype;
      const original = proto.attributeChangedCallback;
      
      proto.attributeChangedCallback = function(
        this: HTMLElement,
        name: string,
        oldValue: string | null,
        newValue: string | null
      ) {
        // Call original if exists
        original?.call(this, name, oldValue, newValue);
        
        // Handle ARIA updates
        if (name.startsWith('data-') && newValue !== null) {
          AriaSystem.updateAria(this, name, newValue, mappings);
        }
      };
    });
  }
  
  private static updateAria(
    element: HTMLElement,
    dataAttr: string,
    value: string,
    customMappings?: any
  ): void {
    const attrName = dataAttr.replace('data-', '');
    const mappings = customMappings?.[attrName] || this.globalMappings[attrName];
    
    if (mappings?.[value]) {
      Object.entries(mappings[value]).forEach(([aria, val]) => {
        const attrName = aria.startsWith('aria-') ? aria : `aria-${aria}`;
        element.setAttribute(attrName, String(val));
      });
    }
  }
  
  // Initialize observer for non-custom elements
  static observe(element: HTMLElement, customMappings?: any): () => void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.attributeName?.startsWith('data-')) {
          const value = element.getAttribute(mutation.attributeName);
          if (value !== null) {
            this.updateAria(element, mutation.attributeName, value, customMappings);
          }
        }
      });
    });
    
    observer.observe(element, {
      attributes: true,
      attributeFilter: Object.keys(this.globalMappings).map(k => `data-${k}`)
    });
    
    // Return cleanup function
    return () => observer.disconnect();
  }
}

// Usage Example 1: With custom elements
AriaSystem.registerComponent('mobile-nav', {
  state: {
    opening: { hidden: false, busy: true },
    closing: { hidden: true, busy: true }
  }
});

// Usage Example 2: With regular elements
const form = document.querySelector('form');
const cleanup = AriaSystem.observe(form, {
  state: {
    submitting: { busy: true },
    submitted: { live: 'polite' }
  }
});

// Usage Example 3: In controller
class FormController {
  constructor(element: HTMLElement) {
    // Just update data attributes, ARIA follows automatically
    this.actor.subscribe(state => {
      element.dataset.state = state.value;
      element.dataset.loading = state.context.loading;
    });
  }
}
```

## Implementation Guidelines

### 1. Start Simple
Begin with the MutationObserver approach for existing projects:
```typescript
// Quick start
document.querySelectorAll('[data-state]').forEach(el => {
  new AriaObserver(el as HTMLElement);
});
```

### 2. Standardize Mappings
Create a central configuration for common patterns:
```typescript
// aria-config.ts
export const ARIA_MAPPINGS = {
  navigation: {
    open: { hidden: false, expanded: true },
    closed: { hidden: true, expanded: false }
  },
  forms: {
    submitting: { busy: true, disabled: true },
    error: { invalid: true, describedby: 'error-message' }
  },
  modals: {
    open: { modal: true, hidden: false },
    closed: { modal: false, hidden: true }
  }
};
```

### 3. Progressive Enhancement
The system should work without JavaScript:
```html
<!-- Server-rendered with correct ARIA -->
<nav data-state="closed" aria-hidden="true" aria-expanded="false">
  <!-- ARIA automation enhances but doesn't break without JS -->
</nav>
```

### 4. Testing Strategy
```typescript
// Test ARIA automation
test('aria attributes update with state changes', () => {
  const element = document.createElement('div');
  const observer = new AriaObserver(element);
  
  element.dataset.state = 'open';
  
  expect(element.getAttribute('aria-hidden')).toBe('false');
  expect(element.getAttribute('aria-expanded')).toBe('true');
  
  observer.disconnect();
});
```

## Best Practices

1. **Use semantic mappings**: Map states to their semantic ARIA equivalents
2. **Avoid over-automation**: Some ARIA attributes need context-specific values
3. **Test with screen readers**: Automated ARIA isn't always correct ARIA
4. **Document mappings**: Make it clear what states map to what ARIA attributes
5. **Provide overrides**: Allow components to customize their ARIA behavior
6. **Consider performance**: Don't observe more than necessary

## Conclusion

The recommended hybrid approach provides:
- ✅ Automatic ARIA updates based on data-state
- ✅ Flexibility for component-specific needs
- ✅ Progressive enhancement
- ✅ Good performance
- ✅ Easy integration with existing actor pattern

This eliminates most manual ARIA management while maintaining control where needed. The key is to establish consistent patterns across your application and automate the repetitive parts while keeping the flexibility for special cases. 
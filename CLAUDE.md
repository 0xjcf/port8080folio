# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a portfolio website built with a custom minimal framework (Actor-SPA) that combines Web Components, XState v5, and TypeScript. The project demonstrates advanced frontend concepts without using traditional UI frameworks.

## Key Commands

### Development
```bash
# Run development server (Python-based) - preferred
pnpm dev

# Alternative Node.js server
pnpm serve

# Test server (simple HTTP)
pnpm serve:test
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Watch mode
pnpm test:watch

# Run coverage
pnpm test:coverage

# Test reactive event bus
pnpm test:event-bus

# Run a single test file
pnpm test path/to/test.spec.ts
```

### Building
```bash
# Full build (clean + compile + type check)
pnpm build

# Type checking only
pnpm type-check

# Compile TypeScript
pnpm compile-scripts
```

### Linting & Formatting
```bash
# Check code with Biome
pnpm lint

# Check errors only (no warnings)
pnpm lint:errors-only

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check reactive patterns with custom linter
pnpm check:reactive
pnpm check:reactive:fix
pnpm check:reactive:lint

# Run all checks
pnpm check:all

# Find reactive lint TODOs
pnpm lint:reactive:todos
```

### AI Development Tools
```bash
# WebSocket server for AI communication
pnpm ws:start
pnpm ws:stop

# AI agent integration
pnpm ai:sync        # Sync with Claude
pnpm ai:health      # Health check
pnpm ai:prompt      # Interactive prompts
pnpm ai:migrate     # Migrate components
pnpm ai:analyze     # Analyze patterns
pnpm ai:fix         # Fix violations
```

## Architecture

### Core Framework (`/src/framework/core/`)
The custom Actor-SPA framework provides a minimal API:
```typescript
createComponent({
  machine: // XState v5 machine
  template: // HTML template function
})
```

Key features:
- Automatic lifecycle management
- Type-safe HTML templates with `html`` tag
- Event handling via `send` attributes
- ARIA attribute auto-updates
- Reactive event bus for component communication
- Built-in XSS protection
- Shadow DOM encapsulation

### Component Structure
- **Web Components**: All UI is built with custom elements
- **XState Machines**: State management via actors (v5, not v4)
- **Template Literals**: Type-safe HTML with XSS protection
- **Shadow DOM**: Component encapsulation

### Directory Organization
- `/src/framework/` - Core framework code
- `/src/components/` - UI components (demos, sections, ui)
- `/src/app/actors/` - Application-level actors
- `/src/styles/tokens/` - Design system tokens
- `/docs/` - Project documentation
- `/extensions/reactive-lint/` - Custom reactive pattern linter
- `/extensions/actor-spa-vscode/` - VS Code extension for framework

## Development Guidelines

### Creating Components
1. Use `createComponent` with `machine` and `template`
2. Event handlers use `send="eventName"` attributes
3. Access state in templates via `state` parameter
4. Components auto-register as custom elements based on machine ID

### Testing Approach
1. Test machines in isolation
2. Test templates separately
3. Write integration tests for components
4. Use Vitest for all testing
5. Tests are in `src/**/*.{test,spec}.{js,ts}`

### Code Style
- TypeScript strict mode enabled
- Biome for linting/formatting (replaces ESLint/Prettier)
- No `any` types allowed
- Use const and template literals
- Follow reactive patterns (no direct DOM manipulation)
- No timers (setTimeout/setInterval) - use XState delayed transitions

### Reactive Pattern Rules
The codebase enforces reactive patterns through custom linting:
- `no-dom-manipulation` - Use templates instead of direct DOM
- `no-dom-query` - Use refs/state instead of querySelector
- `no-event-listeners` - Use `send` attributes instead
- `no-timers` - Use XState delayed transitions
- `no-context-booleans` - Use state machine states
- `no-multiple-data-attributes` - Single source of truth
- `prefer-extracted-templates` - Extract complex templates

## Important Documentation
- `/src/framework/API.md` - Framework API reference
- `/src/framework/BEST_PRACTICES.md` - Development patterns
- `/src/framework/SECURITY.md` - Security guidelines
- `/docs/DESIGN_SYSTEM.md` - Design tokens and styling
- `/AI_DEVELOPMENT_GUIDE.md` - AI agent integration guide

## Common Patterns

### Event Handling
```html
<button send="CLICK">Click me</button>
<input send:input="INPUT" />
<form send:submit="SUBMIT" />
```

### Component Communication
Use the reactive event bus:
```typescript
import { eventBus } from '@framework/core/reactive-event-bus';
eventBus.emit('event-name', data);
eventBus.on('event-name', handler);
```

### State Machine Templates
Templates receive state and can conditionally render:
```typescript
template: (state) => html`
  ${state.matches('loading') ? html`<div>Loading...</div>` : ''}
  <div class=${state.matches('active') ? 'active' : ''}>
    ${state.context.items.map(item => html`<li>${item}</li>`)}
  </div>
`
```

### XState Delayed Transitions
Instead of setTimeout/setInterval, use XState:
```typescript
states: {
  processing: {
    after: {
      2000: 'complete'  // Transition after 2 seconds
    }
  },
  polling: {
    invoke: {
      src: fromCallback(({ sendBack }) => {
        const interval = setInterval(() => {
          sendBack({ type: 'POLL' });
        }, 5000);
        return () => clearInterval(interval);
      })
    }
  }
}
```

## VS Code Extension
The project includes a custom VS Code extension at `/extensions/actor-spa-vscode/` that provides:
- Syntax highlighting for framework templates
- Snippets for common patterns
- Linting integration
- AI communication features

Install locally:
```bash
cd extensions/actor-spa-vscode
pnpm install
pnpm run build
# Then install the .vsix file in VS Code
```

## Notes
- No React/Vue/Angular - pure Web Components
- XState v5 (not v4) - uses actor model with new API
- Python dev server is preferred over Node.js
- Biome replaces ESLint/Prettier
- Project demonstrates portfolio + framework capabilities
- TypeScript paths: `@framework`, `@components`, `@`
- Vitest for testing with happy-dom environment
- Pre-commit hooks via Husky
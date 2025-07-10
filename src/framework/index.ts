/**
 * Actor-SPA Framework
 * A minimal, type-safe framework for building web components with XState v5 and the actor model
 *
 * ## Quick Start
 * ```typescript
 * import { createComponent, html } from '@framework/core';
 * import { setup, assign } from 'xstate';
 *
 * const machine = setup({
 *   types: {
 *     context: {} as { count: number },
 *     events: {} as { type: 'INCREMENT' }
 *   },
 *   actions: {
 *     increment: assign({ count: ({ context }) => context.count + 1 })
 *   }
 * }).createMachine({
 *   id: 'counter',
 *   initial: 'idle',
 *   context: { count: 0 },
 *   states: {
 *     idle: { on: { INCREMENT: { actions: 'increment' } } }
 *   }
 * });
 *
 * const template = (state) => html`
 *   <div>
 *     <h1>Count: ${state.context.count}</h1>
 *     <button send="INCREMENT">+</button>
 *   </div>
 * `;
 *
 * const Counter = createComponent({ machine, template });
 * // ✅ Auto-registered as <counter-component>
 * ```
 *
 * ## Key Features
 * - **Minimal API**: Just `machine` + `template` - everything else is automatic
 * - **Clean Event Syntax**: Modern `send="EVENT_TYPE"` with smart payload extraction
 * - **Type-Safe**: Full TypeScript support with zero `any` types
 * - **XSS Protected**: Built-in HTML escaping and security
 * - **Accessibility**: Automatic ARIA attribute updates
 * - **Performance**: Only updates changed parts of DOM
 */

// 🏗️ Core Framework Components
export * from './core/index.js';
// 🔒 JSON Utilities - Safe serialization/deserialization
export * from './core/json-utilities.js';
// ✨ Primary API - Start here!
export * from './core/minimal-api.js';
// 🧪 Testing Utilities - For testing framework components
export * as testing from './testing/index.js';

/**
 * Framework version information
 */
export const FRAMEWORK_VERSION = '0.1.0';
export const FRAMEWORK_NAME = 'Actor-SPA Framework';

/**
 * Simple framework initialization - just enables dev mode in development
 */
export function initializeFramework(options?: {
  development?: boolean;
  enableDevTools?: boolean;
}): void {
  const isDevelopment = options?.development ?? process.env.NODE_ENV === 'development';

  if (isDevelopment && options?.enableDevTools !== false) {
    // Dynamic import to avoid bundling dev tools in production
    import('./core/dev-mode.js')
      .then(({ enableDevMode }) => {
        enableDevMode();
      })
      .catch(() => {
        // Silently fail if dev tools can't be loaded
      });
  }
}

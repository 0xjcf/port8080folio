import '@testing-library/jest-dom/vitest';
import type { AxeResults } from 'axe-core';
import { axe } from 'vitest-axe';
import 'vitest-axe/extend-expect';
import * as matchers from 'vitest-axe/matchers';

// Extend expect with vitest-axe matchers
expect.extend(matchers);

// Provide a11y globally for tests
globalThis.a11y = (node: HTMLElement | Document | DocumentFragment): Promise<AxeResults> =>
  axe(node as Element, {
    // jsdom can't compute this reliably
    rules: { 'color-contrast': { enabled: false } },
  });

// Type-safe custom elements registry mock for jsdom
if (!window.customElements || !window.customElements.define) {
  const registry = new Map<string, CustomElementConstructor>();

  const customElementsImpl = {
    define(name: string, constructor: CustomElementConstructor): void {
      registry.set(name, constructor);
    },
    get(name: string): CustomElementConstructor | undefined {
      return registry.get(name);
    },
    whenDefined(name: string): Promise<CustomElementConstructor> {
      const constructor = registry.get(name);
      return constructor ? Promise.resolve(constructor) : Promise.reject(new Error(`Element ${name} not defined`));
    },
    // Add getName and upgrade stubs required by spec
    getName(constructor: CustomElementConstructor): string | null {
      for (const [name, ctor] of registry.entries()) {
        if (ctor === constructor) return name;
      }
      return null;
    },
    upgrade(_element: Element): void {
      // No-op for jsdom testing
    }
  } satisfies CustomElementRegistry;

  Object.defineProperty(window, 'customElements', {
    value: customElementsImpl,
    writable: false,
    configurable: true
  });
}

// Add global test utilities with proper types
global.createTestContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
  return container;
};

global.cleanupTestContainer = (): void => {
  const container = document.getElementById('test-container');
  if (container) {
    container.remove();
  }
};

// Clean up after each test
afterEach(() => {
  global.cleanupTestContainer();
  document.body.innerHTML = '';
});
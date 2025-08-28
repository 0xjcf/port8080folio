/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import type { AxeResults } from 'axe-core';

interface CustomElementRegistry {
  define(name: string, constructor: CustomElementConstructor): void;
  get(name: string): CustomElementConstructor | undefined;
  whenDefined(name: string): Promise<CustomElementConstructor>;
  getName(constructor: CustomElementConstructor): string | null;
  upgrade(element: Element): void;
}

interface Window {
  customElements: CustomElementRegistry;
}

declare global {
  function createTestContainer(): HTMLDivElement;
  function cleanupTestContainer(): void;
}

export {};
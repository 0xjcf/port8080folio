/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

// Important: this file must be included by tsconfig so TS sees the matcher types.
import 'vitest-axe/extend-expect';
import type { AxeResults } from 'axe-core';

// Optional global helper type (only if you use a global a11y function)
declare global {
  // eslint-disable-next-line no-var
  var a11y: (node: HTMLElement | Document | DocumentFragment) => Promise<AxeResults>;
}

export {};

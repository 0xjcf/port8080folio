import { axe } from 'vitest-axe';

/**
 * Helper for accessibility testing in jsdom environment
 * Disables color-contrast rule since jsdom doesn't support canvas
 */
export const a11y = (node: HTMLElement | Element) =>
  axe(node, {
    rules: {
      'color-contrast': { enabled: false } // jsdom can't compute color contrast without canvas
    }
  });
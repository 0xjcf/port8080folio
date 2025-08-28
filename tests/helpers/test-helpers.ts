/**
 * Shared test helpers for web component testing
 * Provides consistent patterns across all component tests
 */

/**
 * Renders a web component with given attributes and content
 * Following the pattern established in progress-dots.test.ts
 * 
 * @param container - The container element to render into
 * @param tagName - The web component tag name (e.g., 'progress-dots')
 * @param attrs - Optional attributes string (e.g., 'current="2" total="5"')
 * @param content - Optional inner content/children
 * @returns The rendered element
 * 
 * @example
 * const el = renderComponent(container, 'badge-el', 'type="success"', 'Badge Text');
 * const el = renderComponent(container, 'progress-dots', 'current="2" total="5"');
 */
export function renderComponent<T extends HTMLElement = HTMLElement>(
  container: HTMLElement,
  tagName: string,
  attrs = '',
  content = ''
): T {
  container.innerHTML = `<${tagName} ${attrs}>${content}</${tagName}>`;
  const el = container.querySelector<T>(tagName);
  if (!el) throw new Error(`${tagName} not found`);
  return el;
}

// Note: Container creation/cleanup is handled globally by setup-dom.ts
// Use global.createTestContainer() and global.cleanupTestContainer()

/**
 * Helper to render multiple elements in a container
 * Useful for testing component interactions
 * 
 * @param container - The container element
 * @param html - The HTML string to render
 * @returns The container element for chaining
 * 
 * @example
 * renderHTML(container, `
 *   <input id="test-input" value="Hello">
 *   <char-counter target="#test-input" max="50"></char-counter>
 * `);
 */
export function renderHTML(container: HTMLElement, html: string): HTMLElement {
  container.innerHTML = html;
  return container;
}

/**
 * Helper to query for an element and assert it exists
 * Provides better error messages than optional chaining
 * 
 * @param container - The container to search in
 * @param selector - The CSS selector
 * @returns The found element
 * @throws Error if element not found
 * 
 * @example
 * const input = querySelector<HTMLInputElement>(container, '#test-input');
 */
export function querySelector<T extends Element = Element>(
  container: Element | Document,
  selector: string
): T {
  const el = container.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/**
 * Helper to query for multiple elements
 * Returns a proper array instead of NodeList
 * 
 * @param container - The container to search in
 * @param selector - The CSS selector
 * @returns Array of found elements
 * 
 * @example
 * const buttons = querySelectorAll<HTMLButtonElement>(container, 'button');
 */
export function querySelectorAll<T extends Element = Element>(
  container: Element | Document,
  selector: string
): T[] {
  return Array.from(container.querySelectorAll<T>(selector));
}
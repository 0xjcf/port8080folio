// TypeScript Code Examples Index
// Educational examples for state management patterns

// Import TypeScript examples
import ChaosCoffeeShopExample from './chaos-coffee-shop.js';
import ActorCoffeeShopExample from './actor-coffee-shop.js';

// Type definitions for code examples
interface CodeExample {
  name: string;
  description: string;
  component: typeof HTMLElement;
  category: 'anti-pattern' | 'best-practice';
  tags: string[];
}

// Export all examples with metadata
export const codeExamples: CodeExample[] = [
  {
    name: 'Chaos Coffee Shop',
    description: 'Demonstrates problems with global state and callback hell',
    component: ChaosCoffeeShopExample,
    category: 'anti-pattern',
    tags: ['global-state', 'callbacks', 'anti-pattern', 'chaos']
  },
  {
    name: 'Actor Coffee Shop', 
    description: 'Shows proper state management with actor-based architecture',
    component: ActorCoffeeShopExample,
    category: 'best-practice',
    tags: ['actors', 'state-machines', 'best-practice', 'predictable']
  }
];

// Helper function to get examples by category
export function getExamplesByCategory(category: 'anti-pattern' | 'best-practice'): CodeExample[] {
  return codeExamples.filter(example => example.category === category);
}

// Helper function to get examples by tag
export function getExamplesByTag(tag: string): CodeExample[] {
  return codeExamples.filter(example => example.tags.includes(tag));
}

// Initialize all code examples
export function initializeCodeExamples(): void {
  // Auto-register all custom elements if not already defined
  codeExamples.forEach(example => {
    const tagName = example.name.toLowerCase().replace(/\s+/g, '-') + '-example';
    if (!customElements.get(tagName)) {
      console.log(`Code example ${example.name} component already registered`);
    }
  });
}

// Main exports
export { ChaosCoffeeShopExample, ActorCoffeeShopExample };

// Auto-initialize when module is imported
initializeCodeExamples(); 
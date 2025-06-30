import '../ui/syntax-highlighter-with-themes.js';
import '../code-examples/chaos-coffee-shop.js';
import '../code-examples/actor-coffee-shop.js';

class StateMachineConceptsEnhanced extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // Calculate the base path using import.meta.url
    const componentPath = new URL(import.meta.url).pathname;
    const basePath = componentPath.substring(0, componentPath.indexOf('/src/'));
    const styleHref = `${basePath}/src/styles/state-machine-education.css`;
    
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${styleHref}">
      
      <div class="container">
        <!-- Bridge from Level 1 to Level 2 -->
        <p class="transition-text" style="text-align: center; color: var(--jasper); margin-bottom: 2rem; font-size: 1.1rem;">
          You want to ship features faster? Let's talk about what's really slowing you down...
        </p>
        
        <div class="concept-section" style="margin-bottom: 3rem;">
          <h3 class="concept-title">🔄 The Problem: State Chaos</h3>
          <p class="concept-description">
            Traditional React/Vue apps scatter state everywhere - components, stores, hooks, contexts. 
            Each developer adds their own pattern. Soon you have race conditions, edge cases, and bugs 
            that only appear on Tuesdays. Sound familiar?
          </p>
          
          <chaos-coffee-shop-code></chaos-coffee-shop-code>
        </div>

        <div class="concept-section">
          <h3 class="concept-title">✨ The Solution: Actor-Based Architecture</h3>
          <p class="concept-description">
            What if each entity (customer, cashier, barista) managed its own state? 
            What if they communicated through clear messages? Enter the Actor Model - 
            where state machines talk to each other, creating a symphony instead of chaos.
          </p>
          
          <actor-coffee-shop-code></actor-coffee-shop-code>
        </div>
        
        <!-- Bridge to Level 3: SOLUTION AWARE -->
        <div style="text-align: center; margin-top: 3rem; padding: 2rem; background: rgba(13, 153, 255, 0.05); border-radius: 12px; border: 1px solid rgba(13, 153, 255, 0.2);">
          <h4 style="color: var(--jasper); margin-bottom: 1rem;">✨ There's a Better Way</h4>
          <p style="color: var(--teagreen); font-size: 1.1rem; margin-bottom: 1.5rem;">
            What if your state logic was visual, testable, and impossible to break?
          </p>
          <p style="color: rgba(255, 255, 255, 0.7); font-style: italic;">
            Keep scrolling to discover how state machines solve these problems...
          </p>
        </div>
      </div>
    `;
  }
}

customElements.define('state-machine-concepts-enhanced', StateMachineConceptsEnhanced);
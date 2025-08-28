/**
 * Loading Spinner Web Component
 * Atomic Design: Atom
 * 
 * Various loading indicators and spinners
 * Renders in light DOM for accessibility
 */
export class LoadingSpinner extends HTMLElement {
  static get observedAttributes() {
    return ['size', 'color', 'type', 'text', 'overlay'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
    }
  }

  render() {
    const size = this.getAttribute('size') || 'md'; // sm, md, lg, xl
    const color = this.getAttribute('color') || 'primary';
    const type = this.getAttribute('type') || 'circle'; // circle, dots, bars, pulse, code
    const text = this.getAttribute('text') || '';
    const overlay = this.hasAttribute('overlay');
    
    // Build classes
    const classes = ['loading-spinner'];
    classes.push(`loading-spinner--${size}`);
    classes.push(`loading-spinner--${color}`);
    classes.push(`loading-spinner--${type}`);
    if (overlay) classes.push('loading-spinner--overlay');
    
    this.className = classes.join(' ');
    this.setAttribute('role', 'status');
    this.setAttribute('aria-live', 'polite');
    
    this.innerHTML = `
      ${overlay ? '<div class="loading-spinner__backdrop"></div>' : ''}
      
      <div class="loading-spinner__container">
        ${this.renderSpinner(type)}
        
        ${text ? `
          <span class="loading-spinner__text">${text}</span>
        ` : ''}
        
        <span class="sr-only">Loading...</span>
      </div>
    `;
  }

  renderSpinner(type: string): string {
    switch (type) {
      case 'circle':
        return `
          <svg class="loading-spinner__circle" viewBox="0 0 50 50">
            <circle
              class="loading-spinner__circle-path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke-width="5"
            ></circle>
          </svg>
        `;
      
      case 'dots':
        return `
          <div class="loading-spinner__dots">
            <span class="loading-spinner__dot"></span>
            <span class="loading-spinner__dot"></span>
            <span class="loading-spinner__dot"></span>
          </div>
        `;
      
      case 'bars':
        return `
          <div class="loading-spinner__bars">
            <span class="loading-spinner__bar"></span>
            <span class="loading-spinner__bar"></span>
            <span class="loading-spinner__bar"></span>
            <span class="loading-spinner__bar"></span>
          </div>
        `;
      
      case 'pulse':
        return `
          <div class="loading-spinner__pulse">
            <span class="loading-spinner__pulse-ring"></span>
            <span class="loading-spinner__pulse-ring"></span>
            <span class="loading-spinner__pulse-ring"></span>
          </div>
        `;
      
      case 'code':
        return `
          <div class="loading-spinner__code">
            <span class="loading-spinner__bracket">{</span>
            <span class="loading-spinner__dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
            <span class="loading-spinner__bracket">}</span>
          </div>
        `;
      
      default:
        return this.renderSpinner('circle');
    }
  }

  // Public methods
  show() {
    this.style.display = '';
    this.setAttribute('aria-hidden', 'false');
  }

  hide() {
    this.style.display = 'none';
    this.setAttribute('aria-hidden', 'true');
  }

  setText(text: string) {
    this.setAttribute('text', text);
  }
}

// Register component
if (!customElements.get('loading-spinner')) {
  customElements.define('loading-spinner', LoadingSpinner);
}
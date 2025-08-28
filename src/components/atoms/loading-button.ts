/**
 * Loading Button Web Component
 * Atomic Design: Atom
 * 
 * Button with loading state and spinner
 * Renders in light DOM for accessibility
 */
export class LoadingButton extends HTMLElement {
  private originalText?: string;
  private isLoading = false;

  static get observedAttributes() {
    return ['loading', 'loading-text', 'disabled', 'type', 'variant'];
  }

  constructor() {
    super();
    this.isLoading = false;
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue && this.isConnected) {
      if (name === 'loading') {
        this.updateLoadingState();
      } else {
        this.render();
        this.bindEvents();
      }
    }
  }

  render() {
    const text = this.textContent || 'Submit';
    const loadingText = this.getAttribute('loading-text') || 'Loading...';
    const variant = this.getAttribute('variant') || 'primary';
    const type = this.getAttribute('type') || 'button';
    const disabled = this.hasAttribute('disabled');
    const loading = this.hasAttribute('loading');
    
    // Store original text
    this.originalText = text;
    
    // Build classes
    const classes = ['btn', `btn--${variant}`, 'loading-button'];
    if (loading) classes.push('loading-button--loading');
    
    this.className = classes.join(' ');
    
    this.innerHTML = `
      <button
        type="${type}"
        class="loading-button__btn"
        ${disabled || loading ? 'disabled' : ''}
        aria-busy="${loading}"
      >
        <span class="loading-button__spinner">
          <svg viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              stroke-width="5"
            ></circle>
          </svg>
        </span>
        <span class="loading-button__text">
          ${loading ? loadingText : text}
        </span>
      </button>
    `;
  }

  bindEvents() {
    const button = this.querySelector('.loading-button__btn');
    
    if (!button) return;
    
    button.addEventListener('click', (e) => {
      if (!this.isLoading && !this.hasAttribute('disabled')) {
        // Dispatch click event for parent to handle
        this.dispatchEvent(new CustomEvent('button-click', {
          detail: { originalEvent: e },
          bubbles: true
        }));
      }
    });
  }

  updateLoadingState() {
    const loading = this.hasAttribute('loading');
    const button = this.querySelector('.loading-button__btn') as HTMLButtonElement;
    const text = this.querySelector('.loading-button__text');
    
    if (!button || !text) return;
    
    this.isLoading = loading;
    
    if (loading) {
      this.classList.add('loading-button--loading');
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      text.textContent = this.getAttribute('loading-text') || 'Loading...';
    } else {
      this.classList.remove('loading-button--loading');
      button.disabled = this.hasAttribute('disabled');
      button.setAttribute('aria-busy', 'false');
      text.textContent = this.originalText || '';
    }
  }

  // Public methods
  startLoading() {
    this.setAttribute('loading', '');
  }

  stopLoading() {
    this.removeAttribute('loading');
  }

  setLoadingText(text: string) {
    this.setAttribute('loading-text', text);
    if (this.isLoading) {
      const textElement = this.querySelector('.loading-button__text');
      if (textElement) textElement.textContent = text;
    }
  }

  disable() {
    this.setAttribute('disabled', '');
  }

  enable() {
    if (!this.isLoading) {
      this.removeAttribute('disabled');
    }
  }
}

// Register component
if (!customElements.get('loading-button')) {
  customElements.define('loading-button', LoadingButton);
}
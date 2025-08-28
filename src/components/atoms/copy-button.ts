/**
 * Copy Button Web Component
 * Atomic Design: Atom
 * Styles: src/styles/atomic/01-atoms/code.css
 * 
 * Copy to clipboard button for code blocks and text
 * Renders in light DOM for accessibility
 */
export class CopyButton extends HTMLElement {
  private _state: 'idle' | 'copied' | 'error' = 'idle';
  private _clickHandler: ((e: Event) => void) | undefined;
  private _resetTimeout: number | undefined;

  static get observedAttributes() {
    return ['text', 'target', 'label', 'success-label', 'compact'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  disconnectedCallback() {
    this.detachEvents();
    if (this._resetTimeout) {
      clearTimeout(this._resetTimeout);
    }
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
      this.attachEvents();
    }
  }

  render() {
    const label = this.getAttribute('label') || 'Copy';
    const successLabel = this.getAttribute('success-label') || 'Copied!';
    const compact = this.hasAttribute('compact');
    
    // Preserve author-supplied classes
    const authorClasses = Array.from(this.classList).filter(c => 
      !c.startsWith('copy-button') && !c.startsWith('is-')
    );
    
    // Build BEM classes
    const classes = ['copy-button', ...authorClasses];
    if (compact) classes.push('copy-button--compact');
    
    // State classes using is- prefix
    if (this._state === 'copied') classes.push('copy-button--copied', 'is-copied');
    if (this._state === 'error') classes.push('copy-button--error', 'is-error');
    
    this.className = classes.join(' ');
    
    // Update aria-label based on state
    const currentLabel = this._state === 'copied' ? successLabel : label;
    
    this.innerHTML = `
      <button type="button" class="copy-button__btn" aria-label="${currentLabel}">
        <span class="copy-button__icon copy-button__icon--copy" ${this._state === 'copied' ? 'style="display: none;"' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </span>
        <span class="copy-button__icon copy-button__icon--check" ${this._state !== 'copied' ? 'style="display: none;"' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        ${!compact ? `
          <span class="copy-button__text">
            ${currentLabel}
          </span>
        ` : ''}
      </button>
    `;
  }

  attachEvents() {
    this.detachEvents();
    
    const button = this.querySelector('.copy-button__btn');
    if (!button) return;
    
    this._clickHandler = async (e: Event) => {
      e.preventDefault();
      await this.copyContent();
    };
    
    button.addEventListener('click', this._clickHandler);
  }

  detachEvents() {
    const button = this.querySelector('.copy-button__btn');
    if (button && this._clickHandler) {
      button.removeEventListener('click', this._clickHandler);
    }
    this._clickHandler = undefined;
  }

  async copyContent() {
    let textToCopy = '';
    
    // Get text to copy
    if (this.hasAttribute('text')) {
      // Direct text attribute
      textToCopy = this.getAttribute('text') || '';
    } else if (this.hasAttribute('target')) {
      // Target element selector
      const targetSelector = this.getAttribute('target');
      if (targetSelector) {
        const target = document.querySelector(targetSelector);
        if (target) {
          textToCopy = this.getTextFromElement(target);
        }
      }
    } else {
      // Find nearest code block or pre element
      const codeBlock = this.closest('pre, .code-block');
      if (codeBlock) {
        textToCopy = this.getTextFromElement(codeBlock);
      }
    }
    
    // Copy to clipboard
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Modern async clipboard API
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
        this.copyUsingExecCommand(textToCopy);
      }
      
      this.showSuccess();
      
      // Dispatch event
      this.dispatchEvent(new CustomEvent('copy-success', {
        detail: { text: textToCopy },
        bubbles: true
      }));
    } catch (err) {
      this.showError();
      
      // Dispatch error event
      this.dispatchEvent(new CustomEvent('copy-error', {
        detail: { error: err },
        bubbles: true
      }));
    }
  }

  private getTextFromElement(element: Element): string {
    // Handle code blocks specially
    if (element.tagName === 'PRE' || element.classList.contains('code-block')) {
      // Remove line numbers if present
      const clone = element.cloneNode(true) as Element;
      const lineNumbers = clone.querySelectorAll('.line-number, .code-line-number, .code-block__line-number');
      lineNumbers.forEach(ln => ln.remove());
      
      // Get clean text from code element if present
      const codeEl = clone.querySelector('code');
      if (codeEl) {
        return codeEl.textContent?.trim() || '';
      }
      
      // Otherwise get all text
      return clone.textContent?.trim() || '';
    }
    
    return element.textContent?.trim() || '';
  }

  private copyUsingExecCommand(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    // Use execCommand as fallback (deprecated but still works)
    // This is a legacy API but required for older browser support
    const result = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (!result) {
      throw new Error('Copy command failed');
    }
  }

  private showSuccess() {
    this._state = 'copied';
    this.render();
    this.attachEvents();
    
    // Clear any existing timeout
    if (this._resetTimeout) {
      clearTimeout(this._resetTimeout);
    }
    
    // Reset after delay
    this._resetTimeout = window.setTimeout(() => {
      this._state = 'idle';
      this.render();
      this.attachEvents();
    }, 2500);
  }

  private showError() {
    this._state = 'error';
    this.render();
    this.attachEvents();
    
    // Clear any existing timeout
    if (this._resetTimeout) {
      clearTimeout(this._resetTimeout);
    }
    
    // Reset after delay
    this._resetTimeout = window.setTimeout(() => {
      this._state = 'idle';
      this.render();
      this.attachEvents();
    }, 2500);
  }
}

// Register component
if (!customElements.get('copy-button')) {
  customElements.define('copy-button', CopyButton);
}
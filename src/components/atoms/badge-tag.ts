/**
 * Badge Web Component
 * Atomic Design: Atom
 * 
 * Badge element for status/labels with light DOM
 */
export class BadgeTag extends HTMLElement {
  private keyHandler?: (e: KeyboardEvent) => void;
  private keyUpHandler?: (e: KeyboardEvent) => void;

  static get observedAttributes() {
    return ['type', 'size', 'pill', 'clickable', 'disabled'];
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  disconnectedCallback() {
    this.detachEvents();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    // Skip if values are the same
    if (oldValue === newValue) return;
    
    this.render();
    
    // Only rebind if interactivity could change
    if (name === 'clickable' || name === 'disabled') {
      this.attachEvents();
    }
  }

  render() {
    const type = this.getAttribute('type') || 'default';
    const size = this.getAttribute('size') || 'md';
    const pill = this.hasAttribute('pill');
    const disabled = this.hasAttribute('disabled');
    const clickable = this.hasAttribute('clickable') && !disabled;

    // Preserve author classes while managing BEM classes
    this.classList.add('badge');
    
    // Remove old type classes
    Array.from(this.classList)
      .filter(c => c.startsWith('badge--') && c !== 'badge--pill')
      .forEach(c => this.classList.remove(c));
    
    // Add current modifiers
    if (type !== 'default') this.classList.add(`badge--${type}`);
    if (size === 'sm') this.classList.add('badge--sm');
    if (size === 'lg') this.classList.add('badge--lg');
    this.classList.toggle('badge--pill', pill);
    this.classList.toggle('is-disabled', disabled);

    // Manage interactive classes
    this.classList.toggle('badge--clickable', clickable);
    this.classList.toggle('badge--disabled', disabled);

    if (clickable) {
      this.setAttribute('role', 'button');
      this.setAttribute('tabindex', '0');
      this.setAttribute('aria-disabled', 'false');
    } else if (disabled) {
      // Disabled state
      this.setAttribute('role', 'button');
      this.removeAttribute('tabindex');
      this.setAttribute('aria-disabled', 'true');
    } else {
      // Clean up when not clickable
      this.removeAttribute('role');
      this.removeAttribute('tabindex');
      this.removeAttribute('aria-disabled');
    }
  }

  attachEvents() {
    // Clean up old handlers first
    this.detachEvents();

    if (this.hasAttribute('clickable') && !this.hasAttribute('disabled')) {
      // Add keyboard support following ARIA button pattern
      this.keyHandler = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.click();
        }
        // Space prevents scrolling on keydown, activates on keyup
        if (e.key === ' ') {
          e.preventDefault();
        }
      };
      
      this.keyUpHandler = (e: KeyboardEvent) => {
        if (e.key === ' ' && this.hasAttribute('clickable') && !this.hasAttribute('disabled')) {
          e.preventDefault();
          this.click();
        }
      };
      
      this.addEventListener('keydown', this.keyHandler);
      this.addEventListener('keyup', this.keyUpHandler);
    }
  }

  detachEvents() {
    if (this.keyHandler) {
      this.removeEventListener('keydown', this.keyHandler);
      delete this.keyHandler;
    }
    if (this.keyUpHandler) {
      this.removeEventListener('keyup', this.keyUpHandler);
      delete this.keyUpHandler;
    }
  }
}

// Register component
customElements.define('badge-el', BadgeTag);

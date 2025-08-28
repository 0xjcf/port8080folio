/**
 * Mobile Navigation Toggle Component
 * Atomic Design: Atom
 * 
 * Hamburger menu toggle button with animation
 * Renders in light DOM for accessibility
 */
export class NavToggle extends HTMLElement {
  private isActive: boolean;

  constructor() {
    super();
    this.isActive = false;
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  render() {
    const ariaLabel = this.getAttribute('aria-label') || 'Toggle navigation';

    this.className = 'nav-toggle';
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', '0');
    this.setAttribute('aria-label', ariaLabel);
    this.setAttribute('aria-expanded', 'false');

    this.innerHTML = `
      <span class="nav-toggle__line"></span>
      <span class="nav-toggle__line"></span>
      <span class="nav-toggle__line"></span>
    `;
  }

  bindEvents() {
    this.addEventListener('click', () => this.toggle());
    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    this.isActive = !this.isActive;
    this.classList.toggle('nav-toggle--active', this.isActive);
    this.setAttribute('aria-expanded', this.isActive.toString());

    // Dispatch event for other components to react
    this.dispatchEvent(new CustomEvent('nav-toggle', {
      detail: { active: this.isActive },
      bubbles: true
    }));
  }
}

// Register component
customElements.define('nav-toggle', NavToggle);

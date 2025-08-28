/**
 * Theme Toggle Web Component
 * Atomic Design: Atom
 * 
 * Adds theme switching capability using light DOM
 * Integrates with our IDE-themed design tokens
 */
export class ThemeToggle extends HTMLElement {
  constructor() {
    super();
    this.themes = ['monokai-light', 'monokai-dark', 'github-dark', 'one-dark', 'dracula'];
    this.themeNames = {
      'monokai-light': 'Monokai Light',
      'monokai-dark': 'Monokai Dark',
      'github-dark': 'GitHub Dark',
      'one-dark': 'One Dark Pro',
      'dracula': 'Dracula'
    };
  }

  connectedCallback() {
    // Render in LIGHT DOM using atomic CSS classes
    this.className = 'theme-toggle';
    this.innerHTML = `
      <button class="btn btn--ghost btn--sm theme-toggle__btn" 
              aria-label="Change theme" 
              title="Change theme">
        <span class="theme-toggle__icon" aria-hidden="true">🎨</span>
        <span class="theme-toggle__label text-xs font-mono"></span>
      </button>
    `;

    // Get current theme
    this.currentTheme = document.documentElement.getAttribute('data-theme') || 'monokai-light';
    this.updateLabel();

    // Add click handler
    this.querySelector('button').addEventListener('click', () => {
      this.cycleTheme();
    });

    // Apply positioning styles
    this.style.cssText = `
      position: fixed;
      top: var(--space-4);
      right: var(--space-4);
      z-index: var(--z-modal);
    `;
  }

  cycleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.currentTheme = this.themes[nextIndex];

    // Apply theme
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('preferred-ide-theme', this.currentTheme);

    // Update label
    this.updateLabel();

    // Add transition effect
    this.classList.add('theme-toggle--transitioning');
    setTimeout(() => {
      this.classList.remove('theme-toggle--transitioning');
    }, 300);
  }

  updateLabel() {
    const label = this.querySelector('.theme-toggle__label');
    if (label) {
      label.textContent = this.themeNames[this.currentTheme];
    }
  }
}

// Register the component
customElements.define('theme-toggle', ThemeToggle);


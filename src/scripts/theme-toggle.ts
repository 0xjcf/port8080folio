(() => {
  'use strict';

  const THEME_KEY = 'preferred-theme';
  const LIGHT_THEME = 'light';
  const DARK_THEME = 'dark';
  const AUTO_THEME = 'auto';

  class ThemeManager {
    constructor() {
      this.currentTheme = this.getSavedTheme() || AUTO_THEME;
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.init();
    }

    init() {
      this.applyTheme();
      this.createToggleButton();
      this.bindEvents();
      
      // Apply theme immediately to prevent flash
      document.documentElement.style.visibility = 'visible';
    }

    getSavedTheme() {
      try {
        return localStorage.getItem(THEME_KEY);
      } catch {
        return null;
      }
    }

    saveTheme(theme) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        console.warn('Unable to save theme preference');
      }
    }

    getEffectiveTheme() {
      if (this.currentTheme === AUTO_THEME) {
        return this.mediaQuery.matches ? DARK_THEME : LIGHT_THEME;
      }
      return this.currentTheme;
    }

    applyTheme() {
      const effectiveTheme = this.getEffectiveTheme();
      document.documentElement.setAttribute('data-theme', effectiveTheme);
      this.updateToggleButton();
    }

    createToggleButton() {
      const button = document.createElement('button');
      button.className = 'theme-toggle';
      button.setAttribute('aria-label', 'Toggle color theme');
      button.setAttribute('title', 'Toggle color theme');
      button.innerHTML = this.getButtonIcon();
      
      // Add CSS for the button
      if (!document.getElementById('theme-toggle-styles')) {
        const style = document.createElement('style');
        style.id = 'theme-toggle-styles';
        style.textContent = `
          .theme-toggle {
            position: fixed;
            top: var(--space-4);
            right: var(--space-4);
            z-index: var(--z-modal);
            width: 48px;
            height: 48px;
            padding: 0;
            border: 2px solid var(--color-border);
            border-radius: var(--radius-full);
            background: var(--color-surface);
            color: var(--color-text);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all var(--duration-base) var(--ease-default);
            backdrop-filter: blur(var(--backdrop-blur-md));
            box-shadow: var(--shadow-lg);
          }
          
          .theme-toggle:hover {
            transform: scale(1.1);
            box-shadow: var(--shadow-xl);
            background: var(--color-surface-alt);
            border-color: var(--color-brand-primary);
          }
          
          .theme-toggle:active {
            transform: scale(0.95);
          }
          
          .theme-toggle:focus-visible {
            outline: 3px solid var(--color-brand-primary);
            outline-offset: 2px;
          }
          
          .theme-toggle svg {
            width: 24px;
            height: 24px;
            transition: transform var(--duration-fast) var(--ease-default);
          }
          
          .theme-toggle:hover svg {
            transform: rotate(20deg);
          }
          
          @media (max-width: 640px) {
            .theme-toggle {
              width: 44px;
              height: 44px;
            }
            
            .theme-toggle svg {
              width: 22px;
              height: 22px;
            }
          }
          
          /* Theme cycle indicator */
          .theme-toggle::after {
            content: attr(data-theme-mode);
            position: absolute;
            bottom: -24px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 2px 6px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            white-space: nowrap;
            opacity: 0;
            transition: opacity var(--duration-fast) var(--ease-default);
            pointer-events: none;
          }
          
          .theme-toggle:hover::after {
            opacity: 1;
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(button);
      this.toggleButton = button;
    }

    getButtonIcon() {
      const effectiveTheme = this.getEffectiveTheme();
      const isAuto = this.currentTheme === AUTO_THEME;
      
      if (isAuto) {
        // Auto mode icon
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          <circle cx="12" cy="12" r="9" stroke-dasharray="2 2" opacity="0.5"/>
        </svg>`;
      } else if (effectiveTheme === DARK_THEME) {
        // Moon icon for dark mode
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>`;
      } else {
        // Sun icon for light mode
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>`;
      }
    }

    updateToggleButton() {
      if (this.toggleButton) {
        this.toggleButton.innerHTML = this.getButtonIcon();
        this.toggleButton.setAttribute('data-theme-mode', this.currentTheme);
        
        const nextTheme = this.getNextTheme();
        const nextThemeLabel = nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1);
        this.toggleButton.setAttribute('aria-label', `Switch to ${nextThemeLabel} theme`);
      }
    }

    getNextTheme() {
      const themes = [LIGHT_THEME, DARK_THEME, AUTO_THEME];
      const currentIndex = themes.indexOf(this.currentTheme);
      return themes[(currentIndex + 1) % themes.length];
    }

    cycleTheme() {
      this.currentTheme = this.getNextTheme();
      this.saveTheme(this.currentTheme);
      this.applyTheme();
      
      // Add a little animation feedback
      if (this.toggleButton) {
        this.toggleButton.style.transform = 'scale(1.2) rotate(180deg)';
        setTimeout(() => {
          this.toggleButton.style.transform = '';
        }, 300);
      }
    }

    bindEvents() {
      // Listen for system theme changes when in auto mode
      this.mediaQuery.addEventListener('change', (e) => {
        if (this.currentTheme === AUTO_THEME) {
          this.applyTheme();
        }
      });
    }
  }

  // Initialize theme manager when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const themeManager = new ThemeManager();
      
      // Bind toggle button click after it's created
      setTimeout(() => {
        const button = document.querySelector('.theme-toggle');
        if (button) {
          button.addEventListener('click', () => themeManager.cycleTheme());
        }
      }, 0);
    });
  } else {
    const themeManager = new ThemeManager();
    
    // Bind toggle button click after it's created
    setTimeout(() => {
      const button = document.querySelector('.theme-toggle');
      if (button) {
        button.addEventListener('click', () => themeManager.cycleTheme());
      }
    }, 0);
  }

  // Prevent flash of unstyled content
  document.documentElement.style.visibility = 'hidden';
})();
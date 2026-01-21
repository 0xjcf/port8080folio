"use strict";
(() => {
    const THEME_KEY = 'preferred-theme';
    const LIGHT_THEME = 'light';
    const DARK_THEME = 'dark';
    const AUTO_THEME = 'auto';
    class ThemeManager {
        currentTheme;
        mediaQuery;
        toggleButton = null;
        _transformTimeout = null;
        _mediaChangeHandler = null;
        _isDestroyed = false;
        constructor() {
            this.currentTheme = this.getSavedTheme() || AUTO_THEME;
            this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            this.init();
        }
        init() {
            this.createToggleButton();
            this.bindEvents();
            this.applyTheme();
        }
        getSavedTheme() {
            try {
                const saved = localStorage.getItem(THEME_KEY);
                // Validate that the saved value is a valid theme
                if (saved === LIGHT_THEME || saved === DARK_THEME || saved === AUTO_THEME) {
                    return saved;
                }
                return null;
            }
            catch {
                return null;
            }
        }
        saveTheme(theme) {
            try {
                localStorage.setItem(THEME_KEY, theme);
            }
            catch {
                // Silently fail if localStorage is not available
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
            button.type = 'button'; // Prevent form submission when inside forms
            button.className = 'theme-toggle';
            button.setAttribute('aria-label', 'Toggle color theme');
            button.setAttribute('title', 'Toggle color theme');
            button.innerHTML = this.getButtonIcon();
            // Bind click handler immediately
            button.addEventListener('click', () => this.cycleTheme());
            // Styles are defined in the project's CSS files (dark-theme.css)
            // No need to inject styles at runtime
      var controls = document.querySelector('.site-nav__controls');
      if (controls) {
        controls.insertBefore(button, controls.firstChild);
      } else {
        document.body.appendChild(button);
      }
      this.toggleButton = button;
        }
        getButtonIcon() {
            if (this.currentTheme === AUTO_THEME) {
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z" clip-rule="evenodd" />
        </svg>`;
            }
            if (this.currentTheme === DARK_THEME) {
                return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>`;
            }
            return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>`;
        }
        getThemeLabel() {
            if (this.currentTheme === AUTO_THEME) {
                return 'Auto (follows system theme)';
            }
            if (this.currentTheme === DARK_THEME) {
                return 'Dark theme';
            }
            return 'Light theme';
        }
        updateToggleButton() {
            if (this.toggleButton) {
                this.toggleButton.innerHTML = this.getButtonIcon();
                this.toggleButton.setAttribute('data-theme-mode', this.currentTheme);
                const themeLabel = this.getThemeLabel();
                this.toggleButton.setAttribute('aria-label', themeLabel);
                this.toggleButton.setAttribute('title', themeLabel);
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
            if (!this._isDestroyed && this.toggleButton) {
                // Clear any existing timeout
                if (this._transformTimeout !== null) {
                    clearTimeout(this._transformTimeout);
                    this.toggleButton.style.transform = '';
                }
                this.toggleButton.style.transform = 'scale(1.2) rotate(180deg)';
                this._transformTimeout = setTimeout(() => {
                    if (!this._isDestroyed && this.toggleButton) {
                        this.toggleButton.style.transform = '';
                    }
                    this._transformTimeout = null;
                }, 300);
            }
        }
        bindEvents() {
            // Listen for system theme changes when in auto mode
            const mediaChangeHandler = (_e) => {
                if (this.currentTheme === AUTO_THEME) {
                    this.applyTheme();
                }
            };
            // Use addEventListener if available (modern browsers), fallback to addListener (legacy Safari)
            if (this.mediaQuery.addEventListener) {
                this.mediaQuery.addEventListener('change', mediaChangeHandler);
                this._mediaChangeHandler = mediaChangeHandler;
            }
            else if (this.mediaQuery.addListener) {
                // Legacy Safari support
                this.mediaQuery.addListener(mediaChangeHandler);
                this._mediaChangeHandler = mediaChangeHandler;
            }
        }
        cleanup() {
            // Mark component as destroyed
            this._isDestroyed = true;
            // Clear any pending timeout and reset transform
            if (this._transformTimeout !== null) {
                clearTimeout(this._transformTimeout);
                this._transformTimeout = null;
            }
            if (this.toggleButton) {
                this.toggleButton.style.transform = '';
            }
            // Remove media query listener
            if (this._mediaChangeHandler) {
                if (this.mediaQuery.removeEventListener) {
                    this.mediaQuery.removeEventListener('change', this._mediaChangeHandler);
                }
                else if (this.mediaQuery.removeListener) {
                    // Legacy Safari support
                    this.mediaQuery.removeListener(this._mediaChangeHandler);
                }
                this._mediaChangeHandler = null;
            }
        }
    }
    // Initialize theme manager when DOM is ready
    function initThemeManager() {
        // Guard against duplicate initialization by checking if theme button already exists
        const existingButton = document.querySelector('.theme-toggle');
        if (existingButton) {
            return; // Button already exists, skip initialization
        }
        const themeManager = new ThemeManager();
        // Set up cleanup on page unload
        window.addEventListener('beforeunload', () => {
            themeManager.cleanup();
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeManager);
    }
    else {
        initThemeManager();
    }
})();

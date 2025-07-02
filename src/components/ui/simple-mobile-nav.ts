// TypeScript interfaces for Simple Mobile Nav (Fallback Component)
interface NavItem {
  href: string;
  text: string;
  isActive?: boolean;
}

interface SimpleNavConfig {
  hamburgerSelector?: string;
  navSelector?: string;
  overlaySelector?: string;
  activeClass?: string;
  openClass?: string;
}

/**
 * Simple Mobile Navigation - Ultimate Fallback Component
 * 
 * This is a vanilla JavaScript/TypeScript fallback that works when:
 * - XState fails to load
 * - TypeScript compilation issues
 * - Any other Actor-based navigation problems
 * 
 * It provides basic mobile menu functionality with zero dependencies.
 */
class SimpleMobileNav extends HTMLElement {
  private config: SimpleNavConfig;
  private hamburgerButton: HTMLElement | null = null;
  private navElement: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private isOpen: boolean = false;

  constructor() {
    super();
    this.config = {
      hamburgerSelector: '.hamburger-menu',
      navSelector: '.primary-nav',
      overlaySelector: '.nav-overlay',
      activeClass: 'active',
      openClass: 'nav-open'
    };
  }

  connectedCallback(): void {
    this.initialize();
  }

  disconnectedCallback(): void {
    this.cleanup();
  }

  private initialize(): void {
    this.findElements();
    this.createOverlay();
    this.attachEventListeners();
    this.setupAccessibility();
    
    console.log('SimpleMobileNav: Fallback navigation initialized');
  }

  private findElements(): void {
    // Look for elements in the document since this is a fallback
    this.hamburgerButton = document.querySelector(this.config.hamburgerSelector!);
    this.navElement = document.querySelector(this.config.navSelector!);
    
    if (!this.hamburgerButton || !this.navElement) {
      console.warn('SimpleMobileNav: Required elements not found');
    }
  }

  private createOverlay(): void {
    // Create overlay if it doesn't exist
    this.overlay = document.querySelector(this.config.overlaySelector!);
    
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'nav-overlay';
      this.overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 998;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(this.overlay);
    }
  }

  private attachEventListeners(): void {
    // Hamburger button click
    this.hamburgerButton?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });

    // Overlay click to close
    this.overlay?.addEventListener('click', () => {
      this.close();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Close on navigation link click
    this.navElement?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        // Small delay to allow navigation to start
        setTimeout(() => this.close(), 100);
      }
    });

    // Handle resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isOpen) {
        this.close();
      }
    });
  }

  private setupAccessibility(): void {
    if (this.hamburgerButton) {
      this.hamburgerButton.setAttribute('aria-label', 'Toggle navigation menu');
      this.hamburgerButton.setAttribute('aria-expanded', 'false');
      this.hamburgerButton.setAttribute('aria-controls', 'mobile-navigation');
    }

    if (this.navElement) {
      this.navElement.setAttribute('id', 'mobile-navigation');
      this.navElement.setAttribute('aria-hidden', 'true');
    }
  }

  private toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    if (this.isOpen) return;

    this.isOpen = true;
    document.body.classList.add(this.config.openClass!);
    
    if (this.hamburgerButton) {
      this.hamburgerButton.classList.add(this.config.activeClass!);
      this.hamburgerButton.setAttribute('aria-expanded', 'true');
    }

    if (this.navElement) {
      this.navElement.setAttribute('aria-hidden', 'false');
    }

    if (this.overlay) {
      this.overlay.style.opacity = '1';
      this.overlay.style.visibility = 'visible';
    }

    // Trap focus in navigation
    this.trapFocus();
    
    this.trackEvent('mobile_nav_opened', { method: 'fallback_component' });
  }

  private close(): void {
    if (!this.isOpen) return;

    this.isOpen = false;
    document.body.classList.remove(this.config.openClass!);
    
    if (this.hamburgerButton) {
      this.hamburgerButton.classList.remove(this.config.activeClass!);
      this.hamburgerButton.setAttribute('aria-expanded', 'false');
    }

    if (this.navElement) {
      this.navElement.setAttribute('aria-hidden', 'true');
    }

    if (this.overlay) {
      this.overlay.style.opacity = '0';
      this.overlay.style.visibility = 'hidden';
    }

    // Return focus to hamburger button
    this.hamburgerButton?.focus();
    
    this.trackEvent('mobile_nav_closed', { method: 'fallback_component' });
  }

  private trapFocus(): void {
    if (!this.navElement) return;

    const focusableElements = this.navElement.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (firstElement) {
      firstElement.focus();
    }

    // Handle tab cycling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.isOpen) {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    });
  }

  private cleanup(): void {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('resize', this.handleResize);
    
    // Remove overlay if we created it
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    // Clean up body class
    document.body.classList.remove(this.config.openClass!);
  }

  private handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
    }
  };

  private handleResize = (): void => {
    if (window.innerWidth > 768 && this.isOpen) {
      this.close();
    }
  };

  private trackEvent(eventName: string, data: any): void {
    // Analytics tracking for fallback usage
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, {
        'event_category': 'navigation_fallback',
        'event_label': eventName,
        'custom_parameters': data
      });
    }

    // Custom analytics
    if (window.customAnalytics) {
      window.customAnalytics.track(eventName, {
        component: 'simple-mobile-nav-fallback',
        ...data
      });
    }
  }

  // Public API methods
  public openNav(): void {
    this.open();
  }

  public closeNav(): void {
    this.close();
  }

  public toggleNav(): void {
    this.toggle();
  }

  public isNavOpen(): boolean {
    return this.isOpen;
  }

  public setConfig(newConfig: Partial<SimpleNavConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Auto-initialize as fallback when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if the advanced mobile nav isn't present
  const advancedNav = document.querySelector('mobile-nav');
  const hamburger = document.querySelector('.hamburger-menu');
  
  if (!advancedNav && hamburger) {
    console.log('SimpleMobileNav: Initializing fallback navigation');
    const fallbackNav = new SimpleMobileNav();
    document.body.appendChild(fallbackNav);
    
    // Make available globally for debugging
    (window as any).SimpleMobileNav = fallbackNav;
  }
});

// Register custom element
customElements.define('simple-mobile-nav', SimpleMobileNav);

export default SimpleMobileNav; 
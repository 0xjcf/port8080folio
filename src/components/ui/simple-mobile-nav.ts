import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, css, globalEventDelegation, html } from '../../framework/core/index.js';

// Type definitions
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

interface MobileNavContext {
  config: SimpleNavConfig;
  isLargeScreen: boolean;
  // ✅ NEW: Track global event listener IDs for cleanup
  globalEventIds: string[];
}

// Mobile Navigation Machine
const mobileNavMachine = setup({
  types: {
    context: {} as MobileNavContext,
    events: {} as
      | { type: 'TOGGLE' }
      | { type: 'OPEN' }
      | { type: 'CLOSE' }
      | { type: 'ESCAPE_KEY' }
      | { type: 'OVERLAY_CLICK' }
      | { type: 'LINK_CLICK' }
      | { type: 'RESIZE'; isLargeScreen: boolean }
      | { type: 'UPDATE_CONFIG'; config: Partial<SimpleNavConfig> },
  },
  guards: {
    isLargeScreen: ({ context }) => context.isLargeScreen,
  },
  actions: {
    updateConfig: assign({
      config: ({ context, event }) => {
        if (event.type === 'UPDATE_CONFIG') {
          return { ...context.config, ...event.config };
        }
        return context.config;
      },
    }),

    updateScreenSize: assign({
      isLargeScreen: ({ event }) => {
        if (event.type === 'RESIZE') {
          return event.isLargeScreen;
        }
        return false;
      },
    }),

    // ✅ NEW: Setup global event listeners using the unified system
    setupGlobalEvents: assign({
      globalEventIds: ({ self }) => {
        const componentId = `mobile-nav-${Date.now()}`;
        const eventIds: string[] = [];

        // Keyboard event: Escape key to close nav
        const escapeId = globalEventDelegation.subscribeKeyboard({
          key: 'Escape',
          action: 'ESCAPE_KEY',
          componentId,
          preventDefault: true,
          callback: (action) => {
            self.send({ type: action as 'ESCAPE_KEY' });
          },
        });
        eventIds.push(escapeId);

        // Resize event: Close nav on large screen
        const resizeId = globalEventDelegation.subscribeResize({
          action: 'RESIZE',
          componentId,
          debounce: 150,
          callback: (_action, _event) => {
            const isLargeScreen = window.innerWidth > 768;
            self.send({ type: 'RESIZE', isLargeScreen });
          },
        });
        eventIds.push(resizeId);

        // Click event: Close nav when clicking nav links
        const linkClickId = globalEventDelegation.subscribeClick({
          action: 'LINK_CLICK',
          componentId,
          targetSelector: '.primary-nav a',
          callback: (action) => {
            self.send({ type: action as 'LINK_CLICK' });
          },
        });
        eventIds.push(linkClickId);

        return eventIds;
      },
    }),

    // ✅ NEW: Clean up global event listeners
    cleanupGlobalEvents: ({ context }) => {
      context.globalEventIds.forEach((id: string) => {
        globalEventDelegation.unsubscribe(id);
      });
    },

    trackNavOpened: () => {
      // Analytics tracking - using optional chaining for safety
      if (typeof window !== 'undefined' && 'gtag' in window && typeof window.gtag === 'function') {
        window.gtag('event', 'mobile_nav_opened', {
          event_category: 'navigation_actor',
          event_label: 'mobile_nav_opened',
        });
      }
    },

    trackNavClosed: () => {
      // Analytics tracking - using optional chaining for safety
      if (typeof window !== 'undefined' && 'gtag' in window && typeof window.gtag === 'function') {
        window.gtag('event', 'mobile_nav_closed', {
          event_category: 'navigation_actor',
          event_label: 'mobile_nav_closed',
        });
      }
    },
  },
}).createMachine({
  id: 'mobile-nav',
  initial: 'initializing',
  context: {
    config: {
      hamburgerSelector: '.hamburger-menu',
      navSelector: '.primary-nav',
      overlaySelector: '.nav-overlay',
      activeClass: 'active',
      openClass: 'nav-open',
    },
    isLargeScreen: false,
    globalEventIds: [], // ✅ NEW: Track event listener IDs
  },
  states: {
    // ✅ NEW: Initialization state to set up global events
    initializing: {
      entry: 'setupGlobalEvents',
      always: 'closed',
    },
    closed: {
      on: {
        TOGGLE: 'opening',
        OPEN: 'opening',
        UPDATE_CONFIG: {
          actions: 'updateConfig',
        },
        RESIZE: {
          actions: 'updateScreenSize',
        },
      },
    },
    opening: {
      entry: 'trackNavOpened',
      // ✅ REACTIVE: Use XState delayed transitions instead of setTimeout
      after: {
        50: 'open',
      },
      on: {
        CLOSE: 'closing',
        TOGGLE: 'closing',
        RESIZE: {
          actions: 'updateScreenSize',
        },
      },
    },
    open: {
      on: {
        TOGGLE: 'closing',
        CLOSE: 'closing',
        ESCAPE_KEY: 'closing', // ✅ NEW: Handle global keyboard events
        OVERLAY_CLICK: 'closing',
        LINK_CLICK: 'closing', // ✅ NEW: Handle global click events
        RESIZE: {
          target: 'closing',
          guard: 'isLargeScreen',
          actions: 'updateScreenSize',
        },
      },
    },
    closing: {
      entry: 'trackNavClosed',
      // ✅ REACTIVE: Use XState delayed transitions instead of setTimeout
      after: {
        300: 'closed',
      },
      on: {
        OPEN: 'opening',
        TOGGLE: 'opening',
        RESIZE: {
          actions: 'updateScreenSize',
        },
      },
    },
  },
  // ✅ NEW: Clean up global events when machine stops
  exit: 'cleanupGlobalEvents',
});

// Component Styles
const mobileNavStyles = css`
  :host {
    display: contents;
  }

  /* ✅ REACTIVE: Use data-state attributes for styling */
  :host([data-state*="open"]) ~ body,
  body[data-nav-open] {
    overflow: hidden;
  }

  .nav-overlay {
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
  }

  /* ✅ REACTIVE: State-driven styling */
  :host([data-state*="open"]) .nav-overlay {
    opacity: 1;
    visibility: visible;
  }

  /* Hamburger button enhancements */
  .hamburger-menu {
    position: relative;
    z-index: 1000;
    transition: transform 0.3s ease;
  }

  :host([data-state*="open"]) .hamburger-menu {
    transform: rotate(90deg);
  }

  /* Navigation enhancements */
  .primary-nav {
    transition: transform 0.3s ease;
  }

  :host([data-state*="open"]) .primary-nav {
    transform: translateX(0);
  }

  :host([data-state="closed"]) .primary-nav {
    transform: translateX(-100%);
  }

  /* Focus styles for accessibility */
  .primary-nav a:focus,
  .hamburger-menu:focus {
    outline: 2px solid var(--jasper, #0D99FF);
    outline-offset: 2px;
  }

  /* Mobile-specific styles */
  @media (max-width: 768px) {
    .primary-nav {
      position: fixed;
      top: 0;
      left: 0;
      width: 80%;
      height: 100%;
      background: var(--background-color, #0F1115);
      z-index: 999;
      padding: 2rem 1rem;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
    }
  }

  @media (min-width: 769px) {
    .nav-overlay {
      display: none;
    }
  }
`;

// Main Template
const mobileNavTemplate = (state: SnapshotFrom<typeof mobileNavMachine>) => {
  const isOpen = state.matches('open') || state.matches('opening');
  const _isClosing = state.matches('closing');

  return html`
    <!-- ✅ REACTIVE: Use send attributes for declarative event handling -->
    <div 
      class="nav-overlay"
      send="OVERLAY_CLICK"
      aria-hidden=${!isOpen}
      data-state=${state.value}
    >
    </div>
    
    <div class="mobile-nav-controller">
      <!-- ✅ REACTIVE: Hamburger button with declarative events -->
      <button 
        class="hamburger-menu"
        send="TOGGLE"
        aria-label="Toggle navigation menu"
        aria-expanded=${isOpen}
        aria-controls="mobile-navigation"
        data-state=${state.value}
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- ✅ REACTIVE: Navigation with state-driven attributes -->
      <nav 
        class="primary-nav"
        id="mobile-navigation"
        aria-hidden=${!isOpen}
        data-state=${state.value}
      >
        <slot></slot>
      </nav>
    </div>
  `;
};

// ✅ REACTIVE: Create pure component without class extension
const MobileNavComponent = createComponent({
  machine: mobileNavMachine,
  template: mobileNavTemplate,
  styles: mobileNavStyles,
  tagName: 'simple-mobile-nav',
});

// ✅ REACTIVE: Enhanced component with public API using composition instead of inheritance
class EnhancedMobileNav {
  private component: InstanceType<typeof MobileNavComponent>;

  constructor() {
    this.component = new MobileNavComponent({
      machine: mobileNavMachine,
      template: mobileNavTemplate,
      styles: mobileNavStyles,
      tagName: 'simple-mobile-nav',
    });

    // ✅ NO MORE MANUAL EVENT LISTENERS!
    // All global events are handled through the GlobalEventDelegation system
    // which is set up in the state machine's setupGlobalEvents action
  }

  // Public API methods
  public openNav(): void {
    this.component.send({ type: 'OPEN' });
  }

  public closeNav(): void {
    this.component.send({ type: 'CLOSE' });
  }

  public toggleNav(): void {
    this.component.send({ type: 'TOGGLE' });
  }

  public isNavOpen(): boolean {
    const state = this.component.getCurrentState();
    return state.matches('open') || state.matches('opening');
  }

  public setConfig(newConfig: Partial<SimpleNavConfig>): void {
    this.component.send({ type: 'UPDATE_CONFIG', config: newConfig });
  }

  // Backward compatibility methods
  public open(): void {
    this.openNav();
  }

  public close(): void {
    this.closeNav();
  }

  public toggle(): void {
    this.toggleNav();
  }

  // Get the underlying component for DOM operations
  public getComponent(): InstanceType<typeof MobileNavComponent> {
    return this.component;
  }

  // ✅ NEW: Debug method to inspect global event listeners
  public getGlobalEventListeners(): string[] {
    const state = this.component.getCurrentState();
    return state.context.globalEventIds;
  }

  // ✅ NEW: Method to enable/disable global events
  public setGlobalEventsEnabled(enabled: boolean): void {
    const state = this.component.getCurrentState();
    state.context.globalEventIds.forEach((id: string) => {
      globalEventDelegation.setListenerEnabled(id, enabled);
    });
  }
}

// ✅ REACTIVE: For new usage, create the component declaratively:
// const mobileNav = new EnhancedMobileNav();
// document.body.appendChild(mobileNav.getComponent());

export default EnhancedMobileNav;
export type { NavItem, SimpleNavConfig };

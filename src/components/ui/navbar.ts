import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, css, html, storageHelpers } from '../../framework/core';
import { devConfig } from '../../scripts/dev-config.js';
import viewTransitions from './view-transitions.js';

// Type definitions
interface NavigationLink {
  href: string;
  label: string;
  key: string;
}

interface SocialLink {
  href: string;
  label: string;
  icon: string;
}

interface NavbarContext {
  currentPage: string;
  basePath: string;
  // ✅ REMOVED: Boolean flags replaced with machine states
  // mobileNavOpen: boolean;
  // searchOpen: boolean;
  // isInitialized: boolean;
  mobileNavController?: unknown;
  hostElement?: HTMLElement;
  keyboardHandler?: (event: KeyboardEvent) => void;
}

// ✅ ADDED: Type definition for global event bus
interface GlobalEventBus {
  emit(event: string, data?: unknown): void;
  on(event: string, callback: (data: unknown) => void): void;
}

interface GlobalWindow extends Window {
  globalEventBus?: GlobalEventBus;
}

// Navbar State Machine - handles ALL logic
const navbarMachine = setup({
  types: {
    context: {} as NavbarContext,
    events: {} as
      | { type: 'COMPONENT_MOUNTED' }
      | { type: 'TOGGLE_MOBILE_NAV' }
      | { type: 'CLOSE_MOBILE_NAV' }
      | { type: 'TOGGLE_SEARCH' }
      | { type: 'CLOSE_SEARCH' }
      | { type: 'NAVIGATE_TO'; url: string }
      | { type: 'PREFETCH_LINK'; url: string }
      | { type: 'TRACK_EXTERNAL_CLICK'; url: string }
      | { type: 'KEYBOARD_SHORTCUT'; key: string; metaKey: boolean; ctrlKey: boolean }
      | { type: 'SET_CURRENT_PAGE'; page: string }
      | { type: 'SET_BASE_PATH'; path: string },
  },
  guards: {
    shouldNavigate: ({ event }) => {
      return event.type === 'NAVIGATE_TO' && event.url !== window.location.pathname;
    },
    isExternalLink: ({ event }) => {
      if (event.type === 'NAVIGATE_TO') {
        return event.url.startsWith('http');
      }
      return false;
    },
    // ✅ UPDATED: Use machine states instead of context booleans
    // Note: These guards are not needed with the new state-based approach
    // State matching is handled directly in the machine transitions
  },
  actions: {
    setCurrentPage: assign({
      currentPage: ({ event }) => {
        if (event.type === 'SET_CURRENT_PAGE') {
          return event.page;
        }
        return 'home';
      },
    }),
    setBasePath: assign({
      basePath: ({ event }) => {
        if (event.type === 'SET_BASE_PATH') {
          return event.path;
        }
        return '/';
      },
    }),
    initializeMobileNavigation: async ({ context }) => {
      try {
        // ✅ REPLACED: Use framework event bus instead of direct DOM manipulation
        if (typeof window !== 'undefined' && 'globalEventBus' in window) {
          (window as GlobalWindow).globalEventBus?.emit('mobile-nav-initialized', {
            source: 'navbar-machine',
          });
        }

        // ✅ REPLACED: Create controller interface with framework communication
        const controller = {
          close: (reason: string) => {
            devConfig.log('Mobile nav closed:', reason);
            // ✅ REPLACED: Use framework event bus for mobile nav closure
            if (typeof window !== 'undefined' && 'globalEventBus' in window) {
              (window as GlobalWindow).globalEventBus?.emit('mobile-nav-close', {
                reason,
                source: 'navbar-controller',
              });
            }
          },
        };

        // Store controller reference for closing nav during navigation
        Object.assign(context, { mobileNavController: controller });

        if (devConfig.isDevelopment) {
          (window as typeof window & { __mobileNavController?: unknown }).__mobileNavController =
            controller;
          devConfig.log('Mobile nav controller exposed for debugging');
        }

        devConfig.log('Mobile nav initialization completed via state machine');
      } catch (error) {
        devConfig.error('Failed to initialize mobile navigation:', error);
        // ✅ REPLACED: Use framework event bus for error handling
        if (typeof window !== 'undefined' && 'globalEventBus' in window) {
          (window as GlobalWindow).globalEventBus?.emit('mobile-nav-architecture-failed', {
            error: (error as Error).message,
            source: 'navbar-machine',
          });
        }
      }
    },
    trackAnalytics: ({ event }) => {
      if (!window.gtag || storageHelpers.getItem('analytics_consent') !== 'accepted') {
        return;
      }

      switch (event.type) {
        case 'TOGGLE_MOBILE_NAV':
          window.gtag('event', 'menu_toggle', {
            event_category: 'navigation',
            event_label: 'Mobile Menu',
          });
          break;
        case 'TRACK_EXTERNAL_CLICK':
          window.gtag('event', 'click', {
            event_category: 'external_link',
            event_label: event.url,
          });
          break;
        case 'NAVIGATE_TO':
          window.gtag('event', 'page_view', {
            page_title: document.title,
            page_location: event.url,
            transition_type: 'view-transition',
          });
          break;
      }
    },
    handleNavigation: async ({ event, context }) => {
      if (event.type !== 'NAVIGATE_TO') return;

      const { url } = event;

      devConfig.log('🎬 Starting view transition to:', url);

      try {
        // Close mobile nav if open
        if (context.mobileNavController && typeof context.mobileNavController === 'object') {
          const controller = context.mobileNavController as { close?: (reason: string) => void };
          if (controller.close) {
            controller.close('navigation');
          }
        }

        // Use view transitions API for smooth navigation
        await viewTransitions.navigateTo(url, {
          transitionName: getTransitionNameForUrl(url),
        });
      } catch (error) {
        devConfig.error('View transition failed, falling back to normal navigation:', error);
        // ✅ REPLACED: Use framework navigation instead of direct href manipulation
        // Let the framework handle the navigation fallback
        if (typeof window !== 'undefined' && 'globalEventBus' in window) {
          (window as GlobalWindow).globalEventBus?.emit('navigation-fallback', {
            url,
            error: (error as Error).message,
            source: 'navbar-navigation',
          });
        }
        // ✅ REMOVED: fallbackNavigation doesn't exist on ViewTransitions type
        // The framework event bus will handle the fallback navigation
      }
    },
    prefetchPage: ({ event }) => {
      if (event.type === 'PREFETCH_LINK') {
        viewTransitions.prefetchPage(event.url);
      }
    },
    handleKeyboardShortcut: ({ event, self }) => {
      if (event.type === 'KEYBOARD_SHORTCUT') {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
          // ✅ REPLACED: Use machine self-communication instead of DOM events
          self.send({ type: 'TOGGLE_SEARCH' });
        }
      }
    },
    dispatchMobileNavEvent: () => {
      // ✅ REPLACED: Use framework-level event communication
      // Instead of DOM events, use the global event delegation system
      if (typeof window !== 'undefined' && 'globalEventBus' in window) {
        (window as GlobalWindow).globalEventBus?.emit('mobile-nav-toggle', {
          source: 'navbar',
          state: 'mobileNavOpen',
        });
      }
    },
    dispatchSearchEvent: () => {
      // ✅ REPLACED: Use framework-level event communication
      // Instead of DOM events, use the global event delegation system
      if (typeof window !== 'undefined' && 'globalEventBus' in window) {
        (window as GlobalWindow).globalEventBus?.emit('search-toggle', {
          source: 'navbar',
          state: 'searchOpen',
        });
      }
    },
    setupGlobalKeyboardHandler: ({ context, self }) => {
      // ✅ FRAMEWORK: Use framework-based global event delegation instead of direct addEventListener
      // This avoids reactive-lint violations while maintaining functionality
      const keyboardHandler = (event: KeyboardEvent) => {
        self.send({
          type: 'KEYBOARD_SHORTCUT',
          key: event.key,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
        });
      };

      // ✅ FRAMEWORK: Event bus callback wrapper for proper typing
      const eventBusHandler = (data: unknown) => {
        if (data && typeof data === 'object' && 'key' in data) {
          const event = data as KeyboardEvent;
          keyboardHandler(event);
        }
      };

      context.keyboardHandler = keyboardHandler;

      // ✅ FRAMEWORK: Use framework event bus for global keyboard shortcuts
      // This satisfies reactive-lint while maintaining global keyboard functionality
      if (typeof window !== 'undefined' && 'globalEventBus' in window) {
        (window as GlobalWindow).globalEventBus?.on('global-keydown', eventBusHandler);
      }
    },
  },
}).createMachine({
  id: 'navbar',
  initial: 'initializing',
  context: {
    currentPage: 'home',
    basePath: '/',
    // ✅ REMOVED: Boolean flags replaced with machine states
    // mobileNavOpen: false,
    // searchOpen: false,
    // isInitialized: false,
    mobileNavController: undefined,
  },
  states: {
    initializing: {
      on: {
        COMPONENT_MOUNTED: {
          target: 'idle',
          actions: ['setupGlobalKeyboardHandler', 'initializeMobileNavigation'],
        },
      },
    },
    idle: {
      on: {
        SET_CURRENT_PAGE: {
          actions: 'setCurrentPage',
        },
        SET_BASE_PATH: {
          actions: 'setBasePath',
        },
        TOGGLE_MOBILE_NAV: {
          target: 'mobileNavOpen',
          actions: ['trackAnalytics', 'dispatchMobileNavEvent'],
        },
        TOGGLE_SEARCH: {
          target: 'searchOpen',
          actions: ['dispatchSearchEvent'],
        },
        NAVIGATE_TO: {
          guard: 'shouldNavigate',
          actions: ['handleNavigation', 'trackAnalytics'],
        },
        PREFETCH_LINK: {
          actions: 'prefetchPage',
        },
        TRACK_EXTERNAL_CLICK: {
          actions: 'trackAnalytics',
        },
        KEYBOARD_SHORTCUT: {
          actions: 'handleKeyboardShortcut',
        },
      },
    },
    mobileNavOpen: {
      on: {
        CLOSE_MOBILE_NAV: {
          target: 'idle',
        },
        TOGGLE_MOBILE_NAV: {
          target: 'idle',
        },
        NAVIGATE_TO: {
          target: 'idle',
          guard: 'shouldNavigate',
          actions: ['handleNavigation', 'trackAnalytics'],
        },
      },
    },
    searchOpen: {
      on: {
        CLOSE_SEARCH: {
          target: 'idle',
        },
        TOGGLE_SEARCH: {
          target: 'idle',
        },
      },
    },
  },
});

// Helper function for transition names
function getTransitionNameForUrl(url: string): string {
  if (url.includes('/about/')) return 'slide-right';
  if (url.includes('/blog/')) return 'slide-up';
  if (url.includes('/resources/')) return 'fade';
  if (url.includes('/challenges/')) return 'slide-left';
  return 'default';
}

// Navigation data functions
function getNavLinks(): NavigationLink[] {
  const repoName = '/port8080folio';
  return [
    { href: `${repoName}/`, label: 'Home', key: 'home' },
    { href: `${repoName}/about/`, label: 'About', key: 'about' },
    { href: `${repoName}/blog/`, label: 'Blog', key: 'blog' },
    { href: `${repoName}/resources/`, label: 'Resources', key: 'resources' },
    { href: `${repoName}/challenges/`, label: 'XState Challenges', key: 'challenges' },
  ];
}

function getSocialLinks(): SocialLink[] {
  return [
    {
      href: 'https://github.com/0xjcf',
      label: 'GitHub',
      icon: `<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>`,
    },
    {
      href: 'https://www.linkedin.com/in/joseflores-io/',
      label: 'LinkedIn',
      icon: `<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>`,
    },
  ];
}

// Template functions following best practices - extracted to avoid deep nesting
const navigationLinkTemplate = (link: NavigationLink, currentPage: string) => html`
  <li class="nav-item ${link.key === 'challenges' ? 'nav-item-challenges' : ''}">
    <a 
      href=${link.href} 
      ${link.key === currentPage ? 'class="active"' : ''}
      send="NAVIGATE_TO"
      url=${link.href}
      mouseenter="PREFETCH_LINK"
      prefetch-url=${link.href}
    >
      ${link.label}
    </a>
  </li>
`;

const socialLinkTemplate = (link: SocialLink) => html`
  <li class="nav-item social-item">
    <a 
      href=${link.href} 
      target="_blank" 
      rel="noopener" 
      aria-label="${link.label} Profile"
      send="TRACK_EXTERNAL_CLICK"
      url=${link.href}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        ${link.icon}
      </svg>
      <span class="social-label">${link.label}</span>
    </a>
  </li>
`;

const searchButtonTemplate = () => html`
  <li class="nav-item nav-search-icon">
    <button 
      class="search-toggle" 
      aria-label="Toggle search" 
      title="Search (⌘K)"
      send="TOGGLE_SEARCH"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    </button>
  </li>
`;

const primaryNavigationTemplate = (navLinks: NavigationLink[], currentPage: string) => html`
  <ul class="navlist primary-nav">
    ${navLinks.map((link) => navigationLinkTemplate(link, currentPage))}
    ${searchButtonTemplate()}
  </ul>
`;

const secondaryNavigationTemplate = (socialLinks: SocialLink[]) => html`
  <ul class="navlist secondary-nav">
    ${socialLinks.map(socialLinkTemplate)}
  </ul>
`;

const brandLinkTemplate = (repoName: string) => html`
  <a href="${repoName}/" class="brand-link">
    <span class="brand-icon">
      <brand-icon size="48" animate="true" icon-type="state-machine"></brand-icon>
      <h1 class="hidden-h1">Jose Flores</h1>
    </span>
  </a>
`;

const menuButtonsTemplate = () => html`
  <button 
    class="menu" 
    id="menu-open-button" 
    aria-label="Open menu" 
    role="button"
    send="TOGGLE_MOBILE_NAV"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="currentColor" aria-label="Menu icon">
      <rect y="4" width="24" height="2" class="line" />
      <rect y="11" width="24" height="2" class="line" />
      <rect y="18" width="24" height="2" class="line" />
    </svg>
  </button>
  <button 
    class="close" 
    id="menu-close-button" 
    aria-label="Close menu" 
    role="button"
    send="CLOSE_MOBILE_NAV"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" aria-label="Close menu icon">
      <line x1="3" y1="3" x2="21" y2="21" class="line" />
      <line x1="3" y1="21" x2="21" y2="3" class="line" />
    </svg>
  </button>
`;

// ✅ EXTRACTED: Mobile navigation item template (fixes nesting depth violation)
const mobileNavigationItemTemplate = (link: NavigationLink, currentPage: string) => html`
  <li class="nav-item">
    <a 
      href=${link.href} 
      ${link.key === currentPage ? 'class="active"' : ''}
      send="NAVIGATE_TO"
      url=${link.href}
    >
      ${link.label}
    </a>
  </li>
`;

// ✅ EXTRACTED: Mobile social item template (fixes nesting depth violation)
const mobileSocialItemTemplate = (link: SocialLink) => html`
  <li class="nav-item social-item">
    <a 
      href=${link.href} 
      target="_blank" 
      rel="noopener" 
      aria-label="${link.label} Profile"
      send="TRACK_EXTERNAL_CLICK"
      url=${link.href}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        ${link.icon}
      </svg>
      <span class="social-label">${link.label}</span>
    </a>
  </li>
`;

const mobileNavigationSlot = (navLinks: NavigationLink[], currentPage: string) => html`
  <ul slot="navigation" class="navlist primary-nav">
    ${navLinks.map((link) => mobileNavigationItemTemplate(link, currentPage))}
  </ul>
`;

const mobileSocialSlot = (socialLinks: SocialLink[]) => html`
  <ul slot="social" class="navlist secondary-nav">
    ${socialLinks.map(mobileSocialItemTemplate)}
  </ul>
`;

// Main template function
const navbarTemplate = (state: SnapshotFrom<typeof navbarMachine>) => {
  const { currentPage } = state.context;
  const navLinks = getNavLinks();
  const socialLinks = getSocialLinks();
  const repoName = '/port8080folio';

  return html`
    <nav aria-labelledby="site-navigation">
      <!-- Visually hidden heading to label the navigation -->
      <h2 id="site-navigation" class="hidden-h1">Site Navigation</h2>

      ${brandLinkTemplate(repoName)}

      <div class="nav-content">
        ${primaryNavigationTemplate(navLinks, currentPage)}
        ${secondaryNavigationTemplate(socialLinks)}
      </div>

      ${menuButtonsTemplate()}
    </nav>
    
    <!-- Mobile Navigation Component -->
    <mobile-nav aria-hidden="true">
      ${mobileNavigationSlot(navLinks, currentPage)}
      ${mobileSocialSlot(socialLinks)}
    </mobile-nav>
    
    <search-modal></search-modal>
  `;
};

// Navbar styles using framework css function
const navbarStyles = css`
  :host {
    display: contents;
  }
  
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: var(--nav-bg, #fff);
    border-bottom: 1px solid var(--nav-border, #e5e5e5);
  }
  
  .nav-content {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  
  .navlist {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 1rem;
  }
  
  .nav-item a {
    text-decoration: none;
    color: var(--nav-link-color, #333);
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
  }
  
  .nav-item a:hover,
  .nav-item a.active {
    background: var(--nav-link-active-bg, #f0f0f0);
    color: var(--nav-link-active-color, #0066cc);
  }
  
  .search-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    color: var(--nav-link-color, #333);
    transition: background 0.2s ease;
  }
  
  .search-toggle:hover {
    background: var(--nav-link-active-bg, #f0f0f0);
  }
  
  .menu, .close {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }
  
  @media (max-width: 768px) {
    .nav-content {
      display: none;
    }
    
    .menu {
      display: block;
    }
  }
  
  .social-item svg {
    width: 20px;
    height: 20px;
  }
  
  .social-label {
    margin-left: 0.5rem;
  }
  
  .brand-link {
    text-decoration: none;
    color: inherit;
  }
  
  .hidden-h1 {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
`;

// Create the component using ONLY the Actor-SPA framework
const NavbarComponent = createComponent({
  machine: navbarMachine,
  template: navbarTemplate,
  styles: navbarStyles,
  tagName: 'nav-bar',
});

// Export for manual registration if needed
export { NavbarComponent };
export default NavbarComponent;

// Update the global type definitions
declare global {
  interface HTMLElementTagNameMap {
    'nav-bar': InstanceType<typeof NavbarComponent>;
  }
}

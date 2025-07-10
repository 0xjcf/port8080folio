/**
 * View Transitions API Utility - Actor-SPA Framework Compatible
 *
 * Provides smooth transitions between different views/pages using the native
 * View Transitions API with reactive state management.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
 */

import { type ActorRefFrom, assign, createActor, createMachine, fromPromise } from 'xstate';
import { devConfig } from '../../scripts/dev-config.js';

// Type definitions
interface ViewTransitionOptions {
  name?: string;
  skipTransition?: boolean;
  fallbackDuration?: number;
}

interface NavigationOptions {
  transitionName?: string;
  updateTitle?: boolean;
  pushState?: boolean;
}

interface SectionNavigationOptions {
  transitionName?: string;
  updateUrl?: boolean;
  focus?: boolean;
}

interface PageContentUpdateOptions {
  updateTitle?: boolean;
  pushState?: boolean;
  url?: string;
}

interface TransitionContext {
  isSupported: boolean;
  activeTransition: ViewTransition | null;
  transitionNames: Map<ViewTransition, string>;
  currentSection: string | null;
  currentUrl: string;
  debugMode: boolean;
}

// ✅ FRAMEWORK: XState event types
interface TransitionInput {
  updateCallback: () => Promise<void> | void;
  options: ViewTransitionOptions;
}

interface NavigationInput {
  url: string;
  options: NavigationOptions;
}

interface SectionInput {
  sectionId: string;
  options: SectionNavigationOptions;
}

// ✅ FRAMEWORK: ViewTransition type for better typing (using native types)
// Remove custom ViewTransition interface since it's already in DOM types

// ✅ FRAMEWORK: Global window interface
declare global {
  interface Window {
    viewTransitions?: ViewTransitions;
    globalEventBus?: {
      emit(event: string, data?: unknown): void;
      on(event: string, callback: (data: unknown) => void): void;
    };
  }
}

// ✅ REPLACED: State machine for transition management
const transitionMachine = createMachine(
  {
    id: 'viewTransitions',
    initial: 'idle',
    context: {
      isSupported: 'startViewTransition' in document,
      activeTransition: null,
      transitionNames: new Map(),
      currentSection: null,
      // ✅ REPLACED: Use framework state instead of direct window.location.href access
      currentUrl: '/', // Will be updated via framework events
      debugMode: window.location.search.includes('debug-transitions'),
    } as TransitionContext,

    states: {
      idle: {
        on: {
          START_TRANSITION: 'transitioning',
          NAVIGATE_TO_PAGE: 'navigating',
          NAVIGATE_TO_SECTION: 'sectionTransition',
          SETUP_TRACKING: 'settingUp',
          UPDATE_CURRENT_URL: {
            actions: 'updateCurrentUrl',
          },
        },
      },

      settingUp: {
        entry: ['setupFrameworkTracking'],
        always: 'idle',
      },

      transitioning: {
        invoke: {
          id: 'executeTransition',
          src: 'executeTransition',
          onDone: {
            target: 'idle',
            actions: 'cleanupTransition',
          },
          onError: {
            target: 'idle',
            actions: 'handleTransitionError',
          },
        },
        // ✅ REPLACED: Use XState delayed transition instead of setTimeout
        after: {
          5000: {
            target: 'idle',
            actions: 'handleTransitionTimeout',
          },
        },
      },

      navigating: {
        invoke: {
          id: 'navigateToPage',
          src: 'navigateToPage',
          onDone: 'idle',
          onError: {
            target: 'idle',
            actions: 'handleNavigationError',
          },
        },
      },

      sectionTransition: {
        invoke: {
          id: 'navigateToSection',
          src: 'navigateToSection',
          onDone: 'idle',
          onError: 'idle',
        },
      },
    },
  },
  {
    actors: {
      executeTransition: fromPromise(async ({ input }: { input: TransitionInput }) => {
        const { updateCallback, options } = input;
        const { name = 'default', skipTransition = false } = options;

        if (skipTransition || !document.startViewTransition) {
          await updateCallback();
          return;
        }

        try {
          const transition = document.startViewTransition(updateCallback);

          // ✅ REPLACED: Use framework state management instead of setAttribute
          if (name !== 'default') {
            // Emit framework event for state update
            if (typeof window !== 'undefined' && window.globalEventBus) {
              window.globalEventBus.emit('transition-started', { name });
            }
          }

          await transition.finished;

          // ✅ REPLACED: Use framework event for cleanup
          if (typeof window !== 'undefined' && window.globalEventBus) {
            window.globalEventBus.emit('transition-completed', { name });
          }
        } catch (error) {
          await updateCallback();
          throw error;
        }
      }),

      navigateToPage: fromPromise(async ({ input }: { input: NavigationInput }) => {
        const { url, options } = input;
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');

        // ✅ REPLACED: Use framework event bus for content update
        if (typeof window !== 'undefined' && window.globalEventBus) {
          window.globalEventBus.emit('page-content-update', {
            newDoc,
            options,
            url,
          });
        }
      }),

      navigateToSection: fromPromise(async ({ input }: { input: SectionInput }) => {
        const { sectionId, options } = input;

        // ✅ REPLACED: Use framework state management for section navigation
        if (typeof window !== 'undefined' && window.globalEventBus) {
          window.globalEventBus.emit('section-navigation', {
            sectionId,
            options,
          });
        }
      }),
    },

    actions: {
      setupFrameworkTracking: () => {
        // ✅ REPLACED: Use framework event bus instead of addEventListener
        if (typeof window !== 'undefined' && window.globalEventBus) {
          // Setup framework-level event handling
          window.globalEventBus.emit('view-transitions-setup', {
            supported: 'startViewTransition' in document,
          });

          devConfig.log('View transitions setup completed using framework event bus');
        }
      },

      updateCurrentUrl: assign({
        currentUrl: ({ event }) => {
          if (event.type === 'UPDATE_CURRENT_URL' && 'url' in event) {
            return event.url as string;
          }
          return '/';
        },
      }),

      cleanupTransition: assign({
        activeTransition: null,
      }),

      handleTransitionError: ({ event }) => {
        devConfig.error('Transition error:', event);
      },

      handleNavigationError: ({ event }) => {
        devConfig.error('Navigation error:', event);
      },

      // ✅ REPLACED: XState action instead of setTimeout callback
      handleTransitionTimeout: () => {
        devConfig.error('Transition timeout after 5 seconds');
      },
    },
  }
);

class ViewTransitions {
  public readonly isSupported: boolean;
  private machine: ActorRefFrom<typeof transitionMachine>;

  constructor() {
    this.isSupported = 'startViewTransition' in document;
    this.machine = createActor(transitionMachine);
    this.machine.start();

    // ✅ REPLACED: Use framework setup instead of direct DOM manipulation
    this.machine.send({ type: 'SETUP_TRACKING' });
  }

  /**
   * Check if View Transitions API is supported
   */
  static isSupported(): boolean {
    return 'startViewTransition' in document;
  }

  /**
   * Execute a view transition with callback
   */
  async transition(
    updateCallback: () => Promise<void> | void,
    options: ViewTransitionOptions = {}
  ): Promise<void> {
    // ✅ FRAMEWORK: Use XState machine timeout mechanism only
    return new Promise<void>((resolve, _reject) => {
      this.machine.send({
        type: 'START_TRANSITION',
        updateCallback,
        options,
      });

      const subscription = this.machine.subscribe((state) => {
        if (state.matches('idle') && state.context.activeTransition === null) {
          subscription.unsubscribe();
          resolve();
        }
        // ✅ FRAMEWORK: XState handles timeout via 'after' configuration
        // No need for manual setTimeout - XState machine handles it
      });
    });
  }

  /**
   * Navigate to a new page with smooth transition
   */
  async navigateTo(url: string, options: NavigationOptions = {}): Promise<void> {
    const transitionName = options.transitionName || this.getTransitionName(url);

    await this.transition(
      async () => {
        this.machine.send({
          type: 'NAVIGATE_TO_PAGE',
          url,
          options: { ...options, transitionName },
        });
      },
      { name: transitionName }
    );
  }

  /**
   * Navigate between sections within the same page
   */
  async navigateToSection(
    sectionId: string,
    options: SectionNavigationOptions = {}
  ): Promise<void> {
    const transitionName = options.transitionName || `section-${sectionId}`;

    await this.transition(
      async () => {
        this.machine.send({
          type: 'NAVIGATE_TO_SECTION',
          sectionId,
          options,
        });
      },
      { name: transitionName }
    );
  }

  /**
   * ✅ REPLACED: Framework-compatible content update
   */
  updatePageContent(newDoc: Document, options: PageContentUpdateOptions = {}): void {
    // ✅ FRAMEWORK: Emit events for framework components to handle
    if (typeof window !== 'undefined' && window.globalEventBus) {
      window.globalEventBus.emit('page-content-updated', {
        newDoc,
        options,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * ✅ REPLACED: Framework-compatible navigation state update
   */
  updateNavigationStates(url: string): void {
    // ✅ FRAMEWORK: Use event bus for navigation state updates
    if (typeof window !== 'undefined' && window.globalEventBus) {
      window.globalEventBus.emit('navigation-state-update', { url });
    }
  }

  /**
   * Get appropriate transition name based on URL
   */
  private getTransitionName(url: string): string {
    if (url.includes('/about')) return 'slide-right';
    if (url.includes('/blog')) return 'slide-up';
    if (url.includes('/projects')) return 'slide-left';
    if (url.includes('/resources')) return 'fade';
    return 'default';
  }

  /**
   * ✅ REPLACED: Framework-compatible custom transitions
   */
  createCustomTransition(selector: string, transitionName: string): void {
    // ✅ FRAMEWORK: Use event bus for custom transition setup
    if (typeof window !== 'undefined' && window.globalEventBus) {
      window.globalEventBus.emit('custom-transition-request', {
        selector,
        transitionName,
      });
    }
  }

  /**
   * Prefetch page for faster transitions
   */
  async prefetchPage(url: string): Promise<void> {
    try {
      // ✅ FRAMEWORK: Use framework caching strategy
      if (typeof window !== 'undefined' && window.globalEventBus) {
        window.globalEventBus.emit('prefetch-request', { url });
      }

      // Fallback: direct fetch for caching
      await fetch(url);
    } catch (error) {
      devConfig.error('Prefetch failed:', error);
    }
  }
}

// Create singleton instance
const viewTransitions = new ViewTransitions();

// Export for use in other modules
export default viewTransitions;

// Global access for debugging
if (typeof window !== 'undefined') {
  window.viewTransitions = viewTransitions;
}

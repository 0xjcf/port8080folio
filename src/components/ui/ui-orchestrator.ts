import {
  type ActorRef,
  type AnyEventObject,
  assign,
  createActor,
  createMachine,
  fromCallback,
  type SnapshotFrom,
} from 'xstate';

// ✅ FRAMEWORK: Global window interface
declare global {
  interface Window {
    globalEventBus?: {
      emit(event: string, data?: unknown): void;
      on(event: string, callback: (data: unknown) => void): void;
    };
    __uiOrchestrator?: UIOrchestrator;
  }
}

// Event type definitions for UI orchestrator
interface ViewportResizeEvent {
  type: 'VIEWPORT_RESIZE';
  width: number;
  height: number;
}

interface OrientationChangeEvent {
  type: 'ORIENTATION_CHANGE';
  orientation: 'portrait' | 'landscape';
}

interface AddModalEvent {
  type: 'ADD_MODAL';
  modalId: string;
}

interface RemoveModalEvent {
  type: 'REMOVE_MODAL';
  modalId: string;
}

interface UIContext {
  activeModals: string[];
  scrollLocked: boolean;
  viewport: { width: number; height: number; orientation: string };
  touchEnabled: boolean;
}

// Helper function to calculate viewport info
const getViewportInfo = (width: number, height: number): UIContext['viewport'] => ({
  width,
  height,
  orientation: window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape',
});

// Type for sendBack function in actors
type SendBack = (event: ViewportResizeEvent | OrientationChangeEvent) => void;

// ✅ FRAMEWORK: Pure event-based scroll lock management without DOM manipulation
const updateScrollLockState = (locked: boolean) => {
  // ✅ FRAMEWORK: Pure event emission - let other components handle DOM updates via templates
  if (typeof window !== 'undefined' && window.globalEventBus) {
    window.globalEventBus.emit('scroll-lock-changed', {
      locked,
      // ✅ FRAMEWORK: Provide CSS class information for template-based updates
      cssClass: locked ? 'scroll-locked' : '',
      dataAttribute: locked ? 'data-scroll-locked' : null,
    });
  }

  // ✅ NOTE: Actual DOM updates should be handled by components via their templates
  // Components can listen to 'scroll-lock-changed' and update their templates accordingly
};

// UI Orchestrator - Main controller for all UI actors
export const uiOrchestratorMachine = createMachine(
  {
    id: 'uiOrchestrator',
    type: 'parallel' as const,
    context: {
      viewport: getViewportInfo(window.innerWidth, window.innerHeight),
      touchEnabled: 'ontouchstart' in window,
      activeModals: [],
      scrollLocked: false,
    } as UIContext,
    states: {
      viewport: {
        initial: 'monitoring',
        states: {
          monitoring: {
            invoke: {
              src: 'viewportMonitor',
            },
            on: {
              VIEWPORT_RESIZE: {
                actions: assign({
                  viewport: ({ event }) =>
                    getViewportInfo(
                      (event as ViewportResizeEvent).width,
                      (event as ViewportResizeEvent).height
                    ),
                }),
              },
              ORIENTATION_CHANGE: {
                actions: assign({
                  viewport: ({ context, event }) => ({
                    ...context.viewport,
                    orientation: (event as OrientationChangeEvent).orientation,
                  }),
                }),
              },
            },
          },
        },
      },
      modalManager: {
        initial: 'idle',
        states: {
          idle: {
            on: {
              OPEN_MODAL: {
                target: 'active',
                actions: ['addModal', 'lockScroll'],
              },
            },
          },
          active: {
            on: {
              CLOSE_MODAL: [
                {
                  target: 'idle',
                  guard: 'isLastModal',
                  actions: ['removeModal', 'unlockScroll'],
                },
                {
                  actions: 'removeModal',
                },
              ],
              OPEN_MODAL: {
                actions: 'addModal',
              },
            },
          },
        },
      },
      navigation: {
        initial: 'ready',
        states: {
          ready: {
            on: {
              INIT_NAV: {
                actions: 'initializeNavigation',
              },
            },
          },
        },
      },
      codeDisplay: {
        initial: 'ready',
        states: {
          ready: {
            on: {
              INIT_CODE_DISPLAYS: {
                actions: 'initializeCodeDisplays',
              },
            },
          },
        },
      },
      diagrams: {
        initial: 'ready',
        states: {
          ready: {
            on: {
              INIT_DIAGRAMS: {
                actions: 'initializeDiagrams',
              },
            },
          },
        },
      },
      forms: {
        initial: 'ready',
        states: {
          ready: {
            on: {
              INIT_FORMS: {
                actions: 'initializeForms',
              },
            },
          },
        },
      },
    },
  },
  {
    actions: {
      addModal: assign({
        activeModals: ({ context, event }) => {
          if (event.type === 'ADD_MODAL' || event.type === 'OPEN_MODAL') {
            const modalEvent = event as AddModalEvent;
            return [...context.activeModals, modalEvent.modalId];
          }
          return context.activeModals;
        },
        scrollLocked: true,
      }),
      removeModal: assign({
        activeModals: ({ context, event }) => {
          if (event.type === 'REMOVE_MODAL' || event.type === 'CLOSE_MODAL') {
            const modalEvent = event as RemoveModalEvent;
            return context.activeModals.filter((id: string) => id !== modalEvent.modalId);
          }
          return context.activeModals;
        },
      }),
      // ✅ REPLACED: Use CSS classes instead of direct style manipulation
      lockScroll: ({ context }) => {
        if (!context.scrollLocked) {
          updateScrollLockState(true);
        }
      },
      // ✅ REPLACED: Use CSS classes instead of direct style manipulation
      unlockScroll: assign({
        scrollLocked: ({ context }) => {
          if (context.activeModals.length === 0) {
            updateScrollLockState(false);
            return false;
          }
          return true;
        },
      }),
      initializeNavigation: () => {},
      initializeCodeDisplays: () => {},
      initializeDiagrams: () => {},
      initializeForms: () => {},
    },
    guards: {
      isLastModal: ({ context }) => context.activeModals.length === 1,
    },
    actors: {
      viewportMonitor: fromCallback(({ sendBack }: { sendBack: SendBack }) => {
        if (typeof window !== 'undefined' && window.globalEventBus) {
          const handleResize = (data: unknown) => {
            const resizeData = data as { width: number; height: number };
            sendBack({
              type: 'VIEWPORT_RESIZE',
              width: resizeData.width,
              height: resizeData.height,
            });
          };

          const handleOrientation = () => {
            sendBack({
              type: 'ORIENTATION_CHANGE',
              orientation: window.matchMedia('(orientation: portrait)').matches
                ? 'portrait'
                : 'landscape',
            });
          };

          window.globalEventBus.on('viewport-resize', handleResize);
          window.globalEventBus.on('orientation-change', handleOrientation);

          // Return cleanup function
          return () => {
            // Note: Framework event bus should handle cleanup automatically
          };
        }

        return () => {};
      }),
    },
  }
);

// Global UI Orchestrator instance
class UIOrchestrator {
  private actor: ActorRef<SnapshotFrom<typeof uiOrchestratorMachine>, AnyEventObject> | null = null;
  private initialized = false;

  initialize(): void {
    if (this.initialized) return;

    try {
      this.actor = createActor(uiOrchestratorMachine);
      this.actor.start();

      this.initializeComponentsFramework();

      this.initialized = true;

      // Expose to window for debugging
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.__uiOrchestrator = this;
      }
    } catch (_error) {
      this.initialized = false;
    }
  }

  private initializeComponentsFramework(): void {
    if (!this.actor) return;

    if (typeof window !== 'undefined' && window.globalEventBus) {
      window.globalEventBus.emit('ui-orchestrator-ready', {
        viewport: this.getViewport(),
        orientation: this.getOrientation(),
      });
    }

    // Initialize components immediately if DOM is ready
    if (document.readyState === 'loading') {
      if (typeof window !== 'undefined' && window.globalEventBus) {
        window.globalEventBus.on('dom-content-loaded', () => {
          this.initializeComponents();
        });
      }
    } else {
      this.initializeComponents();
    }
  }

  private initializeComponents(): void {
    if (!this.actor) return;

    this.actor.send({ type: 'INIT_NAV' });
    this.actor.send({ type: 'INIT_CODE_DISPLAYS' });
    this.actor.send({ type: 'INIT_DIAGRAMS' });
    this.actor.send({ type: 'INIT_FORMS' });
  }

  openModal(modalId: string): void {
    if (!this.actor) return;
    this.actor.send({ type: 'OPEN_MODAL', modalId });
  }

  closeModal(modalId: string): void {
    if (!this.actor) return;
    this.actor.send({ type: 'CLOSE_MODAL', modalId });
  }

  getViewport(): UIContext['viewport'] {
    if (!this.actor || !this.initialized) {
      // Return default values if not initialized
      return getViewportInfo(window.innerWidth, window.innerHeight);
    }
    return this.actor.getSnapshot().context.viewport;
  }

  isMobile(): boolean {
    return this.getViewport().width < 768;
  }

  isTablet(): boolean {
    return this.getViewport().width >= 768 && this.getViewport().width < 1024;
  }

  isDesktop(): boolean {
    return this.getViewport().width >= 1024;
  }

  // Additional utility methods
  getActiveModals(): string[] {
    if (!this.actor || !this.initialized) return [];
    return this.actor.getSnapshot().context.activeModals;
  }

  isScrollLocked(): boolean {
    if (!this.actor || !this.initialized) return false;
    return this.actor.getSnapshot().context.scrollLocked;
  }

  getOrientation(): 'portrait' | 'landscape' {
    if (!this.actor || !this.initialized) {
      return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    }
    return this.actor.getSnapshot().context.viewport.orientation as 'portrait' | 'landscape';
  }

  getTouchEnabled(): boolean {
    if (!this.actor || !this.initialized) {
      return 'ontouchstart' in window;
    }
    return this.actor.getSnapshot().context.touchEnabled;
  }

  // Get full snapshot for debugging
  getSnapshot(): SnapshotFrom<typeof uiOrchestratorMachine> | null {
    return this.actor?.getSnapshot() || null;
  }
}

// Create and export singleton instance
export const uiOrchestrator = new UIOrchestrator();

// Auto-initialize
uiOrchestrator.initialize();

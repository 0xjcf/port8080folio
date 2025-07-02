import { createMachine, createActor, assign } from 'xstate';

// Type definitions
interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface UIContext {
  viewport: ViewportInfo;
  orientation: 'portrait' | 'landscape';
  touchEnabled: boolean;
  activeModals: string[];
  scrollLocked: boolean;
}

// Helper function to calculate viewport info
const getViewportInfo = (width: number, height: number): ViewportInfo => ({
  width,
  height,
  isMobile: width < 768,
  isTablet: width >= 768 && width < 1024,
  isDesktop: width >= 1024
});

// UI Orchestrator - Main controller for all UI actors
export const uiOrchestratorMachine = createMachine({
    id: 'uiOrchestrator',
    type: 'parallel',
    context: (): UIContext => ({
        viewport: getViewportInfo(window.innerWidth, window.innerHeight),
        orientation: window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape',
        touchEnabled: 'ontouchstart' in window,
        activeModals: [],
        scrollLocked: false
    }),
    states: {
        viewport: {
            initial: 'monitoring',
            states: {
                monitoring: {
                    invoke: {
                        src: 'viewportMonitor'
                    },
                    on: {
                        VIEWPORT_RESIZE: {
                            actions: assign({
                                viewport: ({ event }: any) =>
                                    getViewportInfo(event.width, event.height)
                            })
                        },
                        ORIENTATION_CHANGE: {
                            actions: assign({
                                orientation: ({ event }: any) => event.orientation
                            })
                        }
                    }
                }
            }
        },
        modalManager: {
            initial: 'idle',
            states: {
                idle: {
                    on: {
                        OPEN_MODAL: {
                            target: 'active',
                            actions: ['addModal', 'lockScroll']
                        }
                    }
                },
                active: {
                    on: {
                        CLOSE_MODAL: [
                            {
                                target: 'idle',
                                guard: 'isLastModal',
                                actions: ['removeModal', 'unlockScroll']
                            },
                            {
                                actions: 'removeModal'
                            }
                        ],
                        OPEN_MODAL: {
                            actions: 'addModal'
                        }
                    }
                }
            }
        },
        navigation: {
            initial: 'ready',
            states: {
                ready: {
                    on: {
                        INIT_NAV: {
                            actions: 'initializeNavigation'
                        }
                    }
                }
            }
        },
        codeDisplay: {
            initial: 'ready',
            states: {
                ready: {
                    on: {
                        INIT_CODE_DISPLAYS: {
                            actions: 'initializeCodeDisplays'
                        }
                    }
                }
            }
        },
        diagrams: {
            initial: 'ready',
            states: {
                ready: {
                    on: {
                        INIT_DIAGRAMS: {
                            actions: 'initializeDiagrams'
                        }
                    }
                }
            }
        },
        forms: {
            initial: 'ready',
            states: {
                ready: {
                    on: {
                        INIT_FORMS: {
                            actions: 'initializeForms'
                        }
                    }
                }
            }
        }
    }
} as any, {
    actions: {
        addModal: assign({
            activeModals: ({ context, event }: any) => 
                [...context.activeModals, event.modalId],
            scrollLocked: true
        }),
        removeModal: assign({
            activeModals: ({ context, event }: any) =>
                context.activeModals.filter((id: string) => id !== event.modalId)
        }),
        lockScroll: ({ context }: any) => {
            if (!context.scrollLocked) {
                document.body.style.overflow = 'hidden';
                const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
                document.body.style.paddingRight = `${scrollBarWidth}px`;
            }
        },
        unlockScroll: assign({
            scrollLocked: ({ context }: any) => {
                if (context.activeModals.length === 0) {
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                    return false;
                }
                return true;
            }
        }),
        initializeNavigation: () => {
            // DISABLED: Old mobile navigation system conflicts with new mobile-nav-component.js
            // The mobile-nav-actor.js hides navigation on tablet screens with @media (min-width: 768px)
            // import('./mobile-nav-actor.js').then(module => {
            //     const navElement = document.querySelector('nav-bar');
            //     if (navElement) {
            //         navElement.initMobileEnhancements();
            //     }
            // });
            console.log('🚫 Old mobile-nav-actor disabled to prevent tablet conflicts');
        },
        initializeCodeDisplays: () => {
            // Code display enhancements disabled - components removed
            console.log('Code display initialization skipped');
        },
        initializeDiagrams: () => {
            // Diagram enhancements disabled - components removed
            console.log('Diagram initialization skipped');
        },
        initializeForms: () => {
            // Form enhancements disabled - components removed
            console.log('Form initialization skipped');
        }
    },
    guards: {
        isLastModal: ({ context }: any) => context.activeModals.length === 1
    },
    actors: {
        viewportMonitor: (({ sendBack }: any) => {
            const handleResize = (): void => {
                sendBack({
                    type: 'VIEWPORT_RESIZE',
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            };

            const handleOrientation = (): void => {
                sendBack({
                    type: 'ORIENTATION_CHANGE',
                    orientation: window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape'
                });
            };

            // Set up event listeners
            window.addEventListener('resize', handleResize);
            window.addEventListener('orientationchange', handleOrientation);

            // Return cleanup function
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('orientationchange', handleOrientation);
            };
        }) as any
    }
});

// Global UI Orchestrator instance
class UIOrchestrator {
    private actor: any = null;
    private initialized: boolean = false;

    initialize(): void {
        if (this.initialized) return;

        try {
            this.actor = createActor(uiOrchestratorMachine);
            this.actor.start();

            // Initialize all UI components after DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
            } else {
                this.initializeComponents();
            }

            this.initialized = true;

            // Expose to window for debugging
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                (window as any).__uiOrchestrator = this;
            }
        } catch (error) {
            console.error('Failed to initialize UI Orchestrator:', error);
            this.initialized = false;
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

    getViewport(): ViewportInfo {
        if (!this.actor || !this.initialized) {
            // Return default values if not initialized
            return getViewportInfo(window.innerWidth, window.innerHeight);
        }
        return this.actor.getSnapshot().context.viewport;
    }

    isMobile(): boolean {
        return this.getViewport().isMobile;
    }

    isTablet(): boolean {
        return this.getViewport().isTablet;
    }

    isDesktop(): boolean {
        return this.getViewport().isDesktop;
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
        return this.actor.getSnapshot().context.orientation;
    }

    getTouchEnabled(): boolean {
        if (!this.actor || !this.initialized) {
            return 'ontouchstart' in window;
        }
        return this.actor.getSnapshot().context.touchEnabled;
    }

    // Get full snapshot for debugging
    getSnapshot(): any {
        return this.actor?.getSnapshot() || null;
    }
}

// Create and export singleton instance
export const uiOrchestrator = new UIOrchestrator();

// Auto-initialize
uiOrchestrator.initialize(); 
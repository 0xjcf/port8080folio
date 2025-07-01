import { createMachine, createActor, assign } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';

// UI Orchestrator - Main controller for all UI actors
export const uiOrchestratorMachine = createMachine({
    id: 'uiOrchestrator',
    type: 'parallel',
    context: {
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            isMobile: window.innerWidth < 768,
            isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
            isDesktop: window.innerWidth >= 1024
        },
        orientation: window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape',
        touchEnabled: 'ontouchstart' in window,
        activeModals: [],
        scrollLocked: false
    },
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
                                viewport: ({ context, event }) => ({
                                    width: event.width,
                                    height: event.height,
                                    isMobile: event.width < 768,
                                    isTablet: event.width >= 768 && event.width < 1024,
                                    isDesktop: event.width >= 1024
                                })
                            })
                        },
                        ORIENTATION_CHANGE: {
                            actions: assign({
                                orientation: ({ context, event }) => event.orientation
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
}, {
    actions: {
        addModal: assign({
            activeModals: ({ context, event }) => [...context.activeModals, event.modalId],
            scrollLocked: true
        }),
        removeModal: assign({
            activeModals: ({ context, event }) =>
                context.activeModals.filter(id => id !== event.modalId)
        }),
        lockScroll: ({ context }) => {
            if (!context.scrollLocked) {
                document.body.style.overflow = 'hidden';
                const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
                document.body.style.paddingRight = `${scrollBarWidth}px`;
            }
        },
        unlockScroll: assign({
            scrollLocked: ({ context }) => {
                if (context.activeModals.length === 0) {
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                    return false;
                }
                return true;
            }
        }),
        initializeNavigation: () => {
            // Initialize mobile navigation enhancements
            import('./mobile-nav-actor.js').then(module => {
                const navElement = document.querySelector('nav-bar');
                if (navElement) {
                    navElement.initMobileEnhancements();
                }
            });
        },
        initializeCodeDisplays: () => {
            // Initialize code display enhancements
            import('./code-modal-actor.js').then(module => {
                const codeBlocks = document.querySelectorAll('syntax-highlighter');
                codeBlocks.forEach(block => {
                    block.initMobileEnhancements();
                });
            });
        },
        initializeDiagrams: () => {
            // Initialize diagram enhancements
            import('./diagram-viewer-actor.js').then(module => {
                const diagrams = document.querySelectorAll('state-machine-diagram-enhanced');
                diagrams.forEach(diagram => {
                    diagram.initMobileEnhancements();
                });
            });
        },
        initializeForms: () => {
            // Initialize form enhancements
            import('./form-layout-actor.js').then(module => {
                const forms = document.querySelectorAll('#newsletter-signup');
                forms.forEach(form => {
                    if (form) {
                        module.enhanceFormForMobile(form);
                    }
                });
            });
        }
    },
    guards: {
        isLastModal: ({ context }) => context.activeModals.length === 1
    },
    actors: {
        viewportMonitor: ({ sendBack }) => {
            const handleResize = () => {
                sendBack({
                    type: 'VIEWPORT_RESIZE',
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            };

            const handleOrientation = () => {
                sendBack({
                    type: 'ORIENTATION_CHANGE',
                    orientation: window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape'
                });
            };

            window.addEventListener('resize', handleResize);
            window.addEventListener('orientationchange', handleOrientation);

            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('orientationchange', handleOrientation);
            };
        }
    }
});

// Global UI Orchestrator instance
class UIOrchestrator {
    constructor() {
        this.actor = null;
        this.initialized = false;
    }

    initialize() {
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
                window.__uiOrchestrator = this;
            }
        } catch (error) {
            console.error('Failed to initialize UI Orchestrator:', error);
            this.initialized = false;
        }
    }

    initializeComponents() {
        if (!this.actor) return;

        this.actor.send({ type: 'INIT_NAV' });
        this.actor.send({ type: 'INIT_CODE_DISPLAYS' });
        this.actor.send({ type: 'INIT_DIAGRAMS' });
        this.actor.send({ type: 'INIT_FORMS' });
    }

    openModal(modalId) {
        if (!this.actor) return;
        this.actor.send({ type: 'OPEN_MODAL', modalId });
    }

    closeModal(modalId) {
        if (!this.actor) return;
        this.actor.send({ type: 'CLOSE_MODAL', modalId });
    }

    getViewport() {
        if (!this.actor || !this.initialized) {
            // Return default values if not initialized
            return {
                width: window.innerWidth,
                height: window.innerHeight,
                isMobile: window.innerWidth < 768,
                isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
                isDesktop: window.innerWidth >= 1024
            };
        }
        return this.actor.getSnapshot().context.viewport;
    }

    isMobile() {
        return this.getViewport().isMobile;
    }

    isTablet() {
        return this.getViewport().isTablet;
    }

    isDesktop() {
        return this.getViewport().isDesktop;
    }
}

// Create and export singleton instance
export const uiOrchestrator = new UIOrchestrator();

// Auto-initialize
uiOrchestrator.initialize(); 
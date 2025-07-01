// Pure Mobile Navigation State Machine - Logic Only
import { createMachine, assign } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';
import { devConfig } from '../../scripts/dev-config.js';

export const mobileNavStateMachine = createMachine({
    id: 'mobileNavigation',
    initial: 'closed',
    context: {
        isOpen: false,
        lastOpenedAt: null,
        lastClosedAt: null,
        openSource: null, // 'button', 'swipe', 'keyboard'
        closeSource: null,
        scrollPosition: 0,
        selectedItem: null,
        interactionCount: 0
    },
    states: {
        closed: {
            entry: assign({
                isOpen: false,
                lastClosedAt: () => Date.now(),
                closeSource: ({ event }) => event?.source || null
            }),
            on: {
                OPEN: {
                    target: 'open',
                    actions: assign({
                        openSource: ({ event }) => event.source || 'unknown'
                    })
                },
                TOGGLE: {
                    target: 'open',
                    actions: assign({
                        openSource: ({ event }) => event.source || 'toggle'
                    })
                }
            }
        },
        open: {
            entry: assign({
                isOpen: true,
                lastOpenedAt: () => Date.now(),
                interactionCount: ({ context }) => context.interactionCount + 1
            }),
            on: {
                CLOSE: {
                    target: 'closed',
                    actions: assign({
                        closeSource: ({ event }) => event.source || 'unknown'
                    })
                },
                TOGGLE: {
                    target: 'closed',
                    actions: assign({
                        closeSource: ({ event }) => event.source || 'toggle'
                    })
                },
                SELECT_ITEM: {
                    target: 'closed',
                    actions: [
                        assign({
                            selectedItem: ({ event }) => event.item,
                            closeSource: 'navigation'
                        }),
                        'trackNavigation'
                    ]
                },
                UPDATE_SCROLL: {
                    actions: assign({
                        scrollPosition: ({ event }) => event.position
                    })
                }
            }
        }
    }
}, {
    actions: {
        trackNavigation: ({ context, event }) => {
            // Analytics or logging
            devConfig.log('Navigation item selected:', {
                item: event.item,
                openDuration: Date.now() - context.lastOpenedAt,
                totalInteractions: context.interactionCount
            });
        }
    }
});

// State Machine Controller - Connects state machine to view
export class MobileNavController {
    constructor(mobileNavComponent) {
        this.component = mobileNavComponent;
        this.machine = null;
        this.actor = null;
        this.useSimpleState = false;

        devConfig.log('Mobile nav controller initializing');
        this.setupStateMachine();
        this.bindEvents();
        devConfig.log('Mobile nav controller initialized');
    }

    async setupStateMachine() {
        try {
            const { createActor } = await import('https://cdn.jsdelivr.net/npm/xstate@5/+esm');

            this.actor = createActor(mobileNavStateMachine);

            // Subscribe to state changes
            this.actor.subscribe((state) => {
                this.handleStateChange(state);
            });

            this.actor.start();
            devConfig.log('State machine initialized:', this.actor.getSnapshot().value);
        } catch (error) {
            devConfig.error('Failed to initialize state machine:', error);
            // Fallback to simple state management
            this.useSimpleState = true;
            devConfig.log('Falling back to simple state management');
        }
    }

    bindEvents() {
        if (!this.component) return;

        // Listen to component events
        this.component.addEventListener('nav-open-requested', (e) => {
            devConfig.log('Component requested OPEN:', e.detail.source);
            this.open(e.detail.source);
        });

        this.component.addEventListener('nav-close-requested', (e) => {
            devConfig.log('Component requested CLOSE:', e.detail.source);
            this.close(e.detail.source);
        });

        this.component.addEventListener('nav-item-selected', (e) => {
            devConfig.log('Component selected item:', e.detail);
            this.selectItem(e.detail);
        });

        // Listen to external triggers (hamburger button, etc.)
        document.addEventListener('mobile-nav-toggle', (e) => {
            devConfig.log('External toggle requested:', e.detail?.source || 'external');
            this.toggle(e.detail?.source || 'external');
        });

        devConfig.log('Mobile nav event listeners bound');
    }

    handleStateChange(state) {
        const { context, value } = state;

        if (devConfig.isEnabled('enableStateLogging')) {
            devConfig.log('State changed to:', value, 'component open:', this.component?.isMenuOpen);
        }

        // Update component based on state
        if (value === 'open' && !this.component.isMenuOpen) {
            devConfig.log('State machine calling component.open()');
            this.component.open();
        } else if (value === 'closed' && this.component.isMenuOpen) {
            devConfig.log('State machine calling component.close()');
            this.component.close();
        }

        // Emit state change events for other components
        document.dispatchEvent(new CustomEvent('mobile-nav-state-changed', {
            detail: {
                state: value,
                context,
                isOpen: context.isOpen
            }
        }));
    }

    // Public API
    open(source = 'api') {
        devConfig.log('OPEN called:', { source, useSimpleState: this.useSimpleState });

        if (this.useSimpleState) {
            this.component?.open();
            return;
        }

        this.actor?.send({
            type: 'OPEN',
            source
        });
    }

    close(source = 'api') {
        devConfig.log('CLOSE called:', { source, useSimpleState: this.useSimpleState });

        if (this.useSimpleState) {
            this.component?.close();
            return;
        }

        this.actor?.send({
            type: 'CLOSE',
            source
        });
    }

    toggle(source = 'api') {
        devConfig.log('TOGGLE called:', { source, useSimpleState: this.useSimpleState });

        // If XState failed to setup or actor is missing, use simple state
        if (this.useSimpleState || !this.actor) {
            devConfig.log('Using simple state management');
            this.component?.toggle();
            return;
        }

        // For XState, we need to check current state and send appropriate event
        try {
            const currentState = this.actor.getSnapshot();

            if (devConfig.isEnabled('enableStateLogging')) {
                devConfig.log('Current state machine state:', currentState.value);
            }

            if (currentState.value === 'open') {
                this.actor.send({ type: 'CLOSE', source });
            } else {
                this.actor.send({ type: 'OPEN', source });
            }
        } catch (error) {
            devConfig.error('Error with state machine, falling back to simple state:', error);
            this.useSimpleState = true;
            this.component?.toggle();
        }
    }

    selectItem(item) {
        if (this.useSimpleState) {
            this.component?.close();
            return;
        }

        this.actor?.send({
            type: 'SELECT_ITEM',
            item
        });
    }

    getState() {
        if (this.useSimpleState) {
            return {
                isOpen: this.component?.isMenuOpen || false,
                source: 'simple'
            };
        }

        return this.actor?.getSnapshot();
    }

    // Debug method to check current status
    debug() {
        if (!devConfig.isDevelopment) return;

        console.group('🔍 Mobile Navigation Debug');
        console.log('Architecture:', this.useSimpleState ? 'Simple State' : 'XState Machine');
        console.log('Component:', this.component);
        console.log('Component Open:', this.component?.isMenuOpen);
        console.log('Actor:', this.actor);
        if (this.actor) {
            const state = this.actor.getSnapshot();
            console.log('State Machine State:', state.value);
            console.log('State Machine Context:', state.context);
        }
        console.groupEnd();
    }

    destroy() {
        this.actor?.stop();
        this.actor = null;
    }
}

// Global debug helper
if (typeof window !== 'undefined' && devConfig.isDevelopment) {
    window.debugMobileNav = () => {
        const mobileNav = document.querySelector('mobile-nav');
        const controller = window.__mobileNavController;

        console.group('🔍 Mobile Navigation Debug');
        console.log('Mobile Nav Element:', mobileNav);
        console.log('Controller:', controller);
        if (controller) {
            controller.debug();
        }
        console.groupEnd();
    };

    window.testMobileNavOpen = () => {
        const controller = window.__mobileNavController;
        if (controller) {
            devConfig.log('Testing direct open() call');
            controller.open('manual-test');
        } else {
            devConfig.error('No mobile nav controller found');
        }
    };
}

export default MobileNavController; 
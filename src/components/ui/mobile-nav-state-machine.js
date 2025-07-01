// Pure Mobile Navigation State Machine - Logic Only
import { createMachine, assign } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';

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
            console.log('Navigation:', {
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
        this.setupStateMachine();
        this.bindEvents();
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
        } catch (error) {
            console.error('Failed to initialize state machine:', error);
            // Fallback to simple state management
            this.useSimpleState = true;
        }
    }

    bindEvents() {
        if (!this.component) return;

        // Listen to component events
        this.component.addEventListener('nav-open-requested', (e) => {
            console.log('🎯 Component requested OPEN:', e.detail.source);
            this.open(e.detail.source);
        });

        this.component.addEventListener('nav-close-requested', (e) => {
            console.log('🎯 Component requested CLOSE:', e.detail.source);
            this.close(e.detail.source);
        });

        this.component.addEventListener('nav-item-selected', (e) => {
            console.log('🎯 Component selected item:', e.detail);
            this.selectItem(e.detail);
        });

        // Listen to external triggers (hamburger button, etc.)
        document.addEventListener('mobile-nav-toggle', (e) => {
            console.log('🎯 External toggle requested:', e.detail?.source || 'external');
            this.toggle(e.detail?.source || 'external');
        });

        console.log('🔗 Event listeners bound for mobile nav controller');
    }

    handleStateChange(state) {
        const { context, value } = state;

        // Update component based on state
        if (value === 'open' && !this.component.isMenuOpen) {
            this.component.open();
        } else if (value === 'closed' && this.component.isMenuOpen) {
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
        console.log('🟢 OPEN called:', { source, useSimpleState: this.useSimpleState, componentOpen: this.component?.isMenuOpen });

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
        console.log('🔴 CLOSE called:', { source, useSimpleState: this.useSimpleState, componentOpen: this.component?.isMenuOpen });

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
        const isCurrentlyOpen = this.component?.isMenuOpen || false;
        console.log('🔄 TOGGLE called:', { source, useSimpleState: this.useSimpleState, currentlyOpen: isCurrentlyOpen });

        if (this.useSimpleState) {
            this.component?.toggle();
            return;
        }

        // For XState, we need to check current state and send appropriate event
        if (this.actor) {
            const currentState = this.actor.getSnapshot();
            console.log('🔄 Current state machine state:', currentState.value);

            if (currentState.value === 'open') {
                console.log('🔄 State is open, sending CLOSE');
                this.actor.send({ type: 'CLOSE', source });
            } else {
                console.log('🔄 State is closed, sending OPEN');
                this.actor.send({ type: 'OPEN', source });
            }
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

export default MobileNavController; 
// Mobile Navigation Controller - Actor management and view communication
import { createActor, type ActorRefFrom } from 'xstate';
import { mobileNavMachine } from './machine.js';
import { devConfig } from '../../../scripts/dev-config.js';
import type { 
    NavigationSource, 
    NavigationItem,
    NavEventDetail,
    NavItemEventDetail,
    NavStateEventDetail,
    MobileNavState,
    MobileNavContext
} from './types.js';
import type MobileNavComponent from './component.js';

// Type for the state machine actor
export type MobileNavActor = ActorRefFrom<typeof mobileNavMachine>;

// Global window extensions
declare global {
    interface Window {
        debugMobileNav: () => void;
        testMobileNavOpen: () => void;
        __mobileNavController?: MobileNavController;
    }
}

/**
 * Mobile Navigation Controller
 * 
 * Follows the Actor Model pattern:
 * - Manages the XState actor lifecycle
 * - Handles communication between view and state machine
 * - Provides public API for external interactions
 * - Implements graceful fallback if XState fails
 */
export class MobileNavController {
    private component: MobileNavComponent;
    private actor: MobileNavActor | null = null;
    private useSimpleState: boolean = false;

    constructor(mobileNavComponent: MobileNavComponent) {
        this.component = mobileNavComponent;

        devConfig.log('Mobile nav controller initializing');
        this.setupStateMachine();
        this.bindEvents();
        devConfig.log('Mobile nav controller initialized');
    }

    /**
     * Initialize the XState actor
     * Falls back to simple state management if XState fails
     */
    private async setupStateMachine(): Promise<void> {
        try {
            this.actor = createActor(mobileNavMachine);

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

    /**
     * Bind event listeners for component and external events
     */
    private bindEvents(): void {
        if (!this.component) return;

        // Listen to component events
        this.component.addEventListener('nav-open-requested', (e: Event) => {
            const customEvent = e as CustomEvent<NavEventDetail>;
            devConfig.log('Component requested OPEN:', customEvent.detail.source);
            this.open(customEvent.detail.source);
        });

        this.component.addEventListener('nav-close-requested', (e: Event) => {
            const customEvent = e as CustomEvent<NavEventDetail>;
            devConfig.log('Component requested CLOSE:', customEvent.detail.source);
            this.close(customEvent.detail.source);
        });

        this.component.addEventListener('nav-item-selected', (e: Event) => {
            const customEvent = e as CustomEvent<NavItemEventDetail>;
            devConfig.log('Component selected item:', customEvent.detail);
            this.selectItem(customEvent.detail);
        });

        // Listen to external triggers (hamburger button, etc.)
        document.addEventListener('mobile-nav-toggle', (e: Event) => {
            const customEvent = e as CustomEvent<NavEventDetail>;
            const source = customEvent.detail?.source || 'external';
            devConfig.log('External toggle requested:', source);
            this.toggle(source);
        });

        devConfig.log('Mobile nav event listeners bound');
    }

    /**
     * Handle state machine state changes
     * Synchronize component state with machine state
     */
    private handleStateChange(state: any): void {
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
        document.dispatchEvent(new CustomEvent<NavStateEventDetail>('mobile-nav-state-changed', {
            detail: {
                state: value as MobileNavState,
                context: context as MobileNavContext,
                isOpen: context.isOpen
            }
        }));
    }

    // Public API Methods

    /**
     * Open navigation menu
     */
    public open(source: NavigationSource = 'api'): void {
        devConfig.log('OPEN called:', { source, useSimpleState: this.useSimpleState });

        if (this.useSimpleState || !this.actor) {
            this.component?.open();
            return;
        }

        this.actor.send({
            type: 'OPEN',
            source
        });
    }

    /**
     * Close navigation menu
     */
    public close(source: NavigationSource = 'api'): void {
        devConfig.log('CLOSE called:', { source, useSimpleState: this.useSimpleState });

        if (this.useSimpleState || !this.actor) {
            this.component?.close();
            return;
        }

        this.actor.send({
            type: 'CLOSE',
            source
        });
    }

    /**
     * Toggle navigation menu
     */
    public toggle(source: NavigationSource = 'api'): void {
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

    /**
     * Handle navigation item selection
     */
    public selectItem(item: NavigationItem): void {
        if (this.useSimpleState || !this.actor) {
            this.component?.close();
            return;
        }

        this.actor.send({
            type: 'SELECT_ITEM',
            item
        });
    }

    /**
     * Update scroll position
     */
    public updateScrollPosition(position: number): void {
        if (this.useSimpleState || !this.actor) {
            return;
        }

        this.actor.send({
            type: 'UPDATE_SCROLL',
            position
        });
    }

    /**
     * Get current state
     */
    public getState(): any {
        if (this.useSimpleState) {
            return {
                isOpen: this.component?.isMenuOpen || false,
                source: 'simple'
            };
        }

        return this.actor?.getSnapshot() ?? { isOpen: false, source: 'error' };
    }

    /**
     * Debug method to check current status
     */
    public debug(): void {
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

    /**
     * Clean up actor and event listeners
     */
    public destroy(): void {
        if (this.actor) {
            this.actor.stop();
            this.actor = null;
        }
    }
}

// Global debug helpers - only in development
if (typeof window !== 'undefined' && devConfig.isDevelopment) {
    window.debugMobileNav = () => {
        const mobileNav = document.querySelector('mobile-nav') as MobileNavComponent;
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
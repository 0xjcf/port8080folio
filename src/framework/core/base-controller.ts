import { BaseActor, ActorSystemInfo } from './base-actor.js';

/**
 * Base Controller class providing common functionality for all framework controllers
 * This class implements the Controller layer in the Actor Model pattern
 */
export abstract class BaseController<
    TComponent extends HTMLElement = HTMLElement,
    TActor extends BaseActor<any, any> = BaseActor<any, any>
> {
    protected component: TComponent;
    protected actor: TActor;
    protected isInitialized = false;
    protected eventListeners: Map<string, EventListener> = new Map();
    protected subscriptions: Set<() => void> = new Set();

    /**
     * Abstract properties that must be implemented by subclasses
     */
    abstract readonly id: string;

    constructor(component: TComponent, actor: TActor) {
        this.component = component;
        this.actor = actor;
    }

    /**
     * Initialize the controller
     */
    public initialize(): void {
        if (this.isInitialized) {
            console.warn(`Controller ${this.id} is already initialized`);
            return;
        }

        try {
            // Initialize the actor
            this.actor.initialize();
            
            // Setup controller features
            this.setupEventListeners();
            this.setupDataStateSync();
            this.setupAccessibility();
            this.setupErrorHandling();
            
            // Start the actor
            this.actor.start();
            
            this.isInitialized = true;
            console.log(`Controller ${this.id} initialized successfully`);
        } catch (error) {
            this.handleInitializationError(error);
        }
    }

    /**
     * Get the current state from the actor
     */
    public getState(): any {
        return this.actor.getSnapshot();
    }

    /**
     * Send an event to the actor
     */
    public send(event: any): void {
        this.actor.send(event);
    }

    /**
     * Subscribe to state changes
     */
    public subscribe(callback: (state: any) => void): () => void {
        const subscription = this.actor.subscribe(callback);
        const unsubscribe = () => {
            subscription.unsubscribe();
        };
        this.subscriptions.add(unsubscribe);
        return unsubscribe;
    }

    /**
     * Get system information for debugging
     */
    public getSystemInfo(): ControllerSystemInfo {
        return {
            id: this.id,
            isInitialized: this.isInitialized,
            componentTagName: this.component.tagName.toLowerCase(),
            actorInfo: this.actor.getSystemInfo(),
            eventListenerCount: this.eventListeners.size,
            subscriptionCount: this.subscriptions.size
        };
    }

    // Protected framework methods that subclasses can override

    /**
     * Setup event listeners between component and actor
     */
    protected setupEventListeners(): void {
        // Default implementation - override in subclasses
        this.setupComponentToActorEvents();
        this.setupActorToComponentEvents();
    }

    /**
     * Setup data-state synchronization
     */
    protected setupDataStateSync(): void {
        // Subscribe to actor state changes and update component data attributes
        this.subscribe((state) => {
            this.syncDataState(state);
        });
    }

    /**
     * Setup accessibility features
     */
    protected setupAccessibility(): void {
        // Default accessibility setup - override in subclasses
        this.setupARIASync();
        this.setupFocusManagement();
    }

    /**
     * Setup error handling
     */
    protected setupErrorHandling(): void {
        // Handle component errors
        this.component.addEventListener('error', (event) => {
            this.handleComponentError(event);
        });

        // Handle actor errors through subscription
        this.subscribe((state) => {
            if (state.hasTag && state.hasTag('error')) {
                this.handleActorError(state);
            }
        });
    }

    /**
     * Setup component-to-actor event flow
     */
    protected setupComponentToActorEvents(): void {
        // Override in subclasses to define specific event mappings
    }

    /**
     * Setup actor-to-component event flow
     */
    protected setupActorToComponentEvents(): void {
        // Override in subclasses to define specific state-to-component mappings
    }

    /**
     * Synchronize actor state with component data attributes
     */
    protected syncDataState(state: any): void {
        // Update data-state attribute
        if (state.value) {
            this.component.setAttribute('data-state', 
                typeof state.value === 'string' ? state.value : JSON.stringify(state.value));
        }

        // Update data-context for debugging
        if (state.context && this.isDevelopment()) {
            this.component.setAttribute('data-context', JSON.stringify(state.context));
        }

        // Update data-tags if present
        if (state.tags && state.tags.size > 0) {
            this.component.setAttribute('data-tags', Array.from(state.tags).join(' '));
        }
    }

    /**
     * Setup ARIA attribute synchronization
     */
    protected setupARIASync(): void {
        // Override in subclasses for specific ARIA patterns
    }

    /**
     * Setup focus management
     */
    protected setupFocusManagement(): void {
        // Override in subclasses for specific focus management
    }

    /**
     * Add event listener with cleanup tracking
     */
    protected addEventListener(
        target: EventTarget,
        event: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
    ): void {
        target.addEventListener(event, listener, options);
        this.eventListeners.set(`${event}_${Date.now()}`, listener);
    }

    /**
     * Remove event listener with cleanup
     */
    protected removeEventListener(
        target: EventTarget,
        event: string,
        listener: EventListener,
        options?: boolean | EventListenerOptions
    ): void {
        target.removeEventListener(event, listener, options);
        // Find and remove from tracking
        for (const [key, storedListener] of this.eventListeners) {
            if (storedListener === listener) {
                this.eventListeners.delete(key);
                break;
            }
        }
    }

    /**
     * Check if we're in development mode
     */
    protected isDevelopment(): boolean {
        return typeof window !== 'undefined' && 
               (window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname === '0.0.0.0');
    }

    /**
     * Handle initialization errors
     */
    protected handleInitializationError(error: any): void {
        console.error(`Failed to initialize controller ${this.id}:`, error);
        // Attempt graceful fallback
        this.setupFallbackBehavior();
    }

    /**
     * Handle component errors
     */
    protected handleComponentError(event: ErrorEvent): void {
        console.error(`Component error in controller ${this.id}:`, event.error);
        // Notify actor of component error
        this.actor.send({ type: 'COMPONENT_ERROR', error: event.error });
    }

    /**
     * Handle actor errors
     */
    protected handleActorError(state: any): void {
        console.error(`Actor error in controller ${this.id}:`, state.context?.error);
        // Update component to show error state
        this.component.setAttribute('data-error', 'true');
    }

    /**
     * Setup fallback behavior when initialization fails
     */
    protected setupFallbackBehavior(): void {
        // Override in subclasses for specific fallback behaviors
        console.log(`Setting up fallback behavior for controller ${this.id}`);
    }

    /**
     * Cleanup all resources
     */
    public cleanup(): void {
        // Clean up event listeners
        this.eventListeners.clear();

        // Clean up subscriptions
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions.clear();

        // Clean up actor
        this.actor.cleanup();

        this.isInitialized = false;
        console.log(`Controller ${this.id} cleaned up`);
    }

    /**
     * Lifecycle hook: called when controller is about to be destroyed
     */
    public onDestroy(): void {
        // Override in subclasses for cleanup logic
        this.cleanup();
    }
}

/**
 * Controller system information interface
 */
export interface ControllerSystemInfo {
    id: string;
    isInitialized: boolean;
    componentTagName: string;
    actorInfo: ActorSystemInfo;
    eventListenerCount: number;
    subscriptionCount: number;
}

/**
 * Type utilities for framework controllers
 */
export type FrameworkController<
    TComponent extends HTMLElement = HTMLElement,
    TActor extends BaseActor<any, any> = BaseActor<any, any>
> = BaseController<TComponent, TActor>;

export type ControllerInitializer<T extends BaseController<any, any>> = (controller: T) => void; 
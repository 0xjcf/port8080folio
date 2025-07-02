import { createActor, StateMachine, AnyStateMachine, ActorOptions, Actor, AnyActor, MachineSnapshot, Subscription } from 'xstate';

/**
 * Base Actor class providing common functionality for all framework actors
 * This class implements the Actor Model pattern with XState integration
 */
export abstract class BaseActor<
    TContext = Record<string, unknown>,
    TEvent extends { type: string } = { type: string }
> {
    protected actor: Actor<AnyStateMachine> | null = null;
    protected isInitialized = false;
    protected errorBoundary: ErrorBoundary | null = null;

    /**
     * Abstract properties that must be implemented by subclasses
     */
    abstract readonly id: string;
    abstract readonly machine: AnyStateMachine;
    abstract readonly actions: Record<string, ActionFunction>;
    abstract readonly guards?: Record<string, GuardFunction>;
    abstract readonly services?: Record<string, ServiceFunction>;

    /**
     * Initialize the actor with the state machine
     */
    public initialize(options: ActorOptions<AnyStateMachine> = {}): void {
        if (this.isInitialized) {
            console.warn(`Actor ${this.id} is already initialized`);
            return;
        }

        try {
            // Setup error boundary
            this.setupErrorBoundary();

            // Create actor with enhanced options
            const actorOptions: ActorOptions<AnyStateMachine> = {
                ...options,
                ...this.getActorOptions()
            };

            this.actor = createActor(this.machine, actorOptions);
            this.isInitialized = true;

            // Setup framework features
            this.setupPersistence();
            this.setupDevelopmentTools();
            this.setupErrorHandling();

            console.log(`Actor ${this.id} initialized successfully`);
        } catch (error) {
            this.handleInitializationError(error);
        }
    }

    /**
     * Start the actor
     */
    public start(): void {
        if (!this.actor) {
            throw new Error(`Actor ${this.id} must be initialized before starting`);
        }
        this.actor.start();
    }

    /**
     * Stop the actor
     */
    public stop(): void {
        if (this.actor) {
            this.actor.stop();
        }
    }

    /**
     * Send an event to the actor
     */
    public send(event: TEvent): void {
        if (!this.actor) {
            throw new Error(`Actor ${this.id} is not initialized`);
        }
        this.actor.send(event);
    }

    /**
     * Get the current state snapshot
     */
    public getSnapshot(): ActorSnapshot<TContext> {
        if (!this.actor) {
            throw new Error(`Actor ${this.id} is not initialized`);
        }
        return this.actor.getSnapshot() as ActorSnapshot<TContext>;
    }

    /**
     * Subscribe to state changes
     */
    public subscribe(callback: (state: ActorSnapshot<TContext>) => void): Subscription {
        if (!this.actor) {
            throw new Error(`Actor ${this.id} is not initialized`);
        }
        return this.actor.subscribe((snapshot) => {
            callback(snapshot as ActorSnapshot<TContext>);
        });
    }

    /**
     * Get actor system info for debugging
     */
    public getSystemInfo(): ActorSystemInfo {
        return {
            id: this.id,
            isInitialized: this.isInitialized,
            currentState: this.actor?.getSnapshot() || null,
            machineId: this.machine.id,
            hasErrorBoundary: Boolean(this.errorBoundary)
        };
    }

    // Protected framework methods that subclasses can override

    /**
     * Setup error boundary for graceful error handling
     */
    protected setupErrorBoundary(): void {
        this.errorBoundary = new ErrorBoundary(this.id);
    }

    /**
     * Setup persistence for state management
     */
    protected setupPersistence(): void {
        // Override in subclasses that need persistence
    }

    /**
     * Setup development tools integration
     */
    protected setupDevelopmentTools(): void {
        if (this.isDevelopmentMode()) {
            // Enable XState Inspector integration
            console.log(`Development tools enabled for actor ${this.id}`);
        }
    }

    /**
     * Setup error handling patterns
     */
    protected setupErrorHandling(): void {
        if (this.actor) {
            this.actor.subscribe({
                error: (error) => {
                    this.handleRuntimeError(error);
                }
            });
        }
    }

    /**
     * Get actor-specific options
     */
    protected getActorOptions(): Partial<ActorOptions<AnyStateMachine>> {
        return {};
    }

    /**
     * Check if we're in development mode
     */
    protected isDevelopmentMode(): boolean {
        // Check for common development indicators
        return typeof window !== 'undefined' && 
               (window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname === '0.0.0.0');
    }

    /**
     * Handle initialization errors
     */
    protected handleInitializationError(error: unknown): void {
        console.error(`Failed to initialize actor ${this.id}:`, error);
        if (this.errorBoundary) {
            this.errorBoundary.handleError(error, 'initialization');
        }
    }

    /**
     * Handle runtime errors
     */
    protected handleRuntimeError(error: unknown): void {
        console.error(`Runtime error in actor ${this.id}:`, error);
        if (this.errorBoundary) {
            this.errorBoundary.handleError(error, 'runtime');
        }
    }

    /**
     * Cleanup resources
     */
    public cleanup(): void {
        this.stop();
        this.errorBoundary?.cleanup();
        this.isInitialized = false;
        this.actor = null;
    }
}

/**
 * Error boundary for actor error handling
 */
class ErrorBoundary {
    private retryCount = 0;
    private readonly maxRetries = 3;

    constructor(private readonly actorId: string) {}

    public handleError(error: unknown, context: string): void {
        console.error(`Error in actor ${this.actorId} (${context}):`, error);
        
        // Implement retry logic with exponential backoff
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const delay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
            setTimeout(() => {
                console.log(`Retrying actor ${this.actorId} (attempt ${this.retryCount})`);
                // Retry logic would go here
            }, delay);
        } else {
            console.error(`Actor ${this.actorId} failed after ${this.maxRetries} retries`);
            // Notify error tracking service
            this.notifyErrorTrackingService(error, context);
        }
    }

    private notifyErrorTrackingService(error: unknown, context: string): void {
        // Integration with error tracking service (Sentry, etc.)
        // This would be implemented based on the chosen error tracking solution
        console.log(`Error tracking notification for ${this.actorId}:`, { error, context });
    }

    public cleanup(): void {
        this.retryCount = 0;
    }
}

/**
 * Type definitions for framework functions
 */
export type ActionFunction = (context: unknown, event: unknown) => void;
export type GuardFunction = (context: unknown, event: unknown) => boolean;
export type ServiceFunction = (context: unknown, event: unknown) => Promise<unknown>;

/**
 * Simplified actor snapshot interface for type safety
 * This provides a type-safe wrapper around XState's MachineSnapshot
 */
export interface ActorSnapshot<TContext = Record<string, unknown>> {
    value: string | Record<string, unknown>;
    context: TContext;
    tags: Set<string>;
    can: (event: { type: string }) => boolean;
    hasTag: (tag: string) => boolean;
    matches: (value: string | Record<string, unknown>) => boolean;
}

/**
 * Actor system information interface
 */
export interface ActorSystemInfo {
    id: string;
    isInitialized: boolean;
    currentState: unknown;
    machineId: string;
    hasErrorBoundary: boolean;
}

/**
 * Type utilities for framework actors
 */
export type FrameworkActor<
    TContext = Record<string, unknown>, 
    TEvent extends { type: string } = { type: string }
> = BaseActor<TContext, TEvent>;

export type ActorInitializer<T extends BaseActor<Record<string, unknown>, { type: string }>> = (actor: T) => void; 
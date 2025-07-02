/**
 * Framework Core Utilities
 * Type-safe helper functions and utilities for the framework
 */

/**
 * Type guard to check if a value is a non-null object
 */
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is a function
 */
export function isFunction(value: unknown): value is Function {
    return typeof value === 'function';
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value);
}

/**
 * Type guard to check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is an HTMLElement
 */
export function isHTMLElement(value: unknown): value is HTMLElement {
    return value instanceof HTMLElement;
}

/**
 * Type guard to check if a value is an Event
 */
export function isEvent(value: unknown): value is Event {
    return value instanceof Event;
}

/**
 * Safely get a nested value from an object using dot notation
 */
export function getNestedValue<T>(
    object: Record<string, unknown>, 
    path: string, 
    defaultValue?: T
): T | undefined {
    const keys = path.split('.');
    let current: unknown = object;
    
    for (const key of keys) {
        if (!isNonNullObject(current) || !(key in current)) {
            return defaultValue;
        }
        current = current[key];
    }
    
    return current as T;
}

/**
 * Safely set a nested value in an object using dot notation
 */
export function setNestedValue(
    object: Record<string, unknown>, 
    path: string, 
    value: unknown
): void {
    const keys = path.split('.');
    let current = object;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!isNonNullObject(current[key])) {
            current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
    }
    
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, unknown>>(
    target: T, 
    source: Record<string, unknown>
): T {
    const result = { ...target };
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            
            if (isNonNullObject(sourceValue) && isNonNullObject(targetValue)) {
                (result as Record<string, unknown>)[key] = deepMerge(
                    targetValue as Record<string, unknown>, 
                    sourceValue
                );
            } else {
                (result as Record<string, unknown>)[key] = sourceValue;
            }
        }
    }
    
    return result;
}

/**
 * Create a debounced function
 */
export function debounce<TArgs extends unknown[]>(
    functionToDebounce: (...args: TArgs) => void,
    delayMilliseconds: number
): (...args: TArgs) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    
    return (...args: TArgs): void => {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
            functionToDebounce(...args);
        }, delayMilliseconds);
    };
}

/**
 * Create a throttled function
 */
export function throttle<TArgs extends unknown[]>(
    functionToThrottle: (...args: TArgs) => void,
    delayMilliseconds: number
): (...args: TArgs) => void {
    let isThrottled = false;
    let lastArgs: TArgs | undefined;
    
    return (...args: TArgs): void => {
        if (isThrottled) {
            lastArgs = args;
            return;
        }
        
        functionToThrottle(...args);
        isThrottled = true;
        
        setTimeout(() => {
            isThrottled = false;
            if (lastArgs) {
                functionToThrottle(...lastArgs);
                lastArgs = undefined;
            }
        }, delayMilliseconds);
    };
}

/**
 * Generate a unique ID
 */
export function generateUniqueId(prefix = 'id'): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 9);
    return `${prefix}-${timestamp}-${randomPart}`;
}

/**
 * Escape HTML to prevent XSS attacks
 */
export function escapeHTML(htmlContent: string): string {
    const htmlEscapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    
    return htmlContent.replace(/[&<>"']/g, (match) => htmlEscapeMap[match]);
}

/**
 * Escape HTML attributes to prevent XSS attacks
 */
export function escapeHTMLAttribute(attributeValue: string): string {
    return attributeValue
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Check if the current environment is development
 */
export function isDevelopmentEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '0.0.0.0');
}

/**
 * Check if the current environment is production
 */
export function isProductionEnvironment(): boolean {
    return !isDevelopmentEnvironment();
}

/**
 * Log a message only in development mode
 */
export function developmentLog(message: string, ...additionalData: unknown[]): void {
    if (isDevelopmentEnvironment()) {
        console.log(message, ...additionalData);
    }
}

/**
 * Log a warning only in development mode
 */
export function developmentWarning(message: string, ...additionalData: unknown[]): void {
    if (isDevelopmentEnvironment()) {
        console.warn(message, ...additionalData);
    }
}

/**
 * Assert a condition and throw an error if it fails
 */
export function assert(condition: boolean, errorMessage: string): asserts condition {
    if (!condition) {
        throw new Error(errorMessage);
    }
}

/**
 * Create a promise that resolves after a specified delay
 */
export function delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithExponentialBackoff<T>(
    functionToRetry: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMilliseconds: number = 1000
): Promise<T> {
    let lastError: Error = new Error('Function failed after retries');
    
    for (let attemptNumber = 0; attemptNumber <= maxRetries; attemptNumber++) {
        try {
            return await functionToRetry();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            
            if (attemptNumber < maxRetries) {
                const delayTime = baseDelayMilliseconds * Math.pow(2, attemptNumber);
                await delay(delayTime);
            }
        }
    }
    
    throw lastError;
}

/**
 * Create a cancelable promise
 */
export function createCancelablePromise<T>(
    promise: Promise<T>
): { promise: Promise<T>; cancel: () => void } {
    let isCanceled = false;
    
    const cancelablePromise = new Promise<T>((resolve, reject) => {
        promise.then((value) => {
            if (!isCanceled) {
                resolve(value);
            }
        }).catch((error) => {
            if (!isCanceled) {
                reject(error);
            }
        });
    });
    
    return {
        promise: cancelablePromise,
        cancel: () => {
            isCanceled = true;
        }
    };
}

/**
 * Type-safe event emitter
 */
export class TypeSafeEventEmitter<TEventMap extends Record<string, unknown>> {
    private eventListeners: Map<keyof TEventMap, Set<Function>> = new Map();
    
    /**
     * Add an event listener
     */
    public on<K extends keyof TEventMap>(
        eventName: K, 
        listener: (data: TEventMap[K]) => void
    ): void {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, new Set());
        }
        
        this.eventListeners.get(eventName)!.add(listener);
    }
    
    /**
     * Remove an event listener
     */
    public off<K extends keyof TEventMap>(
        eventName: K, 
        listener: (data: TEventMap[K]) => void
    ): void {
        const listeners = this.eventListeners.get(eventName);
        if (listeners) {
            listeners.delete(listener);
        }
    }
    
    /**
     * Emit an event
     */
    public emit<K extends keyof TEventMap>(
        eventName: K, 
        data: TEventMap[K]
    ): void {
        const listeners = this.eventListeners.get(eventName);
        if (listeners) {
            listeners.forEach((listener) => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`Error in event listener for ${String(eventName)}:`, error);
                }
            });
        }
    }
    
    /**
     * Remove all listeners for an event
     */
    public removeAllListeners<K extends keyof TEventMap>(eventName: K): void {
        this.eventListeners.delete(eventName);
    }
    
    /**
     * Get the number of listeners for an event
     */
    public getListenerCount<K extends keyof TEventMap>(eventName: K): number {
        const listeners = this.eventListeners.get(eventName);
        return listeners ? listeners.size : 0;
    }
}

/**
 * Framework error types
 */
export class FrameworkError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'FrameworkError';
    }
}

export class ActorError extends FrameworkError {
    constructor(
        message: string,
        public readonly actorId: string,
        context?: Record<string, unknown>
    ) {
        super(message, 'ACTOR_ERROR', { actorId, ...context });
        this.name = 'ActorError';
    }
}

export class ComponentError extends FrameworkError {
    constructor(
        message: string,
        public readonly componentTagName: string,
        context?: Record<string, unknown>
    ) {
        super(message, 'COMPONENT_ERROR', { componentTagName, ...context });
        this.name = 'ComponentError';
    }
}

export class ControllerError extends FrameworkError {
    constructor(
        message: string,
        public readonly controllerId: string,
        context?: Record<string, unknown>
    ) {
        super(message, 'CONTROLLER_ERROR', { controllerId, ...context });
        this.name = 'ControllerError';
    }
} 
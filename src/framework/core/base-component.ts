/**
 * Base Component class providing common functionality for all framework web components
 * This class implements the View layer in the Actor Model pattern
 */
export abstract class BaseComponent extends HTMLElement {
    protected isInitialized = false;
    protected useShadowDOM = false;

    /**
     * Abstract properties that must be implemented by subclasses
     */
    abstract readonly tagName: string;

    constructor() {
        super();
        
        // Setup shadow DOM if enabled
        if (this.useShadowDOM) {
            this.attachShadow({ mode: 'open' });
        }
    }

    /**
     * Web Component lifecycle: called when element is added to the DOM
     */
    connectedCallback(): void {
        if (!this.isInitialized) {
            this.initialize();
        }
    }

    /**
     * Web Component lifecycle: called when element is removed from the DOM
     */
    disconnectedCallback(): void {
        this.cleanup();
    }

    /**
     * Web Component lifecycle: called when observed attributes change
     */
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        this.onAttributeChanged(name, oldValue, newValue);
    }

    /**
     * Initialize the component
     */
    protected initialize(): void {
        try {
            // Setup component features
            this.setupAccessibility();
            this.setupEventListeners();
            this.render();
            
            this.isInitialized = true;
            console.log(`Component ${this.tagName} initialized successfully`);
        } catch (error) {
            this.handleInitializationError(error);
        }
    }

    /**
     * Render the component
     */
    protected abstract render(): void;

    /**
     * Setup accessibility features
     */
    protected setupAccessibility(): void {
        // Default accessibility setup - override in subclasses
        this.setupARIADefaults();
        this.setupKeyboardNavigation();
    }

    /**
     * Setup event listeners
     */
    protected setupEventListeners(): void {
        // Override in subclasses for specific event handling
    }

    /**
     * Setup default ARIA attributes
     */
    protected setupARIADefaults(): void {
        // Ensure component has proper role if not set
        if (!this.getAttribute('role')) {
            const defaultRole = this.getDefaultRole();
            if (defaultRole) {
                this.setAttribute('role', defaultRole);
            }
        }
    }

    /**
     * Setup keyboard navigation
     */
    protected setupKeyboardNavigation(): void {
        // Default keyboard navigation - override in subclasses
        this.addEventListener('keydown', (event) => {
            this.handleKeydown(event);
        });
    }

    /**
     * Handle keydown events
     */
    protected handleKeydown(event: KeyboardEvent): void {
        // Override in subclasses for specific keyboard handling
    }

    /**
     * Get default ARIA role for this component
     */
    protected getDefaultRole(): string | null {
        return null;
    }

    /**
     * Handle attribute changes
     */
    protected onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): void {
        // Override in subclasses for specific attribute handling
    }

    /**
     * Update component state based on data attributes
     */
    protected updateFromDataState(state: string): void {
        // Override in subclasses to handle data-state changes
    }

    /**
     * Emit custom event
     */
    protected emit<T = any>(eventName: string, detail?: T, options?: CustomEventInit): void {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true,
            ...options
        });
        this.dispatchEvent(event);
    }

    /**
     * Query selector within component (shadow DOM aware)
     */
    protected query<T extends HTMLElement = HTMLElement>(selector: string): T | null {
        const root = this.shadowRoot || this;
        return root.querySelector<T>(selector);
    }

    /**
     * Query all selectors within component (shadow DOM aware)
     */
    protected queryAll<T extends HTMLElement = HTMLElement>(selector: string): NodeListOf<T> {
        const root = this.shadowRoot || this;
        return root.querySelectorAll<T>(selector);
    }

    /**
     * Create HTML element with attributes
     */
    protected createElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        attributes?: Record<string, string | boolean | number>,
        textContent?: string
    ): HTMLElementTagNameMap[K] {
        const element = document.createElement(tagName);
        
        if (attributes) {
            for (const [key, value] of Object.entries(attributes)) {
                if (typeof value === 'boolean') {
                    if (value) {
                        element.setAttribute(key, '');
                    }
                } else {
                    element.setAttribute(key, String(value));
                }
            }
        }
        
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    }

    /**
     * Safely set innerHTML with XSS protection
     */
    protected setInnerHTML(html: string): void {
        // Basic XSS protection - in production, use a library like DOMPurify
        const sanitizedHTML = this.sanitizeHTML(html);
        
        const root = this.shadowRoot || this;
        root.innerHTML = sanitizedHTML;
    }

    /**
     * Basic HTML sanitization (use DOMPurify in production)
     */
    protected sanitizeHTML(html: string): string {
        // Basic sanitization - replace with proper sanitization library
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }

    /**
     * Check if component is in development mode
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
        console.error(`Failed to initialize component ${this.tagName}:`, error);
        this.setupFallbackBehavior();
    }

    /**
     * Setup fallback behavior when initialization fails
     */
    protected setupFallbackBehavior(): void {
        // Override in subclasses for specific fallback behaviors
        this.innerHTML = '<div role="alert">Component failed to load</div>';
    }

    /**
     * Cleanup resources
     */
    protected cleanup(): void {
        // Override in subclasses for specific cleanup
        this.isInitialized = false;
    }

    /**
     * Get component system info for debugging
     */
    public getSystemInfo(): ComponentSystemInfo {
        return {
            tagName: this.tagName,
            isInitialized: this.isInitialized,
            isConnected: this.isConnected,
            hasShadowRoot: !!this.shadowRoot,
            attributeCount: this.attributes.length,
            childElementCount: this.childElementCount
        };
    }
}

/**
 * Component system information interface
 */
export interface ComponentSystemInfo {
    tagName: string;
    isInitialized: boolean;
    isConnected: boolean;
    hasShadowRoot: boolean;
    attributeCount: number;
    childElementCount: number;
}

/**
 * Type utilities for framework components
 */
export type FrameworkComponent = BaseComponent;

export type ComponentInitializer<T extends BaseComponent> = (component: T) => void;

/**
 * Decorator for defining custom elements
 */
export function defineElement(tagName: string) {
    return function <T extends CustomElementConstructor>(constructor: T): T {
        if (!customElements.get(tagName)) {
            customElements.define(tagName, constructor);
        }
        return constructor;
    };
}

/**
 * Utility for creating reactive property decorators
 */
export function reactiveProperty(options: PropertyDescriptor & { reflect?: boolean } = {}) {
    return function (target: any, propertyKey: string): void {
        const descriptor: PropertyDescriptor = {
            get(this: BaseComponent): any {
                return this.getAttribute(propertyKey);
            },
            set(this: BaseComponent, value: any): void {
                if (value == null) {
                    this.removeAttribute(propertyKey);
                } else {
                    this.setAttribute(propertyKey, String(value));
                }
                if (options.reflect) {
                    this.attributeChangedCallback(propertyKey, null, String(value));
                }
            },
            enumerable: true,
            configurable: true,
            ...options
        };
        
        Object.defineProperty(target, propertyKey, descriptor);
    };
} 
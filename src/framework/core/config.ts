/**
 * Framework Configuration System
 * Provides centralized configuration for all framework features
 */

/**
 * Framework configuration options
 */
export interface FrameworkOptions {
    /** Development mode settings */
    development?: {
        enableDevTools?: boolean;
        enableInspector?: boolean;
        verboseLogging?: boolean;
    };
    
    /** Actor system configuration */
    actors?: ActorSystemOptions;
    
    /** Component system configuration */
    components?: ComponentSystemOptions;
    
    /** Error handling configuration */
    errorHandling?: {
        enableErrorBoundaries?: boolean;
        maxRetries?: number;
        enableErrorTracking?: boolean;
        errorTrackingService?: string;
    };
    
    /** Performance configuration */
    performance?: {
        enableLazyLoading?: boolean;
        preloadCriticalActors?: boolean;
        bundleAnalysis?: boolean;
    };
    
    /** Accessibility configuration */
    accessibility?: {
        enableARIAAutomation?: boolean;
        enableFocusManagement?: boolean;
        enableKeyboardNavigation?: boolean;
        announceStateChanges?: boolean;
    };
    
    /** Security configuration */
    security?: {
        enableCSP?: boolean;
        enableXSSProtection?: boolean;
        sanitizeHTML?: boolean;
        allowedDomains?: string[];
    };
}

/**
 * Actor system configuration options
 */
export interface ActorSystemOptions {
    /** Enable actor persistence */
    enablePersistence?: boolean;
    
    /** Default actor options */
    defaultActorOptions?: {
        enableInspection?: boolean;
        enableDevTools?: boolean;
        enableErrorBoundaries?: boolean;
    };
    
    /** Actor communication options */
    communication?: {
        enableEventBus?: boolean;
        enableCrossTabSync?: boolean;
        enableRealTimeSync?: boolean;
    };
    
    /** Performance options */
    performance?: {
        enableLazyInitialization?: boolean;
        enableActorPooling?: boolean;
        maxConcurrentActors?: number;
    };
}

/**
 * Component system configuration options
 */
export interface ComponentSystemOptions {
    /** Default component options */
    defaultComponentOptions?: {
        useShadowDOM?: boolean;
        enableAccessibility?: boolean;
        enableAutoRegistration?: boolean;
    };
    
    /** Component lifecycle options */
    lifecycle?: {
        enableLifecycleHooks?: boolean;
        enableAsyncInitialization?: boolean;
        enableGracefulCleanup?: boolean;
    };
    
    /** Styling options */
    styling?: {
        enableScopedStyles?: boolean;
        enableThemeSupport?: boolean;
        enableCSSCustomProperties?: boolean;
    };
}

/**
 * Framework Configuration Class
 */
export class FrameworkConfig {
    private static instance: FrameworkConfig;
    private config: FrameworkOptions;
    
    private constructor() {
        this.config = this.getDefaultConfig();
    }
    
    /**
     * Get the singleton instance
     */
    public static getInstance(): FrameworkConfig {
        if (!FrameworkConfig.instance) {
            FrameworkConfig.instance = new FrameworkConfig();
        }
        return FrameworkConfig.instance;
    }
    
    /**
     * Get default configuration
     */
    private getDefaultConfig(): FrameworkOptions {
        return {
            development: {
                enableDevTools: true,
                enableInspector: true,
                verboseLogging: false
            },
            actors: {
                enablePersistence: false,
                defaultActorOptions: {
                    enableInspection: true,
                    enableDevTools: true,
                    enableErrorBoundaries: true
                },
                communication: {
                    enableEventBus: true,
                    enableCrossTabSync: false,
                    enableRealTimeSync: false
                },
                performance: {
                    enableLazyInitialization: true,
                    enableActorPooling: false,
                    maxConcurrentActors: 50
                }
            },
            components: {
                defaultComponentOptions: {
                    useShadowDOM: false,
                    enableAccessibility: true,
                    enableAutoRegistration: true
                },
                lifecycle: {
                    enableLifecycleHooks: true,
                    enableAsyncInitialization: false,
                    enableGracefulCleanup: true
                },
                styling: {
                    enableScopedStyles: false,
                    enableThemeSupport: true,
                    enableCSSCustomProperties: true
                }
            },
            errorHandling: {
                enableErrorBoundaries: true,
                maxRetries: 3,
                enableErrorTracking: false,
                errorTrackingService: 'console'
            },
            performance: {
                enableLazyLoading: true,
                preloadCriticalActors: true,
                bundleAnalysis: false
            },
            accessibility: {
                enableARIAAutomation: true,
                enableFocusManagement: true,
                enableKeyboardNavigation: true,
                announceStateChanges: true
            },
            security: {
                enableCSP: true,
                enableXSSProtection: true,
                sanitizeHTML: true,
                allowedDomains: []
            }
        };
    }
    
    /**
     * Configure the framework
     */
    public configure(options: Partial<FrameworkOptions>): void {
        this.config = this.mergeDeep(this.config, options);
    }
    
    /**
     * Get configuration value
     */
    public get<T>(path: string): T {
        return this.getNestedValue(this.config, path);
    }
    
    /**
     * Get entire configuration
     */
    public getAll(): FrameworkOptions {
        return { ...this.config };
    }
    
    /**
     * Check if development mode is enabled
     */
    public isDevelopment(): boolean {
        return this.get<boolean>('development.enableDevTools') || this.isLocalhost();
    }
    
    /**
     * Check if running on localhost
     */
    private isLocalhost(): boolean {
        return typeof window !== 'undefined' && 
               (window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname === '0.0.0.0');
    }
    
    /**
     * Get nested value from object using dot notation
     */
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    /**
     * Deep merge objects
     */
    private mergeDeep(target: any, source: any): any {
        const output = { ...target };
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.mergeDeep(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        return output;
    }
    
    /**
     * Check if value is an object
     */
    private isObject(item: any): boolean {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
    
    /**
     * Reset configuration to defaults
     */
    public reset(): void {
        this.config = this.getDefaultConfig();
    }
    
    /**
     * Enable development mode
     */
    public enableDevelopment(): void {
        this.configure({
            development: {
                enableDevTools: true,
                enableInspector: true,
                verboseLogging: true
            }
        });
    }
    
    /**
     * Enable production mode
     */
    public enableProduction(): void {
        this.configure({
            development: {
                enableDevTools: false,
                enableInspector: false,
                verboseLogging: false
            },
            performance: {
                enableLazyLoading: true,
                preloadCriticalActors: false,
                bundleAnalysis: false
            }
        });
    }
}

/**
 * Global configuration instance
 */
export const frameworkConfig = FrameworkConfig.getInstance();

/**
 * Utility function to configure the framework
 */
export function configureFramework(options: Partial<FrameworkOptions>): void {
    frameworkConfig.configure(options);
}

/**
 * Utility function to get configuration value
 */
export function getConfig<T>(path: string): T {
    return frameworkConfig.get<T>(path);
}

/**
 * Utility function to check if in development mode
 */
export function isDevelopment(): boolean {
    return frameworkConfig.isDevelopment();
} 
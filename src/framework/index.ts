/**
 * Actor-SPA Framework
 * A TypeScript framework for building SPAs with actor-based state management
 * 
 * This framework follows the hybrid approach: building reusable patterns
 * through concrete portfolio features while maintaining clean separation
 * of concerns between View, Controller, and Model layers.
 */

// Core Framework Exports
export * from './core/index.js';

// Router Module (will be created in Phase 0.2)
// export * from './router/index.js';

// UI Orchestrator Module (will be created in Phase 0.2) 
// export * from './ui-orchestrator/index.js';

// Patterns Module (will be created as patterns emerge)
// export * from './patterns/index.js';

/**
 * Framework version information
 */
export const FRAMEWORK_VERSION = '0.1.0';
export const FRAMEWORK_NAME = 'Actor-SPA Framework';

/**
 * Framework initialization function
 * This sets up the framework with default configuration
 */
export function initializeFramework(options?: {
    development?: boolean;
    enableDevTools?: boolean;
    verboseLogging?: boolean;
}): void {
    // Dynamic imports to avoid circular dependencies
    Promise.all([
        import('./core/config.js'),
        import('./core/utils.js')
    ]).then(([configModule, utilsModule]) => {
        const { configureFramework } = configModule;
        const { isDevelopmentEnvironment } = utilsModule;
        
        // Configure framework based on environment and options
        const isDevelopment = options?.development ?? isDevelopmentEnvironment();
        
        configureFramework({
            development: {
                enableDevTools: options?.enableDevTools ?? isDevelopment,
                enableInspector: isDevelopment,
                verboseLogging: options?.verboseLogging ?? false
            },
            actors: {
                enablePersistence: false,
                defaultActorOptions: {
                    enableInspection: isDevelopment,
                    enableDevTools: isDevelopment,
                    enableErrorBoundaries: true
                }
            },
            components: {
                defaultComponentOptions: {
                    useShadowDOM: false,
                    enableAccessibility: true,
                    enableAutoRegistration: true
                }
            },
            errorHandling: {
                enableErrorBoundaries: true,
                maxRetries: 3,
                enableErrorTracking: !isDevelopment
            },
            accessibility: {
                enableARIAAutomation: true,
                enableFocusManagement: true,
                enableKeyboardNavigation: true,
                announceStateChanges: true
            }
        });
        
        if (isDevelopment) {
            console.log(`${FRAMEWORK_NAME} v${FRAMEWORK_VERSION} initialized in development mode`);
        }
    });
} 
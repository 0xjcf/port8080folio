// Development Configuration & Feature Flags
// This module provides a centralized way to manage development features and debugging

// Type definitions
export interface FeatureFlags {
    // Debugging flags
    enableDebugLogs: boolean;
    enableMobileNavTesting: boolean;
    enablePerformanceLogging: boolean;
    enableStateLogging: boolean;

    // UI flags
    showDebugPanel: boolean;
    showScreenDimensions: boolean;
    showTouchTargets: boolean;

    // Development tools
    enableHotReload: boolean;
    enableErrorOverlay: boolean;
    enableDevConsoleMessages: boolean;
}

export type FeatureFlagKey = keyof FeatureFlags;
export type ViewportType = 'Mobile' | 'Tablet' | 'Desktop';

// Global window extensions
declare global {
    interface Window {
        dev: {
            config: DevConfig;
            flags: FeatureFlags;
            enable: (feature: FeatureFlagKey) => void;
            disable: (feature: FeatureFlagKey) => void;
            toggle: (feature: FeatureFlagKey) => boolean;
            showDebugPanel: () => void;
            hideDebugPanel: () => void;
            toggleDebugPanel: () => boolean;
            testMobileNav: () => void;
            enableLegacyMobileNav: () => void;
        };
    }
}

export class DevConfig {
    public readonly isDevelopment: boolean;
    public features: FeatureFlags;

    constructor() {
        this.isDevelopment = this.detectDevelopmentMode();
        this.features = this.loadFeatureFlags();

        if (this.isDevelopment) {
            this.setupDevelopmentEnvironment();
        }
    }

    private detectDevelopmentMode(): boolean {
        return (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('.local') ||
            window.location.protocol === 'file:' ||
            window.location.search.includes('dev=true') ||
            sessionStorage.getItem('dev-mode') === 'true'
        );
    }

    private loadFeatureFlags(): FeatureFlags {
        const defaultFlags: FeatureFlags = {
            // Debugging flags
            enableDebugLogs: true,
            enableMobileNavTesting: true,
            enablePerformanceLogging: true,
            enableStateLogging: true,

            // UI flags
            showDebugPanel: false,
            showScreenDimensions: false,
            showTouchTargets: false,

            // Development tools
            enableHotReload: true,
            enableErrorOverlay: true,
            enableDevConsoleMessages: true
        };

        // Override with URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const overrides: Partial<FeatureFlags> = {};

        for (const [key, defaultValue] of Object.entries(defaultFlags)) {
            if (urlParams.has(key)) {
                overrides[key as FeatureFlagKey] = urlParams.get(key) === 'true';
            }
        }

        // Override with sessionStorage
        const sessionOverrides: Partial<FeatureFlags> = JSON.parse(
            sessionStorage.getItem('dev-flags') || '{}'
        );

        return { ...defaultFlags, ...sessionOverrides, ...overrides };
    }

    public isEnabled(feature: FeatureFlagKey): boolean {
        return this.isDevelopment && this.features[feature];
    }

    public enable(feature: FeatureFlagKey): void {
        if (this.isDevelopment) {
            this.features[feature] = true;
            this.saveFeatureFlags();
        }
    }

    public disable(feature: FeatureFlagKey): void {
        if (this.isDevelopment) {
            this.features[feature] = false;
            this.saveFeatureFlags();
        }
    }

    public toggle(feature: FeatureFlagKey): boolean {
        if (this.isDevelopment) {
            this.features[feature] = !this.features[feature];
            this.saveFeatureFlags();
            return this.features[feature];
        }
        return false;
    }

    private saveFeatureFlags(): void {
        sessionStorage.setItem('dev-flags', JSON.stringify(this.features));
    }

    private setupDevelopmentEnvironment(): void {
        // Add global dev object for console access
        window.dev = {
            config: this,
            flags: this.features,
            enable: (feature: FeatureFlagKey) => this.enable(feature),
            disable: (feature: FeatureFlagKey) => this.disable(feature),
            toggle: (feature: FeatureFlagKey) => this.toggle(feature),

            // Quick access methods
            showDebugPanel: () => this.enable('showDebugPanel'),
            hideDebugPanel: () => this.disable('showDebugPanel'),
            toggleDebugPanel: () => this.toggle('showDebugPanel'),

            // Mobile nav testing
            testMobileNav: () => {
                const event = new CustomEvent('mobile-nav-toggle', {
                    detail: { source: 'dev-console' }
                });
                document.dispatchEvent(event);
            },

            // Emergency fallback to old mobile nav system
            enableLegacyMobileNav: () => {
                console.warn('🔄 Enabling legacy mobile nav system - this will cause conflicts!');
                console.warn('This should only be used if the current system completely fails');
                // This would require modifying ui-orchestrator.js to re-enable the old system
                sessionStorage.setItem('use-legacy-mobile-nav', 'true');
                location.reload();
            }
        };

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Development console messages
        if (this.isEnabled('enableDevConsoleMessages')) {
            this.showWelcomeMessage();
        }
    }

    private setupKeyboardShortcuts(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            // Ctrl+Shift+D - Toggle dev mode
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
                const newMode = sessionStorage.getItem('dev-mode') !== 'true';
                sessionStorage.setItem('dev-mode', newMode.toString());
                location.reload();
                e.preventDefault();
            }

            // Ctrl+Shift+P - Toggle debug panel
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
                this.toggle('showDebugPanel');
                this.updateDebugPanel();
                e.preventDefault();
            }

            // Ctrl+Shift+L - Toggle debug logs
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
                const newState = this.toggle('enableDebugLogs');
                console.log(`Debug logs ${newState ? 'enabled' : 'disabled'}`);
                e.preventDefault();
            }
        });
    }

    private updateDebugPanel(): void {
        const existingPanel = document.getElementById('dev-debug-panel');

        if (this.isEnabled('showDebugPanel')) {
            if (!existingPanel) {
                this.createDebugPanel();
            }
        } else {
            if (existingPanel) {
                existingPanel.remove();
            }
        }
    }

    private createDebugPanel(): void {
        const panel = document.createElement('div');
        panel.id = 'dev-debug-panel';
        panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 1rem;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      border: 1px solid #333;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    `;

        panel.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 10px; color: #0D99FF;">
        🛠️ Development Panel
      </div>
      <div style="margin-bottom: 8px;">
        Screen: ${window.innerWidth}x${window.innerHeight}
      </div>
      <div style="margin-bottom: 8px;">
        Viewport: ${this.getViewportType()}
      </div>
      <div style="margin-bottom: 10px;">
        Nav Element: ${!!document.querySelector('nav-bar') ? '✅' : '❌'}
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 10px;">
        ${Object.entries(this.features).map(([key, value]) => `
          <label style="display: flex; align-items: center; gap: 4px; font-size: 10px;">
            <input type="checkbox" ${value ? 'checked' : ''} 
                   onchange="window.dev.toggle('${key}'); window.dev.config.updateDebugPanel()">
            ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </label>
        `).join('')}
      </div>
      <div style="font-size: 10px; color: #888;">
        Ctrl+Shift+P to toggle • Ctrl+Shift+L for logs
      </div>
    `;

        document.body.appendChild(panel);
    }

    private getViewportType(): ViewportType {
        const width = window.innerWidth;
        if (width < 768) return 'Mobile';
        if (width < 1024) return 'Tablet';
        return 'Desktop';
    }

    private showWelcomeMessage(): void {
        console.log(
            '%c🛠️ Development Mode Active',
            'color: #0D99FF; font-size: 16px; font-weight: bold;'
        );
        console.log(
            '%cType window.dev to access development tools',
            'color: #47B4FF; font-size: 12px;'
        );
        console.log('Available shortcuts:');
        console.log('  Ctrl+Shift+D - Toggle dev mode');
        console.log('  Ctrl+Shift+P - Toggle debug panel');
        console.log('  Ctrl+Shift+L - Toggle debug logs');
    }

    // Conditional logging methods
    public log(message: string, ...args: any[]): void {
        if (this.isEnabled('enableDebugLogs')) {
            console.log(`[DEV] ${message}`, ...args);
        }
    }

    public warn(message: string, ...args: any[]): void {
        if (this.isEnabled('enableDebugLogs')) {
            console.warn(`[DEV] ${message}`, ...args);
        }
    }

    public error(message: string, ...args: any[]): void {
        if (this.isEnabled('enableDebugLogs')) {
            console.error(`[DEV] ${message}`, ...args);
        }
    }
}

// Create global instance
export const devConfig = new DevConfig(); 
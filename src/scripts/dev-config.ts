// Development Configuration & Feature Flags
// This module provides a centralized way to manage development features and debugging

import { assign, createActor, type SnapshotFrom, setup } from 'xstate';
import { createComponent, html } from '../framework/core/index.js';

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

// Development state context
interface DevContext {
  isDevelopment: boolean;
  features: FeatureFlags;
  viewport: ViewportType;
  screenDimensions: { width: number; height: number };
  navElementDetected: boolean; // Informational, not behavioral state
}

// Development events
type DevEvent =
  | { type: 'TOGGLE_FEATURE'; feature: FeatureFlagKey }
  | { type: 'ENABLE_FEATURE'; feature: FeatureFlagKey }
  | { type: 'DISABLE_FEATURE'; feature: FeatureFlagKey }
  | { type: 'TOGGLE_DEBUG_PANEL' }
  | { type: 'SHOW_DEBUG_PANEL' }
  | { type: 'HIDE_DEBUG_PANEL' }
  | { type: 'UPDATE_VIEWPORT' }
  | { type: 'TEST_MOBILE_NAV' }
  | { type: 'ENABLE_LEGACY_NAV' }
  | { type: 'KEYBOARD_SHORTCUT'; key: string; ctrlKey: boolean; shiftKey: boolean };

// Global window extensions
declare global {
  interface Window {
    dev: {
      enable: (feature: FeatureFlagKey) => void;
      disable: (feature: FeatureFlagKey) => void;
      toggle: (feature: FeatureFlagKey) => boolean;
      showDebugPanel: () => void;
      hideDebugPanel: () => void;
      toggleDebugPanel: () => boolean;
      testMobileNav: () => void;
      enableLegacyMobileNav: () => void;
    };
    globalEventDelegation?: {
      subscribeKeyboard: (config: {
        key: string;
        action: string;
        callback: (action: string, event: Event) => void;
      }) => void;
    };
  }
}

// Development state machine
const devMachine = setup({
  types: {
    context: {} as DevContext,
    events: {} as DevEvent,
  },
  actions: {
    toggleFeature: assign({
      features: ({ context, event }) => {
        if (event.type === 'TOGGLE_FEATURE') {
          const newFeatures = { ...context.features };
          newFeatures[event.feature] = !newFeatures[event.feature];
          saveFeatureFlags(newFeatures);
          return newFeatures;
        }
        return context.features;
      },
    }),
    enableFeature: assign({
      features: ({ context, event }) => {
        if (event.type === 'ENABLE_FEATURE') {
          const newFeatures = { ...context.features };
          newFeatures[event.feature] = true;
          saveFeatureFlags(newFeatures);
          return newFeatures;
        }
        return context.features;
      },
    }),
    disableFeature: assign({
      features: ({ context, event }) => {
        if (event.type === 'DISABLE_FEATURE') {
          const newFeatures = { ...context.features };
          newFeatures[event.feature] = false;
          saveFeatureFlags(newFeatures);
          return newFeatures;
        }
        return context.features;
      },
    }),
    updateViewport: assign({
      viewport: () => getViewportType(),
      screenDimensions: () => ({ width: window.innerWidth, height: window.innerHeight }),
      navElementDetected: () => {
        // Use reactive ref instead of DOM query
        return typeof window !== 'undefined' && window.customElements?.get('nav-bar') !== undefined;
      },
    }),
    handleKeyboardShortcut: ({ event, self }) => {
      if (event.type === 'KEYBOARD_SHORTCUT') {
        const { key, ctrlKey, shiftKey } = event;

        if (ctrlKey && shiftKey && key.toLowerCase() === 'd') {
          const newMode = sessionStorage.getItem('dev-mode') !== 'true';
          sessionStorage.setItem('dev-mode', newMode.toString());
          location.reload();
        }

        if (ctrlKey && shiftKey && key.toLowerCase() === 'p') {
          self.send({ type: 'TOGGLE_DEBUG_PANEL' });
        }

        if (ctrlKey && shiftKey && key.toLowerCase() === 'l') {
          self.send({ type: 'TOGGLE_FEATURE', feature: 'enableDebugLogs' });
        }
      }
    },
    testMobileNav: () => {
      // Use framework event bus instead of direct DOM manipulation
      if (typeof window !== 'undefined' && window.globalEventBus) {
        window.globalEventBus.emit('mobile-nav-toggle', { source: 'dev-console' });
      }
    },
    enableLegacyNav: () => {
      sessionStorage.setItem('use-legacy-mobile-nav', 'true');
      location.reload();
    },
  },
}).createMachine({
  id: 'dev-config',
  initial: 'ready',
  context: {
    isDevelopment: detectDevelopmentMode(),
    features: loadFeatureFlags(),
    viewport: getViewportType(),
    screenDimensions: { width: window.innerWidth, height: window.innerHeight },
    navElementDetected: false,
  },
  states: {
    ready: {
      initial: 'panelHidden',
      entry: ['updateViewport'],
      on: {
        TOGGLE_FEATURE: { actions: 'toggleFeature' },
        ENABLE_FEATURE: { actions: 'enableFeature' },
        DISABLE_FEATURE: { actions: 'disableFeature' },
        UPDATE_VIEWPORT: { actions: 'updateViewport' },
        TEST_MOBILE_NAV: { actions: 'testMobileNav' },
        ENABLE_LEGACY_NAV: { actions: 'enableLegacyNav' },
        KEYBOARD_SHORTCUT: { actions: 'handleKeyboardShortcut' },
      },
      states: {
        panelHidden: {
          on: {
            TOGGLE_DEBUG_PANEL: 'panelVisible',
            SHOW_DEBUG_PANEL: 'panelVisible',
          },
        },
        panelVisible: {
          on: {
            TOGGLE_DEBUG_PANEL: 'panelHidden',
            HIDE_DEBUG_PANEL: 'panelHidden',
          },
        },
      },
    },
  },
});

// Helper functions
function detectDevelopmentMode(): boolean {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local') ||
    window.location.protocol === 'file:' ||
    window.location.search.includes('dev=true') ||
    sessionStorage.getItem('dev-mode') === 'true'
  );
}

function loadFeatureFlags(): FeatureFlags {
  const defaultFlags: FeatureFlags = {
    enableDebugLogs: true,
    enableMobileNavTesting: true,
    enablePerformanceLogging: true,
    enableStateLogging: true,
    showDebugPanel: false,
    showScreenDimensions: false,
    showTouchTargets: false,
    enableHotReload: true,
    enableErrorOverlay: true,
    enableDevConsoleMessages: true,
  };

  const urlParams = new URLSearchParams(window.location.search);
  const overrides: Partial<FeatureFlags> = {};

  for (const [key, _defaultValue] of Object.entries(defaultFlags)) {
    if (urlParams.has(key)) {
      overrides[key as FeatureFlagKey] = urlParams.get(key) === 'true';
    }
  }

  const sessionOverrides: Partial<FeatureFlags> = JSON.parse(
    sessionStorage.getItem('dev-flags') || '{}'
  );

  return { ...defaultFlags, ...sessionOverrides, ...overrides };
}

function saveFeatureFlags(features: FeatureFlags): void {
  sessionStorage.setItem('dev-flags', JSON.stringify(features));
}

function getViewportType(): ViewportType {
  const width = window.innerWidth;
  if (width < 768) return 'Mobile';
  if (width < 1024) return 'Tablet';
  return 'Desktop';
}

// Feature flag check templates
const renderFeatureFlag = (key: FeatureFlagKey, value: boolean) => html`
  <label class="feature-flag">
    <input 
      type="checkbox" 
      ${value ? 'checked' : ''}
      send:change="TOGGLE_FEATURE"
      feature=${key}
    />
    <span class="feature-label">
      ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}
    </span>
  </label>
`;

// Helper to render debug panel content
const renderDebugPanelContent = (state: SnapshotFrom<typeof devMachine>) => html`
  <div class="dev-debug-panel">
    <div class="panel-header">
      🛠️ Development Panel
    </div>
    <div class="panel-info">
      <div class="info-row">
        Screen: ${state.context.screenDimensions.width}x${state.context.screenDimensions.height}
      </div>
      <div class="info-row">
        Viewport: ${state.context.viewport}
      </div>
      <div class="info-row">
        Nav Element: ${state.context.navElementDetected ? '✅' : '❌'}
      </div>
    </div>
    <div class="feature-flags">
      ${Object.entries(state.context.features).map(([key, value]) =>
        renderFeatureFlag(key as FeatureFlagKey, value as boolean)
      )}
    </div>
    <div class="panel-footer">
      Ctrl+Shift+P to toggle • Ctrl+Shift+L for logs
    </div>
  </div>
`;

// Debug panel template
const debugPanelTemplate = (state: SnapshotFrom<typeof devMachine>) => html`
  ${state.matches({ ready: 'panelVisible' }) ? renderDebugPanelContent(state) : ''}
`;

// Component styles
const debugPanelStyles = `
  .dev-debug-panel {
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
  }

  .panel-header {
    font-weight: bold;
    margin-bottom: 10px;
    color: #0D99FF;
  }

  .panel-info {
    margin-bottom: 10px;
  }

  .info-row {
    margin-bottom: 8px;
  }

  .feature-flags {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    margin-bottom: 10px;
  }

  .feature-flag {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    cursor: pointer;
  }

  .feature-label {
    user-select: none;
  }

  .panel-footer {
    font-size: 10px;
    color: #888;
  }
`;

// Create debug panel component
const _DebugPanelComponent = createComponent({
  machine: devMachine,
  template: debugPanelTemplate,
  styles: debugPanelStyles,
  tagName: 'dev-debug-panel',
});

// Development configuration API
export class DevConfig {
  public readonly isDevelopment: boolean;
  private actor: ReturnType<typeof createActor<typeof devMachine>> | null = null;

  constructor() {
    this.isDevelopment = detectDevelopmentMode();

    if (this.isDevelopment) {
      this.actor = createActor(devMachine);
      this.actor.start();
      this.setupDevelopmentEnvironment();
    }
  }

  public isEnabled(feature: FeatureFlagKey): boolean {
    if (!this.isDevelopment || !this.actor) return false;
    return this.actor.getSnapshot().context.features[feature];
  }

  public enable(feature: FeatureFlagKey): void {
    if (this.isDevelopment && this.actor) {
      this.actor.send({ type: 'ENABLE_FEATURE', feature });
    }
  }

  public disable(feature: FeatureFlagKey): void {
    if (this.isDevelopment && this.actor) {
      this.actor.send({ type: 'DISABLE_FEATURE', feature });
    }
  }

  public toggle(feature: FeatureFlagKey): boolean {
    if (this.isDevelopment && this.actor) {
      this.actor.send({ type: 'TOGGLE_FEATURE', feature });
      return this.actor.getSnapshot().context.features[feature];
    }
    return false;
  }

  private setupDevelopmentEnvironment(): void {
    // Add global dev object for console access
    window.dev = {
      enable: (feature: FeatureFlagKey) => this.enable(feature),
      disable: (feature: FeatureFlagKey) => this.disable(feature),
      toggle: (feature: FeatureFlagKey) => this.toggle(feature),
      showDebugPanel: () => this.actor?.send({ type: 'SHOW_DEBUG_PANEL' }),
      hideDebugPanel: () => this.actor?.send({ type: 'HIDE_DEBUG_PANEL' }),
      toggleDebugPanel: () => {
        this.actor?.send({ type: 'TOGGLE_DEBUG_PANEL' });
        return this.actor?.getSnapshot().context.features.showDebugPanel || false;
      },
      testMobileNav: () => this.actor?.send({ type: 'TEST_MOBILE_NAV' }),
      enableLegacyMobileNav: () => this.actor?.send({ type: 'ENABLE_LEGACY_NAV' }),
    };

    // Setup reactive keyboard shortcuts
    this.setupReactiveKeyboardShortcuts();

    // Debug panel will be registered automatically as a custom element
    // Components can include <dev-debug-panel></dev-debug-panel> in their templates

    // Development console messages
    if (this.isEnabled('enableDevConsoleMessages')) {
      this.showWelcomeMessage();
    }
  }

  private setupReactiveKeyboardShortcuts(): void {
    // Use global event delegation from framework
    if (typeof window !== 'undefined' && window.globalEventDelegation) {
      const ged = window.globalEventDelegation;
      ged.subscribeKeyboard({
        key: '*', // Listen to all keys
        action: 'DEV_KEYBOARD_SHORTCUT',
        callback: (_action: string, event: Event) => {
          const e = event as KeyboardEvent;
          if (this.actor) {
            this.actor.send({
              type: 'KEYBOARD_SHORTCUT',
              key: e.key,
              ctrlKey: e.ctrlKey,
              shiftKey: e.shiftKey,
            });

            // Prevent default for handled shortcuts
            if (e.ctrlKey && e.shiftKey && ['d', 'p', 'l'].includes(e.key.toLowerCase())) {
              e.preventDefault();
            }
          }
        },
      });
    }
  }

  private showWelcomeMessage(): void {
    // Keep minimal - no DOM manipulation needed
  }

  // Conditional logging methods
  public log(_message: string, ..._args: unknown[]): void {
    if (this.isEnabled('enableDebugLogs')) {
      // Logging logic would go here
    }
  }

  public warn(_message: string, ..._args: unknown[]): void {
    if (this.isEnabled('enableDebugLogs')) {
      // Warning logic would go here
    }
  }

  public error(_message: string, ..._args: unknown[]): void {
    if (this.isEnabled('enableDebugLogs')) {
      // Error logic would go here
    }
  }
}

// Create global instance
export const devConfig = new DevConfig();

import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, css, html, storageHelpers } from '../../framework/core/index.js';

// Type definitions
type ConsentStatus = 'accepted' | 'declined';
type ConsentSource = 'accept-button' | 'customize-panel' | 'expired-reset';

interface ConsentData {
  consent: ConsentStatus;
  date: string;
  expiryDate: string;
}

// Custom events for external listeners
interface ConsentUpdatedEvent extends CustomEvent {
  detail: {
    consent: ConsentStatus;
    source: ConsentSource;
    timestamp: string;
  };
}

interface ConsentExpiredEvent extends CustomEvent {
  detail: {
    expiredDate: string;
    resetTimestamp: string;
  };
}

// ✅ Analytics service following reactive patterns
interface AnalyticsService {
  enableAnalytics: () => void;
  disableAnalytics: () => void;
}

const createAnalyticsService = (): AnalyticsService => ({
  enableAnalytics: () => {
    // Safely access window properties for Google Analytics control
    const globalWindow = window as unknown as Record<string, unknown>;
    try {
      delete globalWindow['ga-disable-G-5TR1LWNXXY'];
      // Only reload if gtag is not loaded - this ensures analytics starts working
      if (typeof globalWindow.gtag === 'undefined') {
        location.reload();
      }
    } catch {
      // Silently handle any errors during analytics re-enabling
    }
  },
  disableAnalytics: () => {
    // Safely access window properties for Google Analytics control
    const globalWindow = window as unknown as Record<string, unknown>;
    try {
      globalWindow['ga-disable-G-5TR1LWNXXY'] = true;
    } catch {
      // Silently handle any errors during analytics disabling
    }
  },
});

// Initialize analytics service
const analyticsService = createAnalyticsService();

// Privacy Notice State Machine
const privacyMachine = setup({
  types: {
    context: {} as {
      // ✅ FIXED: Removed isVisible boolean - use machine states instead
      consentData: ConsentData | null;
      showCustomizePanel: boolean;
      analyticsEnabled: boolean;
    },
    events: {} as
      | { type: 'SHOW_NOTICE' }
      | { type: 'HIDE_NOTICE' }
      | { type: 'ACCEPT_ALL' }
      | { type: 'TOGGLE_CUSTOMIZE' }
      | { type: 'TOGGLE_ANALYTICS'; checked: boolean }
      | { type: 'SAVE_PREFERENCES' }
      | { type: 'RESET_CONSENT' }
      | { type: 'CHECK_CONSENT_STATUS' },
  },
  guards: {
    needsConsent: ({ context }) => !context.consentData,
    hasValidConsent: ({ context }) => {
      if (!context.consentData) return false;
      const expiryDate = new Date(context.consentData.expiryDate);
      return new Date() <= expiryDate;
    },
  },
  actions: {
    // ✅ FIXED: Removed isVisible assignments - state machine handles visibility
    hideNotice: assign({
      showCustomizePanel: false,
    }),
    toggleCustomizePanel: assign({
      showCustomizePanel: ({ context }) => !context.showCustomizePanel,
    }),
    updateAnalyticsPreference: assign({
      analyticsEnabled: ({ event }) => {
        if (event.type === 'TOGGLE_ANALYTICS') {
          return event.checked;
        }
        return false;
      },
    }),
    saveConsentData: assign({
      consentData: ({ event, context }) => {
        const timestamp = new Date().toISOString();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const consent: ConsentStatus =
          event.type === 'ACCEPT_ALL'
            ? 'accepted'
            : context.analyticsEnabled
              ? 'accepted'
              : 'declined';

        // Save to localStorage using framework helpers
        storageHelpers.setItem('analytics_consent', consent);
        storageHelpers.setItem('consent_date', timestamp);

        return {
          consent,
          date: timestamp,
          expiryDate: expiryDate.toISOString(),
        };
      },
    }),
    loadConsentData: assign({
      consentData: () => {
        const consentDate = storageHelpers.getItem<string>('consent_date');
        const consent = storageHelpers.getItem<ConsentStatus>('analytics_consent');

        if (consentDate && consent) {
          const expiryDate = new Date(consentDate);
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);

          return {
            consent,
            date: consentDate,
            expiryDate: expiryDate.toISOString(),
          };
        }
        return null;
      },
      analyticsEnabled: () => {
        return (
          storageHelpers.getItem<ConsentStatus>('analytics_consent', 'declined') === 'accepted'
        );
      },
    }),
    clearConsentData: assign({
      consentData: null,
      analyticsEnabled: false,
    }),
    // ✅ REPLACED: Framework event bus instead of DOM manipulation
    dispatchConsentEvent: ({ context, event }) => {
      const consentEventData = {
        consent: context.consentData?.consent || 'declined',
        source: event.type === 'ACCEPT_ALL' ? 'accept-button' : 'customize-panel',
        timestamp: new Date().toISOString(),
        componentId: 'privacy-notice',
      };

      // ✅ FRAMEWORK: Use framework event bus for global consent updates
      if (typeof window !== 'undefined' && window.globalEventBus) {
        window.globalEventBus.emit('consent-updated', consentEventData);
      }
    },
    // ✅ Use analytics service instead of direct DOM manipulation
    handleGoogleAnalytics: ({ context }) => {
      if (context.consentData?.consent === 'accepted') {
        analyticsService.enableAnalytics();
      } else {
        analyticsService.disableAnalytics();
      }
    },
  },
}).createMachine({
  id: 'privacy-notice',
  initial: 'checking',
  context: {
    // ✅ FIXED: Removed isVisible - use machine states instead
    consentData: null,
    showCustomizePanel: false,
    analyticsEnabled: false,
  },
  states: {
    checking: {
      entry: 'loadConsentData',
      always: [
        {
          target: 'hidden',
          guard: 'hasValidConsent',
        },
        {
          target: 'visible',
          guard: 'needsConsent',
        },
        {
          target: 'expired',
        },
      ],
    },
    hidden: {
      entry: 'hideNotice',
      on: {
        SHOW_NOTICE: 'visible',
        RESET_CONSENT: 'expired',
      },
    },
    visible: {
      // ✅ FIXED: No need for showNotice action - state indicates visibility
      on: {
        HIDE_NOTICE: 'hidden',
        ACCEPT_ALL: {
          target: 'hidden',
          actions: [
            assign({ analyticsEnabled: true }),
            'saveConsentData',
            'dispatchConsentEvent',
            'handleGoogleAnalytics',
          ],
        },
        TOGGLE_CUSTOMIZE: {
          actions: 'toggleCustomizePanel',
        },
        TOGGLE_ANALYTICS: {
          actions: 'updateAnalyticsPreference',
        },
        SAVE_PREFERENCES: {
          target: 'hidden',
          actions: ['saveConsentData', 'dispatchConsentEvent', 'handleGoogleAnalytics'],
        },
      },
    },
    expired: {
      entry: ['clearConsentData'], // ✅ FIXED: No need for showNotice action
      on: {
        ACCEPT_ALL: {
          target: 'hidden',
          actions: [
            assign({ analyticsEnabled: true }),
            'saveConsentData',
            'dispatchConsentEvent',
            'handleGoogleAnalytics',
          ],
        },
        TOGGLE_CUSTOMIZE: {
          actions: 'toggleCustomizePanel',
        },
        SAVE_PREFERENCES: {
          target: 'hidden',
          actions: ['saveConsentData', 'dispatchConsentEvent', 'handleGoogleAnalytics'],
        },
      },
    },
  },
});

// Component Styles - Following framework patterns
const privacyNoticeStyles = css`
  :host {
    --popup-bg: rgba(15, 17, 21, 0.98);
    --border-color: rgba(13, 153, 255, 0.2);
    --text-color: #f5f5f5;
    --accent: #0d99ff;
    --accent-light: #47b4ff;
    --border-radius: 16px;
    --spacing-sm: 0.5rem;
    --spacing-md: 0.75rem;
    --spacing-lg: 1rem;
    --spacing-xl: 1.5rem;
    --spacing-2xl: 2rem;
    display: contents;
  }

  .privacy-notice {
    position: fixed;
    bottom: var(--spacing-2xl);
    right: var(--spacing-2xl);
    background: var(--popup-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-2xl);
    max-width: 420px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    transform: translateY(calc(100% + 3rem));
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
  }

  .privacy-notice[data-state*="visible"] {
    transform: translateY(0);
  }

  .notice-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .cookie-icon {
    font-size: 2rem;
  }

  .notice-title {
    margin: 0;
    color: var(--text-color);
    font-size: 1.25rem;
    font-weight: 600;
  }

  .notice-content {
    color: var(--text-color);
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: var(--spacing-xl);
  }

  .notice-content p {
    margin: 0 0 var(--spacing-md) 0;
  }

  .notice-content p:last-child {
    margin-bottom: 0;
  }

  .notice-actions {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .notice-button {
    flex: 1;
    padding: var(--spacing-md) 1.25rem;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
  }

  .btn-accept {
    background: linear-gradient(45deg, var(--accent), var(--accent-light));
    color: white;
  }

  .btn-accept:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(13, 153, 255, 0.3);
  }

  .btn-customize {
    background: transparent;
    color: var(--accent);
    border: 1px solid var(--accent);
  }

  .btn-customize:hover {
    background: rgba(13, 153, 255, 0.1);
  }

  .privacy-link {
    display: inline-block;
    color: var(--accent);
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.3s ease;
  }

  .privacy-link:hover {
    color: var(--accent-light);
    text-decoration: underline;
  }

  .privacy-link::after {
    content: ' →';
  }

  .customize-panel {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  /* ✅ Updated to use unified data-state pattern */
  .customize-panel[data-state="expanded"] {
    max-height: 200px;
    margin-top: var(--spacing-lg);
  }

  .cookie-option {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: rgba(13, 153, 255, 0.05);
    border-radius: 8px;
    margin-bottom: var(--spacing-sm);
  }

  .cookie-option input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
    cursor: pointer;
  }

  .cookie-option label {
    color: var(--text-color);
    font-size: 0.875rem;
    cursor: pointer;
    flex: 1;
  }

  /* ✅ Updated to use unified data-state pattern */
  .cookie-option[data-state="disabled"] {
    opacity: 0.6;
  }

  .cookie-option[data-state="disabled"] input {
    cursor: not-allowed;
  }

  .save-preferences {
    width: 100%;
    margin-top: var(--spacing-lg);
    background: var(--accent);
    color: white;
  }

  .save-preferences:hover {
    background: var(--accent-light);
  }

  /* Mobile responsive design */
  @media (max-width: 600px) {
    .privacy-notice {
      bottom: 0;
      right: 0;
      left: 0;
      max-width: none;
      border-radius: var(--border-radius) var(--border-radius) 0 0;
      padding: var(--spacing-xl);
      margin: 0;
      width: 100%;
      box-sizing: border-box;
    }

    .notice-actions {
      flex-direction: column;
    }

    .notice-header {
      gap: var(--spacing-sm);
    }

    .cookie-icon {
      font-size: 1.5rem;
    }

    .notice-title {
      font-size: 1.1rem;
    }

    .notice-content {
      font-size: 0.95rem;
      margin-bottom: var(--spacing-lg);
    }
  }
`;

// Template function following framework patterns
const privacyNoticeTemplate = (state: SnapshotFrom<typeof privacyMachine>) => {
  const { showCustomizePanel, analyticsEnabled } = state.context;

  // ✅ FIXED: Use machine state instead of isVisible boolean
  // Only render when in visible or expired state
  if (!state.matches('visible') && !state.matches('expired')) {
    return html``;
  }

  return html`
    <div class="privacy-notice" role="dialog" aria-labelledby="privacy-notice-title" data-state=${state.value}>
      <header class="notice-header">
        <span class="cookie-icon" aria-hidden="true">🍪</span>
        <h3 id="privacy-notice-title" class="notice-title">Quick heads up!</h3>
      </header>

      <div class="notice-content">
        <p>I use cookies to remember your preferences and see which projects you find most interesting.</p>
        <p>Cool with that?</p>
      </div>

      <div class="notice-actions">
        <button class="notice-button btn-accept" send="ACCEPT_ALL">
          Sounds good!
        </button>
        <button class="notice-button btn-customize" send="TOGGLE_CUSTOMIZE">
          Let me choose
        </button>
      </div>

      <!-- ✅ Updated to use unified data-state pattern -->
      <div class="customize-panel" data-state=${showCustomizePanel && 'expanded'}>
        <div class="cookie-option" data-state="disabled">
          <input type="checkbox" id="essential-cookies" checked disabled />
          <label for="essential-cookies">Essential cookies (always on)</label>
        </div>
        
        <div class="cookie-option" data-state="enabled">
          <input 
            type="checkbox" 
            id="analytics-cookies" 
            ${analyticsEnabled && 'checked'}
            send="TOGGLE_ANALYTICS"
          />
          <label for="analytics-cookies">Analytics (helps me improve the site)</label>
        </div>
        
        <button class="notice-button save-preferences" send="SAVE_PREFERENCES">
          Save my preferences
        </button>
      </div>

      <footer>
        <a href="/privacy-policy.html" class="privacy-link" target="_blank">
          The technical details
        </a>
      </footer>
    </div>
  `;
};

// Create the component using the Actor-SPA framework
const PrivacyNoticeComponent = createComponent({
  machine: privacyMachine,
  template: privacyNoticeTemplate,
  styles: privacyNoticeStyles,
  // Auto-registers as <privacy-notice-component> following framework conventions
});

// Export for manual registration if needed
export { PrivacyNoticeComponent };
export default PrivacyNoticeComponent;

// Public API - component can be used reactively via send() method
declare global {
  interface HTMLElementTagNameMap {
    'privacy-notice-component': InstanceType<typeof PrivacyNoticeComponent>;
  }
}

// Export types for external use
export type { ConsentData, ConsentExpiredEvent, ConsentSource, ConsentStatus, ConsentUpdatedEvent };

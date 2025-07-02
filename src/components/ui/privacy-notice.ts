// Type definitions
type ConsentStatus = 'accepted' | 'declined';
type ConsentSource = 'accept-button' | 'customize-panel' | 'expired-reset';

interface ConsentData {
  consent: ConsentStatus;
  date: string;
  expiryDate: string;
}

interface LocalStorageKeys {
  analytics_consent: ConsentStatus;
  consent_date: string;
}

// Custom events
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

class PrivacyNotice extends HTMLElement {
  private static readonly CONSENT_EXPIRY_YEARS = 1;
  private static readonly GA_DISABLE_KEY = 'ga-disable-G-5TR1LWNXXY';
  
  private isVisible: boolean = false;
  private consentData: ConsentData | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isVisible = false;
    this.consentData = null;
  }

  connectedCallback(): void {
    this.render();
    this.checkConsentStatus();
    this.addEventListeners();
  }

  private checkConsentStatus(): void {
    const consentDate = this.getLocalStorageItem('consent_date');
    
    if (consentDate) {
      const expiryDate = this.calculateExpiryDate(consentDate);
      const isExpired = new Date() > expiryDate;
      
      if (isExpired) {
        this.resetConsent('expired-reset');
        return;
      }
      
      // Store current consent data
      const consent = this.getLocalStorageItem('analytics_consent') as ConsentStatus || 'declined';
      this.consentData = {
        consent,
        date: consentDate,
        expiryDate: expiryDate.toISOString()
      };
    }
    
    // Show notice if no valid consent exists
    if (!this.getLocalStorageItem('consent_date')) {
      this.show();
    }
  }

  private calculateExpiryDate(consentDateStr: string): Date {
    const expiryDate = new Date(consentDateStr);
    expiryDate.setFullYear(expiryDate.getFullYear() + PrivacyNotice.CONSENT_EXPIRY_YEARS);
    return expiryDate;
  }

  private getLocalStorageItem(key: keyof LocalStorageKeys): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('PrivacyNotice: LocalStorage access failed:', error);
      return null;
    }
  }

  private setLocalStorageItem(key: keyof LocalStorageKeys, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('PrivacyNotice: LocalStorage write failed:', error);
    }
  }

  private removeLocalStorageItem(key: keyof LocalStorageKeys): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('PrivacyNotice: LocalStorage removal failed:', error);
    }
  }

  private resetConsent(source: ConsentSource): void {
    const expiredDate = this.consentData?.date || new Date().toISOString();
    
    this.removeLocalStorageItem('analytics_consent');
    this.removeLocalStorageItem('consent_date');
    this.consentData = null;
    
    this.show();

    // Dispatch expired event
    if (source === 'expired-reset') {
      const expiredEvent: ConsentExpiredEvent = new CustomEvent('consent-expired', {
        detail: {
          expiredDate,
          resetTimestamp: new Date().toISOString()
        },
        bubbles: true,
        composed: true
      }) as ConsentExpiredEvent;

      this.dispatchEvent(expiredEvent);
    }
  }

  private show(): void {
    this.isVisible = true;
    const banner = this.shadowRoot!.querySelector('.cookie-popup') as HTMLElement;
    if (banner) {
      banner.classList.add('visible');
    }
  }

  private hide(): void {
    this.isVisible = false;
    const banner = this.shadowRoot!.querySelector('.cookie-popup') as HTMLElement;
    if (banner) {
      banner.classList.remove('visible');
    }
  }

  public handleAccept(): void {
    this.saveConsent('accepted', 'accept-button');
    this.hide();
    
    // Reload if Google Analytics not loaded
    if (!this.isGoogleAnalyticsLoaded()) {
      location.reload();
    }
  }

  public handleCustomize(): void {
    const optionsPanel = this.shadowRoot!.querySelector('.options-panel') as HTMLElement;
    if (optionsPanel) {
      optionsPanel.classList.toggle('visible');
    }
  }

  public handleSavePreferences(): void {
    const analyticsCheckbox = this.shadowRoot!.querySelector('#analytics-cookies') as HTMLInputElement;
    const consent: ConsentStatus = analyticsCheckbox?.checked ? 'accepted' : 'declined';
    
    this.saveConsent(consent, 'customize-panel');
    this.hide();
    
    if (consent === 'accepted' && !this.isGoogleAnalyticsLoaded()) {
      location.reload();
    } else if (consent === 'declined') {
      this.disableGoogleAnalytics();
    }
  }

  private saveConsent(consent: ConsentStatus, source: ConsentSource): void {
    const timestamp = new Date().toISOString();
    
    this.setLocalStorageItem('analytics_consent', consent);
    this.setLocalStorageItem('consent_date', timestamp);
    
    this.consentData = {
      consent,
      date: timestamp,
      expiryDate: this.calculateExpiryDate(timestamp).toISOString()
    };
    
    // Dispatch consent updated event
    const event: ConsentUpdatedEvent = new CustomEvent('consent-updated', {
      detail: { consent, source, timestamp },
      bubbles: true,
      composed: true
    }) as ConsentUpdatedEvent;

    this.dispatchEvent(event);
  }

  private isGoogleAnalyticsLoaded(): boolean {
    return typeof window.gtag !== 'undefined';
  }

  private disableGoogleAnalytics(): void {
    try {
      (window as any)[PrivacyNotice.GA_DISABLE_KEY] = true;
    } catch (error) {
      console.warn('PrivacyNotice: Failed to disable Google Analytics:', error);
    }
  }

  private render(): void {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          --popup-bg: rgba(15, 17, 21, 0.98);
          --border-color: rgba(13, 153, 255, 0.2);
          --text-color: #F5F5F5;
          --accent: #0D99FF;
          --accent-light: #47B4FF;
        }
        
        .cookie-popup {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: var(--popup-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 2rem;
          max-width: 420px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          transform: translateY(calc(100% + 3rem));
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        }
        
        .cookie-popup.visible {
          transform: translateY(0);
        }
        
        .cookie-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .cookie-icon {
          font-size: 2rem;
        }
        
        h3 {
          margin: 0;
          color: var(--text-color);
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .cookie-content {
          color: var(--text-color);
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        
        .cookie-content p {
          margin: 0 0 0.75rem 0;
        }
        
        .cookie-content p:last-child {
          margin-bottom: 0;
        }
        
        .actions {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        button {
          flex: 1;
          padding: 0.75rem 1.25rem;
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
        
        .options-panel {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        
        .options-panel.visible {
          max-height: 200px;
          margin-top: 1rem;
        }
        
        .cookie-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(13, 153, 255, 0.05);
          border-radius: 8px;
          margin-bottom: 0.5rem;
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
        
        .cookie-option.disabled {
          opacity: 0.6;
        }
        
        .cookie-option.disabled input {
          cursor: not-allowed;
        }
        
        .save-preferences {
          width: 100%;
          margin-top: 1rem;
          background: var(--accent);
          color: white;
        }
        
        .save-preferences:hover {
          background: var(--accent-light);
        }
        
        @media (max-width: 600px) {
          .cookie-popup {
            bottom: 0;
            right: 0;
            left: 0;
            max-width: none;
            border-radius: 16px 16px 0 0;
            padding: 1.5rem;
            margin: 0;
            width: 100%;
            box-sizing: border-box;
          }
          
          .actions {
            flex-direction: column;
          }
          
          .cookie-header {
            gap: 0.5rem;
          }
          
          .cookie-icon {
            font-size: 1.5rem;
          }
          
          h3 {
            font-size: 1.1rem;
          }
          
          .cookie-content {
            font-size: 0.95rem;
            margin-bottom: 1rem;
          }
        }
      </style>
      
      <div class="cookie-popup" role="dialog" aria-labelledby="cookie-title">
        <div class="cookie-header">
          <span class="cookie-icon">🍪</span>
          <h3 id="cookie-title">Quick heads up!</h3>
        </div>
        
        <div class="cookie-content">
          <p>I use cookies to remember your preferences and see which projects you find most interesting.</p>
          <p>Cool with that?</p>
        </div>
        
        <div class="actions">
          <button class="btn-accept" onclick="this.getRootNode().host.handleAccept()">
            Sounds good!
          </button>
          <button class="btn-customize" onclick="this.getRootNode().host.handleCustomize()">
            Let me choose
          </button>
        </div>
        
        <div class="options-panel">
          <div class="cookie-option disabled">
            <input type="checkbox" id="essential-cookies" checked disabled />
            <label for="essential-cookies">Essential cookies (always on)</label>
          </div>
          <div class="cookie-option">
            <input type="checkbox" id="analytics-cookies" />
            <label for="analytics-cookies">Analytics (helps me improve the site)</label>
          </div>
          <button class="save-preferences" onclick="this.getRootNode().host.handleSavePreferences()">
            Save my preferences
          </button>
        </div>
        
        <a href="/privacy-policy.html" class="privacy-link" target="_blank">
          The technical details
        </a>
      </div>
    `;
  }

  private addEventListeners(): void {
    const style = document.createElement('style');
    style.textContent = `
      privacy-notice {
        display: contents;
      }
    `;
    document.head.appendChild(style);
  }

  // Public API for external interactions
  public isNoticeVisible(): boolean {
    return this.isVisible;
  }

  public getCurrentConsent(): ConsentData | null {
    return this.consentData;
  }

  public getConsentStatus(): ConsentStatus | null {
    return this.consentData?.consent || null;
  }

  public showNotice(): void {
    this.show();
  }

  public hideNotice(): void {
    this.hide();
  }

  public resetConsentData(): void {
    this.resetConsent('expired-reset');
  }

  public isConsentExpired(): boolean {
    if (!this.consentData) return true;
    
    const expiryDate = new Date(this.consentData.expiryDate);
    return new Date() > expiryDate;
  }

  public getRemainingConsentDays(): number {
    if (!this.consentData) return 0;
    
    const expiryDate = new Date(this.consentData.expiryDate);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
}

// Define the custom element
if (!customElements.get('privacy-notice')) {
  customElements.define('privacy-notice', PrivacyNotice);
}

export { PrivacyNotice };
export type { 
  ConsentStatus, 
  ConsentSource, 
  ConsentData, 
  LocalStorageKeys,
  ConsentUpdatedEvent,
  ConsentExpiredEvent 
}; 
class PrivacyNotice extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.checkConsentStatus();
    this.addEventListeners();
  }

  checkConsentStatus() {
    const consentDate = localStorage.getItem('consent_date');
    if (consentDate) {
      const expiryDate = new Date(consentDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      if (new Date() > expiryDate) {
        this.resetConsent();
      }
    }
    
    if (!localStorage.getItem('consent_date')) {
      this.show();
    }
  }

  resetConsent() {
    localStorage.removeItem('analytics_consent');
    localStorage.removeItem('consent_date');
    this.show();
  }

  show() {
    const banner = this.shadowRoot.querySelector('.cookie-popup');
    if (banner) {
      banner.classList.add('visible');
    }
  }

  hide() {
    const banner = this.shadowRoot.querySelector('.cookie-popup');
    if (banner) {
      banner.classList.remove('visible');
    }
  }

  handleAccept() {
    localStorage.setItem('analytics_consent', 'accepted');
    localStorage.setItem('consent_date', new Date().toISOString());
    this.hide();
    
    this.dispatchEvent(new CustomEvent('consent-updated', {
      detail: { consent: 'accepted' },
      bubbles: true,
      composed: true
    }));
    
    if (!window.gtag) {
      location.reload();
    }
  }

  handleCustomize() {
    const optionsPanel = this.shadowRoot.querySelector('.options-panel');
    optionsPanel.classList.toggle('visible');
  }

  handleSavePreferences() {
    const analyticsCheckbox = this.shadowRoot.querySelector('#analytics-cookies');
    const consent = analyticsCheckbox.checked ? 'accepted' : 'declined';
    
    localStorage.setItem('analytics_consent', consent);
    localStorage.setItem('consent_date', new Date().toISOString());
    this.hide();
    
    this.dispatchEvent(new CustomEvent('consent-updated', {
      detail: { consent },
      bubbles: true,
      composed: true
    }));
    
    if (consent === 'accepted' && !window.gtag) {
      location.reload();
    } else if (consent === 'declined') {
      window['ga-disable-G-5TR1LWNXXY'] = true;
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
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
          }
          
          .actions {
            flex-direction: column;
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

  addEventListeners() {
    const style = document.createElement('style');
    style.textContent = `
      privacy-notice {
        display: contents;
      }
    `;
    document.head.appendChild(style);
  }
}

customElements.define('privacy-notice', PrivacyNotice);

export { PrivacyNotice };
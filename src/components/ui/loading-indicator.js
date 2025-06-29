export class LoadingIndicator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['time-remaining'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const timeRemaining = this.getAttribute('time-remaining');
    const showTimer = this.hasAttribute('show-timer');
    const variant = this.getAttribute('variant') || 'dots';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        /* Progress dots animation */
        .loading-dots {
          display: flex;
          gap: 6px;
        }

        .loading-dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          animation: dotPulse 1.4s ease-in-out infinite;
        }

        .loading-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .loading-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes dotPulse {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        .loading-timer {
          font-size: 0.875rem;
          color: #3b82f6;
          font-weight: 600;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 12px;
          border-radius: 12px;
        }

        :host([variant="spinner"]) .loading-dots {
          display: none;
        }

        :host([variant="spinner"]) .loading-spinner {
          display: block;
          width: 40px;
          height: 40px;
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        :host(:not([variant="spinner"])) .loading-spinner {
          display: none;
        }
      </style>
      
      <div class="loading-dots">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
      <div class="loading-spinner"></div>
      ${showTimer && timeRemaining ? `<div class="loading-timer">${timeRemaining}</div>` : ''}
    `;
  }
}

customElements.define('loading-indicator', LoadingIndicator);
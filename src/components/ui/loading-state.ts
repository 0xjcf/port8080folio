// TypeScript interfaces for Loading State component
interface LoadingStateConfig {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  overlay?: boolean;
}

type LoadingStateType = 'spinner' | 'dots' | 'pulse' | 'skeleton';

class LoadingState extends HTMLElement {
  private config: LoadingStateConfig;
  private type: LoadingStateType;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      message: this.getAttribute('message') || 'Loading...',
      size: (this.getAttribute('size') as LoadingStateConfig['size']) || 'medium',
      color: this.getAttribute('color') || 'var(--jasper, #0D99FF)',
      overlay: this.getAttribute('overlay') === 'true'
    };
    this.type = (this.getAttribute('type') as LoadingStateType) || 'spinner';
  }

  static get observedAttributes(): string[] {
    return ['message', 'size', 'color', 'overlay', 'type'];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.updateConfig();
      this.render();
    }
  }

  private updateConfig(): void {
    this.config = {
      message: this.getAttribute('message') || 'Loading...',
      size: (this.getAttribute('size') as LoadingStateConfig['size']) || 'medium',
      color: this.getAttribute('color') || 'var(--jasper, #0D99FF)',
      overlay: this.getAttribute('overlay') === 'true'
    };
    this.type = (this.getAttribute('type') as LoadingStateType) || 'spinner';
  }

  private render(): void {
    if (!this.shadowRoot) return;

    const sizeMap = {
      small: { spinner: '24px', text: '0.875rem' },
      medium: { spinner: '32px', text: '1rem' },
      large: { spinner: '48px', text: '1.125rem' }
    };

    const sizes = sizeMap[this.config.size!];

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: ${this.config.overlay ? 'flex' : 'inline-flex'};
          align-items: center;
          justify-content: center;
          ${this.config.overlay ? 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px);' : ''}
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          ${this.config.overlay ? 'background: rgba(15, 17, 21, 0.95); padding: 2rem; border-radius: 16px; border: 1px solid rgba(13, 153, 255, 0.2);' : ''}
        }
        
        .spinner {
          width: ${sizes.spinner};
          height: ${sizes.spinner};
          border: 3px solid rgba(13, 153, 255, 0.1);
          border-top: 3px solid ${this.config.color};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .dots {
          display: flex;
          gap: 0.5rem;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          background: ${this.config.color};
          border-radius: 50%;
          animation: pulse 1.4s ease-in-out infinite both;
        }
        
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        
        .pulse-circle {
          width: ${sizes.spinner};
          height: ${sizes.spinner};
          background: ${this.config.color};
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .skeleton {
          width: 200px;
          height: 20px;
          background: linear-gradient(90deg, rgba(13, 153, 255, 0.1) 25%, rgba(13, 153, 255, 0.2) 50%, rgba(13, 153, 255, 0.1) 75%);
          background-size: 200% 100%;
          animation: skeleton 2s ease-in-out infinite;
          border-radius: 4px;
        }
        
        .loading-message {
          color: var(--teagreen, #F5F5F5);
          font-size: ${sizes.text};
          font-weight: 500;
          text-align: center;
          opacity: 0.9;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes skeleton {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      </style>
      
      <div class="loading-container">
        ${this.renderLoadingIndicator()}
        ${this.config.message ? `<div class="loading-message">${this.escapeHtml(this.config.message)}</div>` : ''}
      </div>
    `;
  }

  private renderLoadingIndicator(): string {
    switch (this.type) {
      case 'dots':
        return `
          <div class="dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        `;
      case 'pulse':
        return '<div class="pulse-circle"></div>';
      case 'skeleton':
        return '<div class="skeleton"></div>';
      case 'spinner':
      default:
        return '<div class="spinner"></div>';
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API methods
  public show(): void {
    this.style.display = this.config.overlay ? 'flex' : 'inline-flex';
  }

  public hide(): void {
    this.style.display = 'none';
  }

  public updateMessage(message: string): void {
    this.setAttribute('message', message);
  }

  public updateType(type: LoadingStateType): void {
    this.setAttribute('type', type);
  }
}

// Register the custom element
customElements.define('loading-state', LoadingState);

export default LoadingState; 
class BrandIcon extends HTMLElement {
  static get observedAttributes() {
    return ['size', 'animate', 'icon-type', 'icon-src', 'pulse-color', 'icon-color'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
    const size = this.getAttribute('size') || '48';
    const animate = this.getAttribute('animate') !== 'false';
    const iconType = this.getAttribute('icon-type') || 'state-machine';
    const iconSrc = this.getAttribute('icon-src');
    const pulseColor = this.getAttribute('pulse-color') || '#0D99FF';
    const iconColor = this.getAttribute('icon-color') || '#0D99FF';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        :host(:hover) {
          transform: scale(1.1);
        }

        .icon-container {
          width: ${size}px;
          height: ${size}px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-circle {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid ${pulseColor};
          border-radius: 50%;
          background: rgba(${this.hexToRgb(pulseColor)}, 0.1);
          box-shadow: 
            0 0 20px rgba(${this.hexToRgb(pulseColor)}, 0.5),
            0 0 40px rgba(${this.hexToRgb(pulseColor)}, 0.3),
            0 0 60px rgba(${this.hexToRgb(pulseColor)}, 0.2),
            inset 0 0 20px rgba(${this.hexToRgb(pulseColor)}, 0.2);
          ${animate ? 'animation: border-pulse 3s ease-in-out infinite;' : ''}
          transition: all 0.3s ease;
        }

        .icon-circle::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(${this.hexToRgb(pulseColor)}, 0.3) 0%, transparent 60%);
          opacity: 0.8;
        }

        @keyframes border-pulse {
          0%, 100% {
            transform: scale(1);
            border-color: ${pulseColor};
            opacity: 1;
          }
          50% {
            transform: scale(1.08);
            border-color: ${this.lightenColor(pulseColor)};
            opacity: 0.9;
          }
        }

        :host(:hover) .icon-circle {
          border-color: ${this.lightenColor(pulseColor)};
          background: rgba(${this.hexToRgb(pulseColor)}, 0.2);
        }

        .icon-inner {
          width: ${size * 0.67}px;
          height: ${size * 0.67}px;
          background: linear-gradient(135deg, ${iconColor}, ${this.lightenColor(iconColor)});
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          box-shadow: 
            0 4px 12px rgba(${this.hexToRgb(iconColor)}, 0.4),
            0 0 20px rgba(${this.hexToRgb(iconColor)}, 0.3),
            inset 0 0 10px rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        :host(:hover) .icon-inner {
          box-shadow: 
            0 6px 20px rgba(${this.hexToRgb(iconColor)}, 0.6),
            0 0 30px rgba(${this.hexToRgb(iconColor)}, 0.5),
            0 0 40px rgba(${this.hexToRgb(this.lightenColor(iconColor))}, 0.3),
            inset 0 0 15px rgba(255, 255, 255, 0.3);
        }

        .icon-content {
          width: ${size * 0.42}px;
          height: ${size * 0.42}px;
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
        }

        .state-machine-icon {
          width: 100%;
          height: 100%;
        }

        .state-machine-icon circle,
        .state-machine-icon path {
          transition: all 0.3s ease;
        }

        .state-machine-icon circle {
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.4));
        }

        :host(:hover) .icon-content {
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.5));
        }

        :host(:hover) .state-machine-icon circle {
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.6));
        }

        :host(:hover) .state-machine-icon path {
          stroke: #fff;
          filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.7));
        }

        .custom-icon {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        /* Static variant for footer */
        :host([static]) .icon-circle {
          animation: none;
          border: 2px solid rgba(${this.hexToRgb(pulseColor)}, 0.3);
          background: rgba(${this.hexToRgb(pulseColor)}, 0.05);
        }

        :host([static]:hover) .icon-circle {
          border-color: ${pulseColor};
          background: rgba(${this.hexToRgb(pulseColor)}, 0.1);
        }
      </style>

      <div class="icon-container">
        <div class="icon-circle"></div>
        <div class="icon-inner">
          <div class="icon-content">
            ${this.getIconContent(iconType, iconSrc)}
          </div>
        </div>
      </div>
    `;
  }

  getIconContent(type, src) {
    if (src) {
      return `<img src="${src}" alt="Brand icon" class="custom-icon" />`;
    }

    switch (type) {
      case 'state-machine':
        return `
          <svg viewBox="0 0 100 100" class="state-machine-icon">
            <circle cx="50" cy="20" r="8" fill="#fff" />
            <circle cx="25" cy="60" r="8" fill="#fff" />
            <circle cx="75" cy="60" r="8" fill="#fff" />
            <path d="M50 28 L25 52 M50 28 L75 52" stroke="#fff" stroke-width="2" fill="none" />
          </svg>
        `;
      case 'code':
        return `
          <svg viewBox="0 0 100 100" class="state-machine-icon">
            <path d="M30 30 L10 50 L30 70 M70 30 L90 50 L70 70" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
            <path d="M40 80 L60 20" stroke="#fff" stroke-width="6" stroke-linecap="round" />
          </svg>
        `;
      case 'circuit':
        return `
          <svg viewBox="0 0 100 100" class="state-machine-icon">
            <circle cx="50" cy="50" r="8" fill="#fff" />
            <circle cx="20" cy="20" r="5" fill="#fff" />
            <circle cx="80" cy="20" r="5" fill="#fff" />
            <circle cx="20" cy="80" r="5" fill="#fff" />
            <circle cx="80" cy="80" r="5" fill="#fff" />
            <path d="M50 50 L20 20 M50 50 L80 20 M50 50 L20 80 M50 50 L80 80" stroke="#fff" stroke-width="2" fill="none" />
          </svg>
        `;
      default:
        return `
          <svg viewBox="0 0 100 100" class="state-machine-icon">
            <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="4" />
            <circle cx="50" cy="50" r="10" fill="#fff" />
          </svg>
        `;
    }
  }

  hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  }

  lightenColor(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Lighten by 20%
    r = Math.min(255, Math.floor(r + (255 - r) * 0.2));
    g = Math.min(255, Math.floor(g + (255 - g) * 0.2));
    b = Math.min(255, Math.floor(b + (255 - b) * 0.2));
    
    // Convert back to hex
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

customElements.define('brand-icon', BrandIcon);

export { BrandIcon };
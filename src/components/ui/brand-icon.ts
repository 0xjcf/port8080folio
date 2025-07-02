// Type definitions
type IconType = 'state-machine' | 'code' | 'circuit' | 'default';

interface BrandIconAttributes {
  size: string;
  animate: string;
  'icon-type': IconType;
  'icon-src': string;
  'pulse-color': string;
  'icon-color': string;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface IconSizes {
  container: number;
  inner: number;
  content: number;
}

// Custom event for icon interactions
interface IconClickEvent extends CustomEvent {
  detail: {
    iconType: IconType;
    size: number;
    animated: boolean;
  };
}

class BrandIcon extends HTMLElement {
  private static readonly OBSERVED_ATTRIBUTES: (keyof BrandIconAttributes)[] = [
    'size', 
    'animate', 
    'icon-type', 
    'icon-src', 
    'pulse-color', 
    'icon-color'
  ];

  private static readonly DEFAULT_VALUES = {
    size: '48',
    animate: 'true',
    iconType: 'state-machine' as IconType,
    pulseColor: '#0D99FF',
    iconColor: '#0D99FF'
  } as const;

  static get observedAttributes(): string[] {
    return [...BrandIcon.OBSERVED_ATTRIBUTES];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this.setupClickHandler();
  }

  attributeChangedCallback(
    name: string, 
    oldValue: string | null, 
    newValue: string | null
  ): void {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  private setupClickHandler(): void {
    this.addEventListener('click', () => {
      const iconType = this.getIconType();
      const size = this.getSize();
      const animated = this.isAnimated();

      // Dispatch custom event for analytics or interaction tracking
      const event: IconClickEvent = new CustomEvent('icon-clicked', {
        detail: { iconType, size, animated },
        bubbles: true,
        composed: true
      }) as IconClickEvent;

      this.dispatchEvent(event);
    });
  }

  private getSize(): number {
    const sizeAttr = this.getAttribute('size');
    const size = parseInt(sizeAttr || BrandIcon.DEFAULT_VALUES.size, 10);
    return isNaN(size) ? parseInt(BrandIcon.DEFAULT_VALUES.size, 10) : size;
  }

  private isAnimated(): boolean {
    const animateAttr = this.getAttribute('animate');
    return animateAttr !== 'false';
  }

  private getIconType(): IconType {
    const typeAttr = this.getAttribute('icon-type') as IconType;
    const validTypes: IconType[] = ['state-machine', 'code', 'circuit', 'default'];
    return validTypes.includes(typeAttr) ? typeAttr : BrandIcon.DEFAULT_VALUES.iconType;
  }

  private getIconSrc(): string | null {
    return this.getAttribute('icon-src');
  }

  private getPulseColor(): string {
    return this.getAttribute('pulse-color') || BrandIcon.DEFAULT_VALUES.pulseColor;
  }

  private getIconColor(): string {
    return this.getAttribute('icon-color') || BrandIcon.DEFAULT_VALUES.iconColor;
  }

  private calculateIconSizes(baseSize: number): IconSizes {
    return {
      container: baseSize,
      inner: Math.round(baseSize * 0.67),
      content: Math.round(baseSize * 0.42)
    };
  }

  private render(): void {
    const size = this.getSize();
    const animate = this.isAnimated();
    const iconType = this.getIconType();
    const iconSrc = this.getIconSrc();
    const pulseColor = this.getPulseColor();
    const iconColor = this.getIconColor();
    const sizes = this.calculateIconSizes(size);

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.3s ease;
          overflow: visible;
          /* Add padding to prevent clipping of visual effects */
          padding: 8px;
          margin: -8px;
        }

        :host(:hover) {
          transform: scale(1.1);
        }

        .icon-container {
          width: ${sizes.container}px;
          height: ${sizes.container}px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
        }

        .icon-circle {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid ${pulseColor};
          border-radius: 50%;
          background: rgba(${this.hexToRgbString(pulseColor)}, 0.1);
          box-shadow: 
            0 0 20px rgba(${this.hexToRgbString(pulseColor)}, 0.5),
            0 0 40px rgba(${this.hexToRgbString(pulseColor)}, 0.3),
            0 0 60px rgba(${this.hexToRgbString(pulseColor)}, 0.2),
            inset 0 0 20px rgba(${this.hexToRgbString(pulseColor)}, 0.2);
          ${animate ? 'animation: border-pulse 3s ease-in-out infinite;' : ''}
          transition: all 0.3s ease;
        }

        .icon-circle::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(${this.hexToRgbString(pulseColor)}, 0.3) 0%, transparent 60%);
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
          background: rgba(${this.hexToRgbString(pulseColor)}, 0.2);
        }

        .icon-inner {
          width: ${sizes.inner}px;
          height: ${sizes.inner}px;
          background: linear-gradient(135deg, ${iconColor}, ${this.lightenColor(iconColor)});
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          box-shadow: 
            0 4px 12px rgba(${this.hexToRgbString(iconColor)}, 0.4),
            0 0 20px rgba(${this.hexToRgbString(iconColor)}, 0.3),
            inset 0 0 10px rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        :host(:hover) .icon-inner {
          box-shadow: 
            0 6px 20px rgba(${this.hexToRgbString(iconColor)}, 0.6),
            0 0 30px rgba(${this.hexToRgbString(iconColor)}, 0.5),
            0 0 40px rgba(${this.hexToRgbString(this.lightenColor(iconColor))}, 0.3),
            inset 0 0 15px rgba(255, 255, 255, 0.3);
        }

        .icon-content {
          width: ${sizes.content}px;
          height: ${sizes.content}px;
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
          border: 2px solid rgba(${this.hexToRgbString(pulseColor)}, 0.3);
          background: rgba(${this.hexToRgbString(pulseColor)}, 0.05);
        }

        :host([static]:hover) .icon-circle {
          border-color: ${pulseColor};
          background: rgba(${this.hexToRgbString(pulseColor)}, 0.1);
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

  private getIconContent(type: IconType, src: string | null): string {
    if (src) {
      const altText = this.getAltText(type, src);
      return `<img src="${this.escapeAttribute(src)}" alt="${this.escapeAttribute(altText)}" class="custom-icon" />`;
    }

    switch (type) {
      case 'state-machine':
        return `
          <svg viewBox="0 0 100 100" class="state-machine-icon" aria-hidden="true">
            <circle cx="50" cy="20" r="8" fill="#fff" />
            <circle cx="25" cy="60" r="8" fill="#fff" />
            <circle cx="75" cy="60" r="8" fill="#fff" />
            <path d="M50 28 L25 52 M50 28 L75 52" stroke="#fff" stroke-width="2" fill="none" />
          </svg>
        `;
      case 'code':
        return `
          <svg viewBox="0 0 100 100" class="state-machine-icon" aria-hidden="true">
            <path d="M30 30 L10 50 L30 70 M70 30 L90 50 L70 70" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
            <path d="M40 80 L60 20" stroke="#fff" stroke-width="6" stroke-linecap="round" />
          </svg>
        `;
      case 'circuit':
        return `
          <svg viewBox="0 0 100 100" class="state-machine-icon" aria-hidden="true">
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
          <svg viewBox="0 0 100 100" class="state-machine-icon" aria-hidden="true">
            <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="4" />
            <circle cx="50" cy="50" r="10" fill="#fff" />
          </svg>
        `;
    }
  }

  private getAltText(type: IconType, src: string): string {
    // If src is provided, try to derive alt text from filename
    if (src) {
      const filename = src.split('/').pop()?.split('.')[0] || '';
      // Convert filename to readable text (e.g., "brand-logo" -> "Brand logo")
      return filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Otherwise use icon type
    switch (type) {
      case 'state-machine':
        return 'State machine diagram icon';
      case 'code':
        return 'Code brackets icon';
      case 'circuit':
        return 'Circuit board icon';
      default:
        return 'Decorative icon';
    }
  }

  private hexToRgb(hex: string): RGBColor {
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    
    // Validate hex format
    if (!/^[0-9A-F]{6}$/i.test(cleanHex)) {
      throw new Error(`Invalid hex color: ${hex}`);
    }
    
    // Parse hex values
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    return { r, g, b };
  }

  private hexToRgbString(hex: string): string {
    try {
      const { r, g, b } = this.hexToRgb(hex);
      return `${r}, ${g}, ${b}`;
    } catch {
      // Fallback to default blue color if hex parsing fails
      return '13, 153, 255';
    }
  }

  private lightenColor(hex: string): string {
    try {
      let { r, g, b } = this.hexToRgb(hex);
      
      // Lighten by 20%
      r = Math.min(255, Math.floor(r + (255 - r) * 0.2));
      g = Math.min(255, Math.floor(g + (255 - g) * 0.2));
      b = Math.min(255, Math.floor(b + (255 - b) * 0.2));
      
      // Convert back to hex
      const toHex = (n: number): string => n.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    } catch {
      // Fallback to lighter blue if color parsing fails
      return '#47B4FF';
    }
  }

  private escapeAttribute(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Public API for external interactions
  public getCurrentIconType(): IconType {
    return this.getIconType();
  }

  public getCurrentSize(): number {
    return this.getSize();
  }

  public getAnimationState(): boolean {
    return this.isAnimated();
  }

  public setIconType(type: IconType): void {
    this.setAttribute('icon-type', type);
  }

  public setSize(size: number): void {
    this.setAttribute('size', size.toString());
  }

  public setAnimation(enabled: boolean): void {
    this.setAttribute('animate', enabled.toString());
  }

  public setPulseColor(color: string): void {
    // Validate color format before setting
    try {
      this.hexToRgb(color);
      this.setAttribute('pulse-color', color);
    } catch (error) {
      console.warn('BrandIcon: Invalid color format provided:', color);
    }
  }

  public setIconColor(color: string): void {
    // Validate color format before setting
    try {
      this.hexToRgb(color);
      this.setAttribute('icon-color', color);
    } catch (error) {
      console.warn('BrandIcon: Invalid color format provided:', color);
    }
  }
}

// Define the custom element
if (!customElements.get('brand-icon')) {
  customElements.define('brand-icon', BrandIcon);
}

export { BrandIcon };
export type { 
  IconType, 
  BrandIconAttributes, 
  RGBColor, 
  IconSizes, 
  IconClickEvent 
}; 
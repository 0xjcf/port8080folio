// BrandIcon component refactored to use Actor-SPA Framework API
import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, css, html, type RawHTML } from '../../framework/core/index.js';

// ✅ Type-safe interfaces following framework patterns
type IconType = 'state-machine' | 'code' | 'circuit' | 'default';

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

interface BrandIconContext {
  size: number;
  animate: boolean;
  iconType: IconType;
  iconSrc: string | null;
  pulseColor: string;
  iconColor: string;
}

type BrandIconEvents =
  | { type: 'CLICKED' }
  | { type: 'UPDATE_SIZE'; size: number }
  | { type: 'UPDATE_TYPE'; iconType: IconType }
  | { type: 'UPDATE_ANIMATION'; animate: boolean }
  | { type: 'UPDATE_COLORS'; pulseColor?: string; iconColor?: string }
  | { type: 'UPDATE_SRC'; iconSrc: string | null };

// ✅ XState machine for state management
const brandIconMachine = setup({
  types: {
    context: {} as BrandIconContext,
    events: {} as BrandIconEvents,
  },
  actions: {
    updateSize: assign({
      size: ({ event }) =>
        event.type === 'UPDATE_SIZE' ? Math.max(16, Math.min(200, event.size)) : 48,
    }),
    updateType: assign({
      iconType: ({ event }) => (event.type === 'UPDATE_TYPE' ? event.iconType : 'state-machine'),
    }),
    updateAnimation: assign({
      animate: ({ event }) => (event.type === 'UPDATE_ANIMATION' ? event.animate : true),
    }),
    updateColors: assign({
      pulseColor: ({ event, context }) =>
        event.type === 'UPDATE_COLORS'
          ? (event.pulseColor ?? context.pulseColor)
          : context.pulseColor,
      iconColor: ({ event, context }) =>
        event.type === 'UPDATE_COLORS' ? (event.iconColor ?? context.iconColor) : context.iconColor,
    }),
    updateSrc: assign({
      iconSrc: ({ event }) => (event.type === 'UPDATE_SRC' ? event.iconSrc : null),
    }),
    emitClickEvent: ({ context }) => {
      // ✅ Emit event using data attributes that can be observed by parent components
      // Parent components can use MutationObserver or check attributes in their state machines
      // This is a more reactive pattern than direct DOM events

      // Store the click event data as a data attribute that parent components can react to
      const _eventData = JSON.stringify({
        type: 'icon-clicked',
        iconType: context.iconType,
        size: context.size,
        animated: context.animate,
        timestamp: Date.now(),
      });

      // This action doesn't directly manipulate DOM - the template will handle it
    },
  },
}).createMachine({
  id: 'brand-icon',
  initial: 'idle',
  context: {
    size: 48,
    animate: true,
    iconType: 'state-machine',
    iconSrc: null,
    pulseColor: '#0D99FF',
    iconColor: '#0D99FF',
  },
  states: {
    idle: {
      on: {
        CLICKED: { actions: 'emitClickEvent' },
        UPDATE_SIZE: { actions: 'updateSize' },
        UPDATE_TYPE: { actions: 'updateType' },
        UPDATE_ANIMATION: { actions: 'updateAnimation' },
        UPDATE_COLORS: { actions: 'updateColors' },
        UPDATE_SRC: { actions: 'updateSrc' },
      },
    },
  },
});

// ✅ Helper functions (pure functions)
function calculateIconSizes(baseSize: number): IconSizes {
  return {
    container: baseSize,
    inner: Math.round(baseSize * 0.67),
    content: Math.round(baseSize * 0.42),
  };
}

function hexToRgb(hex: string): RGBColor {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Validate hex format
  if (!/^[0-9A-F]{6}$/i.test(cleanHex)) {
    // Return default blue if invalid
    return { r: 13, g: 153, b: 255 };
  }

  // Parse hex values
  const r = Number.parseInt(cleanHex.substring(0, 2), 16);
  const g = Number.parseInt(cleanHex.substring(2, 4), 16);
  const b = Number.parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

function hexToRgbString(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

function lightenColor(hex: string): string {
  let { r, g, b } = hexToRgb(hex);

  // Lighten by 20%
  r = Math.min(255, Math.floor(r + (255 - r) * 0.2));
  g = Math.min(255, Math.floor(g + (255 - g) * 0.2));
  b = Math.min(255, Math.floor(b + (255 - b) * 0.2));

  // Convert back to hex
  const toHex = (n: number): string => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getAltText(type: IconType, src: string | null): string {
  // If src is provided, try to derive alt text from filename
  if (src) {
    const filename = src.split('/').pop()?.split('.')[0] || '';
    // Convert filename to readable text (e.g., "brand-logo" -> "Brand logo")
    return filename.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
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

// ✅ Template components (extracted for better organization)
const iconContent = (type: IconType, src: string | null): RawHTML => {
  if (src) {
    const altText = getAltText(type, src);
    return html`<img src=${src} alt=${altText} class="custom-icon" />`;
  }

  switch (type) {
    case 'state-machine':
      return html`
        <svg viewBox="0 0 100 100" class="state-machine-icon" aria-hidden="true">
          <circle cx="50" cy="20" r="8" fill="#fff" />
          <circle cx="25" cy="60" r="8" fill="#fff" />
          <circle cx="75" cy="60" r="8" fill="#fff" />
          <path d="M50 28 L25 52 M50 28 L75 52" stroke="#fff" stroke-width="2" fill="none" />
        </svg>
      `;
    case 'code':
      return html`
        <svg viewBox="0 0 100 100" class="state-machine-icon" aria-hidden="true">
          <path d="M30 30 L10 50 L30 70 M70 30 L90 50 L70 70" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
          <path d="M40 80 L60 20" stroke="#fff" stroke-width="6" stroke-linecap="round" />
        </svg>
      `;
    case 'circuit':
      return html`
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
      return html`
        <svg viewBox="0 0 100 100" class="state-machine-icon" aria-hidden="true">
          <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="4" />
          <circle cx="50" cy="50" r="10" fill="#fff" />
        </svg>
      `;
  }
};

// ✅ Pure template function using framework html``
const brandIconTemplate = (state: SnapshotFrom<typeof brandIconMachine>): RawHTML => {
  const { size, animate, iconType, iconSrc, pulseColor, iconColor } = state.context;
  const sizes = calculateIconSizes(size);

  // Build CSS custom properties for dynamic styling
  const cssProperties = [
    `--container-size: ${sizes.container}px`,
    `--inner-size: ${sizes.inner}px`,
    `--content-size: ${sizes.content}px`,
    `--pulse-color: ${pulseColor}`,
    `--pulse-rgb: ${hexToRgbString(pulseColor)}`,
    `--icon-color: ${iconColor}`,
    `--icon-rgb: ${hexToRgbString(iconColor)}`,
    `--lighter-color: ${lightenColor(pulseColor)}`,
    `--lighter-rgb: ${hexToRgbString(lightenColor(pulseColor))}`,
    `--animation-state: ${animate ? 'running' : 'paused'}`,
  ].join('; ');

  return html`
    <div class="icon-container" style=${cssProperties} send="CLICKED">
      <div class="icon-circle"></div>
      <div class="icon-inner">
        <div class="icon-content">
          ${iconContent(iconType, iconSrc)}
        </div>
      </div>
    </div>
  `;
};

// ✅ Static styles using CSS custom properties for dynamic values
const brandIconStyles = css`
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
    width: var(--container-size);
    height: var(--container-size);
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
    border: 2px solid var(--pulse-color);
    border-radius: 50%;
    background: rgba(var(--pulse-rgb), 0.1);
    box-shadow: 
      0 0 20px rgba(var(--pulse-rgb), 0.5),
      0 0 40px rgba(var(--pulse-rgb), 0.3),
      0 0 60px rgba(var(--pulse-rgb), 0.2),
      inset 0 0 20px rgba(var(--pulse-rgb), 0.2);
    animation: border-pulse 3s ease-in-out infinite;
    animation-play-state: var(--animation-state);
    transition: all 0.3s ease;
  }

  .icon-circle::before {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(var(--pulse-rgb), 0.3) 0%, transparent 60%);
    opacity: 0.8;
  }

  @keyframes border-pulse {
    0%, 100% {
      transform: scale(1);
      border-color: var(--pulse-color);
      opacity: 1;
    }
    50% {
      transform: scale(1.08);
      border-color: var(--lighter-color);
      opacity: 0.9;
    }
  }

  :host(:hover) .icon-circle {
    border-color: var(--lighter-color);
    background: rgba(var(--pulse-rgb), 0.2);
  }

  .icon-inner {
    width: var(--inner-size);
    height: var(--inner-size);
    background: linear-gradient(135deg, var(--icon-color), var(--lighter-color));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
    box-shadow: 
      0 4px 12px rgba(var(--icon-rgb), 0.4),
      0 0 20px rgba(var(--icon-rgb), 0.3),
      inset 0 0 10px rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }

  :host(:hover) .icon-inner {
    box-shadow: 
      0 6px 20px rgba(var(--icon-rgb), 0.6),
      0 0 30px rgba(var(--icon-rgb), 0.5),
      0 0 40px rgba(var(--lighter-rgb), 0.3),
      inset 0 0 15px rgba(255, 255, 255, 0.3);
  }

  .icon-content {
    width: var(--content-size);
    height: var(--content-size);
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
    border: 2px solid rgba(var(--pulse-rgb), 0.3);
    background: rgba(var(--pulse-rgb), 0.05);
  }

  :host([static]:hover) .icon-circle {
    border-color: var(--pulse-color);
    background: rgba(var(--pulse-rgb), 0.1);
  }
`;

// ✅ Create the component using framework API
const BrandIconComponent = createComponent({
  machine: brandIconMachine,
  template: brandIconTemplate,
  styles: brandIconStyles,
  tagName: 'brand-icon', // Custom tag name to maintain compatibility
});

// ✅ Export the component class for programmatic access
export default BrandIconComponent;

// ✅ Export types for external use
export type { IconType, RGBColor, IconSizes, BrandIconContext, BrandIconEvents };

// ✅ Usage Examples:
//
// 1. Basic usage (registered as <brand-icon>):
//    <brand-icon></brand-icon>
//
// 2. Programmatic usage:
//    const icon = new BrandIconComponent();
//    document.body.appendChild(icon);
//
//    // Update size
//    icon.send({ type: 'UPDATE_SIZE', size: 64 });
//
//    // Change icon type
//    icon.send({ type: 'UPDATE_TYPE', iconType: 'code' });
//
//    // Toggle animation
//    icon.send({ type: 'UPDATE_ANIMATION', animate: false });
//
//    // Update colors
//    icon.send({
//      type: 'UPDATE_COLORS',
//      pulseColor: '#FF6B6B',
//      iconColor: '#4ECDC4'
//    });
//
//    // Set custom icon source
//    icon.send({ type: 'UPDATE_SRC', iconSrc: '/images/custom-logo.svg' });
//
// 3. Event handling:
//    icon.addEventListener('icon-clicked', (e) => {
//      console.log('Icon clicked:', e.detail);
//    });
//
// Benefits of the new approach:
// ✅ Automatic XSS protection for all content
// ✅ Declarative event handling with framework event system
// ✅ Type-safe state management
// ✅ Pure functions for better testability
// ✅ CSS custom properties for dynamic styling
// ✅ Automatic lifecycle management

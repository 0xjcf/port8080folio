/**
 * Icon Chip Web Component
 * Atomic Design: Atom
 * 
 * Small icon container with shape and color variants
 * Uses CSS classes for all styling (no inline styles)
 */
export class IconChip extends HTMLElement {
  static get observedAttributes() {
    return ['icon', 'size', 'shape', 'color'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const icon = this.getAttribute('icon') || '📌';
    const size = this.getAttribute('size') || 'md';
    const shape = this.getAttribute('shape') || 'square';
    const color = this.getAttribute('color');

    // Build classes using atomic CSS system
    const classes = ['icon-chip'];
    if (size !== 'md') classes.push(`icon-chip--${size}`);
    if (shape === 'circle') classes.push('icon-chip--circle');
    if (color) classes.push(`icon-chip--${color}`);

    // Set classes (let CSS handle all styling)
    this.className = classes.join(' ');

    // Render light DOM with accessibility
    this.innerHTML = `<span aria-hidden="true">${icon}</span>`;
  }
}

// Register component
customElements.define('icon-chip', IconChip);

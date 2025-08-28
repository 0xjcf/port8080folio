/**
 * Skeleton Loader Web Component
 * Atomic Design: Atom
 * 
 * Placeholder loading animations for content
 * Renders in light DOM for accessibility
 */
export class SkeletonLoader extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'lines', 'width', 'height', 'animated', 'rows', 'cols', 'size'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
    }
  }

  render() {
    const type = this.getAttribute('type') || 'text'; // text, card, image, avatar, table
    const animated = this.hasAttribute('animated');
    
    // Build classes
    const classes = ['skeleton'];
    classes.push(`skeleton--${type}`);
    if (animated) classes.push('skeleton--animated');
    
    this.className = classes.join(' ');
    this.setAttribute('aria-hidden', 'true');
    
    switch (type) {
      case 'text':
        this.renderText();
        break;
      case 'card':
        this.renderCard();
        break;
      case 'image':
        this.renderImage();
        break;
      case 'avatar':
        this.renderAvatar();
        break;
      case 'table':
        this.renderTable();
        break;
      default:
        this.renderText();
    }
  }

  renderText() {
    const lines = parseInt(this.getAttribute('lines') || '3') || 3;
    const widths = ['100%', '80%', '60%']; // Varying widths for natural look
    
    this.innerHTML = `
      <div class="skeleton__text">
        ${Array(lines).fill('').map((_, i) => `
          <div class="skeleton__line" style="width: ${widths[i % widths.length]}"></div>
        `).join('')}
      </div>
    `;
  }

  renderCard() {
    this.innerHTML = `
      <div class="skeleton__card">
        <div class="skeleton__image"></div>
        <div class="skeleton__content">
          <div class="skeleton__line skeleton__title"></div>
          <div class="skeleton__line" style="width: 80%"></div>
          <div class="skeleton__line" style="width: 60%"></div>
        </div>
      </div>
    `;
  }

  renderImage() {
    const width = this.getAttribute('width') || '100%';
    const height = this.getAttribute('height') || '200px';
    
    this.innerHTML = `
      <div class="skeleton__image" style="width: ${width}; height: ${height}"></div>
    `;
  }

  renderAvatar() {
    const size = this.getAttribute('size') || '48px';
    
    this.innerHTML = `
      <div class="skeleton__avatar" style="width: ${size}; height: ${size}"></div>
    `;
  }

  renderTable() {
    const rows = parseInt(this.getAttribute('rows') || '5') || 5;
    const cols = parseInt(this.getAttribute('cols') || '4') || 4;
    
    this.innerHTML = `
      <div class="skeleton__table">
        ${Array(rows).fill('').map(() => `
          <div class="skeleton__row">
            ${Array(cols).fill('').map(() => `
              <div class="skeleton__cell">
                <div class="skeleton__line"></div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;
  }
}

// Register component
if (!customElements.get('skeleton-loader')) {
  customElements.define('skeleton-loader', SkeletonLoader);
}
/**
 * Progress Bar Web Component
 * Atomic Design: Atom
 * 
 * Visual progress indicator with percentage
 * Renders in light DOM for accessibility
 */
export class ProgressBar extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'max', 'text', 'color', 'size', 'animated'];
  }

  connectedCallback() {
    this.render();
    if (this.hasAttribute('animated')) {
      this.animateProgress();
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
      if (name === 'value' && this.hasAttribute('animated')) {
        this.animateProgress();
      }
    }
  }

  render() {
    const value = parseInt(this.getAttribute('value') || '0') || 0;
    const max = parseInt(this.getAttribute('max') || '100') || 100;
    const text = this.getAttribute('text') || '';
    const color = this.getAttribute('color') || 'primary';
    const size = this.getAttribute('size') || 'md';
    const percentage = Math.min((value / max) * 100, 100);
    
    // Build classes
    const classes = ['progress-bar'];
    classes.push(`progress-bar--${color}`);
    classes.push(`progress-bar--${size}`);
    
    this.className = classes.join(' ');
    this.setAttribute('role', 'progressbar');
    this.setAttribute('aria-valuenow', value.toString());
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', max.toString());
    
    this.innerHTML = `
      <div class="progress-bar__container">
        <div class="progress-bar__fill" style="width: ${percentage}%">
          ${text ? `<span class="progress-bar__text">${text}</span>` : ''}
        </div>
      </div>
      ${text && size !== 'sm' ? `
        <div class="progress-bar__label">
          <span>${text}</span>
          <span>${Math.round(percentage)}%</span>
        </div>
      ` : ''}
    `;
  }

  animateProgress() {
    const fill = this.querySelector('.progress-bar__fill') as HTMLElement;
    if (!fill) return;
    
    const targetWidth = fill.style.width;
    fill.style.width = '0%';
    
    setTimeout(() => {
      fill.style.transition = 'width 1s ease-out';
      fill.style.width = targetWidth;
    }, 100);
  }

  // Public methods
  setValue(value: number) {
    this.setAttribute('value', value.toString());
  }

  setProgress(value: number, max: number) {
    this.setAttribute('value', value.toString());
    this.setAttribute('max', max.toString());
  }

  setText(text: string) {
    this.setAttribute('text', text);
  }
}

// Register component
if (!customElements.get('progress-bar')) {
  customElements.define('progress-bar', ProgressBar);
}
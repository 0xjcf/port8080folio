/**
 * Metric Element Web Component
 * Atomic Design: Atom
 * 
 * Displays a metric value with optional label and animation
 * Uses CSS classes for all styling (no inline styles)
 */
export class MetricElement extends HTMLElement {
  private animationFrame?: number;

  static get observedAttributes() {
    return ['value', 'label', 'animate'];
  }

  connectedCallback() {
    this.render();
    if (this.hasAttribute('animate')) {
      this.animateValue();
    }
  }

  disconnectedCallback() {
    // Clean up animation frame if running
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue) {
      this.render();
      if (name === 'value' && this.hasAttribute('animate')) {
        this.animateValue();
      }
    }
  }

  render() {
    const value = this.getAttribute('value') || '0';
    const label = this.getAttribute('label') || '';

    // Use atomic CSS classes
    this.className = 'metric';

    // Render light DOM
    this.innerHTML = `
      <span class="metric__value">${value}</span>
      ${label ? `<span class="metric__label">${label}</span>` : ''}
    `;
  }

  animateValue() {
    const element = this.querySelector('.metric__value');
    if (!element) return;

    const endValue = parseInt(this.getAttribute('value') || '0') || 0;
    const duration = 1000;
    const startTime = performance.now();
    let startValue = 0;

    // Try to get the current displayed value as start
    const currentText = element.textContent || '0';
    const currentValue = parseInt(currentText.replace(/,/g, ''));
    if (!isNaN(currentValue)) {
      startValue = currentValue;
    }

    const updateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuad = progress * (2 - progress);

      // Calculate current value
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuad);

      // Update display
      if (element) {
        element.textContent = currentValue.toLocaleString();
      }

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(updateValue);
      } else {
        // Ensure final value is set
        if (element) {
          element.textContent = endValue.toLocaleString();
        }
        delete this.animationFrame;
      }
    };

    // Cancel any existing animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(updateValue);
  }
}

// Register component
customElements.define('metric-el', MetricElement);

/**
 * Social Proof Badge Web Component
 * Atomic Design: Molecule (composes badge atom)
 * 
 * Displays social proof metrics with animation
 * Composes badge atom for consistent styling
 */
class SocialProofBadge extends HTMLElement {
  private observer?: IntersectionObserver;

  static get observedAttributes() {
    return ['count', 'text', 'variant'];
  }

  connectedCallback() {
    this.render();
    this.setupAnimation();
  }

  disconnectedCallback() {
    // Clean up observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const count = this.getAttribute('count') || '200+';
    const text = this.getAttribute('text') || 'happy customers';
    const variant = this.getAttribute('variant') || 'primary';

    // Use atomic CSS classes
    this.className = 'social-proof';
    
    // Compose with badge atom
    this.innerHTML = `
      <badge-el type="${variant}" pill>
        <strong>${count}</strong> ${text}
      </badge-el>
    `;
  }

  setupAnimation() {
    // Add entrance animation on intersection
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add animation class
            this.classList.add('social-proof--animate');
            
            // Trigger count animation if we have a metric element
            const metricEl = this.querySelector('metric-el');
            if (metricEl) {
              metricEl.setAttribute('animate', 'true');
            }
            
            // Disconnect after animation
            this.observer?.disconnect();
          }
        });
      }, { threshold: 0.1 });

      this.observer.observe(this);
    }
  }

  // Ensure badge dependency is loaded
  async ensureDependencies() {
    if (!customElements.get('badge-el')) {
      try {
        await import('../atoms/badge-tag.js');
      } catch (error) {
        console.warn('Badge component not found:', error);
      }
    }
  }
}

// Register component
customElements.define('social-proof-badge', SocialProofBadge);

export { SocialProofBadge };
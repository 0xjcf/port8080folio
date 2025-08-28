/**
 * Scroll Indicator Web Component
 * Atomic Design: Atom
 * 
 * Animated visual hint to encourage scrolling
 * Renders in light DOM for SEO
 */
export class ScrollIndicator extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bindEvents();
    this.observeVisibility();
  }

  render() {
    const text = this.getAttribute('text') || 'Scroll';
    const position = this.getAttribute('position') || 'bottom';
    const animate = this.hasAttribute('animate');

    // Build classes
    const classes = ['scroll-indicator'];
    if (position) classes.push(`scroll-indicator--${position}`);
    if (animate) classes.push('scroll-indicator--animate');

    this.className = classes.join(' ');

    this.innerHTML = `
      <div class="scroll-indicator__container">
        <span class="scroll-indicator__text">${text}</span>
        <div class="scroll-indicator__arrows">
          <span class="scroll-indicator__arrow" aria-hidden="true">↓</span>
          <span class="scroll-indicator__arrow" aria-hidden="true">↓</span>
          <span class="scroll-indicator__arrow" aria-hidden="true">↓</span>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Hide on scroll
    let isScrolling = false;

    window.addEventListener('scroll', () => {
      if (!isScrolling && window.scrollY > 100) {
        isScrolling = true;
        this.classList.add('scroll-indicator--hidden');
      } else if (isScrolling && window.scrollY <= 100) {
        isScrolling = false;
        this.classList.remove('scroll-indicator--hidden');
      }
    }, { passive: true });

    // Click to scroll
    this.addEventListener('click', () => {
      const viewportHeight = window.innerHeight;
      window.scrollTo({
        top: viewportHeight,
        behavior: 'smooth'
      });
    });
  }

  observeVisibility() {
    // Fade in on intersection
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.classList.add('scroll-indicator--visible');
          }
        });
      }, { threshold: 0.1 });

      observer.observe(this);
    }
  }
}

// Register component
customElements.define('scroll-indicator', ScrollIndicator);

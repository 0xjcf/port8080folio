/**
 * Back to Top Web Component
 * Atomic Design: Atom
 * Styles: src/styles/atomic/01-atoms/navigation.css
 * 
 * Scroll-to-top button with visibility management
 * Renders in light DOM for accessibility
 */
export class BackToTop extends HTMLElement {
  private scrollThreshold: number;
  private isVisible: boolean;
  private scrollHandler?: () => void;
  private clickHandler?: () => void;
  private keyHandler?: (e: KeyboardEvent) => void;
  private srAnnouncer: HTMLDivElement | null = null;

  constructor() {
    super();
    this.scrollThreshold = Number(this.getAttribute('threshold') ?? 300);
    this.isVisible = false;
  }

  static get observedAttributes() {
    return ['icon', 'aria-label', 'compact', 'threshold'];
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
    this.updateVisibility();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    // Skip if values are the same
    if (oldValue === newValue) return;
    
    if (name === 'threshold') {
      this.scrollThreshold = Number(this.getAttribute('threshold') ?? 300);
      // No need to re-render for threshold change
      return;
    }
    
    // Re-render to pick up icon/label/compact changes
    // Only if we're connected to DOM
    if (this.isConnected) {
      this.render();
    }
  }

  disconnectedCallback() {
    this.unbindEvents();
    // Clean up the screen reader announcer
    if (this.srAnnouncer) {
      this.srAnnouncer.remove();
      this.srAnnouncer = null;
    }
  }

  render() {
    const icon = this.getAttribute('icon') || '↑';
    const compact = this.hasAttribute('compact');
    const ariaLabel = this.getAttribute('aria-label') || 'Back to top';

    // Preserve any author-supplied classes; toggle ours explicitly
    this.classList.add('back-to-top');
    this.classList.toggle('back-to-top--compact', !!compact);
    
    // Only set attributes if they're not already set to avoid infinite loop
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'button');
    }
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    // Only update aria-label if it's different
    if (this.getAttribute('aria-label') !== ariaLabel) {
      this.setAttribute('aria-label', ariaLabel);
    }

    // Render light DOM
    this.innerHTML = `
      <span class="back-to-top__icon">${icon}</span>
    `;
  }

  bindEvents() {
    // Scroll handler with throttling
    this.scrollHandler = this.throttle(() => {
      this.updateVisibility();
    }, 100);

    // Click handler
    this.clickHandler = () => this.scrollToTop();

    // Keyboard handler
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.scrollToTop();
      }
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.addEventListener('click', this.clickHandler);
    this.addEventListener('keydown', this.keyHandler);
  }

  unbindEvents() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    if (this.clickHandler) {
      this.removeEventListener('click', this.clickHandler);
    }
    if (this.keyHandler) {
      this.removeEventListener('keydown', this.keyHandler);
    }
  }

  updateVisibility() {
    // Support both scrollY and pageYOffset for older browsers
    const scrollPosition = ('scrollY' in window ? window.scrollY : (window as any).pageYOffset) || 0;
    const shouldBeVisible = scrollPosition > this.scrollThreshold;

    if (shouldBeVisible !== this.isVisible) {
      this.isVisible = shouldBeVisible;
      this.classList.toggle('back-to-top--visible', this.isVisible);
    }
  }

  scrollToTop() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    
    // Use smooth scroll if supported and motion is not reduced
    if (!prefersReducedMotion && 'scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else if (prefersReducedMotion) {
      // Instant scroll for reduced motion
      window.scrollTo(0, 0);
    } else {
      // Fallback animation for older browsers
      this.animateScroll();
    }

    // Announce to screen readers
    this.announceAction();
  }

  animateScroll() {
    const startY = window.scrollY;
    const duration = 500;
    const startTime = performance.now();

    const scroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeInOutQuad = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      window.scrollTo(0, startY * (1 - easeInOutQuad));

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  }

  announceAction() {
    // Create or reuse the screen reader announcement element
    if (!this.srAnnouncer) {
      this.srAnnouncer = document.createElement('div');
      this.srAnnouncer.setAttribute('role', 'status');
      this.srAnnouncer.setAttribute('aria-live', 'polite');
      this.srAnnouncer.className = 'sr-only';
      document.body.appendChild(this.srAnnouncer);
    }
    
    // Update content
    this.srAnnouncer.textContent = 'Scrolled to top';
    
    // Clear message after 1s so it can re-announce on next action
    setTimeout(() => {
      if (this.srAnnouncer) {
        this.srAnnouncer.textContent = '';
      }
    }, 1000);
  }

  throttle(func: Function, delay: number): () => void {
    let timeoutId: number | undefined;
    let lastExecTime = 0;

    return function (this: any, ...args: any[]) {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }
}

// Register component
customElements.define('back-to-top', BackToTop);

/**
 * Sticky CTA Web Component
 * Atomic Design: Molecule
 * 
 * Floating call-to-action that appears on scroll
 * PROPERLY USES ATOMS: loading-button, badge-tag, tooltip-tip
 * Renders in light DOM for accessibility
 */
class StickyCta extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'button-text', 'position', 'show-after', 'badge', 'dismissible'];
  }

  constructor() {
    super();
    this.isVisible = false;
    this.isDismissed = false;
    this.scrollHandler = null;
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
    this.checkStoredDismissal();
  }

  disconnectedCallback() {
    this.unbindEvents();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
    }
  }

  render() {
    const text = this.getAttribute('text') || 'Ready to get started?';
    const buttonText = this.getAttribute('button-text') || 'Get Started';
    const position = this.getAttribute('position') || 'bottom-right';
    const badge = this.getAttribute('badge') || '';
    const dismissible = this.hasAttribute('dismissible');
    
    // Build classes
    const classes = ['sticky-cta'];
    classes.push(`sticky-cta--${position}`);
    if (!this.isVisible) classes.push('sticky-cta--hidden');
    
    this.className = classes.join(' ');
    
    // PROPERLY COMPOSE WITH ATOMS
    this.innerHTML = `
      <div class="sticky-cta__container">
        ${dismissible ? `
          <!-- Close button with tooltip -->
          <tooltip-tip text="Dismiss" position="left">
            <button 
              class="sticky-cta__close" 
              aria-label="Dismiss"
              type="button"
            >
              ×
            </button>
          </tooltip-tip>
        ` : ''}
        
        <div class="sticky-cta__content">
          ${badge ? `
            <!-- Badge atom for highlighting -->
            <badge-tag 
              variant="primary" 
              size="sm"
              class="sticky-cta__badge"
            >
              ${badge}
            </badge-tag>
          ` : ''}
          
          <p class="sticky-cta__text">${text}</p>
          
          <!-- Loading button atom for CTA -->
          <loading-button
            variant="primary"
            class="sticky-cta__button"
          >
            ${buttonText}
          </loading-button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const showAfter = parseInt(this.getAttribute('show-after') || '1000');
    
    // Scroll handler
    this.scrollHandler = this.throttle(() => {
      if (!this.isDismissed && window.scrollY > showAfter) {
        this.show();
      } else if (window.scrollY <= showAfter) {
        this.hide();
      }
    }, 100);
    
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    
    // Initial check
    if (window.scrollY > showAfter && !this.isDismissed) {
      this.show();
    }
    
    // Dismiss button
    const closeBtn = this.querySelector('.sticky-cta__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.dismiss());
    }
    
    // CTA button click
    const ctaButton = this.querySelector('loading-button');
    if (ctaButton) {
      ctaButton.addEventListener('button-click', (e) => {
        this.handleCtaClick(e);
      });
    }
  }

  unbindEvents() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  show() {
    if (this.isVisible || this.isDismissed) return;
    
    this.isVisible = true;
    this.classList.remove('sticky-cta--hidden');
    this.classList.add('sticky-cta--visible');
    
    // Animate in
    this.style.animation = 'slideInUp 0.3s ease-out';
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('sticky-cta-show', { bubbles: true }));
  }

  hide() {
    if (!this.isVisible) return;
    
    this.isVisible = false;
    this.classList.remove('sticky-cta--visible');
    this.classList.add('sticky-cta--hidden');
    
    // Animate out
    this.style.animation = 'slideOutDown 0.3s ease-out';
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('sticky-cta-hide', { bubbles: true }));
  }

  dismiss() {
    this.isDismissed = true;
    this.hide();
    
    // Store dismissal in localStorage
    const dismissKey = `sticky-cta-dismissed-${this.id || 'default'}`;
    localStorage.setItem(dismissKey, 'true');
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('sticky-cta-dismiss', { bubbles: true }));
  }

  checkStoredDismissal() {
    const dismissKey = `sticky-cta-dismissed-${this.id || 'default'}`;
    if (localStorage.getItem(dismissKey) === 'true') {
      this.isDismissed = true;
      this.hide();
    }
  }

  handleCtaClick(e) {
    const button = this.querySelector('loading-button');
    if (button) {
      button.startLoading();
      
      // Dispatch event for parent to handle
      this.dispatchEvent(new CustomEvent('sticky-cta-click', {
        detail: { originalEvent: e },
        bubbles: true
      }));
      
      // Simulate async action
      setTimeout(() => {
        button.stopLoading();
        this.dismiss();
      }, 2000);
    }
  }

  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  // Public methods
  reset() {
    this.isDismissed = false;
    const dismissKey = `sticky-cta-dismissed-${this.id || 'default'}`;
    localStorage.removeItem(dismissKey);
  }
}

// Floating Contact Molecule (uses atoms)
class FloatingContact extends HTMLElement {
  connectedCallback() {
    const phone = this.getAttribute('phone') || '';
    const email = this.getAttribute('email') || '';
    const whatsapp = this.getAttribute('whatsapp') || '';
    const position = this.getAttribute('position') || 'bottom-left';
    
    this.className = `floating-contact floating-contact--${position}`;
    
    // COMPOSE WITH ATOMS
    this.innerHTML = `
      <div class="floating-contact__container">
        <!-- Main trigger button with tooltip -->
        <tooltip-tip text="Contact Us" position="right">
          <button class="floating-contact__trigger" aria-label="Contact options">
            <span class="floating-contact__icon">💬</span>
          </button>
        </tooltip-tip>
        
        <!-- Contact options (hidden by default) -->
        <div class="floating-contact__options">
          ${phone ? `
            <tooltip-tip text="Call us" position="left">
              <a href="tel:${phone}" class="floating-contact__option">
                <badge-tag variant="ghost" icon="📞">
                  Call
                </badge-tag>
              </a>
            </tooltip-tip>
          ` : ''}
          
          ${email ? `
            <tooltip-tip text="Email us" position="left">
              <a href="mailto:${email}" class="floating-contact__option">
                <badge-tag variant="ghost" icon="✉️">
                  Email
                </badge-tag>
              </a>
            </tooltip-tip>
          ` : ''}
          
          ${whatsapp ? `
            <tooltip-tip text="WhatsApp" position="left">
              <a href="https://wa.me/${whatsapp}" class="floating-contact__option" target="_blank">
                <badge-tag variant="success" icon="💬">
                  WhatsApp
                </badge-tag>
              </a>
            </tooltip-tip>
          ` : ''}
        </div>
      </div>
    `;
    
    this.bindEvents();
  }

  bindEvents() {
    const trigger = this.querySelector('.floating-contact__trigger');
    const options = this.querySelector('.floating-contact__options');
    
    if (!trigger || !options) return;
    
    trigger.addEventListener('click', () => {
      this.classList.toggle('floating-contact--open');
      const isOpen = this.classList.contains('floating-contact--open');
      trigger.setAttribute('aria-expanded', isOpen);
      
      // Animate options
      if (isOpen) {
        options.style.display = 'flex';
        setTimeout(() => options.classList.add('floating-contact__options--visible'), 10);
      } else {
        options.classList.remove('floating-contact__options--visible');
        setTimeout(() => options.style.display = 'none', 300);
      }
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        this.classList.remove('floating-contact--open');
        options.classList.remove('floating-contact__options--visible');
        setTimeout(() => options.style.display = 'none', 300);
      }
    });
  }
}

// Newsletter Bar Molecule (uses form atoms)
class NewsletterBar extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || 'Stay Updated';
    const subtitle = this.getAttribute('subtitle') || 'Get the latest news and updates';
    const placeholder = this.getAttribute('placeholder') || 'Enter your email';
    const buttonText = this.getAttribute('button-text') || 'Subscribe';
    const position = this.getAttribute('position') || 'bottom';
    
    this.className = `newsletter-bar newsletter-bar--${position}`;
    
    // PROPERLY COMPOSE WITH ATOMS
    this.innerHTML = `
      <div class="newsletter-bar__container">
        <button class="newsletter-bar__close" aria-label="Close">×</button>
        
        <div class="newsletter-bar__content">
          <div class="newsletter-bar__text">
            <h3 class="newsletter-bar__title">${title}</h3>
            <p class="newsletter-bar__subtitle">${subtitle}</p>
          </div>
          
          <form class="newsletter-bar__form">
            <!-- Using form-input atom -->
            <form-input
              type="email"
              name="email"
              placeholder="${placeholder}"
              required
              class="newsletter-bar__input"
            ></form-input>
            
            <!-- Using loading-button atom -->
            <loading-button
              type="submit"
              variant="primary"
              loading-text="Subscribing..."
              class="newsletter-bar__button"
            >
              ${buttonText}
            </loading-button>
          </form>
        </div>
        
        <!-- Success message with badge -->
        <div class="newsletter-bar__success" style="display: none;">
          <badge-tag variant="success" size="lg" icon="✓">
            Successfully subscribed!
          </badge-tag>
        </div>
      </div>
    `;
    
    this.bindEvents();
  }

  bindEvents() {
    const form = this.querySelector('.newsletter-bar__form');
    const closeBtn = this.querySelector('.newsletter-bar__close');
    const successMsg = this.querySelector('.newsletter-bar__success');
    
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = this.querySelector('form-input');
        const submitBtn = this.querySelector('loading-button');
        
        if (!emailInput || !submitBtn) return;
        
        const email = emailInput.getValue();
        if (!email) return;
        
        // Start loading
        submitBtn.startLoading();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show success
        form.style.display = 'none';
        successMsg.style.display = 'flex';
        
        // Auto-hide after 3 seconds
        setTimeout(() => this.hide(), 3000);
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
  }

  hide() {
    this.classList.add('newsletter-bar--hidden');
    setTimeout(() => this.remove(), 300);
  }
}

// Register components
customElements.define('sticky-cta', StickyCta);
customElements.define('floating-contact', FloatingContact);
customElements.define('newsletter-bar', NewsletterBar);

export { StickyCta, FloatingContact, NewsletterBar };
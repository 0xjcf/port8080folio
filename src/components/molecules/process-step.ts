/**
 * Process Step Web Component
 * Atomic Design: Molecule
 * 
 * PROPERLY COMPOSED WITH ATOMS: badge-tag, tooltip-tip
 * Displays workflow steps with progress indication
 * Renders in light DOM for SEO
 */
class ProcessStep extends HTMLElement {
  static get observedAttributes() {
    return ['number', 'icon', 'title', 'description', 'status', 'duration', 'connected'];
  }

  connectedCallback() {
    this.render();
    this.addInteractivity();
    this.ensureAtomDependencies();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const number = this.getAttribute('number') || '';
    const icon = this.getAttribute('icon') || '';
    const title = this.getAttribute('title') || 'Step';
    const description = this.getAttribute('description') || '';
    const status = this.getAttribute('status') || 'pending';
    const duration = this.getAttribute('duration') || '';
    const connected = this.hasAttribute('connected');
    
    // Build classes
    const classes = ['process-step'];
    if (status) classes.push(`process-step--${status}`);
    if (connected) classes.push('process-step--connected');
    
    this.className = classes.join(' ');
    
    // Map status to badge variant
    const statusVariant = {
      'completed': 'success',
      'active': 'primary',
      'pending': 'ghost',
      'error': 'error'
    }[status] || 'ghost';
    
    // PROPERLY COMPOSE WITH ATOMS
    this.innerHTML = `
      <!-- Using tooltip-tip atom for step hint -->
      <tooltip-tip text="${title} - ${status}" position="left">
        <div class="process-step__marker">
          <!-- Using badge-tag atom for marker -->
          <badge-tag 
            variant="${statusVariant}" 
            size="lg"
            class="process-step__badge"
          >
            ${icon || number}
          </badge-tag>
        </div>
      </tooltip-tip>
      
      <div class="process-step__content">
        <h3 class="process-step__title">${title}</h3>
        ${description ? `<p class="process-step__description">${description}</p>` : ''}
        
        ${duration || status !== 'pending' ? `
          <div class="process-step__meta">
            ${duration ? `
              <!-- Using badge-tag atom for duration -->
              <badge-tag variant="outline" size="xs" icon="⏱">
                ${duration}
              </badge-tag>
            ` : ''}
            
            ${status === 'completed' ? `
              <!-- Using badge-tag atom for status -->
              <badge-tag variant="success" size="xs" icon="✓">
                Complete
              </badge-tag>
            ` : status === 'active' ? `
              <badge-tag variant="primary" size="xs" icon="•">
                In Progress
              </badge-tag>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  addInteractivity() {
    // Add click handler for expandable details
    if (this.hasAttribute('expandable')) {
      this.style.cursor = 'pointer';
      this.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('step-click', {
          detail: {
            number: this.getAttribute('number'),
            title: this.getAttribute('title')
          },
          bubbles: true
        }));
      });
    }
    
    // Entrance animation
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.style.animation = 'fadeIn 0.6s ease-out';
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      
      observer.observe(this);
    }
  }

  ensureAtomDependencies() {
    // Dynamically load required atoms if not already defined
    const requiredAtoms = [
      { name: 'badge-tag', path: '../atoms/badge-tag.js' },
      { name: 'tooltip-tip', path: '../atoms/tooltip-tip.js' }
    ];
    
    requiredAtoms.forEach(atom => {
      if (!customElements.get(atom.name)) {
        import(atom.path).catch(() => {
          console.warn(`${atom.name} component not found`);
        });
      }
    });
  }
}

// Process Timeline Component
class ProcessTimeline extends HTMLElement {
  connectedCallback() {
    this.className = 'process-timeline';
    
    // Get all child process items
    const items = Array.from(this.children);
    
    items.forEach((item, index) => {
      // Add timeline item class
      item.classList.add('process-timeline__item');
      
      // Animate on scroll
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            setTimeout(() => {
              item.style.animation = 'slideInLeft 0.5s ease-out';
            }, index * 100);
            observer.disconnect();
          }
        }, { threshold: 0.1 });
        
        observer.observe(item);
      }
    });
  }
}

// Trust Logos Component
class TrustLogos extends HTMLElement {
  connectedCallback() {
    const logos = this.getAttribute('logos') || '';
    const title = this.getAttribute('title') || 'Trusted By';
    const animated = this.hasAttribute('animated');
    
    this.className = 'trust-logos';
    
    // Parse logos (format: "name:url,name:url")
    const logoList = logos.split(',').map(logo => {
      const [name, url] = logo.trim().split(':');
      return { name, url };
    });
    
    // Render logos
    this.innerHTML = `
      ${title ? `<div class="trust-logos__title text-sm text-muted font-mono uppercase">${title}</div>` : ''}
      <div class="trust-logos__grid">
        ${logoList.map(logo => `
          <div class="trust-logo">
            ${logo.url ? 
              `<img src="${logo.url}" alt="${logo.name}" loading="lazy" class="trust-logo__image">` :
              `<span class="trust-logo__text">${logo.name}</span>`
            }
          </div>
        `).join('')}
      </div>
    `;
    
    // Add animation if requested
    if (animated) {
      this.addScrollAnimation();
    }
    
    // Add CSS if not exists
    if (!document.querySelector('#trust-logos-styles')) {
      const style = document.createElement('style');
      style.id = 'trust-logos-styles';
      style.textContent = `
        .trust-logos {
          text-align: center;
          padding: var(--space-6) 0;
        }
        
        .trust-logos__title {
          margin-bottom: var(--space-4);
          letter-spacing: var(--tracking-wide);
        }
        
        .trust-logos__grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: var(--space-6);
        }
        
        .trust-logo {
          flex: 0 1 150px;
          opacity: 0.6;
          transition: opacity var(--transition-base);
          filter: grayscale(100%);
        }
        
        .trust-logo:hover {
          opacity: 1;
          filter: grayscale(0%);
        }
        
        .trust-logo__image {
          max-width: 100%;
          height: 40px;
          object-fit: contain;
        }
        
        .trust-logo__text {
          font-family: var(--font-mono);
          font-size: var(--text-lg);
          color: var(--color-text-muted);
          font-weight: var(--font-semibold);
        }
        
        /* Scrolling animation */
        .trust-logos--animated .trust-logos__grid {
          display: flex;
          overflow: hidden;
          position: relative;
        }
        
        .trust-logos--animated .trust-logos__track {
          display: flex;
          gap: var(--space-6);
          animation: scroll-logos 20s linear infinite;
        }
        
        @keyframes scroll-logos {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  addScrollAnimation() {
    this.classList.add('trust-logos--animated');
    const grid = this.querySelector('.trust-logos__grid');
    const logos = grid.innerHTML;
    
    // Duplicate logos for seamless scroll
    grid.innerHTML = `
      <div class="trust-logos__track">
        ${logos}
        ${logos}
      </div>
    `;
  }
}

// Form Toggle Component
class FormToggle extends HTMLElement {
  connectedCallback() {
    const options = this.getAttribute('options') || 'Option 1,Option 2';
    const defaultOption = this.getAttribute('default') || '0';
    
    this.className = 'form-toggle';
    this.options = options.split(',').map(o => o.trim());
    this.currentIndex = parseInt(defaultOption);
    
    this.render();
    this.bindEvents();
  }

  render() {
    this.innerHTML = `
      <div class="form-toggle__buttons" role="tablist">
        ${this.options.map((option, index) => `
          <button 
            class="form-toggle__button ${index === this.currentIndex ? 'form-toggle__button--active' : ''}"
            role="tab"
            aria-selected="${index === this.currentIndex}"
            data-index="${index}">
            ${option}
          </button>
        `).join('')}
      </div>
      <div class="form-toggle__indicator" style="transform: translateX(${this.currentIndex * 100}%)"></div>
    `;
    
    // Add CSS if not exists
    if (!document.querySelector('#form-toggle-styles')) {
      const style = document.createElement('style');
      style.id = 'form-toggle-styles';
      style.textContent = `
        .form-toggle {
          display: inline-block;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-1);
          position: relative;
        }
        
        .form-toggle__buttons {
          display: flex;
          gap: var(--space-1);
          position: relative;
          z-index: 2;
        }
        
        .form-toggle__button {
          padding: var(--space-2) var(--space-4);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all var(--transition-base);
          position: relative;
        }
        
        .form-toggle__button--active {
          color: var(--color-text-primary);
        }
        
        .form-toggle__indicator {
          position: absolute;
          top: var(--space-1);
          left: var(--space-1);
          height: calc(100% - var(--space-2));
          width: calc(50% - var(--space-1));
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          transition: transform var(--transition-base);
          z-index: 1;
        }
        
        /* For 3+ options */
        .form-toggle__buttons:has(> :nth-child(3)) ~ .form-toggle__indicator {
          width: calc(33.333% - var(--space-1));
        }
        
        .form-toggle__buttons:has(> :nth-child(4)) ~ .form-toggle__indicator {
          width: calc(25% - var(--space-1));
        }
      `;
      document.head.appendChild(style);
    }
  }

  bindEvents() {
    const buttons = this.querySelectorAll('.form-toggle__button');
    const indicator = this.querySelector('.form-toggle__indicator');
    
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        // Update active states
        buttons.forEach(b => {
          b.classList.remove('form-toggle__button--active');
          b.setAttribute('aria-selected', 'false');
        });
        button.classList.add('form-toggle__button--active');
        button.setAttribute('aria-selected', 'true');
        
        // Move indicator
        const percentage = (100 / this.options.length) * index;
        indicator.style.transform = `translateX(${percentage}%)`;
        
        // Update indicator width for multiple options
        const width = 100 / this.options.length;
        indicator.style.width = `calc(${width}% - var(--space-1))`;
        
        // Dispatch event
        this.currentIndex = index;
        this.dispatchEvent(new CustomEvent('toggle-change', {
          detail: {
            index: index,
            value: this.options[index]
          },
          bubbles: true
        }));
      });
    });
  }
}

// Register components
customElements.define('process-step', ProcessStep);
customElements.define('process-timeline', ProcessTimeline);
customElements.define('trust-logos', TrustLogos);
customElements.define('form-toggle', FormToggle);

export { ProcessStep, ProcessTimeline, TrustLogos, FormToggle };
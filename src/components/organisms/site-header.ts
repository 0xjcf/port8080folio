/**
 * Site Header Web Component
 * Atomic Design: Organism
 * 
 * PROPERLY COMPOSED WITH ATOMS AND MOLECULES: badge-tag, loading-button, theme-toggle
 * Complete header with navigation, branding, and mobile menu
 * Renders in light DOM for SEO
 */
class SiteHeader extends HTMLElement {
  constructor() {
    super();
    this.isScrolled = false;
    this.isMobileMenuOpen = false;
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
    this.ensureDependencies();
  }

  disconnectedCallback() {
    this.unbindEvents();
  }

  render() {
    const logo = this.getAttribute('logo') || 'JF';
    const brand = this.getAttribute('brand') || 'Portfolio';
    const transparent = this.hasAttribute('transparent');
    const compact = this.hasAttribute('compact');
    const ctaText = this.getAttribute('cta-text') || 'Get Started';
    const ctaHref = this.getAttribute('cta-href') || '#contact';
    
    // Parse navigation items (format: "label:href:badge,label:href:badge")
    const navItems = this.getAttribute('nav-items') || 'Home:#,About:#about,Services:#services,Contact:#contact';
    const items = navItems.split(',').map(item => {
      const parts = item.trim().split(':');
      return { 
        label: parts[0], 
        href: parts[1] || '#',
        badge: parts[2] || ''
      };
    });
    
    // Build classes
    const classes = ['header'];
    if (transparent) classes.push('header--transparent');
    if (compact) classes.push('header--compact');
    
    this.className = classes.join(' ');
    
    // PROPERLY COMPOSE WITH ATOMS AND MOLECULES
    this.innerHTML = `
      <div class="header__container">
        <!-- Brand using badge-tag atom -->
        <a href="#" class="header__brand">
          <badge-tag variant="primary" size="lg" class="header__logo">
            ${logo}
          </badge-tag>
          <span class="header__brand-text">${brand}</span>
        </a>
        
        <!-- Desktop Navigation -->
        <nav class="header__nav" role="navigation">
          <ul class="header__nav-list">
            ${items.map(item => `
              <li>
                <a href="${item.href}" class="header__nav-link ${item.href === '#' ? 'header__nav-link--active' : ''}">
                  ${item.label}
                  ${item.badge ? `
                    <badge-tag variant="warning" size="xs">
                      ${item.badge}
                    </badge-tag>
                  ` : ''}
                </a>
              </li>
            `).join('')}
          </ul>
        </nav>
        
        <!-- Actions using atoms -->
        <div class="header__actions">
          <!-- Theme toggle atom -->
          <theme-toggle></theme-toggle>
          
          <!-- CTA using loading-button atom -->
          <loading-button 
            variant="primary" 
            size="sm"
            data-href="${ctaHref}"
            class="header__cta"
          >
            ${ctaText}
          </loading-button>
          
          <!-- Mobile menu toggle -->
          <button class="header__mobile-toggle" aria-label="Toggle menu">
            <span class="header__burger">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div class="header__mobile-menu">
        <nav role="navigation">
          <ul class="header__mobile-nav-list">
            ${items.map(item => `
              <li>
                <a href="${item.href}" class="header__mobile-nav-link ${item.href === '#' ? 'header__mobile-nav-link--active' : ''}">
                  ${item.label}
                  ${item.badge ? `
                    <badge-tag variant="warning" size="xs">
                      ${item.badge}
                    </badge-tag>
                  ` : ''}
                </a>
              </li>
            `).join('')}
            <li>
              <!-- Mobile CTA using loading-button atom -->
              <loading-button 
                variant="primary" 
                full-width
                data-href="${ctaHref}"
                class="header__mobile-cta"
              >
                ${ctaText}
              </loading-button>
            </li>
          </ul>
        </nav>
      </div>
    `;
  }

  ensureDependencies() {
    // Dynamically load required components
    const dependencies = [
      // Atoms
      { name: 'badge-tag', path: '../atoms/badge-tag.js' },
      { name: 'loading-button', path: '../atoms/loading-spinner.js' },
      { name: 'theme-toggle', path: '../atoms/theme-toggle.js' }
    ];
    
    dependencies.forEach(dep => {
      if (!customElements.get(dep.name)) {
        import(dep.path).catch(() => {
          console.warn(`${dep.name} component not found`);
        });
      }
    });
  }

  bindEvents() {
    // Scroll handler
    this.scrollHandler = this.throttle(() => {
      const scrolled = window.scrollY > 50;
      if (scrolled !== this.isScrolled) {
        this.isScrolled = scrolled;
        this.classList.toggle('header--scrolled', scrolled);
      }
    }, 100);
    
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    
    // Mobile menu toggle
    const navToggle = this.querySelector('.header__mobile-toggle');
    if (navToggle) {
      navToggle.addEventListener('click', () => {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        navToggle.classList.toggle('header__mobile-toggle--active', this.isMobileMenuOpen);
        const mobileMenu = this.querySelector('.header__mobile-menu');
        if (mobileMenu) {
          mobileMenu.classList.toggle('header__mobile-menu--active', this.isMobileMenuOpen);
        }
      });
    }
    
    // CTA button handlers
    const ctaButtons = this.querySelectorAll('.header__cta, .header__mobile-cta');
    ctaButtons.forEach(btn => {
      btn.addEventListener('button-click', () => {
        const href = btn.dataset.href;
        btn.startLoading();
        
        setTimeout(() => {
          btn.stopLoading();
          if (href) window.location.href = href;
        }, 1000);
      });
    });
    
    // Close mobile menu on link click
    const mobileLinks = this.querySelectorAll('.header__mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });
    
    // Active link highlighting based on scroll position
    this.highlightActiveSection();
    window.addEventListener('scroll', () => this.highlightActiveSection(), { passive: true });
  }

  unbindEvents() {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    const mobileMenu = this.querySelector('.header__mobile-menu');
    const navToggle = this.querySelector('.header__mobile-toggle');
    
    if (mobileMenu) {
      mobileMenu.classList.remove('header__mobile-menu--active');
    }
    
    if (navToggle && navToggle.toggle) {
      navToggle.classList.remove('nav-toggle--active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  highlightActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = this.querySelectorAll('.header__nav-link, .header__mobile-nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        currentSection = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('header__nav-link--active', 'header__mobile-nav-link--active');
      } else if (href !== '#' || currentSection !== '') {
        link.classList.remove('header__nav-link--active', 'header__mobile-nav-link--active');
      }
    });
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
}

// Register component
customElements.define('site-header', SiteHeader);

export { SiteHeader };
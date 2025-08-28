/**
 * Trust Logos Web Component
 * Atomic Design: Molecule
 * 
 * PROPERLY COMPOSED WITH ATOMS: badge-tag, tooltip-tip, skeleton-loader
 * Displays partner/client logos with optional carousel
 * Renders in light DOM for SEO
 */
class TrustLogos extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bindEvents();
    this.ensureAtomDependencies();
  }

  render() {
    const title = this.getAttribute('title') || '';
    const logos = this.getAttribute('logos') || '';
    const autoplay = this.hasAttribute('autoplay');
    const grayscale = this.hasAttribute('grayscale');
    const loading = this.hasAttribute('loading');
    
    // Parse logos (format: "name:url:img,name:url:img")
    const logoList = logos ? logos.split(',').map(logo => {
      const [name, url, img] = logo.trim().split(':');
      return { name, url, img };
    }) : this.getDefaultLogos();
    
    // Build classes
    const classes = ['trust-logos'];
    if (grayscale) classes.push('trust-logos--grayscale');
    if (autoplay) classes.push('trust-logos--autoplay');
    
    this.className = classes.join(' ');
    
    // PROPERLY COMPOSE WITH ATOMS
    this.innerHTML = `
      <div class="trust-logos__container">
        ${title ? `
          <h3 class="trust-logos__title">${title}</h3>
        ` : ''}
        
        ${loading ? `
          <!-- Using skeleton-loader atoms while loading -->
          <div class="trust-logos__grid">
            ${[1,2,3,4,5,6].map(() => `
              <skeleton-loader type="logo" width="120px" height="60px"></skeleton-loader>
            `).join('')}
          </div>
        ` : `
          <div class="trust-logos__grid">
            ${logoList.map(logo => `
              <!-- Using tooltip-tip atom for logo hints -->
              <tooltip-tip text="${logo.name}" position="top">
                <a 
                  href="${logo.url || '#'}" 
                  class="trust-logos__item"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="${logo.name}"
                >
                  ${logo.img ? `
                    <img 
                      src="${logo.img}" 
                      alt="${logo.name}"
                      class="trust-logos__image"
                      loading="lazy"
                    />
                  ` : `
                    <!-- Using badge-tag as fallback for missing logos -->
                    <badge-tag variant="ghost" size="lg">
                      ${logo.name}
                    </badge-tag>
                  `}
                </a>
              </tooltip-tip>
            `).join('')}
          </div>
        `}
        
        ${autoplay ? `
          <!-- Carousel controls using badge-tag atoms -->
          <div class="trust-logos__controls">
            <button 
              class="trust-logos__control trust-logos__control--prev"
              aria-label="Previous logos"
            >
              <badge-tag variant="ghost" size="sm">
                ←
              </badge-tag>
            </button>
            <button 
              class="trust-logos__control trust-logos__control--next"
              aria-label="Next logos"
            >
              <badge-tag variant="ghost" size="sm">
                →
              </badge-tag>
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  getDefaultLogos() {
    return [
      { name: 'Google', url: 'https://google.com', img: '' },
      { name: 'Microsoft', url: 'https://microsoft.com', img: '' },
      { name: 'Amazon', url: 'https://amazon.com', img: '' },
      { name: 'Apple', url: 'https://apple.com', img: '' },
      { name: 'Meta', url: 'https://meta.com', img: '' },
      { name: 'Netflix', url: 'https://netflix.com', img: '' }
    ];
  }

  bindEvents() {
    const autoplay = this.hasAttribute('autoplay');
    
    if (autoplay) {
      const grid = this.querySelector('.trust-logos__grid');
      const prevBtn = this.querySelector('.trust-logos__control--prev');
      const nextBtn = this.querySelector('.trust-logos__control--next');
      
      if (!grid) return;
      
      let currentOffset = 0;
      const itemWidth = 150; // Approximate width of each item
      
      // Next button
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          currentOffset -= itemWidth;
          grid.style.transform = `translateX(${currentOffset}px)`;
        });
      }
      
      // Previous button
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          currentOffset += itemWidth;
          if (currentOffset > 0) currentOffset = 0;
          grid.style.transform = `translateX(${currentOffset}px)`;
        });
      }
      
      // Auto-scroll
      let interval = setInterval(() => {
        currentOffset -= itemWidth;
        const maxOffset = -(grid.scrollWidth - grid.clientWidth);
        
        if (currentOffset < maxOffset) {
          currentOffset = 0;
        }
        
        grid.style.transform = `translateX(${currentOffset}px)`;
      }, 3000);
      
      // Pause on hover
      grid.addEventListener('mouseenter', () => clearInterval(interval));
      grid.addEventListener('mouseleave', () => {
        interval = setInterval(() => {
          currentOffset -= itemWidth;
          const maxOffset = -(grid.scrollWidth - grid.clientWidth);
          
          if (currentOffset < maxOffset) {
            currentOffset = 0;
          }
          
          grid.style.transform = `translateX(${currentOffset}px)`;
        }, 3000);
      });
    }
    
    // Entrance animation
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const items = this.querySelectorAll('.trust-logos__item');
            items.forEach((item, i) => {
              setTimeout(() => {
                item.style.animation = 'fadeIn 0.5s ease-out';
              }, i * 100);
            });
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(this);
    }
  }

  ensureAtomDependencies() {
    // Dynamically load required atoms if not already defined
    const requiredAtoms = [
      { name: 'badge-tag', path: '../atoms/badge-tag.js' },
      { name: 'tooltip-tip', path: '../atoms/tooltip-tip.js' },
      { name: 'skeleton-loader', path: '../atoms/loading-spinner.js' }
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

// Register component
customElements.define('trust-logos', TrustLogos);

export { TrustLogos };
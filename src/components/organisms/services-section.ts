/**
 * Services Section Web Component
 * Atomic Design: Organism
 * 
 * PROPERLY COMPOSED WITH MOLECULES AND ATOMS:
 * Uses: service-card (molecule), badge-tag (atom), form-select (atom)
 * Renders in light DOM for SEO
 */
class ServicesSection extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bindEvents();
    this.ensureDependencies();
  }

  render() {
    const title = this.getAttribute('title') || 'Our Services';
    const subtitle = this.getAttribute('subtitle') || '';
    const services = this.getAttribute('services') || '';
    const filterable = this.hasAttribute('filterable');
    
    // Parse services or use defaults
    const serviceList = services ? JSON.parse(services) : this.getDefaultServices();
    
    // Extract unique tags for filtering
    const allTags = [...new Set(serviceList.flatMap(s => s.tags?.split(',').map(t => t.trim()) || []))];
    
    this.className = 'services-section';
    
    // COMPOSE WITH MOLECULES AND ATOMS
    this.innerHTML = `
      <div class="services-section__container">
        <!-- Section header -->
        <header class="services-section__header">
          <h2 class="services-section__title">${title}</h2>
          ${subtitle ? `<p class="services-section__subtitle">${subtitle}</p>` : ''}
          
          ${filterable && allTags.length > 0 ? `
            <!-- Filter controls using atoms -->
            <div class="services-section__filters">
              <!-- Using badge-tag atoms for filter buttons -->
              <badge-tag 
                variant="primary" 
                size="sm" 
                class="services-section__filter services-section__filter--active"
                data-filter="all"
              >
                All Services
              </badge-tag>
              ${allTags.map(tag => `
                <badge-tag 
                  variant="ghost" 
                  size="sm" 
                  class="services-section__filter"
                  data-filter="${tag}"
                >
                  ${tag}
                </badge-tag>
              `).join('')}
            </div>
          ` : ''}
        </header>
        
        <!-- Services grid using service-card molecules -->
        <div class="services-section__grid">
          ${serviceList.map((service, index) => `
            <service-card
              title="${service.title}"
              description="${service.description}"
              icon="${service.icon || '🚀'}"
              tags="${service.tags || ''}"
              metrics="${service.metrics || ''}"
              accent="${service.accent || 'purple'}"
              ${service.featured ? 'featured' : ''}
              cta-text="${service.ctaText || 'Learn more'}"
              class="services-section__card"
              style="animation-delay: ${index * 0.1}s"
            ></service-card>
          `).join('')}
        </div>
        
        <!-- Optional CTA -->
        ${this.hasAttribute('show-cta') ? `
          <footer class="services-section__footer">
            <p class="services-section__cta-text">Need something custom?</p>
            <loading-button variant="primary" data-href="#contact">
              Let's discuss your project
            </loading-button>
          </footer>
        ` : ''}
      </div>
    `;
  }

  getDefaultServices() {
    return [
      {
        title: 'Web Development',
        description: 'Custom web applications built with modern technologies and best practices.',
        icon: '💻',
        tags: 'Frontend,Backend,Full Stack',
        metrics: '50+ Projects',
        accent: 'purple',
        featured: true
      },
      {
        title: 'API Integration',
        description: 'Seamless integration with third-party services and APIs.',
        icon: '🔌',
        tags: 'REST,GraphQL,Webhooks',
        metrics: '100+ Integrations',
        accent: 'blue'
      },
      {
        title: 'Performance Optimization',
        description: 'Speed up your application with expert performance tuning.',
        icon: '⚡',
        tags: 'Speed,SEO,Core Web Vitals',
        metrics: '3x Faster',
        accent: 'green'
      },
      {
        title: 'Technical Consulting',
        description: 'Strategic technical guidance for your business growth.',
        icon: '🎯',
        tags: 'Strategy,Architecture,Review',
        metrics: '24/7 Support',
        accent: 'orange'
      }
    ];
  }

  bindEvents() {
    // Filter functionality
    const filters = this.querySelectorAll('.services-section__filter');
    const cards = this.querySelectorAll('.services-section__card');
    
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        const filterValue = filter.dataset.filter;
        
        // Update active filter
        filters.forEach(f => {
          f.setAttribute('variant', 'ghost');
          f.classList.remove('services-section__filter--active');
        });
        filter.setAttribute('variant', 'primary');
        filter.classList.add('services-section__filter--active');
        
        // Filter cards
        cards.forEach(card => {
          if (filterValue === 'all') {
            card.style.display = '';
            card.style.animation = 'fadeIn 0.5s ease-out';
          } else {
            const cardTags = card.getAttribute('tags') || '';
            if (cardTags.toLowerCase().includes(filterValue.toLowerCase())) {
              card.style.display = '';
              card.style.animation = 'fadeIn 0.5s ease-out';
            } else {
              card.style.animation = 'fadeOut 0.3s ease-out';
              setTimeout(() => card.style.display = 'none', 300);
            }
          }
        });
      });
    });
    
    // Handle CTA click
    const ctaButton = this.querySelector('loading-button');
    if (ctaButton) {
      ctaButton.addEventListener('button-click', (e) => {
        const href = ctaButton.dataset.href;
        ctaButton.startLoading();
        
        setTimeout(() => {
          ctaButton.stopLoading();
          if (href) window.location.href = href;
        }, 1500);
      });
    }
    
    // Entrance animations
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('services-section--visible');
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(this);
    }
  }

  ensureDependencies() {
    // Dynamically load required atoms and molecules
    const dependencies = [
      // Molecules
      { name: 'service-card', path: '../molecules/service-card.js' },
      // Atoms
      { name: 'badge-tag', path: '../atoms/badge-tag.js' },
      { name: 'loading-button', path: '../atoms/loading-spinner.js' }
    ];
    
    dependencies.forEach(dep => {
      if (!customElements.get(dep.name)) {
        import(dep.path).catch(() => {
          console.warn(`${dep.name} component not found`);
        });
      }
    });
  }
}

// Register component
customElements.define('services-section', ServicesSection);

export { ServicesSection };
/**
 * Service Card Web Component
 * Atomic Design: Molecule
 * 
 * PROPERLY COMPOSED WITH ATOMS: badge-tag, tooltip-tip, loading-button
 * Renders service offering card in light DOM for SEO
 */
class ServiceCard extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'icon', 'metrics', 'accent', 'tags', 'cta-text', 'featured'];
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
    // Get attributes with defaults
    const title = this.getAttribute('title') || 'Service';
    const description = this.getAttribute('description') || '';
    const icon = this.getAttribute('icon') || '🚀';
    const metrics = this.getAttribute('metrics') || '';
    const accent = this.getAttribute('accent') || 'purple';
    const tags = this.getAttribute('tags') || ''; // comma-separated
    const ctaText = this.getAttribute('cta-text') || 'Learn more';
    const featured = this.hasAttribute('featured');

    // Parse tags
    const tagList = tags ? tags.split(',').map(t => t.trim()) : [];

    // PROPERLY COMPOSE WITH ATOMS
    this.innerHTML = `
      <article class="card card--service card--hover card--accent-${accent}">
        ${featured ? `
          <!-- Using badge-tag atom for featured indicator -->
          <badge-tag 
            variant="warning" 
            size="sm" 
            class="card__featured"
            icon="⭐"
          >
            Featured
          </badge-tag>
        ` : ''}
        
        <!-- Icon with tooltip atom -->
        <tooltip-tip text="${title}" position="top">
          <div class="card__icon">
            <span aria-hidden="true">${icon}</span>
          </div>
        </tooltip-tip>
        
        <header class="card__header">
          <h3 class="card__title font-semibold text-lg">${title}</h3>
        </header>
        
        <div class="card__body">
          <p class="text-secondary leading-relaxed">${description}</p>
          
          ${tagList.length > 0 ? `
            <!-- Using badge-tag atoms for tags -->
            <div class="card__tags">
              ${tagList.map(tag => `
                <badge-tag variant="ghost" size="xs">
                  ${tag}
                </badge-tag>
              `).join('')}
            </div>
          ` : ''}
          
          ${metrics ? `
            <!-- Using badge-tag atom for metrics -->
            <div class="card__metrics mt-4">
              <badge-tag 
                variant="primary" 
                size="sm"
                class="font-mono"
              >
                ${metrics}
              </badge-tag>
            </div>
          ` : ''}
        </div>
        
        <footer class="card__footer">
          <!-- Using loading-button atom for CTA -->
          <loading-button
            variant="ghost"
            class="card__cta"
            data-service="${title}"
          >
            ${ctaText}
            <span aria-hidden="true">→</span>
          </loading-button>
        </footer>
      </article>
    `;
  }

  addInteractivity() {
    // Handle CTA button click
    const ctaButton = this.querySelector('loading-button');
    if (ctaButton) {
      ctaButton.addEventListener('button-click', (e) => {
        e.stopPropagation();

        // Start loading
        ctaButton.startLoading();

        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('service-cta-click', {
          detail: {
            title: this.getAttribute('title'),
            description: this.getAttribute('description')
          },
          bubbles: true
        }));

        // Stop loading after delay (parent should handle actual action)
        setTimeout(() => ctaButton.stopLoading(), 1500);
      });
    }

    // Card click handler (excluding button clicks)
    this.addEventListener('click', (e) => {
      // Don't trigger if clicking the button
      if (e.target.closest('loading-button')) return;

      this.dispatchEvent(new CustomEvent('service-selected', {
        detail: {
          title: this.getAttribute('title'),
          description: this.getAttribute('description')
        },
        bubbles: true
      }));
    });

    // Entrance animation
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.classList.add('animate-in');
            observer.unobserve(this);
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
      { name: 'loading-button', path: '../atoms/loading-spinner.js' }
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

// Register the component
customElements.define('service-card', ServiceCard);

export { ServiceCard };

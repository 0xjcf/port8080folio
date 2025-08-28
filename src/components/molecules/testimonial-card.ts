/**
 * Testimonial Card Web Component
 * Atomic Design: Molecule
 * 
 * PROPERLY COMPOSED WITH ATOMS: badge-tag, tooltip-tip
 * Renders testimonial/quote in light DOM for SEO
 */
class TestimonialCard extends HTMLElement {
  static get observedAttributes() {
    return ['quote', 'author', 'role', 'company', 'rating', 'verified', 'date', 'featured'];
  }

  connectedCallback() {
    this.render();
    this.addInteractivity();
    this.ensureAtomDependencies();
  }

  attributeChangedCallback() {
    this.render();
    this.addInteractivity();
  }

  render() {
    const quote = this.getAttribute('quote') || 'Great experience!';
    const author = this.getAttribute('author') || 'Anonymous';
    const role = this.getAttribute('role') || '';
    const company = this.getAttribute('company') || '';
    const rating = parseInt(this.getAttribute('rating')) || 0;
    const verified = this.hasAttribute('verified');
    const date = this.getAttribute('date') || '';
    const featured = this.hasAttribute('featured');
    
    // Build classes
    const classes = ['testimonial-card', 'card'];
    if (featured) classes.push('testimonial-card--featured');
    
    this.className = classes.join(' ');
    
    // PROPERLY COMPOSE WITH ATOMS
    this.innerHTML = `
      <article class="testimonial-card__container">
        ${featured ? `
          <!-- Using badge-tag atom for featured indicator -->
          <badge-tag 
            variant="warning" 
            size="sm" 
            icon="⭐"
            class="testimonial-card__featured-badge"
          >
            Featured Review
          </badge-tag>
        ` : ''}
        
        ${rating > 0 ? `
          <!-- Star rating display -->
          <div class="testimonial-card__rating">
            ${this.renderStars(rating)}
            ${verified ? `
              <!-- Using badge-tag atom for verified indicator -->
              <badge-tag 
                variant="success" 
                size="xs"
                icon="✓"
              >
                Verified
              </badge-tag>
            ` : ''}
          </div>
        ` : ''}
        
        <!-- Quote content -->
        <blockquote class="testimonial-card__quote">
          <p class="testimonial-card__text">
            "${quote}"
          </p>
        </blockquote>
        
        <!-- Author info with proper atoms -->
        <footer class="testimonial-card__footer">
          <div class="testimonial-card__author">
            <!-- Avatar with tooltip -->
            <tooltip-tip text="${author}" position="top">
              <div class="testimonial-card__avatar">
                ${this.getInitials(author)}
              </div>
            </tooltip-tip>
            
            <div class="testimonial-card__author-info">
              <cite class="testimonial-card__author-name">
                ${author}
              </cite>
              
              <div class="testimonial-card__author-meta">
                ${role || company ? `
                  <!-- Using badge-tag atoms for role/company -->
                  <div class="testimonial-card__badges">
                    ${role ? `
                      <badge-tag variant="ghost" size="xs">
                        ${role}
                      </badge-tag>
                    ` : ''}
                    ${company ? `
                      <badge-tag variant="outline" size="xs">
                        @${company}
                      </badge-tag>
                    ` : ''}
                  </div>
                ` : ''}
                
                ${date ? `
                  <!-- Date with tooltip for full timestamp -->
                  <tooltip-tip text="Posted on ${date}" position="bottom">
                    <span class="testimonial-card__date">
                      ${this.formatDate(date)}
                    </span>
                  </tooltip-tip>
                ` : ''}
              </div>
            </div>
          </div>
        </footer>
      </article>
    `;
  }

  renderStars(rating) {
    const maxStars = 5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = maxStars - Math.ceil(rating);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars += '<span class="testimonial-card__star testimonial-card__star--full">★</span>';
    }
    
    // Half star
    if (hasHalfStar) {
      stars += '<span class="testimonial-card__star testimonial-card__star--half">★</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += '<span class="testimonial-card__star testimonial-card__star--empty">☆</span>';
    }
    
    return `<span class="testimonial-card__stars" aria-label="${rating} out of 5 stars">${stars}</span>`;
  }

  getInitials(name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  addInteractivity() {
    // Add hover effect
    this.addEventListener('mouseenter', () => {
      this.classList.add('testimonial-card--hover');
    });
    
    this.addEventListener('mouseleave', () => {
      this.classList.remove('testimonial-card--hover');
    });
    
    // Entrance animation
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.style.animation = 'fadeInUp 0.6s ease-out';
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      
      observer.observe(this);
    }
    
    // Click to expand full quote if truncated
    const quoteText = this.querySelector('.testimonial-card__text');
    if (quoteText && quoteText.scrollHeight > quoteText.clientHeight) {
      this.classList.add('testimonial-card--expandable');
      
      this.addEventListener('click', () => {
        this.classList.toggle('testimonial-card--expanded');
      });
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

// Testimonial Slider Molecule (composed of multiple testimonial cards)
class TestimonialSlider extends HTMLElement {
  constructor() {
    super();
    this.currentIndex = 0;
    this.autoplayInterval = null;
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
    if (this.hasAttribute('autoplay')) {
      this.startAutoplay();
    }
  }

  disconnectedCallback() {
    this.stopAutoplay();
  }

  render() {
    const testimonials = this.getAttribute('testimonials') || '';
    
    // Parse testimonials JSON or use demo data
    const items = testimonials ? JSON.parse(testimonials) : this.getDemoTestimonials();
    
    this.className = 'testimonial-slider';
    
    // COMPOSE WITH TESTIMONIAL-CARD MOLECULES
    this.innerHTML = `
      <div class="testimonial-slider__container">
        <div class="testimonial-slider__track">
          ${items.map((item, index) => `
            <testimonial-card
              class="testimonial-slider__item ${index === 0 ? 'testimonial-slider__item--active' : ''}"
              quote="${item.quote}"
              author="${item.author}"
              role="${item.role || ''}"
              company="${item.company || ''}"
              rating="${item.rating || ''}"
              ${item.verified ? 'verified' : ''}
              date="${item.date || ''}"
              ${item.featured ? 'featured' : ''}
            ></testimonial-card>
          `).join('')}
        </div>
        
        <!-- Navigation with badge-tag atoms -->
        <div class="testimonial-slider__nav">
          <button class="testimonial-slider__prev" aria-label="Previous testimonial">
            ←
          </button>
          
          <!-- Page indicators using badge-tag -->
          <div class="testimonial-slider__dots">
            ${items.map((_, index) => `
              <badge-tag 
                variant="${index === 0 ? 'primary' : 'ghost'}" 
                size="xs"
                class="testimonial-slider__dot"
                data-index="${index}"
              >
                ${index + 1}
              </badge-tag>
            `).join('')}
          </div>
          
          <button class="testimonial-slider__next" aria-label="Next testimonial">
            →
          </button>
        </div>
      </div>
    `;
  }

  getDemoTestimonials() {
    return [
      {
        quote: "Outstanding service! The attention to detail and professionalism exceeded our expectations.",
        author: "Sarah Johnson",
        role: "CEO",
        company: "TechCorp",
        rating: 5,
        verified: true,
        featured: true
      },
      {
        quote: "Working with this team transformed our business. Highly recommended!",
        author: "Michael Chen",
        role: "Product Manager",
        company: "StartupXYZ",
        rating: 5,
        verified: true
      },
      {
        quote: "Exceptional quality and fast delivery. Will definitely work with them again.",
        author: "Emily Rodriguez",
        role: "Designer",
        company: "Creative Studio",
        rating: 4.5
      }
    ];
  }

  bindEvents() {
    const prevBtn = this.querySelector('.testimonial-slider__prev');
    const nextBtn = this.querySelector('.testimonial-slider__next');
    const dots = this.querySelectorAll('.testimonial-slider__dot');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prev());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.next());
    }
    
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goTo(index));
    });
  }

  prev() {
    const items = this.querySelectorAll('.testimonial-slider__item');
    const total = items.length;
    
    this.currentIndex = (this.currentIndex - 1 + total) % total;
    this.updateSlider();
  }

  next() {
    const items = this.querySelectorAll('.testimonial-slider__item');
    const total = items.length;
    
    this.currentIndex = (this.currentIndex + 1) % total;
    this.updateSlider();
  }

  goTo(index) {
    this.currentIndex = index;
    this.updateSlider();
  }

  updateSlider() {
    const items = this.querySelectorAll('.testimonial-slider__item');
    const dots = this.querySelectorAll('.testimonial-slider__dot');
    
    items.forEach((item, index) => {
      if (index === this.currentIndex) {
        item.classList.add('testimonial-slider__item--active');
      } else {
        item.classList.remove('testimonial-slider__item--active');
      }
    });
    
    dots.forEach((dot, index) => {
      if (index === this.currentIndex) {
        dot.setAttribute('variant', 'primary');
      } else {
        dot.setAttribute('variant', 'ghost');
      }
    });
  }

  startAutoplay() {
    const delay = parseInt(this.getAttribute('autoplay-delay')) || 5000;
    this.autoplayInterval = setInterval(() => this.next(), delay);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
}

// Register components
customElements.define('testimonial-card', TestimonialCard);
customElements.define('testimonial-slider', TestimonialSlider);

export { TestimonialCard, TestimonialSlider };
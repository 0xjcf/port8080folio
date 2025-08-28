/**
 * Footer Section Web Component
 * Atomic Design: Organism
 * 
 * PROPERLY COMPOSED WITH MOLECULES AND ATOMS:
 * Uses: form-input, loading-button, badge-tag (atoms)
 * Uses: newsletter-bar, social-proof (molecules)
 * Renders in light DOM for SEO
 */
class FooterSection extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bindEvents();
    this.ensureDependencies();
  }

  render() {
    const copyright = this.getAttribute('copyright') || `© ${new Date().getFullYear()} Your Company`;
    const showNewsletter = this.hasAttribute('show-newsletter');
    const showSocial = this.hasAttribute('show-social');
    const socialLinks = this.getAttribute('social-links') || '';
    
    // Parse social links (format: "platform:url,platform:url")
    const socials = socialLinks ? socialLinks.split(',').map(link => {
      const [platform, url] = link.trim().split(':');
      return { platform, url };
    }) : this.getDefaultSocials();
    
    // Footer links structure
    const footerLinks = this.getAttribute('links') || '';
    const linkSections = footerLinks ? JSON.parse(footerLinks) : this.getDefaultLinks();
    
    this.className = 'footer-section';
    
    // COMPOSE WITH MOLECULES AND ATOMS
    this.innerHTML = `
      <footer class="footer-section__container">
        ${showNewsletter ? `
          <!-- Newsletter signup using atoms -->
          <div class="footer-section__newsletter">
            <div class="footer-section__newsletter-content">
              <h3 class="footer-section__newsletter-title">
                Stay Updated
              </h3>
              <p class="footer-section__newsletter-text">
                Get the latest updates and exclusive content
              </p>
              <form class="footer-section__newsletter-form">
                <form-input
                  type="email"
                  name="newsletter_email"
                  placeholder="Enter your email"
                  required
                  class="footer-section__newsletter-input"
                ></form-input>
                <loading-button
                  type="submit"
                  variant="primary"
                  loading-text="Subscribing..."
                  class="footer-section__newsletter-button"
                >
                  Subscribe
                </loading-button>
              </form>
              <!-- Trust badges -->
              <div class="footer-section__newsletter-trust">
                <badge-tag variant="ghost" size="xs" icon="🔒">
                  No spam
                </badge-tag>
                <badge-tag variant="ghost" size="xs" icon="📧">
                  Weekly updates
                </badge-tag>
                <badge-tag variant="ghost" size="xs" icon="❌">
                  Unsubscribe anytime
                </badge-tag>
              </div>
            </div>
            
            <!-- Social proof for newsletter -->
            <social-proof
              type="users"
              count="5000"
              label="Subscribers"
              class="footer-section__newsletter-proof"
            ></social-proof>
          </div>
        ` : ''}
        
        <!-- Main footer content -->
        <div class="footer-section__main">
          <div class="footer-section__grid">
            <!-- Brand column -->
            <div class="footer-section__brand">
              <div class="footer-section__logo">
                <badge-tag variant="primary" size="lg">
                  Your Brand
                </badge-tag>
              </div>
              <p class="footer-section__tagline">
                Building amazing digital experiences
              </p>
              
              ${showSocial ? `
                <!-- Social links using badge-tag atoms -->
                <div class="footer-section__social">
                  ${socials.map(social => `
                    <tooltip-tip text="${social.platform}" position="top">
                      <a 
                        href="${social.url}" 
                        class="footer-section__social-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <badge-tag variant="ghost" size="sm">
                          ${this.getSocialIcon(social.platform)}
                        </badge-tag>
                      </a>
                    </tooltip-tip>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            
            <!-- Link sections -->
            ${linkSections.map(section => `
              <div class="footer-section__links">
                <h4 class="footer-section__links-title">${section.title}</h4>
                <ul class="footer-section__links-list">
                  ${section.links.map(link => `
                    <li>
                      <a href="${link.url}" class="footer-section__link">
                        ${link.label}
                        ${link.badge ? `
                          <badge-tag variant="${link.badge.variant || 'primary'}" size="xs">
                            ${link.badge.text}
                          </badge-tag>
                        ` : ''}
                      </a>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `).join('')}
            
            <!-- Quick contact -->
            <div class="footer-section__contact">
              <h4 class="footer-section__contact-title">Quick Contact</h4>
              
              <div class="footer-section__contact-items">
                <div class="footer-section__contact-item">
                  <copy-button text="hello@example.com" compact>
                    <badge-tag variant="outline" size="sm" icon="📧">
                      hello@example.com
                    </badge-tag>
                  </copy-button>
                </div>
                
                <div class="footer-section__contact-item">
                  <badge-tag variant="outline" size="sm" icon="📱">
                    +1 (555) 123-4567
                  </badge-tag>
                </div>
                
                <div class="footer-section__contact-item">
                  <badge-tag variant="outline" size="sm" icon="⏰">
                    Mon-Fri 9am-5pm PST
                  </badge-tag>
                </div>
              </div>
              
              <!-- Quick action -->
              <loading-button 
                variant="outline" 
                data-href="#contact"
                class="footer-section__cta"
              >
                Start a Project
              </loading-button>
            </div>
          </div>
        </div>
        
        <!-- Bottom bar -->
        <div class="footer-section__bottom">
          <div class="footer-section__bottom-content">
            <p class="footer-section__copyright">${copyright}</p>
            
            <nav class="footer-section__bottom-links">
              <a href="/privacy" class="footer-section__bottom-link">Privacy Policy</a>
              <a href="/terms" class="footer-section__bottom-link">Terms of Service</a>
              <a href="/cookies" class="footer-section__bottom-link">Cookie Policy</a>
            </nav>
            
            <!-- Theme toggle in footer -->
            <theme-toggle class="footer-section__theme-toggle"></theme-toggle>
          </div>
          
          <!-- Back to top -->
          <back-to-top compact></back-to-top>
        </div>
      </footer>
    `;
  }

  getDefaultSocials() {
    return [
      { platform: 'GitHub', url: 'https://github.com' },
      { platform: 'LinkedIn', url: 'https://linkedin.com' },
      { platform: 'Twitter', url: 'https://twitter.com' },
      { platform: 'Discord', url: 'https://discord.com' }
    ];
  }

  getSocialIcon(platform) {
    const icons = {
      'GitHub': '🐙',
      'LinkedIn': '💼',
      'Twitter': '🐦',
      'Discord': '💬',
      'Instagram': '📷',
      'YouTube': '📺',
      'Facebook': '👤'
    };
    return icons[platform] || '🔗';
  }

  getDefaultLinks() {
    return [
      {
        title: 'Services',
        links: [
          { label: 'Web Development', url: '#services' },
          { label: 'API Integration', url: '#services' },
          { label: 'Performance', url: '#services' },
          { label: 'Consulting', url: '#services', badge: { text: 'New', variant: 'warning' } }
        ]
      },
      {
        title: 'Resources',
        links: [
          { label: 'Documentation', url: '/docs' },
          { label: 'Blog', url: '/blog' },
          { label: 'Case Studies', url: '/cases' },
          { label: 'FAQ', url: '/faq' }
        ]
      },
      {
        title: 'Company',
        links: [
          { label: 'About Us', url: '/about' },
          { label: 'Team', url: '/team' },
          { label: 'Careers', url: '/careers', badge: { text: 'Hiring', variant: 'success' } },
          { label: 'Contact', url: '#contact' }
        ]
      }
    ];
  }

  bindEvents() {
    // Newsletter form
    const newsletterForm = this.querySelector('.footer-section__newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = this.querySelector('.footer-section__newsletter-input');
        const submitBtn = this.querySelector('.footer-section__newsletter-button');
        
        if (!emailInput || !submitBtn) return;
        
        const email = emailInput.getValue();
        if (!email) return;
        
        // Start loading
        submitBtn.startLoading();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show success
        this.showNewsletterSuccess();
        
        submitBtn.stopLoading();
      });
    }
    
    // CTA button
    const ctaButton = this.querySelector('.footer-section__cta');
    if (ctaButton) {
      ctaButton.addEventListener('button-click', () => {
        const href = ctaButton.dataset.href;
        ctaButton.startLoading();
        
        setTimeout(() => {
          ctaButton.stopLoading();
          if (href) window.location.href = href;
        }, 1000);
      });
    }
    
    // Copy email feedback
    const copyButtons = this.querySelectorAll('copy-button');
    copyButtons.forEach(btn => {
      btn.addEventListener('copy-success', () => {
        this.showToast('Email copied!');
      });
    });
  }

  showNewsletterSuccess() {
    const form = this.querySelector('.footer-section__newsletter-form');
    if (form) {
      form.innerHTML = `
        <badge-tag variant="success" size="lg" icon="✓">
          Successfully subscribed!
        </badge-tag>
      `;
    }
  }

  showToast(message) {
    // Create toast using badge-tag
    const toast = document.createElement('div');
    toast.className = 'toast toast--bottom';
    toast.innerHTML = `
      <badge-tag variant="success" size="sm">
        ${message}
      </badge-tag>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('toast--visible'), 100);
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  ensureDependencies() {
    // Dynamically load required components
    const dependencies = [
      // Atoms
      { name: 'form-input', path: '../atoms/form-input.js' },
      { name: 'loading-button', path: '../atoms/loading-spinner.js' },
      { name: 'badge-tag', path: '../atoms/badge-tag.js' },
      { name: 'copy-button', path: '../atoms/copy-button.js' },
      { name: 'tooltip-tip', path: '../atoms/tooltip-tip.js' },
      { name: 'theme-toggle', path: '../atoms/theme-toggle.js' },
      { name: 'back-to-top', path: '../atoms/back-to-top.js' },
      // Molecules
      { name: 'social-proof', path: '../molecules/social-proof.js' }
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
customElements.define('footer-section', FooterSection);

export { FooterSection };
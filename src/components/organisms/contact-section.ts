/**
 * Contact Section Web Component
 * Atomic Design: Organism
 * 
 * PROPERLY COMPOSED WITH MOLECULES AND ATOMS:
 * Uses: form-input, form-textarea, form-select (atoms)
 * Uses: social-proof, trust-indicator (molecules)
 * Renders in light DOM for SEO
 */
class ContactSection extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bindEvents();
    this.ensureDependencies();
  }

  render() {
    const title = this.getAttribute('title') || 'Get In Touch';
    const subtitle = this.getAttribute('subtitle') || "Let's discuss your project";
    const formAction = this.getAttribute('form-action') || '#';
    const showSocialProof = this.hasAttribute('show-social-proof');
    const showMap = this.hasAttribute('show-map');
    
    this.className = 'contact-section';
    
    // COMPOSE WITH ATOMS AND MOLECULES
    this.innerHTML = `
      <div class="contact-section__container">
        <header class="contact-section__header">
          <h2 class="contact-section__title">${title}</h2>
          <p class="contact-section__subtitle">${subtitle}</p>
          
          ${showSocialProof ? `
            <!-- Using social-proof molecule -->
            <social-proof
              type="customers"
              count="500"
              label="Happy Clients"
              animate
              class="contact-section__social-proof"
            ></social-proof>
          ` : ''}
        </header>
        
        <div class="contact-section__content">
          <!-- Contact Form using form atoms -->
          <div class="contact-section__form-wrapper">
            <form class="contact-section__form" action="${formAction}" method="POST">
              <!-- Using form-radio atom for inquiry type -->
              <form-radio
                name="inquiry_type"
                label="What can we help you with?"
                options="New Project:new,Consultation:consultation,Support:support,Other:other"
                value="new"
                required
                card-style
                class="contact-section__field"
              ></form-radio>
              
              <div class="contact-section__row">
                <!-- Using form-input atoms -->
                <form-input
                  type="text"
                  name="name"
                  label="Your Name"
                  placeholder="John Doe"
                  required
                  class="contact-section__field"
                ></form-input>
                
                <form-input
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="john@example.com"
                  required
                  class="contact-section__field"
                ></form-input>
              </div>
              
              <div class="contact-section__row">
                <form-input
                  type="tel"
                  name="phone"
                  label="Phone Number"
                  placeholder="+1 (555) 123-4567"
                  helper="Optional"
                  class="contact-section__field"
                ></form-input>
                
                <!-- Using form-select atom -->
                <form-select
                  name="budget"
                  label="Project Budget"
                  options="< $5k,$ 5k - 10k,$10k - 25k,$25k - 50k,> $50k"
                  placeholder="Select budget range"
                  class="contact-section__field"
                ></form-select>
              </div>
              
              <!-- Using form-textarea atom -->
              <form-textarea
                name="message"
                label="Project Details"
                placeholder="Tell us about your project..."
                rows="5"
                maxlength="1000"
                required
                autoresize
                class="contact-section__field"
              ></form-textarea>
              
              <!-- Using form-checkbox atom -->
              <form-checkbox
                name="newsletter"
                label="Send me updates about new services and tips"
                class="contact-section__field"
              ></form-checkbox>
              
              <!-- Submit button using loading-button atom -->
              <div class="contact-section__actions">
                <loading-button
                  type="submit"
                  variant="primary"
                  loading-text="Sending..."
                  class="contact-section__submit"
                >
                  Send Message
                </loading-button>
                
                <!-- Trust indicators using badge-tag atoms -->
                <div class="contact-section__trust">
                  <badge-tag variant="ghost" size="xs" icon="🔒">
                    SSL Secured
                  </badge-tag>
                  <badge-tag variant="ghost" size="xs" icon="⚡">
                    Quick Response
                  </badge-tag>
                </div>
              </div>
            </form>
          </div>
          
          <!-- Contact Info Panel -->
          <div class="contact-section__info">
            <!-- Direct contact options -->
            <div class="contact-section__direct">
              <h3 class="contact-section__info-title">Direct Contact</h3>
              
              <div class="contact-section__info-item">
                <tooltip-tip text="Click to copy" position="right">
                  <div class="contact-section__info-row">
                    <badge-tag variant="outline" size="sm" icon="📧">
                      Email
                    </badge-tag>
                    <copy-button text="hello@example.com" compact>
                      hello@example.com
                    </copy-button>
                  </div>
                </tooltip-tip>
              </div>
              
              <div class="contact-section__info-item">
                <tooltip-tip text="Business hours: 9-5 PST" position="right">
                  <div class="contact-section__info-row">
                    <badge-tag variant="outline" size="sm" icon="📱">
                      Phone
                    </badge-tag>
                    <span>+1 (555) 123-4567</span>
                  </div>
                </tooltip-tip>
              </div>
              
              <div class="contact-section__info-item">
                <div class="contact-section__info-row">
                  <badge-tag variant="outline" size="sm" icon="📍">
                    Location
                  </badge-tag>
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
            
            <!-- Response time indicator -->
            <div class="contact-section__response">
              <activity-feed 
                items="Email received:Just now,Team notified:2m ago,Typical response:< 2 hours"
              ></activity-feed>
            </div>
            
            <!-- Trust indicators -->
            <trust-indicator
              rating="4.9"
              reviews="127"
              certifications="ISO 27001,GDPR Compliant"
              class="contact-section__trust-indicator"
            ></trust-indicator>
          </div>
        </div>
        
        ${showMap ? `
          <!-- Map placeholder -->
          <div class="contact-section__map">
            <skeleton-loader type="image" width="100%" height="400px"></skeleton-loader>
          </div>
        ` : ''}
      </div>
    `;
  }

  bindEvents() {
    const form = this.querySelector('.contact-section__form');
    
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = this.querySelector('.contact-section__submit');
        if (!submitBtn) return;
        
        // Start loading
        submitBtn.startLoading();
        
        // Gather form data
        const formData = new FormData(form);
        
        // Simulate API call
        try {
          await this.submitForm(formData);
          
          // Show success
          this.showSuccess();
        } catch (error) {
          this.showError(error.message);
        } finally {
          submitBtn.stopLoading();
        }
      });
    }
    
    // Copy email functionality
    const copyButtons = this.querySelectorAll('copy-button');
    copyButtons.forEach(btn => {
      btn.addEventListener('copy-success', (e) => {
        // Show toast notification
        this.showToast('Email copied to clipboard!');
      });
    });
    
    // Form field validation
    const fields = this.querySelectorAll('form-input, form-textarea, form-select');
    fields.forEach(field => {
      field.addEventListener('input-change', (e) => {
        // Clear any previous errors
        if (field.getAttribute('error')) {
          field.removeAttribute('error');
        }
      });
    });
  }

  async submitForm(formData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real implementation, this would send to your API
    const response = await fetch(this.getAttribute('form-action') || '#', {
      method: 'POST',
      body: formData
    }).catch(() => {
      throw new Error('Network error. Please try again.');
    });
    
    if (!response || !response.ok) {
      throw new Error('Failed to send message. Please try again.');
    }
    
    return response;
  }

  showSuccess() {
    const form = this.querySelector('.contact-section__form');
    if (form) {
      // Replace form with success message
      form.innerHTML = `
        <div class="contact-section__success">
          <badge-tag variant="success" size="lg" icon="✓">
            Message Sent Successfully!
          </badge-tag>
          <p class="contact-section__success-text">
            We'll get back to you within 24 hours.
          </p>
          <loading-button variant="ghost" onclick="location.reload()">
            Send Another Message
          </loading-button>
        </div>
      `;
    }
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showToast(message, type = 'success') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <badge-tag variant="${type === 'success' ? 'success' : 'error'}" size="sm">
        ${message}
      </badge-tag>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('toast--visible'), 100);
    
    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  ensureDependencies() {
    // Dynamically load required components
    const dependencies = [
      // Atoms
      { name: 'form-input', path: '../atoms/form-input.js' },
      { name: 'form-textarea', path: '../atoms/form-textarea.js' },
      { name: 'form-select', path: '../atoms/form-select.js' },
      { name: 'form-radio', path: '../atoms/form-radio.js' },
      { name: 'form-checkbox', path: '../atoms/form-checkbox.js' },
      { name: 'loading-button', path: '../atoms/loading-spinner.js' },
      { name: 'badge-tag', path: '../atoms/badge-tag.js' },
      { name: 'copy-button', path: '../atoms/copy-button.js' },
      { name: 'tooltip-tip', path: '../atoms/tooltip-tip.js' },
      { name: 'skeleton-loader', path: '../atoms/loading-spinner.js' },
      // Molecules
      { name: 'social-proof', path: '../molecules/social-proof.js' },
      { name: 'trust-indicator', path: '../molecules/social-proof.js' },
      { name: 'activity-feed', path: '../molecules/social-proof.js' }
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
customElements.define('contact-section', ContactSection);

export { ContactSection };
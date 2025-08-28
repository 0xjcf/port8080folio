/**
 * Form Toggle Web Component
 * Atomic Design: Molecule
 * 
 * PROPERLY COMPOSED WITH ATOMS: badge-tag, loading-spinner
 * Tab switcher for forms (e.g., Sign In / Sign Up)
 * Renders in light DOM for SEO
 */
class FormToggle extends HTMLElement {
  static get observedAttributes() {
    return ['tabs', 'active'];
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
    this.ensureAtomDependencies();
  }

  attributeChangedCallback() {
    this.render();
    this.bindEvents();
  }

  render() {
    const tabs = this.getAttribute('tabs') || 'Tab 1,Tab 2';
    const active = parseInt(this.getAttribute('active')) || 0;
    const variant = this.getAttribute('variant') || 'pills'; // pills or underline
    
    // Parse tabs (format: "label:id,label:id" or just "label,label")
    const tabList = tabs.split(',').map((tab, index) => {
      const parts = tab.trim().split(':');
      return {
        label: parts[0],
        id: parts[1] || `tab-${index}`,
        index
      };
    });
    
    // Build classes
    const classes = ['form-toggle'];
    if (variant) classes.push(`form-toggle--${variant}`);
    
    this.className = classes.join(' ');
    
    // PROPERLY COMPOSE WITH ATOMS
    this.innerHTML = `
      <div class="form-toggle__container">
        <div class="form-toggle__tabs" role="tablist">
          ${tabList.map((tab, index) => `
            <!-- Using badge-tag atoms for tab buttons -->
            <button
              class="form-toggle__tab ${index === active ? 'form-toggle__tab--active' : ''}"
              role="tab"
              aria-selected="${index === active}"
              aria-controls="${tab.id}"
              data-tab-index="${index}"
            >
              <badge-tag 
                variant="${index === active ? 'primary' : 'ghost'}"
                size="md"
                class="form-toggle__tab-badge"
              >
                ${tab.label}
              </badge-tag>
            </button>
          `).join('')}
          
          ${variant === 'pills' ? `
            <div 
              class="form-toggle__indicator"
              style="transform: translateX(${active * 100}%)"
            ></div>
          ` : ''}
        </div>
        
        <div class="form-toggle__panels">
          ${tabList.map((tab, index) => `
            <div
              id="${tab.id}"
              class="form-toggle__panel ${index === active ? 'form-toggle__panel--active' : ''}"
              role="tabpanel"
              aria-hidden="${index !== active}"
              data-panel-index="${index}"
            >
              <slot name="${tab.id}">
                <!-- Content for ${tab.label} -->
              </slot>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  bindEvents() {
    const tabs = this.querySelectorAll('.form-toggle__tab');
    const panels = this.querySelectorAll('.form-toggle__panel');
    const indicator = this.querySelector('.form-toggle__indicator');
    
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => {
          t.classList.remove('form-toggle__tab--active');
          t.setAttribute('aria-selected', 'false');
          // Update badge variant
          const badge = t.querySelector('.form-toggle__tab-badge');
          if (badge) {
            badge.setAttribute('variant', 'ghost');
          }
        });
        
        tab.classList.add('form-toggle__tab--active');
        tab.setAttribute('aria-selected', 'true');
        
        // Update active badge
        const activeBadge = tab.querySelector('.form-toggle__tab-badge');
        if (activeBadge) {
          activeBadge.setAttribute('variant', 'primary');
        }
        
        // Update panels
        panels.forEach(panel => {
          panel.classList.remove('form-toggle__panel--active');
          panel.setAttribute('aria-hidden', 'true');
        });
        
        const activePanel = panels[index];
        if (activePanel) {
          activePanel.classList.add('form-toggle__panel--active');
          activePanel.setAttribute('aria-hidden', 'false');
        }
        
        // Move indicator
        if (indicator) {
          indicator.style.transform = `translateX(${index * 100}%)`;
        }
        
        // Update attribute
        this.setAttribute('active', index.toString());
        
        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('tab-change', {
          detail: { index, tabId: activePanel?.id }
        }));
      });
    });
    
    // Keyboard navigation
    this.addEventListener('keydown', (e) => {
      const activeTab = this.querySelector('.form-toggle__tab--active');
      const currentIndex = parseInt(activeTab?.dataset.tabIndex || '0');
      
      let newIndex = currentIndex;
      
      if (e.key === 'ArrowLeft') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      } else if (e.key === 'ArrowRight') {
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      }
      
      if (newIndex !== currentIndex) {
        tabs[newIndex]?.click();
      }
    });
  }

  ensureAtomDependencies() {
    // Dynamically load required atoms if not already defined
    const requiredAtoms = [
      { name: 'badge-tag', path: '../atoms/badge-tag.js' },
      { name: 'loading-spinner', path: '../atoms/loading-spinner.js' }
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

// Extended form toggle for authentication forms
class AuthToggle extends FormToggle {
  render() {
    // Default to Sign In / Sign Up tabs
    if (!this.hasAttribute('tabs')) {
      this.setAttribute('tabs', 'Sign In:signin,Sign Up:signup');
    }
    
    super.render();
    
    // Add auth-specific content
    const signinPanel = this.querySelector('#signin');
    const signupPanel = this.querySelector('#signup');
    
    if (signinPanel && !signinPanel.innerHTML.trim()) {
      signinPanel.innerHTML = `
        <form class="auth-toggle__form">
          <form-input
            type="email"
            name="signin_email"
            label="Email"
            placeholder="you@example.com"
            required
          ></form-input>
          
          <form-input
            type="password"
            name="signin_password"
            label="Password"
            placeholder="••••••••"
            required
          ></form-input>
          
          <form-checkbox
            name="remember"
            label="Remember me"
          ></form-checkbox>
          
          <loading-button
            type="submit"
            variant="primary"
            loading-text="Signing in..."
          >
            Sign In
          </loading-button>
        </form>
      `;
    }
    
    if (signupPanel && !signupPanel.innerHTML.trim()) {
      signupPanel.innerHTML = `
        <form class="auth-toggle__form">
          <form-input
            type="text"
            name="signup_name"
            label="Full Name"
            placeholder="John Doe"
            required
          ></form-input>
          
          <form-input
            type="email"
            name="signup_email"
            label="Email"
            placeholder="you@example.com"
            required
          ></form-input>
          
          <form-input
            type="password"
            name="signup_password"
            label="Password"
            placeholder="••••••••"
            helper="At least 8 characters"
            required
          ></form-input>
          
          <form-checkbox
            name="terms"
            label="I agree to the terms and conditions"
            required
          ></form-checkbox>
          
          <loading-button
            type="submit"
            variant="primary"
            loading-text="Creating account..."
          >
            Sign Up
          </loading-button>
        </form>
      `;
    }
    
    this.ensureAuthDependencies();
  }

  ensureAuthDependencies() {
    // Additional atoms for auth forms
    const authAtoms = [
      { name: 'form-input', path: '../atoms/form-input.js' },
      { name: 'form-checkbox', path: '../atoms/form-checkbox.js' },
      { name: 'loading-button', path: '../atoms/loading-spinner.js' }
    ];
    
    authAtoms.forEach(atom => {
      if (!customElements.get(atom.name)) {
        import(atom.path).catch(() => {
          console.warn(`${atom.name} component not found`);
        });
      }
    });
  }
}

// Register components
customElements.define('form-toggle', FormToggle);
customElements.define('auth-toggle', AuthToggle);

export { FormToggle, AuthToggle };
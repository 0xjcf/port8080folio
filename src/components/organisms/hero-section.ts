/**
 * Hero Section Web Component
 * Atomic Design: Organism
 * 
 * PROPERLY COMPOSED WITH MOLECULES AND ATOMS:
 * Uses: badge-tag, loading-button, scroll-indicator (atoms)
 * Uses: social-proof, activity-feed (molecules)
 * Renders in light DOM for SEO
 */
class HeroSection extends HTMLElement {
  connectedCallback() {
    this.render();
    this.addAnimations();
    this.ensureDependencies();
  }

  render() {
    const layout = this.getAttribute('layout') || 'centered'; // centered, split, minimal
    const title = this.getAttribute('title') || 'Welcome';
    const subtitle = this.getAttribute('subtitle') || '';
    const ctaPrimary = this.getAttribute('cta-primary') || '';
    const ctaPrimaryHref = this.getAttribute('cta-primary-href') || '#';
    const ctaSecondary = this.getAttribute('cta-secondary') || '';
    const ctaSecondaryHref = this.getAttribute('cta-secondary-href') || '#';
    const background = this.getAttribute('background') || 'gradient';
    const badge = this.getAttribute('badge') || '';
    const dark = this.hasAttribute('dark');
    const stats = this.getAttribute('stats') || ''; // Format: "count:label:icon,count:label:icon"
    const socialProof = this.getAttribute('social-proof') || '';
    
    // Build classes
    const classes = ['hero'];
    if (layout !== 'centered') classes.push(`hero--${layout}`);
    if (dark) classes.push('hero--dark');
    
    this.className = classes.join(' ');
    
    // Render based on layout
    if (layout === 'split') {
      this.renderSplitLayout(title, subtitle, ctaPrimary, ctaPrimaryHref, ctaSecondary, ctaSecondaryHref, badge, background, stats, socialProof);
    } else if (layout === 'terminal') {
      this.renderTerminalLayout(title, subtitle, ctaPrimary, ctaPrimaryHref, ctaSecondary, ctaSecondaryHref);
    } else {
      this.renderCenteredLayout(title, subtitle, ctaPrimary, ctaPrimaryHref, ctaSecondary, ctaSecondaryHref, badge, background, stats, socialProof);
    }
  }

  renderCenteredLayout(title, subtitle, ctaPrimary, ctaPrimaryHref, ctaSecondary, ctaSecondaryHref, badge, background, stats, socialProof) {
    this.innerHTML = `
      ${this.renderBackground(background)}
      
      <div class="hero__container">
        <div class="hero__content">
          ${badge ? `
            <!-- USING badge-tag ATOM instead of raw HTML -->
            <badge-tag 
              variant="primary" 
              size="sm" 
              class="hero__badge"
              icon="✨"
            >
              ${badge}
            </badge-tag>
          ` : ''}
          
          <h1 class="hero__title">
            ${this.parseTitle(title)}
          </h1>
          
          ${subtitle ? `
            <p class="hero__subtitle">${subtitle}</p>
          ` : ''}
          
          ${socialProof ? `
            <!-- USING social-proof MOLECULE -->
            <social-proof
              type="${socialProof.split(':')[0] || 'users'}"
              count="${socialProof.split(':')[1] || '1000'}"
              label="${socialProof.split(':')[2] || 'Active Users'}"
              animate
              class="hero__social-proof"
            ></social-proof>
          ` : ''}
          
          ${(ctaPrimary || ctaSecondary) ? `
            <div class="hero__cta">
              ${ctaPrimary ? `
                <!-- USING loading-button ATOM instead of raw button -->
                <loading-button
                  variant="primary"
                  class="hero__cta-primary"
                  data-href="${ctaPrimaryHref}"
                >
                  ${ctaPrimary}
                </loading-button>
              ` : ''}
              ${ctaSecondary ? `
                <loading-button
                  variant="secondary"
                  class="hero__cta-secondary"
                  data-href="${ctaSecondaryHref}"
                >
                  ${ctaSecondary}
                </loading-button>
              ` : ''}
            </div>
          ` : ''}
          
          ${stats ? this.renderStats(stats) : ''}
        </div>
        
        <!-- USING scroll-indicator ATOM -->
        <scroll-indicator style-type="mouse" text="Scroll to explore"></scroll-indicator>
      </div>
      
      ${this.renderFloatingElements()}
    `;
  }

  renderSplitLayout(title, subtitle, ctaPrimary, ctaPrimaryHref, ctaSecondary, ctaSecondaryHref, badge, background, stats, socialProof) {
    this.innerHTML = `
      ${this.renderBackground(background)}
      
      <div class="hero__container">
        <div class="hero__content">
          ${badge ? `
            <!-- USING badge-tag ATOM -->
            <badge-tag 
              variant="primary" 
              size="sm" 
              class="hero__badge"
            >
              ${badge}
            </badge-tag>
          ` : ''}
          
          <h1 class="hero__title">
            ${this.parseTitle(title)}
          </h1>
          
          ${subtitle ? `
            <p class="hero__subtitle">${subtitle}</p>
          ` : ''}
          
          ${socialProof ? `
            <!-- USING social-proof MOLECULE -->
            <social-proof
              type="${socialProof.split(':')[0] || 'users'}"
              count="${socialProof.split(':')[1] || '1000'}"
              label="${socialProof.split(':')[2] || ''}"
              animate
              live
              class="hero__social-proof"
            ></social-proof>
          ` : ''}
          
          ${(ctaPrimary || ctaSecondary) ? `
            <div class="hero__cta">
              ${ctaPrimary ? `
                <!-- USING loading-button ATOM -->
                <loading-button
                  variant="primary"
                  class="hero__cta-primary"
                  data-href="${ctaPrimaryHref}"
                >
                  ${ctaPrimary}
                </loading-button>
              ` : ''}
              ${ctaSecondary ? `
                <loading-button
                  variant="ghost"
                  class="hero__cta-secondary"
                  data-href="${ctaSecondaryHref}"
                >
                  ${ctaSecondary}
                </loading-button>
              ` : ''}
            </div>
          ` : ''}
        </div>
        
        <div class="hero__visual">
          ${this.hasAttribute('show-activity') ? `
            <!-- USING activity-feed MOLECULE -->
            <activity-feed live></activity-feed>
          ` : this.renderTerminal()}
        </div>
      </div>
    `;
  }

  renderTerminalLayout(title, subtitle, ctaPrimary, ctaPrimaryHref, ctaSecondary, ctaSecondaryHref) {
    this.innerHTML = `
      <div class="hero__container">
        <div class="hero__content">
          <h1 class="hero__title">
            ${this.parseTitle(title)}
          </h1>
          
          ${subtitle ? `
            <p class="hero__subtitle">${subtitle}</p>
          ` : ''}
          
          ${this.renderTerminal()}
          
          ${(ctaPrimary || ctaSecondary) ? `
            <div class="hero__cta">
              ${ctaPrimary ? `
                <!-- USING loading-button ATOM -->
                <loading-button
                  variant="primary"
                  class="hero__cta-primary"
                  data-href="${ctaPrimaryHref}"
                >
                  ${ctaPrimary}
                </loading-button>
              ` : ''}
              ${ctaSecondary ? `
                <loading-button
                  variant="secondary"
                  class="hero__cta-secondary"
                  data-href="${ctaSecondaryHref}"
                >
                  ${ctaSecondary}
                </loading-button>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderBackground(type) {
    switch(type) {
      case 'gradient':
        return '<div class="hero__background hero__background--gradient"></div>';
      case 'grid':
        return '<div class="hero__background hero__background--grid"></div>';
      case 'code':
        // USING code-block ATOM for code background
        return `
          <div class="hero__background hero__background--code">
            <code-block language="javascript" show-line-numbers>
const developer = {
  name: "Full Stack Developer",
  skills: ["JavaScript", "TypeScript", "React", "Node.js"],
  passion: "Building amazing web experiences",
  available: true
};

function buildProject(idea) {
  return transform(idea)
    .design()
    .develop()
    .deploy()
    .celebrate();
}

// Let's build something amazing together
buildProject(yourIdea);
            </code-block>
          </div>
        `;
      default:
        return '';
    }
  }

  renderTerminal() {
    return `
      <div class="hero__terminal">
        <div class="hero__terminal-header">
          <span class="hero__terminal-dot hero__terminal-dot--red"></span>
          <span class="hero__terminal-dot hero__terminal-dot--yellow"></span>
          <span class="hero__terminal-dot hero__terminal-dot--green"></span>
        </div>
        <div class="hero__terminal-content">
          <div class="hero__terminal-line">
            <span class="hero__terminal-prompt">$</span>
            <span class="hero__terminal-command"> npx create-awesome-project</span>
          </div>
          <div class="hero__terminal-line">
            <!-- USING loading-spinner ATOM for terminal loading -->
            <loading-spinner type="dots" size="sm" text="Installing dependencies..."></loading-spinner>
          </div>
          <div class="hero__terminal-line">
            <badge-tag variant="success" size="xs" icon="✓">Setup complete</badge-tag>
          </div>
          <div class="hero__terminal-line">
            <span class="hero__terminal-prompt">$</span>
            <span class="hero__terminal-command hero__animated-text"> Ready to build!</span>
          </div>
        </div>
      </div>
    `;
  }

  renderStats(statsStr) {
    // Parse stats (format: "value:label:type,value:label:type")
    const statItems = statsStr.split(',').map(stat => {
      const [value, label, type] = stat.trim().split(':');
      return { value, label, type: type || 'users' };
    });
    
    // COMPOSE WITH MOLECULES
    return `
      <div class="hero__stats">
        ${statItems.map(stat => `
          <!-- USING social-proof MOLECULE for each stat -->
          <social-proof
            type="${stat.type}"
            count="${stat.value}"
            label="${stat.label}"
            animate
            class="hero__stat"
          ></social-proof>
        `).join('')}
      </div>
    `;
  }

  renderFloatingElements() {
    // USING badge-tag ATOMS for floating elements
    return `
      <div class="hero__float hero__float--1">
        <badge-tag variant="ghost" size="lg">{ }</badge-tag>
      </div>
      <div class="hero__float hero__float--2">
        <badge-tag variant="ghost" size="lg">&lt;/&gt;</badge-tag>
      </div>
      <div class="hero__float hero__float--3">
        <badge-tag variant="ghost" size="lg">#</badge-tag>
      </div>
    `;
  }

  parseTitle(title) {
    // Check if title contains [gradient] marker
    if (title.includes('[gradient]')) {
      const parts = title.split('[gradient]');
      return `
        ${parts[0]}
        <span class="hero__title--gradient">${parts[1].split('[/gradient]')[0]}</span>
        ${parts[1].split('[/gradient]')[1] || ''}
      `;
    }
    return title;
  }

  addAnimations() {
    // Animate elements on load
    const content = this.querySelector('.hero__content');
    if (content) {
      content.style.opacity = '0';
      content.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        content.style.transition = 'all 0.8s ease-out';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      }, 100);
    }
    
    // Handle CTA button clicks
    const ctaButtons = this.querySelectorAll('loading-button');
    ctaButtons.forEach(button => {
      button.addEventListener('button-click', (e) => {
        const href = button.dataset.href;
        
        // Start loading
        button.startLoading();
        
        // Dispatch event for navigation
        this.dispatchEvent(new CustomEvent('hero-cta-click', {
          detail: { href, button: button.textContent },
          bubbles: true
        }));
        
        // Navigate after delay (or let parent handle it)
        setTimeout(() => {
          button.stopLoading();
          if (href && href !== '#') {
            window.location.href = href;
          }
        }, 1500);
      });
    });
  }

  ensureDependencies() {
    // Dynamically load required atoms and molecules if not already defined
    const dependencies = [
      // Atoms
      { name: 'badge-tag', path: '../atoms/badge-tag.js' },
      { name: 'loading-button', path: '../atoms/loading-spinner.js' },
      { name: 'scroll-indicator', path: '../atoms/back-to-top.js' },
      { name: 'loading-spinner', path: '../atoms/loading-spinner.js' },
      { name: 'code-block', path: '../atoms/copy-button.js' },
      // Molecules
      { name: 'social-proof', path: '../molecules/social-proof.js' },
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
customElements.define('hero-section', HeroSection);

export { HeroSection };
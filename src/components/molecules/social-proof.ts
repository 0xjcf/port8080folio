/**
 * Social Proof Web Component
 * Atomic Design: Molecule
 * 
 * Dynamic counter and social proof indicator
 * PROPERLY USES ATOMS: badge-tag, loading-spinner
 * Renders in light DOM for SEO
 */
class SocialProof extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'count', 'label', 'icon', 'animate', 'live'];
  }

  constructor() {
    super();
    this.currentCount = 0;
    this.targetCount = 0;
    this.updateInterval = null;
  }

  connectedCallback() {
    this.render();
    this.initializeCount();
    if (this.hasAttribute('live')) {
      this.startLiveUpdates();
    }
  }

  disconnectedCallback() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
      if (name === 'count') {
        this.initializeCount();
      }
    }
  }

  render() {
    const type = this.getAttribute('type') || 'users'; // users, views, downloads, stars
    const label = this.getAttribute('label') || this.getDefaultLabel(type);
    const icon = this.getAttribute('icon') || this.getDefaultIcon(type);
    
    this.className = 'social-proof';
    
    // PROPERLY COMPOSE WITH ATOMS
    this.innerHTML = `
      <div class="social-proof__container">
        <!-- Using badge-tag atom for the icon/label -->
        <badge-tag 
          variant="outline" 
          size="sm"
          icon="${icon}"
        >
          ${label}
        </badge-tag>
        
        <!-- Counter display -->
        <div class="social-proof__counter">
          <span class="social-proof__count" data-target="${this.getAttribute('count') || 0}">
            ${this.formatNumber(this.currentCount)}
          </span>
          
          <!-- Live indicator using loading-spinner atom -->
          ${this.hasAttribute('live') ? `
            <loading-spinner 
              type="dots" 
              size="sm" 
              color="success"
              class="social-proof__live-indicator"
            ></loading-spinner>
          ` : ''}
        </div>
        
        <!-- Additional badges for context -->
        <div class="social-proof__badges">
          ${this.renderContextBadges(type)}
        </div>
      </div>
    `;
  }

  renderContextBadges(type) {
    switch(type) {
      case 'users':
        return `
          <badge-tag variant="success" size="xs">Active Now</badge-tag>
          <badge-tag variant="ghost" size="xs">Verified</badge-tag>
        `;
      case 'views':
        return `
          <badge-tag variant="info" size="xs">Today</badge-tag>
        `;
      case 'downloads':
        return `
          <badge-tag variant="primary" size="xs">This Month</badge-tag>
        `;
      case 'stars':
        return `
          <badge-tag variant="warning" size="xs">
            <span style="color: var(--color-syntax-yellow)">★★★★★</span>
          </badge-tag>
        `;
      default:
        return '';
    }
  }

  getDefaultLabel(type) {
    const labels = {
      users: 'Active Users',
      views: 'Page Views',
      downloads: 'Downloads',
      stars: 'GitHub Stars',
      customers: 'Happy Customers',
      projects: 'Projects Completed'
    };
    return labels[type] || 'Count';
  }

  getDefaultIcon(type) {
    const icons = {
      users: '👥',
      views: '👁',
      downloads: '⬇',
      stars: '⭐',
      customers: '😊',
      projects: '✅'
    };
    return icons[type] || '📊';
  }

  initializeCount() {
    this.targetCount = parseInt(this.getAttribute('count') || '0');
    
    if (this.hasAttribute('animate')) {
      this.animateCount();
    } else {
      this.currentCount = this.targetCount;
      this.updateDisplay();
    }
  }

  animateCount() {
    const duration = 2000;
    const steps = 60;
    const increment = this.targetCount / steps;
    const stepDuration = duration / steps;
    
    let step = 0;
    const animation = setInterval(() => {
      step++;
      this.currentCount = Math.floor(increment * step);
      this.updateDisplay();
      
      if (step >= steps) {
        this.currentCount = this.targetCount;
        this.updateDisplay();
        clearInterval(animation);
      }
    }, stepDuration);
  }

  startLiveUpdates() {
    // Simulate live updates
    this.updateInterval = setInterval(() => {
      const change = Math.random() > 0.5 ? 1 : -1;
      const amount = Math.floor(Math.random() * 3) + 1;
      
      this.targetCount = Math.max(0, this.targetCount + (change * amount));
      this.currentCount = this.targetCount;
      this.updateDisplay();
      
      // Show pulse effect
      this.classList.add('social-proof--pulse');
      setTimeout(() => this.classList.remove('social-proof--pulse'), 500);
      
      // Dispatch event
      this.dispatchEvent(new CustomEvent('social-proof-update', {
        detail: { count: this.targetCount },
        bubbles: true
      }));
    }, 5000 + Math.random() * 5000); // Random interval between 5-10 seconds
  }

  updateDisplay() {
    const countElement = this.querySelector('.social-proof__count');
    if (countElement) {
      countElement.textContent = this.formatNumber(this.currentCount);
    }
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }

  // Public methods
  setCount(count) {
    this.setAttribute('count', count.toString());
  }

  increment(amount = 1) {
    this.targetCount += amount;
    this.currentCount = this.targetCount;
    this.updateDisplay();
  }
}

// Trust Indicator Molecule (composed of multiple atoms)
class TrustIndicator extends HTMLElement {
  connectedCallback() {
    const rating = this.getAttribute('rating') || '4.9';
    const reviews = this.getAttribute('reviews') || '500';
    const certifications = this.getAttribute('certifications') || '';
    
    this.className = 'trust-indicator';
    
    // COMPOSE WITH ATOMS
    this.innerHTML = `
      <div class="trust-indicator__content">
        <!-- Rating section using badge-tag atoms -->
        <div class="trust-indicator__rating">
          <badge-tag variant="warning" size="lg">
            <span class="trust-indicator__stars">★★★★★</span>
            ${rating}
          </badge-tag>
          <span class="trust-indicator__reviews">
            from ${reviews} reviews
          </span>
        </div>
        
        <!-- Certifications using badge atoms -->
        ${certifications ? `
          <div class="trust-indicator__certifications">
            ${certifications.split(',').map(cert => `
              <badge-tag variant="outline" size="sm">
                ${cert.trim()}
              </badge-tag>
            `).join('')}
          </div>
        ` : ''}
        
        <!-- Trust badges -->
        <div class="trust-indicator__badges">
          <badge-tag variant="success" size="sm" icon="✓">
            SSL Secured
          </badge-tag>
          <badge-tag variant="info" size="sm" icon="🔒">
            Privacy Protected
          </badge-tag>
        </div>
      </div>
    `;
  }
}

// Activity Feed Molecule (uses multiple atoms)
class ActivityFeed extends HTMLElement {
  connectedCallback() {
    const items = this.getAttribute('items') || '';
    const live = this.hasAttribute('live');
    
    this.className = 'activity-feed';
    
    // Parse items (format: "action:time,action:time")
    const activities = items ? items.split(',').map(item => {
      const [action, time] = item.trim().split(':');
      return { action, time };
    }) : this.generateDemoActivities();
    
    this.innerHTML = `
      <div class="activity-feed__header">
        <badge-tag variant="primary" size="sm">
          Recent Activity
        </badge-tag>
        ${live ? `
          <loading-spinner type="pulse" size="sm" color="success"></loading-spinner>
        ` : ''}
      </div>
      
      <div class="activity-feed__items">
        ${activities.map((activity, index) => `
          <div class="activity-feed__item" style="animation-delay: ${index * 0.1}s">
            <badge-tag variant="ghost" size="xs">
              ${activity.time}
            </badge-tag>
            <span class="activity-feed__action">${activity.action}</span>
          </div>
        `).join('')}
      </div>
    `;
    
    if (live) {
      this.startLiveUpdates();
    }
  }

  generateDemoActivities() {
    return [
      { action: 'New user signed up', time: '2m ago' },
      { action: 'File downloaded', time: '5m ago' },
      { action: 'Comment posted', time: '12m ago' },
      { action: 'Project completed', time: '1h ago' }
    ];
  }

  startLiveUpdates() {
    setInterval(() => {
      const actions = [
        'New user joined',
        'File uploaded',
        'Task completed',
        'Message received',
        'Payment processed'
      ];
      
      const newActivity = {
        action: actions[Math.floor(Math.random() * actions.length)],
        time: 'Just now'
      };
      
      this.addActivity(newActivity);
    }, 10000);
  }

  addActivity(activity) {
    const itemsContainer = this.querySelector('.activity-feed__items');
    if (!itemsContainer) return;
    
    const newItem = document.createElement('div');
    newItem.className = 'activity-feed__item activity-feed__item--new';
    newItem.innerHTML = `
      <badge-tag variant="success" size="xs">
        ${activity.time}
      </badge-tag>
      <span class="activity-feed__action">${activity.action}</span>
    `;
    
    itemsContainer.insertBefore(newItem, itemsContainer.firstChild);
    
    // Remove oldest item if too many
    const items = itemsContainer.querySelectorAll('.activity-feed__item');
    if (items.length > 5) {
      items[items.length - 1].remove();
    }
  }
}

// Register components
customElements.define('social-proof', SocialProof);
customElements.define('trust-indicator', TrustIndicator);
customElements.define('activity-feed', ActivityFeed);

export { SocialProof, TrustIndicator, ActivityFeed };
/**
 * KPI Tile Web Component
 * Atomic Design: Molecule
 * 
 * PROPERLY COMPOSED WITH ATOMS: badge-tag, tooltip-tip, skeleton-loader
 * Displays key performance indicators with animations
 * Renders in light DOM for SEO
 */
class KpiTile extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'label', 'icon', 'prefix', 'suffix', 'change', 'description', 'color', 'animate', 'loading'];
  }

  connectedCallback() {
    this.render();
    if (this.hasAttribute('animate')) {
      this.animateValue();
    }
    this.addInteractivity();
    this.ensureAtomDependencies();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      if (name === 'value' && this.hasAttribute('animate')) {
        this.animateValue();
      }
    }
  }

  render() {
    const value = this.getAttribute('value') || '0';
    const label = this.getAttribute('label') || 'Metric';
    const icon = this.getAttribute('icon') || '';
    const prefix = this.getAttribute('prefix') || '';
    const suffix = this.getAttribute('suffix') || '';
    const change = this.getAttribute('change') || '';
    const description = this.getAttribute('description') || '';
    const color = this.getAttribute('color') || '';
    const loading = this.hasAttribute('loading');
    
    // Build classes
    const classes = ['kpi-tile'];
    if (color) classes.push(`kpi-tile--${color}`);
    
    this.className = classes.join(' ');
    
    // Parse change value
    const changeInfo = this.parseChange(change);
    
    // PROPERLY COMPOSE WITH ATOMS
    this.innerHTML = `
      ${icon ? `
        <!-- Using tooltip-tip atom for icon hint -->
        <tooltip-tip text="${label}" position="top">
          <div class="kpi-tile__icon" aria-hidden="true">
            ${icon}
          </div>
        </tooltip-tip>
      ` : ''}
      
      ${loading ? `
        <!-- Using skeleton-loader atom while loading -->
        <skeleton-loader type="text" lines="1" class="kpi-tile__value"></skeleton-loader>
      ` : `
        <div class="kpi-tile__value">
          ${prefix ? `<span class="kpi-tile__prefix">${prefix}</span>` : ''}
          <span class="kpi-tile__number" data-value="${value}">${value}</span>
          ${suffix ? `<span class="kpi-tile__suffix">${suffix}</span>` : ''}
        </div>
      `}
      
      <div class="kpi-tile__label">${label}</div>
      
      ${changeInfo ? `
        <!-- Using badge-tag atom for change indicator -->
        <badge-tag 
          variant="${changeInfo.direction === 'up' ? 'success' : changeInfo.direction === 'down' ? 'error' : 'ghost'}"
          size="sm"
          icon="${changeInfo.arrow}"
          class="kpi-tile__change"
        >
          ${changeInfo.value}
        </badge-tag>
      ` : ''}
      
      ${description ? `
        <p class="kpi-tile__description">${description}</p>
      ` : ''}
    `;
    
    this.ensureAtomDependencies();
  }

  parseChange(change) {
    if (!change) return null;
    
    const isPositive = change.startsWith('+');
    const isNegative = change.startsWith('-');
    
    return {
      value: change,
      direction: isPositive ? 'up' : isNegative ? 'down' : 'neutral',
      arrow: isPositive ? '↑' : isNegative ? '↓' : '→'
    };
  }

  animateValue() {
    const element = this.querySelector('.kpi-tile__number');
    if (!element) return;
    
    const endValue = this.parseNumber(element.dataset.value);
    const duration = 1500;
    const startTime = performance.now();
    
    const updateValue = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuad = progress * (2 - progress);
      const currentValue = Math.floor(endValue * easeOutQuad);
      
      element.textContent = this.formatNumber(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        element.textContent = element.dataset.value;
      }
    };
    
    requestAnimationFrame(updateValue);
  }

  parseNumber(value) {
    return parseInt(value.toString().replace(/[^0-9]/g, '')) || 0;
  }

  formatNumber(num) {
    return num.toLocaleString();
  }

  addInteractivity() {
    // Entrance animation
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.style.animation = 'slideInUp 0.6s ease-out';
          if (this.hasAttribute('animate')) {
            this.animateValue();
          }
          observer.disconnect();
        }
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

// KPI Progress Tile Component
class KpiProgress extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'max', 'label', 'color'];
  }

  connectedCallback() {
    this.render();
    this.animateProgress();
  }

  attributeChangedCallback() {
    this.render();
    this.animateProgress();
  }

  render() {
    const value = parseInt(this.getAttribute('value')) || 0;
    const max = parseInt(this.getAttribute('max')) || 100;
    const label = this.getAttribute('label') || 'Progress';
    const color = this.getAttribute('color') || '';
    
    const percentage = Math.min((value / max) * 100, 100);
    
    // Build classes
    const classes = ['kpi-tile', 'kpi-tile--progress'];
    if (color) classes.push(`kpi-tile--${color}`);
    
    this.className = classes.join(' ');
    
    this.innerHTML = `
      <div class="kpi-tile__label">${label}</div>
      <div class="kpi-tile__value">
        <span class="kpi-tile__number">${value}</span>
        <span class="kpi-tile__suffix">/ ${max}</span>
      </div>
      <div class="kpi-tile__progress">
        <div class="kpi-tile__progress-bar">
          <div class="kpi-tile__progress-fill" style="width: 0%" data-target="${percentage}"></div>
        </div>
      </div>
      <div class="kpi-tile__description">${percentage.toFixed(0)}% Complete</div>
    `;
  }

  animateProgress() {
    const fill = this.querySelector('.kpi-tile__progress-fill');
    if (!fill) return;
    
    const target = parseFloat(fill.dataset.target);
    
    // Delay for entrance effect
    setTimeout(() => {
      fill.style.width = target + '%';
    }, 300);
  }
}

// KPI Chart Tile Component (simplified)
class KpiChart extends HTMLElement {
  connectedCallback() {
    const data = this.getAttribute('data') || '40,65,30,85,60,75,90';
    const label = this.getAttribute('label') || 'Trend';
    const color = this.getAttribute('color') || '';
    
    const values = data.split(',').map(v => parseInt(v));
    const max = Math.max(...values);
    
    // Build classes
    const classes = ['kpi-tile'];
    if (color) classes.push(`kpi-tile--${color}`);
    
    this.className = classes.join(' ');
    
    // Create simple bar chart
    const bars = values.map(value => {
      const height = (value / max) * 100;
      return `<div class="kpi-tile__bar" style="height: ${height}%" title="${value}"></div>`;
    }).join('');
    
    this.innerHTML = `
      <div class="kpi-tile__label">${label}</div>
      <div class="kpi-tile__chart">
        <div class="kpi-tile__bars">
          ${bars}
        </div>
      </div>
    `;
    
    // Animate bars on intersection
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const bars = this.querySelectorAll('.kpi-tile__bar');
          bars.forEach((bar, i) => {
            setTimeout(() => {
              bar.style.animation = 'slideInUp 0.5s ease-out';
            }, i * 50);
          });
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      
      observer.observe(this);
    }
  }
}

// Register components
customElements.define('kpi-tile', KpiTile);
customElements.define('kpi-progress', KpiProgress);
customElements.define('kpi-chart', KpiChart);

export { KpiTile, KpiProgress, KpiChart };
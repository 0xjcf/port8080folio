/**
 * Tooltip Web Component
 * Atomic Design: Atom
 * Styles: src/styles/atomic/01-atoms/tooltips.css
 * 
 * Hover/focus tooltip enhancement for any element
 * Renders in light DOM for accessibility
 */
export class TooltipTip extends HTMLElement {
  private tooltipElement: HTMLDivElement | null = null;
  private showTimeout: NodeJS.Timeout | null = null;
  private hideTimeout: NodeJS.Timeout | null = null;
  private tooltipText: string = '';
  static get observedAttributes() {
    return ['text', 'position', 'delay', 'max-width', 'trigger'];
  }


  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue && this.isConnected) {
      if (name === 'text' && this.tooltipElement) {
        // Just update tooltip text without re-rendering
        const content = this.tooltipElement.querySelector('.tooltip__content');
        if (content) content.textContent = newValue || '';
      } else {
        this.render();
        this.bindEvents();
      }
    }
  }

  render() {
    const text = this.getAttribute('text') || this.getAttribute('title') || '';
    
    // Wrap existing content
    const existingContent = this.innerHTML;
    
    this.className = 'tooltip-wrapper';
    this.setAttribute('aria-describedby', `tooltip-${this.id || Math.random().toString(36).substring(2, 11)}`);
    
    // Don't modify the inner content, just prepare for tooltip
    if (!this.querySelector('.tooltip-trigger')) {
      this.innerHTML = `<span class="tooltip-trigger">${existingContent}</span>`;
    }
    
    // Store text for later use
    this.tooltipText = text;
  }

  bindEvents() {
    const trigger = this.querySelector('.tooltip-trigger') || this;
    const triggerType = this.getAttribute('trigger') || 'hover'; // hover, focus, both
    
    // Mouse events
    if (triggerType === 'hover' || triggerType === 'both') {
      trigger.addEventListener('mouseenter', () => this.show());
      trigger.addEventListener('mouseleave', () => this.hide());
    }
    
    // Focus events
    if (triggerType === 'focus' || triggerType === 'both') {
      trigger.addEventListener('focus', () => this.show());
      trigger.addEventListener('blur', () => this.hide());
    }
    
    // Touch events for mobile
    trigger.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.tooltipElement && this.tooltipElement.classList.contains('tooltip--visible')) {
        this.hide();
      } else {
        this.show();
      }
    });
  }

  show() {
    const delay = parseInt(this.getAttribute('delay') || '500');
    
    // Clear hide timeout if exists
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    
    // Delay showing tooltip
    this.showTimeout = setTimeout(() => {
      this.createTooltip();
      this.positionTooltip();
      
      // Add visible class after creation for animation
      requestAnimationFrame(() => {
        if (this.tooltipElement) {
          this.tooltipElement.classList.add('tooltip--visible');
        }
      });
      
      // Dispatch event
      this.dispatchEvent(new CustomEvent('tooltip-show', { bubbles: true }));
    }, delay);
  }

  hide() {
    // Clear show timeout if exists
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    
    if (this.tooltipElement) {
      this.tooltipElement.classList.remove('tooltip--visible');
      
      // Remove after animation
      this.hideTimeout = setTimeout(() => {
        this.removeTooltip();
      }, 200);
      
      // Dispatch event
      this.dispatchEvent(new CustomEvent('tooltip-hide', { bubbles: true }));
    }
  }

  createTooltip() {
    if (this.tooltipElement) return;
    
    const position = this.getAttribute('position') || 'top';
    const maxWidth = this.getAttribute('max-width') || '250px';
    
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = `tooltip tooltip--${position}`;
    this.tooltipElement.style.maxWidth = maxWidth;
    this.tooltipElement.setAttribute('role', 'tooltip');
    this.tooltipElement.setAttribute('id', this.getAttribute('aria-describedby') || '');
    
    this.tooltipElement.innerHTML = `
      <div class="tooltip__content">${this.tooltipText}</div>
      <div class="tooltip__arrow"></div>
    `;
    
    document.body.appendChild(this.tooltipElement);
  }

  removeTooltip() {
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
  }

  positionTooltip() {
    if (!this.tooltipElement) return;
    
    const trigger = this.querySelector('.tooltip-trigger') || this;
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const position = this.getAttribute('position') || 'top';
    
    let top, left;
    const offset = 8; // Gap between trigger and tooltip
    
    // Calculate position
    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + offset;
        break;
    }
    
    // Adjust for viewport boundaries
    const padding = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Horizontal adjustment
    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }
    
    // Vertical adjustment - flip if necessary
    if (top < padding && (position === 'top' || position === 'left' || position === 'right')) {
      // Flip to bottom
      top = triggerRect.bottom + offset;
      this.tooltipElement.className = `tooltip tooltip--bottom`;
    } else if (top + tooltipRect.height > viewportHeight - padding && position === 'bottom') {
      // Flip to top
      top = triggerRect.top - tooltipRect.height - offset;
      this.tooltipElement.className = `tooltip tooltip--top`;
    }
    
    // Apply position
    this.tooltipElement.style.position = 'fixed';
    this.tooltipElement.style.top = `${top}px`;
    this.tooltipElement.style.left = `${left}px`;
    this.tooltipElement.style.zIndex = 'var(--z-tooltip, 9999)';
  }

  cleanup() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    this.removeTooltip();
  }
}

// Register component
if (!customElements.get('tooltip-tip')) {
  customElements.define('tooltip-tip', TooltipTip);
}
/**
 * Tooltip Provider Web Component
 * Atomic Design: Atom
 * 
 * Manages multiple tooltips by automatically wrapping elements
 * Converts title and data-tooltip attributes into tooltip components
 */
export class TooltipProvider extends HTMLElement {
  private observer: MutationObserver | null = null;

  connectedCallback() {
    this.setupTooltips();
    this.observeChanges();
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  setupTooltips() {
    // Find all elements with title or data-tooltip attributes
    const elements = this.querySelectorAll('[title], [data-tooltip]');
    
    elements.forEach(element => {
      // Skip if already wrapped
      if (element.parentElement?.tagName === 'TOOLTIP-TIP') return;
      
      const text = element.getAttribute('title') || element.getAttribute('data-tooltip');
      if (!text) return;
      
      // Create tooltip wrapper
      const tooltip = document.createElement('tooltip-tip');
      tooltip.setAttribute('text', text);
      
      // Copy other tooltip attributes if present
      const datasetEl = element as HTMLElement;
      if (datasetEl.dataset.tooltipPosition) {
        tooltip.setAttribute('position', datasetEl.dataset.tooltipPosition);
      }
      if (datasetEl.dataset.tooltipDelay) {
        tooltip.setAttribute('delay', datasetEl.dataset.tooltipDelay);
      }
      
      // Wrap element
      element.parentNode?.insertBefore(tooltip, element);
      tooltip.appendChild(element);
      
      // Remove original title to prevent native tooltip
      element.removeAttribute('title');
    });
  }

  observeChanges() {
    // Watch for dynamically added elements
    this.observer = new MutationObserver(() => {
      this.setupTooltips();
    });
    
    this.observer.observe(this, {
      childList: true,
      subtree: true
    });
  }
}

// Register component
if (!customElements.get('tooltip-provider')) {
  customElements.define('tooltip-provider', TooltipProvider);
}
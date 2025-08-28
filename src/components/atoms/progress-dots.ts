/**
 * Progress Dots Web Component
 * Atomic Design: Atom
 * 
 * Multi-step progress indicator with accessibility
 * Renders in light DOM for SEO
 */
export class ProgressDots extends HTMLElement {
  static get observedAttributes() {
    return ['current', 'total', 'labels', 'clickable', 'show-text', 'aria-label'];
  }

  private current = 1;
  private total = 1;
  private labels: string[] = [];
  private keyHandler?: (e: KeyboardEvent) => void;
  private keyUpHandler?: (e: KeyboardEvent) => void;
  private clickHandler?: (e: MouseEvent) => void;

  connectedCallback() {
    this.readAttributes();
    this.render();
    this.attachEvents();
  }

  disconnectedCallback() {
    this.detachEvents();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    
    this.readAttributes();
    this.render();
    
    // Only re-attach events if interactivity could change
    if (name === 'clickable') {
      this.attachEvents();
    }
  }

  private readAttributes() {
    // Safe number parsing with defaults
    const parseNumber = (name: string, fallback: number): number => {
      const raw = this.getAttribute(name);
      const num = Number(raw);
      return Number.isFinite(num) ? num : fallback;
    };

    // Parse and clamp total
    this.total = Math.max(1, parseNumber('total', this.total || 1));
    
    // Parse and clamp current
    const c = parseNumber('current', this.current || 1);
    this.current = Math.min(Math.max(1, c), this.total);

    // Parse labels, trim and filter
    const raw = (this.getAttribute('labels') || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    
    // Fill array with labels or default "Step N"
    this.labels = Array.from({ length: this.total }, (_, i) => 
      raw[i] || `Step ${i + 1}`
    );
  }

  render() {
    const clickable = this.hasAttribute('clickable');
    const showText = this.hasAttribute('show-text');
    const groupLabel = this.getAttribute('aria-label') || 'Progress indicators';

    // Preserve author classes while adding component classes
    this.classList.add('progress-dots');
    this.classList.toggle('progress-dots--clickable', clickable);

    const parts: string[] = [];
    
    // Container with proper ARIA role
    parts.push(
      `<div class="progress-dots__group"${
        clickable ? ` role="group" aria-label="${groupLabel}"` : ''
      }>`
    );

    // Generate dots
    for (let i = 1; i <= this.total; i++) {
      const isCurrent = i === this.current;
      const state = isCurrent ? 'current' : (i < this.current ? 'complete' : 'upcoming');
      const dotClass = `progress-dots__dot progress-dots__dot--${state}`;
      const label = this.labels[i - 1];
      const fullLabel = `Step ${i} of ${this.total}: ${label}`;
      const ariaLabel = `aria-label="${fullLabel}"`;
      const ariaCurrent = isCurrent ? ' aria-current="step"' : '';

      if (clickable) {
        // Render as button with roving tabindex
        parts.push(
          `<button type="button" class="${dotClass}" `,
          `data-index="${i}" `,
          `${ariaLabel} `,
          `tabindex="${isCurrent ? 0 : -1}"`,
          `${ariaCurrent}>`,
          showText ? `<span class="progress-dots__text">${i}</span>` : '',
          `</button>`
        );
      } else {
        // Render as span for non-interactive with img role for aria-label
        parts.push(
          `<span class="${dotClass}" `,
          `role="img" `,
          `${ariaLabel}`,
          `${ariaCurrent}>`,
          showText ? `<span class="progress-dots__text" aria-hidden="true">${i}</span>` : '',
          `</span>`
        );
      }
    }

    parts.push(`</div>`);

    // Optional text display
    if (showText && this.labels[this.current - 1]) {
      parts.push(
        `<div class="progress-dots__label" aria-live="polite">`,
        `${this.labels[this.current - 1]}`,
        `</div>`
      );
    }

    this.innerHTML = parts.join('');
  }

  private attachEvents() {
    this.detachEvents();

    if (!this.hasAttribute('clickable')) return;

    // Click handler with event delegation
    this.clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest<HTMLButtonElement>('[data-index]');
      if (!btn) return;
      
      const idx = Number(btn.dataset.index);
      if (Number.isFinite(idx) && idx >= 1 && idx <= this.total && idx !== this.current) {
        const previousCurrent = this.current;
        this.current = idx;
        this.setAttribute('current', String(idx)); // Keep attribute in sync
        
        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('progress-change', { 
          detail: { 
            index: idx,
            previous: previousCurrent
          },
          bubbles: true,
          composed: true
        }));
      }
    };

    // Keyboard handler for roving tabindex
    this.keyHandler = (e: KeyboardEvent) => {
      const focusable = Array.from(
        this.querySelectorAll<HTMLButtonElement>('[data-index]')
      );
      if (!focusable.length) return;

      const currentIndex = focusable.findIndex(el => el.tabIndex === 0);
      if (currentIndex === -1) return;

      const moveFocus = (newIndex: number) => {
        const clampedIndex = Math.max(0, Math.min(newIndex, focusable.length - 1));
        focusable.forEach(el => (el.tabIndex = -1));
        const target = focusable[clampedIndex];
        if (target) {
          target.tabIndex = 0;
          target.focus();
        }
      };

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          moveFocus(currentIndex + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          moveFocus(currentIndex - 1);
          break;
        case 'Home':
          e.preventDefault();
          moveFocus(0);
          break;
        case 'End':
          e.preventDefault();
          moveFocus(focusable.length - 1);
          break;
        case ' ':
          // Prevent page scroll on space keydown
          e.preventDefault();
          break;
        case 'Enter': {
          const btn = focusable[currentIndex];
          btn?.click();
          break;
        }
      }
    };

    // Space activates on keyup (native button behavior)
    this.keyUpHandler = (e: KeyboardEvent) => {
      if (e.key === ' ' && this.hasAttribute('clickable')) {
        e.preventDefault();
        // Use the actual focused element instead of query selector
        const btn = document.activeElement as HTMLButtonElement;
        if (btn && btn.hasAttribute('data-index') && this.contains(btn)) {
          btn.click();
        }
      }
    };

    this.addEventListener('click', this.clickHandler);
    this.addEventListener('keydown', this.keyHandler);
    this.addEventListener('keyup', this.keyUpHandler);
  }

  private detachEvents() {
    if (this.clickHandler) {
      this.removeEventListener('click', this.clickHandler);
      delete this.clickHandler;
    }
    if (this.keyHandler) {
      this.removeEventListener('keydown', this.keyHandler);
      delete this.keyHandler;
    }
    if (this.keyUpHandler) {
      this.removeEventListener('keyup', this.keyUpHandler);
      delete this.keyUpHandler;
    }
  }

  // Public methods for programmatic control
  nextStep(): boolean {
    if (this.current < this.total) {
      this.setAttribute('current', String(this.current + 1));
      return true;
    }
    return false;
  }

  previousStep(): boolean {
    if (this.current > 1) {
      this.setAttribute('current', String(this.current - 1));
      return true;
    }
    return false;
  }

  goToStep(step: number): void {
    const validStep = Math.max(1, Math.min(step, this.total));
    this.setAttribute('current', String(validStep));
  }

  reset(): void {
    this.setAttribute('current', '1');
  }

  isComplete(): boolean {
    return this.current === this.total;
  }

  getCurrentStep(): number {
    return this.current;
  }

  getTotalSteps(): number {
    return this.total;
  }
}

// Register component
if (!customElements.get('progress-dots')) {
  customElements.define('progress-dots', ProgressDots);
}
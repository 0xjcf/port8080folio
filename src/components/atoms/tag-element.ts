/**
 * Tag Element Web Component
 * Atomic Design: Atom
 * 
 * Tag component for categorization/filtering with light DOM
 * Uses CSS classes for all styling (no inline styles)
 */
export class TagElement extends HTMLElement {
  private _label = '';
  private _clickHandler?: (e: Event) => void;
  private _keyHandler?: (e: KeyboardEvent) => void;
  private _keyUpHandler?: (e: KeyboardEvent) => void;
  private _removeHandler?: (e: Event) => void;

  static get observedAttributes() {
    return ['color', 'removable', 'clickable', 'aria-label'];
  }

  connectedCallback() {
    if (this.isConnected) {
      // Capture label BEFORE modifying innerHTML
      this._label = this._extractInitialLabel();

      // Initial render
      this._renderContent();

      // Sync all attributes after rendering
      this._syncClickable();
      this._syncColor();
      // Note: _syncRemovable not needed here as button is already rendered in _renderContent

      // Bind events once
      this._bindEvents();
    }
  }

  disconnectedCallback() {
    this._detachEvents();
    this._label = '';
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    // Skip if values are the same
    if (oldValue === newValue) return;
    
    // Only react to attribute changes after initial setup
    // We know we're initialized when _label has been set
    if (!this._label) {
      return;
    }

    switch (name) {
      case 'clickable':
        this._syncClickable();
        break;
      case 'removable':
        this._syncRemovable();
        break;
      case 'color':
        this._syncColor();
        break;
      case 'aria-label':
        this._label = this.getAttribute('aria-label')?.trim() || this._labelFromDom();
        this._refreshRemoveAria();
        break;
    }
  }

  // Helper methods for extracting and managing label
  private _extractInitialLabel(): string {
    // Check for aria-label attribute first
    const fromAria = this.getAttribute('aria-label')?.trim();
    if (fromAria) return fromAria;

    // Get text content before any rendering
    const text = this.textContent?.trim() || '';
    return text;
  }

  private _labelFromDom(): string {
    // Use textContent for robustness (works even if text is wrapped)
    const text = this.querySelector('.tag__text')?.textContent?.trim();
    return text || this._label;
  }

  // Render the initial content structure (XSS-safe with DOM APIs)
  private _renderContent() {
    // Clear existing content
    this.innerHTML = '';
    
    // Create text span
    const textSpan = document.createElement('span');
    textSpan.className = 'tag__text';
    textSpan.textContent = this._label;
    this.appendChild(textSpan);
    
    // Add remove button if needed
    if (this.hasAttribute('removable')) {
      this.appendChild(this._createRemoveButton());
    }
  }

  private _createRemoveButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tag__remove';
    btn.setAttribute('aria-label', `Remove ${this._label}`);
    
    const closeIcon = document.createElement('span');
    closeIcon.setAttribute('aria-hidden', 'true');
    closeIcon.textContent = '×';
    btn.appendChild(closeIcon);
    
    return btn;
  }

  // Sync methods for attributes
  private _syncClickable() {
    const isClickable = this.hasAttribute('clickable');
    const isRemovable = this.hasAttribute('removable');

    this.classList.toggle('tag--clickable', isClickable);

    // Only add button role if not removable (to avoid nested interactive elements)
    if (isClickable && !isRemovable) {
      this.setAttribute('role', 'button');
      this.setAttribute('tabindex', '0');
      // Ensure accessible name - don't set aria-label if there's visible text
      const visibleText = this._labelFromDom();
      if (!visibleText && this._label) {
        this.setAttribute('aria-label', this._label);
      } else {
        this.removeAttribute('aria-label');
      }
    } else {
      this.removeAttribute('role');
      this.removeAttribute('tabindex');
      this.removeAttribute('aria-label');
    }
  }

  private _syncRemovable() {
    const hasRemovable = this.hasAttribute('removable');
    const btn = this.querySelector('.tag__remove');

    if (hasRemovable && !btn) {
      // Add remove button safely
      this.appendChild(this._createRemoveButton());
    } else if (!hasRemovable && btn) {
      // Remove the button
      btn.remove();
    } else if (hasRemovable && btn) {
      // Update aria-label
      this._refreshRemoveAria();
    }
    
    // Update clickable state to handle nested interactive elements
    if (this.hasAttribute('clickable')) {
      this._syncClickable();
    }
  }

  private _refreshRemoveAria() {
    const btn = this.querySelector<HTMLButtonElement>('.tag__remove');
    if (btn) {
      // Use the stored label, not the DOM text
      btn.setAttribute('aria-label', `Remove ${this._label}`);
    }
  }

  private _syncColor() {
    // Remove any existing color class (keep transient state classes)
    Array.from(this.classList)
      .filter(c => c.startsWith('tag--') && !['tag--clickable', 'tag--clicked', 'tag--removing'].includes(c))
      .forEach(c => this.classList.remove(c));

    // Add current color class (open-ended, not limited to specific colors)
    const color = this.getAttribute('color');
    if (color) {
      this.classList.add(`tag--${color}`);
    }

    // Base tag class
    this.classList.add('tag');
  }

  // Event binding
  private _bindEvents() {
    // Single click handler for both remove and tag click
    this._clickHandler = (e: Event) => {
      const target = e.target as Element | null;

      // Check if remove button was clicked
      if (target?.closest('.tag__remove')) {
        e.stopPropagation();
        this.classList.add('tag--removing');
        this.dispatchEvent(new CustomEvent('tag-remove', {
          bubbles: true,
          detail: { text: this._label }
        }));
        return;
      }

      // Handle clickable tag
      if (this.hasAttribute('clickable')) {
        this.classList.add('tag--clicked');
        this.dispatchEvent(new CustomEvent('tag-click', {
          bubbles: true,
          detail: { text: this._label }
        }));

        // Remove visual feedback after animation
        setTimeout(() => {
          this.classList.remove('tag--clicked');
        }, 200);
      }
    };

    // Keyboard support (native-like: Enter on keydown, Space on keyup)
    this._keyHandler = (e: KeyboardEvent) => {
      if (!this.hasAttribute('clickable')) return;
      
      if (e.key === 'Enter') {
        e.preventDefault();
        this.click();
      }
      // Prevent page scroll on space keydown
      if (e.key === ' ') {
        e.preventDefault();
      }
    };
    
    this._keyUpHandler = (e: KeyboardEvent) => {
      if (!this.hasAttribute('clickable')) return;
      
      if (e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    };

    // Animation end handler for removal
    this._removeHandler = (e: Event) => {
      const ae = e as AnimationEvent;
      if (ae.target === this && this.classList.contains('tag--removing')) {
        this.remove();
      }
    };

    this.addEventListener('click', this._clickHandler);
    this.addEventListener('keydown', this._keyHandler);
    this.addEventListener('keyup', this._keyUpHandler);
    this.addEventListener('animationend', this._removeHandler);
  }

  private _detachEvents() {
    if (this._clickHandler) {
      this.removeEventListener('click', this._clickHandler);
      delete this._clickHandler;
    }
    if (this._keyHandler) {
      this.removeEventListener('keydown', this._keyHandler);
      delete this._keyHandler;
    }
    if (this._keyUpHandler) {
      this.removeEventListener('keyup', this._keyUpHandler);
      delete this._keyUpHandler;
    }
    if (this._removeHandler) {
      this.removeEventListener('animationend', this._removeHandler);
      delete this._removeHandler;
    }
  }
}

// Register component
if (!customElements.get('tag-el')) {
  customElements.define('tag-el', TagElement);
}
/**
 * Form Checkbox Web Component
 * Atomic Design: Atom
 * 
 * Enhanced checkbox with custom styling
 * Renders in light DOM for accessibility
 */
export class FormCheckbox extends HTMLElement {
  private _changeHandler?: (e: Event) => void;
  private _focusHandler?: (e: Event) => void;
  private _blurHandler?: (e: Event) => void;
  private _inputId: string;
  private _input?: HTMLInputElement;
  private _labelEl?: HTMLLabelElement;
  private _textEl?: HTMLSpanElement | null;
  private _ignoreAttrChange = false;  // Guard to prevent feedback loops

  static get observedAttributes() {
    return ['name', 'label', 'value', 'checked', 'required', 'disabled', 'indeterminate'];
  }

  constructor() {
    super();
    this._inputId = `checkbox-${Math.random().toString(36).substring(2, 11)}`;
  }

  connectedCallback() {
    if (!this.isConnected) return;
    this.ensureDom();
    this.attachEvents();
    this.applyAllAttributes();
  }

  disconnectedCallback() {
    this.detachEvents();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue || !this.isConnected || this._ignoreAttrChange) return;
    
    // Apply attribute change without re-rendering
    this.preserveFocus(() => {
      this.applyAttribute(name);
    });
  }

  // Create DOM structure only once
  private ensureDom() {
    // Check if DOM already exists
    const existingInput = this.querySelector<HTMLInputElement>('.form-checkbox__input');
    const existingLabel = this.querySelector<HTMLLabelElement>('.form-checkbox__label');
    const existingText = this.querySelector<HTMLSpanElement>('.form-checkbox__text');
    
    if (existingInput && existingLabel) {
      this._input = existingInput;
      this._labelEl = existingLabel;
      this._textEl = existingText || null;
      return;
    }

    // Preserve author-supplied classes
    const authorClasses = Array.from(this.classList).filter(c => 
      !c.startsWith('form-checkbox') && !c.startsWith('is-')
    );
    
    // Ensure base class and add preserved author classes
    this.classList.add('form-checkbox');
    authorClasses.forEach(c => this.classList.add(c));

    // Build DOM structure once
    const label = document.createElement('label');
    label.className = 'form-checkbox__label';
    label.setAttribute('for', this._inputId);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = this._inputId;
    input.className = 'form-checkbox__input';

    const box = document.createElement('span');
    box.className = 'form-checkbox__box';
    box.setAttribute('aria-hidden', 'true');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'form-checkbox__checkmark');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('role', 'presentation');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M9 16.2l-3.6-3.6L4 14l5 5L20 8l-1.4-1.4z');
    svg.appendChild(path);

    const indeterminateSpan = document.createElement('span');
    indeterminateSpan.className = 'form-checkbox__indeterminate';
    indeterminateSpan.textContent = '−';

    box.appendChild(svg);
    box.appendChild(indeterminateSpan);

    label.appendChild(input);
    label.appendChild(box);

    this.appendChild(label);

    // Store references
    this._input = input;
    this._labelEl = label;
  }

  // Apply all attributes on initial render
  private applyAllAttributes() {
    ['checked', 'disabled', 'required', 'indeterminate', 'name', 'value', 'label']
      .forEach(name => this.applyAttribute(name));
  }

  // Apply a single attribute change incrementally
  private applyAttribute(name: string) {
    if (!this._input || !this._labelEl) return;

    switch (name) {
      case 'checked': {
        const checked = this.hasAttribute('checked');
        this._input.checked = checked;
        this.classList.toggle('is-checked', checked);
        this.syncAriaChecked();
        break;
      }
      
      case 'indeterminate': {
        const indeterminate = this.hasAttribute('indeterminate');
        this._input.indeterminate = indeterminate;
        this.classList.toggle('is-indeterminate', indeterminate);
        this.syncAriaChecked();
        break;
      }
      
      case 'disabled': {
        const disabled = this.hasAttribute('disabled');
        this._input.disabled = disabled;
        this.classList.toggle('is-disabled', disabled);
        this._input.setAttribute('aria-disabled', String(disabled));
        this._labelEl.classList.toggle('form-checkbox__label--disabled', disabled);
        break;
      }
      
      case 'required': {
        const required = this.hasAttribute('required');
        this._input.required = required;
        this._input.setAttribute('aria-required', String(required));
        
        // Handle required indicator
        let requiredEl = this._labelEl.querySelector('.form-checkbox__required');
        if (required && !requiredEl) {
          requiredEl = document.createElement('span');
          requiredEl.className = 'form-checkbox__required';
          requiredEl.setAttribute('aria-label', 'required');
          requiredEl.textContent = '*';
          this._labelEl.appendChild(requiredEl);
        } else if (!required && requiredEl) {
          requiredEl.remove();
        }
        break;
      }
      
      case 'name':
        this._input.name = this.getAttribute('name') || '';
        break;
        
      case 'value':
        this._input.value = this.getAttribute('value') || 'on';
        break;
        
      case 'label': {
        const labelText = this.getAttribute('label') || '';
        
        if (labelText) {
          if (!this._textEl) {
            this._textEl = document.createElement('span');
            this._textEl.className = 'form-checkbox__text';
            // Insert before required indicator if exists
            const requiredEl = this._labelEl.querySelector('.form-checkbox__required');
            if (requiredEl) {
              this._labelEl.insertBefore(this._textEl, requiredEl);
            } else {
              this._labelEl.appendChild(this._textEl);
            }
          }
          this._textEl.textContent = labelText;
        } else if (this._textEl) {
          this._textEl.remove();
          this._textEl = null;
        }
        break;
      }
    }
  }

  // Sync aria-checked based on current state
  private syncAriaChecked() {
    if (!this._input) return;
    this._input.setAttribute(
      'aria-checked',
      this._input.indeterminate ? 'mixed' : String(this._input.checked)
    );
  }

  // Preserve focus when making updates
  private preserveFocus(fn: () => void) {
    const hadFocus = document.activeElement === this._input;
    fn();
    if (hadFocus && this._input) {
      this._input.focus();
    }
  }


  attachEvents() {
    this.detachEvents();
    
    if (!this._input || !this._labelEl) return;
    
    // Store references for event handlers
    const input = this._input;
    const labelEl = this._labelEl;
    
    // Change event
    this._changeHandler = () => {
      if (!input) return;
      
      // Clear indeterminate on user interaction (with guard to prevent attributeChangedCallback loop)
      if (input.indeterminate || this.hasAttribute('indeterminate')) {
        this._ignoreAttrChange = true;
        input.indeterminate = false;
        this.removeAttribute('indeterminate');
        this._ignoreAttrChange = false;
        this.classList.remove('is-indeterminate');
      }
      
      // Update checked attribute and state class (with guard)
      this._ignoreAttrChange = true;
      if (input.checked) {
        this.setAttribute('checked', '');
        this.classList.add('is-checked');
      } else {
        this.removeAttribute('checked');
        this.classList.remove('is-checked');
      }
      this._ignoreAttrChange = false;
      
      // Update aria-checked
      this.syncAriaChecked();
      
      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('checkbox-change', {
        detail: { 
          checked: input.checked, 
          value: input.value,
          name: input.name
        },
        bubbles: true
      }));
    };
    
    // Focus styles
    this._focusHandler = () => {
      if (labelEl) {
        labelEl.classList.add('form-checkbox__label--focused');
      }
      this.classList.add('is-focused');
    };
    
    this._blurHandler = () => {
      if (labelEl) {
        labelEl.classList.remove('form-checkbox__label--focused');
      }
      this.classList.remove('is-focused');
    };
    
    this._input.addEventListener('change', this._changeHandler);
    this._input.addEventListener('focus', this._focusHandler);
    this._input.addEventListener('blur', this._blurHandler);
  }

  detachEvents() {
    if (this._input) {
      if (this._changeHandler) this._input.removeEventListener('change', this._changeHandler);
      if (this._focusHandler) this._input.removeEventListener('focus', this._focusHandler);
      if (this._blurHandler) this._input.removeEventListener('blur', this._blurHandler);
    }
    
    delete this._changeHandler;
    delete this._focusHandler;
    delete this._blurHandler;
  }

  // Public methods
  isChecked(): boolean {
    return this._input ? this._input.checked : false;
  }

  setChecked(checked: boolean): void {
    if (!this._input) return;
    
    this._input.checked = checked;
    this._ignoreAttrChange = true;
    if (checked) {
      this.setAttribute('checked', '');
      this.classList.add('is-checked');
    } else {
      this.removeAttribute('checked');
      this.classList.remove('is-checked');
    }
    this._ignoreAttrChange = false;
    this.syncAriaChecked();
    this._input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  setIndeterminate(indeterminate: boolean): void {
    if (!this._input) return;
    
    this._input.indeterminate = indeterminate;
    this._ignoreAttrChange = true;
    if (indeterminate) {
      this.setAttribute('indeterminate', '');
      this.classList.add('is-indeterminate');
      this.classList.remove('is-checked');
    } else {
      this.removeAttribute('indeterminate');
      this.classList.remove('is-indeterminate');
      if (this._input.checked) {
        this.classList.add('is-checked');
      }
    }
    this._ignoreAttrChange = false;
    this.syncAriaChecked();
  }

  toggle(): void {
    this.setChecked(!this.isChecked());
  }

  getValue(): string | null {
    return this._input && this._input.checked ? this._input.value : null;
  }

  getName(): string {
    return this._input ? this._input.name : '';
  }

  isDisabled(): boolean {
    return this.hasAttribute('disabled');
  }

  setDisabled(disabled: boolean): void {
    if (!this._input) return;
    
    this._input.disabled = disabled;
    this._ignoreAttrChange = true;
    if (disabled) {
      this.setAttribute('disabled', '');
      this.classList.add('is-disabled');
    } else {
      this.removeAttribute('disabled');
      this.classList.remove('is-disabled');
    }
    this._ignoreAttrChange = false;
  }

  override focus(): void {
    if (this._input) this._input.focus();
  }

  override blur(): void {
    if (this._input) this._input.blur();
  }
}

// Register component
if (!customElements.get('form-checkbox')) {
  customElements.define('form-checkbox', FormCheckbox);
}
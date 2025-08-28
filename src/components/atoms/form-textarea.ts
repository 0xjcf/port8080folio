/**
 * Form Textarea Web Component
 * Atomic Design: Atom
 * 
 * Enhanced textarea with character count and auto-resize
 * Renders in light DOM for accessibility
 */
export class FormTextarea extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'label', 'placeholder', 'required', 'maxlength', 'rows', 'error', 'helper', 'value', 'disabled', 'autoresize'];
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
      this.bindEvents();
    }
  }

  render() {
    const name = this.getAttribute('name') || '';
    const label = this.getAttribute('label') || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const required = this.hasAttribute('required');
    const maxlength = this.getAttribute('maxlength') || '';
    const rows = this.getAttribute('rows') || '4';
    const error = this.getAttribute('error') || '';
    const helper = this.getAttribute('helper') || '';
    const value = this.getAttribute('value') || '';
    const disabled = this.hasAttribute('disabled');
    const autoresize = this.hasAttribute('autoresize');
    const id = `textarea-${Math.random().toString(36).substr(2, 9)}`;

    this.className = 'form-field form-field--textarea';

    this.innerHTML = `
      ${label ? `
        <label for="${id}" class="form-field__label">
          ${label}
          ${required ? '<span class="form-field__required">*</span>' : ''}
        </label>
      ` : ''}
      
      <div class="form-field__textarea-wrapper">
        <textarea
          id="${id}"
          name="${name}"
          class="form-field__textarea ${error ? 'form-field__textarea--error' : ''} ${autoresize ? 'form-field__textarea--autoresize' : ''}"
          rows="${rows}"
          ${placeholder ? `placeholder="${placeholder}"` : ''}
          ${required ? 'required' : ''}
          ${maxlength ? `maxlength="${maxlength}"` : ''}
          ${disabled ? 'disabled' : ''}
          aria-invalid="${error ? 'true' : 'false'}"
          ${error ? `aria-describedby="${id}-error"` : ''}
        >${value}</textarea>
        
        ${maxlength ? `
          <span class="form-field__char-count">
            <span class="form-field__char-current">0</span> / ${maxlength}
          </span>
        ` : ''}
      </div>
      
      ${error ? `
        <span id="${id}-error" class="form-field__error" role="alert">
          ${error}
        </span>
      ` : ''}
      
      ${helper && !error ? `
        <span class="form-field__helper">${helper}</span>
      ` : ''}
    `;
  }

  bindEvents() {
    const textarea = this.querySelector('.form-field__textarea');
    if (!textarea) return;

    // Character count
    if (this.getAttribute('maxlength')) {
      this.updateCharCount(textarea);
      textarea.addEventListener('input', () => this.updateCharCount(textarea));
    }

    // Auto-resize
    if (this.hasAttribute('autoresize')) {
      this.autoResize(textarea);
      textarea.addEventListener('input', () => this.autoResize(textarea));

      // Initial resize
      setTimeout(() => this.autoResize(textarea), 0);
    }

    // Validation
    textarea.addEventListener('input', () => {
      this.validateTextarea(textarea);
      this.dispatchEvent(new CustomEvent('textarea-change', {
        detail: { value: textarea.value, valid: textarea.validity.valid },
        bubbles: true
      }));
    });

    textarea.addEventListener('blur', () => {
      this.validateTextarea(textarea);
      textarea.classList.add('form-field__textarea--touched');
    });

    textarea.addEventListener('focus', () => {
      this.removeAttribute('error');
      textarea.classList.remove('form-field__textarea--error');
    });
  }

  updateCharCount(textarea) {
    const current = this.querySelector('.form-field__char-current');
    const counter = this.querySelector('.form-field__char-count');

    if (current) {
      const length = textarea.value.length;
      const max = parseInt(this.getAttribute('maxlength'));
      current.textContent = length;

      // Add warning class when near limit
      if (counter) {
        if (length >= max * 0.9) {
          counter.classList.add('form-field__char-count--warning');
        } else {
          counter.classList.remove('form-field__char-count--warning');
        }

        if (length >= max) {
          counter.classList.add('form-field__char-count--error');
        } else {
          counter.classList.remove('form-field__char-count--error');
        }
      }
    }
  }

  autoResize(textarea) {
    // Reset height to recalculate
    textarea.style.height = 'auto';

    // Set new height based on content
    const newHeight = Math.min(textarea.scrollHeight, 400); // Max height of 400px
    textarea.style.height = newHeight + 'px';

    // Add scrollbar class if needed
    if (textarea.scrollHeight > 400) {
      textarea.classList.add('form-field__textarea--scrollable');
    } else {
      textarea.classList.remove('form-field__textarea--scrollable');
    }
  }

  validateTextarea(textarea) {
    if (textarea.validity.valid && textarea.value) {
      textarea.classList.add('form-field__textarea--valid');
      textarea.classList.remove('form-field__textarea--error');
    } else if (!textarea.validity.valid && textarea.classList.contains('form-field__textarea--touched')) {
      textarea.classList.add('form-field__textarea--error');
      textarea.classList.remove('form-field__textarea--valid');

      this.setAttribute('error', this.getErrorMessage(textarea));
    }
  }

  getErrorMessage(textarea) {
    if (textarea.validity.valueMissing) {
      return `${this.getAttribute('label') || 'This field'} is required`;
    }
    if (textarea.validity.tooLong) {
      return `Please use no more than ${textarea.maxLength} characters`;
    }
    if (textarea.validity.tooShort) {
      return `Please use at least ${textarea.minLength} characters`;
    }
    return 'Please enter a valid value';
  }

  // Public methods
  getValue() {
    const textarea = this.querySelector('.form-field__textarea');
    return textarea ? textarea.value : '';
  }

  setValue(value) {
    const textarea = this.querySelector('.form-field__textarea');
    if (textarea) {
      textarea.value = value;
      this.validateTextarea(textarea);
      if (this.hasAttribute('autoresize')) {
        this.autoResize(textarea);
      }
      if (this.getAttribute('maxlength')) {
        this.updateCharCount(textarea);
      }
    }
  }

  clear() {
    const textarea = this.querySelector('.form-field__textarea');
    if (textarea) {
      textarea.value = '';
      textarea.classList.remove('form-field__textarea--valid', 'form-field__textarea--error', 'form-field__textarea--touched');
      this.removeAttribute('error');
      if (this.hasAttribute('autoresize')) {
        this.autoResize(textarea);
      }
      if (this.getAttribute('maxlength')) {
        this.updateCharCount(textarea);
      }
    }
  }

  focus() {
    const textarea = this.querySelector('.form-field__textarea');
    if (textarea) textarea.focus();
  }
}

// Register component
customElements.define('form-textarea', FormTextarea);

/**
 * Form Input Web Component
 * Atomic Design: Atom
 * 
 * Enhanced input field with validation and styling
 * Renders in light DOM for accessibility
 */
export class FormInput extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'name', 'label', 'placeholder', 'required', 'pattern', 'error', 'helper', 'value', 'disabled'];
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
    const type = this.getAttribute('type') || 'text';
    const name = this.getAttribute('name') || '';
    const label = this.getAttribute('label') || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const required = this.hasAttribute('required');
    const pattern = this.getAttribute('pattern') || '';
    const error = this.getAttribute('error') || '';
    const helper = this.getAttribute('helper') || '';
    const value = this.getAttribute('value') || '';
    const disabled = this.hasAttribute('disabled');
    const id = `input-${Math.random().toString(36).substr(2, 9)}`;

    this.className = 'form-field';

    this.innerHTML = `
      ${label ? `
        <label for="${id}" class="form-field__label">
          ${label}
          ${required ? '<span class="form-field__required">*</span>' : ''}
        </label>
      ` : ''}
      
      <div class="form-field__input-wrapper">
        <input
          id="${id}"
          type="${type}"
          name="${name}"
          class="form-field__input ${error ? 'form-field__input--error' : ''}"
          ${placeholder ? `placeholder="${placeholder}"` : ''}
          ${value ? `value="${value}"` : ''}
          ${required ? 'required' : ''}
          ${pattern ? `pattern="${pattern}"` : ''}
          ${disabled ? 'disabled' : ''}
          aria-invalid="${error ? 'true' : 'false'}"
          ${error ? `aria-describedby="${id}-error"` : ''}
        />
        
        ${this.getIcon(type)}
        
        <span class="form-field__validation-icon"></span>
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

  getIcon(type) {
    const icons = {
      email: '<span class="form-field__icon">📧</span>',
      password: '<span class="form-field__icon">🔒</span>',
      search: '<span class="form-field__icon">🔍</span>',
      tel: '<span class="form-field__icon">📱</span>',
      url: '<span class="form-field__icon">🔗</span>'
    };

    return icons[type] || '';
  }

  bindEvents() {
    const input = this.querySelector('.form-field__input');
    if (!input) return;

    // Real-time validation
    input.addEventListener('input', () => {
      this.validateInput(input);
      this.dispatchEvent(new CustomEvent('input-change', {
        detail: { value: input.value, valid: input.validity.valid },
        bubbles: true
      }));
    });

    // Validation on blur
    input.addEventListener('blur', () => {
      this.validateInput(input);
      input.classList.add('form-field__input--touched');
    });

    // Clear error on focus
    input.addEventListener('focus', () => {
      this.removeAttribute('error');
      input.classList.remove('form-field__input--error');
    });

    // Password visibility toggle for password fields
    if (this.getAttribute('type') === 'password') {
      this.addPasswordToggle(input);
    }
  }

  validateInput(input) {
    const wrapper = this.querySelector('.form-field__input-wrapper');

    if (input.validity.valid && input.value) {
      input.classList.add('form-field__input--valid');
      input.classList.remove('form-field__input--error');
      wrapper.classList.add('form-field__input-wrapper--valid');

      // Update validation icon
      const icon = this.querySelector('.form-field__validation-icon');
      if (icon) icon.textContent = '✓';
    } else if (!input.validity.valid && input.classList.contains('form-field__input--touched')) {
      input.classList.add('form-field__input--error');
      input.classList.remove('form-field__input--valid');
      wrapper.classList.remove('form-field__input-wrapper--valid');

      // Set appropriate error message
      this.setAttribute('error', this.getErrorMessage(input));
    }
  }

  getErrorMessage(input) {
    if (input.validity.valueMissing) {
      return `${this.getAttribute('label') || 'This field'} is required`;
    }
    if (input.validity.typeMismatch) {
      return `Please enter a valid ${input.type}`;
    }
    if (input.validity.patternMismatch) {
      return this.getAttribute('pattern-error') || 'Please match the requested format';
    }
    if (input.validity.tooShort) {
      return `Please use at least ${input.minLength} characters`;
    }
    return 'Please enter a valid value';
  }

  addPasswordToggle(input) {
    const wrapper = this.querySelector('.form-field__input-wrapper');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'form-field__password-toggle';
    toggle.setAttribute('aria-label', 'Toggle password visibility');
    toggle.innerHTML = '<span>👁</span>';

    toggle.addEventListener('click', () => {
      const type = input.type === 'password' ? 'text' : 'password';
      input.type = type;
      toggle.innerHTML = type === 'password' ? '<span>👁</span>' : '<span>👁‍🗨</span>';
    });

    wrapper.appendChild(toggle);
  }

  // Public methods
  getValue() {
    const input = this.querySelector('.form-field__input');
    return input ? input.value : '';
  }

  setValue(value) {
    const input = this.querySelector('.form-field__input');
    if (input) {
      input.value = value;
      this.validateInput(input);
    }
  }

  clear() {
    const input = this.querySelector('.form-field__input');
    if (input) {
      input.value = '';
      input.classList.remove('form-field__input--valid', 'form-field__input--error', 'form-field__input--touched');
      this.removeAttribute('error');
    }
  }

  focus() {
    const input = this.querySelector('.form-field__input');
    if (input) input.focus();
  }
}

// Register component
customElements.define('form-input', FormInput);

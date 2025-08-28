/**
 * Form Validation Web Component
 * Atomic Design: Atom
 * 
 * Enhances existing forms with real-time validation
 * Works with native HTML5 validation API
 */
export class FormValidate extends HTMLElement {
  private form: HTMLFormElement | null = null;

  connectedCallback() {
    const formSelector = this.getAttribute('target');
    this.form = formSelector ? 
      document.querySelector(formSelector) : 
      this.closest('form');
    
    if (!this.form) {
      console.warn('FormValidate: No form found');
      return;
    }
    
    this.setupValidation();
    this.addHoneypot();
    this.addTimestamp();
  }

  setupValidation() {
    if (!this.form) return;

    // Add novalidate to handle validation ourselves
    this.form.setAttribute('novalidate', '');
    
    // Get all form fields
    const fields = this.form.querySelectorAll('input, textarea, select');
    
    fields.forEach(field => {
      // Real-time validation on input
      field.addEventListener('input', () => this.validateField(field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, false));
      
      // Full validation on blur
      field.addEventListener('blur', () => this.validateField(field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, true));
      
      // Clear error on focus
      field.addEventListener('focus', () => this.clearFieldError(field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement));
    });
    
    // Form submission validation
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  validateField(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, showError = true): boolean {
    const parent = field.closest('.form-field') || field.parentElement;
    
    if (!parent) return true;

    // Remove previous states
    parent.classList.remove('form-field--error', 'form-field--success', 'form-field--warning');
    
    // Check HTML5 validity
    if (!field.validity.valid) {
      if (showError) {
        parent.classList.add('form-field--error');
        this.showFieldMessage(parent, this.getErrorMessage(field), 'error');
      }
      return false;
    }
    
    // Custom validation rules
    if (field.type === 'email' && field.value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(field.value)) {
        if (showError) {
          parent.classList.add('form-field--error');
          this.showFieldMessage(parent, 'Please enter a valid email address', 'error');
        }
        return false;
      }
    }
    
    // Password strength check
    if (field.type === 'password' && field.value) {
      const strength = this.checkPasswordStrength(field.value);
      if (strength < 2) {
        parent.classList.add('form-field--warning');
        this.showFieldMessage(parent, 'Weak password - consider using uppercase, numbers, and symbols', 'warning');
        return true; // Still valid, just weak
      }
    }
    
    // Field is valid
    if (field.value && showError) {
      parent.classList.add('form-field--success');
      this.clearFieldMessage(parent);
    }
    
    return true;
  }

  getErrorMessage(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
    if (field.validity.valueMissing) {
      return field.getAttribute('data-error-required') || 'This field is required';
    }
    if (field.validity.typeMismatch) {
      return field.getAttribute('data-error-type') || `Please enter a valid ${field.type}`;
    }
    if (field.validity.tooShort) {
      return field.getAttribute('data-error-minlength') || 
        `Must be at least ${field.getAttribute('minlength')} characters`;
    }
    if (field.validity.tooLong) {
      return field.getAttribute('data-error-maxlength') || 
        `Must be no more than ${field.getAttribute('maxlength')} characters`;
    }
    if (field.validity.patternMismatch) {
      return field.getAttribute('data-error-pattern') || 'Please match the requested format';
    }
    
    return 'Please correct this field';
  }

  showFieldMessage(parent: Element, message: string, type = 'error') {
    let helper = parent.querySelector('.form-helper');
    
    if (!helper) {
      helper = document.createElement('span');
      helper.className = 'form-helper';
      parent.appendChild(helper);
    }
    
    helper.textContent = message;
    helper.className = `form-helper form-helper--${type}`;
  }

  clearFieldMessage(parent: Element) {
    const helper = parent.querySelector('.form-helper');
    if (helper) {
      helper.remove();
    }
  }

  clearFieldError(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
    const parent = field.closest('.form-field') || field.parentElement;
    if (!parent) return;
    
    parent.classList.remove('form-field--error', 'form-field--warning');
    this.clearFieldMessage(parent);
  }

  checkPasswordStrength(password: string): number {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    return strength;
  }

  handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!this.form) return;

    // Validate all fields
    const fields = this.form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    fields.forEach(field => {
      if (!this.validateField(field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, true)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      // Focus first error field
      const firstError = this.form.querySelector('.form-field--error input, .form-field--error textarea, .form-field--error select') as HTMLElement;
      if (firstError) {
        firstError.focus();
      }
      
      // Dispatch validation failed event
      this.form.dispatchEvent(new CustomEvent('validation-failed'));
      return;
    }
    
    // Add loading state
    const submitBtn = this.form.querySelector('[type="submit"]') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    }
    
    // Dispatch validation success event
    this.form.dispatchEvent(new CustomEvent('validation-success', {
      detail: new FormData(this.form)
    }));
    
    // Allow form to submit
    this.form.submit();
  }

  addHoneypot() {
    if (!this.form) return;

    // Add honeypot field for spam protection
    if (!this.form.querySelector('[name="website"]')) {
      const honeypot = document.createElement('input');
      honeypot.type = 'text';
      honeypot.name = 'website';
      honeypot.tabIndex = -1;
      honeypot.setAttribute('aria-hidden', 'true');
      honeypot.style.position = 'absolute';
      honeypot.style.left = '-9999px';
      honeypot.style.width = '1px';
      honeypot.style.height = '1px';
      
      this.form.appendChild(honeypot);
    }
  }

  addTimestamp() {
    if (!this.form) return;

    // Add timestamp for additional spam protection
    if (!this.form.querySelector('[name="timestamp"]')) {
      const timestamp = document.createElement('input');
      timestamp.type = 'hidden';
      timestamp.name = 'timestamp';
      timestamp.value = Date.now().toString();
      
      this.form.appendChild(timestamp);
    }
  }
}

// Register component
if (!customElements.get('form-validate')) {
  customElements.define('form-validate', FormValidate);
}
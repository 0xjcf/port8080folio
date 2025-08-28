/**
 * Form Checkbox Group Web Component
 * Atomic Design: Atom
 * 
 * Groups multiple checkboxes with shared behavior
 * Manages selection state and provides fieldset semantics
 */

// Import FormCheckbox type for proper typing
import type { FormCheckbox } from './form-checkbox';

interface CheckboxOption {
  value: string;
  label: string;
}

export class FormCheckboxGroup extends HTMLElement {
  private _fieldsetEl?: HTMLFieldSetElement;
  private _legendEl?: HTMLLegendElement;
  private _optionsEl?: HTMLDivElement;
  private _errorEl?: HTMLSpanElement | null;
  private _helperEl?: HTMLSpanElement | null;
  private _changeHandler?: (e: Event) => void;
  private _ignoreAttrChange = false;
  private _uid = Math.random().toString(36).slice(2);
  
  private get _errorId() { return `fcg-error-${this._uid}`; }
  private get _helperId() { return `fcg-help-${this._uid}`; }
  
  static get observedAttributes() {
    return ['name', 'label', 'options', 'values', 'required', 'error', 'helper', 'inline', 'disabled'];
  }

  connectedCallback() {
    if (!this.isConnected) return;
    this.ensureDom();
    this.applyAllAttributes();
    this.attachEvents();
  }

  disconnectedCallback() {
    this.detachEvents();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue || this._ignoreAttrChange) return;
    
    // If not connected yet, attributes will be applied in connectedCallback
    if (!this.isConnected) return;
    
    // If DOM isn't ready yet, it will be applied in connectedCallback via applyAllAttributes
    if (!this._optionsEl && !this.querySelector('.form-checkbox-group')) {
      return; // DOM not ready yet, will be applied later
    }
    
    // Apply attribute changes incrementally
    this.applyAttribute(name);
  }

  // Create DOM structure only once
  private ensureDom() {
    // Check if DOM already exists
    const existingFieldset = this.querySelector<HTMLFieldSetElement>('.form-checkbox-group');
    const existingDiv = this.querySelector<HTMLDivElement>('.form-checkbox-group');
    
    if (existingFieldset || existingDiv) {
      // Reuse existing DOM elements
      if (existingFieldset) {
        this._fieldsetEl = existingFieldset;
        const legend = existingFieldset.querySelector<HTMLLegendElement>('.form-field__label');
        if (legend) {
          this._legendEl = legend;
        }
      }
      const optionsEl = this.querySelector<HTMLDivElement>('.form-checkbox-group__options');
      if (optionsEl) {
        this._optionsEl = optionsEl;
      }
      this._errorEl = this.querySelector<HTMLSpanElement>('.form-field__error');
      this._helperEl = this.querySelector<HTMLSpanElement>('.form-field__helper');
      return;
    }

    // Set base classes
    this.classList.add('form-field', 'form-field--checkbox-group');

    // Create container (fieldset or div based on whether we have a label)
    const label = this.getAttribute('label');
    
    if (label) {
      // Use fieldset with legend for labeled groups
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'form-checkbox-group';
      
      const legend = document.createElement('legend');
      legend.className = 'form-field__label';
      
      fieldset.appendChild(legend);
      this._fieldsetEl = fieldset;
      this._legendEl = legend;
      
      this.appendChild(fieldset);
    } else {
      // Use div for unlabeled groups with proper role
      const container = document.createElement('div');
      container.className = 'form-checkbox-group';
      container.setAttribute('role', 'group');
      this.appendChild(container);
    }

    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'form-checkbox-group__options';
    
    const parentContainer = this._fieldsetEl || this.querySelector('.form-checkbox-group');
    if (parentContainer) {
      parentContainer.appendChild(optionsContainer);
    }
    this._optionsEl = optionsContainer;
  }

  // Apply all attributes on initial render
  private applyAllAttributes() {
    // Apply options first, then values, then visual attributes
    // Error and helper should be last so they aren't affected by other updates
    ['options', 'name', 'values', 'label', 'required', 'inline', 'disabled', 'helper', 'error']
      .forEach(name => this.applyAttribute(name));
  }

  // Apply a single attribute change incrementally
  private applyAttribute(name: string) {
    switch (name) {
      case 'name':
        this.updateName();
        break;
        
      case 'label':
        this.updateLabel();
        break;
        
      case 'required':
        this.updateRequired();
        break;
        
      case 'inline':
        this.updateInline();
        break;
        
      case 'disabled':
        this.updateDisabled();
        break;
        
      case 'options':
        this.updateOptions();
        break;
        
      case 'values':
        this.updateValues();
        break;
        
      case 'error':
        this.updateError();
        break;
        
      case 'helper':
        this.updateHelper();
        break;
    }
  }

  private updateName() {
    const base = this.getAttribute('name') || 'checkbox-group';
    this.querySelectorAll('form-checkbox').forEach(cb => {
      cb.setAttribute('name', `${base}[]`);
    });
  }

  private updateLabel() {
    if (!this._legendEl) return;
    
    const label = this.getAttribute('label') || '';
    const required = this.hasAttribute('required');
    
    // Clear and rebuild legend content
    this._legendEl.textContent = label;
    
    if (required) {
      const requiredSpan = document.createElement('span');
      requiredSpan.className = 'form-field__required';
      requiredSpan.textContent = '*';
      this._legendEl.appendChild(requiredSpan);
    }
  }

  private updateRequired() {
    this.updateLabel(); // Required indicator is part of the label
    
    // Update ARIA required on fieldset
    if (this._fieldsetEl) {
      const required = this.hasAttribute('required');
      this._fieldsetEl.setAttribute('aria-required', String(required));
    }
  }

  private updateInline() {
    if (!this._optionsEl) return;
    
    const inline = this.hasAttribute('inline');
    this._optionsEl.classList.toggle('form-checkbox-group__options--inline', inline);
    this.classList.toggle('form-field--inline', inline);
  }

  private updateDisabled() {
    const disabled = this.hasAttribute('disabled');
    this.classList.toggle('form-field--disabled', disabled);
    this.querySelectorAll('form-checkbox').forEach(cb => {
      cb.toggleAttribute('disabled', disabled);
    });
  }

  private updateOptions() {
    if (!this._optionsEl) return;
    
    const name = this.getAttribute('name') || 'checkbox-group';
    const optionsStr = this.getAttribute('options') || '';
    const options = this.parseOptions(optionsStr);
    const currentValues = this.getValues();
    const isDisabled = this.hasAttribute('disabled');
    
    // Clear existing checkboxes
    this._optionsEl.innerHTML = '';
    
    // Create new checkboxes
    options.forEach(option => {
      const checkbox = document.createElement('form-checkbox');
      checkbox.setAttribute('name', `${name}[]`);
      checkbox.setAttribute('label', option.label);
      checkbox.setAttribute('value', option.value);
      
      // Preserve checked state if it was previously checked
      if (currentValues.includes(option.value)) {
        checkbox.setAttribute('checked', '');
      }
      
      // Apply disabled state if group is disabled
      if (isDisabled) {
        checkbox.setAttribute('disabled', '');
      }
      
      if (this._optionsEl) {
        this._optionsEl.appendChild(checkbox);
      }
    });
    
    // Don't attach events here - will be done in connectedCallback or when options change after initial render
  }

  private updateValues() {
    const valuesStr = this.getAttribute('values') || '';
    const values = valuesStr ? valuesStr.split(',').map(v => v.trim()) : [];
    
    const checkboxes = this.querySelectorAll<HTMLElement & FormCheckbox>('form-checkbox');
    checkboxes.forEach(checkbox => {
      const value = checkbox.getAttribute('value');
      if (value && checkbox.setChecked) {
        checkbox.setChecked(values.includes(value));
      }
    });
  }

  private updateError() {
    const error = this.getAttribute('error') || '';
    const container = this._fieldsetEl || this.querySelector('.form-checkbox-group');
    
    if (!container) return;
    
    // Remove existing error
    if (this._errorEl) {
      this._errorEl.remove();
      this._errorEl = null;
    }
    
    // Add new error if needed
    if (error) {
      const errorEl = document.createElement('span');
      errorEl.className = 'form-field__error';
      errorEl.id = this._errorId;
      errorEl.setAttribute('role', 'alert');
      errorEl.textContent = error;
      
      // Insert after options container
      if (this._optionsEl && this._optionsEl.nextSibling) {
        container.insertBefore(errorEl, this._optionsEl.nextSibling);
      } else {
        container.appendChild(errorEl);
      }
      
      this._errorEl = errorEl;
      this.classList.add('form-field--error');
      
      // Remove helper when error is shown
      if (this._helperEl) {
        this._helperEl.remove();
        this._helperEl = null;
      }
      this.syncDescribedBy();
    } else {
      this.classList.remove('form-field--error');
      // Re-add helper if it exists
      this.updateHelper();
      this.syncDescribedBy();
    }
  }

  private updateHelper() {
    const helper = this.getAttribute('helper') || '';
    const hasError = this.hasAttribute('error');
    const container = this._fieldsetEl || this.querySelector('.form-checkbox-group');
    
    if (!container) return;
    
    // Remove existing helper
    if (this._helperEl) {
      this._helperEl.remove();
      this._helperEl = null;
    }
    
    // Add new helper if needed and no error
    if (helper && !hasError) {
      const helperEl = document.createElement('span');
      helperEl.className = 'form-field__helper';
      helperEl.id = this._helperId;
      helperEl.textContent = helper;
      
      container.appendChild(helperEl);
      this._helperEl = helperEl;
      this.syncDescribedBy();
    }
  }

  private syncDescribedBy() {
    const group = this._fieldsetEl || this.querySelector('.form-checkbox-group');
    if (!group) return;
    
    const ids: string[] = [];
    if (this._errorEl) {
      ids.push(this._errorEl.id || this._errorId);
      group.setAttribute('aria-invalid', 'true');
    } else {
      group.removeAttribute('aria-invalid');
    }
    
    if (this._helperEl && !this._errorEl) {
      ids.push(this._helperEl.id || this._helperId);
    }
    
    if (ids.length) {
      group.setAttribute('aria-describedby', ids.join(' '));
    } else {
      group.removeAttribute('aria-describedby');
    }
  }

  private parseOptions(optionsStr: string): CheckboxOption[] {
    if (!optionsStr) return [];
    
    return optionsStr.split(',').map(option => {
      const trimmed = option.trim();
      const colonIndex = trimmed.indexOf(':');
      
      if (colonIndex > 0 && colonIndex < trimmed.length - 1) {
        // Split only at the first colon
        const value = trimmed.substring(0, colonIndex).trim();
        const label = trimmed.substring(colonIndex + 1).trim();
        return { value, label };
      }
      
      return { value: trimmed, label: trimmed };
    });
  }

  private attachEvents() {
    this.detachEvents();
    this.attachCheckboxEvents();
  }

  private attachCheckboxEvents() {
    const checkboxes = this.querySelectorAll('form-checkbox');
    
    if (!this._changeHandler) {
      this._changeHandler = () => {
        // Clear error on change only if there was an error
        if (this.hasAttribute('error')) {
          this._ignoreAttrChange = true;
          this.removeAttribute('error');
          this._ignoreAttrChange = false;
          this.updateError();
        }
        
        // Dispatch group change event
        this.dispatchEvent(new CustomEvent('checkbox-group-change', {
          detail: { 
            values: this.getValues(),
            name: this.getAttribute('name') || 'checkbox-group'
          },
          bubbles: true
        }));
      };
    }
    
    const handler = this._changeHandler;
    if (handler) {
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('checkbox-change', handler);
      });
    }
  }

  private detachEvents() {
    const handler = this._changeHandler;
    if (handler) {
      const checkboxes = this.querySelectorAll('form-checkbox');
      checkboxes.forEach(checkbox => {
        checkbox.removeEventListener('checkbox-change', handler as EventListener);
      });
    }
  }

  // Public methods
  getValues(): string[] {
    const checkboxes = this.querySelectorAll<HTMLElement & FormCheckbox>('form-checkbox');
    const values: string[] = [];
    
    checkboxes.forEach(checkbox => {
      // Check if element has the isChecked method
      if (checkbox.isChecked && checkbox.isChecked()) {
        const value = checkbox.getAttribute('value');
        if (value) values.push(value);
      }
    });
    
    return values;
  }

  setValues(values: string[]) {
    this._ignoreAttrChange = true;
    this.setAttribute('values', values.join(','));
    this._ignoreAttrChange = false;
    
    const checkboxes = this.querySelectorAll<HTMLElement & FormCheckbox>('form-checkbox');
    
    checkboxes.forEach(checkbox => {
      const value = checkbox.getAttribute('value');
      if (value && checkbox.setChecked) {
        checkbox.setChecked(values.includes(value));
      }
    });
  }

  clear() {
    const checkboxes = this.querySelectorAll<HTMLElement & FormCheckbox>('form-checkbox');
    checkboxes.forEach(checkbox => {
      if (checkbox.setChecked) {
        checkbox.setChecked(false);
      }
    });
    
    // Clear error if any
    this._ignoreAttrChange = true;
    this.removeAttribute('error');
    this._ignoreAttrChange = false;
    // Force update since we're inside ignoreAttrChange
    this.updateError();
  }

  validate(): boolean {
    const required = this.hasAttribute('required');
    if (!required) return true;
    
    const values = this.getValues();
    const isValid = values.length > 0;
    
    if (!isValid) {
      this._ignoreAttrChange = true;
      this.setAttribute('error', 'Please select at least one option');
      this._ignoreAttrChange = false;
      // Force update since we're inside ignoreAttrChange
      this.updateError();
    } else {
      // Clear error if validation passes
      this._ignoreAttrChange = true;
      this.removeAttribute('error');
      this._ignoreAttrChange = false;
      this.updateError();
    }
    
    return isValid;
  }

  setError(error: string) {
    this._ignoreAttrChange = true;
    if (error) {
      this.setAttribute('error', error);
    } else {
      this.removeAttribute('error');
    }
    this._ignoreAttrChange = false;
    // Force update since we're inside ignoreAttrChange
    this.updateError();
  }
}

// Register component
if (!customElements.get('form-checkbox-group')) {
  customElements.define('form-checkbox-group', FormCheckboxGroup);
}
/**
 * Form Radio Web Component
 * Atomic Design: Atom
 * 
 * Enhanced radio button group with custom styling
 * Renders in light DOM for accessibility
 */
export class FormRadio extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'label', 'options', 'value', 'required', 'error', 'helper', 'inline', 'card-style'];
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
      this.bindEvents();
    }
  }

  render() {
    const name = this.getAttribute('name') || 'radio-group';
    const label = this.getAttribute('label') || '';
    const optionsStr = this.getAttribute('options') || '';
    const value = this.getAttribute('value') || '';
    const required = this.hasAttribute('required');
    const error = this.getAttribute('error') || '';
    const helper = this.getAttribute('helper') || '';
    const inline = this.hasAttribute('inline');
    const cardStyle = this.hasAttribute('card-style');
    
    // Parse options
    const options = this.parseOptions(optionsStr);
    
    this.className = 'form-field form-field--radio-group';
    
    this.innerHTML = `
      <fieldset class="form-radio-group">
        ${label ? `
          <legend class="form-field__label">
            ${label}
            ${required ? '<span class="form-field__required">*</span>' : ''}
          </legend>
        ` : ''}
        
        <div class="form-radio-group__options ${inline ? 'form-radio-group__options--inline' : ''} ${cardStyle ? 'form-radio-group__options--card' : ''}">
          ${options.map(option => `
            <label class="form-radio ${cardStyle ? 'form-radio--card' : ''}">
              <input
                type="radio"
                name="${name}"
                value="${option.value}"
                class="form-radio__input"
                ${option.value === value ? 'checked' : ''}
                ${required ? 'required' : ''}
                ${option.disabled ? 'disabled' : ''}
              />
              
              <span class="form-radio__indicator"></span>
              
              <div class="form-radio__content">
                <span class="form-radio__label">${option.label}</span>
                ${option.description ? `
                  <span class="form-radio__description">${option.description}</span>
                ` : ''}
                ${option.price ? `
                  <span class="form-radio__price">${option.price}</span>
                ` : ''}
              </div>
            </label>
          `).join('')}
        </div>
        
        ${error ? `
          <span class="form-field__error" role="alert">
            ${error}
          </span>
        ` : ''}
        
        ${helper && !error ? `
          <span class="form-field__helper">${helper}</span>
        ` : ''}
      </fieldset>
    `;
  }

  parseOptions(optionsStr: string): Array<{ value: string; label: string; description: string; price: string; disabled: boolean }> {
    if (!optionsStr) return [];
    
    // Support multiple formats:
    // Simple: "value:label,value:label"
    // With description: "value:label|description,value:label|description"
    // With price: "value:label|description|price"
    
    return optionsStr.split(',').map(option => {
      const parts = option.trim().split(':');
      if (parts.length === 2) {
        const [value, rest] = parts;
        const details = rest.split('|');
        return {
          value,
          label: details[0] || value,
          description: details[1] || '',
          price: details[2] || '',
          disabled: false
        };
      }
      return { 
        value: option.trim(), 
        label: option.trim(),
        description: '',
        price: '',
        disabled: false
      };
    });
  }

  bindEvents() {
    const radios = this.querySelectorAll<HTMLInputElement>('.form-radio__input');
    
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        // Update visual state
        this.updateSelection(radio);
        
        // Update value attribute
        this.setAttribute('value', radio.value);
        
        // Clear error
        this.removeAttribute('error');
        
        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('radio-change', {
          detail: { 
            value: radio.value,
            name: radio.name
          },
          bubbles: true
        }));
      });
      
      // Keyboard navigation
      radio.addEventListener('keydown', (e: KeyboardEvent) => {
        const radios = Array.from(this.querySelectorAll<HTMLInputElement>('.form-radio__input:not([disabled])'));
        const currentIndex = radios.indexOf(radio);
        let nextIndex;
        
        switch(e.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            e.preventDefault();
            nextIndex = (currentIndex + 1) % radios.length;
            radios[nextIndex].focus();
            radios[nextIndex].click();
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            e.preventDefault();
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = radios.length - 1;
            radios[nextIndex].focus();
            radios[nextIndex].click();
            break;
        }
      });
    });
    
    // Add hover effects for card style
    if (this.hasAttribute('card-style')) {
      const labels = this.querySelectorAll('.form-radio--card');
      labels.forEach(label => {
        label.addEventListener('mouseenter', () => {
          if (!label.querySelector('input:checked') && !label.querySelector('input:disabled')) {
            label.classList.add('form-radio--hover');
          }
        });
        
        label.addEventListener('mouseleave', () => {
          label.classList.remove('form-radio--hover');
        });
      });
    }
  }

  updateSelection(selectedRadio: HTMLInputElement) {
    // Update all radio labels in the group
    const labels = this.querySelectorAll('.form-radio');
    labels.forEach(label => {
      const radio = label.querySelector<HTMLInputElement>('.form-radio__input');
      if (radio === selectedRadio) {
        label.classList.add('form-radio--selected');
      } else {
        label.classList.remove('form-radio--selected');
      }
    });
  }

  // Public methods
  getValue(): string | null {
    const checked = this.querySelector<HTMLInputElement>('.form-radio__input:checked');
    return checked ? checked.value : null;
  }

  setValue(value: string) {
    const radio = this.querySelector<HTMLInputElement>(`.form-radio__input[value="${value}"]`);
    if (radio) {
      radio.checked = true;
      this.updateSelection(radio);
      this.setAttribute('value', value);
    }
  }

  clear() {
    const radios = this.querySelectorAll<HTMLInputElement>('.form-radio__input');
    radios.forEach(radio => {
      radio.checked = false;
    });
    this.querySelectorAll('.form-radio').forEach(label => {
      label.classList.remove('form-radio--selected');
    });
    this.removeAttribute('value');
  }

  setError(message: string) {
    this.setAttribute('error', message);
  }

  clearError() {
    this.removeAttribute('error');
  }

  focus() {
    const firstRadio = this.querySelector<HTMLInputElement>('.form-radio__input:not([disabled])');
    if (firstRadio) firstRadio.focus();
  }
}

// Register component
if (!customElements.get('form-radio')) {
  customElements.define('form-radio', FormRadio);
}
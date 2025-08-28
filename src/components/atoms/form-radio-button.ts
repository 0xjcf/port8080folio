/**
 * Form Radio Button Web Component
 * Atomic Design: Atom
 * 
 * Single radio button component for custom implementations
 * Renders in light DOM for accessibility
 */
export class FormRadioButton extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'value', 'label', 'checked', 'disabled'];
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
      this.bindEvents();
    }
  }

  render() {
    const name = this.getAttribute('name') || '';
    const value = this.getAttribute('value') || '';
    const label = this.getAttribute('label') || '';
    const checked = this.hasAttribute('checked');
    const disabled = this.hasAttribute('disabled');
    const id = `radio-${Math.random().toString(36).substring(2, 11)}`;
    
    this.className = 'form-radio-button';
    
    this.innerHTML = `
      <label class="form-radio">
        <input
          type="radio"
          id="${id}"
          name="${name}"
          value="${value}"
          class="form-radio__input"
          ${checked ? 'checked' : ''}
          ${disabled ? 'disabled' : ''}
        />
        <span class="form-radio__indicator"></span>
        <span class="form-radio__label">${label}</span>
      </label>
    `;
  }

  bindEvents() {
    const input = this.querySelector<HTMLInputElement>('.form-radio__input');
    
    if (!input) return;
    
    input.addEventListener('change', () => {
      if (input.checked) {
        this.setAttribute('checked', '');
      } else {
        this.removeAttribute('checked');
      }
      
      this.dispatchEvent(new CustomEvent('radio-button-change', {
        detail: { 
          checked: input.checked,
          value: input.value,
          name: input.name
        },
        bubbles: true
      }));
    });
  }

  // Public methods
  isChecked(): boolean {
    const input = this.querySelector<HTMLInputElement>('.form-radio__input');
    return input ? input.checked : false;
  }

  setChecked(checked: boolean) {
    const input = this.querySelector<HTMLInputElement>('.form-radio__input');
    if (input) {
      input.checked = checked;
      if (checked) {
        this.setAttribute('checked', '');
      } else {
        this.removeAttribute('checked');
      }
    }
  }

  getValue(): string | null {
    const input = this.querySelector<HTMLInputElement>('.form-radio__input');
    return input && input.checked ? input.value : null;
  }

  focus() {
    const input = this.querySelector<HTMLInputElement>('.form-radio__input');
    if (input) input.focus();
  }
}

// Register component
if (!customElements.get('form-radio-button')) {
  customElements.define('form-radio-button', FormRadioButton);
}
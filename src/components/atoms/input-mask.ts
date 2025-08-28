/**
 * Input Mask Web Component
 * Atomic Design: Atom
 * 
 * Applies formatting masks to input fields
 * Supports phone numbers, dates, credit cards, etc.
 */
export class InputMask extends HTMLElement {
  connectedCallback() {
    const input = this.querySelector('input') as HTMLInputElement;
    const mask = this.getAttribute('mask');
    
    if (!input || !mask) return;
    
    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const value = target.value.replace(/\D/g, '');
      target.value = this.applyMask(value, mask);
    });
  }

  applyMask(value: string, mask: string): string {
    let masked = '';
    let valueIndex = 0;
    
    for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
      if (mask[i] === '#') {
        masked += value[valueIndex++];
      } else {
        masked += mask[i];
      }
    }
    
    return masked;
  }
}

// Register component
if (!customElements.get('input-mask')) {
  customElements.define('input-mask', InputMask);
}
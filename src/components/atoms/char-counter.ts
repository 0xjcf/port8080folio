/**
 * Character Counter Web Component
 * Atomic Design: Atom
 * 
 * Shows character count and remaining characters for text inputs
 * Updates in real-time and provides visual feedback
 */
export class CharCounter extends HTMLElement {
  private _input?: HTMLInputElement | HTMLTextAreaElement | null;
  private _onInput?: (e: Event) => void;
  private _countEl?: HTMLSpanElement;

  connectedCallback() {
    const targetId = this.getAttribute('target');
    if (!targetId) return;

    this._input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(targetId);
    const maxAttr = parseInt(this.getAttribute('max') || '');
    const max = Number.isFinite(maxAttr) && maxAttr > 0 ? maxAttr : 0;
    if (!this._input) return;

    // Base classes (preserve author classes)
    this.classList.add('char-counter');
    // Live region for screen readers
    this.setAttribute('role', 'status');
    this.setAttribute('aria-live', 'polite');
    this.setAttribute('aria-atomic', 'true');

    // Create the count span element
    this._countEl = document.createElement('span');
    this._countEl.className = 'char-counter__count';
    this.appendChild(this._countEl);

    this.updateCount(this._count(this._input.value), max);

    this._onInput = () => {
      this.updateCount(this._count(this._input!.value), max);
    };
    this._input.addEventListener('input', this._onInput);
  }

  disconnectedCallback() {
    if (this._input && this._onInput) {
      this._input.removeEventListener('input', this._onInput);
    }
    delete this._onInput;
    delete this._input;
    delete this._countEl;
  }

  // Count user-perceived characters (emoji-safe)
  private _count(text: string): number {
    // Prefer grapheme segmentation when available
    // Fallback to code points
    try {
      // @ts-ignore: Intl.Segmenter may not be in lib
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        // @ts-ignore
        const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        // @ts-ignore
        return Array.from(seg.segment(text)).length;
      }
    } catch { }
    return Array.from(text).length;
  }

  updateCount(current: number, max: number) {
    if (!this._countEl) return;

    if (max > 0) {
      const remaining = max - current;
      this._countEl.textContent = `${remaining} characters remaining`;

      // Remove all state classes
      this._countEl.classList.remove('char-counter__count--warning', 'char-counter__count--error');

      // Add appropriate state class
      // Order matters: error before warning
      if (remaining < 0) {
        this._countEl.classList.add('char-counter__count--error');
      } else if (remaining < 10) {
        this._countEl.classList.add('char-counter__count--warning');
      }
    } else {
      this._countEl.textContent = `${current} characters`;
      this._countEl.classList.remove('char-counter__count--warning', 'char-counter__count--error');
    }
  }
}

// Register component
if (!customElements.get('char-counter')) {
  customElements.define('char-counter', CharCounter);
}
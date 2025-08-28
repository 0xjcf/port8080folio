/**
 * Form Select Web Component
 * Atomic Design: Atom
 * 
 * Enhanced select dropdown with custom styling and search
 * Renders in light DOM for accessibility
 */
export class FormSelect extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'label', 'options', 'placeholder', 'required', 'error', 'helper', 'value', 'disabled', 'searchable'];
  }

  constructor() {
    super();
    this.isOpen = false;
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  disconnectedCallback() {
    this.unbindEvents();
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
    const optionsStr = this.getAttribute('options') || '';
    const placeholder = this.getAttribute('placeholder') || 'Select an option';
    const required = this.hasAttribute('required');
    const error = this.getAttribute('error') || '';
    const helper = this.getAttribute('helper') || '';
    const value = this.getAttribute('value') || '';
    const disabled = this.hasAttribute('disabled');
    const searchable = this.hasAttribute('searchable');
    const id = `select-${Math.random().toString(36).substr(2, 9)}`;

    // Parse options (format: "value:label,value:label" or "label,label")
    const options = this.parseOptions(optionsStr);
    const selectedOption = options.find(opt => opt.value === value);

    this.className = 'form-field form-field--select';

    this.innerHTML = `
      ${label ? `
        <label for="${id}" class="form-field__label">
          ${label}
          ${required ? '<span class="form-field__required">*</span>' : ''}
        </label>
      ` : ''}
      
      <div class="form-select" data-name="${name}">
        <button
          type="button"
          id="${id}"
          class="form-select__trigger ${error ? 'form-select__trigger--error' : ''}"
          aria-haspopup="listbox"
          aria-expanded="false"
          ${disabled ? 'disabled' : ''}
        >
          <span class="form-select__value">
            ${selectedOption ? selectedOption.label : placeholder}
          </span>
          <span class="form-select__arrow">▼</span>
        </button>
        
        <div class="form-select__dropdown" role="listbox" aria-hidden="true">
          ${searchable ? `
            <div class="form-select__search">
              <input
                type="text"
                class="form-select__search-input"
                placeholder="Search..."
                aria-label="Search options"
              />
            </div>
          ` : ''}
          
          <ul class="form-select__options">
            ${options.map(option => `
              <li
                class="form-select__option ${option.value === value ? 'form-select__option--selected' : ''}"
                data-value="${option.value}"
                role="option"
                aria-selected="${option.value === value}"
              >
                ${option.label}
              </li>
            `).join('')}
          </ul>
        </div>
        
        <!-- Hidden native select for form submission -->
        <select
          name="${name}"
          class="form-select__native"
          ${required ? 'required' : ''}
          ${disabled ? 'disabled' : ''}
          aria-hidden="true"
          tabindex="-1"
        >
          <option value="">${placeholder}</option>
          ${options.map(option => `
            <option value="${option.value}" ${option.value === value ? 'selected' : ''}>
              ${option.label}
            </option>
          `).join('')}
        </select>
      </div>
      
      ${error ? `
        <span class="form-field__error" role="alert">
          ${error}
        </span>
      ` : ''}
      
      ${helper && !error ? `
        <span class="form-field__helper">${helper}</span>
      ` : ''}
    `;
  }

  parseOptions(optionsStr) {
    if (!optionsStr) return [];

    return optionsStr.split(',').map(option => {
      const parts = option.trim().split(':');
      if (parts.length === 2) {
        return { value: parts[0], label: parts[1] };
      }
      return { value: option.trim(), label: option.trim() };
    });
  }

  bindEvents() {
    const trigger = this.querySelector('.form-select__trigger');
    const dropdown = this.querySelector('.form-select__dropdown');
    const options = this.querySelectorAll('.form-select__option');
    const searchInput = this.querySelector('.form-select__search-input');

    if (!trigger || !dropdown) return;

    // Toggle dropdown
    trigger.addEventListener('click', () => {
      this.toggleDropdown();
    });

    // Option selection
    options.forEach(option => {
      option.addEventListener('click', () => {
        this.selectOption(option);
      });
    });

    // Search functionality
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterOptions(e.target.value);
      });

      searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Keyboard navigation
    this.handleKeyboardNavigation();

    // Close on outside click
    this.outsideClickHandler = (e) => {
      if (!this.contains(e.target) && this.isOpen) {
        this.closeDropdown();
      }
    };
    document.addEventListener('click', this.outsideClickHandler);
  }

  unbindEvents() {
    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
    }
  }

  toggleDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    const trigger = this.querySelector('.form-select__trigger');
    const dropdown = this.querySelector('.form-select__dropdown');

    if (trigger && dropdown) {
      this.isOpen = true;
      trigger.setAttribute('aria-expanded', 'true');
      dropdown.setAttribute('aria-hidden', 'false');
      dropdown.classList.add('form-select__dropdown--open');

      // Focus search input if present
      const searchInput = this.querySelector('.form-select__search-input');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    }
  }

  closeDropdown() {
    const trigger = this.querySelector('.form-select__trigger');
    const dropdown = this.querySelector('.form-select__dropdown');

    if (trigger && dropdown) {
      this.isOpen = false;
      trigger.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
      dropdown.classList.remove('form-select__dropdown--open');

      // Clear search
      const searchInput = this.querySelector('.form-select__search-input');
      if (searchInput) {
        searchInput.value = '';
        this.filterOptions('');
      }
    }
  }

  selectOption(option) {
    const value = option.dataset.value;
    const label = option.textContent;
    const trigger = this.querySelector('.form-select__trigger');
    const valueElement = this.querySelector('.form-select__value');
    const nativeSelect = this.querySelector('.form-select__native');

    // Update visual state
    this.querySelectorAll('.form-select__option').forEach(opt => {
      opt.classList.remove('form-select__option--selected');
      opt.setAttribute('aria-selected', 'false');
    });
    option.classList.add('form-select__option--selected');
    option.setAttribute('aria-selected', 'true');

    // Update displayed value
    if (valueElement) {
      valueElement.textContent = label;
    }

    // Update native select
    if (nativeSelect) {
      nativeSelect.value = value;
      nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Update attribute
    this.setAttribute('value', value);

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('select-change', {
      detail: { value, label },
      bubbles: true
    }));

    // Close dropdown
    this.closeDropdown();

    // Remove error state
    if (trigger) {
      trigger.classList.remove('form-select__trigger--error');
    }
    this.removeAttribute('error');
  }

  filterOptions(searchTerm) {
    const options = this.querySelectorAll('.form-select__option');
    const term = searchTerm.toLowerCase();

    options.forEach(option => {
      const text = option.textContent.toLowerCase();
      if (text.includes(term)) {
        option.style.display = '';
      } else {
        option.style.display = 'none';
      }
    });
  }

  handleKeyboardNavigation() {
    const trigger = this.querySelector('.form-select__trigger');
    const options = this.querySelectorAll('.form-select__option');
    let currentIndex = -1;

    if (!trigger) return;

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleDropdown();
      } else if (e.key === 'ArrowDown' && this.isOpen) {
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, options.length - 1);
        this.highlightOption(options[currentIndex]);
      } else if (e.key === 'ArrowUp' && this.isOpen) {
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        this.highlightOption(options[currentIndex]);
      } else if (e.key === 'Escape') {
        this.closeDropdown();
      }
    });
  }

  highlightOption(option) {
    if (!option) return;

    // Remove previous highlight
    this.querySelectorAll('.form-select__option').forEach(opt => {
      opt.classList.remove('form-select__option--highlighted');
    });

    // Add highlight
    option.classList.add('form-select__option--highlighted');
    option.scrollIntoView({ block: 'nearest' });
  }

  // Public methods
  getValue() {
    const nativeSelect = this.querySelector('.form-select__native');
    return nativeSelect ? nativeSelect.value : '';
  }

  setValue(value) {
    const option = this.querySelector(`[data-value="${value}"]`);
    if (option) {
      this.selectOption(option);
    }
  }

  clear() {
    const valueElement = this.querySelector('.form-select__value');
    const nativeSelect = this.querySelector('.form-select__native');
    const placeholder = this.getAttribute('placeholder') || 'Select an option';

    if (valueElement) {
      valueElement.textContent = placeholder;
    }

    if (nativeSelect) {
      nativeSelect.value = '';
    }

    this.querySelectorAll('.form-select__option').forEach(opt => {
      opt.classList.remove('form-select__option--selected');
      opt.setAttribute('aria-selected', 'false');
    });

    this.removeAttribute('value');
  }
}

// Register component
customElements.define('form-select', FormSelect);

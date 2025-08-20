/**
 * Progressive Enhancement Script with Custom Validation
 * Suppresses native browser bubbles when JS is available
 * Shows custom inline error messages instead
 */

(function() {
  'use strict';
  
  // Feature detection
  if (!('classList' in document.documentElement)) return;
  
  // Mark JS as available
  const html = document.documentElement;
  html.classList.remove('no-js');
  html.classList.add('js-enabled');
  
  // Enhanced form validation (suppress native bubbles, use CSS errors)
  document.querySelectorAll('form.pe-form').forEach(function(form) {
    // Add novalidate at runtime to suppress native bubbles (but keep validation)
    form.setAttribute('novalidate', '');
    
    // Mark fields as "touched" on blur for CSS error display
    form.querySelectorAll('input, textarea, select').forEach(function(field) {
      field.addEventListener('blur', function() {
        field.classList.add('touched');
      });
    });
    
    // On submit, validate and show CSS errors if invalid
    form.addEventListener('submit', function(e) {
      // Check validity using native API
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        
        // Add class to show all errors
        form.classList.add('was-validated');
        
        // Mark all fields as touched
        form.querySelectorAll('input, textarea, select').forEach(function(field) {
          field.classList.add('touched');
        });
        
        // Focus first invalid field
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) {
          firstInvalid.focus({ preventScroll: false });
        }
        
        return false;
      }
      
      // If valid, add loading state to submit button
      const btn = form.querySelector('button[type="submit"]');
      if (btn && !btn.disabled) {
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        btn.classList.add('button--loading');
        
        const btnText = btn.querySelector('.button-text');
        if (btnText) {
          btnText.dataset.orig = btnText.textContent;
          btnText.textContent = form.classList.contains('pe-form--newsletter') 
            ? 'Subscribing...' 
            : 'Sending...';
        }
      }
    });
    
    // Add timestamp for bot detection
    const timestampInput = form.querySelector('input[name="timestamp"]');
    if (timestampInput) {
      timestampInput.value = Date.now().toString();
    }
  });
  
  // Tab focus management for accessibility
  const tabContainer = document.querySelector('.form-tabs-container');
  if (tabContainer) {
    tabContainer.addEventListener('change', function(e) {
      if (e.target && e.target.name === 'form-tab') {
        // Update tab labels' tabindex
        this.querySelectorAll('.form-tab').forEach(function(label) {
          const input = document.getElementById(label.getAttribute('for'));
          label.setAttribute('tabindex', input && input.checked ? '0' : '-1');
        });
        
        // Focus the selected panel for screen readers
        const panelId = e.target.id.replace('tab-', 'panel-');
        const panel = document.getElementById(panelId);
        if (panel) {
          panel.focus();
        }
      }
    });
    
    // Keyboard navigation for tabs
    const tabs = tabContainer.querySelectorAll('.form-tab');
    tabs.forEach(function(tab) {
      tab.addEventListener('keydown', function(e) {
        let newTab = null;
        const currentIndex = Array.from(tabs).indexOf(this);
        
        switch(e.key) {
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            newTab = tabs[currentIndex - 1] || tabs[tabs.length - 1];
            break;
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            newTab = tabs[currentIndex + 1] || tabs[0];
            break;
          case 'Home':
            e.preventDefault();
            newTab = tabs[0];
            break;
          case 'End':
            e.preventDefault();
            newTab = tabs[tabs.length - 1];
            break;
        }
        
        if (newTab) {
          const input = document.getElementById(newTab.getAttribute('for'));
          if (input) {
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
          newTab.focus();
        }
      });
    });
  }
  
})();
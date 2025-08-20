/**
 * Progressive Enhancement Script
 * Minimal JavaScript enhancements for better UX when JS is available
 * Target size: < 1.5KB minified
 */

(function() {
  'use strict';
  
  // Feature detection
  if (!('classList' in document.documentElement)) return;
  
  // Mark JS as available
  const html = document.documentElement;
  html.classList.remove('no-js');
  html.classList.add('js-enabled');
  
  // 1. Enhanced Form Submission (prevent double submit)
  const forms = document.querySelectorAll('.pe-form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const btn = this.querySelector('button[type="submit"]');
      if (!btn) return;
      
      // Prevent double submission
      if (btn.disabled) {
        e.preventDefault();
        return;
      }
      
      // Mark button as loading
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.classList.add('button--loading');
      
      // Store original text
      const originalText = btn.querySelector('.button-text');
      if (originalText) {
        originalText.dataset.orig = originalText.textContent;
        originalText.textContent = this.classList.contains('pe-form--newsletter') 
          ? 'Subscribing...' 
          : 'Sending...';
      }
    });
  });
  
  // 2. Tab Focus Management for Accessibility
  const tabContainer = document.querySelector('.form-tabs-container');
  if (tabContainer) {
    // Handle radio change for better keyboard navigation
    tabContainer.addEventListener('change', function(e) {
      if (e.target && e.target.name === 'form-tab') {
        const labels = this.querySelectorAll('.form-tab');
        labels.forEach(label => {
          const input = document.getElementById(label.getAttribute('for'));
          label.setAttribute('tabindex', input && input.checked ? '0' : '-1');
        });
        
        // Announce change to screen readers
        const panelId = e.target.id.replace('tab-', 'panel-');
        const panel = document.getElementById(panelId);
        if (panel) {
          panel.focus();
        }
      }
    });
    
    // Keyboard navigation for tabs
    const tabs = tabContainer.querySelectorAll('.form-tab');
    tabs.forEach(tab => {
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
  
  // 3. Add timestamp to forms for bot detection
  forms.forEach(form => {
    const timestampInput = form.querySelector('input[name="timestamp"]');
    if (timestampInput) {
      timestampInput.value = Date.now().toString();
    }
  });
  
  // 4. Smooth scroll for anchor links (if supported)
  if ('scrollBehavior' in document.documentElement.style) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Update URL without jumping
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      });
    });
  }
  
  // 5. Enhanced form validation feedback
  const inputs = document.querySelectorAll('.form-input, .form-textarea');
  inputs.forEach(input => {
    // Show error on blur if invalid
    input.addEventListener('blur', function() {
      if (this.hasAttribute('required') && !this.value.trim()) {
        this.classList.add('form-input--error');
        const errorEl = document.getElementById(this.getAttribute('aria-describedby'));
        if (errorEl) {
          errorEl.removeAttribute('hidden');
        }
      }
    });
    
    // Clear error on input
    input.addEventListener('input', function() {
      if (this.value.trim()) {
        this.classList.remove('form-input--error');
        const errorEl = document.getElementById(this.getAttribute('aria-describedby'));
        if (errorEl) {
          errorEl.setAttribute('hidden', '');
        }
      }
    });
  });
  
  // 6. Lazy load images if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    if (images.length > 0) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    }
  }
  
})();
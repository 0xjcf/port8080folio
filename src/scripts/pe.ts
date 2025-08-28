/*!
 * Progressive Enhancement v3 - Custom Validation with real-time feedback
 * ~1.5KB minified
 */
!(() => {
  const docElement = document.documentElement;

  if ('classList' in docElement) {
    // Enable JS
    docElement.classList.remove('no-js');
    docElement.classList.add('js-enabled');

    // Fallback for browsers without :has() support
    const hasSupport =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('selector(:has(*))');

    if (!hasSupport) {
      // Add fallback for form validation visual feedback
      document.querySelectorAll('form').forEach((form) => {
        const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        if (submitButtons.length === 0) return;

        const createSubmitUpdater = (submitButton) => {
          return () => {
            const isValid = form.checkValidity();
            submitButton.disabled = !isValid;
            if (isValid) {
              submitButton.classList.remove('is-submit-disabled');
            } else {
              submitButton.classList.add('is-submit-disabled');
            }
          };
        };

        // Create updaters for each submit button
        const updaters = Array.from(submitButtons).map(createSubmitUpdater);

        const updateAllSubmits = () => {
          updaters.forEach((updater) => {
            updater();
          });
        };

        // Listen for input and change events on form
        form.addEventListener('input', updateAllSubmits);
        form.addEventListener('change', updateAllSubmits);

        // Listen for form reset events
        form.addEventListener('reset', () => {
          // Use requestAnimationFrame to allow browser to complete reset
          requestAnimationFrame(updateAllSubmits);
        });

        // Initial state check
        updateAllSubmits();
      });
    }

    // Process forms
    document.querySelectorAll('form.pe-form').forEach((form) => {
      // Disable native validation
      form.setAttribute('novalidate', '');

      // Add validation handlers to fields
      form.querySelectorAll('input, textarea, select').forEach((field) => {
        // Add touched class on input for real-time border validation
        field.addEventListener('input', () => {
          field.classList.add('touched');
        });

        // Add blurred class on blur for error message display
        field.addEventListener('blur', () => {
          field.classList.add('touched');
          field.classList.add('blurred');
        });
      });

      // Handle form submission
      form.addEventListener('submit', (e) => {
        if (!form.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
          form.classList.add('was-validated');

          // Mark all fields as touched and blurred for error display
          form.querySelectorAll('input, textarea, select').forEach((field) => {
            field.classList.add('touched');
            field.classList.add('blurred');
          });

          // Focus first invalid field
          const firstInvalid = form.querySelector(':invalid');
          if (firstInvalid) {
            firstInvalid.focus({ preventScroll: false });
          }

          return false;
        }

        // Handle submit button state
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn && !submitBtn.disabled) {
          submitBtn.disabled = true;
          submitBtn.setAttribute('aria-busy', 'true');
          submitBtn.classList.add('button--loading');

          // Don't change the text content - let CSS handle the loading text
          // The CSS ::after pseudo-element will show the loading message
        }
      });

      // Set timestamp for spam protection
      const timestampField = form.querySelector('input[name="timestamp"]');
      if (timestampField) {
        timestampField.value = Date.now().toString();
      }
    });

    // Handle tab navigation
    const tabContainer = document.querySelector('.form-tabs-container');
    if (tabContainer) {
      // Handle tab change
      tabContainer.addEventListener('change', function (e) {
        if (e.target && e.target.name === 'form-tab') {
          // Update ARIA attributes
          this.querySelectorAll('.form-tab').forEach((tab) => {
            const radio = document.getElementById(tab.getAttribute('for'));
            tab.setAttribute('tabindex', radio?.checked ? '0' : '-1');
          });

          // Focus the panel
          const panelId = e.target.id.replace('tab-', 'panel-');
          const panel = document.getElementById(panelId);
          if (panel) {
            panel.focus();
          }
        }
      });

      // Handle keyboard navigation
      const tabs = tabContainer.querySelectorAll('.form-tab');
      tabs.forEach((tab) => {
        tab.addEventListener('keydown', function (e) {
          let newTab = null;
          const currentIndex = Array.from(tabs).indexOf(this);

          switch (e.key) {
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
            const radio = document.getElementById(newTab.getAttribute('for'));
            if (radio) {
              radio.checked = true;
              radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
            newTab.focus();
          }
        });
      });
    }

    // Sticky CTA functionality - Show when hero CTA is out of view and condense on scroll
    const initStickyCTA = () => {
      const stickyCTA = document.querySelector('.services__sticky-cta');
      // Target the hero CTA button more specifically
      const heroCTA = document.querySelector('.cta-row .button.button--primary, #hero .button--primary');
      
      if (!stickyCTA || !heroCTA) {
        return;
      }

      // Track if sticky CTA has been shown at least once
      let hasBeenShown = false;
      let scrollTicking = false;
      
      // Function to handle condensing based on scroll position
      const handleCondensing = () => {
        if (!hasBeenShown) return;
        
        const scrollY = window.scrollY || window.pageYOffset;
        const viewportHeight = window.innerHeight;
        const condenseTrigger = viewportHeight * 1.5; // Condense after 150vh of scrolling
        
        if (scrollY > condenseTrigger) {
          stickyCTA.classList.add('is-condensed');
        } else {
          stickyCTA.classList.remove('is-condensed');
        }
      };
      
      // Method 1: Try IntersectionObserver (preferred)
      if (typeof IntersectionObserver !== 'undefined') {
        const observerOptions = {
          root: null,
          rootMargin: '-100px 0px', // Trigger when hero CTA is 100px out of view
          threshold: 0,
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.target === heroCTA) {
              // Show sticky CTA when hero CTA is OUT of view
              if (!entry.isIntersecting) {
                stickyCTA.classList.add('is-visible');
                hasBeenShown = true;
                handleCondensing(); // Check if should be condensed
              } else if (hasBeenShown) {
                // Hide sticky CTA when hero CTA is back IN view
                stickyCTA.classList.remove('is-visible');
                stickyCTA.classList.remove('is-condensed');
              }
            }
          });
        }, observerOptions);

        observer.observe(heroCTA);
        
        // Add scroll listener for condensing behavior
        const onScrollCondense = () => {
          if (!scrollTicking) {
            requestAnimationFrame(() => {
              handleCondensing();
              scrollTicking = false;
            });
            scrollTicking = true;
          }
        };
        
        window.addEventListener('scroll', onScrollCondense, { passive: true });
      } else {
        // Method 2: Fallback to scroll event for older browsers
        let ticking = false;
        
        const checkVisibility = () => {
          const rect = heroCTA.getBoundingClientRect();
          const isOutOfView = rect.bottom < 100; // 100px threshold
          
          if (isOutOfView && !stickyCTA.classList.contains('is-visible')) {
            stickyCTA.classList.add('is-visible');
            hasBeenShown = true;
          } else if (!isOutOfView && hasBeenShown && stickyCTA.classList.contains('is-visible')) {
            stickyCTA.classList.remove('is-visible');
            stickyCTA.classList.remove('is-condensed');
          }
          
          // Also handle condensing
          if (hasBeenShown) {
            handleCondensing();
          }
          
          ticking = false;
        };
        
        const onScroll = () => {
          if (!ticking) {
            requestAnimationFrame(checkVisibility);
            ticking = true;
          }
        };
        
        window.addEventListener('scroll', onScroll, { passive: true });
        // Check initial state
        checkVisibility();
      }
      
      // Add smooth scroll behavior to sticky CTA
      const stickyButton = stickyCTA.querySelector('.button--sticky');
      if (stickyButton) {
        stickyButton.addEventListener('click', (e) => {
          // If it's an internal link, smooth scroll
          const href = stickyButton.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      }
    };

    // Initialize sticky CTA
    if (typeof IntersectionObserver !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStickyCTA);
      } else {
        initStickyCTA();
      }
    }
  }
})();

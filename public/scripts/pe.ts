import { resolveFormRedirect } from './form-redirect.js';

/*!
 * Progressive Enhancement v3 - Custom Validation with real-time feedback
 * ~1.5KB minified
 */
(() => {
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

        const createSubmitUpdater = (submitButton: HTMLButtonElement | HTMLInputElement) => {
          return () => {
            const form = submitButton.form;
            if (!form) {
              submitButton.disabled = true;
              submitButton.classList.add('is-submit-disabled');
              return;
            }

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
        const updaters = Array.from(submitButtons)
          .filter(
            (button): button is HTMLButtonElement | HTMLInputElement =>
              button instanceof HTMLButtonElement || button instanceof HTMLInputElement,
          )
          .map(createSubmitUpdater);

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

      // Add fallback for :has() pseudo-class in CSS (for sticky CTA targeting)
      const updateContactTargetClass = () => {
        const hash = window.location.hash;
        const targetSections = ['#about', '#services', '#contact'];

        if (targetSections.includes(hash)) {
          document.body.classList.add('contact-targeted');
        } else {
          document.body.classList.remove('contact-targeted');
        }
      };

      // Check on page load
      updateContactTargetClass();

      // Listen for hash changes
      window.addEventListener('hashchange', updateContactTargetClass);

      // Fallback: About segment toggle without :has()
      const aboutSection = document.getElementById('about');
      const segSB = document.getElementById('seg-sb') as HTMLInputElement | null;
      const segPT = document.getElementById('seg-pt') as HTMLInputElement | null;
      if (aboutSection && (segSB || segPT)) {
        const applySegClass = () => {
          if (!aboutSection) return;
          aboutSection.classList.remove('about--seg-sb', 'about--seg-pt');
          if (segSB?.checked) {
            aboutSection.classList.add('about--seg-sb');
          } else if (segPT?.checked) {
            aboutSection.classList.add('about--seg-pt');
          }
        };
        segSB?.addEventListener('change', applySegClass);
        segPT?.addEventListener('change', applySegClass);
        // Initialize on load
        applySegClass();
      }
    }

    // Process forms
    document.querySelectorAll('form.pe-form').forEach((element) => {
      if (!(element instanceof HTMLFormElement)) return;
      const form = element;

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

        // Add change event listener for select elements
        if (field instanceof HTMLSelectElement || field.tagName === 'SELECT') {
          field.addEventListener('change', () => {
            field.classList.add('touched');
          });
        }
      });

      // Handle form submission
      form.addEventListener('submit', (e) => {
        e.preventDefault(); // Always prevent default for custom handling
        e.stopPropagation();

        if (!form.checkValidity()) {
          form.classList.add('was-validated');

          // Mark all fields as touched and blurred for error display
          form.querySelectorAll('input, textarea, select').forEach((field) => {
            field.classList.add('touched');
            field.classList.add('blurred');
          });

          // Focus first invalid field
          const firstInvalidElement = form.querySelector(':invalid');
          if (firstInvalidElement instanceof HTMLElement) {
            firstInvalidElement.focus({ preventScroll: false });
          }

          // Exit early for invalid forms - don't touch submit button
          return;
        }

        // Check for endpoint configuration
        const endpoint = form.getAttribute('data-endpoint');
        if (!endpoint || endpoint.trim() === '' || /\{\{[\s\S]*?\}\}/.test(endpoint)) {
          // Endpoint is missing, whitespace-only, or contains template placeholders
          const submitBtnElement = form.querySelector(
            'button[type="submit"], input[type="submit"]',
          );
          if (
            submitBtnElement instanceof HTMLButtonElement ||
            submitBtnElement instanceof HTMLInputElement
          ) {
            submitBtnElement.disabled = true;

            // Show error message
            let errorElement = form.querySelector('.form-endpoint-error');
            if (!errorElement) {
              errorElement = document.createElement('div');
              errorElement.className = 'form-endpoint-error form-error';
              errorElement.setAttribute('role', 'alert');
              if (errorElement instanceof HTMLElement) {
                errorElement.style.marginTop = '1rem';
              }
              errorElement.innerHTML =
                '<span>Form submission is not configured. Please contact us directly.</span>';

              const submitContainer = form.querySelector('.form-submit');
              if (submitContainer) {
                submitContainer.appendChild(errorElement);
              }
            }
            if (errorElement instanceof HTMLElement) {
              errorElement.style.display = 'block';
            }
          }
          return;
        }

        // Form is valid and endpoint is configured - handle submit button state
        const submitBtnElement = form.querySelector('button[type="submit"], input[type="submit"]');

        const setButtonLoadingState = (button: HTMLButtonElement | HTMLInputElement) => {
          button.disabled = true;
          button.setAttribute('aria-busy', 'true');
          button.setAttribute('aria-disabled', 'true');
          button.classList.add('button--loading');

          // Add live loading text to DOM for screen readers (only for button elements)
          if (button instanceof HTMLButtonElement) {
            const loadingText = document.createElement('span');
            loadingText.className = 'sr-only';
            loadingText.setAttribute('aria-live', 'polite');
            loadingText.textContent = 'Loading, please wait…';
            loadingText.setAttribute('data-loading-text', 'true');
            button.appendChild(loadingText);
          }
        };

        const removeButtonLoadingState = (button: HTMLButtonElement | HTMLInputElement) => {
          button.disabled = false;
          button.removeAttribute('aria-busy');
          button.removeAttribute('aria-disabled');
          button.classList.remove('button--loading');

          // Remove loading text (only for button elements)
          if (button instanceof HTMLButtonElement) {
            const loadingText = button.querySelector('[data-loading-text="true"]');
            if (loadingText) {
              loadingText.remove();
            }
          }
        };

        if (submitBtnElement instanceof HTMLButtonElement && !submitBtnElement.disabled) {
          setButtonLoadingState(submitBtnElement);
        } else if (
          submitBtnElement instanceof HTMLInputElement &&
          submitBtnElement.type === 'submit' &&
          !submitBtnElement.disabled
        ) {
          setButtonLoadingState(submitBtnElement);
        }

        // Proceed with form submission to the configured endpoint
        // The existing form processing logic would continue here
        // For now, we'll use the browser's default form submission
        const formData = new FormData(form);

        // Error handling helper function
        const handleSubmissionError = (
          error: Error | unknown,
          form: HTMLFormElement,
          submitBtn: Element | null,
        ) => {
          let errorMessage = 'Form submission failed. ';

          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              errorMessage += 'Request timed out.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
              errorMessage +=
                'Network connection failed. Please check your internet connection and try again.';
            } else if (error.message) {
              errorMessage += error.message;
            }
          } else {
            errorMessage += 'An unexpected error occurred.';
          }

          // Remove any existing error messages first
          const existingErrors = form.querySelectorAll('.form-error');
          for (const errorEl of existingErrors) {
            errorEl.remove();
          }

          // Show user-friendly error message
          const errorElement = document.createElement('div');
          errorElement.className = 'form-error';
          errorElement.setAttribute('role', 'alert');
          errorElement.textContent = errorMessage;
          form.appendChild(errorElement);

          // Re-enable submit button on error
          if (
            submitBtn &&
            (submitBtn instanceof HTMLButtonElement || submitBtn instanceof HTMLInputElement)
          ) {
            removeButtonLoadingState(submitBtn);
          }
        };

        // Enhanced fetch with comprehensive error handling and rate limiting
        const submitWithRetry = async (retryAttempt = 0, networkRetryCount = 0): Promise<void> => {
          const controller = new AbortController();
          const timeoutId = window.setTimeout(() => {
            controller.abort();
          }, 30000); // 30 second timeout

          const cleanupAttempt = () => {
            window.clearTimeout(timeoutId);
            controller.abort();
          };

          try {
            const response = await fetch(endpoint, {
              method: 'POST',
              body: formData,
              signal: controller.signal,
            });

            cleanupAttempt();

            // Check for rate limiting headers
            const retryAfter = response.headers.get('Retry-After');

            if (!response.ok) {
              // Handle rate limiting (429) with specific logic
              if (response.status === 429) {
                const baseWaitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000;
                const cappedWaitTime = Math.min(baseWaitTime, 30000); // Cap at 30s

                if (retryAttempt < 2 && cappedWaitTime <= 30000) {
                  // Max 2 retries
                  // Add randomized jitter (±0-1000ms)
                  const jitter = Math.random() * 1000;
                  const finalWaitTime = cappedWaitTime + jitter;

                  setTimeout(() => {
                    submitWithRetry(retryAttempt + 1, networkRetryCount).catch((retryError) => {
                      handleSubmissionError(retryError, form, submitBtnElement);
                    });
                  }, finalWaitTime);
                  return;
                } else {
                  throw new Error(`Rate limited. Please try again later.`);
                }
              }

              // Handle other HTTP errors by reading response body
              let errorDetails = '';
              try {
                const contentType = response.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                  const errorData = await response.json();
                  errorDetails = errorData.message || errorData.error || 'Unknown error';
                } else {
                  errorDetails = (await response.text()) || 'Unknown error';
                }
              } catch {
                errorDetails = 'Unable to read error details';
              }

              throw new Error(`Server error (${response.status}): ${errorDetails}`);
            }

            // Handle success with strengthened redirect validation
            const redirectUrl = response.url || '#';
            const safeInternalHash = '#contact-success'; // Safe fallback
            const targetHref = resolveFormRedirect({
              redirectUrl,
              safeInternalHash,
              currentOrigin: window.location.origin,
              currentPathname: window.location.pathname,
            });

            window.location.href = targetHref;
          } catch (error) {
            cleanupAttempt();

            // Handle different types of errors with separate retry logic for network failures
            if (error instanceof Error && error.name === 'AbortError') {
              handleSubmissionError(new Error('Request timed out'), form, submitBtnElement);
            } else if (error instanceof TypeError && error.message.includes('fetch')) {
              // Network/connectivity errors - short immediate retry with jitter
              if (networkRetryCount < 2) {
                // Max 2 network retries
                const baseDelay = 1000 + networkRetryCount * 1000; // 1s, then 2s
                const jitter = Math.random() * 500; // ±0-500ms jitter
                const retryDelay = baseDelay + jitter;

                setTimeout(() => {
                  submitWithRetry(retryAttempt, networkRetryCount + 1).catch((retryError) => {
                    handleSubmissionError(retryError, form, submitBtnElement);
                  });
                }, retryDelay);
                return;
              } else {
                handleSubmissionError(
                  new Error(
                    'Network connection failed. Please check your internet connection and try again.',
                  ),
                  form,
                  submitBtnElement,
                );
              }
            } else {
              // Re-throw to be handled by outer catch
              throw error;
            }
          }
        };

        // Start the submission process
        submitWithRetry().catch((error) => {
          handleSubmissionError(error, form, submitBtnElement);
        }); // Don't change the text content - let CSS handle the loading text
        // The CSS ::after pseudo-element will show the loading message
      });

      // Set timestamp for spam protection
      const timestampElement = form.querySelector('input[name="timestamp"]');
      if (timestampElement && timestampElement instanceof HTMLInputElement) {
        timestampElement.value = Date.now().toString();
      } else if (timestampElement && !(timestampElement instanceof HTMLInputElement)) {
        // Timestamp element exists but is not an input - create a new one instead
        const hiddenTimestamp = document.createElement('input');
        hiddenTimestamp.type = 'hidden';
        hiddenTimestamp.name = 'timestamp';
        hiddenTimestamp.value = Date.now().toString();
        form.appendChild(hiddenTimestamp);
      } else {
        // Element doesn't exist - create it dynamically for spam protection
        const hiddenTimestamp = document.createElement('input');
        hiddenTimestamp.type = 'hidden';
        hiddenTimestamp.name = 'timestamp';
        hiddenTimestamp.value = Date.now().toString();
        form.appendChild(hiddenTimestamp);
      }
    });

    // Handle tab navigation
    const tabContainer = document.querySelector('.form-tabs-container');
    if (tabContainer) {
      // Initialize ARIA roles and attributes
      tabContainer.setAttribute('role', 'tablist');

      // Set up tabs and panels with proper ARIA attributes
      tabContainer.querySelectorAll('.form-tab').forEach((tab) => {
        tab.setAttribute('role', 'tab');
        const forAttr = tab.getAttribute('for');
        if (forAttr) {
          const radioElement = document.getElementById(forAttr);
          if (radioElement instanceof HTMLInputElement) {
            const panelId = forAttr.replace('tab-', 'panel-');
            tab.setAttribute('aria-controls', panelId);
            tab.setAttribute('aria-selected', radioElement.checked ? 'true' : 'false');
            tab.setAttribute('tabindex', radioElement.checked ? '0' : '-1');

            // Set up corresponding panel
            const panel = document.getElementById(panelId);
            if (panel instanceof HTMLElement) {
              panel.setAttribute('role', 'tabpanel');
              panel.setAttribute('aria-hidden', radioElement.checked ? 'false' : 'true');
              if (!panel.hasAttribute('id')) {
                panel.id = panelId;
              }
            }
          }
        }
      });

      // Handle tab change
      tabContainer.addEventListener('change', (e) => {
        const target = e.target;
        if (target instanceof HTMLInputElement && target.name === 'form-tab') {
          // Update ARIA attributes for all tabs and panels
          const container = e.currentTarget;
          if (container instanceof HTMLElement) {
            container.querySelectorAll('.form-tab').forEach((tab) => {
              const forAttr = tab.getAttribute('for');
              if (forAttr) {
                const radioElement = document.getElementById(forAttr);
                if (radioElement instanceof HTMLInputElement) {
                  const isSelected = radioElement.checked;
                  tab.setAttribute('tabindex', isSelected ? '0' : '-1');
                  tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');

                  // Update corresponding panel
                  const panelId = forAttr.replace('tab-', 'panel-');
                  const panel = document.getElementById(panelId);
                  if (panel instanceof HTMLElement) {
                    panel.setAttribute('aria-hidden', isSelected ? 'false' : 'true');
                  }

                  // Set focus on selected tab
                  if (isSelected && tab instanceof HTMLElement) {
                    tab.focus();
                  }
                }
              }
            });
          }

          // Focus the panel (make it focusable first)
          const panelId = target.id.replace('tab-', 'panel-');
          const panel = document.getElementById(panelId);
          if (panel instanceof HTMLElement) {
            panel.tabIndex = -1;
            panel.focus();
          }
        }
      });

      // Handle keyboard navigation
      const tabs = tabContainer.querySelectorAll('.form-tab');
      const labelTabs = Array.from(tabs).filter(
        (tab): tab is HTMLLabelElement => tab instanceof HTMLLabelElement,
      );

      labelTabs.forEach((tab) => {
        tab.addEventListener('keydown', function (e) {
          if (!(e instanceof KeyboardEvent)) return;

          let newTab: HTMLLabelElement | null = null;
          const currentIndex = labelTabs.indexOf(this);

          switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
              e.preventDefault();
              newTab = labelTabs[currentIndex - 1] || labelTabs[labelTabs.length - 1];
              break;
            case 'ArrowRight':
            case 'ArrowDown':
              e.preventDefault();
              newTab = labelTabs[currentIndex + 1] || labelTabs[0];
              break;
            case 'Home':
              e.preventDefault();
              newTab = labelTabs[0];
              break;
            case 'End':
              e.preventDefault();
              newTab = labelTabs[labelTabs.length - 1];
              break;
          }

          if (newTab) {
            const forAttr = newTab.getAttribute('for');
            if (forAttr) {
              const radioElement = document.getElementById(forAttr);
              if (radioElement instanceof HTMLInputElement) {
                radioElement.checked = true;
                radioElement.dispatchEvent(new Event('change', { bubbles: true }));
              }
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
      const heroCTA = document.querySelector(
        '.cta-row .button.button--primary, #hero .button--primary',
      );

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
      const stickyButtonElement = stickyCTA.querySelector('.button--sticky');
      if (stickyButtonElement instanceof HTMLAnchorElement) {
        stickyButtonElement.addEventListener('click', (e) => {
          // If it's an internal link, smooth scroll
          const href = stickyButtonElement.getAttribute('href');
          if (href?.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target instanceof HTMLElement) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      }
    };

    // Initialize sticky CTA - always register DOM handler
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initStickyCTA);
    } else {
      initStickyCTA();
    }
  }
})();

import { createMachine, createActor, assign } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';
import { uiOrchestrator } from './ui-orchestrator.js';

// Form Layout State Machine
export const formLayoutMachine = createMachine({
    id: 'formLayout',
    initial: 'detecting',
    context: {
        selectedOption: 'xstate_challenges',
        email: '',
        isValid: false,
        viewportSize: 'mobile',
        isEmailFocused: false,
        isSubmitting: false,
        formElement: null
    },
    states: {
        detecting: {
            entry: 'detectViewport',
            always: [
                { target: 'mobile', cond: 'isMobileViewport' },
                { target: 'desktop' }
            ]
        },
        mobile: {
            entry: 'applyMobileLayout',
            initial: 'collapsed',
            states: {
                collapsed: {
                    entry: 'showCompactCards',
                    on: {
                        SELECT_OPTION: {
                            target: 'expanded',
                            actions: 'updateSelectedOption'
                        },
                        FOCUS_EMAIL: 'emailFocused'
                    }
                },
                expanded: {
                    entry: ['expandSelectedCard', 'scrollToSelection'],
                    on: {
                        SELECT_OTHER: {
                            target: 'collapsed',
                            actions: 'updateSelectedOption'
                        },
                        FOCUS_EMAIL: 'emailFocused',
                        SUBMIT: {
                            target: 'submitting',
                            cond: 'isFormValid'
                        }
                    }
                },
                emailFocused: {
                    entry: ['scrollToEmailField', 'adjustViewportForKeyboard'],
                    exit: 'restoreViewport',
                    on: {
                        BLUR_EMAIL: [
                            { target: 'expanded', cond: 'hasSelectedOption' },
                            { target: 'collapsed' }
                        ],
                        UPDATE_EMAIL: {
                            actions: 'updateEmail'
                        },
                        SUBMIT: {
                            target: 'submitting',
                            cond: 'isFormValid'
                        }
                    }
                },
                submitting: {
                    entry: 'handleSubmit',
                    on: {
                        SUBMIT_SUCCESS: 'success',
                        SUBMIT_ERROR: 'error'
                    }
                },
                success: {
                    entry: 'showSuccessMessage',
                    after: {
                        5000: 'collapsed'
                    }
                },
                error: {
                    entry: 'showErrorMessage',
                    on: {
                        RETRY: 'collapsed'
                    }
                }
            }
        },
        desktop: {
            entry: 'applyDesktopLayout',
            on: {
                SELECT_OPTION: {
                    actions: 'updateSelectedOption'
                },
                UPDATE_EMAIL: {
                    actions: 'updateEmail'
                },
                SUBMIT: {
                    target: 'desktop.submitting',
                    cond: 'isFormValid'
                }
            },
            states: {
                idle: {},
                submitting: {
                    entry: 'handleSubmit',
                    on: {
                        SUBMIT_SUCCESS: 'success',
                        SUBMIT_ERROR: 'error'
                    }
                },
                success: {
                    entry: 'showSuccessMessage'
                },
                error: {
                    entry: 'showErrorMessage',
                    on: {
                        RETRY: 'idle'
                    }
                }
            }
        }
    }
}, {
    actions: {
        detectViewport: assign({
            viewportSize: () => {
                const width = window.innerWidth;
                if (width < 768) return 'mobile';
                if (width < 1024) return 'tablet';
                return 'desktop';
            }
        }),
        applyMobileLayout: (context) => {
            const form = context.formElement;
            if (!form) return;

            // Add mobile class
            form.classList.add('mobile-form-layout');

            // Restructure cards for mobile
            const cards = form.querySelectorAll('.lead-magnet-card');
            cards.forEach(card => {
                card.classList.add('mobile-card');
            });

            // Add touch-friendly styles
            const style = document.createElement('style');
            style.textContent = `
        .mobile-form-layout {
          padding: 1rem;
        }
        
        .mobile-form-layout .lead-magnet-cards {
          gap: 0.75rem;
        }
        
        .mobile-card {
          padding: 1rem;
          min-height: auto;
          transition: all 0.3s ease;
        }
        
        .mobile-card:not(.expanded) .card-content p,
        .mobile-card:not(.expanded) .value-prop {
          display: none;
        }
        
        .mobile-card:not(.expanded) .card-header h3 {
          font-size: 1rem;
          margin-bottom: 0;
        }
        
        .mobile-card.expanded {
          background: rgba(13, 153, 255, 0.1);
          border-color: var(--jasper);
          margin: 0.5rem 0;
        }
        
        .mobile-card.expanded .card-content p,
        .mobile-card.expanded .value-prop {
          display: block;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .mobile-form-layout .newsletter-input {
          font-size: 16px; /* Prevent zoom on iOS */
        }
        
        .mobile-form-layout .newsletter-button {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
        }
        
        .keyboard-adjusted {
          padding-bottom: 300px;
        }
      `;
            form.appendChild(style);
        },
        showCompactCards: (context) => {
            const cards = context.formElement?.querySelectorAll('.mobile-card');
            cards?.forEach(card => {
                card.classList.remove('expanded');
            });
        },
        expandSelectedCard: (context) => {
            const cards = context.formElement?.querySelectorAll('.mobile-card');
            cards?.forEach(card => {
                const radio = card.querySelector('input[type="radio"]');
                if (radio?.value === context.selectedOption) {
                    card.classList.add('expanded');
                } else {
                    card.classList.remove('expanded');
                }
            });
        },
        scrollToSelection: (context) => {
            const selectedCard = context.formElement?.querySelector('.mobile-card.expanded');
            if (selectedCard) {
                setTimeout(() => {
                    selectedCard.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
            }
        },
        scrollToEmailField: (context) => {
            const emailInput = context.formElement?.querySelector('.newsletter-input');
            if (emailInput) {
                setTimeout(() => {
                    emailInput.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
            }
        },
        adjustViewportForKeyboard: (context) => {
            if (context.viewportSize === 'mobile') {
                document.body.classList.add('keyboard-adjusted');
            }
        },
        restoreViewport: () => {
            document.body.classList.remove('keyboard-adjusted');
        },
        updateSelectedOption: assign({
            selectedOption: (_, event) => event.option
        }),
        updateEmail: assign({
            email: (_, event) => event.email,
            isValid: (_, event) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(event.email);
            }
        }),
        handleSubmit: async (context) => {
            const form = context.formElement?.querySelector('form');
            if (!form) return;

            const formData = new FormData(form);
            formData.set('LEADMAGNET', context.selectedOption);

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors'
                });

                // Simulate success for no-cors
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('form-submit-result', {
                        detail: { success: true, formId: context.formElement?.id }
                    }));
                }, 1000);
            } catch (error) {
                window.dispatchEvent(new CustomEvent('form-submit-result', {
                    detail: { success: false, error: error.message, formId: context.formElement?.id }
                }));
            }
        },
        showSuccessMessage: (context) => {
            const successEl = context.formElement?.querySelector('#mce-success-response');
            const errorEl = context.formElement?.querySelector('#mce-error-response');

            if (successEl) {
                const messages = {
                    'xstate_challenges': 'Welcome! Check your email for your first XState challenge.',
                    'consultation': 'Great! Check your email to schedule your strategy session.'
                };

                successEl.textContent = messages[context.selectedOption] || 'Thank you for subscribing!';
                successEl.style.display = 'block';
            }

            if (errorEl) {
                errorEl.style.display = 'none';
            }

            // Scroll to message on mobile
            if (context.viewportSize === 'mobile' && successEl) {
                successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },
        showErrorMessage: (context, event) => {
            const errorEl = context.formElement?.querySelector('#mce-error-response');
            const successEl = context.formElement?.querySelector('#mce-success-response');

            if (errorEl) {
                errorEl.textContent = event.error || 'Something went wrong. Please try again.';
                errorEl.style.display = 'block';
            }

            if (successEl) {
                successEl.style.display = 'none';
            }
        },
        applyDesktopLayout: (context) => {
            const form = context.formElement;
            if (form) {
                form.classList.remove('mobile-form-layout');
            }
        }
    },
    guards: {
        isMobileViewport: () => window.innerWidth < 768,
        isFormValid: (context) => {
            return context.email.length > 0 && context.isValid && context.selectedOption;
        },
        hasSelectedOption: (context) => {
            return context.selectedOption !== null;
        }
    }
});

// Enhance form for mobile
export function enhanceFormForMobile(formElement) {
    const actor = createActor(formLayoutMachine, {
        context: {
            formElement
        }
    });

    actor.start();

    // Setup event listeners
    const radioInputs = formElement.querySelectorAll('input[name="LEADMAGNET"]');
    const emailInput = formElement.querySelector('#mce-EMAIL');
    const submitButton = formElement.querySelector('#mc-embedded-subscribe');
    const cards = formElement.querySelectorAll('.lead-magnet-card');

    // Card selection
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const radio = card.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                actor.send({ type: 'SELECT_OPTION', option: radio.value });
            }
        });
    });

    // Radio change
    radioInputs.forEach(radio => {
        radio.addEventListener('change', (e) => {
            actor.send({ type: 'SELECT_OPTION', option: e.target.value });
        });
    });

    // Email input
    emailInput?.addEventListener('focus', () => {
        actor.send({ type: 'FOCUS_EMAIL' });
    });

    emailInput?.addEventListener('blur', () => {
        actor.send({ type: 'BLUR_EMAIL' });
    });

    emailInput?.addEventListener('input', (e) => {
        actor.send({ type: 'UPDATE_EMAIL', email: e.target.value });
    });

    // Form submission
    const form = formElement.querySelector('form');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        actor.send({ type: 'SUBMIT' });
    });

    // Handle submit results
    window.addEventListener('form-submit-result', (e) => {
        if (e.detail.formId === formElement.id) {
            if (e.detail.success) {
                actor.send({ type: 'SUBMIT_SUCCESS' });
            } else {
                actor.send({ type: 'SUBMIT_ERROR', error: e.detail.error });
            }
        }
    });

    // Handle viewport changes
    window.addEventListener('resize', () => {
        actor.send({ type: 'VIEWPORT_CHANGE' });
    });

    // Add mobile-specific enhancements
    if (uiOrchestrator.isMobile()) {
        // Improve touch targets
        cards.forEach(card => {
            card.style.minHeight = '44px';
            card.style.cursor = 'pointer';
        });

        // Add visual feedback
        cards.forEach(card => {
            card.addEventListener('touchstart', () => {
                card.style.transform = 'scale(0.98)';
            });

            card.addEventListener('touchend', () => {
                card.style.transform = '';
            });
        });
    }

    return actor;
}

// Auto-enhance newsletter forms
if (typeof window !== 'undefined') {
    // Wait for UI Orchestrator to be ready
    const checkAndEnhance = () => {
        if (typeof uiOrchestrator !== 'undefined' && uiOrchestrator.initialized) {
            const newsletterForm = document.querySelector('#newsletter-signup');
            if (newsletterForm && (uiOrchestrator.isMobile() || uiOrchestrator.isTablet())) {
                enhanceFormForMobile(newsletterForm);
            }
        } else {
            // Try again in a moment
            setTimeout(checkAndEnhance, 100);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndEnhance);
    } else {
        checkAndEnhance();
    }
} 
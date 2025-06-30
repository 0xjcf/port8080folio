// Enhanced Newsletter Form Functionality
class NewsletterForm {
    constructor() {
        this.form = document.getElementById('mc-embedded-subscribe-form');
        this.submitButton = document.getElementById('mc-embedded-subscribe');
        this.buttonText = this.submitButton?.querySelector('.button-text');
        this.buttonLoading = this.submitButton?.querySelector('.button-loading');
        this.errorResponse = document.getElementById('mce-error-response');
        this.successResponse = document.getElementById('mce-success-response');
        this.emailInput = document.getElementById('mce-EMAIL');
        this.leadMagnetCards = document.querySelectorAll('.lead-magnet-card');
        this.radioInputs = document.querySelectorAll('input[name="LEADMAGNET"]');

        this.init();
    }

    init() {
        if (!this.form) return;

        this.setupEventListeners();
        this.updateButtonText();
        this.setupFormValidation();
        this.setupAccessibility();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', this.handleSubmit.bind(this));

        // Lead magnet selection
        this.radioInputs.forEach(radio => {
            radio.addEventListener('change', this.handleLeadMagnetChange.bind(this));
        });

        // Card click handling
        this.leadMagnetCards.forEach(card => {
            card.addEventListener('click', this.handleCardClick.bind(this));
            card.addEventListener('keydown', this.handleCardKeydown.bind(this));
        });

        // Email input enhancements
        if (this.emailInput) {
            this.emailInput.addEventListener('input', this.handleEmailInput.bind(this));
            this.emailInput.addEventListener('blur', this.validateEmail.bind(this));
        }
    }

    handleCardClick(event) {
        const card = event.currentTarget;
        const radio = card.querySelector('input[type="radio"]');

        if (radio && !radio.checked) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        }
    }

    handleCardKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleCardClick(event);
        }
    }

    handleLeadMagnetChange(event) {
        const selectedValue = event.target.value;

        // Update button text based on selection
        this.updateButtonText(selectedValue);

        // Update card visual states
        this.updateCardStates();

        // Announce change to screen readers
        this.announceSelection(selectedValue);
    }

    updateButtonText(selectedValue) {
        if (!this.buttonText) return;

        const currentSelection = selectedValue || document.querySelector('input[name="LEADMAGNET"]:checked')?.value;

        const buttonTexts = {
            'xstate_challenges': 'Start My First Challenge →',
            'consultation': 'Schedule Strategy Session →',
            'default': 'Get Started →'
        };

        this.buttonText.textContent = buttonTexts[currentSelection] || buttonTexts.default;
    }

    updateCardStates() {
        this.leadMagnetCards.forEach(card => {
            const radio = card.querySelector('input[type="radio"]');
            const isChecked = radio?.checked;

            // Update ARIA attributes
            card.setAttribute('aria-checked', isChecked);

            // Update visual state
            if (isChecked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    announceSelection(selectedValue) {
        const announcements = {
            'xstate_challenges': 'Weekly XState Challenges selected',
            'consultation': '1-on-1 Strategy Session selected'
        };

        const announcement = announcements[selectedValue];
        if (announcement) {
            this.announceToScreenReader(announcement);
        }
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    handleEmailInput(event) {
        const input = event.target;
        const isValid = this.isValidEmail(input.value);

        // Update input state
        input.classList.toggle('valid', isValid && input.value.length > 0);
        input.classList.toggle('invalid', !isValid && input.value.length > 0);
    }

    validateEmail() {
        if (!this.emailInput) return true;

        const email = this.emailInput.value.trim();
        const isValid = this.isValidEmail(email);

        this.emailInput.classList.toggle('valid', isValid && email.length > 0);
        this.emailInput.classList.toggle('invalid', !isValid && email.length > 0);

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setupFormValidation() {
        // Add CSS classes for validation states
        const style = document.createElement('style');
        style.textContent = `
      .newsletter-input.valid {
        border-color: #2ed573;
        box-shadow: 0 0 0 2px rgba(46, 213, 115, 0.2);
      }
      
      .newsletter-input.invalid {
        border-color: #ff5757;
        box-shadow: 0 0 0 2px rgba(255, 87, 87, 0.2);
      }
      
      .lead-magnet-card.selected {
        border-color: var(--jasper);
        box-shadow: 0 0 0 2px rgba(13, 153, 255, 0.3);
      }
      
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `;
        document.head.appendChild(style);
    }

    setupAccessibility() {
        // Add ARIA labels and roles
        this.leadMagnetCards.forEach((card, index) => {
            card.setAttribute('role', 'radio');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-checked', 'false');

            const radio = card.querySelector('input[type="radio"]');
            if (radio?.checked) {
                card.setAttribute('aria-checked', 'true');
                card.classList.add('selected');
            }
        });

        // Group cards in a radiogroup
        const cardContainer = document.querySelector('.lead-magnet-cards');
        if (cardContainer) {
            cardContainer.setAttribute('role', 'radiogroup');
            cardContainer.setAttribute('aria-labelledby', 'newsletter-signup');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        // Validate form
        if (!this.validateForm()) {
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Prepare form data
            const formData = new FormData(this.form);
            const selectedOption = formData.get('LEADMAGNET');

            // Submit to Mailchimp
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });

            // Show success message
            this.showSuccessMessage(selectedOption);

            // Reset form
            this.resetForm();

            // Track analytics if available
            this.trackConversion(selectedOption);

        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage('Oops! Something went wrong. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    validateForm() {
        const email = this.emailInput?.value.trim();
        const selectedOption = document.querySelector('input[name="LEADMAGNET"]:checked');

        if (!email) {
            this.showErrorMessage('Please enter your email address.');
            this.emailInput?.focus();
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showErrorMessage('Please enter a valid email address.');
            this.emailInput?.focus();
            return false;
        }

        if (!selectedOption) {
            this.showErrorMessage('Please select an option.');
            return false;
        }

        return true;
    }

    setLoadingState(isLoading) {
        if (!this.submitButton) return;

        this.submitButton.disabled = isLoading;
        this.submitButton.classList.toggle('loading', isLoading);

        if (isLoading) {
            this.submitButton.setAttribute('aria-describedby', 'loading-message');
        } else {
            this.submitButton.removeAttribute('aria-describedby');
        }
    }

    showSuccessMessage(selectedOption) {
        if (!this.successResponse) return;

        const messages = {
            'xstate_challenges': 'Welcome! Check your email for your first XState challenge and starter code.',
            'consultation': 'Great! Check your email for instructions on scheduling your strategy session.',
            'default': 'Thank you for subscribing! Check your email for next steps.'
        };

        const message = messages[selectedOption] || messages.default;

        this.successResponse.textContent = message;
        this.successResponse.style.display = 'block';
        this.errorResponse.style.display = 'none';

        // Announce to screen readers
        this.announceToScreenReader(message);
    }

    showErrorMessage(message) {
        if (!this.errorResponse) return;

        this.errorResponse.textContent = message;
        this.errorResponse.style.display = 'block';
        this.successResponse.style.display = 'none';

        // Announce to screen readers
        this.announceToScreenReader(`Error: ${message}`);
    }

    resetForm() {
        if (!this.form) return;

        // Reset form fields
        this.emailInput.value = '';
        this.emailInput.classList.remove('valid', 'invalid');

        // Reset to default option
        const defaultOption = document.querySelector('input[name="LEADMAGNET"][value="xstate_challenges"]');
        if (defaultOption) {
            defaultOption.checked = true;
            this.updateButtonText('xstate_challenges');
            this.updateCardStates();
        }
    }

    trackConversion(selectedOption) {
        // Track with Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'newsletter_signup', {
                'event_category': 'engagement',
                'event_label': selectedOption,
                'value': 1
            });

            // Track specific conversion types
            if (selectedOption === 'xstate_challenges') {
                gtag('event', 'challenge_signup', {
                    'event_category': 'lead_magnet',
                    'event_label': 'weekly_challenges'
                });
            } else if (selectedOption === 'consultation') {
                gtag('event', 'consultation_request', {
                    'event_category': 'lead_magnet',
                    'event_label': 'strategy_session'
                });
            }
        }

        // Track with Facebook Pixel if available
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: selectedOption === 'xstate_challenges' ? 'XState Challenges' : 'Strategy Session',
                content_category: 'lead_magnet',
                value: selectedOption === 'consultation' ? 100 : 25 // Assign values for ROI tracking
            });
        }

        // Send to custom analytics endpoint if needed
        if (window.customAnalytics) {
            window.customAnalytics.track('newsletter_signup', {
                option: selectedOption,
                timestamp: new Date().toISOString(),
                source: 'homepage_newsletter'
            });
        }
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NewsletterForm();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsletterForm;
} 
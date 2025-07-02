// TypeScript interfaces for Newsletter Form
interface NewsletterFormData {
  email: string;
  firstName?: string;
  lastName?: string;
  interests?: string[];
}

interface FormValidationResult {
  isValid: boolean;
  errors: string[];
}

interface NewsletterConfig {
  endpoint: string;
  apiKey?: string;
  listId?: string;
  redirectUrl?: string;
  enableDoubleOptIn?: boolean;
}

class NewsletterFormHandler {
  private form: HTMLFormElement | null = null;
  private emailInput: HTMLInputElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private statusElement: HTMLElement | null = null;
  private config: NewsletterConfig;

  constructor(config: NewsletterConfig) {
    this.config = {
      enableDoubleOptIn: true,
      ...config
    };
  }

  public initialize(formSelector: string = '.newsletter-form'): void {
    this.form = document.querySelector(formSelector);
    if (!this.form) {
      console.warn(`Newsletter form not found with selector: ${formSelector}`);
      return;
    }

    this.setupFormElements();
    this.attachEventListeners();
    this.trackEvent('newsletter_form_loaded', {
      formSelector,
      timestamp: Date.now()
    });
  }

  private setupFormElements(): void {
    if (!this.form) return;

    this.emailInput = this.form.querySelector('input[type="email"]');
    this.submitButton = this.form.querySelector('button[type="submit"], input[type="submit"]');
    this.statusElement = this.form.querySelector('.newsletter-status, .form-status');

    // Create status element if it doesn't exist
    if (!this.statusElement) {
      this.statusElement = document.createElement('div');
      this.statusElement.className = 'newsletter-status';
      this.statusElement.setAttribute('aria-live', 'polite');
      this.form.appendChild(this.statusElement);
    }
  }

  private attachEventListeners(): void {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Real-time email validation
    if (this.emailInput) {
      this.emailInput.addEventListener('blur', () => this.validateEmail());
      this.emailInput.addEventListener('input', () => this.clearStatus());
    }
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.form || !this.emailInput) {
      this.showStatus('Form not properly initialized.', 'error');
      return;
    }

    const formData = this.collectFormData();
    const validation = this.validateFormData(formData);

    if (!validation.isValid) {
      this.showStatus(validation.errors.join(', '), 'error');
      return;
    }

    this.setLoadingState(true);

    try {
      await this.submitToService(formData);
      this.showStatus('Thank you! Please check your email to confirm your subscription.', 'success');
      this.resetForm();
      
      this.trackEvent('newsletter_signup_success', {
        email: formData.email,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Newsletter signup error:', error);
      this.showStatus('Something went wrong. Please try again.', 'error');
      
      this.trackEvent('newsletter_signup_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    } finally {
      this.setLoadingState(false);
    }
  }

  private collectFormData(): NewsletterFormData {
    if (!this.form) throw new Error('Form not initialized');

    const formData = new FormData(this.form);
    
    const getStringValue = (value: FormDataEntryValue | null): string => {
      return (typeof value === 'string') ? value.trim() : '';
    };
    
    return {
      email: getStringValue(formData.get('email')),
      firstName: getStringValue(formData.get('firstName') || formData.get('first_name')),
      lastName: getStringValue(formData.get('lastName') || formData.get('last_name')),
      interests: formData.getAll('interests').filter(v => typeof v === 'string') as string[]
    };
  }

  private validateFormData(data: NewsletterFormData): FormValidationResult {
    const errors: string[] = [];

    // Email validation
    if (!data.email) {
      errors.push('Email address is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Please enter a valid email address');
    }

    // Additional validation
    if (data.firstName && data.firstName.length > 50) {
      errors.push('First name must be less than 50 characters');
    }

    if (data.lastName && data.lastName.length > 50) {
      errors.push('Last name must be less than 50 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateEmail(): void {
    if (!this.emailInput) return;

    const email = this.emailInput.value.trim();
    
    if (email && !this.isValidEmail(email)) {
      this.showStatus('Please enter a valid email address', 'error');
      this.emailInput.classList.add('error');
    } else {
      this.emailInput.classList.remove('error');
      this.clearStatus();
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async submitToService(data: NewsletterFormData): Promise<void> {
    // For now, simulate API call - replace with actual service integration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mailchimp or other service integration would go here
    const payload = {
      email_address: data.email,
      status: this.config.enableDoubleOptIn ? 'pending' : 'subscribed',
      merge_fields: {
        FNAME: data.firstName || '',
        LNAME: data.lastName || ''
      },
      interests: data.interests?.reduce((acc, interest) => ({
        ...acc,
        [interest]: true
      }), {}) || {},
      timestamp_signup: new Date().toISOString()
    };

    console.log('Newsletter signup payload:', payload);
    
    // Simulate success - in real implementation, would call actual API
    if (Math.random() < 0.1) { // 10% simulated failure rate
      throw new Error('Service temporarily unavailable');
    }
  }

  private setLoadingState(loading: boolean): void {
    if (this.submitButton) {
      this.submitButton.disabled = loading;
      this.submitButton.textContent = loading ? 'Subscribing...' : 'Subscribe';
      this.submitButton.classList.toggle('loading', loading);
    }

    if (this.form) {
      this.form.classList.toggle('submitting', loading);
    }
  }

  private showStatus(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    if (!this.statusElement) return;

    this.statusElement.textContent = message;
    this.statusElement.className = `newsletter-status ${type}`;
    this.statusElement.style.display = 'block';

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => this.clearStatus(), 5000);
    }
  }

  private clearStatus(): void {
    if (this.statusElement) {
      this.statusElement.textContent = '';
      this.statusElement.className = 'newsletter-status';
      this.statusElement.style.display = 'none';
    }
  }

  private resetForm(): void {
    if (this.form) {
      this.form.reset();
    }
    
    if (this.emailInput) {
      this.emailInput.classList.remove('error');
    }
  }

  private trackEvent(eventName: string, data: any): void {
    // Analytics tracking
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, {
        'event_category': 'newsletter',
        'event_label': eventName,
        'custom_parameters': data
      });
    }

    // Custom analytics
    if (window.customAnalytics) {
      window.customAnalytics.track(eventName, {
        component: 'newsletter-form',
        ...data
      });
    }
  }

  // Public API methods
  public getFormData(): NewsletterFormData | null {
    if (!this.form) return null;
    return this.collectFormData();
  }

  public setConfig(newConfig: Partial<NewsletterConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public destroy(): void {
    if (this.form) {
      this.form.removeEventListener('submit', this.handleSubmit);
    }
    
    if (this.emailInput) {
      this.emailInput.removeEventListener('blur', this.validateEmail);
      this.emailInput.removeEventListener('input', this.clearStatus);
    }

    this.form = null;
    this.emailInput = null;
    this.submitButton = null;
    this.statusElement = null;
  }
}

// Auto-initialize for backwards compatibility
document.addEventListener('DOMContentLoaded', () => {
  const newsletterHandler = new NewsletterFormHandler({
    endpoint: 'https://api.mailchimp.com/3.0/', // Replace with actual endpoint
    enableDoubleOptIn: true
  });

  // Initialize all newsletter forms on the page
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach((form, index) => {
    const formId = form.id || `newsletter-form-${index}`;
    if (!form.id) form.id = formId;
    
    newsletterHandler.initialize(`#${formId}`);
  });

  // Export for global access
  (window as any).NewsletterFormHandler = NewsletterFormHandler;
});

export default NewsletterFormHandler; 
import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, html, type RawHTML } from '../framework/core/index.js';

// Remove eventBus import - it's not exported from reactive-event-bus

// Create a simple event emitter for compatibility
class SimpleEventBus {
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  emit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }
}

const eventBus = new SimpleEventBus();

// TypeScript interfaces for Newsletter Form
interface NewsletterFormData {
  email: string;
  firstName?: string;
  lastName?: string;
  interests?: string[];
}

interface NewsletterConfig {
  endpoint: string;
  apiKey?: string;
  listId?: string;
  redirectUrl?: string;
  enableDoubleOptIn?: boolean;
}

// Newsletter form context
interface NewsletterContext {
  email: string;
  firstName: string;
  lastName: string;
  interests: string[];
  statusMessage: string;
  statusType: 'success' | 'error' | 'info' | null;
  validationErrors: string[];
  config: NewsletterConfig;
}

// Newsletter form events
type NewsletterEvent =
  | { type: 'UPDATE_EMAIL'; value: string }
  | { type: 'UPDATE_FIRST_NAME'; value: string }
  | { type: 'UPDATE_LAST_NAME'; value: string }
  | { type: 'TOGGLE_INTEREST'; interest: string }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'VALIDATE_EMAIL' }
  | { type: 'CLEAR_STATUS' }
  | { type: 'RESET_FORM' }
  | { type: 'PREFILL_EMAIL'; email: string };

// Newsletter form state machine
const newsletterMachine = setup({
  types: {
    context: {} as NewsletterContext,
    events: {} as NewsletterEvent,
  },
  actions: {
    updateEmail: assign({
      email: ({ event }) => (event.type === 'UPDATE_EMAIL' ? event.value : ''),
    }),
    updateFirstName: assign({
      firstName: ({ event }) => (event.type === 'UPDATE_FIRST_NAME' ? event.value : ''),
    }),
    updateLastName: assign({
      lastName: ({ event }) => (event.type === 'UPDATE_LAST_NAME' ? event.value : ''),
    }),
    toggleInterest: assign({
      interests: ({ context, event }) => {
        if (event.type !== 'TOGGLE_INTEREST') return context.interests;
        const interest = event.interest;
        const interests = [...context.interests];
        const index = interests.indexOf(interest);
        if (index === -1) {
          interests.push(interest);
        } else {
          interests.splice(index, 1);
        }
        return interests;
      },
    }),
    validateEmail: assign({
      validationErrors: ({ context }) => {
        const errors: string[] = [];
        if (!context.email) {
          errors.push('Email address is required');
        } else if (!isValidEmail(context.email)) {
          errors.push('Please enter a valid email address');
        }
        return errors;
      },
    }),
    setSubmittingStatus: assign({
      statusMessage: 'Subscribing...',
      statusType: 'info' as const,
    }),
    setSuccess: assign({
      statusMessage: 'Thank you! Please check your email to confirm your subscription.',
      statusType: 'success' as const,
      email: '',
      firstName: '',
      lastName: '',
      interests: [],
    }),
    setError: assign({
      statusMessage: ({ event }) =>
        event.type === 'SUBMIT_ERROR' ? event.error : 'Something went wrong. Please try again.',
      statusType: 'error' as const,
    }),
    clearStatus: assign({
      statusMessage: '',
      statusType: null,
      validationErrors: [],
    }),
    resetForm: assign({
      email: '',
      firstName: '',
      lastName: '',
      interests: [],
      statusMessage: '',
      statusType: null,
      validationErrors: [],
    }),
    prefillEmail: assign({
      email: ({ event }) => (event.type === 'PREFILL_EMAIL' ? event.email : ''),
    }),
    trackEvent: () => {
      // Track event functionality removed for simplicity
    },
  },
  guards: {
    isValidForm: ({ context }: { context: NewsletterContext }) => {
      return isValidEmail(context.email);
    },
  },
}).createMachine({
  id: 'newsletter-form',
  initial: 'idle',
  context: {
    email: '',
    firstName: '',
    lastName: '',
    interests: [],
    statusMessage: '',
    statusType: null,
    validationErrors: [],
    config: {
      endpoint: 'https://api.mailchimp.com/3.0/',
      enableDoubleOptIn: true,
    },
  },
  states: {
    idle: {
      on: {
        UPDATE_EMAIL: { actions: ['updateEmail', 'clearStatus'] },
        UPDATE_FIRST_NAME: { actions: 'updateFirstName' },
        UPDATE_LAST_NAME: { actions: 'updateLastName' },
        TOGGLE_INTEREST: { actions: 'toggleInterest' },
        VALIDATE_EMAIL: { actions: 'validateEmail' },
        CLEAR_STATUS: { actions: 'clearStatus' },
        PREFILL_EMAIL: { actions: 'prefillEmail' },
        SUBMIT: [
          {
            target: 'submitting',
            guard: 'isValidForm',
            actions: 'setSubmittingStatus',
          },
          {
            actions: 'validateEmail',
          },
        ],
      },
    },
    submitting: {
      // Simulate API call with delayed transition
      after: {
        1000: [
          {
            target: 'idle',
            // Simulate 10% failure rate
            guard: () => Math.random() < 0.1,
            actions: [
              'setError',
              { type: 'trackEvent', params: { eventName: 'newsletter_signup_error' } },
            ],
          },
          {
            target: 'success',
            actions: [
              'setSuccess',
              { type: 'trackEvent', params: { eventName: 'newsletter_signup_success' } },
            ],
          },
        ],
      },
    },
    success: {
      after: {
        5000: {
          target: 'idle',
          actions: 'clearStatus',
        },
      },
      on: {
        RESET_FORM: {
          target: 'idle',
          actions: 'resetForm',
        },
      },
    },
  },
});

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Extract validation error template
const renderValidationError = (errors: string[]): RawHTML => {
  if (errors.length === 0) return html``;
  return html`<span id="email-error" class="error-message">${errors[0]}</span>`;
};

// Template helper to render form fields
const renderEmailField = (state: SnapshotFrom<typeof newsletterMachine>): RawHTML => html`
  <div class="form-field">
    <label for="newsletter-email">Email Address</label>
    <input
      type="email"
      id="newsletter-email"
      name="email"
      value=${state.context.email}
      send:input="UPDATE_EMAIL"
      send:blur="VALIDATE_EMAIL"
      placeholder="you@example.com"
      required
      aria-describedby="email-error"
      class=${state.context.validationErrors.length > 0 ? 'error' : ''}
    />
    ${renderValidationError(state.context.validationErrors)}
  </div>
`;

const renderNameFields = (state: SnapshotFrom<typeof newsletterMachine>): RawHTML => html`
  <div class="form-row">
    <div class="form-field">
      <label for="newsletter-first-name">First Name</label>
      <input
        type="text"
        id="newsletter-first-name"
        name="firstName"
        value=${state.context.firstName}
        send:input="UPDATE_FIRST_NAME"
        placeholder="John"
      />
    </div>
    <div class="form-field">
      <label for="newsletter-last-name">Last Name</label>
      <input
        type="text"
        id="newsletter-last-name"
        name="lastName"
        value=${state.context.lastName}
        send:input="UPDATE_LAST_NAME"
        placeholder="Doe"
      />
    </div>
  </div>
`;

const renderStatusMessage = (state: SnapshotFrom<typeof newsletterMachine>): RawHTML => {
  if (!state.context.statusMessage) return html``;

  return html`
    <div 
      class="newsletter-status ${state.context.statusType}" 
      role="alert"
      aria-live="polite"
    >
      ${state.context.statusMessage}
    </div>
  `;
};

// Newsletter form template
const newsletterTemplate = (state: SnapshotFrom<typeof newsletterMachine>): RawHTML => html`
  <form 
    class="newsletter-form ${state.matches('submitting') ? 'submitting' : ''}"
    send:submit="SUBMIT"
    id="mc-embedded-subscribe-form"
  >
    ${renderEmailField(state)}
    ${renderNameFields(state)}
    
    <button 
      type="submit" 
      class="submit-button ${state.matches('submitting') ? 'loading' : ''}"
      disabled=${state.matches('submitting')}
    >
      ${state.matches('submitting') ? 'Subscribing...' : 'Subscribe'}
    </button>
    
    ${renderStatusMessage(state)}
  </form>
`;

// Newsletter form styles
const newsletterStyles = `
  :host {
    display: block;
    --field-padding: 0.75rem;
    --field-border: 1px solid #e0e0e0;
    --field-radius: 4px;
    --error-color: #d32f2f;
    --success-color: #388e3c;
  }

  .newsletter-form {
    max-width: 400px;
    margin: 0 auto;
  }

  .form-field {
    margin-bottom: 1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: #333;
  }

  input[type="email"],
  input[type="text"] {
    width: 100%;
    padding: var(--field-padding);
    border: var(--field-border);
    border-radius: var(--field-radius);
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #0D99FF;
  }

  input.error {
    border-color: var(--error-color);
  }

  .error-message {
    display: block;
    margin-top: 0.25rem;
    color: var(--error-color);
    font-size: 0.875rem;
  }

  .submit-button {
    width: 100%;
    padding: 0.75rem 1.5rem;
    background: #0D99FF;
    color: white;
    border: none;
    border-radius: var(--field-radius);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .submit-button:hover:not(:disabled) {
    background: #0a7acc;
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .submit-button.loading {
    position: relative;
  }

  .newsletter-status {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: var(--field-radius);
    font-size: 0.875rem;
    animation: slideIn 0.3s ease-out;
  }

  .newsletter-status.success {
    background: #e8f5e9;
    color: var(--success-color);
    border: 1px solid #c8e6c9;
  }

  .newsletter-status.error {
    background: #ffebee;
    color: var(--error-color);
    border: 1px solid #ffcdd2;
  }

  .newsletter-status.info {
    background: #e3f2fd;
    color: #1976d2;
    border: 1px solid #bbdefb;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .newsletter-form.submitting {
    pointer-events: none;
  }

  @media (max-width: 600px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
`;

// Create the newsletter form component
// Create base component
const NewsletterFormBase = createComponent({
  machine: newsletterMachine,
  template: newsletterTemplate,
  styles: newsletterStyles,
});

// Extend with connected callback
class NewsletterFormComponent extends NewsletterFormBase {
  connectedCallback() {
    super.connectedCallback();

    // Listen for email prefill events using reactive event bus
    eventBus.on('prefill-email', (data: unknown) => {
      const { email } = data as { email: string };
      this.send({ type: 'PREFILL_EMAIL', email });
    });

    // Listen for scroll to newsletter events
    eventBus.on('scroll-to-newsletter', () => {
      this.scrollIntoView({ behavior: 'smooth' });
    });

    // Track form loaded
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'newsletter_form_loaded', {
        event_category: 'newsletter',
        timestamp: Date.now(),
      });
    }
  }
}

customElements.define('newsletter-form', NewsletterFormComponent);

// Export for use in other modules
export default NewsletterFormComponent;
export type { NewsletterConfig, NewsletterFormData };

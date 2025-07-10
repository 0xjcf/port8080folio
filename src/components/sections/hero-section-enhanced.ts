import { assign, setup } from 'xstate';
import { createComponent, css, html, type RawHTML } from '../../framework/core/index.js';

// Global framework interface
declare global {
  interface Window {
    actorFramework?: {
      eventBus: {
        emit: (event: string, data?: unknown) => void;
        on: (event: string, handler: (data?: unknown) => void) => void;
      };
    };
    fbq?: (...args: unknown[]) => void;
    customAnalytics?: {
      track: (event: string, data: unknown) => void;
    };
  }
}

// Types
interface HeroSectionConfig {
  profileImage?: string;
  showStats?: boolean;
  showEmailCapture?: boolean;
  showPainPoints?: boolean;
}

interface StatItem {
  emoji: string;
  value: string;
  label: string;
  detail?: string;
}

interface PainPoint {
  emoji: string;
  text: string;
}

interface FormSubmissionData {
  email: string;
  source: string;
  timestamp: string;
}

interface HeroAnalyticsEvent {
  eventType: 'email_signup' | 'stat_hover' | 'pain_point_click';
  data?: unknown;
  timestamp: string;
}

interface HeroContext {
  config: HeroSectionConfig;
  emailValue: string;
  isEmailValid: boolean;
  messageText: string;
  messageType: 'success' | 'error' | null;
  selectedPainPoint: string | null;
  hoveredStat: string | null;
}

// State machine context interface
interface HeroMachineState {
  value: string;
  context: HeroContext;
}

// Event types for better type safety
type EmailInputEvent = { type: 'EMAIL_INPUT'; value: string };
type EmailSubmitEvent = { type: 'EMAIL_SUBMIT' };
type EmailSubmitSuccessEvent = { type: 'EMAIL_SUBMIT_SUCCESS' };
type EmailSubmitErrorEvent = { type: 'EMAIL_SUBMIT_ERROR'; message: string };
type SeeHowClickEvent = { type: 'SEE_HOW_CLICK' };
type PainPointClickEvent = { type: 'PAIN_POINT_CLICK'; painText: string };
type StatHoverEvent = { type: 'STAT_HOVER'; statLabel: string };
type MessageHideEvent = { type: 'MESSAGE_HIDE' };

type HeroEvent =
  | EmailInputEvent
  | EmailSubmitEvent
  | EmailSubmitSuccessEvent
  | EmailSubmitErrorEvent
  | SeeHowClickEvent
  | PainPointClickEvent
  | StatHoverEvent
  | MessageHideEvent;

// State Machine
const heroSectionMachine = setup({
  types: {
    context: {} as HeroContext,
    events: {} as HeroEvent,
  },
  actions: {
    updateEmailValue: assign({
      emailValue: ({ event }) => (event as EmailInputEvent).value,
      isEmailValid: ({ event }) => {
        const email = (event as EmailInputEvent).value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
    }),
    clearEmailForm: assign({
      emailValue: '',
      isEmailValid: false,
    }),
    setMessage: assign({
      messageText: ({ event }) =>
        (event as EmailSubmitErrorEvent).message ||
        'Success! Check your email for your first XState insight.',
      messageType: ({ event }) =>
        (event.type === 'EMAIL_SUBMIT_ERROR' ? 'error' : 'success') as 'success' | 'error',
    }),
    clearMessage: assign({
      messageText: '',
      messageType: null,
    }),
    setPainPoint: assign({
      selectedPainPoint: ({ event }) => (event as PainPointClickEvent).painText,
    }),
    setHoveredStat: assign({
      hoveredStat: ({ event }) => (event as StatHoverEvent).statLabel,
    }),
    clearHoveredStat: assign({
      hoveredStat: null,
    }),
    handleScrollToSection: () => {
      // Use framework event bus instead of DOM queries
      if (window.actorFramework?.eventBus) {
        window.actorFramework.eventBus.emit('navigation:scroll', {
          targets: ['#state-machine-education', '.pain-points', 'main'],
          behavior: 'smooth',
          block: 'start',
        });
      }
    },
    submitEmailToAPI: async ({ context }) => {
      const formData: FormSubmissionData = {
        email: context.emailValue,
        source: 'hero_section',
        timestamp: new Date().toISOString(),
      };

      // Use framework event bus for API communication
      if (window.actorFramework?.eventBus) {
        window.actorFramework.eventBus.emit('api:submit-email', formData);
      }
    },
    trackAnalytics: ({ event, context }) => {
      const eventData: HeroAnalyticsEvent = {
        eventType:
          event.type === 'PAIN_POINT_CLICK'
            ? 'pain_point_click'
            : event.type === 'STAT_HOVER'
              ? 'stat_hover'
              : 'email_signup',
        data:
          event.type === 'PAIN_POINT_CLICK'
            ? { painText: (event as PainPointClickEvent).painText }
            : event.type === 'STAT_HOVER'
              ? { statLabel: (event as StatHoverEvent).statLabel }
              : { email: hashEmail(context.emailValue), source: 'hero_section' },
        timestamp: new Date().toISOString(),
      };

      if (window.customAnalytics) {
        window.customAnalytics.track(eventData.eventType, eventData.data);
      }

      // Track with external services
      if (eventData.eventType === 'email_signup') {
        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'signup', {
            event_category: 'hero_section',
            event_label: 'email_capture',
            value: 1,
          });
        }

        if (window.fbq) {
          window.fbq('track', 'Lead', {
            content_name: 'Hero Email Signup',
            content_category: 'email_capture',
            value: 25,
          });
        }
      }
    },
  },
}).createMachine({
  id: 'hero-section',
  initial: 'idle',
  context: {
    config: {
      profileImage: '/public/images/José C. Flores.png',
      showStats: true,
      showEmailCapture: true,
      showPainPoints: true,
    },
    emailValue: '',
    isEmailValid: false,
    messageText: '',
    messageType: null,
    selectedPainPoint: null,
    hoveredStat: null,
  },
  states: {
    idle: {
      on: {
        EMAIL_INPUT: {
          actions: 'updateEmailValue',
        },
        EMAIL_SUBMIT: {
          target: 'submitting',
          guard: ({ context }) => context.isEmailValid,
        },
        SEE_HOW_CLICK: {
          actions: ['handleScrollToSection', 'trackAnalytics'],
        },
        PAIN_POINT_CLICK: {
          actions: ['setPainPoint', 'trackAnalytics'],
        },
        STAT_HOVER: {
          actions: ['setHoveredStat', 'trackAnalytics'],
        },
      },
    },
    submitting: {
      entry: 'submitEmailToAPI',
      after: {
        1000: 'success', // XState delayed transition instead of setTimeout
      },
      on: {
        EMAIL_SUBMIT_ERROR: {
          target: 'error',
          actions: 'setMessage',
        },
      },
    },
    success: {
      entry: ['setMessage', 'clearEmailForm', 'trackAnalytics'],
      after: {
        5000: {
          // XState delayed transition instead of setTimeout
          target: 'idle',
          actions: 'clearMessage',
        },
      },
      on: {
        MESSAGE_HIDE: {
          target: 'idle',
          actions: 'clearMessage',
        },
      },
    },
    error: {
      entry: 'setMessage',
      after: {
        5000: {
          // XState delayed transition instead of setTimeout
          target: 'idle',
          actions: 'clearMessage',
        },
      },
      on: {
        EMAIL_INPUT: {
          target: 'idle',
          actions: ['updateEmailValue', 'clearMessage'],
        },
        MESSAGE_HIDE: {
          target: 'idle',
          actions: 'clearMessage',
        },
      },
    },
  },
});

// Styles
const heroStyles = css`
  :host {
    display: contents;
  }

  .hero {
    background: linear-gradient(135deg, 
      rgba(13, 17, 23, 0.95) 0%,
      rgba(21, 32, 43, 0.9) 50%,
      rgba(13, 17, 23, 0.95) 100%),
      radial-gradient(ellipse at 20% 80%, rgba(13, 153, 255, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(71, 180, 255, 0.1) 0%, transparent 50%);
    color: var(--teagreen, #F5F5F5);
    padding: 4rem 2rem;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 20%, rgba(13, 153, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(71, 180, 255, 0.08) 0%, transparent 50%);
    pointer-events: none;
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .content {
    max-width: 900px;
    text-align: center;
    z-index: 1;
    position: relative;
  }

  .outcome-hook {
    margin-bottom: 2rem;
    padding: 1rem 2rem;
    background: rgba(13, 153, 255, 0.1);
    border: 1px solid rgba(13, 153, 255, 0.3);
    border-radius: 50px;
    display: inline-block;
    backdrop-filter: blur(10px);
  }

  .outcome-text {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: rgba(13, 153, 255, 0.9);
    letter-spacing: 0.5px;
  }

  h1 {
    font-size: clamp(2.5rem, 8vw, 4rem);
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, 
      var(--teagreen, #F5F5F5) 0%, 
      rgba(13, 153, 255, 0.8) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
    line-height: 1.1;
  }

  .wave {
    display: inline-block;
    animation: wave 2s ease-in-out infinite;
  }

  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(20deg); }
    75% { transform: rotate(-10deg); }
  }

  .tagline {
    font-size: clamp(1.1rem, 3vw, 1.4rem);
    line-height: 1.6;
    margin: 0 0 3rem 0;
    color: rgba(245, 245, 245, 0.9);
    font-weight: 300;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .email-capture {
    max-width: 500px;
    margin: 0 auto 3rem auto;
    padding: 2rem;
    background: rgba(21, 32, 43, 0.6);
    border: 1px solid rgba(13, 153, 255, 0.2);
    border-radius: 16px;
    backdrop-filter: blur(10px);
  }

  .email-capture h3 {
    margin: 0 0 1rem 0;
    font-size: 1.3rem;
    color: var(--teagreen, #F5F5F5);
    font-weight: 600;
  }

  .email-capture p {
    margin: 0 0 1.5rem 0;
    color: rgba(245, 245, 245, 0.8);
    line-height: 1.5;
  }

  .email-form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .email-input {
    flex: 1;
    padding: 0.875rem 1rem;
    border: 2px solid rgba(13, 153, 255, 0.3);
    border-radius: 8px;
    background: rgba(13, 17, 23, 0.8);
    color: var(--teagreen, #F5F5F5);
    font-size: 1rem;
    transition: all 0.3s ease;
    outline: none;
  }

  .email-input:focus {
    border-color: var(--jasper, #0D99FF);
    box-shadow: 0 0 0 3px rgba(13, 153, 255, 0.1);
  }

  .email-input.valid {
    border-color: rgba(46, 213, 115, 0.5);
  }

  .email-input.invalid {
    border-color: rgba(255, 87, 87, 0.5);
  }

  .email-input::placeholder {
    color: rgba(245, 245, 245, 0.5);
  }

  .email-submit {
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, var(--jasper, #0D99FF) 0%, rgba(71, 180, 255, 0.8) 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
  }

  .email-submit::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .email-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(13, 153, 255, 0.3);
  }

  .email-submit:hover::before {
    left: 100%;
  }

  .email-submit:active {
    transform: translateY(0);
  }

  .email-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .message-container {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    line-height: 1.4;
    display: none;
  }

  .message-container[data-state="success"] {
    background: rgba(46, 213, 115, 0.1);
    border: 1px solid rgba(46, 213, 115, 0.3);
    color: rgba(46, 213, 115, 0.9);
    display: block;
  }

  .message-container[data-state="error"] {
    background: rgba(255, 87, 87, 0.1);
    border: 1px solid rgba(255, 87, 87, 0.3);
    color: rgba(255, 87, 87, 0.9);
    display: block;
  }

  .challenge-info {
    font-size: 0.875rem;
    color: var(--jasper, #0D99FF);
    opacity: 0.9;
    margin: 1rem 0 0 0;
    font-weight: 500;
  }

  .loading-spinner {
    display: none;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .hero[data-state="submitting"] .loading-spinner {
    display: block;
  }

  .hero[data-state="submitting"] .button-text {
    display: none;
  }

  .hero-profile {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 0 auto 1rem auto;
    border: 3px solid rgba(13, 153, 255, 0.3);
    transition: all 0.3s ease;
  }

  @media (min-width: 768px) {
    .hero-profile {
      width: 120px;
      height: 120px;
      margin: 0 auto 1.5rem auto;
    }
  }

  .hero-profile:hover {
    border-color: var(--jasper, #0D99FF);
    box-shadow: 0 0 20px rgba(13, 153, 255, 0.3);
  }

  .see-how-it-works {
    text-align: center;
    margin: 3rem 0 1rem 0;
    opacity: 0.8;
    transition: all 0.3s ease;
    animation: bounce 2s ease-in-out infinite;
    cursor: pointer;
    border-radius: 8px;
    padding: 1rem;
    background: transparent;
    border: none;
    width: auto;
    font-family: inherit;
  }

  .see-how-it-works:hover {
    opacity: 1;
  }

  .see-how-it-works:hover .see-how-text {
    color: #FFFFFF;
    opacity: 1;
  }

  .see-how-it-works:hover .down-arrow {
    color: var(--jasper-light, #47B4FF);
    opacity: 1;
  }

  .see-how-text {
    color: var(--teagreen, #F5F5F5);
    font-size: 1.1rem;
    margin: 0 0 0.5rem 0;
    font-weight: 400;
    opacity: 0.8;
    transition: all 0.3s ease;
  }

  .down-arrow {
    color: var(--jasper, #0D99FF);
    font-size: 1.4rem;
    opacity: 0.8;
    transition: all 0.3s ease;
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px);
    }
    60% {
      transform: translateY(-4px);
    }
  }

  .quick-pain-points {
    margin: 2rem 0;
    padding: 1.5rem;
    background: rgba(21, 32, 43, 0.4);
    border-radius: 12px;
    border: 1px solid rgba(13, 153, 255, 0.2);
  }

  .pain-intro {
    font-size: 1.1rem;
    margin: 0 0 1rem 0;
    color: var(--teagreen, #F5F5F5);
    font-weight: 500;
  }

  .pain-list {
    display: grid;
    gap: 0.75rem;
    margin: 1rem 0;
  }

  .pain-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(13, 17, 23, 0.6);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .pain-item:hover {
    background: rgba(13, 153, 255, 0.1);
    border: 1px solid rgba(13, 153, 255, 0.3);
  }

  .pain-emoji {
    font-size: 1.2rem;
  }

  .pain-text {
    color: rgba(245, 245, 245, 0.9);
    font-size: 0.95rem;
  }

  .pain-solution {
    margin: 1rem 0 0 0;
    font-size: 1rem;
    color: var(--jasper, #0D99FF);
    font-weight: 500;
  }

  .quick-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }

  .stat-card {
    text-align: center;
    padding: 1.5rem 1rem;
    background: rgba(21, 32, 43, 0.4);
    border-radius: 12px;
    border: 1px solid rgba(13, 153, 255, 0.2);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .stat-card:hover {
    background: rgba(13, 153, 255, 0.1);
    border-color: rgba(13, 153, 255, 0.4);
    transform: translateY(-2px);
  }

  .stat-emoji {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--jasper, #0D99FF);
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.9rem;
    color: var(--teagreen, #F5F5F5);
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .stat-detail {
    font-size: 0.8rem;
    color: rgba(245, 245, 245, 0.7);
  }
`;

// Template helper functions (extracted to reduce nesting)
const renderEmailForm = (context: HeroContext) => html`
  <form class="email-form" send="EMAIL_SUBMIT">
    <input 
      type="email" 
      class="email-input ${context.isEmailValid && context.emailValue ? 'valid' : ''} ${!context.isEmailValid && context.emailValue ? 'invalid' : ''}"
      placeholder="your@email.com" 
      required
      aria-label="Email address"
      value="${context.emailValue}"
      send="EMAIL_INPUT"
      send-value="value"
    >
    <button type="submit" class="email-submit" ${!context.isEmailValid ? 'disabled' : ''}>
      <span class="button-text">Get Challenge #1 →</span>
      <div class="loading-spinner"></div>
    </button>
  </form>
  <div class="message-container" data-state="${context.messageType || ''}">${context.messageText}</div>
  <p class="challenge-info">
    ✓ Get Challenge #1: From chaos to clean architecture in 30 minutes
  </p>
`;

const renderPainItem = (pain: PainPoint) => {
  // Using HTML entities for safety without DOM manipulation
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  return html`
    <div class="pain-item" send="PAIN_POINT_CLICK" send-pain-text="${escapeHtml(pain.text)}">
      <span class="pain-emoji">${pain.emoji}</span>
      <span class="pain-text">${escapeHtml(pain.text)}</span>
    </div>
  `;
};

const renderStatDetail = (detail: string | undefined): RawHTML => {
  if (!detail) return html``;
  // Using HTML entities for safety without DOM manipulation
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  return html`<div class="stat-detail">${escapeHtml(detail)}</div>`;
};

const renderStatCard = (stat: StatItem) => {
  // Using HTML entities for safety without DOM manipulation
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  return html`
    <div class="stat-card" send="STAT_HOVER" send-stat-label="${escapeHtml(stat.label)}">
      <div class="stat-emoji">${stat.emoji}</div>
      <div class="stat-value">${escapeHtml(stat.value)}</div>
      <div class="stat-label">${escapeHtml(stat.label)}</div>
      ${renderStatDetail(stat.detail)}
    </div>
  `;
};

// Template
const heroTemplate = (state: HeroMachineState) => {
  const { context } = state;

  const painPoints: PainPoint[] = [
    { emoji: '🐛', text: 'Bugs that only show up in production' },
    { emoji: '⏰', text: 'Features that take weeks to ship' },
    { emoji: '😰', text: 'Race conditions nobody understands' },
  ];

  const stats: StatItem[] = [
    { emoji: '🚀', value: '3x', label: 'Faster Shipping', detail: 'Average delivery time' },
    { emoji: '🎯', value: '90%', label: 'Fewer Bugs', detail: 'Impossible states eliminated' },
    { emoji: '💡', value: '100%', label: 'Visual Coverage', detail: 'Every state documented' },
    { emoji: '🔧', value: '12', label: 'Clean Actors', detail: 'From 1,700 line monsters' },
  ];

  // Using HTML entities for safety without DOM manipulation
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const renderEmailCapture = () => {
    if (!context.config.showEmailCapture) return '';

    return html`
      <div class="email-capture">
        <h3>🚀 Start Building Better State Management Today</h3>
        <p>Join other developers learning to turn complex state into elegant, maintainable systems</p>
        ${renderEmailForm(context)}
      </div>
    `;
  };

  const renderPainPoints = () => {
    if (!context.config.showPainPoints) return '';

    return html`
      <div class="quick-pain-points">
        <p class="pain-intro">Sound familiar?</p>
        <div class="pain-list">
          ${painPoints.map((pain) => renderPainItem(pain)).join('')}
        </div>
        <p class="pain-solution">Let's fix that with state machines.</p>
      </div>
    `;
  };

  const renderStats = () => {
    if (!context.config.showStats) return '';

    return html`
      <div class="quick-stats">
        ${stats.map((stat) => renderStatCard(stat)).join('')}
      </div>
    `;
  };

  const renderProfileImage = (imageUrl: string | undefined): RawHTML => {
    if (!imageUrl) return html``;
    return html`
      <img src="${escapeHtml(imageUrl)}" 
           alt="José Flores - Frontend Architect" 
           class="hero-profile">
    `;
  };

  return html`
    <section class="hero" data-state="${state.value}">
      <div class="content">
        <div class="outcome-hook">
          <p class="outcome-text">✨ Transform Complex State Into Elegant, Maintainable Systems</p>
        </div>
        
        ${renderProfileImage(context.config.profileImage)}
        
        <h1>Hey there! <span class="wave">👋</span> I'm José</h1>
        
        <p class="tagline">
          Frontend architect helping companies build maintainable applications with complex state management.
        </p>
        
        ${renderEmailCapture()}
        ${renderPainPoints()}
        ${renderStats()}
        
        <button class="see-how-it-works" send="SEE_HOW_CLICK" aria-label="See how it works - scroll to next section">
          <p class="see-how-text">See how it works</p>
          <div class="down-arrow">↓</div>
        </button>
      </div>
    </section>
  `;
};

// Helper function (moved outside component)
function hashEmail(email: string): string {
  // Simple hash for privacy - in production, use a proper hash function
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

// Export the machine for testing
export { heroSectionMachine };

// Export component using Actor-SPA framework
export default createComponent({
  machine: heroSectionMachine,
  template: heroTemplate,
  styles: heroStyles,
});

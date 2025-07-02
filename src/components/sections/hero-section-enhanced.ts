// TypeScript interfaces for the Hero Section Enhanced component
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
  data?: any;
  timestamp: string;
}

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    customAnalytics?: {
      track: (event: string, data: any) => void;
    };
  }
}

class HeroSectionEnhanced extends HTMLElement {
  private config: HeroSectionConfig;
  private emailForm: HTMLFormElement | null = null;
  private emailInput: HTMLInputElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private messageContainer: HTMLElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      profileImage: this.getAttribute('profile-image') || '',
      showStats: this.getAttribute('show-stats') !== 'false',
      showEmailCapture: this.getAttribute('show-email-capture') !== 'false',
      showPainPoints: this.getAttribute('show-pain-points') !== 'false'
    };
  }

  connectedCallback(): void {
    this.render();
    this.addEventListeners();
  }

  disconnectedCallback(): void {
    // Clean up event listeners
    this.removeEventListeners();
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 0;
          min-height: auto;
          text-align: center;
        }
        
        @media (min-width: 768px) {
          .hero {
            padding: 4rem 0;
          }
        }
        
        .content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }
        
        /* Level 1: UNAWARE - Outcome-focused hook */
        .outcome-hook {
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.1) 0%, rgba(13, 153, 255, 0.05) 100%);
          border: 1px solid rgba(13, 153, 255, 0.3);
          border-radius: 50px;
          padding: 0.5rem 1.5rem;
          margin-bottom: 1.5rem;
          animation: subtle-glow 3s ease-in-out infinite;
        }
        
        @keyframes subtle-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(13, 153, 255, 0.2); }
          50% { box-shadow: 0 0 20px rgba(13, 153, 255, 0.4); }
        }
        
        .outcome-text {
          color: var(--jasper-light, #47B4FF);
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0;
          letter-spacing: 0.5px;
        }
        
        @media (min-width: 768px) {
          .outcome-text {
            font-size: 1rem;
          }
        }
        
        h1 {
          font-size: 3rem;
          margin: 0 0 1rem 0;
          color: #FFFFFF;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.03em;
          text-shadow: 0 0 20px rgba(13, 153, 255, 0.3);
        }
        
        @media (min-width: 480px) {
          h1 {
            font-size: 3.2rem;
          }
        }
        
        @media (min-width: 768px) {
          h1 {
            font-size: 3.5rem;
            margin: 0 0 1.5rem 0;
            line-height: 1.1;
            letter-spacing: -0.04em;
          }
        }
        
        .wave {
          display: inline-block;
          animation: wave 2.5s ease-in-out infinite;
          transform-origin: 70% 70%;
        }
        
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        
        /* Quick pain points section */
        .quick-pain-points {
          margin: 2rem 0;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.08) 0%, rgba(13, 153, 255, 0.03) 100%);
          border-radius: 16px;
          border: 1px solid rgba(13, 153, 255, 0.2);
          text-align: center;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        
        .pain-intro {
          color: var(--teagreen, #F5F5F5);
          font-size: 1.1rem;
          margin: 0 0 1.5rem 0;
          opacity: 0.95;
        }
        
        .pain-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin: 1.5rem 0;
        }
        
        @media (min-width: 768px) {
          .pain-list {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
        }
        
        .pain-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(15, 17, 21, 0.6);
          border-radius: 8px;
          border: 1px solid rgba(13, 153, 255, 0.1);
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        
        .pain-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--jasper), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        @media (min-width: 768px) {
          .pain-item {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
            padding: 1.5rem 1rem;
          }
        }
        
        .pain-item:hover {
          transform: translateY(-2px);
          border-color: rgba(13, 153, 255, 0.3);
          background: rgba(15, 17, 21, 0.8);
          box-shadow: 0 4px 20px rgba(13, 153, 255, 0.1);
        }
        
        .pain-item:hover::before {
          opacity: 0.6;
        }
        
        .pain-emoji {
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        .pain-text {
          color: var(--teagreen, #F5F5F5);
          font-size: 0.95rem;
          line-height: 1.4;
          opacity: 0.9;
        }
        
        @media (min-width: 768px) {
          .pain-text {
            font-size: 1rem;
          }
        }
        
        .pain-solution {
          color: var(--jasper-light, #47B4FF);
          font-size: 1.1rem;
          margin: 1.5rem 0 0 0;
          font-weight: 500;
        }
        
        @media (min-width: 768px) {
          .pain-solution {
            font-size: 1.2rem;
          }
        }
        
        .tagline {
          font-size: 1rem;
          color: var(--teagreen, #F5F5F5);
          line-height: 1.5;
          margin: 0;
          padding: 0 1rem;
        }
        
        @media (min-width: 768px) {
          .tagline {
            font-size: 1.25rem;
            line-height: 1.6;
            padding: 0;
          }
        }
        
        /* Social proof section */
        .social-proof {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%);
          border-radius: 16px;
          border: 1px solid rgba(13, 153, 255, 0.2);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        
        .social-proof::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--jasper), transparent);
          opacity: 0.4;
        }
        
        .trust-indicators {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--teagreen, #F5F5F5);
          font-size: 0.9rem;
        }
        
        .trust-icon {
          color: var(--jasper, #0D99FF);
          font-size: 1.2rem;
        }
        
        .quick-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1.5rem 0;
          width: 100%;
          max-width: 700px;
          padding: 0 1rem;
        }
        
        @media (min-width: 768px) and (max-width: 1024px) {
          .quick-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
            margin: 1.75rem 0;
            padding: 0;
          }
        }
        
        @media (min-width: 1024px) {
          .quick-stats {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
            margin: 2rem 0;
            padding: 0;
          }
        }
        
        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 0.75rem;
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(13, 153, 255, 0.2);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        @media (min-width: 768px) {
          .stat-card {
            padding: 1.5rem 1rem;
            border-radius: 16px;
          }
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--jasper), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
          opacity: 0.6;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(13, 153, 255, 0.4);
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.08) 0%, rgba(13, 153, 255, 0.04) 100%);
          box-shadow: 0 8px 24px rgba(13, 153, 255, 0.2);
        }
        
        .stat-card:hover::before {
          transform: translateX(100%);
        }
        
        .stat-emoji {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }
        
        @media (min-width: 768px) {
          .stat-emoji {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }
        }
        
        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--jasper, #0D99FF);
          margin: 0;
        }
        
        @media (min-width: 768px) {
          .stat-value {
            font-size: 1.5rem;
          }
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: var(--teagreen, #F5F5F5);
          margin: 0;
          text-align: center;
          line-height: 1.3;
        }
        
        @media (min-width: 768px) {
          .stat-label {
            font-size: 0.875rem;
            line-height: 1.4;
          }
        }
        
        .stat-detail {
          font-size: 0.75rem;
          color: var(--teagreen, #F5F5F5);
          opacity: 0.7;
          margin: 0.25rem 0 0 0;
          text-align: center;
        }
        
        /* Email capture section */
        .email-capture {
          background: linear-gradient(
            135deg,
            rgba(13, 153, 255, 0.12) 0%,
            rgba(13, 153, 255, 0.06) 100%
          );
          border: 2px solid rgba(13, 153, 255, 0.4);
          border-radius: 20px;
          padding: 2.5rem;
          margin: 2.5rem 1rem;
          text-align: center;
          width: 100%;
          max-width: 700px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(13, 153, 255, 0.15);
          backdrop-filter: blur(20px);
          animation: gentle-glow 4s ease-in-out infinite;
        }

        @keyframes gentle-glow {
          0%, 100% { 
            box-shadow: 0 12px 40px rgba(13, 153, 255, 0.15);
            border-color: rgba(13, 153, 255, 0.4);
          }
          50% { 
            box-shadow: 0 16px 48px rgba(13, 153, 255, 0.25);
            border-color: rgba(13, 153, 255, 0.6);
          }
        }

        .email-capture::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--jasper), var(--jasper-light), transparent);
          opacity: 0.9;
        }
        
        @media (min-width: 768px) {
          .email-capture {
            padding: 2.5rem;
            margin: 2rem 0;
          }
        }
        
        @media (min-width: 1024px) {
          .email-capture {
            padding: 3rem;
            margin: 2.5rem 0;
          }
        }
        
        .email-capture h3 {
          color: var(--jasper, #0D99FF);
          font-size: 1.4rem;
          margin: 0 0 0.75rem 0;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        
        @media (min-width: 768px) {
          .email-capture h3 {
            font-size: 1.6rem;
            margin: 0 0 1rem 0;
          }
        }
        
        .email-capture p {
          color: var(--teagreen, #F5F5F5);
          font-size: 1rem;
          margin: 0 0 1.5rem 0;
          opacity: 0.9;
          line-height: 1.5;
        }
        
        @media (min-width: 768px) {
          .email-capture p {
            font-size: 1.1rem;
            margin: 0 0 2rem 0;
          }
        }
        
        .email-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1.5rem 0;
        }
        
        @media (min-width: 768px) {
          .email-form {
            flex-direction: row;
            gap: 1rem;
          }
        }
        
        .email-input {
          flex: 1;
          padding: 1rem 1.25rem;
          border: 2px solid rgba(13, 153, 255, 0.3);
          border-radius: 12px;
          background: rgba(15, 17, 21, 0.8);
          color: var(--teagreen, #F5F5F5);
          font-size: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .email-input:focus {
          outline: none;
          border-color: var(--jasper, #0D99FF);
          box-shadow: 0 0 0 3px rgba(13, 153, 255, 0.2);
          background: rgba(15, 17, 21, 0.9);
        }
        
        .email-input::placeholder {
          color: rgba(245, 245, 245, 0.5);
        }
        
        .email-submit {
          background: linear-gradient(135deg, var(--jasper, #0D99FF) 0%, var(--jasper-light, #47B4FF) 100%);
          border: none;
          border-radius: 12px;
          padding: 1rem 2rem;
          color: white;
          font-size: 1rem;
          font-weight: 600;
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
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
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
        
        .message-container.success {
          background: rgba(46, 213, 115, 0.1);
          border: 1px solid rgba(46, 213, 115, 0.3);
          color: rgba(46, 213, 115, 0.9);
        }
        
        .message-container.error {
          background: rgba(255, 87, 87, 0.1);
          border: 1px solid rgba(255, 87, 87, 0.3);
          color: rgba(255, 87, 87, 0.9);
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
      </style>
      
      <section class="hero">
        <div class="content">
          <div class="outcome-hook">
            <p class="outcome-text">✨ Transform Complex State Into Elegant, Maintainable Systems</p>
          </div>
          
          ${this.config.profileImage ? `
            <img src="${this.escapeHtml(this.config.profileImage)}" 
                 alt="José Flores - Frontend Architect" 
                 class="hero-profile">
          ` : ''}
          
          <h1>Hey there! <span class="wave">👋</span> I'm José</h1>
          
          <p class="tagline">
            Frontend architect helping companies build maintainable applications with complex state management.
          </p>
          
          ${this.config.showEmailCapture ? this.renderEmailCapture() : ''}
          
          <button class="see-how-it-works" id="see-how-it-works-btn" aria-label="See how it works - scroll to next section">
            <p class="see-how-text">See how it works</p>
            <div class="down-arrow">↓</div>
          </button>
        </div>
      </section>
    `;
    
    this.initializeFormElements();
  }

  private renderPainPoints(): string {
    const painPoints: PainPoint[] = [
      { emoji: '🐛', text: 'Bugs that only show up in production' },
      { emoji: '⏰', text: 'Features that take weeks to ship' },
      { emoji: '😰', text: 'Race conditions nobody understands' }
    ];

    return `
      <div class="quick-pain-points">
        <p class="pain-intro">Sound familiar?</p>
        <div class="pain-list">
          ${painPoints.map(pain => `
            <div class="pain-item" data-pain="${this.escapeHtml(pain.text)}">
              <span class="pain-emoji">${pain.emoji}</span>
              <span class="pain-text">${this.escapeHtml(pain.text)}</span>
            </div>
          `).join('')}
        </div>
        <p class="pain-solution">Let's fix that with state machines.</p>
      </div>
    `;
  }

  private renderStats(): string {
    const stats: StatItem[] = [
      { emoji: '🚀', value: '3x', label: 'Faster Shipping', detail: 'Average delivery time' },
      { emoji: '🎯', value: '90%', label: 'Fewer Bugs', detail: 'Impossible states eliminated' },
      { emoji: '💡', value: '100%', label: 'Visual Coverage', detail: 'Every state documented' },
      { emoji: '🔧', value: '12', label: 'Clean Actors', detail: 'From 1,700 line monsters' }
    ];

    return `
      <div class="quick-stats">
        ${stats.map(stat => `
          <div class="stat-card" data-stat="${this.escapeHtml(stat.label)}">
            <div class="stat-emoji">${stat.emoji}</div>
            <div class="stat-value">${this.escapeHtml(stat.value)}</div>
            <div class="stat-label">${this.escapeHtml(stat.label)}</div>
            ${stat.detail ? `<div class="stat-detail">${this.escapeHtml(stat.detail)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  private renderEmailCapture(): string {
    return `
      <div class="email-capture">
        <h3>🚀 Start Building Better State Management Today</h3>
        <p>Join other developers learning to turn complex state into elegant, maintainable systems</p>
        <form class="email-form" id="hero-email-form">
          <input 
            type="email" 
            class="email-input" 
            id="hero-email-input"
            placeholder="your@email.com" 
            required
            aria-label="Email address"
          >
          <button type="submit" class="email-submit" id="hero-email-submit">
            <span class="button-text">Get Challenge #1 →</span>
            <div class="loading-spinner"></div>
          </button>
        </form>
        <div class="message-container" id="hero-message-container"></div>
        <p class="challenge-info">
          ✓ Get Challenge #1: From chaos to clean architecture in 30 minutes
        </p>
      </div>
    `;
  }

  private initializeFormElements(): void {
    if (!this.shadowRoot) return;

    this.emailForm = this.shadowRoot.getElementById('hero-email-form') as HTMLFormElement;
    this.emailInput = this.shadowRoot.getElementById('hero-email-input') as HTMLInputElement;
    this.submitButton = this.shadowRoot.getElementById('hero-email-submit') as HTMLButtonElement;
    this.messageContainer = this.shadowRoot.getElementById('hero-message-container') as HTMLElement;
    
    // Add click handler for "See how it works" button
    const seeHowButton = this.shadowRoot.getElementById('see-how-it-works-btn') as HTMLButtonElement;
    if (seeHowButton) {
      seeHowButton.addEventListener('click', this.handleSeeHowItWorksClick.bind(this));
    }
  }

  private addEventListeners(): void {
    if (!this.shadowRoot) return;

    // Email form submission
    if (this.emailForm) {
      this.emailForm.addEventListener('submit', this.handleEmailSubmit.bind(this));
    }

    // Pain point clicks
    const painItems = this.shadowRoot.querySelectorAll<HTMLElement>('.pain-item');
    painItems.forEach(item => {
      item.addEventListener('click', this.handlePainPointClick.bind(this));
    });

    // Stat card hovers
    const statCards = this.shadowRoot.querySelectorAll<HTMLElement>('.stat-card');
    statCards.forEach(card => {
      card.addEventListener('mouseenter', this.handleStatHover.bind(this));
    });

    // Email input validation
    if (this.emailInput) {
      this.emailInput.addEventListener('input', this.handleEmailInput.bind(this));
    }
  }

  private removeEventListeners(): void {
    if (this.emailForm) {
      this.emailForm.removeEventListener('submit', this.handleEmailSubmit.bind(this));
    }
    
    if (this.shadowRoot) {
      const seeHowButton = this.shadowRoot.getElementById('see-how-it-works-btn') as HTMLButtonElement;
      if (seeHowButton) {
        seeHowButton.removeEventListener('click', this.handleSeeHowItWorksClick.bind(this));
      }
    }
  }

  private async handleEmailSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.emailInput || !this.submitButton || !this.messageContainer) return;

    const email = this.emailInput.value.trim();
    
    if (!this.isValidEmail(email)) {
      this.showMessage('Please enter a valid email address.', 'error');
      return;
    }

    this.setLoadingState(true);

    try {
      const formData: FormSubmissionData = {
        email,
        source: 'hero_section',
        timestamp: new Date().toISOString()
      };

      // Simulate API call - replace with actual endpoint
      await this.submitToAPI(formData);
      
      this.showMessage('Success! Check your email for your first XState insight.', 'success');
      this.emailInput.value = '';
      this.trackHeroConversion(email);
      
    } catch (error) {
      console.error('Email submission error:', error);
      this.showMessage('Something went wrong. Please try again.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  private async submitToAPI(data: FormSubmissionData): Promise<void> {
    // Placeholder for actual API integration
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
  }

  private handlePainPointClick(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    const painText = target.dataset.pain || '';
    
    this.trackAnalyticsEvent({
      eventType: 'pain_point_click',
      data: { painText },
      timestamp: new Date().toISOString()
    });
  }

  private handleStatHover(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    const statLabel = target.dataset.stat || '';
    
    this.trackAnalyticsEvent({
      eventType: 'stat_hover',
      data: { statLabel },
      timestamp: new Date().toISOString()
    });
  }

  private handleEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const isValid = this.isValidEmail(input.value);
    
    input.classList.toggle('valid', isValid && input.value.length > 0);
    input.classList.toggle('invalid', !isValid && input.value.length > 0);
  }

  private handleSeeHowItWorksClick(event: Event): void {
    event.preventDefault();
    
    // Look for the pain point section or state machine education section
    const targetSection = document.querySelector('#state-machine-education') || 
                          document.querySelector('.pain-points') ||
                          document.querySelector('main');
    
    if (targetSection) {
      targetSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    
    // Track the interaction
    this.trackAnalyticsEvent({
      eventType: 'pain_point_click',
      data: { action: 'see_how_it_works_clicked' },
      timestamp: new Date().toISOString()
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private setLoadingState(isLoading: boolean): void {
    if (!this.submitButton) return;

    const buttonText = this.submitButton.querySelector('.button-text') as HTMLElement;
    const spinner = this.submitButton.querySelector('.loading-spinner') as HTMLElement;

    this.submitButton.disabled = isLoading;
    
    if (buttonText) {
      buttonText.style.display = isLoading ? 'none' : 'inline';
    }
    
    if (spinner) {
      spinner.style.display = isLoading ? 'block' : 'none';
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    if (!this.messageContainer) return;

    this.messageContainer.textContent = message;
    this.messageContainer.className = `message-container ${type}`;
    this.messageContainer.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.messageContainer!.style.display = 'none';
    }, 5000);
  }

  private trackHeroConversion(email: string): void {
    this.trackAnalyticsEvent({
      eventType: 'email_signup',
      data: { email: this.hashEmail(email), source: 'hero_section' },
      timestamp: new Date().toISOString()
    });

    // Track with Google Analytics if available
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'signup', {
        'event_category': 'hero_section',
        'event_label': 'email_capture',
        'value': 1
      });
    }

    // Track with Facebook Pixel if available
    if (window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: 'Hero Email Signup',
        content_category: 'email_capture',
        value: 25
      });
    }
  }

  private trackAnalyticsEvent(event: HeroAnalyticsEvent): void {
    if (window.customAnalytics) {
      window.customAnalytics.track(event.eventType, event.data);
    }
  }

  private hashEmail(email: string): string {
    // Simple hash for privacy - in production, use a proper hash function
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Register the custom element
customElements.define('hero-section-enhanced', HeroSectionEnhanced);

export default HeroSectionEnhanced; 
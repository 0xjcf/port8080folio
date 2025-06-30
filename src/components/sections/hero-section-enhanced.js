class HeroSectionEnhanced extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
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
          /* Follow global hierarchy - largest heading */
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
        
        /* Quick pain points section - standardized to match design system */
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
        
        /* Social proof for MOST AWARE visitors - standardized */
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
        
        .client-logos {
          display: flex;
          gap: 2rem;
          align-items: center;
          opacity: 0.7;
          margin-top: 1rem;
        }
        
        .client-logos img {
          height: 30px;
          filter: grayscale(100%) brightness(0.8);
          transition: all 0.3s ease;
        }
        
        .client-logos img:hover {
          filter: grayscale(0%) brightness(1);
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
        
        /* Email capture for converting visitors - enhanced prominence */
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
          /* Follow global hierarchy for H3 */
          color: var(--jasper, #0D99FF);
          font-size: 1.4rem;
          margin: 0 0 0.75rem 0;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        
        @media (min-width: 768px) {
          .email-capture h3 {
            font-size: 1.6rem;
          }
        }
        
        .email-capture p {
          color: var(--teagreen, #F5F5F5);
          font-size: 1.1rem;
          margin: 0 0 2rem 0;
          opacity: 0.95;
          line-height: 1.6;
          font-weight: 500;
        }
        
        @media (min-width: 768px) {
          .email-capture p {
            font-size: 1.2rem;
            line-height: 1.7;
          }
        }

        .email-capture .benefit-text {
          font-size: 0.9rem;
          color: var(--jasper-light, #47B4FF);
          margin: -0.5rem 0 1.5rem 0;
          opacity: 0.9;
          font-style: italic;
        }
        
        .email-form {
          display: flex;
          gap: 0.75rem;
          flex-direction: column;
        }
        
        @media (min-width: 480px) {
          .email-form {
            flex-direction: row;
            gap: 1rem;
          }
        }
        
        .email-input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          background: rgba(255, 255, 255, 0.08);
          border: 2px solid rgba(13, 153, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
          font-family: var(--primary-font);
        }
        
        .email-input::placeholder {
          color: rgba(245, 245, 245, 0.6);
        }
        
        .email-input:focus {
          outline: none;
          border-color: var(--jasper, #0D99FF);
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 0 0 3px rgba(13, 153, 255, 0.15);
        }
        
        .email-submit {
          padding: 0.875rem 1.75rem;
          background: linear-gradient(45deg, var(--jasper, #0D99FF) 0%, var(--jasper-light, #47B4FF) 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          font-family: var(--primary-font);
        }
        
        .email-submit::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s ease;
        }
        
        .email-submit:hover {
          background: linear-gradient(45deg, var(--jasper-light, #47B4FF) 0%, var(--jasper, #0D99FF) 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(13, 153, 255, 0.4);
        }
        
        .email-submit:hover::before {
          left: 100%;
        }

        .email-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .email-submit:disabled:hover {
          transform: none;
          box-shadow: 0 8px 25px rgba(13, 153, 255, 0.4);
        }

        .button-loading {
          display: none;
          align-items: center;
          gap: 0.5rem;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .email-capture .response {
          font-weight: 500;
          padding: 0.5rem;
          border-radius: 6px;
          text-align: center;
        }

        .email-capture .response.error {
          background: rgba(255, 87, 87, 0.1);
          border: 1px solid rgba(255, 87, 87, 0.3);
        }

        .email-capture .response.success {
          background: rgba(46, 213, 115, 0.1);
          border: 1px solid rgba(46, 213, 115, 0.3);
        }
        
        /* Scroll indicator for natural flow */
        .scroll-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          opacity: 0.6;
          animation: gentle-bounce 2s ease-in-out infinite;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }
        
        .scroll-indicator:hover {
          opacity: 0.9;
        }
        
        @keyframes gentle-bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
          60% { transform: translateY(-2px); }
        }
        
        .scroll-text {
          font-size: 0.875rem;
          color: var(--teagreen, #F5F5F5);
          text-align: center;
        }
        
        .scroll-arrow {
          font-size: 1.5rem;
          color: var(--jasper, #0D99FF);
        }
        

      </style>
      
      <section class="hero">
        <div class="content">
          <!-- Level 1: UNAWARE - Outcome-focused hook for above-the-fold -->
          <div class="outcome-hook">
            <p class="outcome-text">✨ Transform Complex State Into Elegant, Maintainable Systems</p>
          </div>
          
          <h1>Hey there! <span class="wave">👋</span> I'm José</h1>
          <p class="tagline">
            Solo dev who turns complex state machines into maintainable magic
            <br />
            (and occasionally creates 1,700-line monsters that teach me valuable lessons 😅)
          </p>
          
                    <!-- Email capture form - moved above the fold for maximum conversion -->
          <div class="email-capture">
            <h3>🎯 Start Building Better State Management Today</h3>
            <p>Join other developers learning to turn complex state into elegant, maintainable systems</p>
            <p class="benefit-text">✓ Get Challenge #1: From chaos to clean architecture in 30 minutes</p>
            <form 
              class="email-form" 
              id="hero-email-form"
              action="https://gmail.us15.list-manage.com/subscribe/post?u=a5d21e2e22f61cf619c8acfb4&amp;id=09a07976e0&amp;f_id=00579ee1f0"
              method="post"
              target="_blank"
              novalidate
            >
              <input 
                type="email" 
                class="email-input" 
                name="EMAIL"
                placeholder="your@email.com" 
                required
                aria-label="Email address"
              />
              <!-- Hidden field to set lead magnet to challenges -->
              <input type="hidden" name="LEADMAGNET" value="xstate_challenges" />
              <!-- Mailchimp bot protection -->
              <div aria-hidden="true" style="position: absolute; left: -5000px">
                <input type="text" name="b_a5d21e2e22f61cf619c8acfb4_09a07976e0" tabindex="-1" value="" />
              </div>
              <button type="submit" class="email-submit">
                <span class="button-text">Get Challenge #1 →</span>
                <span class="button-loading" style="display: none;">
                  <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32">
                      <animate attributeName="stroke-dashoffset" dur="1s" values="32;0;32" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  Sending...
                </span>
              </button>
            </form>
            <div class="form-responses" style="margin-top: 1rem;">
              <div class="response error" id="hero-error-response" style="display: none; color: #ff5757; font-size: 0.9rem;"></div>
              <div class="response success" id="hero-success-response" style="display: none; color: #2ed573; font-size: 0.9rem;"></div>
            </div>
          </div>
          
          <!-- Subtle scroll indicator -->
          <div class="scroll-indicator">
            <p class="scroll-text">See how it works</p>
            <div class="scroll-arrow">↓</div>
          </div>
        </div>
      </section>
    `;
  }

  addEventListeners() {
    const statCards = this.shadowRoot.querySelectorAll('.stat-card');
    statCards.forEach(card => {
      card.addEventListener('click', () => {
        const stat = card.dataset.stat;
        this.dispatchEvent(new CustomEvent('stat-clicked', {
          detail: { stat },
          bubbles: true,
          composed: true
        }));
      });
    });

    // Email form handler
    const emailForm = this.shadowRoot.getElementById('hero-email-form');
    if (emailForm) {
      emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = emailForm.querySelector('.email-input');
        const submitButton = emailForm.querySelector('.email-submit');
        const buttonText = submitButton.querySelector('.button-text');
        const buttonLoading = submitButton.querySelector('.button-loading');
        const errorResponse = this.shadowRoot.getElementById('hero-error-response');
        const successResponse = this.shadowRoot.getElementById('hero-success-response');

        const email = emailInput.value.trim();

        // Validate email
        if (!email) {
          this.showHeroMessage(errorResponse, 'Please enter your email address.');
          emailInput.focus();
          return;
        }

        if (!this.isValidEmail(email)) {
          this.showHeroMessage(errorResponse, 'Please enter a valid email address.');
          emailInput.focus();
          return;
        }

        // Show loading state
        submitButton.disabled = true;
        buttonText.style.display = 'none';
        buttonLoading.style.display = 'flex';

        try {
          const formData = new FormData(emailForm);

          // Submit to Mailchimp
          await fetch(emailForm.action, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
          });

          // Show success message
          this.showHeroMessage(successResponse, '✓ Welcome! Check your inbox for Challenge #1 and starter code.');

          // Reset form
          emailInput.value = '';

          // Track conversion
          this.trackHeroConversion(email);

        } catch (error) {
          console.error('Hero form submission error:', error);
          this.showHeroMessage(errorResponse, 'Oops! Something went wrong. Please try again.');
        } finally {
          // Reset button state
          submitButton.disabled = false;
          buttonText.style.display = 'inline';
          buttonLoading.style.display = 'none';
        }
      });
    }

    // Optional: Add smooth scroll when clicking the scroll indicator
    const scrollIndicator = this.shadowRoot.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', () => {
        const nextSection = document.querySelector('#state-machine-education');
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // Helper methods for form handling
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showHeroMessage(element, message) {
    // Hide all response messages first
    const errorResponse = this.shadowRoot.getElementById('hero-error-response');
    const successResponse = this.shadowRoot.getElementById('hero-success-response');

    if (errorResponse) errorResponse.style.display = 'none';
    if (successResponse) successResponse.style.display = 'none';

    // Show the specific message
    if (element) {
      element.textContent = message;
      element.style.display = 'block';

      // Auto-hide success messages after 5 seconds
      if (element.id === 'hero-success-response') {
        setTimeout(() => {
          element.style.display = 'none';
        }, 5000);
      }
    }
  }

  trackHeroConversion(email) {
    // Track with Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'hero_email_signup', {
        'event_category': 'engagement',
        'event_label': 'xstate_journey_start',
        'value': 1
      });

      gtag('event', 'challenge_signup', {
        'event_category': 'lead_magnet',
        'event_label': 'hero_section',
        'custom_parameters': {
          'form_location': 'hero'
        }
      });
    }

    // Track with Facebook Pixel if available
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', {
        content_name: 'XState Journey Start',
        content_category: 'hero_email_capture',
        value: 25,
        source: 'hero_section'
      });
    }

    // Dispatch custom event for other tracking systems
    this.dispatchEvent(new CustomEvent('hero-email-signup', {
      detail: {
        email: email,
        timestamp: new Date().toISOString(),
        source: 'hero_section'
      },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('hero-section-enhanced', HeroSectionEnhanced);

export { HeroSectionEnhanced };
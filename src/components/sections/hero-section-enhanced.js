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
          font-size: 2rem;
          margin: 0 0 1rem 0;
          color: var(--heading-color, #FFFFFF);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        
        @media (min-width: 480px) {
          h1 {
            font-size: 2.5rem;
          }
        }
        
        @media (min-width: 768px) {
          h1 {
            font-size: 3.5rem;
            margin: 0 0 1.5rem 0;
            line-height: 1.1;
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
        
        /* Social proof for MOST AWARE visitors */
        .social-proof {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          padding: 1.5rem;
          background: rgba(15, 17, 21, 0.4);
          border-radius: 12px;
          border: 1px solid rgba(13, 153, 255, 0.1);
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
          background: rgba(15, 17, 21, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          border: 1px solid rgba(13, 153, 255, 0.2);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        @media (min-width: 768px) {
          .stat-card {
            padding: 1.5rem 1rem;
            border-radius: 12px;
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
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(13, 153, 255, 0.4);
          background: rgba(15, 17, 21, 0.8);
          box-shadow: 0 8px 24px rgba(13, 153, 255, 0.15);
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
        
        /* Email capture for converting visitors */
        .email-capture {
          background: rgba(13, 153, 255, 0.05);
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem 1rem;
          text-align: center;
          width: 100%;
          max-width: 500px;
        }
        
        .email-capture h3 {
          color: var(--jasper, #0D99FF);
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }
        
        .email-capture p {
          color: var(--teagreen, #F5F5F5);
          font-size: 0.9rem;
          margin: 0 0 1rem 0;
          opacity: 0.9;
        }
        
        .email-form {
          display: flex;
          gap: 0.5rem;
          flex-direction: column;
        }
        
        @media (min-width: 480px) {
          .email-form {
            flex-direction: row;
          }
        }
        
        .email-input {
          flex: 1;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .email-input:focus {
          outline: none;
          border-color: var(--jasper, #0D99FF);
          background: rgba(255, 255, 255, 0.08);
        }
        
        .email-submit {
          padding: 0.75rem 1.5rem;
          background: var(--jasper, #0D99FF);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .email-submit:hover {
          background: var(--jasper-light, #47B4FF);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13, 153, 255, 0.4);
        }
        
        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(45deg, var(--jasper, #0D99FF) 0%, var(--jasper-light, #47B4FF) 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          width: fit-content;
          margin: 0 1rem;
        }
        
        @media (min-width: 768px) {
          .cta-button {
            padding: 1rem 2rem;
            font-size: 1.125rem;
            margin: 0;
          }
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 153, 255, 0.4);
        }
        
        .cta-button::after {
          content: '→';
          transition: transform 0.3s ease;
        }
        
        .cta-button:hover::after {
          transform: translateX(4px);
        }
        
        .tech-stack {
          margin-top: 2rem;
          padding: 2rem 1rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          width: 100%;
        }
        
        @media (min-width: 768px) {
          .tech-stack {
            margin-top: 3rem;
            padding: 2rem 0 0;
          }
        }
        
        .tech-label {
          font-size: 0.875rem;
          color: var(--teagreen, #F5F5F5);
          opacity: 0.8;
          margin: 0 0 1rem 0;
        }
        
        .tech-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }
        
        @media (min-width: 768px) {
          .tech-badges {
            gap: 0.75rem;
          }
        }
        
        .tech-badge {
          background: rgba(13, 153, 255, 0.1);
          color: var(--jasper-light, #47B4FF);
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          border: 1px solid rgba(13, 153, 255, 0.3);
          transition: all 0.2s ease;
        }
        
        @media (min-width: 768px) {
          .tech-badge {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
        }
        
        .tech-badge:hover {
          background: rgba(13, 153, 255, 0.2);
          transform: translateY(-2px);
          border-color: var(--jasper, #0D99FF);
        }
      </style>
      
      <section class="hero">
        <div class="content">
          <!-- Level 1: UNAWARE - Outcome hook -->
          <div class="outcome-hook">
            <p class="outcome-text">✨ Ship Features 3x Faster with Predictable State Management</p>
          </div>
          
          <h1>Hey there! <span class="wave">👋</span> I'm José</h1>
          <p class="tagline">
            Solo dev who turns complex state machines into maintainable magic
            (and occasionally creates 1,700-line monsters that teach me valuable lessons 😅)
          </p>
          
          <!-- Level 5: MOST AWARE - Credibility markers -->
          <div class="social-proof">
            <div class="trust-indicators">
              <div class="trust-item">
                <span class="trust-icon">🎯</span>
                <span>Real Production Experience</span>
              </div>
              <div class="trust-item">
                <span class="trust-icon">📚</span>
                <span>Open Source Contributor</span>
              </div>
              <div class="trust-item">
                <span class="trust-icon">🔧</span>
                <span>Battle-Tested Solutions</span>
              </div>
            </div>
          </div>
          
          <div class="quick-stats">
            <div class="stat-card" data-stat="bundle">
              <span class="stat-emoji">📦</span>
              <p class="stat-value">61%</p>
              <p class="stat-label">Bundle size reduced</p>
              <p class="stat-detail">892KB → 347KB</p>
            </div>
            <div class="stat-card" data-stat="complexity">
              <span class="stat-emoji">⚡</span>
              <p class="stat-value">1,700 → 12</p>
              <p class="stat-label">Lines of code reduced</p>
              <p class="stat-detail">Modular state machines</p>
            </div>
            <div class="stat-card" data-stat="performance">
              <span class="stat-emoji">📊</span>
              <p class="stat-value">100%</p>
              <p class="stat-label">Visual mapping</p>
              <p class="stat-detail">Every state tracked</p>
            </div>
            <div class="stat-card" data-stat="renders">
              <span class="stat-emoji">🔄</span>
              <p class="stat-value">90%</p>
              <p class="stat-label">Fewer re-renders</p>
              <p class="stat-detail">React optimization</p>
            </div>
          </div>
          
          <!-- Email capture form -->
          <div class="email-capture">
            <h3>Get My State Machine Starter Kit</h3>
            <p>Free guide: Turn complex UI logic into simple, visual state machines</p>
            <form class="email-form" id="email-form">
              <input 
                type="email" 
                class="email-input" 
                placeholder="your@email.com" 
                required
                aria-label="Email address"
              />
              <button type="submit" class="email-submit">Send Me the Guide</button>
            </form>
          </div>
          
          <a href="#state-machine-education" class="cta-button">
            Discover How State Machines Can Help You
          </a>
          
          <div class="tech-stack">
            <p class="tech-label">Tech I love working with:</p>
            <div class="tech-badges">
              <span class="tech-badge">TypeScript</span>
              <span class="tech-badge">React</span>
              <span class="tech-badge">XState</span>
              <span class="tech-badge">Vite</span>
              <span class="tech-badge">Node.js</span>
              <span class="tech-badge">Rust</span>
            </div>
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

    const ctaButton = this.shadowRoot.querySelector('.cta-button');
    ctaButton.addEventListener('click', (e) => {
      if (e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    // Email form handler
    const emailForm = this.shadowRoot.getElementById('email-form');
    if (emailForm) {
      emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('.email-input').value;
        // Here you would typically send this to your email service
        console.log('Email submitted:', email);
        // Show success message
        emailForm.innerHTML = '<p style="color: var(--jasper); margin: 0;">✓ Check your inbox! Guide sent.</p>';
      });
    }
  }
}

customElements.define('hero-section-enhanced', HeroSectionEnhanced);

export { HeroSectionEnhanced };
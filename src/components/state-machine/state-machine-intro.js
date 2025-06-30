class StateMachineIntro extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          margin: 0;
          overflow: hidden;
          background: linear-gradient(
            135deg,
            rgba(8, 8, 8, 0.95) 0%,
            rgba(15, 17, 21, 0.95) 50%,
            rgba(18, 22, 32, 0.95) 100%
          );
          backdrop-filter: blur(10px);
          padding: 3rem 0;
          position: relative;
        }
        
        :host::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(1px 1px at 20px 30px, rgba(13, 153, 255, 0.1) 50%, transparent 100%),
            radial-gradient(1.5px 1.5px at 40px 70px, rgba(13, 153, 255, 0.08) 50%, transparent 100%),
            radial-gradient(1px 1px at 90px 40px, rgba(13, 153, 255, 0.1) 50%, transparent 100%),
            radial-gradient(2px 2px at 60px 20px, rgba(13, 153, 255, 0.06) 50%, transparent 100%);
          background-size: 120px 120px;
          opacity: 0.3;
          animation: gentle-drift 20s ease-in-out infinite alternate;
        }
        
        @keyframes gentle-drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(10px, -5px); }
        }
        
        .intro-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          text-align: center;
          box-sizing: border-box;
          position: relative;
          z-index: 1;
        }
        
        @media (min-width: 768px) {
          .intro-container {
            padding: 0 2rem;
          }
        }
        
        h2 {
          /* Follow global hierarchy for H2 */
          font-size: 2rem;
          color: #F8F9FA;
          margin: 0 0 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.2;
          opacity: 0.95;
        }
        
        @media (min-width: 768px) {
          h2 {
            font-size: 2.4rem;
            margin: 0 0 1.5rem;
          }
        }
        
        .pain-points {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin: 2.5rem 0;
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
        }
        
        @media (min-width: 768px) {
          .pain-points {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin: 3rem auto;
          }
        }
        
        .pain-point {
          background: linear-gradient(
            135deg,
            rgba(13, 153, 255, 0.06) 0%,
            rgba(13, 153, 255, 0.02) 100%
          );
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 16px;
          padding: 2rem;
          text-align: left;
          box-sizing: border-box;
          max-width: 100%;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 32px rgba(13, 153, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .pain-point::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--jasper), transparent);
          opacity: 0.4;
        }
        

        
        .pain-point:hover {
          transform: translateY(-8px);
          border-color: rgba(13, 153, 255, 0.4);
          background: linear-gradient(
            135deg,
            rgba(13, 153, 255, 0.08) 0%,
            rgba(13, 153, 255, 0.04) 100%
          );
          box-shadow: 0 16px 48px rgba(13, 153, 255, 0.2);
        }
        
        .pain-point:hover::before {
          opacity: 0.6;
        }
        
        .pain-point-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
          position: relative;
        }
        
        .emoji-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.08) 0%, rgba(13, 153, 255, 0.04) 100%);
          border-radius: 16px;
          border: 1px solid rgba(13, 153, 255, 0.2);
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        
        .emoji-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(13, 153, 255, 0.2),
            transparent
          );
          transition: left 0.6s ease;
        }
        
        .pain-point:hover .emoji-container::before {
          left: 100%;
        }
        
        .emoji {
          font-size: 1.75rem;
          z-index: 1;
          position: relative;
        }
        
        @media (min-width: 768px) {
          .emoji-container {
            width: 70px;
            height: 70px;
          }
          
          .emoji {
            font-size: 2rem;
          }
        }
        
        .metric-container {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        
        .metric {
          color: var(--jasper, #0D99FF);
          font-weight: 700;
          font-size: 1.5rem;
          margin: 0;
          text-shadow: 0 0 10px rgba(13, 153, 255, 0.3);
        }
        
        .metric-label {
          color: var(--teagreen, #F5F5F5);
          font-size: 0.9rem;
          opacity: 0.7;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        @media (min-width: 768px) {
          .metric {
            font-size: 1.75rem;
          }
          
          .metric-label {
            font-size: 1rem;
          }
        }
        
        .pain-description {
          color: var(--teagreen, #F5F5F5);
          line-height: 1.7;
          margin: 0;
          font-size: 1rem;
          opacity: 0.95;
        }
        
        @media (min-width: 768px) {
          .pain-description {
            font-size: 1.1rem;
            line-height: 1.8;
          }
        }
        
        .transition-text {
          color: var(--jasper, #0D99FF);
          font-size: 1.1rem;
          margin-bottom: 2.5rem;
          font-weight: 500;
          opacity: 0.9;
        }
        
        .closing-statement {
          color: var(--teagreen, #F5F5F5);
          font-size: 1.1rem;
          line-height: 1.7;
          margin: 3rem 0 2rem;
          opacity: 0.95;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        
        @media (min-width: 768px) {
          .transition-text {
            font-size: 1.2rem;
            margin-bottom: 3rem;
          }
          
          .closing-statement {
            font-size: 1.2rem;
            margin: 3.5rem auto 2.5rem;
          }
        }
        
        .experience-insight {
          margin-top: 3rem;
          padding: 2rem;
          background: linear-gradient(
            135deg,
            rgba(13, 153, 255, 0.06) 0%,
            rgba(13, 153, 255, 0.02) 100%
          );
          border-radius: 16px;
          border: 1px solid rgba(13, 153, 255, 0.2);
          position: relative;
          overflow: hidden;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          backdrop-filter: blur(10px);
        }
        
        .experience-insight::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--jasper), transparent);
          opacity: 0.4;
        }
        

        
        .insight-header {
          color: var(--jasper, #0D99FF);
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.1rem;
        }
        
        .insight-icon {
          font-size: 1.5rem;
          filter: drop-shadow(0 0 8px rgba(13, 153, 255, 0.3));
        }
        
        .insight-text {
          color: var(--teagreen, #F5F5F5);
          margin: 0;
          line-height: 1.7;
          font-size: 1rem;
          opacity: 0.95;
        }
        
        @media (min-width: 768px) {
          .experience-insight {
            padding: 2.5rem;
            margin-top: 3.5rem;
          }
          
          .insight-header {
            font-size: 1.2rem;
          }
          
          .insight-text {
            font-size: 1.1rem;
          }
        }
        
        @media (max-width: 480px) {
          :host {
            padding: 2rem 0;
          }
          
          .intro-container {
            padding: 0 1rem;
          }
          
          h2 {
            font-size: 1.6rem;
            margin: 0 0 1rem;
          }
          
          .pain-point {
            padding: 1.5rem;
          }
          
          .emoji-container {
            width: 50px;
            height: 50px;
          }
          
          .emoji {
            font-size: 1.5rem;
          }
          
          .metric {
            font-size: 1.3rem;
          }
          
          .metric-label {
            font-size: 0.8rem;
          }
          
          .experience-insight {
            padding: 1.5rem;
            margin-top: 2rem;
          }
          
          .insight-header {
            font-size: 1rem;
          }
          
          .insight-text {
            font-size: 0.95rem;
          }
        }
      </style>
      
      <div class="intro-container">
        <!-- Level 2 to Level 3 transition -->
        <p class="transition-text">
          You know the pain. Now here's exactly what's causing it and why it keeps getting worse...
        </p>
        
        <h2>The Real Cost of Chaotic State Management</h2>
        
        <div class="pain-points">
          <div class="pain-point">
            <div class="pain-point-header">
              <div class="emoji-container">
                <span class="emoji">⏱️</span>
              </div>
              <div class="metric-container">
                <div class="metric">3+ days</div>
                <div class="metric-label">Implementation Time</div>
              </div>
            </div>
            <p class="pain-description">Simple features taking days to implement because your codebase is a maze of interconnected states</p>
          </div>
          
          <div class="pain-point">
            <div class="pain-point-header">
              <div class="emoji-container">
                <span class="emoji">🐛</span>
              </div>
              <div class="metric-container">
                <div class="metric">8+ hours</div>
                <div class="metric-label">Debug Sessions</div>
              </div>
            </div>
            <p class="pain-description">Debugging sessions that feel like archaeological digs through layers of state management</p>
          </div>
          
          <div class="pain-point">
            <div class="pain-point-header">
              <div class="emoji-container">
                <span class="emoji">😰</span>
              </div>
              <div class="metric-container">
                <div class="metric">50% slower</div>
                <div class="metric-label">Onboarding Speed</div>
              </div>
            </div>
            <p class="pain-description">New developers taking weeks to understand the codebase because state flows are unclear</p>
          </div>
        </div>
        
        <p class="closing-statement">These costs compound daily. But what if there was a way to eliminate them entirely? Not just reduce them – but make them impossible by design.</p>
        
        <!-- Enhanced experience insight -->
        <div class="experience-insight">
          <p class="insight-header">
            <span class="insight-icon">💡</span> From My Experience
          </p>
          <p class="insight-text">
            I've learned that most "complex" state problems are actually just missing the right mental model.
          </p>
        </div>
      </div>
    `;
  }
}

customElements.define('state-machine-intro', StateMachineIntro);
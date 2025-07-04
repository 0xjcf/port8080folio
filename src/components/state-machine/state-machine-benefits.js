class StateMachineBenefits extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // Calculate the base path using import.meta.url
    const componentPath = new URL(import.meta.url).pathname;
    const basePath = componentPath.substring(0, componentPath.indexOf('/src/'));
    const styleHref = `${basePath}/src/styles/state-machine-education.css`;

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${styleHref}">
      
      <div class="container">
        <h2 class="section-title">The Results Speak for Themselves 📈</h2>
        
        <div class="benefits-grid">
          <div class="benefit-card">
            <div class="benefit-icon">🐛</div>
            <h3>Fewer Bugs</h3>
            <p>Impossible states become literally impossible. Edge cases? Already handled.</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">🚀</div>
            <h3>Ship Faster</h3>
            <p>New features slot in perfectly. No more "wait, how does this work again?"</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">😌</div>
            <h3>Sleep Better</h3>
            <p>Your app behaves predictably. Even that junior dev can't break it.</p>
          </div>
        </div>
        
        <!-- CTA to contact form -->
        <div style="text-align: center; margin-top: 3rem;">
          <a href="#contact" class="cta-button" style="
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 2rem;
            background: linear-gradient(45deg, var(--jasper, #0D99FF) 0%, #47B4FF 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-size: 1.125rem;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(13, 153, 255, 0.3);
          ">
            Let's Talk About Your State Management Challenges
            <span style="transition: transform 0.3s ease;">→</span>
          </a>
          <p style="color: var(--teagreen); opacity: 0.8; margin-top: 1rem; font-size: 0.9rem;">
            Free 30-minute consultation to discuss your specific needs
          </p>
        </div>
      </div>
      
      <style>
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }
        
        .benefit-card {
          background: rgba(15, 17, 21, 0.9);
          border: 2px solid rgba(13, 153, 255, 0.2);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .benefit-card:hover {
          border-color: var(--jasper);
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 136, 255, 0.2);
        }
        
        .benefit-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .benefit-card h3 {
          color: var(--jasper);
          margin-bottom: 0.5rem;
        }
        
        .real-world-section {
          background: rgba(15, 17, 21, 0.9);
          border: 2px solid rgba(13, 153, 255, 0.2);
          border-radius: 12px;
          padding: 2rem;
          margin-top: 3rem;
        }
        
        .results-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }
        
        .results-list li {
          padding: 0.5rem 0;
          font-size: 1.1rem;
        }
        
        /* CTA button styles */
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 153, 255, 0.4) !important;
        }
        
        .cta-button:hover span {
          transform: translateX(4px);
        }
      </style>
    `;

    // Add smooth scrolling
    const ctaButton = this.shadowRoot.querySelector('.cta-button');
    if (ctaButton) {
      ctaButton.addEventListener('click', (e) => {
        e.preventDefault();

        // Check if we're on a page with a contact section
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
          // Scroll to contact section if it exists
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Redirect to homepage contact section
          window.location.href = '/#contact';
        }
      });
    }
  }
}

customElements.define('state-machine-benefits', StateMachineBenefits);
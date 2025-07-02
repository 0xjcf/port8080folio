// Type definitions
interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

interface CtaButtonConfig {
  text: string;
  subtext: string;
  targetHash: string;
}

// Custom event for CTA tracking
interface CtaClickEvent extends CustomEvent {
  detail: {
    action: 'cta-clicked';
    target: 'contact-section' | 'homepage-redirect';
    timestamp: number;
    source: 'state-machine-benefits';
  };
}

class StateMachineBenefits extends HTMLElement {
  private static readonly BENEFITS_DATA: readonly BenefitItem[] = [
    {
      icon: '🐛',
      title: 'Fewer Bugs',
      description: 'Impossible states become literally impossible. Edge cases? Already handled.'
    },
    {
      icon: '🚀',
      title: 'Ship Faster',
      description: 'New features slot in perfectly. No more "wait, how does this work again?"'
    },
    {
      icon: '😌',
      title: 'Sleep Better',
      description: 'Your app behaves predictably. Even that junior dev can\'t break it.'
    }
  ] as const;

  private static readonly CTA_CONFIG: CtaButtonConfig = {
    text: 'Let\'s Talk About Your State Management Challenges',
    subtext: 'Free 30-minute consultation to discuss your specific needs',
    targetHash: '#contact'
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const ctaButton = this.shadowRoot!.querySelector('.cta-button') as HTMLElement;
    if (ctaButton) {
      ctaButton.addEventListener('click', (e: MouseEvent) => {
        this.handleCtaClick(e);
      });
    }
  }

  private handleCtaClick(e: MouseEvent): void {
    e.preventDefault();

    const contactSection = document.querySelector('#contact');
    const target: 'contact-section' | 'homepage-redirect' = contactSection ? 'contact-section' : 'homepage-redirect';

    // Dispatch custom event for analytics tracking
    const event: CtaClickEvent = new CustomEvent('benefits-cta-clicked', {
      detail: {
        action: 'cta-clicked',
        target,
        timestamp: Date.now(),
        source: 'state-machine-benefits'
      },
      bubbles: true,
      composed: true
    }) as CtaClickEvent;

    this.dispatchEvent(event);

    // Handle navigation
    if (contactSection) {
      // Scroll to contact section if it exists
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Redirect to homepage contact section
      window.location.href = '/#contact';
    }
  }

  private renderBenefitCard(benefit: BenefitItem): string {
    return `
      <div class="benefit-card">
        <div class="benefit-icon">${benefit.icon}</div>
        <h3>${this.escapeHtml(benefit.title)}</h3>
        <p>${this.escapeHtml(benefit.description)}</p>
      </div>
    `;
  }

  private renderBenefitsGrid(): string {
    return `
      <div class="benefits-grid">
        ${StateMachineBenefits.BENEFITS_DATA.map(benefit => this.renderBenefitCard(benefit)).join('')}
      </div>
    `;
  }

  private renderCtaSection(): string {
    return `
      <div class="cta-section">
        <a href="${StateMachineBenefits.CTA_CONFIG.targetHash}" class="cta-button">
          ${this.escapeHtml(StateMachineBenefits.CTA_CONFIG.text)}
          <span class="cta-arrow">→</span>
        </a>
        <p class="cta-subtext">
          ${this.escapeHtml(StateMachineBenefits.CTA_CONFIG.subtext)}
        </p>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getBasePath(): string {
    const componentPath = new URL(import.meta.url).pathname;
    return componentPath.substring(0, componentPath.indexOf('/src/'));
  }

  private render(): void {
    const basePath = this.getBasePath();
    const styleHref = `${basePath}/src/styles/state-machine-education.css`;

    this.shadowRoot!.innerHTML = `
      <link rel="stylesheet" href="${styleHref}">
      
      <div class="container">
        <h2 class="section-title">The Results Speak for Themselves 📈</h2>
        
        ${this.renderBenefitsGrid()}
        
        <!-- CTA section -->
        <div style="text-align: center; margin-top: 3rem;">
          ${this.renderCtaSection()}
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
        
        .cta-section {
          text-align: center;
        }
        
        .cta-button {
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
          cursor: pointer;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 153, 255, 0.4);
        }
        
        .cta-arrow {
          transition: transform 0.3s ease;
        }
        
        .cta-button:hover .cta-arrow {
          transform: translateX(4px);
        }
        
        .cta-subtext {
          color: var(--teagreen);
          opacity: 0.8;
          margin-top: 1rem;
          font-size: 0.9rem;
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
      </style>
    `;
  }

  // Public API for external interactions
  public getBenefitsData(): readonly BenefitItem[] {
    return StateMachineBenefits.BENEFITS_DATA;
  }

  public getCtaConfig(): CtaButtonConfig {
    return { ...StateMachineBenefits.CTA_CONFIG };
  }

  public triggerCtaClick(): void {
    const ctaButton = this.shadowRoot!.querySelector('.cta-button') as HTMLElement;
    if (ctaButton) {
      ctaButton.click();
    }
  }

  public updateCtaText(newText: string): void {
    const ctaButton = this.shadowRoot!.querySelector('.cta-button') as HTMLElement;
    if (ctaButton) {
      const arrow = ctaButton.querySelector('.cta-arrow');
      if (arrow) {
        ctaButton.innerHTML = `${this.escapeHtml(newText)} ${arrow.outerHTML}`;
      }
    }
  }
}

// Define the custom element
if (!customElements.get('state-machine-benefits')) {
  customElements.define('state-machine-benefits', StateMachineBenefits);
}

export { StateMachineBenefits };
export type { BenefitItem, CtaButtonConfig, CtaClickEvent }; 
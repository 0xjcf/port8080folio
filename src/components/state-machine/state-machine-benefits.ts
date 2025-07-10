import { setup } from 'xstate';
import { createComponent, css, html } from '../../framework/core/index.js';

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

interface BenefitsContext {
  benefits: readonly BenefitItem[];
  ctaConfig: CtaButtonConfig;
}

type BenefitsEvent = { type: 'CTA_CLICKED'; target: 'contact-section' | 'homepage-redirect' };

// Static data
const BENEFITS_DATA: readonly BenefitItem[] = [
  {
    icon: '🐛',
    title: 'Fewer Bugs',
    description: 'Impossible states become literally impossible. Edge cases? Already handled.',
  },
  {
    icon: '🚀',
    title: 'Ship Faster',
    description: 'New features slot in perfectly. No more "wait, how does this work again?"',
  },
  {
    icon: '😌',
    title: 'Sleep Better',
    description: "Your app behaves predictably. Even that junior dev can't break it.",
  },
] as const;

const CTA_CONFIG: CtaButtonConfig = {
  text: "Let's Talk About Your State Management Challenges",
  subtext: 'Free 30-minute consultation to discuss your specific needs',
  targetHash: '#contact',
};

// XState machine
const benefitsMachine = setup({
  types: {
    context: {} as BenefitsContext,
    events: {} as BenefitsEvent,
  },
  actions: {
    handleCtaClick: ({ event }) => {
      // ✅ FRAMEWORK: Use pure framework event bus without DOM queries
      if (typeof window !== 'undefined' && window.globalEventBus) {
        // Emit analytics event through framework
        window.globalEventBus.emit('benefits-cta-clicked', {
          action: 'cta-clicked',
          target: event.target,
          timestamp: Date.now(),
          source: 'state-machine-benefits',
        });

        // ✅ FRAMEWORK: Let framework handle all navigation logic
        window.globalEventBus.emit('navigate-to-section', {
          target: '#contact',
          behavior: 'smooth',
          fallbackUrl: '/#contact',
          scrollIntoView: true,
          source: 'state-machine-benefits',
        });
      }

      // ✅ FRAMEWORK: No direct DOM manipulation - let framework handle navigation
      // Framework listeners will handle the actual scrolling/navigation based on the event above
    },
  },
}).createMachine({
  id: 'benefits',
  initial: 'idle',
  context: {
    benefits: BENEFITS_DATA,
    ctaConfig: CTA_CONFIG,
  },
  states: {
    idle: {
      on: {
        CTA_CLICKED: {
          actions: 'handleCtaClick',
        },
      },
    },
  },
});

// Template functions
const benefitCardTemplate = (benefit: BenefitItem) => html`
  <div class="benefit-card">
    <div class="benefit-icon">${benefit.icon}</div>
    <h3>${benefit.title}</h3>
    <p>${benefit.description}</p>
  </div>
`;

const ctaSectionTemplate = (ctaConfig: CtaButtonConfig) => html`
  <div class="cta-section">
    <a href=${ctaConfig.targetHash} 
       class="cta-button" 
       send="CTA_CLICKED" 
       target="contact-section">
      ${ctaConfig.text}
      <span class="cta-arrow">→</span>
    </a>
    <p class="cta-subtext">
      ${ctaConfig.subtext}
    </p>
  </div>
`;

const template = (state: { context: BenefitsContext }) => html`
  <div class="container">
    <h2 class="section-title">The Results Speak for Themselves 📈</h2>
    
    <div class="benefits-grid">
      ${state.context.benefits.map(benefitCardTemplate)}
    </div>
    
    <!-- CTA section -->
    <div style="text-align: center; margin-top: 3rem;">
      ${ctaSectionTemplate(state.context.ctaConfig)}
    </div>
  </div>
`;

// Styles
const styles = css`
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
`;

// Create component using framework
const StateMachineBenefits = createComponent({
  machine: benefitsMachine,
  template,
  styles,
  tagName: 'state-machine-benefits',
});

// Export types and component
export { StateMachineBenefits };
export type { BenefitItem, CtaButtonConfig };

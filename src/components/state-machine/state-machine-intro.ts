// TypeScript interfaces for State Machine Intro component
interface PainPointData {
  icon: string;
  title: string;
  description: string;
  consequence: string;
}

interface StateMachineIntroConfig {
  showAnimation?: boolean;
  showInteraction?: boolean;
  expandOnLoad?: boolean;
}

interface InteractionEvent {
  type: 'pain_point_click' | 'section_expand' | 'solution_reveal';
  data: {
    painPoint?: string;
    timeOnSection?: number;
  };
  timestamp: string;
}

class StateMachineIntro extends HTMLElement {
  private config: StateMachineIntroConfig;
  private isExpanded: boolean = false;
  private interactionStartTime: number = 0;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      showAnimation: this.getAttribute('show-animation') !== 'false',
      showInteraction: this.getAttribute('show-interaction') !== 'false',
      expandOnLoad: this.getAttribute('expand-on-load') === 'true'
    };
  }

  static get observedAttributes(): string[] {
    return ['show-animation', 'show-interaction', 'expand-on-load'];
  }

  connectedCallback(): void {
    this.interactionStartTime = Date.now();
    this.render();
    this.addEventListeners();
    
    if (this.config.expandOnLoad) {
      setTimeout(() => this.expandSection(), 500);
    }
  }

  disconnectedCallback(): void {
    this.removeEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.updateConfig();
      this.render();
    }
  }

  private updateConfig(): void {
    this.config = {
      showAnimation: this.getAttribute('show-animation') !== 'false',
      showInteraction: this.getAttribute('show-interaction') !== 'false',
      expandOnLoad: this.getAttribute('expand-on-load') === 'true'
    };
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .state-machine-intro {
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.08) 0%, rgba(13, 153, 255, 0.03) 100%);
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 20px;
          padding: 2.5rem;
          margin: 2rem 0;
          position: relative;
          overflow: hidden;
          transition: all 0.6s ease;
        }
        
        .state-machine-intro::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--jasper), var(--jasper-light), transparent);
          opacity: 0.8;
        }
        
        .intro-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .intro-title {
          color: var(--jasper, #0D99FF);
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          letter-spacing: -0.02em;
        }
        
        @media (min-width: 768px) {
          .intro-title {
            font-size: 2.5rem;
          }
        }
        
        .intro-subtitle {
          color: var(--teagreen, #F5F5F5);
          font-size: 1.1rem;
          margin: 0;
          opacity: 0.9;
          line-height: 1.6;
        }
        
        @media (min-width: 768px) {
          .intro-subtitle {
            font-size: 1.25rem;
          }
        }
        
        .pain-points-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin: 2rem 0;
        }
        
        @media (min-width: 768px) {
          .pain-points-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
        }
        
        @media (min-width: 1024px) {
          .pain-points-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .pain-point-card {
          background: rgba(15, 17, 21, 0.6);
          border: 1px solid rgba(13, 153, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .pain-point-card::before {
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
        
        .pain-point-card:hover {
          transform: translateY(-4px);
          border-color: rgba(13, 153, 255, 0.3);
          background: rgba(15, 17, 21, 0.8);
          box-shadow: 0 8px 24px rgba(13, 153, 255, 0.15);
        }
        
        .pain-point-card:hover::before {
          opacity: 0.6;
        }
        
        .pain-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          display: block;
        }
        
        .pain-title {
          color: var(--jasper-light, #47B4FF);
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
        }
        
        .pain-description {
          color: var(--teagreen, #F5F5F5);
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0 0 1rem 0;
          opacity: 0.9;
        }
        
        .pain-consequence {
          color: rgba(255, 87, 87, 0.9);
          font-size: 0.85rem;
          font-style: italic;
          margin: 0;
          opacity: 0.8;
        }
        
        .solution-section {
          text-align: center;
          margin: 3rem 0 2rem 0;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        
        .solution-section.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        
        .solution-title {
          color: var(--jasper, #0D99FF);
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }
        
        @media (min-width: 768px) {
          .solution-title {
            font-size: 1.75rem;
          }
        }
        
        .solution-text {
          color: var(--teagreen, #F5F5F5);
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 2rem 0;
          opacity: 0.95;
        }
        
        @media (min-width: 768px) {
          .solution-text {
            font-size: 1.2rem;
          }
        }
        
        .cta-button {
          background: linear-gradient(135deg, var(--jasper, #0D99FF) 0%, var(--jasper-light, #47B4FF) 100%);
          border: none;
          border-radius: 12px;
          padding: 1rem 2rem;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          position: relative;
          overflow: hidden;
        }
        
        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(13, 153, 255, 0.3);
        }
        
        .cta-button:hover::before {
          left: 100%;
        }
        
        .expand-trigger {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(13, 153, 255, 0.1);
          border: 1px solid rgba(13, 153, 255, 0.3);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--jasper, #0D99FF);
          font-size: 1.2rem;
        }
        
        .expand-trigger:hover {
          background: rgba(13, 153, 255, 0.2);
          transform: scale(1.1);
        }
        
        .expand-trigger.rotated {
          transform: rotate(180deg);
        }
        
        .collapsible-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.6s ease;
        }
        
        .collapsible-content.expanded {
          max-height: 1000px;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .pain-point-card {
          animation: ${this.config.showAnimation ? 'fadeInUp 0.6s ease forwards' : 'none'};
        }
        
        .pain-point-card:nth-child(1) { animation-delay: 0.1s; }
        .pain-point-card:nth-child(2) { animation-delay: 0.2s; }
        .pain-point-card:nth-child(3) { animation-delay: 0.3s; }
      </style>
      
      <section class="state-machine-intro">
        ${this.config.showInteraction ? `
          <button class="expand-trigger" id="expand-trigger" aria-label="Expand section">
            ↓
          </button>
        ` : ''}
        
        <div class="intro-header">
          <h2 class="intro-title">Does This Sound Familiar?</h2>
          <p class="intro-subtitle">
            The hidden costs of chaotic frontend state management
          </p>
        </div>
        
        <div class="collapsible-content ${this.isExpanded ? 'expanded' : ''}" id="collapsible-content">
          <div class="pain-points-grid">
            ${this.renderPainPoints()}
          </div>
          
          <div class="solution-section" id="solution-section">
            <h3 class="solution-title">What if there was a better way?</h3>
            <p class="solution-text">
              State machines turn impossible states into... literally impossible. 
              Transform chaos into predictable, visual workflows your team will actually understand.
            </p>
            <a href="resources/" class="cta-button">
              Discover State Machines →
            </a>
          </div>
        </div>
      </section>
    `;
  }

  private renderPainPoints(): string {
    const painPoints: PainPointData[] = [
      {
        icon: '🐛',
        title: 'Impossible State Bugs',
        description: 'Your app gets into states that "should never happen" but somehow do.',
        consequence: 'Users report bugs you can never reproduce locally'
      },
      {
        icon: '⏰',
        title: 'Slow Feature Development',
        description: 'Adding new features requires touching 12 different files and breaking 3 existing ones.',
        consequence: 'Simple changes take weeks instead of days'
      },
      {
        icon: '😰',
        title: 'Race Condition Nightmares',
        description: 'Loading states, error handling, and user interactions conflict in unpredictable ways.',
        consequence: 'Production crashes that make no sense'
      },
      {
        icon: '📚',
        title: 'Unreadable State Logic',
        description: 'Boolean flags scattered everywhere: isLoading, hasError, isRetrying, wasSubmitted...',
        consequence: 'New team members quit in frustration'
      },
      {
        icon: '🔥',
        title: 'Testing Hell',
        description: 'Mocking all the possible state combinations is impossible.',
        consequence: 'Tests that don\'t actually test real scenarios'
      },
      {
        icon: '🤯',
        title: 'Mental Overhead',
        description: 'You spend more time figuring out current state than building features.',
        consequence: 'Burnout from fighting your own code'
      }
    ];

    return painPoints.map(point => `
      <div class="pain-point-card" data-pain="${this.escapeHtml(point.title)}">
        <span class="pain-icon">${point.icon}</span>
        <h4 class="pain-title">${this.escapeHtml(point.title)}</h4>
        <p class="pain-description">${this.escapeHtml(point.description)}</p>
        <p class="pain-consequence">${this.escapeHtml(point.consequence)}</p>
      </div>
    `).join('');
  }

  private addEventListeners(): void {
    if (!this.shadowRoot) return;

    // Pain point clicks
    const painCards = this.shadowRoot.querySelectorAll<HTMLElement>('.pain-point-card');
    painCards.forEach(card => {
      card.addEventListener('click', this.handlePainPointClick.bind(this));
    });

    // Expand/collapse functionality
    const expandTrigger = this.shadowRoot.getElementById('expand-trigger');
    if (expandTrigger) {
      expandTrigger.addEventListener('click', this.toggleExpand.bind(this));
    }

    // Intersection observer for solution reveal
    this.setupIntersectionObserver();
  }

  private removeEventListeners(): void {
    // Event listeners are automatically removed when shadow DOM is destroyed
  }

  private handlePainPointClick(event: Event): void {
    const card = event.currentTarget as HTMLElement;
    const painPoint = card.dataset.pain || '';
    
    this.trackInteraction({
      type: 'pain_point_click',
      data: { painPoint },
      timestamp: new Date().toISOString()
    });

    // Add visual feedback
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);
  }

  private toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
    
    const content = this.shadowRoot?.getElementById('collapsible-content');
    const trigger = this.shadowRoot?.getElementById('expand-trigger');
    
    if (content) {
      content.classList.toggle('expanded', this.isExpanded);
    }
    
    if (trigger) {
      trigger.classList.toggle('rotated', this.isExpanded);
      trigger.textContent = this.isExpanded ? '↑' : '↓';
    }

    this.trackInteraction({
      type: 'section_expand',
      data: { 
        timeOnSection: Date.now() - this.interactionStartTime
      },
      timestamp: new Date().toISOString()
    });

    if (this.isExpanded) {
      setTimeout(() => this.revealSolution(), 800);
    }
  }

  private expandSection(): void {
    if (!this.isExpanded) {
      this.toggleExpand();
    }
  }

  private setupIntersectionObserver(): void {
    const options = {
      threshold: 0.5,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isExpanded && this.config.showInteraction) {
          setTimeout(() => this.expandSection(), 1000);
        }
      });
    }, options);

    observer.observe(this);
  }

  private revealSolution(): void {
    const solutionSection = this.shadowRoot?.getElementById('solution-section');
    if (solutionSection) {
      solutionSection.classList.add('revealed');
      
      this.trackInteraction({
        type: 'solution_reveal',
        data: {
          timeOnSection: Date.now() - this.interactionStartTime
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  private trackInteraction(event: InteractionEvent): void {
    // Track with analytics if available
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', event.type, {
        'event_category': 'state_machine_intro',
        'event_label': event.data.painPoint || 'interaction',
        'value': event.data.timeOnSection || 1
      });
    }

    // Custom analytics
    if (window.customAnalytics) {
      window.customAnalytics.track(event.type, event.data);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API methods
  public expand(): void {
    if (!this.isExpanded) {
      this.expandSection();
    }
  }

  public collapse(): void {
    if (this.isExpanded) {
      this.toggleExpand();
    }
  }

  public getInteractionData(): { timeOnSection: number; isExpanded: boolean } {
    return {
      timeOnSection: Date.now() - this.interactionStartTime,
      isExpanded: this.isExpanded
    };
  }
}

// Register the custom element
customElements.define('state-machine-intro', StateMachineIntro);

export default StateMachineIntro; 
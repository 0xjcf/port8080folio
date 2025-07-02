// Type definitions
interface StatClickEvent extends CustomEvent {
  detail: {
    stat: string;
    section: string;
  };
}

type StatType = 'refactoring' | 'components' | 'actors' | 'sanity';

class AboutSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this.addInteractivity();
  }

  private render(): void {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .about-container {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }
        
        .content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        h2 {
          font-size: 2.5rem;
          color: var(--heading-color, #FFFFFF);
          margin: 0 0 1rem 0;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        @media (min-width: 768px) {
          h2 {
            font-size: 3rem;
          }
        }
        
        @media (max-width: 850px) {
          h2 {
            font-size: 2rem;
          }
        }
        
        .story-section {
          background: rgba(13, 153, 255, 0.05);
          border-left: 4px solid var(--jasper, #0D99FF);
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1rem 0;
        }
        
        .story-section h3 {
          color: var(--jasper, #0D99FF);
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .story-section p {
          color: var(--teagreen, #F5F5F5);
          line-height: 1.8;
          margin: 0.75rem 0;
        }
        
        .highlight {
          color: var(--jasper-light, #47B4FF);
          font-weight: 600;
        }
        
        .lessons-learned {
          background: rgba(15, 17, 21, 0.8);
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
        }
        
        .lessons-learned h3 {
          color: var(--heading-color, #FFFFFF);
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }
        
        .lesson-item {
          display: flex;
          align-items: start;
          gap: 1rem;
          margin: 1rem 0;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.5s forwards;
        }
        
        .lesson-item:nth-child(2) { animation-delay: 0.1s; }
        .lesson-item:nth-child(3) { animation-delay: 0.2s; }
        .lesson-item:nth-child(4) { animation-delay: 0.3s; }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .lesson-emoji {
          font-size: 1.5rem;
          line-height: 1;
        }
        
        .lesson-text {
          flex: 1;
          color: var(--teagreen, #F5F5F5);
          line-height: 1.6;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .stat-box {
          background: rgba(13, 153, 255, 0.1);
          border: 1px solid rgba(13, 153, 255, 0.3);
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .stat-box:hover {
          transform: translateY(-4px);
          background: rgba(13, 153, 255, 0.2);
          box-shadow: 0 8px 16px rgba(13, 153, 255, 0.2);
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: var(--jasper, #0D99FF);
          margin: 0;
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: var(--teagreen, #F5F5F5);
          margin: 0.5rem 0 0 0;
        }
        
        .tech-journey {
          margin-top: 2rem;
        }
        
        .tech-journey h3 {
          color: var(--heading-color, #FFFFFF);
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
        }
        
        .tech-timeline {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        
        .tech-item {
          background: rgba(13, 153, 255, 0.1);
          color: var(--jasper-light, #47B4FF);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          border: 1px solid rgba(13, 153, 255, 0.3);
          transition: all 0.2s ease;
        }
        
        .tech-item:hover {
          background: rgba(13, 153, 255, 0.2);
          transform: translateY(-2px);
        }
        
        @media (max-width: 850px) {
          .about-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          h2 {
            font-size: 2rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
      
      <section class="about-container">
        <div class="content">
          <h2>The Real Story 📖</h2>
          
          <div class="story-section">
            <h3><span>😅</span> The 1,700-Line Wake-Up Call</h3>
            <p>
              Picture this: Building an education platform with XState. Everything's going great. 
              "Just one more state," I kept telling myself. Fast forward three months...
            </p>
            <p>
              <span class="highlight">teacherMachine.ts: 1,732 lines.</span> My VS Code started lagging. 
              The bundle analyzer looked like a pizza chart where someone forgot to cut slices.
            </p>
            <p>
              That's when I realized: I'd created a monster. A fully functional, 
              thoroughly tested, completely unmaintainable monster. 🦖
            </p>
          </div>
          
          <div class="lessons-learned">
            <h3>What That Disaster Taught Me</h3>
            <div class="lesson-item">
              <span class="lesson-emoji">📏</span>
              <div class="lesson-text">
                <strong>Complexity limits save lives</strong> - Now I set a 300-line limit. 
                If it's bigger, it needs to be split. Period.
              </div>
            </div>
            <div class="lesson-item">
              <span class="lesson-emoji">🎭</span>
              <div class="lesson-text">
                <strong>Actor isolation is everything</strong> - Split that 1,700-line behemoth into 12 
                independent state machines. No more debugging nightmares!
              </div>
            </div>
            <div class="lesson-item">
              <span class="lesson-emoji">🧪</span>
              <div class="lesson-text">
                <strong>Tests aren't enough</strong> - 100% coverage doesn't mean 100% 
                maintainable. Learned that the hard way.
              </div>
            </div>
            <div class="lesson-item">
              <span class="lesson-emoji">🛠️</span>
              <div class="lesson-text">
                <strong>Tools > discipline</strong> - Built automation to catch complexity 
                before it hurts. Bash scripts are your friend!
              </div>
            </div>
          </div>
        </div>
        
        <div class="sidebar">
          <div class="stats-grid">
            <div class="stat-box" data-stat="refactoring">
              <p class="stat-number">3 weeks</p>
              <p class="stat-label">To refactor that monster</p>
            </div>
            <div class="stat-box" data-stat="components">
              <p class="stat-number">12</p>
              <p class="stat-label">Modular state machines</p>
            </div>
            <div class="stat-box" data-stat="actors">
              <p class="stat-number">8</p>
              <p class="stat-label">Actor-based services</p>
            </div>
            <div class="stat-box" data-stat="sanity">
              <p class="stat-number">100%</p>
              <p class="stat-label">Developer sanity restored</p>
            </div>
          </div>
          
          <div class="tech-journey">
            <h3>My Current Toolkit 🧰</h3>
            <p style="color: var(--teagreen, #F5F5F5); margin: 0.5rem 0;">
              Learned through trial, error, and occasional crying:
            </p>
            <div class="tech-timeline">
              <span class="tech-item">TypeScript</span>
              <span class="tech-item">XState</span>
              <span class="tech-item">React</span>
              <span class="tech-item">Web Components</span>
              <span class="tech-item">Rust</span>
              <span class="tech-item">Pine Script</span>
              <span class="tech-item">Node.js</span>
              <span class="tech-item">Embassy</span>
              <span class="tech-item">Tokio</span>
            </div>
          </div>
          
          <div class="story-section" style="margin-top: 2rem;">
            <h3><span>💡</span> The Plot Twist</h3>
            <p>
              That 1,700-line disaster? It's now 12 beautiful, independent state machines. 
              And it's become my most valuable teaching tool.
            </p>
            <p>
              Sometimes your biggest messes lead to your best architectures. 
              And hey, at least my IDE doesn't cry anymore! 🎉
            </p>
          </div>
        </div>
      </section>
    `;
  }

  private addInteractivity(): void {
    const statBoxes = this.shadowRoot!.querySelectorAll('.stat-box') as NodeListOf<HTMLElement>;
    
    statBoxes.forEach((box: HTMLElement) => {
      box.addEventListener('click', () => {
        const stat = box.dataset.stat as StatType;
        
        if (stat) {
          this.dispatchStatClickEvent(stat);
        }
      });
    });
  }

  private dispatchStatClickEvent(stat: StatType): void {
    const customEvent: StatClickEvent = new CustomEvent('stat-clicked', {
      detail: { 
        stat, 
        section: 'about' 
      },
      bubbles: true,
      composed: true
    });
    
    this.dispatchEvent(customEvent);
  }

  // Public API for external interactions
  public getStats(): StatType[] {
    return ['refactoring', 'components', 'actors', 'sanity'];
  }

  public highlightStat(statType: StatType): void {
    const statBox = this.shadowRoot!.querySelector(`[data-stat="${statType}"]`) as HTMLElement;
    
    if (statBox) {
      statBox.style.transform = 'translateY(-8px) scale(1.05)';
      statBox.style.background = 'rgba(13, 153, 255, 0.3)';
      
      // Reset after animation
      setTimeout(() => {
        statBox.style.transform = '';
        statBox.style.background = '';
      }, 2000);
    }
  }
}

// Define the custom element
if (!customElements.get('about-section')) {
  customElements.define('about-section', AboutSection);
}

export { AboutSection };
export type { StatClickEvent, StatType }; 
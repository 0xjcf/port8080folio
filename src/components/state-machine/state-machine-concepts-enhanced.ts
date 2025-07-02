// Import dependencies
import '../ui/syntax-highlighter-with-themes.js';
import '../code-examples/chaos-coffee-shop.js';

// Type definitions
interface ProblemItem {
  icon: string;
  title: string;
  description: string;
}

interface ConceptSection {
  title: string;
  subtitle?: string;
  problems: readonly ProblemItem[];
}

class StateMachineConceptsEnhanced extends HTMLElement {
  private static readonly PROBLEM_DATA: readonly ProblemItem[] = [
    {
      icon: '⏰',
      title: '"This Should Take 2 Days..."',
      description: '...turns into 2 weeks because changing one component breaks three others. Every feature becomes an archaeological dig through scattered state logic.'
    },
    {
      icon: '🐛',
      title: '"It Works on My Machine"',
      description: 'Race conditions that only happen in production. Edge cases you never tested. Users finding impossible states that crash your app.'
    },
    {
      icon: '😤',
      title: '"Who Wrote This Code?"',
      description: '(It was you, 6 months ago.) State scattered across 12 useEffects, boolean flags everywhere, and logic that makes senior devs cry.'
    },
    {
      icon: '🔥',
      title: '"Just Ship It"',
      description: 'Technical debt piling up. New developers afraid to touch anything. Features taking longer and longer to ship as complexity grows.'
    }
  ] as const;

  private static readonly TRANSITION_TEXT = {
    bridge: 'You want to ship features faster? Let\'s talk about what\'s really slowing you down...',
    solution: 'What if your state logic was visual, predictable, and impossible to break?',
    leadIn: 'Let me show you a better way...'
  } as const;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
  }

  private renderProblemItem(problem: ProblemItem): string {
    return `
      <div class="problem-item">
        <div class="problem-gradient"></div>
        <h4>${problem.icon} ${this.escapeHtml(problem.title)}</h4>
        <p>${this.escapeHtml(problem.description)}</p>
      </div>
    `;
  }

  private renderProblemsGrid(): string {
    return `
      <div class="problem-grid">
        ${StateMachineConceptsEnhanced.PROBLEM_DATA.map(problem => this.renderProblemItem(problem)).join('')}
      </div>
    `;
  }

  private renderTransitionSection(): string {
    return `
      <div class="transition-section">
        <div class="transition-gradient"></div>
        <p class="transition-primary">
          ${this.escapeHtml(StateMachineConceptsEnhanced.TRANSITION_TEXT.solution)}
        </p>
        <p class="transition-secondary">
          ${this.escapeHtml(StateMachineConceptsEnhanced.TRANSITION_TEXT.leadIn)}
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
      
      <style>
        .problem-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin: 2rem 0;
        }
        
        .problem-item {
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%);
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        
        .problem-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--jasper), transparent);
          opacity: 0.4;
        }
        
        .problem-item h4 {
          color: var(--jasper-light);
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        
        .problem-item p {
          color: var(--teagreen);
          line-height: 1.6;
          margin: 0;
        }
        
        .transition-text {
          text-align: center;
          color: var(--jasper);
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }
        
        .transition-section {
          text-align: center;
          margin-top: 3rem;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%);
          border-radius: 16px;
          border: 1px solid rgba(13, 153, 255, 0.2);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        
        .transition-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--jasper), transparent);
          opacity: 0.4;
        }
        
        .transition-primary {
          color: var(--teagreen);
          font-size: 1.2rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        .transition-secondary {
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .problem-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
      
      <div class="container">
        <!-- Bridge from Level 1 to Level 2 -->
        <p class="transition-text">
          ${this.escapeHtml(StateMachineConceptsEnhanced.TRANSITION_TEXT.bridge)}
        </p>
        
        <!-- Clear problem statements -->
        <div class="problems-list">
          <h3 class="concept-title">🚨 The Daily Struggles You Know Too Well</h3>
          
          ${this.renderProblemsGrid()}
        </div>

        <div class="concept-section">
          <h3 class="concept-title">💻 Here's What Your Code Probably Looks Like</h3>
          <p class="concept-description">
            Sound familiar? You're not alone. Here's the typical useState/useEffect chaos 
            that's slowing down teams everywhere:
          </p>
          
          <chaos-coffee-shop-code></chaos-coffee-shop-code>
        </div>

        <!-- Transition to solution -->
        ${this.renderTransitionSection()}
      </div>
    `;
  }

  // Public API for external interactions
  public getProblemsData(): readonly ProblemItem[] {
    return StateMachineConceptsEnhanced.PROBLEM_DATA;
  }

  public getTransitionText(): typeof StateMachineConceptsEnhanced.TRANSITION_TEXT {
    return { ...StateMachineConceptsEnhanced.TRANSITION_TEXT };
  }

  public getProblemCount(): number {
    return StateMachineConceptsEnhanced.PROBLEM_DATA.length;
  }

  public getProblemByIndex(index: number): ProblemItem | null {
    return StateMachineConceptsEnhanced.PROBLEM_DATA[index] || null;
  }

  public findProblemsByKeyword(keyword: string): ProblemItem[] {
    const searchTerm = keyword.toLowerCase();
    return StateMachineConceptsEnhanced.PROBLEM_DATA.filter(problem =>
      problem.title.toLowerCase().includes(searchTerm) ||
      problem.description.toLowerCase().includes(searchTerm)
    );
  }
}

// Define the custom element
if (!customElements.get('state-machine-concepts-enhanced')) {
  customElements.define('state-machine-concepts-enhanced', StateMachineConceptsEnhanced);
}

export { StateMachineConceptsEnhanced };
export type { ProblemItem, ConceptSection }; 
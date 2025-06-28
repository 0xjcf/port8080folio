import '../ui/project-card.js';

class ProjectsSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.projects = [
      {
        emoji: '🦀',
        title: 'Lit-Bit',
        problem: 'Building state machines in Rust that work on both tiny microcontrollers AND cloud servers? That\'s a nightmare.',
        solution: 'Created a Rust statechart library inspired by XState that runs everywhere from RISC-V chips to AWS',
        impact: 'Zero-cost abstractions mean the same code works on a $2 chip or a cloud server!',
        techStack: ['Rust', 'Embassy', 'Tokio', 'RISC-V', 'ARM Cortex-M'],
        codeUrl: 'https://github.com/0xjcf/lit-bit'
      },
      {
        emoji: '⚡',
        title: 'Ignite-Element',
        problem: 'Teams kept fighting over state management libraries. Redux vs MobX vs XState debates were endless.',
        solution: 'Built a library that lets you use ANY state management with web components seamlessly',
        impact: 'Teams can now choose their favorite state solution without rewriting components!',
        techStack: ['TypeScript', 'Web Components', 'Redux', 'MobX', 'XState'],
        codeUrl: 'https://github.com/0xjcf/ignite-element',
        demoUrl: 'https://joseflores.gitbook.io/ignite-element/'
      },
      {
        emoji: '🌲',
        title: 'Pine Script Syntax',
        problem: 'TradingView\'s Pine Script had zero syntax highlighting in VSCode. Plus most themes hurt my eyes.',
        solution: 'Built a VSCode extension with 4 custom themes, including colorblind-friendly options with WCAG AA compliance',
        impact: 'Thousands of traders can now code without squinting!',
        techStack: ['VSCode Extension', 'TextMate Grammar', 'WCAG Accessibility'],
        codeUrl: 'https://github.com/0xjcf/pine-script-syntax',
        demoUrl: 'https://marketplace.visualstudio.com/items?itemName=0xjcf.pine-script-syntax'
      }
    ];
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
        }
        
        .projects-container {
          width: 100%;
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        @media (min-width: 768px) {
          .section-header {
            margin-bottom: 3rem;
          }
        }
        
        h2 {
          font-size: 1.75rem;
          color: var(--heading-color, #FFFFFF);
          margin: 0 0 1rem 0;
          font-weight: 700;
          line-height: 1.2;
        }
        
        @media (min-width: 768px) {
          h2 {
            font-size: 2.5rem;
          }
        }
        
        .section-subtitle {
          font-size: 1rem;
          color: var(--teagreen, #F5F5F5);
          margin: 0;
          line-height: 1.5;
          padding: 0 1rem;
        }
        
        @media (min-width: 768px) {
          .section-subtitle {
            font-size: 1.25rem;
            line-height: 1.6;
            padding: 0;
          }
        }
        
        .projects-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 4rem;
          width: 100%;
        }
        
        .view-all-container {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          position: relative;
          z-index: 10;
        }
        
        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: transparent;
          color: var(--jasper, #0D99FF);
          border: 2px solid var(--jasper, #0D99FF);
          border-radius: 8px;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        @media (min-width: 768px) {
          .view-all-link {
            padding: 1rem 2rem;
            font-size: 1.125rem;
          }
        }
        
        .view-all-link:hover {
          background: rgba(13, 153, 255, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 153, 255, 0.3);
        }
        
        .view-all-link::after {
          content: '→';
          transition: transform 0.3s ease;
        }
        
        .view-all-link:hover::after {
          transform: translateX(4px);
        }
        
        /* Media queries now inline with mobile-first approach */
      </style>
      
      <section class="projects-container">
        <div class="section-header">
          <h2>Projects That Actually Ship 🚢</h2>
          <p class="section-subtitle">
            Here's what happens when I spot a problem and can't help but fix it
          </p>
        </div>
        
        <div class="projects-grid">
          ${this.projects.map(project => `
            <project-card
              emoji="${project.emoji}"
              title="${project.title}"
              problem="${project.problem}"
              solution="${project.solution}"
              impact="${project.impact}"
              tech-stack="${project.techStack.join(',')}"
              ${project.demoUrl ? `demo-url="${project.demoUrl}"` : ''}
              code-url="${project.codeUrl}"
              ${project.blogUrl ? `blog-url="${project.blogUrl}"` : ''}
            ></project-card>
          `).join('')}
        </div>
        
        <div class="view-all-container">
          <a href="https://github.com/0xjcf" target="_blank" rel="noopener" class="view-all-link">
            See more on GitHub
          </a>
        </div>
      </section>
    `;
  }
}

customElements.define('projects-section', ProjectsSection);

export { ProjectsSection };
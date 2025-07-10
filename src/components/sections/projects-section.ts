import { setup } from 'xstate';
import { createComponent, css, html } from '../../framework/core/index.js';
import '../ui/project-card.js';

// Type definitions
export interface Project {
  emoji: string;
  title: string;
  problem: string;
  solution: string;
  impact: string;
  techStack: string[];
  codeUrl: string;
  demoUrl?: string;
  blogUrl?: string;
}

export interface ProjectCardAttributes {
  emoji: string;
  title: string;
  problem: string;
  solution: string;
  impact: string;
  'tech-stack': string;
  'demo-url'?: string;
  'code-url': string;
  'blog-url'?: string;
}

interface ProjectsContext {
  projects: readonly Project[];
  githubUrl: string;
}

// Static data
const PROJECTS_DATA: readonly Project[] = [
  {
    emoji: '🦀',
    title: 'Lit-Bit',
    problem:
      "Building state machines in Rust that work on both tiny microcontrollers AND cloud servers? That's a nightmare.",
    solution:
      'Created a Rust statechart library inspired by XState that runs everywhere from RISC-V chips to AWS',
    impact: 'Zero-cost abstractions mean the same code works on a $2 chip or a cloud server!',
    techStack: ['Rust', 'Embassy', 'Tokio', 'RISC-V', 'ARM Cortex-M'],
    codeUrl: 'https://github.com/0xjcf/lit-bit',
  },
  {
    emoji: '⚡',
    title: 'Ignite-Element',
    problem:
      'Teams kept fighting over state management libraries. Redux vs MobX vs XState debates were endless.',
    solution:
      'Built a library that lets you use ANY state management with web components seamlessly',
    impact: 'Teams can now choose their favorite state solution without rewriting components!',
    techStack: ['TypeScript', 'Web Components', 'Redux', 'MobX', 'XState'],
    codeUrl: 'https://github.com/0xjcf/ignite-element',
    demoUrl: 'https://joseflores.gitbook.io/ignite-element/',
  },
  {
    emoji: '🌲',
    title: 'Pine Script Syntax',
    problem:
      "TradingView's Pine Script had zero syntax highlighting in VSCode. Plus most themes hurt my eyes.",
    solution:
      'Built a VSCode extension with 4 custom themes, including colorblind-friendly options with WCAG AA compliance',
    impact: 'Thousands of traders can now code without squinting!',
    techStack: ['VSCode Extension', 'TextMate Grammar', 'WCAG Accessibility'],
    codeUrl: 'https://github.com/0xjcf/pine-script-syntax',
    demoUrl: 'https://marketplace.visualstudio.com/items?itemName=0xjcf.pine-script-syntax',
  },
] as const;

// XState machine
const projectsMachine = setup({
  types: {
    context: {} as ProjectsContext,
    events: {} as { type: 'NOOP' }, // Minimal event type for static component
  },
}).createMachine({
  id: 'projects',
  initial: 'idle',
  context: {
    projects: PROJECTS_DATA,
    githubUrl: 'https://github.com/0xjcf',
  },
  states: {
    idle: {},
  },
});

// Helper function to build attributes object
const buildProjectAttributes = (project: Project): ProjectCardAttributes => {
  const baseAttributes: ProjectCardAttributes = {
    emoji: project.emoji,
    title: project.title,
    problem: project.problem,
    solution: project.solution,
    impact: project.impact,
    'tech-stack': project.techStack.join(','),
    'code-url': project.codeUrl,
  };

  if (project.demoUrl) {
    baseAttributes['demo-url'] = project.demoUrl;
  }

  if (project.blogUrl) {
    baseAttributes['blog-url'] = project.blogUrl;
  }

  return baseAttributes;
};

// Helper function to render project card
const renderProjectCard = (project: Project) => {
  const attrs = buildProjectAttributes(project);

  return html`
    <project-card 
      emoji=${attrs.emoji}
      title=${attrs.title}
      problem=${attrs.problem}
      solution=${attrs.solution}
      impact=${attrs.impact}
      tech-stack=${attrs['tech-stack']}
      code-url=${attrs['code-url']}
      ${attrs['demo-url'] && `demo-url="${attrs['demo-url']}"`}
      ${attrs['blog-url'] && `blog-url="${attrs['blog-url']}"`}
    ></project-card>
  `;
};

// Template function
const template = (state: { context: ProjectsContext }) => html`
  <section class="projects-container">
    <div class="section-header">
      <h2>Projects That Actually Ship 🚢</h2>
      <p class="section-subtitle">
        Here's what happens when I spot a problem and can't help but fix it
      </p>
    </div>
    
    <div class="projects-grid">
      ${state.context.projects.map((project: Project) => renderProjectCard(project))}
    </div>
    
    <div class="view-all-container">
      <a href=${state.context.githubUrl} target="_blank" rel="noopener" class="view-all-link">
        See more on GitHub
      </a>
    </div>
  </section>
`;

// Styles
const styles = css`
  :host {
    display: block;
    width: 100%;
  }
  
  .projects-container {
    width: 100%;
  }
  
  /* Use consistent section header styling */
  .section-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .section-header h2 {
    font-size: 2.5rem;
    color: var(--heading-color, #FFFFFF);
    margin: 0 0 1rem 0;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .section-subtitle {
    font-size: 1.25rem;
    color: var(--teagreen, #F5F5F5);
    margin: 0;
    line-height: 1.6;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    opacity: 0.9;
  }
  
  @media (min-width: 768px) {
    .section-header h2 {
      font-size: 3rem;
    }
    
    .section-subtitle {
      font-size: 1.3rem;
      line-height: 1.7;
    }
  }
  
  @media (max-width: 850px) {
    .section-header h2 {
      font-size: 2rem;
    }
    
    .section-subtitle {
      font-size: 1.1rem;
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
`;

// Create component using framework
const ProjectsSectionComponent = createComponent({
  machine: projectsMachine,
  template,
  styles,
  tagName: 'projects-section',
});

// Export component
export { ProjectsSectionComponent };

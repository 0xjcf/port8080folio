import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, css, html, safeDeserialize } from '../../framework/core/index.js';

// ✅ FRAMEWORK: Global window interface for framework integration
declare global {
  interface Window {
    globalEventBus?: {
      emit(event: string, data?: unknown): void;
      on(event: string, callback: (data: unknown) => void): void;
    };
  }
}

// Type definitions
interface ProjectData {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  image?: string;
  status: 'completed' | 'in-progress' | 'planned';
}

interface ProjectCardOptions {
  showTechnologies: boolean;
  showStatus: boolean;
  clickable: boolean;
}

interface ProjectCardContext {
  project: ProjectData | null;
  options: ProjectCardOptions;
  error: string | null;
}

// Project Card Machine
const projectCardMachine = setup({
  types: {
    context: {} as ProjectCardContext,
    events: {} as
      | { type: 'LOAD_PROJECT'; projectData: string }
      | { type: 'UPDATE_OPTIONS'; options: Partial<ProjectCardOptions> }
      | { type: 'CARD_CLICK'; target: string }
      | { type: 'PROJECT_LINK_CLICK'; url: string },
  },
  guards: {
    hasProject: ({ context }) => context.project !== null,
    isClickable: ({ context }) => context.options.clickable,
    hasLink: ({ context }) => context.project?.link !== undefined,
    isNotLinkTarget: ({ event }) => {
      return event.type === 'CARD_CLICK' && event.target !== 'A';
    },
  },
  actions: {
    loadProjectData: assign({
      project: ({ event }) => {
        if (event.type === 'LOAD_PROJECT') {
          try {
            return safeDeserialize<ProjectData>(event.projectData);
          } catch (_error) {
            return null;
          }
        }
        return null;
      },
      error: ({ event }) => {
        if (event.type === 'LOAD_PROJECT') {
          try {
            safeDeserialize<ProjectData>(event.projectData);
            return null;
          } catch (_error) {
            return 'Invalid project data format';
          }
        }
        return null;
      },
    }),

    updateOptions: assign({
      options: ({ context, event }) => {
        if (event.type === 'UPDATE_OPTIONS') {
          return { ...context.options, ...event.options };
        }
        return context.options;
      },
    }),

    // ✅ REPLACED: Framework event bus instead of DOM manipulation
    dispatchProjectSelected: ({ context }) => {
      if (context.project) {
        // ✅ FRAMEWORK: Use framework event bus for project selection instead of DOM manipulation
        if (typeof window !== 'undefined' && window.globalEventBus) {
          window.globalEventBus.emit('project-selected', {
            project: context.project,
            componentId: 'project-card',
            timestamp: Date.now(),
            source: 'project-card',
          });
        }
      }
    },

    navigateToProject: ({ context }) => {
      if (context.project?.link) {
        window.open(context.project.link, '_blank', 'noopener');
      }
    },
  },
}).createMachine({
  id: 'project-card',
  initial: 'idle',
  context: {
    project: null,
    options: {
      showTechnologies: true,
      showStatus: true,
      clickable: true,
    },
    error: null,
  },
  states: {
    idle: {
      on: {
        LOAD_PROJECT: {
          actions: 'loadProjectData',
        },
        UPDATE_OPTIONS: {
          actions: 'updateOptions',
        },
        CARD_CLICK: {
          guard: 'isClickable',
          actions: ['dispatchProjectSelected', 'navigateToProject'],
        },
        PROJECT_LINK_CLICK: {
          // Links handle their own navigation
        },
      },
    },
  },
});

// ✅ EXTRACTED: Technology tag template to reduce nesting depth
const technologyTagTemplate = (tech: string) => html`
  <span class="tech-tag">${tech}</span>
`;

// ✅ EXTRACTED: Template Helper Functions (reduced nesting depth)
const technologiesTemplate = (technologies: string[], show: boolean) => {
  if (!show || technologies.length === 0) return '';

  return html`
    <div class="project-technologies">
      ${technologies.map(technologyTagTemplate)}
    </div>
  `;
};

const statusClassMap = {
  completed: 'status-completed',
  'in-progress': 'status-in-progress',
  planned: 'status-planned',
} as const;

const statusDisplayMap = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  planned: 'Planned',
} as const;

const projectImageTemplate = (project: ProjectData) => {
  if (!project.image) return '';

  return html`
    <img 
      src=${project.image}
      alt=${project.title}
      class="project-image"
      loading="lazy"
    />
  `;
};

const statusTemplate = (status: ProjectData['status'], show: boolean) => {
  if (!show) return '';

  return html`
    <span class="project-status ${statusClassMap[status]}">
      ${statusDisplayMap[status]}
    </span>
  `;
};

const projectLinkTemplate = (link: string | undefined) => {
  if (!link) return '';

  return html`
    <a 
      href=${link}
      target="_blank" 
      rel="noopener"
      class="project-link"
      send="PROJECT_LINK_CLICK"
      url=${link}
    >
      View Project →
    </a>
  `;
};

// Component Styles
const projectCardStyles = css`
  :host {
    display: block;
  }
  
  .project-card {
    background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%);
    border: 1px solid rgba(13, 153, 255, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }
  
  .project-card[role="article"] {
    cursor: default;
  }
  
  .project-card::before {
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
  
  .project-card:hover {
    transform: translateY(-4px);
    border-color: rgba(13, 153, 255, 0.4);
    background: linear-gradient(135deg, rgba(13, 153, 255, 0.08) 0%, rgba(13, 153, 255, 0.04) 100%);
    box-shadow: 0 8px 24px rgba(13, 153, 255, 0.2);
  }
  
  .project-card:hover::before {
    opacity: 0.6;
  }
  
  .project-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  .project-title {
    color: var(--jasper, #0D99FF);
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }
  
  .project-description {
    color: var(--teagreen, #F5F5F5);
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0 0 1rem 0;
    opacity: 0.9;
  }
  
  .project-technologies {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }
  
  .tech-tag {
    background: rgba(13, 153, 255, 0.1);
    border: 1px solid rgba(13, 153, 255, 0.3);
    border-radius: 20px;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    color: var(--jasper-light, #47B4FF);
    font-weight: 500;
  }
  
  .project-status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .status-completed {
    background: rgba(46, 213, 115, 0.1);
    border: 1px solid rgba(46, 213, 115, 0.3);
    color: rgba(46, 213, 115, 0.9);
  }
  
  .status-in-progress {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
    color: rgba(255, 193, 7, 0.9);
  }
  
  .status-planned {
    background: rgba(255, 87, 87, 0.1);
    border: 1px solid rgba(255, 87, 87, 0.3);
    color: rgba(255, 87, 87, 0.9);
  }
  
  .project-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }
  
  .project-link {
    color: var(--jasper, #0D99FF);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s ease;
  }
  
  .project-link:hover {
    opacity: 0.8;
  }
  
  .error,
  .empty {
    text-align: center;
    padding: 2rem;
    color: #666;
    border: 1px dashed #ccc;
    border-radius: 8px;
  }
  
  .error-message {
    color: #e74c3c;
    font-weight: 500;
  }
  
  .empty-message {
    color: #7f8c8d;
    font-style: italic;
  }
`;

// Main Template
const projectCardTemplate = (state: SnapshotFrom<typeof projectCardMachine>) => {
  const { project, options, error } = state.context;

  if (error) {
    return html`
      <div class="project-card error">
        <p class="error-message">Error: ${error}</p>
      </div>
    `;
  }

  if (!project) {
    return html`
      <div class="project-card empty">
        <p class="empty-message">No project data available</p>
      </div>
    `;
  }

  return html`
    <div 
      class="project-card"
      send="CARD_CLICK"
      role=${options.clickable ? 'button' : 'article'}
      tabindex=${options.clickable ? '0' : '-1'}
    >
      ${projectImageTemplate(project)}
      
      <h3 class="project-title">${project.title}</h3>
      <p class="project-description">${project.description}</p>
      
      ${technologiesTemplate(project.technologies, options.showTechnologies)}
      
      <div class="project-footer">
        ${statusTemplate(project.status, options.showStatus)}
        ${projectLinkTemplate(project.link)}
      </div>
    </div>
  `;
};

// Create the component
const ProjectCardComponent = createComponent({
  machine: projectCardMachine,
  template: projectCardTemplate,
  styles: projectCardStyles,
  tagName: 'project-card',
});

// Enhanced component with attribute observation
class EnhancedProjectCard extends ProjectCardComponent {
  static get observedAttributes(): string[] {
    return ['data-project', 'show-technologies', 'show-status', 'clickable'];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'data-project':
        if (newValue) {
          this.send({ type: 'LOAD_PROJECT', projectData: newValue });
        }
        break;
      case 'show-technologies':
      case 'show-status':
      case 'clickable':
        // Use newValue from the callback instead of getAttribute
        this.send({
          type: 'UPDATE_OPTIONS',
          options: {
            showTechnologies: newValue !== 'false',
            showStatus: newValue !== 'false',
            clickable: newValue !== 'false',
          },
        });
        break;
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Use initial state defaults instead of DOM attributes
    const currentState = this.getCurrentState();
    const { project, options } = currentState.context;

    // Load initial configuration using state defaults
    this.send({
      type: 'UPDATE_OPTIONS',
      options: {
        showTechnologies: options.showTechnologies,
        showStatus: options.showStatus,
        clickable: options.clickable,
      },
    });

    // If project data exists in state, no need to reload
    if (!project) {
      console.log('No project data in state - component ready for external data');
    }
  }

  // Public API methods
  public updateProject(project: ProjectData): void {
    this.send({
      type: 'LOAD_PROJECT',
      projectData: JSON.stringify(project),
    });
  }

  public getProject(): ProjectData | null {
    // Access the machine state through the actor reference
    const actor = (
      this as HTMLElement & { actor?: { getSnapshot: () => { context: { project: ProjectData } } } }
    ).actor;
    if (actor?.getSnapshot) {
      return actor.getSnapshot().context.project;
    }
    return null;
  }
}

// Register the enhanced component
customElements.define('project-card', EnhancedProjectCard);

export default EnhancedProjectCard;
export type { ProjectCardOptions, ProjectData };

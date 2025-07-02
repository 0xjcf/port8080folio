// TypeScript interfaces for Project Card component
interface ProjectData {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  image?: string;
  status: 'completed' | 'in-progress' | 'planned';
}

interface ProjectCardOptions {
  showTechnologies?: boolean;
  showStatus?: boolean;
  clickable?: boolean;
}

class ProjectCard extends HTMLElement {
  private project: ProjectData | null = null;
  private options: ProjectCardOptions;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.options = {
      showTechnologies: this.getAttribute('show-technologies') !== 'false',
      showStatus: this.getAttribute('show-status') !== 'false',
      clickable: this.getAttribute('clickable') !== 'false'
    };
  }

  static get observedAttributes(): string[] {
    return ['data-project', 'show-technologies', 'show-status', 'clickable'];
  }

  connectedCallback(): void {
    this.loadProjectData();
    this.render();
    this.addEventListeners();
  }

  disconnectedCallback(): void {
    this.removeEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      if (name === 'data-project') {
        this.loadProjectData();
      } else {
        this.updateOptions();
      }
      this.render();
    }
  }

  private updateOptions(): void {
    this.options = {
      showTechnologies: this.getAttribute('show-technologies') !== 'false',
      showStatus: this.getAttribute('show-status') !== 'false',
      clickable: this.getAttribute('clickable') !== 'false'
    };
  }

  private loadProjectData(): void {
    const projectAttr = this.getAttribute('data-project');
    if (projectAttr) {
      try {
        this.project = JSON.parse(projectAttr) as ProjectData;
      } catch (error) {
        console.error('Invalid project data:', error);
        this.project = null;
      }
    }
  }

  private render(): void {
    if (!this.shadowRoot || !this.project) return;

    this.shadowRoot.innerHTML = `
      <style>
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
          cursor: ${this.options.clickable ? 'pointer' : 'default'};
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
      </style>
      
      <div class="project-card">
        ${this.project.image ? `
          <img src="${this.escapeHtml(this.project.image)}" 
               alt="${this.escapeHtml(this.project.title)}" 
               class="project-image">
        ` : ''}
        
        <h3 class="project-title">${this.escapeHtml(this.project.title)}</h3>
        <p class="project-description">${this.escapeHtml(this.project.description)}</p>
        
        ${this.options.showTechnologies && this.project.technologies.length > 0 ? `
          <div class="project-technologies">
            ${this.project.technologies.map(tech => 
              `<span class="tech-tag">${this.escapeHtml(tech)}</span>`
            ).join('')}
          </div>
        ` : ''}
        
        <div class="project-footer">
          ${this.options.showStatus ? `
            <span class="project-status status-${this.project.status}">
              ${this.project.status.replace('-', ' ')}
            </span>
          ` : ''}
          
          ${this.project.link ? `
            <a href="${this.escapeHtml(this.project.link)}" 
               target="_blank" 
               rel="noopener"
               style="color: var(--jasper, #0D99FF); text-decoration: none; font-weight: 500;">
              View Project →
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  private addEventListeners(): void {
    if (!this.shadowRoot || !this.options.clickable) return;

    const card = this.shadowRoot.querySelector('.project-card');
    if (card) {
      card.addEventListener('click', this.handleCardClick.bind(this));
    }
  }

  private removeEventListeners(): void {
    if (!this.shadowRoot) return;

    const card = this.shadowRoot.querySelector('.project-card');
    if (card) {
      card.removeEventListener('click', this.handleCardClick.bind(this));
    }
  }

  private handleCardClick(event: Event): void {
    if (!this.project) return;

    // Don't trigger card click if clicking on a link
    const target = event.target as HTMLElement;
    if (target.tagName === 'A') return;

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('project-selected', {
      detail: { project: this.project },
      bubbles: true
    }));

    // Navigate to project link if available
    if (this.project.link) {
      window.open(this.project.link, '_blank', 'noopener');
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API methods
  public updateProject(project: ProjectData): void {
    this.project = project;
    this.render();
  }

  public getProject(): ProjectData | null {
    return this.project;
  }
}

// Register the custom element
customElements.define('project-card', ProjectCard);

export default ProjectCard; 
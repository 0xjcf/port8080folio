class ProjectCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['emoji', 'title', 'problem', 'solution', 'impact', 'tech-stack', 'demo-url', 'code-url', 'blog-url'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) {
      this.render();
    }
  }

  render() {
    const emoji = this.getAttribute('emoji') || '🚀';
    const title = this.getAttribute('title') || 'Project Title';
    const problem = this.getAttribute('problem') || '';
    const solution = this.getAttribute('solution') || '';
    const impact = this.getAttribute('impact') || '';
    const techStack = this.getAttribute('tech-stack')?.split(',') || [];
    const demoUrl = this.getAttribute('demo-url');
    const codeUrl = this.getAttribute('code-url');
    const blogUrl = this.getAttribute('blog-url');

    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
        }
        
        :host {
          display: block;
          width: 100%;
          container-type: inline-size;
        }
        
        .project-card {
          background: rgba(15, 17, 21, 0.8);
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 8px;
          padding: 1.25rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
        }
        
        @media (min-width: 768px) {
          .project-card {
            border-radius: 12px;
            padding: 2rem;
            gap: 1.5rem;
          }
        }
        
        .project-card:hover {
          transform: translateY(-4px);
          border-color: rgba(13, 153, 255, 0.5);
          box-shadow: 0 8px 24px rgba(13, 153, 255, 0.15);
        }
        
        .project-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .project-emoji {
          font-size: 2rem;
          line-height: 1;
        }
        
        @media (min-width: 768px) {
          .project-emoji {
            font-size: 2.5rem;
          }
        }
        
        h3 {
          margin: 0;
          color: var(--heading-color, #FFFFFF);
          font-size: 1.25rem;
          font-weight: 700;
          flex: 1;
          line-height: 1.3;
        }
        
        @media (min-width: 768px) {
          h3 {
            font-size: 1.5rem;
          }
        }
        
        .story-points {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }
        
        .story-point {
          background: rgba(13, 153, 255, 0.05);
          border-radius: 6px;
          padding: 0.75rem;
          border-left: 3px solid var(--jasper, #0D99FF);
          width: 100%;
          box-sizing: border-box;
        }
        
        @media (min-width: 768px) {
          .story-point {
            border-radius: 8px;
            padding: 1rem;
          }
        }
        
        .story-point h4 {
          margin: 0 0 0.5rem 0;
          color: var(--jasper, #0D99FF);
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          word-wrap: break-word;
        }
        
        .story-point p {
          margin: 0;
          color: var(--teagreen, #F5F5F5);
          font-size: 0.9rem;
          line-height: 1.4;
          word-wrap: break-word;
        }
        
        @media (min-width: 768px) {
          .story-point p {
            font-size: 1rem;
            line-height: 1.5;
          }
        }
        
        .tech-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: auto;
        }
        
        .tech-badge {
          background: rgba(13, 153, 255, 0.1);
          color: var(--jasper-light, #47B4FF);
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.75rem;
          border: 1px solid rgba(13, 153, 255, 0.3);
          transition: all 0.2s ease;
        }
        
        @media (min-width: 768px) {
          .tech-badge {
            padding: 0.25rem 0.75rem;
            font-size: 0.875rem;
          }
        }
        
        .tech-badge:hover {
          background: rgba(13, 153, 255, 0.2);
          transform: translateY(-1px);
        }
        
        .project-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 0.75rem;
        }
        
        @media (min-width: 768px) {
          .project-links {
            gap: 1rem;
            margin-top: 1rem;
          }
        }
        
        .project-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          background: transparent;
          color: var(--jasper, #0D99FF);
          border: 1px solid var(--jasper, #0D99FF);
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.3s ease;
          flex: 1;
          justify-content: center;
          min-width: 0;
        }
        
        @media (min-width: 480px) {
          .project-link {
            flex: initial;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
        }
        
        .project-link:hover {
          background: rgba(13, 153, 255, 0.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(13, 153, 255, 0.2);
        }
        
        .project-link::after {
          content: '→';
          transition: transform 0.3s ease;
        }
        
        .project-link:hover::after {
          transform: translateX(3px);
        }
        
        /* Additional mobile adjustments */
        @media (max-width: 480px) {
          .project-header {
            flex-direction: column;
            text-align: center;
            align-items: center;
            gap: 0.5rem;
          }
          
          .story-points {
            gap: 0.75rem;
          }
        }
      </style>
      
      <article class="project-card">
        <div class="project-header">
          <span class="project-emoji">${emoji}</span>
          <h3>${title}</h3>
        </div>
        
        <div class="story-points">
          ${problem ? `
            <div class="story-point">
              <h4>The "Oh No" Moment</h4>
              <p>${problem}</p>
            </div>
          ` : ''}
          
          ${solution ? `
            <div class="story-point">
              <h4>The Fix</h4>
              <p>${solution}</p>
            </div>
          ` : ''}
          
          ${impact ? `
            <div class="story-point">
              <h4>The Win</h4>
              <p>${impact}</p>
            </div>
          ` : ''}
        </div>
        
        ${techStack.length > 0 ? `
          <div class="tech-badges">
            ${techStack.map(tech => `
              <span class="tech-badge">${tech.trim()}</span>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="project-links">
          ${demoUrl ? `
            <a href="${demoUrl}" class="project-link" target="_blank" rel="noopener">
              Demo
            </a>
          ` : ''}
          ${codeUrl ? `
            <a href="${codeUrl}" class="project-link" target="_blank" rel="noopener">
              Code
            </a>
          ` : ''}
          ${blogUrl ? `
            <a href="${blogUrl}" class="project-link" target="_blank" rel="noopener">
              Blog Post
            </a>
          ` : ''}
        </div>
      </article>
    `;
  }
}

customElements.define('project-card', ProjectCard);

export { ProjectCard };
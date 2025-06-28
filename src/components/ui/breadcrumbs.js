class Breadcrumbs extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    generateBreadcrumbs() {
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(part => part !== '');

        // Start with home
        const breadcrumbs = [{ name: 'Home', path: '/', current: pathParts.length === 0 }];

        // Build breadcrumb trail
        let currentPath = '';
        pathParts.forEach((part, index) => {
            currentPath += `/${part}`;
            const isLast = index === pathParts.length - 1;

            // Convert path parts to readable names
            let name = part.charAt(0).toUpperCase() + part.slice(1);
            if (name === 'Resources') name = 'Resources';
            if (name === 'About') name = 'About';
            if (name === 'Blog') name = 'Blog';

            breadcrumbs.push({
                name,
                path: currentPath,
                current: isLast
            });
        });

        return breadcrumbs;
    }

    render() {
        const breadcrumbs = this.generateBreadcrumbs();

        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          margin: 1rem 0;
        }
        
        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 0;
          font-size: 0.9rem;
          color: var(--teagreen);
          opacity: 0.8;
        }
        
        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .breadcrumb-link {
          color: var(--teagreen);
          text-decoration: none;
          transition: all 0.3s ease;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }
        
        .breadcrumb-link:hover {
          color: var(--jasper);
          background: rgba(13, 153, 255, 0.1);
        }
        
        .breadcrumb-current {
          color: var(--jasper);
          font-weight: 500;
          padding: 0.25rem 0.5rem;
        }
        
        .separator {
          color: var(--teagreen);
          opacity: 0.5;
          margin: 0 0.25rem;
        }
        
        .home-icon {
          width: 16px;
          height: 16px;
          fill: currentColor;
          margin-right: 0.25rem;
        }
        
        @media (max-width: 480px) {
          .breadcrumbs {
            font-size: 0.8rem;
            padding: 0.5rem 0;
          }
          
          .breadcrumb-link,
          .breadcrumb-current {
            padding: 0.2rem 0.4rem;
          }
        }
      </style>
      
      <nav class="breadcrumbs" aria-label="Breadcrumb navigation">
        ${breadcrumbs.map((crumb, index) => `
          <div class="breadcrumb-item">
            ${index > 0 ? '<span class="separator">/</span>' : ''}
            ${crumb.current ?
                `<span class="breadcrumb-current" aria-current="page">
                ${index === 0 ? `
                  <svg class="home-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3L2 12H5V20H10V15H14V20H19V12H22L12 3Z" fill="currentColor"/>
                  </svg>
                ` : ''}
                ${crumb.name}
              </span>` :
                `<a href="${crumb.path}" class="breadcrumb-link">
                ${index === 0 ? `
                  <svg class="home-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3L2 12H5V20H10V15H14V20H19V12H22L12 3Z" fill="currentColor"/>
                  </svg>
                ` : ''}
                ${crumb.name}
              </a>`
            }
          </div>
        `).join('')}
      </nav>
    `;
    }
}

customElements.define('breadcrumb-nav', Breadcrumbs); 
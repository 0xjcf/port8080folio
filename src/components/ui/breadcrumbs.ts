// Type definitions
interface BreadcrumbItem {
  name: string;
  path: string;
  current: boolean;
}

type PageName = 'Home' | 'About' | 'Blog' | 'Resources' | 'Challenges';

interface PageMapping {
  [key: string]: PageName;
}

class Breadcrumbs extends HTMLElement {
  private readonly pageNames: PageMapping = {
    'resources': 'Resources',
    'about': 'About',
    'blog': 'Blog',
    'challenges': 'Challenges'
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
  }

  private generateBreadcrumbs(): BreadcrumbItem[] {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter((part: string) => part !== '');

    // Start with home
    const breadcrumbs: BreadcrumbItem[] = [{
      name: 'Home',
      path: '/',
      current: pathParts.length === 0
    }];

    // Build breadcrumb trail
    let currentPath = '';
    pathParts.forEach((part: string, index: number) => {
      currentPath += `/${part}`;
      const isLast = index === pathParts.length - 1;

      // Convert path parts to readable names
      const name = this.getPageName(part);

      breadcrumbs.push({
        name,
        path: currentPath,
        current: isLast
      });
    });

    return breadcrumbs;
  }

  private getPageName(pathPart: string): string {
    const cleanPart = pathPart.toLowerCase();
    return this.pageNames[cleanPart] || this.capitalizeFirst(pathPart);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private renderBreadcrumbItem(crumb: BreadcrumbItem, index: number): string {
    const separator = index > 0 ? '<span class="separator">/</span>' : '';
    const homeIcon = index === 0 ? this.renderHomeIcon() : '';

    if (crumb.current) {
      return `
        <div class="breadcrumb-item">
          ${separator}
          <span class="breadcrumb-current" aria-current="page">
            ${homeIcon}
            ${this.escapeHtml(crumb.name)}
          </span>
        </div>
      `;
    } else {
      return `
        <div class="breadcrumb-item">
          ${separator}
          <a href="${this.escapeAttribute(crumb.path)}" class="breadcrumb-link">
            ${homeIcon}
            ${this.escapeHtml(crumb.name)}
          </a>
        </div>
      `;
    }
  }

  private renderHomeIcon(): string {
    return `
      <svg class="home-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L2 12H5V20H10V15H14V20H19V12H22L12 3Z" fill="currentColor"/>
      </svg>
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

  private escapeAttribute(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private render(): void {
    const breadcrumbs = this.generateBreadcrumbs();

    this.shadowRoot!.innerHTML = `
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
        ${breadcrumbs.map((crumb, index) => this.renderBreadcrumbItem(crumb, index)).join('')}
      </nav>
    `;
  }

  // Public API for external interactions
  public getCurrentPath(): string {
    return window.location.pathname;
  }

  public getBreadcrumbs(): readonly BreadcrumbItem[] {
    return this.generateBreadcrumbs();
  }

  public updateForPath(newPath: string): void {
    // Temporarily change location for generation (for testing/preview)
    const originalPath = window.location.pathname;
    
    // Create a temporary location-like object
    const tempLocation = { pathname: newPath };
    const originalLocation = window.location;
    
    try {
      // Monkey patch for generation
      Object.defineProperty(window, 'location', {
        value: tempLocation,
        writable: true
      });
      
      this.render();
    } finally {
      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true
      });
    }
  }
}

// Define the custom element
if (!customElements.get('breadcrumb-nav')) {
  customElements.define('breadcrumb-nav', Breadcrumbs);
}

export { Breadcrumbs };
export type { BreadcrumbItem, PageName }; 
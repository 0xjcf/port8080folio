// Type definitions
interface RelatedItem {
  title: string;
  description: string;
  url: string;
  type: ContentType;
  icon: string;
}

type ContentType = 
  | 'Guide' 
  | 'Story' 
  | 'Articles' 
  | 'Resources' 
  | 'Blog' 
  | 'Demo' 
  | 'About';

interface RelatedContentData {
  title: string;
  items: readonly RelatedItem[];
}

type SitePath = '/' | '/about/' | '/blog/' | '/resources/';

interface RelatedContentMap {
  readonly [key: string]: RelatedContentData;
}

// Custom event for analytics tracking
interface RelatedItemClickEvent extends CustomEvent {
  detail: {
    title: string;
    type: ContentType;
    url: string;
    source: 'related-content';
  };
}

class RelatedContent extends HTMLElement {
  private currentPath: string;
  private contentMap: RelatedContentMap;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentPath = window.location.pathname;
    this.contentMap = this.initializeContentMap();
  }

  connectedCallback(): void {
    this.render();
  }

  private initializeContentMap(): RelatedContentMap {
    return {
      '/': {
        title: 'Continue Learning',
        items: [
          {
            title: 'Deep Dive into State Machines',
            description: 'Comprehensive guide to understanding and implementing state machines',
            url: '/resources/',
            type: 'Guide',
            icon: '📚'
          },
          {
            title: 'Read My Story',
            description: 'How I went from 1,700-line monsters to clean, maintainable architectures',
            url: '/about/',
            type: 'Story',
            icon: '📖'
          },
          {
            title: 'Technical Articles',
            description: 'In-depth articles about frontend architecture and XState',
            url: '/blog/',
            type: 'Articles',
            icon: '✍️'
          }
        ] as const
      },
      '/about/': {
        title: 'Explore My Work',
        items: [
          {
            title: 'State Machine Resources',
            description: 'Tools, templates, and guides I\'ve created for the community',
            url: '/resources/',
            type: 'Resources',
            icon: '🛠️'
          },
          {
            title: 'Technical Insights',
            description: 'Read my latest articles on frontend architecture',
            url: '/blog/',
            type: 'Blog',
            icon: '💡'
          },
          {
            title: 'See the Coffee Shop Demo',
            description: 'Interactive demonstration of actor-based architecture',
            url: '/#state-machine-education',
            type: 'Demo',
            icon: '☕'
          }
        ] as const
      },
      '/blog/': {
        title: 'Related Resources',
        items: [
          {
            title: 'State Machine Mastery Guide',
            description: 'Interactive guide with code examples and best practices',
            url: '/resources/',
            type: 'Guide',
            icon: '🎯'
          },
          {
            title: 'My Background',
            description: 'Learn about my experience with complex frontend systems',
            url: '/about/',
            type: 'About',
            icon: '👨‍💻'
          },
          {
            title: 'Interactive Demo',
            description: 'See state machines in action with the coffee shop example',
            url: '/#state-machine-education',
            type: 'Demo',
            icon: '⚡'
          }
        ] as const
      },
      '/resources/': {
        title: 'More Ways to Learn',
        items: [
          {
            title: 'Get Hands-On Experience',
            description: 'Try the interactive coffee shop demo to see concepts in action',
            url: '/#state-machine-education',
            type: 'Demo',
            icon: '🚀'
          },
          {
            title: 'Read Technical Articles',
            description: 'Deep-dive articles on real-world implementations',
            url: '/blog/',
            type: 'Articles',
            icon: '📝'
          },
          {
            title: 'Learn About My Approach',
            description: 'Discover how I help teams build maintainable systems',
            url: '/about/',
            type: 'Story',
            icon: '🎨'
          }
        ] as const
      }
    } as const;
  }

  private getRelatedContent(): RelatedContentData {
    return this.contentMap[this.currentPath] || this.contentMap['/'];
  }

  private handleItemClick(item: RelatedItem): void {
    // Dispatch custom event for analytics tracking
    const event: RelatedItemClickEvent = new CustomEvent('related-item-clicked', {
      detail: {
        title: item.title,
        type: item.type,
        url: item.url,
        source: 'related-content'
      },
      bubbles: true,
      composed: true
    }) as RelatedItemClickEvent;

    this.dispatchEvent(event);

    // Navigate to the URL
    window.location.href = item.url;
  }

  private renderRelatedItem(item: RelatedItem): string {
    return `
      <div class="related-item" data-url="${this.escapeAttribute(item.url)}" 
           data-title="${this.escapeAttribute(item.title)}"
           data-type="${this.escapeAttribute(item.type)}">
        <div class="item-header">
          <div class="item-icon">${item.icon}</div>
          <div class="item-type">${this.escapeHtml(item.type)}</div>
        </div>
        <h3 class="item-title">${this.escapeHtml(item.title)}</h3>
        <p class="item-description">${this.escapeHtml(item.description)}</p>
      </div>
    `;
  }

  private setupEventListeners(): void {
    this.shadowRoot!.querySelectorAll('.related-item').forEach(itemElement => {
      itemElement.addEventListener('click', () => {
        const element = itemElement as HTMLElement;
        const url = element.dataset.url;
        const title = element.dataset.title;
        const type = element.dataset.type as ContentType;

        if (url && title && type) {
          const item: RelatedItem = {
            title,
            description: '', // Not needed for click tracking
            url,
            type,
            icon: '' // Not needed for click tracking
          };
          this.handleItemClick(item);
        }
      });
    });
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
    const content = this.getRelatedContent();

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          margin: 3rem 0 2rem;
        }
        
        .related-content {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.05) 0%, rgba(13, 153, 255, 0.02) 100%);
          border-radius: 16px;
          border: 1px solid rgba(13, 153, 255, 0.1);
        }
        
        .related-title {
          font-size: 1.8rem;
          color: var(--heading-color);
          margin: 0 0 1.5rem 0;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .related-icon {
          font-size: 1.5rem;
        }
        
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .related-item {
          background: rgba(15, 17, 21, 0.8);
          border: 1px solid rgba(13, 153, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .related-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--jasper), var(--jasper-light));
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .related-item:hover {
          transform: translateY(-4px);
          border-color: rgba(13, 153, 255, 0.3);
          box-shadow: 0 8px 32px rgba(13, 153, 255, 0.1);
        }
        
        .related-item:hover::before {
          opacity: 1;
        }
        
        .item-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .item-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(13, 153, 255, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(13, 153, 255, 0.2);
        }
        
        .item-type {
          background: rgba(13, 153, 255, 0.2);
          color: var(--jasper);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-left: auto;
        }
        
        .item-title {
          font-size: 1.2rem;
          color: var(--heading-color);
          margin: 0 0 0.75rem 0;
          font-weight: 600;
          line-height: 1.3;
        }
        
        .item-description {
          color: var(--teagreen);
          line-height: 1.5;
          margin: 0;
          opacity: 0.9;
        }
        
        .cta-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 2rem;
          padding: 1rem;
          background: rgba(13, 153, 255, 0.05);
          border-radius: 8px;
          color: var(--teagreen);
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .cta-arrow {
          color: var(--jasper);
          font-weight: bold;
        }
        
        @media (max-width: 768px) {
          .related-content {
            padding: 1.5rem;
            margin: 2rem 0 1rem;
          }
          
          .related-title {
            font-size: 1.5rem;
          }
          
          .related-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .related-item {
            padding: 1.25rem;
          }
          
          .item-title {
            font-size: 1.1rem;
          }
        }
        
        @media (max-width: 480px) {
          .related-content {
            padding: 1rem;
          }
          
          .item-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .item-type {
            align-self: flex-end;
          }
        }
      </style>
      
      <div class="related-content">
        <h2 class="related-title">
          <span class="related-icon">🔗</span>
          ${this.escapeHtml(content.title)}
        </h2>
        
        <div class="related-grid">
          ${content.items.map(item => this.renderRelatedItem(item)).join('')}
        </div>
        
        <div class="cta-hint">
          <span>Click any card to explore</span>
          <span class="cta-arrow">→</span>
        </div>
      </div>
    `;

    // Setup event listeners after rendering
    this.setupEventListeners();
  }

  // Public API for external interactions
  public getCurrentPath(): string {
    return this.currentPath;
  }

  public getContentForPath(path: SitePath): RelatedContentData {
    return this.contentMap[path] || this.contentMap['/'];
  }

  public getItemsByType(type: ContentType): RelatedItem[] {
    const allItems: RelatedItem[] = [];
    Object.values(this.contentMap).forEach(content => {
      allItems.push(...content.items.filter(item => item.type === type));
    });
    return allItems;
  }

  public refreshContent(): void {
    this.currentPath = window.location.pathname;
    this.render();
  }

  public getAllContentTypes(): ContentType[] {
    const types = new Set<ContentType>();
    Object.values(this.contentMap).forEach(content => {
      content.items.forEach(item => types.add(item.type));
    });
    return Array.from(types);
  }
}

// Define the custom element
if (!customElements.get('related-content')) {
  customElements.define('related-content', RelatedContent);
}

export { RelatedContent };
export type { 
  RelatedItem, 
  ContentType, 
  RelatedContentData, 
  SitePath, 
  RelatedContentMap,
  RelatedItemClickEvent 
}; 
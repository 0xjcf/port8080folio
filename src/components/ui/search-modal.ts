// Type definitions
interface SearchableItem {
  title: string;
  path: string;
  keywords: readonly string[];
}

interface SearchResult {
  title: string;
  path: string;
  keywords: readonly string[];
}

interface QuickLink {
  href: string;
  icon: string;
  text: string;
}

// Custom events
interface SearchModalOpenEvent extends CustomEvent {
  detail: {
    source: 'keyboard-shortcut' | 'button-click' | 'programmatic';
  };
}

interface SearchModalCloseEvent extends CustomEvent {
  detail: {
    source: 'escape-key' | 'overlay-click' | 'close-button' | 'result-selection' | 'programmatic';
    query?: string;
  };
}

interface SearchPerformedEvent extends CustomEvent {
  detail: {
    query: string;
    resultsCount: number;
    resultsPaths: string[];
  };
}

class SearchModal extends HTMLElement {
  private isOpen: boolean = false;
  private searchResults: SearchResult[] = [];
  private searchableContent: readonly SearchableItem[];
  private quickLinks: readonly QuickLink[];

  constructor() {
    super();
    this.isOpen = false;
    this.searchResults = [];
    this.searchableContent = this.initializeSearchableContent();
    this.quickLinks = this.initializeQuickLinks();
  }

  connectedCallback(): void {
    this.render();
    this.setupEventListeners();
  }

  private initializeSearchableContent(): readonly SearchableItem[] {
    return [
      { 
        title: 'Home', 
        path: '/port8080folio/', 
        keywords: ['home', 'main', 'portfolio', 'josé flores'] as const
      },
      { 
        title: 'About Me', 
        path: '/port8080folio/about/', 
        keywords: ['about', 'bio', 'experience', 'story'] as const
      },
      { 
        title: 'Blog', 
        path: '/port8080folio/blog/', 
        keywords: ['blog', 'articles', 'posts', 'writing'] as const
      },
      { 
        title: 'Resources', 
        path: '/port8080folio/resources/', 
        keywords: ['resources', 'tools', 'guides', 'state machines'] as const
      },
      { 
        title: 'XState Challenges', 
        path: '/port8080folio/challenges/', 
        keywords: ['xstate', 'challenges', 'learn', 'course'] as const
      },
      { 
        title: 'State Machine Guide', 
        path: '/port8080folio/resources/#state-machine-deep-dive', 
        keywords: ['state', 'machine', 'guide', 'tutorial'] as const
      },
      { 
        title: 'Coffee Shop Demo', 
        path: '/port8080folio/#coffee-shop-demo', 
        keywords: ['coffee', 'shop', 'demo', 'actor', 'model'] as const
      }
    ] as const;
  }

  private initializeQuickLinks(): readonly QuickLink[] {
    return [
      { href: '/port8080folio/', icon: '🏠', text: 'Home' },
      { href: '/port8080folio/about/', icon: '👤', text: 'About' },
      { href: '/port8080folio/blog/', icon: '📝', text: 'Blog' },
      { href: '/port8080folio/resources/', icon: '📚', text: 'Resources' },
      { href: '/port8080folio/challenges/', icon: '🎯', text: 'XState Challenges' }
    ] as const;
  }

  private render(): void {
    this.innerHTML = `
      <div class="search-modal-overlay" aria-hidden="true">
        <div class="search-modal-container" role="dialog" aria-modal="true" aria-label="Search">
          <div class="search-modal-header">
            <input 
              type="search" 
              class="search-modal-input" 
              placeholder="Search for pages, projects, or topics..."
              aria-label="Search input"
              autocomplete="off"
            />
            <button class="search-modal-close" aria-label="Close search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="search-modal-results">
            ${this.renderQuickLinks()}
          </div>
        </div>
      </div>
    `;
  }

  private renderQuickLinks(): string {
    return `
      <div class="search-hint">
        <p>Quick links:</p>
        <div class="quick-links">
          ${this.quickLinks.map(link => `
            <a href="${this.escapeAttribute(link.href)}" class="quick-link">
              <span class="quick-link-icon">${link.icon}</span>
              <span>${this.escapeHtml(link.text)}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    const overlay = this.querySelector('.search-modal-overlay') as HTMLElement;
    const container = this.querySelector('.search-modal-container') as HTMLElement;
    const closeBtn = this.querySelector('.search-modal-close') as HTMLButtonElement;
    const input = this.querySelector('.search-modal-input') as HTMLInputElement;

    // Close on overlay click
    overlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === overlay) {
        this.close('overlay-click');
      }
    });

    // Close button
    closeBtn.addEventListener('click', () => {
      this.close('close-button');
    });

    // Escape key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close('escape-key', input.value);
      }
    });

    // Search input
    input.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      this.handleSearch(target.value);
    });

    // Prevent form submission and handle Enter key
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Handle search result selection
        const firstResult = this.querySelector('.search-result') as HTMLElement;
        if (firstResult) {
          firstResult.click();
        }
      }
    });

    // Listen for open events
    document.addEventListener('search-toggle', () => {
      this.open('button-click');
    });
  }

  private open(source: 'keyboard-shortcut' | 'button-click' | 'programmatic' = 'programmatic'): void {
    this.isOpen = true;
    const overlay = this.querySelector('.search-modal-overlay') as HTMLElement;
    overlay.classList.add('active');

    // Focus input
    setTimeout(() => {
      const input = this.querySelector('.search-modal-input') as HTMLInputElement;
      input.focus();
    }, 100);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Dispatch custom event
    const event: SearchModalOpenEvent = new CustomEvent('search-modal-opened', {
      detail: { source },
      bubbles: true,
      composed: true
    }) as SearchModalOpenEvent;

    this.dispatchEvent(event);
  }

  private close(
    source: 'escape-key' | 'overlay-click' | 'close-button' | 'result-selection' | 'programmatic' = 'programmatic',
    query?: string
  ): void {
    this.isOpen = false;
    const overlay = this.querySelector('.search-modal-overlay') as HTMLElement;
    overlay.classList.remove('active');

    // Reset input
    const input = this.querySelector('.search-modal-input') as HTMLInputElement;
    input.value = '';
    this.handleSearch('');

    // Restore body scroll
    document.body.style.overflow = '';

    // Dispatch custom event
    const event: SearchModalCloseEvent = new CustomEvent('search-modal-closed', {
      detail: { source, query },
      bubbles: true,
      composed: true
    }) as SearchModalCloseEvent;

    this.dispatchEvent(event);
  }

  private handleSearch(query: string): void {
    const resultsContainer = this.querySelector('.search-modal-results') as HTMLElement;

    if (!query.trim()) {
      // Show quick links
      resultsContainer.innerHTML = this.renderQuickLinks();
      return;
    }

    // Simple search implementation
    const results = this.performSearch(query);

    if (results.length > 0) {
      resultsContainer.innerHTML = `
        <div class="search-results-list">
          ${results.map(result => `
            <a href="${this.escapeAttribute(result.path)}" class="search-result">
              <span class="search-result-title">${this.highlightMatch(result.title, query)}</span>
              <span class="search-result-path">${this.escapeHtml(result.path)}</span>
            </a>
          `).join('')}
        </div>
      `;

      // Add click handlers to results
      this.setupResultClickHandlers();
    } else {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          <p>No results found for "${this.escapeHtml(query)}"</p>
          <p class="search-suggestion">Try searching for: state machines, xstate, about, blog</p>
        </div>
      `;
    }

    // Dispatch search performed event
    const searchEvent: SearchPerformedEvent = new CustomEvent('search-performed', {
      detail: {
        query,
        resultsCount: results.length,
        resultsPaths: results.map(r => r.path)
      },
      bubbles: true,
      composed: true
    }) as SearchPerformedEvent;

    this.dispatchEvent(searchEvent);
  }

  private performSearch(query: string): SearchResult[] {
    const searchLower = query.toLowerCase();
    
    return this.searchableContent.filter((item: SearchableItem) => {
      return item.title.toLowerCase().includes(searchLower) ||
        item.keywords.some((keyword: string) => keyword.includes(searchLower));
    });
  }

  private setupResultClickHandlers(): void {
    const results = this.querySelectorAll('.search-result');
    results.forEach(result => {
      result.addEventListener('click', () => {
        this.close('result-selection');
      });
    });
  }

  private highlightMatch(text: string, query: string): string {
    if (!query) return this.escapeHtml(text);
    
    const escapedText = this.escapeHtml(text);
    const escapedQuery = this.escapeRegexChars(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<mark>$1</mark>');
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

  private escapeRegexChars(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Public API for external interactions
  public isModalOpen(): boolean {
    return this.isOpen;
  }

  public openModal(): void {
    this.open('programmatic');
  }

  public closeModal(): void {
    this.close('programmatic');
  }

  public search(query: string): SearchResult[] {
    return this.performSearch(query);
  }

  public getSearchableContent(): readonly SearchableItem[] {
    return this.searchableContent;
  }

  public getQuickLinks(): readonly QuickLink[] {
    return this.quickLinks;
  }

  public focusSearchInput(): void {
    const input = this.querySelector('.search-modal-input') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }

  public clearSearch(): void {
    const input = this.querySelector('.search-modal-input') as HTMLInputElement;
    if (input) {
      input.value = '';
      this.handleSearch('');
    }
  }
}

// Define the custom element
if (!customElements.get('search-modal')) {
  customElements.define('search-modal', SearchModal);
}

export default SearchModal;
export { SearchModal };
export type { 
  SearchableItem, 
  SearchResult, 
  QuickLink,
  SearchModalOpenEvent,
  SearchModalCloseEvent,
  SearchPerformedEvent
}; 
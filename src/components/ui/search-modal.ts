import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, css, html } from '../../framework/core/index.js';
import { devConfig } from '../../scripts/dev-config.js';

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

interface SearchModalContext {
  query: string;
  results: SearchResult[];
  searchableContent: readonly SearchableItem[];
  quickLinks: readonly QuickLink[];
  selectedIndex: number;
}

// ✅ FRAMEWORK: Component registry pattern instead of DOM queries
interface SearchModalInstance {
  send: (event: SearchModalEvent) => void;
  getSnapshot?: () => SnapshotFrom<typeof searchModalMachine>;
}

// Define the event type for the search modal
type SearchModalEvent =
  | { type: 'OPEN'; source?: 'keyboard-shortcut' | 'button-click' | 'programmatic' }
  | { type: 'CLOSE'; source?: string; query?: string }
  | { type: 'SEARCH'; query: string }
  | { type: 'SELECT_RESULT'; path: string }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'NAVIGATE_UP' }
  | { type: 'NAVIGATE_DOWN' }
  | { type: 'SELECT_CURRENT' };

// ✅ FRAMEWORK: Global component registry
declare global {
  interface Window {
    globalEventBus?: {
      emit(event: string, data?: unknown): void;
      on(event: string, callback: (data: unknown) => void): void;
    };
    // ✅ REPLACED: Component registry instead of querySelector
    searchModalRegistry?: {
      register: (instance: SearchModalInstance) => void;
      unregister: () => void;
      getInstance: () => SearchModalInstance | null;
    };
  }
}

// ✅ FRAMEWORK: Initialize component registry
if (typeof window !== 'undefined' && !window.searchModalRegistry) {
  let currentInstance: SearchModalInstance | null = null;

  window.searchModalRegistry = {
    register: (instance: SearchModalInstance) => {
      currentInstance = instance;
    },
    unregister: () => {
      currentInstance = null;
    },
    getInstance: () => currentInstance,
  };
}

// Search Modal Machine
const searchModalMachine = setup({
  types: {
    context: {} as SearchModalContext,
    events: {} as
      | { type: 'OPEN'; source?: 'keyboard-shortcut' | 'button-click' | 'programmatic' }
      | { type: 'CLOSE'; source?: string; query?: string }
      | { type: 'SEARCH'; query: string }
      | { type: 'SELECT_RESULT'; path: string }
      | { type: 'CLEAR_SEARCH' }
      | { type: 'NAVIGATE_UP' }
      | { type: 'NAVIGATE_DOWN' }
      | { type: 'SELECT_CURRENT' },
  },
  guards: {
    hasResults: ({ context }) => context.results.length > 0,
    hasQuery: ({ context }) => context.query.trim().length > 0,
  },
  actions: {
    setQuery: assign({
      query: ({ event }) => (event.type === 'SEARCH' ? event.query : ''),
      selectedIndex: 0, // Reset selection when searching
    }),

    performSearch: assign({
      results: ({ context, event }) => {
        if (event.type !== 'SEARCH' || !event.query.trim()) {
          return [];
        }

        const searchLower = event.query.toLowerCase();
        return context.searchableContent.filter((item: SearchableItem) => {
          return (
            item.title.toLowerCase().includes(searchLower) ||
            item.keywords.some((keyword: string) => keyword.includes(searchLower))
          );
        });
      },
      selectedIndex: 0,
    }),

    clearResults: assign({
      query: '',
      results: [],
      selectedIndex: 0,
    }),

    navigateUp: assign({
      selectedIndex: ({ context }) => {
        const maxIndex = Math.max(0, context.results.length - 1);
        return context.selectedIndex > 0 ? context.selectedIndex - 1 : maxIndex;
      },
    }),

    navigateDown: assign({
      selectedIndex: ({ context }) => {
        const maxIndex = Math.max(0, context.results.length - 1);
        return context.selectedIndex < maxIndex ? context.selectedIndex + 1 : 0;
      },
    }),

    // ✅ REPLACED: Use framework event bus instead of DOM queries
    dispatchOpenEvent: ({ event }) => {
      const source = event.type === 'OPEN' ? event.source || 'programmatic' : 'programmatic';
      // ✅ FRAMEWORK: Use global event bus for component communication
      if (typeof window !== 'undefined' && window.globalEventBus) {
        window.globalEventBus.emit('search-modal-opened', { source });
      }
      devConfig.log('Search modal opened:', { source });
    },

    // ✅ REPLACED: Use framework event bus instead of DOM queries
    dispatchCloseEvent: ({ event }) => {
      const source = event.type === 'CLOSE' ? event.source || 'programmatic' : 'programmatic';
      const query = event.type === 'CLOSE' ? event.query : undefined;
      // ✅ FRAMEWORK: Use global event bus for component communication
      if (typeof window !== 'undefined' && window.globalEventBus) {
        window.globalEventBus.emit('search-modal-closed', { source, query });
      }
      devConfig.log('Search modal closed:', { source, query });
    },

    // ✅ REPLACED: Use framework event bus instead of DOM queries
    dispatchSearchEvent: ({ context, event }) => {
      if (event.type === 'SEARCH') {
        // ✅ FRAMEWORK: Use global event bus for component communication
        if (typeof window !== 'undefined' && window.globalEventBus) {
          window.globalEventBus.emit('search-performed', {
            query: event.query,
            resultsCount: context.results.length,
            resultsPaths: context.results.map((r) => r.path),
          });
        }
        devConfig.log('Search performed:', {
          query: event.query,
          resultsCount: context.results.length,
        });
      }
    },

    // ✅ REPLACED: Use framework navigation instead of window.location.href
    navigateToResult: ({ context, event }) => {
      let path = '';

      if (event.type === 'SELECT_RESULT') {
        path = event.path;
      } else if (event.type === 'SELECT_CURRENT' && context.results.length > 0) {
        path = context.results[context.selectedIndex]?.path || '';
      }

      if (path) {
        // ✅ FRAMEWORK: Always use framework navigation
        if (typeof window !== 'undefined' && window.globalEventBus) {
          window.globalEventBus.emit('navigate-to', { url: path, source: 'search-modal' });
        }
        devConfig.log('Navigate request sent to framework:', path);
      }
    },
  },
}).createMachine({
  id: 'search-modal',
  initial: 'closed',
  context: {
    query: '',
    results: [],
    selectedIndex: 0,
    searchableContent: [
      {
        title: 'Home',
        path: '/port8080folio/',
        keywords: ['home', 'main', 'portfolio', 'josé flores'] as const,
      },
      {
        title: 'About Me',
        path: '/port8080folio/about/',
        keywords: ['about', 'bio', 'experience', 'story'] as const,
      },
      {
        title: 'Blog',
        path: '/port8080folio/blog/',
        keywords: ['blog', 'articles', 'posts', 'writing'] as const,
      },
      {
        title: 'Resources',
        path: '/port8080folio/resources/',
        keywords: ['resources', 'tools', 'guides', 'state machines'] as const,
      },
      {
        title: 'XState Challenges',
        path: '/port8080folio/challenges/',
        keywords: ['xstate', 'challenges', 'learn', 'course'] as const,
      },
      {
        title: 'State Machine Guide',
        path: '/port8080folio/resources/#state-machine-deep-dive',
        keywords: ['state', 'machine', 'guide', 'tutorial'] as const,
      },
      {
        title: 'Coffee Shop Demo',
        path: '/port8080folio/#coffee-shop-demo',
        keywords: ['coffee', 'shop', 'demo', 'actor', 'model'] as const,
      },
    ] as const,
    quickLinks: [
      { href: '/port8080folio/', icon: '🏠', text: 'Home' },
      { href: '/port8080folio/about/', icon: '👤', text: 'About' },
      { href: '/port8080folio/blog/', icon: '📝', text: 'Blog' },
      { href: '/port8080folio/resources/', icon: '📚', text: 'Resources' },
      { href: '/port8080folio/challenges/', icon: '🎯', text: 'XState Challenges' },
    ] as const,
  },
  states: {
    closed: {
      on: {
        OPEN: {
          target: 'opening',
          actions: 'dispatchOpenEvent',
        },
      },
    },
    opening: {
      after: {
        // Small delay for animation
        50: {
          target: 'open',
        },
      },
    },
    open: {
      on: {
        CLOSE: {
          target: 'closing',
          actions: 'dispatchCloseEvent',
        },
        SEARCH: {
          actions: ['setQuery', 'performSearch', 'dispatchSearchEvent'],
        },
        SELECT_RESULT: {
          target: 'closing',
          actions: ['navigateToResult', 'dispatchCloseEvent'],
        },
        CLEAR_SEARCH: {
          actions: 'clearResults',
        },
        NAVIGATE_UP: {
          guard: 'hasResults',
          actions: 'navigateUp',
        },
        NAVIGATE_DOWN: {
          guard: 'hasResults',
          actions: 'navigateDown',
        },
        SELECT_CURRENT: {
          target: 'closing',
          actions: ['navigateToResult', 'dispatchCloseEvent'],
        },
      },
    },
    closing: {
      after: {
        300: {
          target: 'closed',
          actions: 'clearResults',
        },
      },
    },
  },
});

// ✅ EXTRACTED: Quick link item template (fixes deep nesting)
const quickLinkItemTemplate = (link: QuickLink) => html`
  <a href=${link.href} class="quick-link" send="SELECT_RESULT" path=${link.href}>
    <span class="quick-link-icon">${link.icon}</span>
    <span>${link.text}</span>
  </a>
`;

// ✅ EXTRACTED: Template Helper Functions (reduced nesting depth)
const quickLinksTemplate = (quickLinks: readonly QuickLink[]) => html`
  <div class="search-hint">
    <p>Quick links:</p>
    <div class="quick-links">
      ${quickLinks.map(quickLinkItemTemplate)}
    </div>
  </div>
`;

const searchResultTemplate = (result: SearchResult, query: string, isSelected: boolean) => html`
  <a 
    href=${result.path} 
    class="search-result ${isSelected ? 'selected' : ''}" 
    send="SELECT_RESULT" 
    path=${result.path}>
    <span class="search-result-title">${highlightMatch(result.title, query)}</span>
    <span class="search-result-path">${result.path}</span>
  </a>
`;

const searchResultsTemplate = (results: SearchResult[], query: string, selectedIndex: number) => {
  if (results.length === 0 && query.trim()) {
    return html`
      <div class="search-no-results">
        <p>No results found for "${query}"</p>
        <p class="search-suggestion">Try searching for: state machines, xstate, about, blog</p>
      </div>
    `;
  }

  return html`
    <div class="search-results-list">
      ${results.map((result, index) => searchResultTemplate(result, query, index === selectedIndex))}
    </div>
  `;
};

// Component Styles
const searchModalStyles = css`
  :host {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: block;
  }
  
  :host([data-state="closed"]) {
    display: none;
  }
  
  .search-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .search-modal-overlay.open {
    opacity: 1;
  }
  
  .search-modal-container {
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    width: 90%;
    max-width: 600px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .search-modal-container.open {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  
  .search-modal-header {
    display: flex;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e5e5e5;
  }
  
  .search-modal-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 18px;
    padding: 8px 0;
  }
  
  .search-modal-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: background-color 0.2s;
  }
  
  .search-modal-close:hover {
    background-color: #f5f5f5;
  }
  
  .search-modal-results {
    max-height: 400px;
    overflow-y: auto;
    padding: 20px;
  }
  
  .quick-links {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 12px;
  }
  
  .quick-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 6px;
    text-decoration: none;
    color: #333;
    transition: background-color 0.2s;
  }
  
  .quick-link:hover {
    background: #e9ecef;
  }
  
  .search-results-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .search-result {
    display: flex;
    flex-direction: column;
    padding: 12px;
    border-radius: 8px;
    text-decoration: none;
    color: #333;
    transition: background-color 0.2s;
  }
  
  .search-result:hover,
  .search-result.selected {
    background-color: #f8f9fa;
  }
  
  .search-result-title {
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .search-result-path {
    font-size: 14px;
    color: #666;
  }
  
  .search-no-results {
    text-align: center;
    color: #666;
    padding: 40px 20px;
  }
  
  .search-suggestion {
    font-size: 14px;
    margin-top: 8px;
  }
  
  mark {
    background: #ffeb3b;
    padding: 0 2px;
    border-radius: 2px;
  }

  /* Body scroll prevention handled by CSS data attributes */
  :host([data-state*="open"]) ~ body,
  :host([data-state*="opening"]) ~ body {
    overflow: hidden;
  }
`;

// Main Template
const searchModalTemplate = (state: SnapshotFrom<typeof searchModalMachine>) => {
  const { query, results, quickLinks, selectedIndex } = state.context;

  return html`
    <div 
      class="search-modal-overlay ${state.matches('open') && 'open'}" 
      send="CLOSE" 
      source="overlay-click"
      aria-hidden=${!state.matches('open')}
    >
      <div 
        class="search-modal-container ${state.matches('open') && 'open'}" 
        role="dialog" 
        aria-modal="true" 
        aria-label="Search"
        send=""
      >
        <div class="search-modal-header">
          <input 
            type="search" 
            class="search-modal-input" 
            placeholder="Search for pages, projects, or topics..."
            aria-label="Search input"
            autocomplete="off"
            value=${query}
            send="SEARCH"
            data-autofocus=${state.matches('open')}
          />
          <button 
            class="search-modal-close" 
            aria-label="Close search" 
            send="CLOSE" 
            source="close-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="search-modal-results">
          ${
            !query.trim()
              ? quickLinksTemplate(quickLinks)
              : searchResultsTemplate(results, query, selectedIndex)
          }
        </div>
      </div>
    </div>
  `;
};

// Utility Functions
function highlightMatch(text: string, query: string): string {
  if (!query) return escapeHtml(text);

  const escapedText = escapeHtml(text);
  const escapedQuery = escapeRegexChars(query);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return escapedText.replace(regex, '<mark>$1</mark>');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegexChars(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Create the component using the framework
const SearchModalComponent = createComponent({
  machine: searchModalMachine,
  template: searchModalTemplate,
  styles: searchModalStyles,
  tagName: 'search-modal',
});

// ✅ REPLACED: Framework-based global event handling instead of addEventListener
// Set up framework event bus integration when component loads
if (typeof window !== 'undefined' && window.globalEventBus) {
  // ✅ FRAMEWORK: Listen for global keyboard shortcuts via event bus
  window.globalEventBus.on('global-keydown', (data: unknown) => {
    const keyEvent = data as {
      key: string;
      metaKey?: boolean;
      ctrlKey?: boolean;
      preventDefault: () => void;
    };

    // Global Cmd/Ctrl+K shortcut to open search
    if ((keyEvent.metaKey || keyEvent.ctrlKey) && keyEvent.key === 'k') {
      keyEvent.preventDefault();
      // ✅ REPLACED: Use component registry instead of querySelector
      const searchModal = window.searchModalRegistry?.getInstance();
      if (searchModal?.send) {
        searchModal.send({ type: 'OPEN', source: 'keyboard-shortcut' });
      }
      return;
    }
  });

  // ✅ FRAMEWORK: Listen for search toggle events via event bus
  window.globalEventBus.on('search-toggle', () => {
    // ✅ REPLACED: Use component registry instead of querySelector
    const searchModal = window.searchModalRegistry?.getInstance();
    if (searchModal?.send) {
      searchModal.send({ type: 'OPEN', source: 'button-click' });
    }
  });

  // ✅ FRAMEWORK: Listen for modal-specific keyboard events
  window.globalEventBus.on('search-modal-keydown', (data: unknown) => {
    const keyEvent = data as {
      key: string;
      preventDefault: () => void;
      modalOpen?: boolean;
    };

    if (!keyEvent.modalOpen) return;

    // ✅ REPLACED: Use component registry instead of querySelector
    const searchModal = window.searchModalRegistry?.getInstance();
    if (!searchModal?.send) return;

    switch (keyEvent.key) {
      case 'Escape':
        keyEvent.preventDefault();
        searchModal.send({ type: 'CLOSE', source: 'escape-key' });
        break;
      case 'ArrowUp':
        keyEvent.preventDefault();
        searchModal.send({ type: 'NAVIGATE_UP' });
        break;
      case 'ArrowDown':
        keyEvent.preventDefault();
        searchModal.send({ type: 'NAVIGATE_DOWN' });
        break;
      case 'Enter':
        keyEvent.preventDefault();
        searchModal.send({ type: 'SELECT_CURRENT' });
        break;
    }
  });

  devConfig.log('Search modal framework event bus integration complete');
}

export default SearchModalComponent;
export { SearchModalComponent };
export type { QuickLink, SearchableItem, SearchResult };

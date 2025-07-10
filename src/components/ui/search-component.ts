import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, css, html } from '../../framework/core/index.js';

// Type definitions
export interface SearchItem {
  title: string;
  content: string;
  url: string;
  type: SearchItemType;
  section: string;
}

export type SearchItemType =
  | 'concept'
  | 'demo'
  | 'service'
  | 'page'
  | 'article'
  | 'guide'
  | 'course'
  | 'template'
  | 'tool';

interface SearchContext {
  searchData: readonly SearchItem[];
  query: string;
  results: SearchItem[];
}

type SearchEvent =
  | { type: 'TOGGLE_SEARCH' }
  | { type: 'OPEN_SEARCH' }
  | { type: 'CLOSE_SEARCH' }
  | { type: 'SEARCH_INPUT'; query: string }
  | { type: 'RESULT_CLICKED'; url: string }
  | { type: 'KEYBOARD_SHORTCUT'; key: string; metaKey?: boolean; ctrlKey?: boolean };

// Static search data
const SEARCH_DATA: readonly SearchItem[] = [
  {
    title: 'State Machine Introduction',
    content: 'Frontend state management pain points, complex state, debugging',
    url: '/',
    type: 'concept',
    section: 'Home',
  },
  {
    title: 'Actor Architecture Demo',
    content: 'Coffee shop demo, actor model, interactive demo, state machines',
    url: '/',
    type: 'demo',
    section: 'Home',
  },
  {
    title: 'Frontend Architecture Consulting',
    content: 'Frontend architecture consulting, maintainable applications, scalable systems',
    url: '/#contact',
    type: 'service',
    section: 'Services',
  },
  {
    title: 'XState Implementation & Optimization',
    content: 'XState implementation, state machine optimization, complex workflows',
    url: '/#contact',
    type: 'service',
    section: 'Services',
  },
  {
    title: 'State Machine Architecture Reviews',
    content: 'State machine reviews, actor model design, architecture consulting',
    url: '/#contact',
    type: 'service',
    section: 'Services',
  },
  {
    title: 'About José Flores',
    content: 'Frontend architect, XState specialist, experience, credentials, story',
    url: '/about/',
    type: 'page',
    section: 'About',
  },
  {
    title: 'Technical Articles',
    content: 'Blog, technical articles, frontend insights, how-to guides',
    url: '/blog/',
    type: 'page',
    section: 'Blog',
  },
  {
    title: 'XState Components Re-Rendering',
    content: 'XState components re-rendering actor isolation React patterns',
    url: '/blog/',
    type: 'article',
    section: 'Blog',
  },
  {
    title: 'Actor-Based File Structures',
    content: 'Actor model file structure organization frontend architecture',
    url: '/blog/',
    type: 'article',
    section: 'Blog',
  },
  {
    title: 'State Machine Mastery Guide',
    content: 'State machine concepts, implementation guide, benefits, progression',
    url: '/resources/',
    type: 'guide',
    section: 'Resources',
  },
  {
    title: 'Weekly XState Challenges',
    content: 'XState challenges, weekly coding practice, state machine learning',
    url: '/challenges/',
    type: 'course',
    section: 'Challenges',
  },
  {
    title: '1-on-1 Strategy Session',
    content: 'Personal consultation, state management help, architecture guidance',
    url: '/#newsletter-signup',
    type: 'service',
    section: 'Consultation',
  },
  {
    title: 'XState Project Templates',
    content: 'Project templates, XState configuration, best practices, starter',
    url: '/resources/',
    type: 'template',
    section: 'Resources',
  },
  {
    title: 'Actor System Templates',
    content: 'Actor model templates, state machine patterns, XState architecture',
    url: '/resources/',
    type: 'tool',
    section: 'Resources',
  },
] as const;

// Helper functions
const performSearch = (query: string, searchData: readonly SearchItem[]): SearchItem[] => {
  if (query.length < 2) return [];

  return searchData.filter((item: SearchItem) => {
    const searchText = `${item.title} ${item.content}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });
};

const highlightQuery = (text: string, query: string): string => {
  if (!query) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// ✅ FRAMEWORK: Global window interface for framework integration
declare global {
  interface Window {
    globalEventBus?: {
      emit(event: string, data?: unknown): void;
      on(event: string, callback: (data: unknown) => void): void;
    };
  }
}

// XState machine
const searchMachine = setup({
  types: {
    context: {} as SearchContext,
    events: {} as SearchEvent,
  },
  actions: {
    resetSearch: assign({
      query: '',
      results: [],
    }),
    updateQuery: assign({
      query: ({ event }) => (event.type === 'SEARCH_INPUT' ? event.query : ''),
      results: ({ context, event }) => {
        if (event.type === 'SEARCH_INPUT') {
          return performSearch(event.query, context.searchData);
        }
        return context.results;
      },
    }),
    // ✅ REPLACED: Framework event bus instead of DOM manipulation
    handleResultClick: ({ event }) => {
      if (event.type === 'RESULT_CLICKED') {
        // ✅ FRAMEWORK: Use framework event bus for analytics instead of DOM manipulation
        if (typeof window !== 'undefined' && window.globalEventBus) {
          window.globalEventBus.emit('search-result-selected', {
            url: event.url,
            componentId: 'search-component',
            timestamp: Date.now(),
          });
        }

        // ✅ FRAMEWORK: Use framework navigation instead of direct href manipulation
        if (typeof window !== 'undefined' && window.globalEventBus) {
          window.globalEventBus.emit('navigate-to', {
            url: event.url,
            source: 'search-component',
            trigger: 'result-click',
          });
        }
      }
    },
  },
  guards: {
    isEscapeKey: ({ event }) => event.type === 'KEYBOARD_SHORTCUT' && event.key === 'Escape',
    isSearchShortcut: ({ event }) =>
      event.type === 'KEYBOARD_SHORTCUT' &&
      event.key === 'k' &&
      (Boolean(event.metaKey) || Boolean(event.ctrlKey)),
  },
}).createMachine({
  id: 'search',
  initial: 'closed',
  context: {
    searchData: SEARCH_DATA,
    query: '',
    results: [],
  },
  states: {
    closed: {
      on: {
        TOGGLE_SEARCH: 'open',
        OPEN_SEARCH: 'open',
        KEYBOARD_SHORTCUT: {
          target: 'open',
          guard: 'isSearchShortcut',
        },
      },
    },
    open: {
      entry: 'resetSearch',
      on: {
        TOGGLE_SEARCH: 'closed',
        CLOSE_SEARCH: 'closed',
        SEARCH_INPUT: {
          actions: 'updateQuery',
        },
        RESULT_CLICKED: {
          target: 'closed',
          actions: 'handleResultClick',
        },
        KEYBOARD_SHORTCUT: {
          target: 'closed',
          guard: 'isEscapeKey',
        },
      },
    },
  },
});

// Helper function to render search result
const renderSearchResult = (item: SearchItem, query: string) => html`
  <div class="search-result-item" 
       send="RESULT_CLICKED" 
       url=${item.url}>
    <div class="result-type">${item.type}</div>
    <h3 class="result-title">${item.title}</h3>
    <p class="result-section">${item.section}</p>
    <p class="result-preview">${highlightQuery(item.content, query)}</p>
  </div>
`;

// Helper function to render no results
const renderNoResults = (query: string) => html`
  <div class="no-results">
    <p>No results found for "${query}"</p>
    <p class="suggestion">Try searching for: state machines, XState, actors, statecharts, architecture</p>
  </div>
`;

// Template function
const template = (state: SnapshotFrom<typeof searchMachine>) => html`
  <button class="search-toggle" send="TOGGLE_SEARCH" aria-label="Open search">
    <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
      <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
    </svg>
    <span>Search</span>
  </button>
  
  <div class="search-container ${state.matches('open') ? 'search-active' : ''}"
       send="CLOSE_SEARCH">
    <div class="search-modal">
      <div class="search-header">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
        </svg>
        <input 
          class="search-input" 
          type="text" 
          placeholder="Search content..."
          autocomplete="off"
          value=${state.context.query}
          send="SEARCH_INPUT"
        />
        <button class="search-close" 
                send="CLOSE_SEARCH" 
                aria-label="Close search">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      <div class="search-results">
        ${
          state.context.query.length < 2
            ? ''
            : state.context.results.length === 0
              ? renderNoResults(state.context.query)
              : state.context.results.map((item: SearchItem) =>
                  renderSearchResult(item, state.context.query)
                )
        }
      </div>
    </div>
  </div>
`;

// Styles
const styles = css`
  :host {
    position: relative;
    z-index: 1000;
  }
  
  .search-toggle {
    background: rgba(15, 17, 21, 0.5);
    border: 1px solid rgba(13, 153, 255, 0.3);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    color: var(--teagreen);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    min-width: 120px;
    justify-content: space-between;
    backdrop-filter: blur(4px);
  }
  
  .search-toggle:hover {
    border-color: var(--jasper);
    color: var(--jasper);
    background: rgba(13, 153, 255, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(13, 153, 255, 0.2);
  }
  
  .search-icon {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
  
  .search-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(8, 8, 8, 0.95);
    backdrop-filter: blur(10px);
    z-index: 9999;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 2rem;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    pointer-events: none;
  }
  
  .search-container.search-active {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
  
  .search-modal {
    background: rgba(15, 17, 21, 0.98);
    border: 1px solid rgba(13, 153, 255, 0.3);
    border-radius: 16px;
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    transform: translateY(-50px);
    transition: transform 0.3s ease;
    backdrop-filter: blur(20px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    pointer-events: auto;
  }
  
  .search-active .search-modal {
    transform: translateY(0);
  }
  
  .search-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(13, 153, 255, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--heading-color);
    font-size: 1.2rem;
    outline: none;
    width: 100%;
  }
  
  .search-input::placeholder {
    color: rgba(245, 245, 245, 0.6);
    opacity: 1;
  }
  
  .search-close {
    background: transparent;
    border: none;
    color: var(--teagreen);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  .search-close:hover {
    color: var(--jasper);
    background: rgba(13, 153, 255, 0.1);
  }
  
  .search-results {
    max-height: 400px;
    overflow-y: auto;
    padding: 1rem;
  }
  
  .search-result-item {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
  }
  
  .search-result-item:hover {
    background: rgba(13, 153, 255, 0.05);
    border-color: rgba(13, 153, 255, 0.2);
    transform: translateY(-2px);
  }
  
  .result-type {
    display: inline-block;
    background: rgba(13, 153, 255, 0.2);
    color: var(--jasper);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }
  
  .result-title {
    color: var(--heading-color);
    font-size: 1.1rem;
    margin: 0 0 0.25rem 0;
    font-weight: 600;
  }
  
  .result-section {
    color: var(--jasper);
    font-size: 0.9rem;
    margin: 0 0 0.5rem 0;
    opacity: 0.8;
  }
  
  .result-preview {
    color: var(--teagreen);
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 0;
  }
  
  .result-preview mark {
    background: rgba(13, 153, 255, 0.3);
    color: var(--jasper);
    padding: 0.1rem 0.2rem;
    border-radius: 3px;
  }
  
  .no-results {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--teagreen);
  }
  
  .no-results p {
    margin: 0 0 1rem 0;
  }
  
  .suggestion {
    opacity: 0.7;
    font-size: 0.9rem;
  }
  
  @media (max-width: 768px) {
    .search-container {
      padding: 1rem;
    }
    
    .search-toggle {
      min-width: 44px;
      padding: 0.5rem;
      justify-content: center;
    }
    
    .search-toggle span {
      display: none;
    }
    
    .search-input {
      font-size: 1rem;
    }
    
    .search-header {
      padding: 1rem;
    }
  }
`;

// Create component using framework
const SearchComponent = createComponent({
  machine: searchMachine,
  template,
  styles,
  tagName: 'search-component',
});

// Export component
export { SearchComponent };

// Breadcrumbs component refactored to use Actor-SPA Framework API
import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, html, type RawHTML } from '../../framework/core/index.js';

// ✅ Type-safe interfaces following framework patterns
interface BreadcrumbItem {
  name: string;
  path: string;
  current: boolean;
}

type PageName = 'Home' | 'About' | 'Blog' | 'Resources' | 'Challenges';

interface PageMapping {
  [key: string]: PageName;
}

interface BreadcrumbsContext {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  pageNames: PageMapping;
}

type BreadcrumbsEvents =
  | { type: 'UPDATE_PATH'; path: string }
  | { type: 'NAVIGATE'; path: string }
  | { type: 'REFRESH' };

// ✅ XState machine for state management
const breadcrumbsMachine = setup({
  types: {
    context: {} as BreadcrumbsContext,
    events: {} as BreadcrumbsEvents,
  },
  actions: {
    updatePath: assign({
      currentPath: ({ event }) =>
        event.type === 'UPDATE_PATH' ? event.path : window.location.pathname,
      breadcrumbs: ({ event, context }) => {
        const path = event.type === 'UPDATE_PATH' ? event.path : window.location.pathname;
        return generateBreadcrumbs(path, context.pageNames);
      },
    }),
    navigateToPath: assign({
      currentPath: ({ event }) =>
        event.type === 'NAVIGATE' ? event.path : window.location.pathname,
      breadcrumbs: ({ event, context }) => {
        const path = event.type === 'NAVIGATE' ? event.path : window.location.pathname;
        // Update browser history
        if (event.type === 'NAVIGATE') {
          window.history.pushState({}, '', event.path);
        }
        return generateBreadcrumbs(path, context.pageNames);
      },
    }),
    refreshBreadcrumbs: assign({
      currentPath: window.location.pathname,
      breadcrumbs: ({ context }) =>
        generateBreadcrumbs(window.location.pathname, context.pageNames),
    }),
  },
}).createMachine({
  id: 'breadcrumbs',
  initial: 'idle',
  context: {
    currentPath: typeof window !== 'undefined' ? window.location.pathname : '/',
    breadcrumbs: [],
    pageNames: {
      resources: 'Resources',
      about: 'About',
      blog: 'Blog',
      challenges: 'Challenges',
    },
  },
  states: {
    idle: {
      entry: 'refreshBreadcrumbs',
      on: {
        UPDATE_PATH: { actions: 'updatePath' },
        NAVIGATE: { actions: 'navigateToPath' },
        REFRESH: { actions: 'refreshBreadcrumbs' },
      },
    },
  },
});

// ✅ Helper functions (pure functions)
function generateBreadcrumbs(path: string, pageNames: PageMapping): BreadcrumbItem[] {
  const pathParts = path.split('/').filter((part) => part !== '');

  // Start with home
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'Home',
      path: '/',
      current: pathParts.length === 0,
    },
  ];

  // Build breadcrumb trail
  let currentPath = '';
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;
    const isLast = index === pathParts.length - 1;

    // Convert path parts to readable names
    const name = getPageName(part, pageNames);

    breadcrumbs.push({
      name,
      path: currentPath,
      current: isLast,
    });
  });

  return breadcrumbs;
}

function getPageName(pathPart: string, pageNames: PageMapping): string {
  const cleanPart = pathPart.toLowerCase();
  return pageNames[cleanPart] || capitalizeFirst(pathPart);
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ✅ Template components (extracted for better organization)
const homeIcon = (): RawHTML => html`
  <svg class="home-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L2 12H5V20H10V15H14V20H19V12H22L12 3Z" fill="currentColor"/>
  </svg>
`;

const breadcrumbItem = (crumb: BreadcrumbItem, index: number): RawHTML => {
  const separator = index > 0 ? html`<span class="separator">/</span>` : '';
  const homeIconElement = index === 0 ? homeIcon() : '';

  if (crumb.current) {
    return html`
      <div class="breadcrumb-item">
        ${separator}
        <span class="breadcrumb-current" aria-current="page">
          ${homeIconElement}
          ${crumb.name}
        </span>
      </div>
    `;
  }
  return html`
      <div class="breadcrumb-item">
        ${separator}
        <a href=${crumb.path} class="breadcrumb-link" send="NAVIGATE" path=${crumb.path}>
          ${homeIconElement}
          ${crumb.name}
        </a>
      </div>
    `;
};

// ✅ Pure template function using framework html``
const breadcrumbsTemplate = (state: SnapshotFrom<typeof breadcrumbsMachine>): RawHTML => {
  const { breadcrumbs } = state.context;

  return html`
    <nav class="breadcrumbs" aria-label="Breadcrumb navigation">
      ${breadcrumbs.map((crumb, index) => breadcrumbItem(crumb, index))}
    </nav>
  `;
};

// ✅ Static styles using framework shadow DOM support
const breadcrumbsStyles = `
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
    cursor: pointer;
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
`;

// ✅ Create the component using framework API
const BreadcrumbsComponent = createComponent({
  machine: breadcrumbsMachine,
  template: breadcrumbsTemplate,
  styles: breadcrumbsStyles,
  tagName: 'breadcrumb-nav', // Custom tag name to maintain compatibility
});

// ✅ Export the component class for programmatic access
export default BreadcrumbsComponent;

// ✅ Export types for external use
export type { BreadcrumbItem, PageName, BreadcrumbsContext, BreadcrumbsEvents };

// ✅ Usage Examples:
//
// 1. Basic usage (registered as <breadcrumb-nav>):
//    <breadcrumb-nav></breadcrumb-nav>
//
// 2. Programmatic usage:
//    const breadcrumbs = new BreadcrumbsComponent();
//    document.body.appendChild(breadcrumbs);
//
//    // Update path manually
//    breadcrumbs.send({ type: 'UPDATE_PATH', path: '/blog/my-post' });
//
//    // Navigate to new path (with history update)
//    breadcrumbs.send({ type: 'NAVIGATE', path: '/about' });
//
//    // Refresh breadcrumbs
//    breadcrumbs.send({ type: 'REFRESH' });
//
// 3. With declarative navigation:
//    <!-- Links automatically use framework's send attributes -->
//    <breadcrumb-nav></breadcrumb-nav>
//    <!-- Breadcrumb links will automatically trigger NAVIGATE events -->
//
// Benefits of the new approach:
// ✅ Automatic XSS protection for all breadcrumb content
// ✅ Declarative navigation with framework event system
// ✅ Type-safe state management
// ✅ Pure functions for better testability
// ✅ Automatic lifecycle management
// ✅ Better accessibility with proper ARIA attributes

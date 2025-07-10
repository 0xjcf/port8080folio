import { setup } from 'xstate';
import { createComponent, css, html } from '../../framework/core/index.js';

// Global framework interface
declare global {
  interface Window {
    actorFramework?: {
      eventBus: {
        emit: (event: string, data?: unknown) => void;
        on: (event: string, handler: (data?: unknown) => void) => void;
      };
    };
  }
}

// Type definitions
export interface BlogPost {
  emoji: string;
  title: string;
  excerpt: string;
  metric?: string;
  readTime: string;
  date: string;
  url: string;
  tags: string[];
}

export interface BlogPostApiResponse {
  posts: BlogPost[];
  total: number;
  hasMore: boolean;
}

type DateFormatOptions = {
  month: 'short' | 'long' | 'numeric' | '2-digit';
  day: 'numeric' | '2-digit';
  year: 'numeric' | '2-digit';
};

interface BlogPostsContext {
  posts: readonly BlogPost[];
  linkedinUrl: string;
}

type BlogPostsEvent = { type: 'POST_CLICKED'; title: string; url: string };

// Static data
const BLOG_POSTS_DATA: readonly BlogPost[] = [
  {
    emoji: '🎯',
    title: 'Your XState Components Are Re-Rendering Like Crazy',
    excerpt:
      'That debugging session that made me question everything about React and state machines...',
    metric: 'Isolated actors',
    readTime: '5 min',
    date: '2024-01-15',
    url: 'https://www.linkedin.com/pulse/your-xstate-components-re-rendering-like-crazy-i-found-jos%25C3%25A9-c-flores-utr6e/',
    tags: ['XState', 'React', 'Actors'],
  },
  {
    emoji: '🗂️',
    title: 'Actor-Based File Structures',
    excerpt: 'Why state machines made me completely rethink how I organize my project folders.',
    metric: 'Actor architecture',
    readTime: '8 min',
    date: '2024-01-08',
    url: 'https://www.linkedin.com/pulse/actor-based-file-structures-jos%25C3%25A9-c-flores-dmmce/',
    tags: ['XState', 'Architecture', 'Best Practices'],
  },
  {
    emoji: '📊',
    title: 'Stop Loading Your Entire XState App',
    excerpt:
      'How splitting a 1,700-line state machine into 12 focused actors transformed our architecture.',
    metric: 'Modular statecharts',
    readTime: '12 min',
    date: '2023-12-20',
    url: 'https://www.linkedin.com/pulse/stop-loading-your-entire-xstate-app-jos%25C3%25A9-c-flores-llcle/',
    tags: ['Statecharts', 'XState', 'Architecture'],
  },
] as const;

// XState machine
const blogPostsMachine = setup({
  types: {
    context: {} as BlogPostsContext,
    events: {} as BlogPostsEvent,
  },
  actions: {
    handlePostClick: ({ event }) => {
      // Use framework event bus instead of DOM manipulation
      if (window.actorFramework?.eventBus) {
        window.actorFramework.eventBus.emit('analytics:blog-post-clicked', {
          title: event.title,
          url: event.url,
          timestamp: new Date().toISOString(),
        });
      }
    },
  },
}).createMachine({
  id: 'blogPosts',
  initial: 'idle',
  context: {
    posts: BLOG_POSTS_DATA,
    linkedinUrl: 'https://www.linkedin.com/in/joseflores-io/recent-activity/articles/',
  },
  states: {
    idle: {
      on: {
        POST_CLICKED: {
          actions: 'handlePostClick',
        },
      },
    },
  },
});

// Helper function to format date
const _formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: DateFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
};

// Template helper functions (extracted to reduce nesting)
const renderPostMetric = (metric: string | undefined) => {
  if (!metric) return html``;
  return html`<p class="post-metric">${metric}</p>`;
};

const renderPostHeader = (post: BlogPost) => html`
  <div class="post-header">
    <span class="post-emoji">${post.emoji}</span>
    <div class="post-meta">
      ${renderPostMetric(post.metric)}
      <p class="post-readtime">${post.readTime} read</p>
    </div>
  </div>
`;

const renderTag = (tag: string) => html`<span class="tag">${tag}</span>`;

const renderPostTags = (tags: string[]) => html`
  <div class="post-tags">
    ${tags.map(renderTag)}
  </div>
`;

// Helper function to render post card
const renderPostCard = (post: BlogPost) => html`
  <a href=${post.url} 
     target="_blank" 
     rel="noopener" 
     class="post-card" 
     send="POST_CLICKED" 
     title=${post.title}
     url=${post.url}>
    ${renderPostHeader(post)}
    <h3>${post.title}</h3>
    <p class="post-excerpt">${post.excerpt}</p>
    ${renderPostTags(post.tags)}
  </a>
`;

// Template function
const template = (state: { context: BlogPostsContext }) => html`
  <section class="blog-container">
    <div class="section-header">
      <h2>Recent Deep Dives 📝</h2>
      <p class="section-subtitle">
        I write about taming complex state management and keeping codebases maintainable
      </p>
    </div>
    
    <div class="posts-grid" id="posts-container">
      ${state.context.posts.map((post: BlogPost) => renderPostCard(post))}
    </div>
    
    <div class="view-all-container">
      <a href=${state.context.linkedinUrl} target="_blank" rel="noopener" class="view-all-link">
        Read more on LinkedIn
      </a>
    </div>
  </section>
`;

// Styles
const styles = css`
  :host {
    display: block;
    width: 100%;
  }
  
  .blog-container {
    width: 100%;
  }
  
  /* Use global section header styles for consistency */
  .section-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .section-header h2 {
    /* Follow global hierarchy - smaller than page H1 */
    font-size: 2rem;
    color: var(--heading-color, #FFFFFF);
    margin: 0 0 1rem 0;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .section-subtitle {
    font-size: 1.25rem;
    color: var(--teagreen, #F5F5F5);
    margin: 0;
    line-height: 1.6;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    opacity: 0.9;
  }
  
  @media (min-width: 768px) {
    .section-header h2 {
      /* Follow global hierarchy - smaller than page H1 */
      font-size: 2.4rem;
    }
    
    .section-subtitle {
      font-size: 1.3rem;
      line-height: 1.7;
    }
  }
  
  .posts-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 4rem;
    width: 100%;
  }
  
  .post-card {
    background: rgba(15, 17, 21, 0.8);
    border: 1px solid rgba(13, 153, 255, 0.2);
    border-radius: 12px;
    padding: 2rem;
    transition: all 0.3s ease;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 200px;
  }
  
  .post-card:hover {
    transform: translateY(-4px);
    border-color: rgba(13, 153, 255, 0.5);
    box-shadow: 0 8px 24px rgba(13, 153, 255, 0.15);
  }
  
  .post-header {
    display: flex;
    align-items: start;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .post-emoji {
    font-size: 2.5rem;
    line-height: 1;
  }
  
  .post-meta {
    flex: 1;
  }
  
  .post-date {
    font-size: 0.875rem;
    color: var(--jasper, #0D99FF);
    margin: 0;
  }
  
  .post-readtime {
    font-size: 0.875rem;
    color: var(--teagreen, #F5F5F5);
    opacity: 0.7;
    margin: 0.25rem 0 0 0;
  }
  
  .post-metric {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--jasper, #0D99FF);
    margin: 0 0 0.25rem 0;
    background: linear-gradient(45deg, var(--jasper) 0%, var(--jasper-light) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  h3 {
    color: var(--heading-color, #FFFFFF);
    font-size: 1.25rem;
    margin: 1rem 0;
    line-height: 1.3;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  
  @media (min-width: 768px) {
    h3 {
      font-size: 1.4rem;
    }
  }
  
  .post-excerpt {
    color: var(--teagreen, #F5F5F5);
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
  }
  
  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: auto;
  }
  
  .tag {
    background: rgba(13, 153, 255, 0.1);
    color: var(--jasper-light, #47B4FF);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    border: 1px solid rgba(13, 153, 255, 0.3);
  }
  
  .view-all-container {
    text-align: center;
    margin-top: 2rem;
    padding-top: 2rem;
    position: relative;
    z-index: 10;
  }
  
  .view-all-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: transparent;
    color: var(--jasper, #0D99FF);
    border: 2px solid var(--jasper, #0D99FF);
    border-radius: 8px;
    text-decoration: none;
    font-size: 1.125rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .view-all-link:hover {
    background: rgba(13, 153, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(13, 153, 255, 0.3);
  }
  
  .view-all-link::after {
    content: '→';
    transition: transform 0.3s ease;
  }
  
  .view-all-link:hover::after {
    transform: translateX(4px);
  }
  
  .loading-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: var(--teagreen, #F5F5F5);
  }
  
  @media (max-width: 850px) {
    .section-header h2 {
      font-size: 1.8rem;
    }
    
    .section-subtitle {
      font-size: 1.1rem;
    }
    
    h3 {
      font-size: 1.15rem;
    }
    
    .posts-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
`;

// Create component using framework
const BlogPostsComponent = createComponent({
  machine: blogPostsMachine,
  template,
  styles,
  tagName: 'blog-posts',
});

// Export component
export { BlogPostsComponent };

class BlogPosts extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Featured blog posts showcasing frontend expertise
    this.posts = [
      {
        emoji: '🎯',
        title: 'Your XState Components Are Re-Rendering Like Crazy',
        excerpt: 'That debugging session that made me question everything about React and state machines...',
        metric: '90% fewer renders',
        readTime: '5 min',
        date: '2024-01-15',
        url: 'https://www.linkedin.com/pulse/your-xstate-components-re-rendering-like-crazy-i-found-jos%25C3%25A9-c-flores-utr6e/',
        tags: ['XState', 'React', 'Performance']
      },
      {
        emoji: '🗂️',
        title: 'Actor-Based File Structures',
        excerpt: 'Why state machines made me completely rethink how I organize my project folders.',
        metric: 'Better architecture',
        readTime: '8 min',
        date: '2024-01-08',
        url: 'https://www.linkedin.com/pulse/actor-based-file-structures-jos%25C3%25A9-c-flores-dmmce/',
        tags: ['XState', 'Architecture', 'Best Practices']
      },
      {
        emoji: '📦',
        title: 'Stop Loading Your Entire XState App',
        excerpt: 'The lazy loading pattern that changed everything. From 892KB to 347KB with one simple trick.',
        metric: '61% smaller',
        readTime: '12 min',
        date: '2023-12-20',
        url: '#',
        tags: ['Performance', 'Webpack', 'Optimization']
      }
    ];
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .blog-container {
          width: 100%;
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        h2 {
          font-size: 2.5rem;
          color: var(--heading-color, #FFFFFF);
          margin: 0 0 1rem 0;
          font-weight: 700;
        }
        
        .section-subtitle {
          font-size: 1.25rem;
          color: var(--teagreen, #F5F5F5);
          margin: 0;
          line-height: 1.6;
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
          font-size: 1.5rem;
          margin: 1rem 0;
          line-height: 1.3;
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
          h2 {
            font-size: 2rem;
          }
          
          .posts-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      </style>
      
      <section class="blog-container">
        <div class="section-header">
          <h2>Recent Deep Dives 📝</h2>
          <p class="section-subtitle">
            I write about taming complex state management and keeping codebases maintainable
          </p>
        </div>
        
        <div class="posts-grid" id="posts-container">
          ${this.renderPosts()}
        </div>
        
        <div class="view-all-container">
          <a href="https://www.linkedin.com/in/joseflores-io/recent-activity/articles/" target="_blank" rel="noopener" class="view-all-link">
            Read more on LinkedIn
          </a>
        </div>
      </section>
    `;
  }

  renderPosts() {
    return this.posts.map(post => `
      <a href="${post.url}" target="_blank" rel="noopener" class="post-card" data-post-title="${post.title}">
        <div class="post-header">
          <span class="post-emoji">${post.emoji}</span>
          <div class="post-meta">
            ${post.metric ? `<p class="post-metric">${post.metric}</p>` : ''}
            <p class="post-readtime">${post.readTime} read</p>
          </div>
        </div>
        <h3>${post.title}</h3>
        <p class="post-excerpt">${post.excerpt}</p>
        <div class="post-tags">
          ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </a>
    `).join('');
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  addEventListeners() {
    const postCards = this.shadowRoot.querySelectorAll('.post-card');
    postCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Track blog post clicks
        this.dispatchEvent(new CustomEvent('blog-post-clicked', {
          detail: {
            title: card.dataset.postTitle,
            url: card.href
          },
          bubbles: true,
          composed: true
        }));
      });
    });
  }

  // Method to fetch real blog posts (for future implementation)
  async fetchBlogPosts() {
    try {
      // This would fetch from your blog's API
      // const response = await fetch('https://blog.joseflores.io/api/posts?limit=3');
      // const posts = await response.json();
      // this.posts = posts;
      // this.render();
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    }
  }
}

customElements.define('blog-posts', BlogPosts);

export { BlogPosts };
class SearchModal extends HTMLElement {
    constructor() {
        super();
        this.isOpen = false;
        this.searchResults = [];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
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
                        <div class="search-hint">
                            <p>Quick links:</p>
                            <div class="quick-links">
                                <a href="/port8080folio/" class="quick-link">
                                    <span class="quick-link-icon">🏠</span>
                                    <span>Home</span>
                                </a>
                                <a href="/port8080folio/about/" class="quick-link">
                                    <span class="quick-link-icon">👤</span>
                                    <span>About</span>
                                </a>
                                <a href="/port8080folio/blog/" class="quick-link">
                                    <span class="quick-link-icon">📝</span>
                                    <span>Blog</span>
                                </a>
                                <a href="/port8080folio/resources/" class="quick-link">
                                    <span class="quick-link-icon">📚</span>
                                    <span>Resources</span>
                                </a>
                                <a href="/port8080folio/challenges/" class="quick-link">
                                    <span class="quick-link-icon">🎯</span>
                                    <span>XState Challenges</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const overlay = this.querySelector('.search-modal-overlay');
        const container = this.querySelector('.search-modal-container');
        const closeBtn = this.querySelector('.search-modal-close');
        const input = this.querySelector('.search-modal-input');

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
            }
        });

        // Close button
        closeBtn.addEventListener('click', () => this.close());

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Search input
        input.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Prevent form submission
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Handle search result selection
                const firstResult = this.querySelector('.search-result');
                if (firstResult) {
                    firstResult.click();
                }
            }
        });

        // Listen for open events
        document.addEventListener('search-toggle', () => {
            this.open();
        });
    }

    open() {
        this.isOpen = true;
        const overlay = this.querySelector('.search-modal-overlay');
        overlay.classList.add('active');

        // Focus input
        setTimeout(() => {
            const input = this.querySelector('.search-modal-input');
            input.focus();
        }, 100);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        const overlay = this.querySelector('.search-modal-overlay');
        overlay.classList.remove('active');

        // Reset input
        const input = this.querySelector('.search-modal-input');
        input.value = '';
        this.handleSearch('');

        // Restore body scroll
        document.body.style.overflow = '';
    }

    handleSearch(query) {
        const resultsContainer = this.querySelector('.search-modal-results');

        if (!query.trim()) {
            // Show quick links
            resultsContainer.innerHTML = `
                <div class="search-hint">
                    <p>Quick links:</p>
                    <div class="quick-links">
                        <a href="/port8080folio/" class="quick-link">
                            <span class="quick-link-icon">🏠</span>
                            <span>Home</span>
                        </a>
                        <a href="/port8080folio/about/" class="quick-link">
                            <span class="quick-link-icon">👤</span>
                            <span>About</span>
                        </a>
                        <a href="/port8080folio/blog/" class="quick-link">
                            <span class="quick-link-icon">📝</span>
                            <span>Blog</span>
                        </a>
                        <a href="/port8080folio/resources/" class="quick-link">
                            <span class="quick-link-icon">📚</span>
                            <span>Resources</span>
                        </a>
                        <a href="/port8080folio/challenges/" class="quick-link">
                            <span class="quick-link-icon">🎯</span>
                            <span>XState Challenges</span>
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        // Simple search implementation
        const searchableContent = [
            { title: 'Home', path: '/port8080folio/', keywords: ['home', 'main', 'portfolio', 'josé flores'] },
            { title: 'About Me', path: '/port8080folio/about/', keywords: ['about', 'bio', 'experience', 'story'] },
            { title: 'Blog', path: '/port8080folio/blog/', keywords: ['blog', 'articles', 'posts', 'writing'] },
            { title: 'Resources', path: '/port8080folio/resources/', keywords: ['resources', 'tools', 'guides', 'state machines'] },
            { title: 'XState Challenges', path: '/port8080folio/challenges/', keywords: ['xstate', 'challenges', 'learn', 'course'] },
            { title: 'State Machine Guide', path: '/port8080folio/resources/#state-machine-deep-dive', keywords: ['state', 'machine', 'guide', 'tutorial'] },
            { title: 'Coffee Shop Demo', path: '/port8080folio/#coffee-shop-demo', keywords: ['coffee', 'shop', 'demo', 'actor', 'model'] },
        ];

        const results = searchableContent.filter(item => {
            const searchLower = query.toLowerCase();
            return item.title.toLowerCase().includes(searchLower) ||
                item.keywords.some(keyword => keyword.includes(searchLower));
        });

        if (results.length > 0) {
            resultsContainer.innerHTML = `
                <div class="search-results-list">
                    ${results.map(result => `
                        <a href="${result.path}" class="search-result">
                            <span class="search-result-title">${this.highlightMatch(result.title, query)}</span>
                            <span class="search-result-path">${result.path}</span>
                        </a>
                    `).join('')}
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <p>No results found for "${query}"</p>
                    <p class="search-suggestion">Try searching for: state machines, xstate, about, blog</p>
                </div>
            `;
        }
    }

    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}

// Define the custom element
if (!customElements.get('search-modal')) {
    customElements.define('search-modal', SearchModal);
}

export default SearchModal; 
class NavbarComponent extends HTMLElement {
    constructor() {
        super();
        this.currentPage = this.getAttribute('current-page') || 'home';
        this.basePath = this.getAttribute('base-path') || '/';
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    getNavLinks() {
        const isSubpage = this.basePath !== '/';
        const pathPrefix = isSubpage ? '../' : '/';

        return [
            { href: pathPrefix, label: 'Home', key: 'home' },
            { href: `${pathPrefix}about/`, label: 'About', key: 'about' },
            { href: `${pathPrefix}blog/`, label: 'Blog', key: 'blog' },
            { href: `${pathPrefix}resources/`, label: 'Resources', key: 'resources' }
        ];
    }

    getSocialLinks() {
        return [
            {
                href: 'https://github.com/0xjcf',
                label: 'GitHub',
                icon: `<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>`
            },
            {
                href: 'https://www.linkedin.com/in/joseflores-io/',
                label: 'LinkedIn',
                icon: `<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>`
            }
        ];
    }

    setupEventListeners() {
        // Mobile menu handling
        const menu = this.querySelector('.menu');
        const close = this.querySelector('.close');
        const navContent = this.querySelector('.nav-content');
        const body = document.querySelector('body');
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

        if (menu && close && navContent) {
            menu.addEventListener('click', () => {
                navContent.classList.add('nav-content--visible');
                menu.classList.add('menu--hide');
                close.classList.add('close--visible');
                body.classList.add('body--no-scroll');
                body.style.paddingRight = `${scrollBarWidth}px`;

                // Track event if analytics available
                if (window.gtag && localStorage.getItem('analytics_consent') === 'accepted') {
                    gtag('event', 'menu_open', { event_category: 'navigation', event_label: 'Mobile Menu' });
                }
            });

            close.addEventListener('click', () => {
                navContent.classList.remove('nav-content--visible');
                menu.classList.remove('menu--hide');
                close.classList.remove('close--visible');
                body.classList.remove('body--no-scroll');
                body.style.paddingRight = '0px';

                // Track event if analytics available
                if (window.gtag && localStorage.getItem('analytics_consent') === 'accepted') {
                    gtag('event', 'menu_close', { event_category: 'navigation', event_label: 'Mobile Menu' });
                }
            });
        }

        // Track external link clicks
        this.querySelectorAll('a[target="_blank"]').forEach(link => {
            link.addEventListener('click', () => {
                if (window.gtag && localStorage.getItem('analytics_consent') === 'accepted') {
                    gtag('event', 'click', { event_category: 'external_link', event_label: link.href });
                }
            });
        });
    }

    render() {
        const navLinks = this.getNavLinks();
        const socialLinks = this.getSocialLinks();
        const isSubpage = this.basePath !== '/';
        const brandPath = isSubpage ? '../' : '/';

        this.innerHTML = `
      <nav aria-labelledby="site-navigation">
        <!-- Visually hidden heading to label the navigation -->
        <h2 id="site-navigation" class="hidden-h1">Site Navigation</h2>

        <a href="${brandPath}" class="brand-link">
          <span class="brand-icon">
            <brand-icon size="48" animate="true" icon-type="state-machine"></brand-icon>
            <h1 class="hidden-h1">Jose Flores</h1>
          </span>
        </a>

        <div class="nav-content">
          <!-- Primary Navigation -->
          <ul class="navlist primary-nav">
            ${navLinks.map(link => `
              <li class="nav-item">
                <a href="${link.href}" ${link.key === this.currentPage ? 'class="active"' : ''}>${link.label}</a>
              </li>
            `).join('')}
            <li class="nav-item nav-search">
              <search-component></search-component>
            </li>
          </ul>

          <!-- Secondary/Social Navigation -->
          <ul class="navlist secondary-nav">
            ${socialLinks.map(link => `
              <li class="nav-item social-item">
                <a href="${link.href}" target="_blank" rel="noopener" aria-label="${link.label} Profile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    ${link.icon}
                  </svg>
                  <span class="social-label">${link.label}</span>
                </a>
              </li>
            `).join('')}
          </ul>
        </div>

        <button class="menu" id="menu-open-button" aria-label="Open menu" role="button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="currentColor"
            aria-label="Menu icon">
            <rect y="4" width="24" height="2" class="line" />
            <rect y="11" width="24" height="2" class="line" />
            <rect y="18" width="24" height="2" class="line" />
          </svg>
        </button>
        <button class="close" id="menu-close-button" aria-label="Close menu" role="button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" aria-label="Close menu icon">
            <line x1="3" y1="3" x2="21" y2="21" class="line" />
            <line x1="3" y1="21" x2="21" y2="3" class="line" />
          </svg>
        </button>
      </nav>
    `;
    }
}

// Define the custom element
if (!customElements.get('nav-bar')) {
    customElements.define('nav-bar', NavbarComponent);
}

export default NavbarComponent; 
// Simple Mobile Navigation - No XState dependency
class SimpleMobileNav {
    constructor(navbarElement) {
        this.navbar = navbarElement;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.ensureLinksVisible();
    }

    ensureLinksVisible() {
        // For mobile devices, ensure nav links are accessible
        if (window.innerWidth < 768) {
            const navContent = this.navbar.querySelector('.nav-content');
            if (navContent) {
                // Override the display:none on mobile
                navContent.style.setProperty('display', 'flex', 'important');
                navContent.style.setProperty('position', 'relative', 'important');
                navContent.style.setProperty('flex-direction', 'row', 'important');
                navContent.style.setProperty('justify-content', 'space-between', 'important');
                navContent.style.setProperty('align-items', 'center', 'important');
                navContent.style.setProperty('width', '100%', 'important');
                navContent.style.setProperty('height', 'auto', 'important');
                navContent.style.setProperty('background', 'transparent', 'important');
                navContent.style.setProperty('padding', '0', 'important');
                navContent.style.setProperty('gap', '1rem', 'important');

                // Hide some nav items on very small screens
                const primaryNav = navContent.querySelector('.primary-nav');
                if (primaryNav && window.innerWidth < 480) {
                    primaryNav.style.setProperty('display', 'none');
                } else if (primaryNav) {
                    primaryNav.style.setProperty('display', 'flex');
                }
            }
        }
    }

    setupEventListeners() {
        const menuButton = this.navbar.querySelector('.menu');
        const closeButton = this.navbar.querySelector('.close');
        const navContent = this.navbar.querySelector('.nav-content');

        if (menuButton && navContent) {
            menuButton.addEventListener('click', () => this.toggleMenu());
        }

        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeMenu());
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            this.ensureLinksVisible();
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        const navContent = this.navbar.querySelector('.nav-content');
        const menuButton = this.navbar.querySelector('.menu');
        const closeButton = this.navbar.querySelector('.close');

        if (navContent) {
            navContent.classList.add('nav-content--visible');
            this.isOpen = true;

            // Lock body scroll
            document.body.classList.add('body--no-scroll');

            // Hide menu button, show close button
            if (menuButton) menuButton.classList.add('menu--hide');
            if (closeButton) closeButton.classList.add('close--visible');
        }
    }

    closeMenu() {
        const navContent = this.navbar.querySelector('.nav-content');
        const menuButton = this.navbar.querySelector('.menu');
        const closeButton = this.navbar.querySelector('.close');

        if (navContent) {
            navContent.classList.remove('nav-content--visible');
            this.isOpen = false;

            // Unlock body scroll
            document.body.classList.remove('body--no-scroll');

            // Show menu button, hide close button
            if (menuButton) menuButton.classList.remove('menu--hide');
            if (closeButton) closeButton.classList.remove('close--visible');
        }
    }
}

// Auto-initialize simple mobile nav ONLY if state machine architecture fails
function initializeMobileNav() {
    // Check if state machine architecture is already working
    setTimeout(() => {
        const mobileNavComponent = document.querySelector('mobile-nav');
        const navbar = document.querySelector('nav-bar');

        if (mobileNavComponent && navbar) {
            // State machine architecture is present, don't initialize simple fallback
            console.log('State machine architecture detected, skipping simple fallback');
            return;
        }

        if (navbar) {
            // Only initialize if state machine architecture is not working
            new SimpleMobileNav(navbar);
            console.log('Simple mobile navigation initialized as fallback');
        } else {
            console.log('Navbar element not found');
        }
    }, 500); // Give state machine architecture time to initialize
}

// Listen for architecture failure events
document.addEventListener('mobile-nav-architecture-failed', initializeMobileNav);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMobileNav);
} else {
    initializeMobileNav();
}

export default SimpleMobileNav; 
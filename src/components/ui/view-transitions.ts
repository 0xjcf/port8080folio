/**
 * View Transitions API Utility
 * 
 * Provides smooth transitions between different views/pages using the native
 * View Transitions API. Falls back gracefully on unsupported browsers.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
 */

// Type definitions
interface ViewTransitionOptions {
    name?: string;
    skipTransition?: boolean;
    fallbackDuration?: number;
}

interface NavigationOptions {
    transitionName?: string;
    updateTitle?: boolean;
    pushState?: boolean;
}

interface SectionNavigationOptions {
    transitionName?: string;
    updateUrl?: boolean;
    focus?: boolean;
}

interface PageContentUpdateOptions {
    updateTitle?: boolean;
    pushState?: boolean;
    url?: string;
}

// Extend global Window interface only
declare global {
    interface Window {
        viewTransitions?: ViewTransitions;
    }
}

class ViewTransitions {
    public readonly isSupported: boolean;
    private activeTransition: any = null; // Use any to avoid type conflicts
    private transitionNames = new Map<any, string>();
    
    constructor() {
        this.isSupported = 'startViewTransition' in document;
        
        // Initialize transition tracking
        this.setupTransitionTracking();
        
        console.log('🎬 View Transitions API:', this.isSupported ? 'Supported' : 'Not supported (fallback enabled)');
    }

    /**
     * Check if View Transitions API is supported
     */
    static isSupported(): boolean {
        return 'startViewTransition' in document;
    }

    /**
     * Execute a view transition with callback
     * @param updateCallback - Function that updates the DOM
     * @param options - Transition options
     * @returns Promise that resolves when transition completes
     */
    async transition(
        updateCallback: () => Promise<void> | void, 
        options: ViewTransitionOptions = {}
    ): Promise<void> {
        const { 
            name = 'default',
            skipTransition = false,
            fallbackDuration = 300
        } = options;

        // Skip if transitions are disabled or not supported
        if (skipTransition || !this.isSupported) {
            await updateCallback();
            return;
        }

        try {
            // Cancel any existing transition
            if (this.activeTransition) {
                this.activeTransition.skipTransition();
            }

            // Start new transition
            this.activeTransition = (document as any).startViewTransition(async () => {
                await updateCallback();
            });

            // Store transition name for CSS targeting
            if (name !== 'default') {
                this.transitionNames.set(this.activeTransition, name);
                document.documentElement.setAttribute('data-transition', name);
            }

            // Wait for transition to complete
            await this.activeTransition.finished;
            
            // Clean up
            this.activeTransition = null;
            document.documentElement.removeAttribute('data-transition');

        } catch (error) {
            console.warn('View transition failed, falling back to immediate update:', error);
            await updateCallback();
        }
    }

    /**
     * Navigate to a new page with smooth transition
     * @param url - Target URL
     * @param options - Navigation options
     */
    async navigateTo(url: string, options: NavigationOptions = {}): Promise<void> {
        const {
            transitionName = this.getTransitionName(url),
            updateTitle = true,
            pushState = true
        } = options;

        await this.transition(async () => {
            // Fetch new content
            const response = await fetch(url);
            const html = await response.text();
            
            // Parse new document
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');
            
            // Update page content
            this.updatePageContent(newDoc, { updateTitle, pushState, url });
            
        }, { name: transitionName });
    }

    /**
     * Navigate between sections within the same page
     * @param sectionId - Target section ID
     * @param options - Navigation options
     */
    async navigateToSection(sectionId: string, options: SectionNavigationOptions = {}): Promise<void> {
        const {
            transitionName = `section-${sectionId}`,
            updateUrl = true,
            focus = true
        } = options;

        await this.transition(async () => {
            // Hide current section
            const currentSection = document.querySelector('main > section:not([hidden])');
            if (currentSection) {
                (currentSection as HTMLElement).hidden = true;
            }

            // Show target section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.hidden = false;
                
                // Update URL without page reload
                if (updateUrl) {
                    const newUrl = `#${sectionId}`;
                    history.pushState(null, '', newUrl);
                }

                // Focus management for accessibility
                if (focus) {
                    const focusTarget = targetSection.querySelector('h1, h2, [tabindex="0"]') as HTMLElement;
                    if (focusTarget) {
                        focusTarget.focus();
                    }
                }
            }
            
        }, { name: transitionName });
    }

    /**
     * Update page content from new document
     * @private
     */
    private updatePageContent(newDoc: Document, options: PageContentUpdateOptions = {}): void {
        const { updateTitle, pushState, url } = options;

        // Update title
        if (updateTitle && newDoc.title) {
            document.title = newDoc.title;
        }

        // Update main content
        const newMain = newDoc.querySelector('main');
        const currentMain = document.querySelector('main');
        
        if (newMain && currentMain) {
            currentMain.innerHTML = newMain.innerHTML;
        }

        // Update navigation active states
        if (url) {
            this.updateNavigationStates(url);
        }

        // Update browser history
        if (pushState && url) {
            history.pushState(null, '', url);
        }

        // Re-initialize any components in the new content
        this.reinitializeComponents();
    }

    /**
     * Update navigation active states
     * @private
     */
    private updateNavigationStates(url: string): void {
        const navLinks = document.querySelectorAll('nav a, .nav-item a') as NodeListOf<HTMLAnchorElement>;
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            if (link.href === url || link.href.endsWith(url)) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Re-initialize components after content change
     * @private
     */
    private reinitializeComponents(): void {
        // Dispatch event for components to re-initialize
        document.dispatchEvent(new CustomEvent('page-content-updated', {
            detail: { source: 'view-transition' }
        }));
    }

    /**
     * Get appropriate transition name based on URL
     * @private
     */
    private getTransitionName(url: string): string {
        if (url.includes('/about')) return 'slide-right';
        if (url.includes('/blog')) return 'slide-up';
        if (url.includes('/projects')) return 'slide-left';
        if (url.includes('/resources')) return 'fade';
        return 'default';
    }

    /**
     * Setup transition tracking and debugging
     * @private
     */
    private setupTransitionTracking(): void {
        if (!this.isSupported) return;

        // Track transition events
        document.addEventListener('DOMContentLoaded', () => {
            // Add transition class to body for CSS targeting
            document.body.classList.add('view-transitions-supported');
        });

        // Debug mode
        if (window.location.search.includes('debug-transitions')) {
            this.enableDebugMode();
        }
    }

    /**
     * Enable debug mode for transitions
     * @private
     */
    private enableDebugMode(): void {
        console.log('🎬 View Transitions Debug Mode Enabled');
        
        // Add debug styles
        const style = document.createElement('style');
        style.textContent = `
            ::view-transition-old(*),
            ::view-transition-new(*) {
                animation-duration: 2s !important;
            }
        `;
        document.head.appendChild(style);

        // Log transition events
        document.addEventListener('startViewTransition', (event) => {
            console.log('🎬 Transition started:', event);
        });
    }

    /**
     * Create a custom transition for specific elements
     * @param selector - CSS selector for elements
     * @param transitionName - Custom transition name
     */
    createCustomTransition(selector: string, transitionName: string): void {
        const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
        
        elements.forEach((element, index) => {
            element.style.viewTransitionName = `${transitionName}-${index}`;
        });
    }

    /**
     * Prefetch page for faster transitions
     * @param url - URL to prefetch
     */
    async prefetchPage(url: string): Promise<void> {
        try {
            // Use link prefetch if supported
            const link = document.createElement('link');
            if ('rel' in link) {
                link.rel = 'prefetch';
                link.href = url;
                document.head.appendChild(link);
            } else {
                // Fallback: fetch and cache
                await fetch(url);
            }
        } catch (error) {
            console.warn('Failed to prefetch page:', url, error);
        }
    }
}

// Create singleton instance
const viewTransitions = new ViewTransitions();

// Export for use in other modules
export default viewTransitions;

// Global access for debugging
if (typeof window !== 'undefined') {
    window.viewTransitions = viewTransitions;
} 
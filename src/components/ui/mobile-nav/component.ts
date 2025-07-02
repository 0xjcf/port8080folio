// Mobile Navigation Web Component - View Layer Only (TypeScript)
import { devConfig } from '../../../scripts/dev-config.js';

// Type definitions for component
interface NavEventDetail {
    source: string;
}

interface NavItemEventDetail {
    href: string;
    text: string;
}

interface TimestampEventDetail {
    timestamp: number;
}

interface DebugStateInfo {
    isOpen: boolean;
    hasOpenAttribute: boolean;
    hasNavOpenClass: boolean;
    menuVisible: boolean;
}

// Touch/gesture handling types
interface TouchData {
    startX: number;
    startY: number;
    startTime: number;
}

interface SwipeParams {
    minDistance: number;
    maxVerticalDistance: number;
    maxDuration: number;
}

class MobileNavComponent extends HTMLElement {
    public isOpen: boolean = false;
    public touchStartX: number = 0;
    public touchStartY: number = 0;
    private _globalKeyHandler: ((e: KeyboardEvent) => void) | null = null;
    private _resizeHandler: (() => void) | null = null;

    constructor() {
        super();
        this.isOpen = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        devConfig.log('Mobile nav component constructed');
    }

    connectedCallback(): void {
        devConfig.log('Mobile nav component connected');

        this.render();
        this.setupEventListeners();
        this.setupGestureHandling();
        this.setupResizeHandler();

        // Initialize proper accessibility state
        this.isOpen = false;
        this.setAttribute('aria-hidden', 'true');

        // Show on mobile/tablet or in development mode
        const shouldShow = devConfig.isDevelopment || window.innerWidth < 1024;

        if (shouldShow) {
            this.setAttribute('data-force-show', '');
            devConfig.log('Mobile nav visibility enabled', {
                reason: devConfig.isDevelopment ? 'dev-mode' : 'screen-size',
                width: window.innerWidth
            });
        }

        // Setup development features
        if (devConfig.isEnabled('enableMobileNavTesting')) {
            this.setupDevelopmentFeatures();
        }

        // Initialize content after DOM is ready
        setTimeout(() => {
            this.debugSlotContent();
            this.ensureContentIsVisible();
        }, 100);
    }

    private setupDevelopmentFeatures(): void {
        // Add development testing controls and keyboard shortcuts
        this.setupGlobalKeyHandlers();
        this.addDevelopmentTestingControls();
        this.addMouseSwipeSimulation();
    }

    disconnectedCallback(): void {
        this.cleanup();
    }

    private render(): void {
        // Create mobile navigation HTML structure
        this.innerHTML = `
      <div class="mobile-nav-container">
                  <div class="mobile-nav-backdrop" part="backdrop"></div>
          <nav class="mobile-nav-menu" part="menu" role="navigation" aria-label="Mobile navigation">
            <button class="mobile-nav-close" part="close-button" aria-label="Close navigation menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 6l12 12M6 18L18 6"/>
              </svg>
            </button>
            
            <div class="mobile-nav-content" part="content">
            <div class="mobile-nav-intro">
              <h2>Turning Complex State Into Elegant Systems</h2>
              <p>Explore tools and challenges to master state management</p>
            </div>
            <slot name="navigation">
              <!-- Fallback content if no slot provided -->
              <div class="nav-placeholder">Navigation content will appear here</div>
            </slot>
          </div>
          
          <div class="mobile-nav-footer" part="footer">
            <slot name="social">
              <!-- Fallback content if no slot provided -->
              <div class="social-placeholder">Social links will appear here</div>
            </slot>
          </div>
        </nav>
      </div>
    `;

        this.addStyles();
    }

    private addStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
      .mobile-nav-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        pointer-events: none;
        --animation-duration: 300ms;
        --animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
      }

      .mobile-nav-container.nav-open {
        pointer-events: all;
      }

      .mobile-nav-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        opacity: 0;
        transition: opacity var(--animation-duration) var(--animation-easing);
        pointer-events: none;
      }

      .mobile-nav-container.nav-open .mobile-nav-backdrop {
        opacity: 1;
        pointer-events: all;
      }

      .mobile-nav-menu {
        position: absolute;
        top: 0;
        right: 0;
        width: 80%;
        max-width: 320px;
        height: 100vh;
        height: 100dvh; /* Use dynamic viewport height when supported */
        max-height: calc(100vh - 2rem); /* Account for browser UI */
        background: var(--secondary-bg, #1a1a1a);
        box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
        transform: translateX(100%);
        transition: transform var(--animation-duration) var(--animation-easing);
        display: flex;
        flex-direction: column;
        pointer-events: all;
        overflow: hidden;
        padding-bottom: env(safe-area-inset-bottom, 1rem); /* Account for safe areas */
      }

      .mobile-nav-container.nav-open .mobile-nav-menu {
        transform: translateX(0);
      }

      .mobile-nav-close {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.8);
        padding: 0.75rem;
        cursor: pointer;
        border-radius: 50%;
        transition: all 0.2s ease;
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .mobile-nav-intro {
        padding: 4rem 2rem 1.5rem 2rem;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.1);
        margin-top: 0;
        position: relative;
        flex-shrink: 0; /* Prevent intro from shrinking */
      }

      .mobile-nav-intro h2 {
        color: var(--teagreen, #90ee90);
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
        font-family: inherit;
        letter-spacing: 0.3px;
        line-height: 1.3;
      }

      .mobile-nav-intro p {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
        font-weight: 400;
        margin: 0;
        line-height: 1.4;
        font-style: italic;
      }

      .mobile-nav-close:hover {
        background: rgba(0, 0, 0, 0.5);
        border-color: rgba(255, 255, 255, 0.2);
        color: var(--teagreen, #90ee90);
        transform: scale(1.05);
      }

      .mobile-nav-close:focus {
        outline: 2px solid var(--teagreen, #90ee90);
        outline-offset: 2px;
        background: rgba(0, 0, 0, 0.5);
        color: var(--teagreen, #90ee90);
      }

      .mobile-nav-close:active {
        transform: scale(0.95);
        transition: transform 0.1s ease;
      }

      .mobile-nav-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        display: flex;
        flex-direction: column;
        min-height: 0; /* Allow flex item to shrink */
      }

      .mobile-nav-footer {
        padding: 1.5rem 1.5rem 2rem 1.5rem; /* Extra bottom padding for mobile browsers */
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.1);
        flex-shrink: 0; /* Prevent footer from shrinking */
      }

      /* Navigation content styling */
      .mobile-nav-content .navlist {
        display: flex;
        flex-direction: column;
        gap: 0.25rem; /* Tighter spacing to fit more items */
        margin: 0;
        padding: 1rem 1.5rem 3rem 1.5rem; /* Reduced top padding, keep bottom padding for mobile browsers */
        list-style: none;
        flex: 1;
        justify-content: flex-start;
        min-height: 0;
      }

      .mobile-nav-content .nav-item {
        margin: 0;
      }

      .mobile-nav-content .nav-item a {
        display: flex;
        align-items: center;
        padding: 0.875rem 1.25rem; /* Slightly reduced padding */
        color: var(--teagreen, #90ee90);
        text-decoration: none;
        font-size: 1.1rem; /* Slightly smaller font */
        font-weight: 500;
        border-radius: 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        min-height: 44px; /* Meet minimum touch target while being compact */
        border: 1px solid transparent;
        position: relative;
        overflow: hidden;
      }

      .mobile-nav-content .nav-item a::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(13, 153, 255, 0.1), transparent);
        transition: left 0.5s ease;
      }

      .mobile-nav-content .nav-item a:hover::before,
      .mobile-nav-content .nav-item a.active::before {
        left: 100%;
      }

      .mobile-nav-content .nav-item a:hover,
      .mobile-nav-content .nav-item a.active {
        background: rgba(13, 153, 255, 0.1);
        color: var(--jasper, #ff6b6b);
        transform: translateX(8px);
        border-color: rgba(13, 153, 255, 0.3);
        box-shadow: 0 4px 12px rgba(13, 153, 255, 0.2);
      }

      .mobile-nav-content .nav-item a:focus {
        outline: 2px solid var(--jasper, #ff6b6b);
        outline-offset: 2px;
      }

      /* Social links styling */
      .mobile-nav-footer .navlist {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 1.5rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .mobile-nav-footer .social-item a {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.875rem;
        color: var(--teagreen, #90ee90);
        text-decoration: none;
        font-size: 1rem;
        border-radius: 50%;
        transition: all 0.3s ease;
        min-width: 52px;
        min-height: 52px;
        background: rgba(255, 255, 255, 0.08);
        border: 2px solid rgba(144, 238, 144, 0.3);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .mobile-nav-footer .social-item a svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
        transition: all 0.2s ease;
      }

      .mobile-nav-footer .social-item a:hover {
        background: rgba(13, 153, 255, 0.15);
        color: var(--jasper, #ff6b6b);
        transform: scale(1.05) translateY(-1px);
        box-shadow: 0 4px 16px rgba(13, 153, 255, 0.3);
        border-color: rgba(255, 107, 107, 0.6);
      }

      .mobile-nav-footer .social-item a:hover svg {
        transform: scale(1.1);
      }

      .mobile-nav-footer .social-item a:focus {
        outline: 3px solid var(--jasper, #ff6b6b);
        outline-offset: 3px;
      }

      .mobile-nav-footer .social-item .social-label {
        display: none; /* Hide text labels in mobile view */
      }

      /* Placeholder styling */
      .nav-placeholder,
      .social-placeholder {
        color: rgba(255, 255, 255, 0.5);
        font-style: italic;
        padding: 1rem;
        text-align: center;
      }

      /* Hide on large desktop only when not explicitly shown */
      @media (min-width: 1024px) {
        mobile-nav:not([data-force-show]) {
          display: none;
        }
      }
      
      /* Force show during development/testing */
      mobile-nav[data-force-show] {
        display: block !important;
      }

      /* Accessibility improvements */
      @media (prefers-reduced-motion: reduce) {
        .mobile-nav-backdrop,
        .mobile-nav-menu {
          transition: none;
        }
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .mobile-nav-menu {
          border: 2px solid;
        }
        
        .mobile-nav-header,
        .mobile-nav-footer {
          border-color: currentColor;
        }
      }
    `;

        // Add styles to document head since we're targeting the component from outside
        style.id = 'mobile-nav-styles';
        if (!document.getElementById('mobile-nav-styles')) {
            document.head.appendChild(style);
        }
    }

    private setupEventListeners(): void {
        // Close button
        const closeButton = this.querySelector<HTMLButtonElement>('.mobile-nav-close');
        closeButton?.addEventListener('click', (e: Event) => {
            this.dispatchEvent(new CustomEvent<NavEventDetail>('nav-close-requested', {
                bubbles: true,
                detail: { source: 'close-button' }
            }));

            e.preventDefault();
            e.stopPropagation();
        });

        // Backdrop click
        const backdrop = this.querySelector<HTMLElement>('.mobile-nav-backdrop');
        backdrop?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent<NavEventDetail>('nav-close-requested', {
                bubbles: true,
                detail: { source: 'backdrop' }
            }));
        });

        // Keyboard navigation (escape and focus trapping)
        this.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!this.isOpen) return;

            if (e.key === 'Escape') {
                this.dispatchEvent(new CustomEvent<NavEventDetail>('nav-close-requested', {
                    bubbles: true,
                    detail: { source: 'keyboard' }
                }));
                e.preventDefault();
            } else if (e.key === 'Tab') {
                // Focus trapping - keep focus within the mobile navigation
                this.trapFocus(e);
            }
        });

        // Menu item clicks
        this.addEventListener('click', (e: Event) => {
            const link = (e.target as Element).closest('a') as HTMLAnchorElement;
            if (link && link.href) {
                this.dispatchEvent(new CustomEvent<NavItemEventDetail>('nav-item-selected', {
                    bubbles: true,
                    detail: {
                        href: link.href,
                        text: link.textContent?.trim() || ''
                    }
                }));
            }
        });
    }

    private setupGestureHandling(): void {
        let startX = 0;
        let startY = 0;
        let startTime = 0;

        const handleTouchStart = (e: TouchEvent): void => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        };

        const handleTouchEnd = (e: TouchEvent): void => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();

            const deltaX = endX - startX;
            const deltaY = Math.abs(endY - startY);
            const duration = endTime - startTime;

            // Swipe detection parameters
            const swipeParams: SwipeParams = {
                minDistance: 50,
                maxVerticalDistance: 100,
                maxDuration: 300
            };

            // Valid horizontal swipe
            if (Math.abs(deltaX) > swipeParams.minDistance &&
                deltaY < swipeParams.maxVerticalDistance &&
                duration < swipeParams.maxDuration) {

                if (deltaX > 0 && this.isOpen) {
                    // Swipe right to close
                    this.dispatchEvent(new CustomEvent<NavEventDetail>('nav-close-requested', {
                        bubbles: true,
                        detail: { source: 'swipe-right' }
                    }));
                } else if (deltaX < 0 && !this.isOpen && startX > window.innerWidth - 50) {
                    // Swipe left from edge to open
                    this.dispatchEvent(new CustomEvent<NavEventDetail>('nav-open-requested', {
                        bubbles: true,
                        detail: { source: 'swipe-left' }
                    }));
                }
            }
        };

        // Add touch listeners to the component
        this.addEventListener('touchstart', handleTouchStart, { passive: true });
        this.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Also listen on document for edge swipes when closed
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Development testing features are set up in setupDevelopmentFeatures()
    }

    private setupGlobalKeyHandlers(): void {
        // Key handler for mobile nav testing
        this._globalKeyHandler = (e: KeyboardEvent): void => {
            // 'T' key to toggle dev panel (only when dev mode is enabled)
            if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
                const activeElement = document.activeElement as HTMLElement;
                const isInInput = activeElement &&
                    (activeElement.tagName === 'INPUT' ||
                        activeElement.tagName === 'TEXTAREA' ||
                        activeElement.isContentEditable);

                if (!isInInput && devConfig.isDevelopment) {
                    const testControls = document.getElementById('mobile-nav-dev-controls');
                    if (testControls) {
                        testControls.style.display = testControls.style.display === 'none' ? 'flex' : 'none';
                        devConfig.log('Mobile nav test panel toggled');
                        e.preventDefault();
                    }
                }
            }
        };

        document.addEventListener('keydown', this._globalKeyHandler);
    }

    private setupResizeHandler(): void {
        this._resizeHandler = (): void => {
            const shouldShow = devConfig.isDevelopment || window.innerWidth < 1024;
            if (shouldShow) {
                this.setAttribute('data-force-show', '');
            } else {
                this.removeAttribute('data-force-show');
            }
        };

        window.addEventListener('resize', this._resizeHandler);
    }

    private addDevelopmentTestingControls(): void {
        // Add development testing UI
        const testControls = document.createElement('div');
        testControls.id = 'mobile-nav-dev-controls';
        testControls.style.cssText = `
          position: fixed;
          top: 10px;
          left: 10px;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 12px;
          display: none;
          flex-direction: column;
          gap: 5px;
        `;

        testControls.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 5px;">🧪 Mobile Nav Testing</div>
          <button id="test-open" style="padding: 5px; margin: 2px; border: none; border-radius: 4px; background: #4CAF50; color: white;">Simulate Swipe Open</button>
          <button id="test-close" style="padding: 5px; margin: 2px; border: none; border-radius: 4px; background: #f44336; color: white;">Simulate Swipe Close</button>
          <button id="test-toggle" style="padding: 5px; margin: 2px; border: none; border-radius: 4px; background: #2196F3; color: white;">Toggle Menu</button>
          <button id="test-backdrop" style="padding: 5px; margin: 2px; border: none; border-radius: 4px; background: #FF9800; color: white;">Simulate Backdrop Click</button>
          <div style="margin-top: 5px; font-size: 10px; color: #ccc;">
            Press 'T' to toggle this panel
          </div>
        `;

        document.body.appendChild(testControls);

        // Test button handlers
        document.getElementById('test-open')?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent<NavEventDetail>('nav-open-requested', {
                bubbles: true,
                detail: { source: 'dev-test-swipe-left' }
            }));
        });

        document.getElementById('test-close')?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent<NavEventDetail>('nav-close-requested', {
                bubbles: true,
                detail: { source: 'dev-test-swipe-right' }
            }));
        });

        document.getElementById('test-toggle')?.addEventListener('click', () => {
            if (this.isOpen) {
                this.dispatchEvent(new CustomEvent<NavEventDetail>('nav-close-requested', {
                    bubbles: true,
                    detail: { source: 'dev-test-toggle' }
                }));
            } else {
                this.dispatchEvent(new CustomEvent<NavEventDetail>('nav-open-requested', {
                    bubbles: true,
                    detail: { source: 'dev-test-toggle' }
                }));
            }
        });

        document.getElementById('test-backdrop')?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent<NavEventDetail>('nav-close-requested', {
                bubbles: true,
                detail: { source: 'dev-test-backdrop' }
            }));
        });
    }

    private addMouseSwipeSimulation(): void {
        // Simulate touch events with mouse for desktop testing
        let isMouseDown = false;
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let swipeIndicator: HTMLElement | null = null;

        const createSwipeIndicator = (): void => {
            swipeIndicator = document.createElement('div');
            swipeIndicator.style.cssText = `
        position: fixed;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        background: rgba(13, 153, 255, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        pointer-events: none;
        font-family: monospace;
      `;
            document.body.appendChild(swipeIndicator);
        };

        const removeSwipeIndicator = (): void => {
            if (swipeIndicator) {
                swipeIndicator.remove();
                swipeIndicator = null;
            }
        };

        const handleMouseDown = (e: MouseEvent): void => {
            // More lenient detection - check if we're in mobile nav area or right edge
            const inMobileNavArea = this.isOpen && (e.target as Element).closest('mobile-nav');
            const nearRightEdge = e.clientX > window.innerWidth - 100; // Increased from 50px

            if (inMobileNavArea || nearRightEdge) {
                isMouseDown = true;
                startX = e.clientX;
                startY = e.clientY;
                startTime = Date.now();

                // Visual feedback
                document.body.style.cursor = 'grabbing';
                createSwipeIndicator();

                if (this.isOpen) {
                    swipeIndicator!.textContent = '← Drag left to close';
                } else {
                    swipeIndicator!.textContent = '← Drag left to open';
                }

                e.preventDefault(); // Prevent text selection
            }
        };

        const handleMouseUp = (e: MouseEvent): void => {
            if (!isMouseDown) return;

            isMouseDown = false;
            document.body.style.cursor = '';
            removeSwipeIndicator();

            const endX = e.clientX;
            const endY = e.clientY;
            const endTime = Date.now();

            const deltaX = endX - startX;
            const deltaY = Math.abs(endY - startY);
            const duration = endTime - startTime;

            // More relaxed swipe detection parameters
            const swipeParams: SwipeParams = {
                minDistance: 30, // Reduced from 50
                maxVerticalDistance: 150, // Increased
                maxDuration: 1000 // Increased
            };

            // Valid horizontal swipe
            if (Math.abs(deltaX) > swipeParams.minDistance &&
                deltaY < swipeParams.maxVerticalDistance &&
                duration < swipeParams.maxDuration) {

                if (deltaX > 0 && this.isOpen) {
                    // Swipe right to close
                    this.dispatchEvent(new CustomEvent<NavEventDetail>('nav-close-requested', {
                        bubbles: true,
                        detail: { source: 'mouse-swipe-right' }
                    }));
                } else if (deltaX < 0) {
                    // Swipe left to open (more permissive)
                    this.dispatchEvent(new CustomEvent<NavEventDetail>('nav-open-requested', {
                        bubbles: true,
                        detail: { source: 'mouse-swipe-left' }
                    }));
                }
            }
        };

        const handleMouseMove = (e: MouseEvent): void => {
            if (isMouseDown && swipeIndicator) {
                // Update indicator with real-time feedback
                const deltaX = e.clientX - startX;
                const progress = Math.min(Math.abs(deltaX) / 30, 1);

                if (deltaX > 0) {
                    swipeIndicator.textContent = `→ ${Math.round(progress * 100)}% (${deltaX}px)`;
                    swipeIndicator.style.background = `rgba(76, 175, 80, ${0.5 + progress * 0.3})`;
                } else {
                    swipeIndicator.textContent = `← ${Math.round(progress * 100)}% (${Math.abs(deltaX)}px)`;
                    swipeIndicator.style.background = `rgba(244, 67, 54, ${0.5 + progress * 0.3})`;
                }
            }
        };

        // Add mouse listeners
        document.addEventListener('mousedown', handleMouseDown, { passive: false });
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove);

        // Prevent text selection during swipes
        document.addEventListener('selectstart', (e: Event) => {
            if (isMouseDown) e.preventDefault();
        });
    }

    // Public API methods for state machine to call
    public open(): void {
        if (this.isOpen) {
            devConfig.log('Mobile nav already open');
            return;
        }

        devConfig.log('Opening mobile nav');
        this.isOpen = true;
        this.setAttribute('open', '');

        const container = this.querySelector<HTMLElement>('.mobile-nav-container');
        if (container) {
            container.classList.add('nav-open');
        }

        // Lock body scroll
        document.body.style.overflow = 'hidden';
        this.removeAttribute('aria-hidden');

        this.dispatchEvent(new CustomEvent<TimestampEventDetail>('nav-opened', {
            bubbles: true,
            detail: { timestamp: Date.now() }
        }));
    }

    public close(): void {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.removeAttribute('open');

        const container = this.querySelector<HTMLElement>('.mobile-nav-container');
        if (container) {
            container.classList.remove('nav-open');
        }

        // Unlock body scroll
        document.body.style.overflow = '';
        this.setAttribute('aria-hidden', 'true');

        this.dispatchEvent(new CustomEvent<TimestampEventDetail>('nav-closed', {
            bubbles: true,
            detail: { timestamp: Date.now() }
        }));
    }

    public toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    public get isMenuOpen(): boolean {
        return this.isOpen;
    }

    // Debug method
    public debugState(): DebugStateInfo {
        const container = this.querySelector<HTMLElement>('.mobile-nav-container');
        const menu = this.querySelector<HTMLElement>('.mobile-nav-menu');
        const backdrop = this.querySelector<HTMLElement>('.mobile-nav-backdrop');

        console.group('🔍 Mobile Nav Debug State');
        console.log('Component isOpen:', this.isOpen);
        console.log('Has [open] attribute:', this.hasAttribute('open'));
        console.log('Container has nav-open class:', container?.classList.contains('nav-open'));
        console.log('aria-hidden:', this.getAttribute('aria-hidden'));
        console.log('Host display:', getComputedStyle(this).display);

        if (container) {
            console.log('Container classes:', [...container.classList]);
            console.log('Container pointer-events:', getComputedStyle(container).pointerEvents);
        }

        if (menu) {
            console.log('Menu transform:', getComputedStyle(menu).transform);
            console.log('Menu transition:', getComputedStyle(menu).transition);
        }

        if (backdrop) {
            console.log('Backdrop opacity:', getComputedStyle(backdrop).opacity);
            console.log('Backdrop visibility:', getComputedStyle(backdrop).visibility);
        }

        console.log('Body overflow:', document.body.style.overflow);
        console.groupEnd();

        return {
            isOpen: this.isOpen,
            hasOpenAttribute: this.hasAttribute('open'),
            hasNavOpenClass: container?.classList.contains('nav-open') || false,
            menuVisible: menu ? getComputedStyle(menu).transform !== 'matrix(1, 0, 0, 1, 0, 0)' : false
        };
    }

    public debugSlotContent(): void {
        // Manually move slotted content since we're not using Shadow DOM
        this.moveSlottedContent();
    }

    private moveSlottedContent(): void {
        const navSlot = this.querySelector<HTMLElement>('[slot="navigation"]');
        const socialSlot = this.querySelector<HTMLElement>('[slot="social"]');
        const navSlotTarget = this.querySelector<HTMLElement>('slot[name="navigation"]');
        const socialSlotTarget = this.querySelector<HTMLElement>('slot[name="social"]');

        // Move navigation content
        if (navSlot && navSlotTarget && navSlotTarget.parentNode) {
            const navContent = navSlot.cloneNode(true) as HTMLElement;
            navContent.removeAttribute('slot');
            navSlotTarget.parentNode.replaceChild(navContent, navSlotTarget);
        }

        // Move social content  
        if (socialSlot && socialSlotTarget && socialSlotTarget.parentNode) {
            const socialContent = socialSlot.cloneNode(true) as HTMLElement;
            socialContent.removeAttribute('slot');
            socialSlotTarget.parentNode.replaceChild(socialContent, socialSlotTarget);
        }

        // Remove original slotted elements since they're now duplicated
        navSlot?.remove();
        socialSlot?.remove();
    }

    private ensureContentIsVisible(): void {
        const navContent = this.querySelector<HTMLElement>('.mobile-nav-content .navlist');
        const socialContent = this.querySelector<HTMLElement>('.mobile-nav-footer .navlist');
        const navPlaceholder = this.querySelector<HTMLElement>('.nav-placeholder');
        const socialPlaceholder = this.querySelector<HTMLElement>('.social-placeholder');

        // Hide placeholders if real content exists
        if (navContent && navContent.children.length > 0 && navPlaceholder) {
            navPlaceholder.style.display = 'none';
        }

        if (socialContent && socialContent.children.length > 0 && socialPlaceholder) {
            socialPlaceholder.style.display = 'none';
        }
    }

    // Focus trapping for accessibility
    private trapFocus(e: KeyboardEvent): void {
        const focusableElements = this.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            // Shift + Tab (backwards)
            if (document.activeElement === firstFocusable) {
                lastFocusable?.focus();
                e.preventDefault();
            }
        } else {
            // Tab (forwards)
            if (document.activeElement === lastFocusable) {
                firstFocusable?.focus();
                e.preventDefault();
            }
        }
    }

    // Public method to force refresh content (called by navbar component)
    public refreshContent(): void {
        // Try multiple times with increasing delays to catch content that might be added asynchronously
        const attempts = [50, 150, 300];
        attempts.forEach((delay) => {
            setTimeout(() => {
                this.debugSlotContent();
                this.ensureContentIsVisible();
            }, delay);
        });
    }

    private cleanup(): void {
        // Ensure body scroll is restored
        if (this.isOpen) {
            document.body.style.overflow = '';
        }

        // Remove global key handler
        if (this._globalKeyHandler) {
            document.removeEventListener('keydown', this._globalKeyHandler);
            this._globalKeyHandler = null;
        }

        // Remove resize handler
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
        }

        // Remove dev controls if they exist
        const devControls = document.getElementById('mobile-nav-dev-controls');
        devControls?.remove();
    }
}

// Define the custom element
if (!customElements.get('mobile-nav')) {
    customElements.define('mobile-nav', MobileNavComponent);
    devConfig.log('Mobile nav custom element registered');
}

export default MobileNavComponent; 
// Mobile Navigation Web Component - View Layer Only
class MobileNavComponent extends HTMLElement {
    constructor() {
        super();
        this.isOpen = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.setupGestureHandling();

        // Initialize proper accessibility state
        this.isOpen = false;
        this.setAttribute('aria-hidden', 'true');

        // Force show during development only
        if (this.isDevelopmentMode()) {
            this.setAttribute('data-force-show', '');
        }

        // Debug slot content after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.debugSlotContent();
            this.ensureContentIsVisible();
        }, 100);
    }

    isDevelopmentMode() {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('.local') ||
            window.location.protocol === 'file:' ||
            window.location.search.includes('debug=mobile-nav') ||
            window.location.search.includes('dev=true');
    }

    disconnectedCallback() {
        this.cleanup();
    }

    render() {
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

    addStyles() {
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
        padding: 4rem 2rem 2rem 2rem;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.1);
        margin-top: 0;
        position: relative;
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
        gap: 0.5rem;
        margin: 0;
        padding: 1.5rem 1.5rem 3rem 1.5rem; /* Extra bottom padding for mobile browsers */
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
        padding: 1rem 1.25rem;
        color: var(--teagreen, #90ee90);
        text-decoration: none;
        font-size: 1.125rem;
        font-weight: 500;
        border-radius: 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        min-height: 48px;
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

      /* Hide on desktop only when not explicitly shown */
      @media (min-width: 768px) {
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

    setupEventListeners() {
        // Close button
        const closeButton = this.querySelector('.mobile-nav-close');
        closeButton?.addEventListener('click', (e) => {
            this.dispatchEvent(new CustomEvent('nav-close-requested', {
                bubbles: true,
                detail: { source: 'close-button' }
            }));

            e.preventDefault();
            e.stopPropagation();
        });

        // Backdrop click
        const backdrop = this.querySelector('.mobile-nav-backdrop');
        backdrop?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('nav-close-requested', {
                bubbles: true,
                detail: { source: 'backdrop' }
            }));
        });

        // Keyboard navigation (escape and focus trapping)
        this.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            if (e.key === 'Escape') {
                this.dispatchEvent(new CustomEvent('nav-close-requested', {
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
        this.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                this.dispatchEvent(new CustomEvent('nav-item-selected', {
                    bubbles: true,
                    detail: {
                        href: link.href,
                        text: link.textContent.trim()
                    }
                }));
            }
        });
    }

    setupGestureHandling() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;

        const handleTouchStart = (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        };

        const handleTouchEnd = (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();

            const deltaX = endX - startX;
            const deltaY = Math.abs(endY - startY);
            const duration = endTime - startTime;

            // Swipe detection parameters
            const minDistance = 50;
            const maxVerticalDistance = 100;
            const maxDuration = 300;

            // Valid horizontal swipe
            if (Math.abs(deltaX) > minDistance &&
                deltaY < maxVerticalDistance &&
                duration < maxDuration) {

                if (deltaX > 0 && this.isOpen) {
                    // Swipe right to close
                    this.dispatchEvent(new CustomEvent('nav-close-requested', {
                        bubbles: true,
                        detail: { source: 'swipe-right' }
                    }));
                } else if (deltaX < 0 && !this.isOpen && startX > window.innerWidth - 50) {
                    // Swipe left from edge to open
                    this.dispatchEvent(new CustomEvent('nav-open-requested', {
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

        // Development testing: Only enable in local development
        if (this.isDevelopmentMode()) {
            this.addDevelopmentTestingControls();
            this.addMouseSwipeSimulation();
        }
    }

    addDevelopmentTestingControls() {
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

        // Show/hide controls with 'T' key
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                testControls.style.display = testControls.style.display === 'none' ? 'flex' : 'none';
            }
        });

        // Test button handlers
        document.getElementById('test-open').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('nav-open-requested', {
                bubbles: true,
                detail: { source: 'dev-test-swipe-left' }
            }));
        });

        document.getElementById('test-close').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('nav-close-requested', {
                bubbles: true,
                detail: { source: 'dev-test-swipe-right' }
            }));
        });

        document.getElementById('test-toggle').addEventListener('click', () => {
            if (this.isOpen) {
                this.dispatchEvent(new CustomEvent('nav-close-requested', {
                    bubbles: true,
                    detail: { source: 'dev-test-toggle' }
                }));
            } else {
                this.dispatchEvent(new CustomEvent('nav-open-requested', {
                    bubbles: true,
                    detail: { source: 'dev-test-toggle' }
                }));
            }
        });

        document.getElementById('test-backdrop').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('nav-close-requested', {
                bubbles: true,
                detail: { source: 'dev-test-backdrop' }
            }));
        });


    }

    addMouseSwipeSimulation() {
        // Simulate touch events with mouse for desktop testing
        let isMouseDown = false;
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let swipeIndicator = null;

        const createSwipeIndicator = () => {
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

        const removeSwipeIndicator = () => {
            if (swipeIndicator) {
                swipeIndicator.remove();
                swipeIndicator = null;
            }
        };

        const handleMouseDown = (e) => {
            // More lenient detection - check if we're in mobile nav area or right edge
            const inMobileNavArea = this.isOpen && e.target.closest('mobile-nav');
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
                    swipeIndicator.textContent = '← Drag left to close';
                } else {
                    swipeIndicator.textContent = '← Drag left to open';
                }



                e.preventDefault(); // Prevent text selection
            }
        };

        const handleMouseUp = (e) => {
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
            const minDistance = 30; // Reduced from 50
            const maxVerticalDistance = 150; // Increased
            const maxDuration = 1000; // Increased



            // Valid horizontal swipe
            if (Math.abs(deltaX) > minDistance &&
                deltaY < maxVerticalDistance &&
                duration < maxDuration) {

                if (deltaX > 0 && this.isOpen) {
                    // Swipe right to close
                    this.dispatchEvent(new CustomEvent('nav-close-requested', {
                        bubbles: true,
                        detail: { source: 'mouse-swipe-right' }
                    }));
                } else if (deltaX < 0) {
                    // Swipe left to open (more permissive)
                    this.dispatchEvent(new CustomEvent('nav-open-requested', {
                        bubbles: true,
                        detail: { source: 'mouse-swipe-left' }
                    }));
                }
            }
        };

        const handleMouseMove = (e) => {
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
        document.addEventListener('selectstart', (e) => {
            if (isMouseDown) e.preventDefault();
        });


    }

    // Public API methods for state machine to call
    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.setAttribute('open', '');

        // Add the CSS class that triggers the visual state
        const container = this.querySelector('.mobile-nav-container');
        if (container) {
            container.classList.add('nav-open');
        }

        // Lock body scroll
        document.body.style.overflow = 'hidden';
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollBarWidth}px`;

        // Remove aria-hidden when open to make content accessible
        this.removeAttribute('aria-hidden');

        // Focus management: focus the close button after animation
        setTimeout(() => {
            const firstFocusable = this.querySelector('.mobile-nav-close');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 100);

        this.dispatchEvent(new CustomEvent('nav-opened', {
            bubbles: true,
            detail: { timestamp: Date.now() }
        }));
    }

    close() {
        if (!this.isOpen) return;

        // Move focus away from any elements inside the mobile nav before closing
        const hamburgerButton = document.querySelector('.menu') ||
            document.querySelector('#menu-open-button') ||
            document.querySelector('[aria-label*="menu"]');

        if (hamburgerButton) {
            hamburgerButton.focus();
        } else {
            const safeElement = document.querySelector('nav a') || document.body;
            safeElement.focus();
        }

        this.isOpen = false;
        this.removeAttribute('open');

        // Remove the CSS class that triggers the visual state
        const container = this.querySelector('.mobile-nav-container');
        if (container) {
            container.classList.remove('nav-open');
        }

        // Unlock body scroll
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        // Set aria-hidden after focus has been moved away
        setTimeout(() => {
            this.setAttribute('aria-hidden', 'true');
        }, 10);

        this.dispatchEvent(new CustomEvent('nav-closed', {
            bubbles: true,
            detail: { timestamp: Date.now() }
        }));
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    // Properties
    get isMenuOpen() {
        return this.isOpen;
    }

    // Debug method
    debugState() {
        const container = this.querySelector('.mobile-nav-container');
        const menu = this.querySelector('.mobile-nav-menu');
        const backdrop = this.querySelector('.mobile-nav-backdrop');

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
            hasNavOpenClass: container?.classList.contains('nav-open'),
            menuVisible: menu ? getComputedStyle(menu).transform !== 'matrix(1, 0, 0, 1, 0, 0)' : false
        };
    }

    debugSlotContent() {
        // Manually move slotted content since we're not using Shadow DOM
        this.moveSlottedContent();
    }

    moveSlottedContent() {
        const navSlot = this.querySelector('[slot="navigation"]');
        const socialSlot = this.querySelector('[slot="social"]');
        const navSlotTarget = this.querySelector('slot[name="navigation"]');
        const socialSlotTarget = this.querySelector('slot[name="social"]');

        // Move navigation content
        if (navSlot && navSlotTarget) {
            const navContent = navSlot.cloneNode(true);
            navContent.removeAttribute('slot');
            navSlotTarget.parentNode.replaceChild(navContent, navSlotTarget);
        }

        // Move social content  
        if (socialSlot && socialSlotTarget) {
            const socialContent = socialSlot.cloneNode(true);
            socialContent.removeAttribute('slot');
            socialSlotTarget.parentNode.replaceChild(socialContent, socialSlotTarget);
        }

        // Remove original slotted elements since they're now duplicated
        if (navSlot) navSlot.remove();
        if (socialSlot) socialSlot.remove();
    }

    ensureContentIsVisible() {
        const navContent = this.querySelector('.mobile-nav-content .navlist');
        const socialContent = this.querySelector('.mobile-nav-footer .navlist');
        const navPlaceholder = this.querySelector('.nav-placeholder');
        const socialPlaceholder = this.querySelector('.social-placeholder');

        // Hide placeholders if real content exists
        if (navContent && navContent.children.length > 0 && navPlaceholder) {
            navPlaceholder.style.display = 'none';
        }

        if (socialContent && socialContent.children.length > 0 && socialPlaceholder) {
            socialPlaceholder.style.display = 'none';
        }
    }

    // Focus trapping for accessibility
    trapFocus(e) {
        const focusableElements = this.querySelectorAll(
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
    refreshContent() {
        // Try multiple times with increasing delays to catch content that might be added asynchronously
        const attempts = [50, 150, 300];
        attempts.forEach((delay) => {
            setTimeout(() => {
                this.debugSlotContent();
                this.ensureContentIsVisible();
            }, delay);
        });
    }

    cleanup() {
        // Ensure body scroll is restored
        if (this.isOpen) {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    }
}

// Define the custom element
if (!customElements.get('mobile-nav')) {
    customElements.define('mobile-nav', MobileNavComponent);
}

export default MobileNavComponent; 
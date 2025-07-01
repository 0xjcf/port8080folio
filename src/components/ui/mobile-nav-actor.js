/**
 * DEPRECATED: Mobile Navigation XState v4 Implementation
 * 
 * Status: DISABLED (See ui-orchestrator.js)
 * Replaced by: mobile-nav-component.js + mobile-nav-state-machine.js (XState v5)
 * 
 * This file is kept for:
 * - Emergency fallback if new system fails
 * - Reference implementation for XState v4 → v5 migration
 * - Historical documentation of architecture evolution
 * 
 * Issues that led to replacement:
 * - XState v4 API deprecation (services → actors)
 * - CSS conflicts with tablet media queries (@media min-width: 768px)
 * - Competing with new mobile-nav-component system
 * 
 * DO NOT DELETE - Keep as backup
 * Last working version: 2024-12-28
 */

import { createMachine, createActor, assign, fromPromise } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';
import { uiOrchestrator } from './ui-orchestrator.js';

// Mobile Navigation State Machine
export const mobileNavMachine = createMachine({
    id: 'mobileNav',
    initial: 'closed',
    context: {
        scrollPosition: 0,
        isSearchOpen: false,
        selectedItem: null,
        touchStartX: 0,
        touchStartY: 0,
        swipeThreshold: 50
    },
    states: {
        closed: {
            entry: 'resetMenu',
            on: {
                TOGGLE_MENU: 'opening',
                TOGGLE_SEARCH: 'searchOpen',
                SWIPE_LEFT: {
                    target: 'opening',
                    guard: 'isSwipeFromEdge'
                }
            }
        },
        opening: {
            entry: ['saveScrollPosition', 'prepareMenuAnimation', 'notifyOrchestrator'],
            invoke: {
                src: 'animateOpen',
                onDone: 'open'
            }
        },
        open: {
            entry: ['lockBodyScroll', 'focusFirstMenuItem', 'addEscapeListener'],
            exit: 'removeEscapeListener',
            on: {
                CLOSE_MENU: 'closing',
                SELECT_ITEM: {
                    target: 'closing',
                    actions: 'saveSelectedItem'
                },
                ESCAPE: 'closing',
                CLICK_BACKDROP: 'closing',
                SWIPE_RIGHT: {
                    target: 'closing',
                    guard: 'isValidSwipe'
                }
            }
        },
        closing: {
            entry: 'prepareCloseAnimation',
            invoke: {
                src: 'animateClose',
                onDone: 'closed'
            },
            exit: ['unlockBodyScroll', 'restoreScrollPosition', 'notifyOrchestratorClosed']
        },
        searchOpen: {
            entry: ['openSearchModal', 'focusSearchInput'],
            on: {
                CLOSE_SEARCH: 'closed',
                SEARCH_SUBMIT: {
                    target: 'closed',
                    actions: 'performSearch'
                },
                ESCAPE: 'closed'
            }
        }
    }
}, {
    actions: {
        saveScrollPosition: assign({
            scrollPosition: ({ context, event }) => window.scrollY || document.documentElement.scrollTop
        }),
        resetMenu: () => {
            const menu = document.querySelector('.mobile-nav-menu');
            if (menu) {
                menu.classList.remove('visible', 'animating');
            }
        },
        prepareMenuAnimation: () => {
            const menu = document.querySelector('.mobile-nav-menu');
            const backdrop = document.querySelector('.mobile-nav-backdrop');

            if (menu) {
                menu.classList.add('animating');
                menu.style.transform = 'translateX(100%)';
            }
            if (backdrop) {
                backdrop.classList.add('visible');
            }
        },
        prepareCloseAnimation: () => {
            const menu = document.querySelector('.mobile-nav-menu');
            if (menu) {
                menu.classList.add('animating');
            }
        },
        lockBodyScroll: () => {
            document.body.style.overflow = 'hidden';
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        },
        unlockBodyScroll: () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        },
        restoreScrollPosition: ({ context }) => {
            window.scrollTo(0, context.scrollPosition);
        },
        focusFirstMenuItem: () => {
            setTimeout(() => {
                const firstLink = document.querySelector('.mobile-nav-menu a');
                if (firstLink) {
                    firstLink.focus();
                }
            }, 300);
        },
        saveSelectedItem: assign({
            selectedItem: ({ context, event }) => event.item
        }),
        notifyOrchestrator: () => {
            uiOrchestrator.openModal('mobile-nav');
        },
        notifyOrchestratorClosed: () => {
            uiOrchestrator.closeModal('mobile-nav');
        },
        addEscapeListener: () => {
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    window.dispatchEvent(new CustomEvent('mobile-nav-escape'));
                }
            };
            window.addEventListener('keydown', handleEscape);
            window.__mobileNavEscapeHandler = handleEscape;
        },
        removeEscapeListener: () => {
            if (window.__mobileNavEscapeHandler) {
                window.removeEventListener('keydown', window.__mobileNavEscapeHandler);
                delete window.__mobileNavEscapeHandler;
            }
        },
        openSearchModal: () => {
            document.dispatchEvent(new CustomEvent('search-toggle'));
        },
        focusSearchInput: () => {
            setTimeout(() => {
                const searchInput = document.querySelector('.search-modal-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 100);
        },
        performSearch: (_, event) => {
            // Implement search functionality
            console.log('Searching for:', event.query);
        }
    },
    guards: {
        isSwipeFromEdge: ({ context, event }) => {
            return event.startX > window.innerWidth - 50;
        },
        isValidSwipe: ({ context, event }) => {
            return event.distance > context.swipeThreshold;
        }
    },
    actors: {
        animateOpen: fromPromise(async () => {
            const menu = document.querySelector('.mobile-nav-menu');
            if (menu) {
                await new Promise(resolve => requestAnimationFrame(resolve));
                menu.classList.add('visible');
                menu.style.transform = 'translateX(0)';
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }),
        animateClose: fromPromise(async () => {
            const menu = document.querySelector('.mobile-nav-menu');
            const backdrop = document.querySelector('.mobile-nav-backdrop');

            if (menu) {
                menu.style.transform = 'translateX(100%)';
                menu.classList.remove('visible');
            }
            if (backdrop) {
                backdrop.classList.remove('visible');
            }

            await new Promise(resolve => setTimeout(resolve, 300));
        })
    }
});

// Enhanced NavbarComponent with mobile navigation
export function enhanceNavbarForMobile(navbarElement) {
    // Create mobile navigation actor
    const mobileNavActor = createActor(mobileNavMachine);

    // Add mobile menu structure
    const mobileMenuHTML = `
    <div class="mobile-nav-backdrop"></div>
    <div class="mobile-nav-menu">
      <div class="mobile-nav-header">
        <brand-icon size="48" animate="true" icon-type="state-machine"></brand-icon>
        <button class="mobile-nav-close" aria-label="Close menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 6l12 12M6 18L18 6"/>
          </svg>
        </button>
      </div>
      <nav class="mobile-nav-content">
        ${navbarElement.querySelector('.primary-nav').innerHTML}
      </nav>
      <div class="mobile-nav-footer">
        ${navbarElement.querySelector('.secondary-nav').innerHTML}
      </div>
    </div>
  `;

    // Add mobile menu to navbar
    navbarElement.insertAdjacentHTML('beforeend', mobileMenuHTML);

    // Start the actor
    mobileNavActor.start();

    // Setup event listeners
    const menuButton = navbarElement.querySelector('.menu');
    const closeButton = navbarElement.querySelector('.mobile-nav-close');
    const backdrop = navbarElement.querySelector('.mobile-nav-backdrop');
    const menuLinks = navbarElement.querySelectorAll('.mobile-nav-menu a');

    menuButton?.addEventListener('click', () => {
        mobileNavActor.send({ type: 'TOGGLE_MENU' });
    });

    closeButton?.addEventListener('click', () => {
        mobileNavActor.send({ type: 'CLOSE_MENU' });
    });

    backdrop?.addEventListener('click', () => {
        mobileNavActor.send({ type: 'CLICK_BACKDROP' });
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavActor.send({ type: 'SELECT_ITEM', item: link.href });
        });
    });

    // Handle escape key
    window.addEventListener('mobile-nav-escape', () => {
        mobileNavActor.send({ type: 'ESCAPE' });
    });

    // Touch gesture support
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);

        // Only trigger on horizontal swipes
        if (Math.abs(deltaX) > 50 && deltaY < 100) {
            if (deltaX < 0) {
                // Swipe left
                mobileNavActor.send({
                    type: 'SWIPE_LEFT',
                    startX: touchStartX,
                    distance: Math.abs(deltaX)
                });
            } else {
                // Swipe right
                mobileNavActor.send({
                    type: 'SWIPE_RIGHT',
                    distance: Math.abs(deltaX)
                });
            }
        }
    });

    // Add mobile navigation styles
    const style = document.createElement('style');
    style.textContent = `
    .mobile-nav-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      z-index: 998;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    
    .mobile-nav-backdrop.visible {
      opacity: 1;
      visibility: visible;
    }
    
    .mobile-nav-menu {
      position: fixed;
      top: 0;
      right: 0;
      width: 80%;
      max-width: 320px;
      height: 100%;
      background: var(--secondary-bg);
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
      z-index: 999;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
    }
    
    .mobile-nav-menu.animating {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .mobile-nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .mobile-nav-close {
      background: transparent;
      border: none;
      color: var(--teagreen);
      padding: 0.5rem;
      cursor: pointer;
      transition: color 0.2s ease;
    }
    
    .mobile-nav-close:hover {
      color: var(--jasper);
    }
    
    .mobile-nav-content {
      flex: 1;
      padding: 2rem 1.5rem;
      overflow-y: auto;
    }
    
    .mobile-nav-content .navlist {
      flex-direction: column;
      gap: 1rem;
    }
    
    .mobile-nav-content .nav-item {
      margin: 0;
    }
    
    .mobile-nav-content .nav-item a {
      display: block;
      padding: 0.75rem 1rem;
      font-size: 1.125rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    
    .mobile-nav-content .nav-item a:hover,
    .mobile-nav-content .nav-item a.active {
      background: rgba(13, 153, 255, 0.1);
      transform: translateX(4px);
    }
    
    .mobile-nav-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .mobile-nav-footer .navlist {
      justify-content: center;
      gap: 1.5rem;
    }
    
    @media (min-width: 768px) {
      .mobile-nav-backdrop,
      .mobile-nav-menu {
        display: none;
      }
    }
  `;
    document.head.appendChild(style);

    return mobileNavActor;
}

// Extend the existing NavbarComponent
if (typeof window !== 'undefined') {
    const originalConnectedCallback = window.customElements.get('nav-bar')?.prototype.connectedCallback;

    if (originalConnectedCallback) {
        window.customElements.get('nav-bar').prototype.initMobileEnhancements = function () {
            if (uiOrchestrator.isMobile() || uiOrchestrator.isTablet()) {
                this.mobileNavActor = enhanceNavbarForMobile(this);
            }
        };
    }
} 
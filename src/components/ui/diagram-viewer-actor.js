import { createMachine, createActor, assign } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';
import { uiOrchestrator } from './ui-orchestrator.js';

// Diagram Viewer State Machine
export const diagramViewerMachine = createMachine({
    id: 'diagramViewer',
    initial: 'detecting',
    context: {
        viewportSize: 'mobile',
        animationSpeed: 1,
        currentStep: 0,
        totalSteps: 3, // idle -> ORDER -> makingCoffee -> COMPLETE -> done
        isPaused: false,
        isFullscreen: false,
        touchStartX: 0,
        touchStartY: 0,
        diagramElement: null
    },
    states: {
        detecting: {
            entry: 'detectViewport',
            always: [
                { target: 'mobile', cond: 'isMobileViewport' },
                { target: 'desktop' }
            ]
        },
        mobile: {
            entry: ['adjustDiagramScale', 'enableTouchControls', 'showMobileControls'],
            initial: 'interactive',
            states: {
                interactive: {
                    on: {
                        TAP: 'stepThrough',
                        SWIPE_LEFT: {
                            actions: 'nextStep'
                        },
                        SWIPE_RIGHT: {
                            actions: 'previousStep'
                        },
                        EXPAND: 'fullscreen',
                        PLAY: 'autoPlay'
                    }
                },
                stepThrough: {
                    entry: 'showStepIndicator',
                    on: {
                        NEXT: {
                            actions: 'animateNextStep'
                        },
                        PREVIOUS: {
                            actions: 'animatePreviousStep'
                        },
                        PLAY: 'autoPlay',
                        TAP_OUTSIDE: 'interactive'
                    }
                },
                autoPlay: {
                    entry: 'startAutoAnimation',
                    exit: 'stopAutoAnimation',
                    on: {
                        PAUSE: 'stepThrough',
                        TAP: 'stepThrough',
                        ANIMATION_COMPLETE: {
                            actions: 'resetAnimation'
                        }
                    }
                },
                fullscreen: {
                    entry: ['enterFullscreen', 'notifyOrchestrator'],
                    exit: ['exitFullscreen', 'notifyOrchestratorClosed'],
                    initial: 'viewing',
                    states: {
                        viewing: {
                            on: {
                                EXIT_FULLSCREEN: '#diagramViewer.mobile.interactive',
                                PLAY: 'playing',
                                NEXT: {
                                    actions: 'animateNextStep'
                                },
                                PREVIOUS: {
                                    actions: 'animatePreviousStep'
                                }
                            }
                        },
                        playing: {
                            entry: 'startAutoAnimation',
                            exit: 'stopAutoAnimation',
                            on: {
                                PAUSE: 'viewing',
                                EXIT_FULLSCREEN: '#diagramViewer.mobile.interactive'
                            }
                        }
                    }
                }
            }
        },
        desktop: {
            entry: 'enableDesktopAnimation',
            on: {
                VIEWPORT_CHANGE: {
                    target: 'detecting'
                }
            }
        }
    }
}, {
    actions: {
        detectViewport: assign({
            viewportSize: () => {
                const width = window.innerWidth;
                if (width < 768) return 'mobile';
                if (width < 1024) return 'tablet';
                return 'desktop';
            }
        }),
        adjustDiagramScale: (context) => {
            const diagram = context.diagramElement;
            if (!diagram) return;

            const statesFlow = diagram.querySelector('.states-flow');
            if (statesFlow && context.viewportSize === 'mobile') {
                statesFlow.style.transform = 'scale(0.85)';
                statesFlow.style.transformOrigin = 'center';
            }
        },
        enableTouchControls: (context) => {
            const diagram = context.diagramElement;
            if (!diagram) return;

            let touchStartX = 0;
            let touchStartY = 0;

            const handleTouchStart = (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            };

            const handleTouchEnd = (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const deltaX = touchEndX - touchStartX;
                const deltaY = Math.abs(touchEndY - touchStartY);

                if (Math.abs(deltaX) > 50 && deltaY < 50) {
                    if (deltaX > 0) {
                        window.dispatchEvent(new CustomEvent('diagram-swipe', {
                            detail: { direction: 'right', diagramId: diagram.id }
                        }));
                    } else {
                        window.dispatchEvent(new CustomEvent('diagram-swipe', {
                            detail: { direction: 'left', diagramId: diagram.id }
                        }));
                    }
                } else if (Math.abs(deltaX) < 10 && deltaY < 10) {
                    window.dispatchEvent(new CustomEvent('diagram-tap', {
                        detail: { diagramId: diagram.id }
                    }));
                }
            };

            diagram.addEventListener('touchstart', handleTouchStart);
            diagram.addEventListener('touchend', handleTouchEnd);

            // Store handlers for cleanup
            diagram.__touchHandlers = { handleTouchStart, handleTouchEnd };
        },
        showMobileControls: (context) => {
            const diagram = context.diagramElement;
            if (!diagram) return;

            // Add mobile control buttons
            const controls = document.createElement('div');
            controls.className = 'diagram-mobile-controls';
            controls.innerHTML = `
        <button class="diagram-control diagram-play" aria-label="Play animation">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
        <button class="diagram-control diagram-step-prev" aria-label="Previous step">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span class="diagram-step-indicator">Step 1 / 4</span>
        <button class="diagram-control diagram-step-next" aria-label="Next step">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <button class="diagram-control diagram-fullscreen" aria-label="Fullscreen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
          </svg>
        </button>
      `;

            diagram.appendChild(controls);

            // Add event listeners
            controls.querySelector('.diagram-play').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('diagram-play', {
                    detail: { diagramId: diagram.id }
                }));
            });

            controls.querySelector('.diagram-step-prev').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('diagram-step', {
                    detail: { direction: 'previous', diagramId: diagram.id }
                }));
            });

            controls.querySelector('.diagram-step-next').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('diagram-step', {
                    detail: { direction: 'next', diagramId: diagram.id }
                }));
            });

            controls.querySelector('.diagram-fullscreen').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('diagram-fullscreen', {
                    detail: { diagramId: diagram.id }
                }));
            });
        },
        showStepIndicator: (context) => {
            const indicator = context.diagramElement?.querySelector('.diagram-step-indicator');
            if (indicator) {
                indicator.textContent = `Step ${context.currentStep + 1} / ${context.totalSteps + 1}`;
            }
        },
        animateNextStep: assign({
            currentStep: (context) => {
                const nextStep = (context.currentStep + 1) % (context.totalSteps + 1);

                // Update visual state
                const diagram = context.diagramElement;
                if (diagram) {
                    const states = diagram.querySelectorAll('.state-box');
                    const events = diagram.querySelectorAll('.state-event');

                    // Reset all
                    states.forEach(s => s.classList.remove('active'));
                    events.forEach(e => e.classList.remove('firing'));

                    // Animate based on step
                    switch (nextStep) {
                        case 0: // idle
                            states[0]?.classList.add('active');
                            break;
                        case 1: // ORDER event
                            states[0]?.classList.add('active');
                            events[0]?.classList.add('firing');
                            break;
                        case 2: // makingCoffee
                            states[1]?.classList.add('active');
                            break;
                        case 3: // COMPLETE event
                            states[1]?.classList.add('active');
                            events[1]?.classList.add('firing');
                            break;
                        case 4: // done
                            states[2]?.classList.add('active');
                            break;
                    }

                    // Update indicator
                    const indicator = diagram.querySelector('.diagram-step-indicator');
                    if (indicator) {
                        indicator.textContent = `Step ${nextStep + 1} / ${context.totalSteps + 1}`;
                    }
                }

                return nextStep;
            }
        }),
        animatePreviousStep: assign({
            currentStep: (context) => {
                const prevStep = context.currentStep > 0 ? context.currentStep - 1 : context.totalSteps;

                // Update visual state (same logic as next)
                const diagram = context.diagramElement;
                if (diagram) {
                    const states = diagram.querySelectorAll('.state-box');
                    const events = diagram.querySelectorAll('.state-event');

                    states.forEach(s => s.classList.remove('active'));
                    events.forEach(e => e.classList.remove('firing'));

                    switch (prevStep) {
                        case 0:
                            states[0]?.classList.add('active');
                            break;
                        case 1:
                            states[0]?.classList.add('active');
                            events[0]?.classList.add('firing');
                            break;
                        case 2:
                            states[1]?.classList.add('active');
                            break;
                        case 3:
                            states[1]?.classList.add('active');
                            events[1]?.classList.add('firing');
                            break;
                        case 4:
                            states[2]?.classList.add('active');
                            break;
                    }

                    const indicator = diagram.querySelector('.diagram-step-indicator');
                    if (indicator) {
                        indicator.textContent = `Step ${prevStep + 1} / ${context.totalSteps + 1}`;
                    }
                }

                return prevStep;
            }
        }),
        startAutoAnimation: (context) => {
            const playButton = context.diagramElement?.querySelector('.diagram-play');
            if (playButton) {
                playButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
        `;
            }

            // Start animation loop
            const animateStep = () => {
                window.dispatchEvent(new CustomEvent('diagram-step', {
                    detail: { direction: 'next', diagramId: context.diagramElement?.id }
                }));
            };

            context.animationInterval = setInterval(animateStep, 2000);
        },
        stopAutoAnimation: (context) => {
            if (context.animationInterval) {
                clearInterval(context.animationInterval);
            }

            const playButton = context.diagramElement?.querySelector('.diagram-play');
            if (playButton) {
                playButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
            }
        },
        enterFullscreen: (context) => {
            const modal = document.createElement('div');
            modal.className = 'diagram-fullscreen-modal';
            modal.innerHTML = `
        <div class="diagram-fullscreen-backdrop"></div>
        <div class="diagram-fullscreen-content">
          <div class="diagram-fullscreen-header">
            <h3>State Machine Animation</h3>
            <button class="diagram-fullscreen-close" aria-label="Exit fullscreen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="diagram-fullscreen-body">
            ${context.diagramElement?.querySelector('.statechart-diagram').outerHTML || ''}
          </div>
          <div class="diagram-fullscreen-controls">
            <button class="diagram-control diagram-play-full" aria-label="Play">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <button class="diagram-control diagram-step-prev-full" aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span class="diagram-step-indicator-full">Step ${context.currentStep + 1} / ${context.totalSteps + 1}</span>
            <button class="diagram-control diagram-step-next-full" aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      `;

            document.body.appendChild(modal);
            context.fullscreenModal = modal;

            // Apply current state
            const states = modal.querySelectorAll('.state-box');
            const events = modal.querySelectorAll('.state-event');
            const originalStates = context.diagramElement?.querySelectorAll('.state-box');
            const originalEvents = context.diagramElement?.querySelectorAll('.state-event');

            states.forEach((state, i) => {
                if (originalStates?.[i]?.classList.contains('active')) {
                    state.classList.add('active');
                }
            });

            events.forEach((event, i) => {
                if (originalEvents?.[i]?.classList.contains('firing')) {
                    event.classList.add('firing');
                }
            });

            // Add animation
            setTimeout(() => {
                modal.classList.add('visible');
            }, 10);

            // Event listeners
            modal.querySelector('.diagram-fullscreen-close').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('diagram-fullscreen-exit', {
                    detail: { diagramId: context.diagramElement?.id }
                }));
            });

            modal.querySelector('.diagram-play-full').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('diagram-play', {
                    detail: { diagramId: context.diagramElement?.id }
                }));
            });

            modal.querySelector('.diagram-step-prev-full').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('diagram-step', {
                    detail: { direction: 'previous', diagramId: context.diagramElement?.id }
                }));
            });

            modal.querySelector('.diagram-step-next-full').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('diagram-step', {
                    detail: { direction: 'next', diagramId: context.diagramElement?.id }
                }));
            });
        },
        exitFullscreen: (context) => {
            if (context.fullscreenModal) {
                context.fullscreenModal.classList.remove('visible');
                setTimeout(() => {
                    context.fullscreenModal.remove();
                    context.fullscreenModal = null;
                }, 300);
            }
        },
        resetAnimation: assign({
            currentStep: 0
        }),
        notifyOrchestrator: (context) => {
            uiOrchestrator.openModal(`diagram-${context.diagramElement?.id}`);
        },
        notifyOrchestratorClosed: (context) => {
            uiOrchestrator.closeModal(`diagram-${context.diagramElement?.id}`);
        }
    },
    guards: {
        isMobileViewport: () => window.innerWidth < 768
    }
});

// Enhance diagram components for mobile
export function enhanceDiagramForMobile(diagramElement) {
    const actor = createActor(diagramViewerMachine, {
        context: {
            diagramElement
        }
    });

    actor.start();

    // Event listeners
    window.addEventListener('diagram-swipe', (e) => {
        if (e.detail.diagramId === diagramElement.id) {
            actor.send({
                type: e.detail.direction === 'left' ? 'SWIPE_LEFT' : 'SWIPE_RIGHT'
            });
        }
    });

    window.addEventListener('diagram-tap', (e) => {
        if (e.detail.diagramId === diagramElement.id) {
            actor.send({ type: 'TAP' });
        }
    });

    window.addEventListener('diagram-play', (e) => {
        if (e.detail.diagramId === diagramElement.id) {
            actor.send({ type: 'PLAY' });
        }
    });

    window.addEventListener('diagram-step', (e) => {
        if (e.detail.diagramId === diagramElement.id) {
            actor.send({
                type: e.detail.direction === 'next' ? 'NEXT' : 'PREVIOUS'
            });
        }
    });

    window.addEventListener('diagram-fullscreen', (e) => {
        if (e.detail.diagramId === diagramElement.id) {
            actor.send({ type: 'EXPAND' });
        }
    });

    window.addEventListener('diagram-fullscreen-exit', (e) => {
        if (e.detail.diagramId === diagramElement.id) {
            actor.send({ type: 'EXIT_FULLSCREEN' });
        }
    });

    return actor;
}

// Add styles
const style = document.createElement('style');
style.textContent = `
  .diagram-mobile-controls {
    display: none;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    margin-top: 1rem;
  }
  
  @media (max-width: 768px) {
    .diagram-mobile-controls {
      display: flex;
    }
  }
  
  .diagram-control {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: var(--teagreen);
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .diagram-control:hover {
    background: rgba(13, 153, 255, 0.2);
    color: var(--jasper);
    transform: scale(1.1);
  }
  
  .diagram-step-indicator {
    color: var(--teagreen);
    font-size: 0.875rem;
    font-weight: 600;
    min-width: 100px;
    text-align: center;
  }
  
  .diagram-fullscreen-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }
  
  .diagram-fullscreen-modal.visible {
    opacity: 1;
    visibility: visible;
  }
  
  .diagram-fullscreen-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
  }
  
  .diagram-fullscreen-content {
    position: relative;
    width: 95%;
    height: 95%;
    max-width: 1200px;
    background: var(--secondary-bg);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  }
  
  .diagram-fullscreen-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .diagram-fullscreen-header h3 {
    margin: 0;
    color: var(--heading-color);
    font-size: 1.25rem;
  }
  
  .diagram-fullscreen-close {
    background: transparent;
    border: none;
    color: var(--teagreen);
    padding: 0.5rem;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  
  .diagram-fullscreen-close:hover {
    color: var(--jasper);
  }
  
  .diagram-fullscreen-body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    padding: 2rem;
  }
  
  .diagram-fullscreen-body .statechart-diagram {
    margin: 0;
    width: 100%;
  }
  
  .diagram-fullscreen-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .diagram-step-indicator-full {
    color: var(--teagreen);
    font-size: 1rem;
    font-weight: 600;
    min-width: 120px;
    text-align: center;
  }
  
  @media (max-width: 768px) {
    .diagram-fullscreen-content {
      width: 100%;
      height: 100%;
      border-radius: 0;
    }
    
    .diagram-fullscreen-body {
      padding: 1rem;
    }
    
    .diagram-fullscreen-body .states-flow {
      transform: scale(0.9) !important;
    }
  }
`;
document.head.appendChild(style);

// Extend diagram components
if (typeof window !== 'undefined') {
    const DiagramComponent = window.customElements.get('state-machine-diagram-enhanced');

    if (DiagramComponent) {
        DiagramComponent.prototype.initMobileEnhancements = function () {
            if (uiOrchestrator.isMobile() || uiOrchestrator.isTablet()) {
                // Generate unique ID if not present
                if (!this.id) {
                    this.id = `diagram-${Date.now()}`;
                }

                this.diagramActor = enhanceDiagramForMobile(this);
            }
        };
    }
} 
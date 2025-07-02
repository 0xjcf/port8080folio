// Import XState v5 dependencies (using import map)
import { createMachine, createActor, assign } from 'xstate';

// Type declarations for XState v5
interface XStateActor<T = any> {
  start(): void;
  stop(): void;
  getSnapshot(): { value: string | object; context: T };
}

type XStateMachine = any; // Simplified for browser compatibility

// Type definitions for animation state machine
interface AnimationContext {
  currentStateIndex: number;
  states: NodeListOf<Element>;
  events: NodeListOf<Element>;
  totalStates: number;
}

type AnimationEvent = 
  | { type: 'START_ANIMATION' }
  | { type: 'NEXT_STATE' }
  | { type: 'FIRE_EVENT' }
  | { type: 'PAUSE' };

type AnimationState = 
  | 'idle'
  | 'animating' 
  | 'eventFiring'
  | 'nextState'
  | 'pausing';

interface StateIndicator {
  type: 'start' | 'end';
  symbol: string;
}

interface StateElement {
  name: string;
  isActive: boolean;
}

interface EventElement {
  name: string;
  isFiring: boolean;
}

interface DiagramFlow {
  states: StateElement[];
  events: EventElement[];
  indicators: StateIndicator[];
}

// Animation machine type (using any for TypeScript simplicity)
type AnimationMachine = XStateMachine;
type AnimationActor = XStateActor<AnimationContext>;

class StateMachineDiagramEnhanced extends HTMLElement {
  private animationActor: AnimationActor | null = null;
  
  private static readonly ANIMATION_TIMING = {
    INITIAL_DELAY: 100,
    STATE_DURATION: 500,
    EVENT_DURATION: 1000,
    CYCLE_DURATION: 1500,
    PAUSE_DURATION: 2000
  } as const;

  private static readonly DIAGRAM_FLOW: DiagramFlow = {
    states: [
      { name: 'idle', isActive: false },
      { name: 'makingCoffee', isActive: false },
      { name: 'done', isActive: false }
    ],
    events: [
      { name: 'ORDER', isFiring: false },
      { name: 'COMPLETE', isFiring: false }
    ],
    indicators: [
      { type: 'start', symbol: '●' },
      { type: 'end', symbol: '■' }
    ]
  } as const;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.animationActor = null;
  }

  connectedCallback(): void {
    this.render();
    this.startAnimation();
  }

  disconnectedCallback(): void {
    this.stopAnimation();
  }

  private createAnimationMachine(): AnimationMachine {
    const states = this.shadowRoot!.querySelectorAll('.state-box');
    const events = this.shadowRoot!.querySelectorAll('.state-event');
    const totalStates = states.length;

    return createMachine({
      id: 'diagramAnimation',
      initial: 'idle' as AnimationState,
      context: {
        currentStateIndex: 0,
        states,
        events,
        totalStates
      } as AnimationContext,
      states: {
        idle: {
          after: {
            [StateMachineDiagramEnhanced.ANIMATION_TIMING.INITIAL_DELAY]: 'animating'
          }
        },
        animating: {
          entry: ({ context }: { context: AnimationContext }) => {
            this.resetAnimationStates(context);
            this.activateCurrentState(context);
          },
          after: {
            [StateMachineDiagramEnhanced.ANIMATION_TIMING.STATE_DURATION]: {
              target: 'eventFiring',
              guard: ({ context }: { context: AnimationContext }) => 
                context.currentStateIndex < context.events.length
            },
            [StateMachineDiagramEnhanced.ANIMATION_TIMING.CYCLE_DURATION]: 'nextState'
          }
        },
        eventFiring: {
          entry: ({ context }: { context: AnimationContext }) => {
            this.activateCurrentEvent(context);
          },
          after: {
            [StateMachineDiagramEnhanced.ANIMATION_TIMING.EVENT_DURATION]: 'nextState'
          }
        },
        nextState: {
          entry: assign({
            currentStateIndex: ({ context }: { context: AnimationContext }) => 
              (context.currentStateIndex + 1) % (context.totalStates + 1)
          }),
          always: [
            {
              target: 'pausing',
              guard: ({ context }: { context: AnimationContext }) => 
                context.currentStateIndex === 0
            },
            {
              target: 'animating'
            }
          ]
        },
        pausing: {
          entry: ({ context }: { context: AnimationContext }) => {
            this.resetAnimationStates(context);
          },
          after: {
            [StateMachineDiagramEnhanced.ANIMATION_TIMING.PAUSE_DURATION]: 'animating'
          }
        }
      }
    });
  }

  private resetAnimationStates(context: AnimationContext): void {
    context.states.forEach((state: Element) => {
      state.classList.remove('active');
    });
    context.events.forEach((event: Element) => {
      event.classList.remove('firing');
    });
  }

  private activateCurrentState(context: AnimationContext): void {
    if (context.currentStateIndex < context.states.length && 
        context.states[context.currentStateIndex]) {
      context.states[context.currentStateIndex].classList.add('active');
    }
  }

  private activateCurrentEvent(context: AnimationContext): void {
    if (context.events[context.currentStateIndex]) {
      context.events[context.currentStateIndex].classList.add('firing');
    }
  }

  private startAnimation(): void {
    this.stopAnimation();

    try {
      const machine = this.createAnimationMachine();
      this.animationActor = createActor(machine);
      this.animationActor.start();
    } catch (error) {
      console.warn('StateMachineDiagramEnhanced: Failed to start animation:', error);
    }
  }

  private stopAnimation(): void {
    if (this.animationActor) {
      try {
        this.animationActor.stop();
      } catch (error) {
        console.warn('StateMachineDiagramEnhanced: Failed to stop animation:', error);
      }
      this.animationActor = null;
    }
  }

  private renderDiagramFlow(): string {
    return `
      <div class="states-flow">
        <span class="state-indicator start">${StateMachineDiagramEnhanced.DIAGRAM_FLOW.indicators[0].symbol}</span>
        <div class="state-box">idle</div>
        <span class="state-arrow">→</span>
        <span class="state-event">ORDER</span>
        <span class="state-arrow">→</span>
        <div class="state-box">makingCoffee</div>
        <span class="state-arrow">→</span>
        <span class="state-event">COMPLETE</span>
        <span class="state-arrow">→</span>
        <div class="state-box">done</div>
        <span class="state-indicator end">${StateMachineDiagramEnhanced.DIAGRAM_FLOW.indicators[1].symbol}</span>
      </div>
    `;
  }

  private renderXStateIntro(): string {
    return `
      <div class="xstate-intro">
        <div class="xstate-logo">
          <span>⚡</span> XState
        </div>
        <p class="xstate-description">
          ${this.escapeHtml('The industry-standard library for state machines in JavaScript. Used by Microsoft, Netflix, and thousands of production apps.')}
        </p>
        <p class="xstate-lead-in">
          ${this.escapeHtml('Let\'s see how XState transforms our coffee shop into clean, maintainable code...')}
        </p>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getBasePath(): string {
    const componentPath = new URL(import.meta.url).pathname;
    return componentPath.substring(0, componentPath.indexOf('/src/'));
  }

  private render(): void {
    const basePath = this.getBasePath();
    const styleHref = `${basePath}/src/styles/state-machine-education.css`;

    this.shadowRoot!.innerHTML = `
      <link rel="stylesheet" href="${styleHref}">
      
      <style>
        /* Enhanced diagram styles */
        .statechart-diagram {
          background: #0f0f0f;
          background-image: 
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 20px 20px;
          border: 1px solid #2a2a2a;
          border-radius: 16px;
          padding: 3rem 2rem;
          margin: 2rem auto;
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 1000px;
          box-sizing: border-box;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        
        .states-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          font-family: monospace;
          min-width: max-content;
          padding: 2rem;
        }
        
        .state-box {
          background: #2a2a2a;
          padding: 1rem 2rem;
          border-radius: 8px;
          color: #e0e0e0;
          white-space: nowrap;
          font-size: 1.25rem;
          flex-shrink: 0;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .state-box::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, var(--jasper), var(--jasper-light));
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .state-box.active {
          border-color: var(--jasper);
          transform: scale(1.1);
          box-shadow: 0 4px 20px rgba(13, 153, 255, 0.4);
        }
        
        .state-box.active::before {
          opacity: 0.1;
        }
        
        .state-event {
          color: #666;
          font-size: 1rem;
          white-space: nowrap;
          flex-shrink: 0;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .state-event.firing {
          color: var(--jasper);
          transform: scale(1.2);
          text-shadow: 0 0 10px rgba(13, 153, 255, 0.5);
        }
        
        .state-arrow {
          color: #666;
          font-size: 1.5rem;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        
        .state-event.firing + .state-arrow {
          color: var(--jasper);
        }
        
        .statechart-title {
          text-align: center;
          color: var(--teagreen);
          font-size: 1.2rem;
          margin-bottom: 2rem;
          font-weight: 600;
        }
        
        .pro-tip {
          text-align: center;
          margin-top: 2rem;
          padding: 1rem;
          background: rgba(13, 153, 255, 0.05);
          border-radius: 8px;
          color: var(--teagreen);
          font-style: italic;
        }
        
        .pro-tip strong {
          color: var(--jasper);
        }
        
        /* XState introduction */
        .xstate-intro {
          margin-top: 3rem;
          padding: 2rem;
          background: rgba(13, 153, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(13, 153, 255, 0.2);
        }
        
        .xstate-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--jasper);
          margin-bottom: 1rem;
        }
        
        .xstate-description {
          color: var(--teagreen);
          font-size: 1.1rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        
        .xstate-lead-in {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .statechart-diagram {
            padding: 2rem 1rem;
          }
          
          .states-flow {
            gap: 1rem;
            padding: 1rem;
            transform: scale(0.85);
            transform-origin: center;
          }
          
          .state-box {
            padding: 0.75rem 1.25rem;
            font-size: 1rem;
          }
        }
      </style>
      
      <div class="container">
        <!-- State machine diagram - Full width section -->
        <div class="statechart-diagram-container">
          <h3 class="concept-title">📊 From Chaos to Clarity: State Machines</h3>
          
          <div class="statechart-diagram">
            <div class="statechart-title">Watch how state machines work:</div>
            ${this.renderDiagramFlow()}
          </div>
          
          <p class="pro-tip">
            <strong>Pro tip:</strong> State machines make impossible states impossible. No more "loading AND error" bugs!
          </p>
          
          <!-- XState introduction -->
          ${this.renderXStateIntro()}
        </div>
      </div>
    `;
  }

  // Public API for external interactions
  public isAnimationRunning(): boolean {
    return this.animationActor !== null;
  }

  public restartAnimation(): void {
    this.startAnimation();
  }

  public pauseAnimation(): void {
    this.stopAnimation();
  }

  public getAnimationTiming(): typeof StateMachineDiagramEnhanced.ANIMATION_TIMING {
    return { ...StateMachineDiagramEnhanced.ANIMATION_TIMING };
  }

  public getDiagramFlow(): DiagramFlow {
    return { 
      states: [...StateMachineDiagramEnhanced.DIAGRAM_FLOW.states],
      events: [...StateMachineDiagramEnhanced.DIAGRAM_FLOW.events],
      indicators: [...StateMachineDiagramEnhanced.DIAGRAM_FLOW.indicators]
    };
  }

  public getCurrentAnimationState(): string | null {
    if (!this.animationActor) return null;
    
    try {
      const snapshot = this.animationActor.getSnapshot();
      return snapshot.value as string;
    } catch (error) {
      console.warn('Failed to get animation state:', error);
      return null;
    }
  }
}

// Define the custom element
if (!customElements.get('state-machine-diagram-enhanced')) {
  customElements.define('state-machine-diagram-enhanced', StateMachineDiagramEnhanced);
}

export { StateMachineDiagramEnhanced };
export type { 
  AnimationContext, 
  AnimationEvent, 
  AnimationState, 
  StateIndicator, 
  StateElement, 
  EventElement, 
  DiagramFlow 
}; 
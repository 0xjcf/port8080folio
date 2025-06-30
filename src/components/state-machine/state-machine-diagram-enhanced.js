import { createMachine, createActor, assign } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';

class StateMachineDiagramEnhanced extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.animationActor = null;
  }

  connectedCallback() {
    this.render();
    this.startAnimation();
  }

  disconnectedCallback() {
    if (this.animationActor) {
      this.animationActor.stop();
    }
  }

  createAnimationMachine() {
    const states = this.shadowRoot.querySelectorAll('.state-box');
    const events = this.shadowRoot.querySelectorAll('.state-event');
    const totalStates = states.length;

    return createMachine({
      id: 'diagramAnimation',
      initial: 'idle',
      context: {
        currentStateIndex: 0,
        states,
        events,
        totalStates
      },
      states: {
        idle: {
          after: {
            100: 'animating'
          }
        },
        animating: {
          entry: ({ context }) => {
            // Reset all states
            context.states.forEach(state => state.classList.remove('active'));
            context.events.forEach(event => event.classList.remove('firing'));

            // Activate current state
            if (context.currentStateIndex < context.states.length && context.states[context.currentStateIndex]) {
              context.states[context.currentStateIndex].classList.add('active');
            }
          },
          after: {
            500: {
              target: 'eventFiring',
              guard: ({ context }) => context.currentStateIndex < context.events.length
            },
            1500: 'nextState'
          }
        },
        eventFiring: {
          entry: ({ context }) => {
            if (context.events[context.currentStateIndex]) {
              context.events[context.currentStateIndex].classList.add('firing');
            }
          },
          after: {
            1000: 'nextState'
          }
        },
        nextState: {
          entry: assign({
            currentStateIndex: ({ context }) => (context.currentStateIndex + 1) % (context.totalStates + 1)
          }),
          always: [
            {
              target: 'pausing',
              guard: ({ context }) => context.currentStateIndex === 0
            },
            {
              target: 'animating'
            }
          ]
        },
        pausing: {
          entry: ({ context }) => {
            // Reset all states during pause
            context.states.forEach(state => state.classList.remove('active'));
            context.events.forEach(event => event.classList.remove('firing'));
          },
          after: {
            2000: 'animating'
          }
        }
      }
    });
  }

  startAnimation() {
    if (this.animationActor) {
      this.animationActor.stop();
    }

    const machine = this.createAnimationMachine();
    this.animationActor = createActor(machine);
    this.animationActor.start();
  }

  render() {
    // Calculate the base path using import.meta.url
    const componentPath = new URL(import.meta.url).pathname;
    const basePath = componentPath.substring(0, componentPath.indexOf('/src/'));
    const styleHref = `${basePath}/src/styles/state-machine-education.css`;

    this.shadowRoot.innerHTML = `
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
        
        /* Metrics section */
        .metrics-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin: 3rem 0 2rem;
          padding: 0 1rem;
        }
        
        .metric-card {
          background: rgba(13, 153, 255, 0.05);
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .metric-card:hover {
          transform: translateY(-4px);
          border-color: rgba(13, 153, 255, 0.4);
          box-shadow: 0 8px 24px rgba(13, 153, 255, 0.15);
        }
        
        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--jasper);
          margin-bottom: 0.5rem;
        }
        
        .metric-label {
          color: var(--teagreen);
          font-size: 0.9rem;
          opacity: 0.9;
        }
        
        /* XState section */
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
          
          .metrics-section {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      </style>
      
      <div class="container">
        <!-- State machine diagram - Full width section -->
        <div class="statechart-diagram-container">
          <h3 class="concept-title" style="text-align: center; margin-bottom: 2rem;">📊 From Chaos to Clarity: State Machines</h3>
          
          
          <div class="statechart-diagram">
            <div class="statechart-title">Watch how state machines work:</div>
            <div class="states-flow">
              <span class="state-indicator start">●</span>
              <div class="state-box">idle</div>
              <span class="state-arrow">→</span>
              <span class="state-event">ORDER</span>
              <span class="state-arrow">→</span>
              <div class="state-box">makingCoffee</div>
              <span class="state-arrow">→</span>
              <span class="state-event">COMPLETE</span>
              <span class="state-arrow">→</span>
              <div class="state-box">done</div>
              <span class="state-indicator end">■</span>
            </div>
          </div>
          
          <p class="pro-tip">
            <strong>Pro tip:</strong> State machines make impossible states impossible. No more "loading AND error" bugs!
          </p>
          
          <!-- XState introduction -->
          <div class="xstate-intro">
            <div class="xstate-logo">
              <span>⚡</span> XState
            </div>
            <p style="color: var(--teagreen); font-size: 1.1rem; margin-bottom: 1rem;">
              The industry-standard library for state machines in JavaScript. Used by Microsoft, Netflix, and thousands of production apps.
            </p>
            <p style="color: rgba(255, 255, 255, 0.7); margin: 0;">
              Let's see how XState transforms our coffee shop into clean, maintainable code...
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('state-machine-diagram-enhanced', StateMachineDiagramEnhanced);
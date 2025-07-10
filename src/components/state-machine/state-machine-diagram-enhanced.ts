// ✅ REACTIVE: Actor-SPA Framework imports
import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, html, type RawHTML } from '../../framework/core/index.js';

// ✅ REACTIVE: Enhanced type definitions for Actor-SPA pattern
interface StateIndicator {
  type: 'start' | 'end';
  symbol: string;
}

interface StateElement {
  name: string;
}

interface EventElement {
  name: string;
}

interface DiagramFlow {
  states: StateElement[];
  events: EventElement[];
  indicators: StateIndicator[];
}

// ✅ REACTIVE: XState machine context for animation management
interface DiagramAnimationContext {
  currentStateIndex: number;
  totalStates: number;
  activeStateIndex: number | null; // Track which state is active
  firingEventIndex: number | null; // Track which event is firing
  diagramFlow: DiagramFlow;
  animationTiming: {
    INITIAL_DELAY: number;
    STATE_DURATION: number;
    EVENT_DURATION: number;
    CYCLE_DURATION: number;
    PAUSE_DURATION: number;
  };
}

// ✅ REACTIVE: XState event types
type DiagramAnimationEvent =
  | { type: 'START_ANIMATION' }
  | { type: 'NEXT_STATE' }
  | { type: 'FIRE_EVENT' }
  | { type: 'PAUSE_ANIMATION' }
  | { type: 'RESUME_ANIMATION' }
  | { type: 'RESTART_ANIMATION' }
  | { type: 'STOP_ANIMATION' }
  | { type: 'RESET' };

// ✅ REACTIVE: Constants for animation and diagram
const ANIMATION_TIMING = {
  INITIAL_DELAY: 100,
  STATE_DURATION: 500,
  EVENT_DURATION: 1000,
  CYCLE_DURATION: 1500,
  PAUSE_DURATION: 2000,
} as const;

const DIAGRAM_FLOW: DiagramFlow = {
  states: [{ name: 'idle' }, { name: 'makingCoffee' }, { name: 'done' }],
  events: [{ name: 'ORDER' }, { name: 'COMPLETE' }],
  indicators: [
    { type: 'start', symbol: '●' },
    { type: 'end', symbol: '■' },
  ],
} as const;

// ✅ REACTIVE: XState machine for diagram animation
const diagramAnimationMachine = setup({
  types: {
    context: {} as DiagramAnimationContext,
    events: {} as DiagramAnimationEvent,
  },
  actions: {
    incrementStateIndex: assign({
      currentStateIndex: ({ context }) =>
        (context.currentStateIndex + 1) % (context.totalStates + 1),
    }),
    resetStateIndex: assign({
      currentStateIndex: 0,
    }),
    resetForStop: assign({
      currentStateIndex: 0,
      activeStateIndex: null,
      firingEventIndex: null,
    }),
    activateCurrentState: assign({
      activeStateIndex: ({ context }) =>
        context.currentStateIndex < context.diagramFlow.states.length
          ? context.currentStateIndex
          : null,
      firingEventIndex: null,
    }),
    activateCurrentEvent: assign({
      firingEventIndex: ({ context }) =>
        context.currentStateIndex < context.diagramFlow.events.length
          ? context.currentStateIndex
          : null,
    }),
    resetAnimationStates: assign({
      activeStateIndex: null,
      firingEventIndex: null,
    }),
  },
  guards: {
    shouldFireEvent: ({ context }) => context.currentStateIndex < context.diagramFlow.events.length,
    shouldCycle: ({ context }) => context.currentStateIndex === 0,
    isWithinStates: ({ context }) => context.currentStateIndex < context.diagramFlow.states.length,
  },
}).createMachine({
  id: 'diagram-animation',
  initial: 'idle',
  context: {
    currentStateIndex: 0,
    totalStates: DIAGRAM_FLOW.states.length,
    activeStateIndex: null,
    firingEventIndex: null,
    diagramFlow: { ...DIAGRAM_FLOW },
    animationTiming: { ...ANIMATION_TIMING },
  },
  states: {
    idle: {
      after: {
        500: { target: 'animating' },
      },
      on: {
        START_ANIMATION: { target: 'animating' },
        RESTART_ANIMATION: { target: 'animating', actions: 'resetStateIndex' },
      },
    },
    animating: {
      entry: ['resetAnimationStates', 'activateCurrentState'],
      after: {
        [ANIMATION_TIMING.INITIAL_DELAY]: {
          target: 'stateActive',
        },
      },
      on: {
        PAUSE_ANIMATION: { target: 'paused' },
        STOP_ANIMATION: { target: 'idle', actions: 'resetForStop' },
        RESTART_ANIMATION: { target: 'animating', actions: 'resetStateIndex' },
      },
    },
    stateActive: {
      after: {
        [ANIMATION_TIMING.STATE_DURATION]: [
          {
            target: 'eventFiring',
            guard: 'shouldFireEvent',
          },
          {
            target: 'nextState',
          },
        ],
      },
      on: {
        PAUSE_ANIMATION: { target: 'paused' },
        STOP_ANIMATION: { target: 'idle', actions: 'resetForStop' },
      },
    },
    eventFiring: {
      entry: 'activateCurrentEvent',
      after: {
        [ANIMATION_TIMING.EVENT_DURATION]: 'nextState',
      },
      on: {
        PAUSE_ANIMATION: { target: 'paused' },
        STOP_ANIMATION: { target: 'idle', actions: 'resetForStop' },
      },
    },
    nextState: {
      entry: 'incrementStateIndex',
      always: [
        {
          target: 'pausing',
          guard: 'shouldCycle',
        },
        {
          target: 'stateActive',
          actions: 'activateCurrentState',
        },
      ],
    },
    pausing: {
      entry: 'resetAnimationStates',
      after: {
        [ANIMATION_TIMING.PAUSE_DURATION]: {
          target: 'stateActive',
          actions: 'activateCurrentState',
        },
      },
      on: {
        PAUSE_ANIMATION: { target: 'paused' },
        STOP_ANIMATION: { target: 'idle', actions: 'resetForStop' },
      },
    },
    paused: {
      on: {
        RESUME_ANIMATION: { target: 'stateActive' },
        RESTART_ANIMATION: { target: 'animating', actions: 'resetStateIndex' },
        STOP_ANIMATION: { target: 'idle', actions: 'resetForStop' },
      },
    },
  },
});

// ✅ REACTIVE: Template for diagram flow
const renderDiagramFlow = (
  diagramFlow: DiagramFlow,
  activeStateIndex: number | null,
  firingEventIndex: number | null
): RawHTML => {
  const { states, events, indicators } = diagramFlow;

  return html`
    <div class="states-flow">
      <span class="state-indicator start">${indicators[0].symbol}</span>
      
      <div class="state-box ${activeStateIndex === 0 ? 'active' : ''}">${states[0].name}</div>
      <span class="state-arrow">→</span>
      
      <span class="state-event ${firingEventIndex === 0 ? 'firing' : ''}">${events[0].name}</span>
      <span class="state-arrow ${firingEventIndex === 0 ? 'active-arrow' : ''}">→</span>
      
      <div class="state-box ${activeStateIndex === 1 ? 'active' : ''}">${states[1].name}</div>
      <span class="state-arrow">→</span>
      
      <span class="state-event ${firingEventIndex === 1 ? 'firing' : ''}">${events[1].name}</span>
      <span class="state-arrow ${firingEventIndex === 1 ? 'active-arrow' : ''}">→</span>
      
      <div class="state-box ${activeStateIndex === 2 ? 'active' : ''}">${states[2].name}</div>
      
      <span class="state-indicator end">${indicators[1].symbol}</span>
    </div>
  `;
};

// ✅ REACTIVE: Template for XState introduction
const renderXStateIntro = (): RawHTML => html`
  <div class="xstate-intro">
    <div class="xstate-logo">
      <span>⚡</span> XState
    </div>
    <p class="xstate-description">
      ${'The industry-standard library for state machines in JavaScript. Used by Microsoft, Netflix, and thousands of production apps.'}
    </p>
    <p class="xstate-lead-in">
      ${"Let's see how XState transforms our coffee shop into clean, maintainable code..."}
    </p>
  </div>
`;

// ✅ REACTIVE: Template for start/resume button
const renderStartResumeButton = (currentState: string): RawHTML => html`
  <button send="START_ANIMATION" class="control-button">
    ${currentState === 'paused' ? 'Resume' : 'Start'} Animation
  </button>
`;

// ✅ REACTIVE: Template for pause button
const renderPauseButton = (): RawHTML => html`
  <button send="PAUSE_ANIMATION" class="control-button">Pause</button>
`;

// ✅ REACTIVE: Template for controls (extracted to reduce nesting)
const renderControls = (state: SnapshotFrom<typeof diagramAnimationMachine>): RawHTML => {
  const currentState = state.value as string;
  const isAnimating = currentState !== 'idle' && currentState !== 'paused';

  return html`
    <div class="animation-controls">
      ${currentState === 'idle' || currentState === 'paused' ? renderStartResumeButton(currentState) : ''}
      ${isAnimating ? renderPauseButton() : ''}
      <button send="RESTART_ANIMATION" class="control-button">Restart</button>
      <button send="STOP_ANIMATION" class="control-button">Stop</button>
    </div>
  `;
};

// ✅ REACTIVE: Main template function
const diagramTemplate = (state: SnapshotFrom<typeof diagramAnimationMachine>): RawHTML => {
  const { diagramFlow, activeStateIndex, firingEventIndex } = state.context;

  return html`
    <div class="container">
      <!-- State machine diagram - Full width section -->
      <div class="statechart-diagram-container">
        <h3 class="concept-title">📊 From Chaos to Clarity: State Machines</h3>
        
        <div class="statechart-diagram">
          <div class="statechart-title">Watch how state machines work:</div>
          ${renderDiagramFlow(diagramFlow, activeStateIndex, firingEventIndex)}
        </div>
        
        <p class="pro-tip">
          <strong>Pro tip:</strong> State machines make impossible states impossible. No more "loading AND error" bugs!
        </p>
        
        <!-- Animation controls (optional) -->
        ${renderControls(state)}
        
        <!-- XState introduction -->
        ${renderXStateIntro()}
      </div>
    </div>
  `;
};

// ✅ REACTIVE: Component styles
const diagramStyles = `
  :host {
    display: block;
    width: 100%;
  }
  
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
    background: linear-gradient(45deg, var(--jasper, #0D99FF), var(--jasper-light, #47B4FF));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .state-box.active {
    border-color: var(--jasper, #0D99FF);
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
    color: var(--jasper, #0D99FF);
    transform: scale(1.2);
    text-shadow: 0 0 10px rgba(13, 153, 255, 0.5);
  }
  
  .state-arrow {
    color: #666;
    font-size: 1.5rem;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  
  .state-arrow.active-arrow {
    color: var(--jasper, #0D99FF);
  }
  
  .state-indicator {
    color: var(--teagreen, #34D399);
    font-size: 1.2rem;
    font-weight: bold;
  }
  
  .statechart-title {
    text-align: center;
    color: var(--teagreen, #34D399);
    font-size: 1.2rem;
    margin-bottom: 2rem;
    font-weight: 600;
  }
  
  .concept-title {
    text-align: center;
    color: var(--teagreen, #34D399);
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .pro-tip {
    text-align: center;
    margin-top: 2rem;
    padding: 1rem;
    background: rgba(13, 153, 255, 0.05);
    border-radius: 8px;
    color: var(--teagreen, #34D399);
    font-style: italic;
  }
  
  .pro-tip strong {
    color: var(--jasper, #0D99FF);
  }
  
  /* Animation controls */
  .animation-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 2rem 0;
    flex-wrap: wrap;
  }
  
  .control-button {
    background: rgba(13, 153, 255, 0.1);
    border: 1px solid rgba(13, 153, 255, 0.3);
    color: var(--jasper, #0D99FF);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 80px;
  }
  
  .control-button:hover {
    background: rgba(13, 153, 255, 0.2);
    transform: translateY(-1px);
  }
  
  .control-button:active {
    transform: translateY(0);
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
    color: var(--jasper, #0D99FF);
    margin-bottom: 1rem;
  }
  
  .xstate-description {
    color: var(--teagreen, #34D399);
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
    
    .animation-controls {
      gap: 0.5rem;
    }
    
    .control-button {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
      min-width: 70px;
    }
  }
`;

// ✅ REACTIVE: Create component using Actor-SPA framework
const StateMachineDiagramComponent = createComponent({
  machine: diagramAnimationMachine,
  template: diagramTemplate,
  styles: diagramStyles,
  tagName: 'state-machine-diagram-enhanced',
});

// ✅ REACTIVE: Export helper functions for backward compatibility
export const getAnimationTiming = () => ({ ...ANIMATION_TIMING });

export const getDiagramFlow = () => ({
  states: [...DIAGRAM_FLOW.states],
  events: [...DIAGRAM_FLOW.events],
  indicators: [...DIAGRAM_FLOW.indicators],
});

// ✅ REACTIVE: Export the component and types
export default StateMachineDiagramComponent;
export type {
  DiagramAnimationContext,
  DiagramAnimationEvent,
  DiagramFlow,
  EventElement,
  StateElement,
  StateIndicator,
};

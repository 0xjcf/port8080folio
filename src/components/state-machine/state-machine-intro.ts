// StateMachineIntro refactored to use Actor-SPA Framework API
import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, html, type RawHTML } from '../../framework/core/index.js';

// ✅ Type-safe interfaces following framework patterns
interface PainPointData {
  icon: string;
  title: string;
  description: string;
  consequence: string;
}

interface StateMachineIntroConfig {
  showAnimation?: boolean;
  showInteraction?: boolean;
  expandOnLoad?: boolean;
}

interface StateMachineIntroContext {
  config: StateMachineIntroConfig;
  selectedPainPoint: string | null;
  interactionStartTime: number;
  totalTimeOnSection: number;
}

type StateMachineIntroEvents =
  | { type: 'TOGGLE_EXPAND' }
  | { type: 'PAIN_POINT_CLICKED'; painPoint: string }
  | { type: 'AUTO_EXPAND' }
  | { type: 'REVEAL_SOLUTION' }
  | { type: 'SECTION_VIEWED' }
  | { type: 'UPDATE_CONFIG'; config: Partial<StateMachineIntroConfig> };

// ✅ Helper functions (pure functions)
function getPainPoints(): PainPointData[] {
  return [
    {
      icon: '🐛',
      title: 'Impossible State Bugs',
      description: 'Your app gets into states that "should never happen" but somehow do.',
      consequence: 'Users report bugs you can never reproduce locally',
    },
    {
      icon: '⏰',
      title: 'Slow Feature Development',
      description:
        'Adding new features requires touching 12 different files and breaking 3 existing ones.',
      consequence: 'Simple changes take weeks instead of days',
    },
    {
      icon: '😰',
      title: 'Race Condition Nightmares',
      description:
        'Loading states, error handling, and user interactions conflict in unpredictable ways.',
      consequence: 'Production crashes that make no sense',
    },
    {
      icon: '📚',
      title: 'Unreadable State Logic',
      description:
        'Boolean flags scattered everywhere: isLoading, hasError, isRetrying, wasSubmitted...',
      consequence: 'New team members quit in frustration',
    },
    {
      icon: '🔥',
      title: 'Testing Hell',
      description: 'Mocking all the possible state combinations is impossible.',
      consequence: "Tests that don't actually test real scenarios",
    },
    {
      icon: '🤯',
      title: 'Mental Overhead',
      description: 'You spend more time figuring out current state than building features.',
      consequence: 'Burnout from fighting your own code',
    },
  ];
}

// ✅ XState machine for state machine intro management
const stateMachineIntroMachine = setup({
  types: {
    context: {} as StateMachineIntroContext,
    events: {} as StateMachineIntroEvents,
  },
  actions: {
    trackInteraction: ({ context, event }) => {
      const eventData = {
        type: event.type,
        data: event.type === 'PAIN_POINT_CLICKED' ? { painPoint: event.painPoint } : {},
        timestamp: new Date().toISOString(),
        timeOnSection: Date.now() - context.interactionStartTime,
      };

      // Analytics tracking
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', event.type, {
          event_category: 'state_machine_intro',
          event_label: event.type === 'PAIN_POINT_CLICKED' ? event.painPoint : 'interaction',
          value: eventData.timeOnSection,
        });
      }

      // Custom analytics
      if (window.customAnalytics) {
        window.customAnalytics.track(event.type, eventData.data);
      }
    },
    selectPainPoint: assign({
      selectedPainPoint: ({ event }) =>
        event.type === 'PAIN_POINT_CLICKED' ? event.painPoint : null,
    }),
    updateConfig: assign({
      config: ({ event, context }) =>
        event.type === 'UPDATE_CONFIG' ? { ...context.config, ...event.config } : context.config,
    }),
    updateTimeOnSection: assign({
      totalTimeOnSection: ({ context }) => Date.now() - context.interactionStartTime,
    }),
  },
}).createMachine({
  id: 'state-machine-intro',
  initial: 'collapsed',
  context: {
    config: {
      showAnimation: true,
      showInteraction: true,
      expandOnLoad: false,
    },
    selectedPainPoint: null,
    interactionStartTime: Date.now(),
    totalTimeOnSection: 0,
  },
  states: {
    collapsed: {
      on: {
        TOGGLE_EXPAND: { target: 'expanded', actions: 'trackInteraction' },
        AUTO_EXPAND: { target: 'expanded', actions: 'trackInteraction' },
        PAIN_POINT_CLICKED: { actions: ['selectPainPoint', 'trackInteraction'] },
        UPDATE_CONFIG: { actions: 'updateConfig' },
      },
    },
    expanded: {
      initial: 'revealing',
      states: {
        revealing: {
          // ✅ XState delayed transition for solution reveal
          after: {
            800: 'solution_visible',
          },
        },
        solution_visible: {
          entry: 'trackInteraction',
        },
      },
      on: {
        TOGGLE_EXPAND: { target: 'collapsed', actions: 'trackInteraction' },
        PAIN_POINT_CLICKED: { actions: ['selectPainPoint', 'trackInteraction'] },
        UPDATE_CONFIG: { actions: 'updateConfig' },
      },
    },
  },
});

// ✅ Template components (extracted for better organization)
const painPointCard = (point: PainPointData, isSelected: boolean): RawHTML => html`
  <div 
    class="pain-point-card ${isSelected ? 'selected' : ''}" 
    send="PAIN_POINT_CLICKED" 
    pain-point=${point.title}
  >
    <span class="pain-icon">${point.icon}</span>
    <h4 class="pain-title">${point.title}</h4>
    <p class="pain-description">${point.description}</p>
    <p class="pain-consequence">${point.consequence}</p>
  </div>
`;

// ✅ Pure template function using framework html``
const renderExpandTrigger = (isExpanded: boolean): RawHTML => html`
  <button 
    class="expand-trigger ${isExpanded ? 'rotated' : ''}" 
    send="TOGGLE_EXPAND" 
    aria-label="Expand section"
  >
    ${isExpanded ? '↑' : '↓'}
  </button>
`;

const stateMachineIntroTemplate = (
  state: SnapshotFrom<typeof stateMachineIntroMachine>
): RawHTML => {
  const { config, selectedPainPoint } = state.context;
  const isExpanded = state.matches('expanded');
  const showSolution = state.matches('expanded') && state.matches({ expanded: 'solution_visible' });
  const painPoints = getPainPoints();

  return html`
    <section class="state-machine-intro">
      ${config.showInteraction ? renderExpandTrigger(isExpanded) : ''}
      
      <div class="intro-header">
        <h2 class="intro-title">Does This Sound Familiar?</h2>
        <p class="intro-subtitle">
          The hidden costs of chaotic frontend state management
        </p>
      </div>
      
      <div class="collapsible-content ${isExpanded ? 'expanded' : ''}">
        <div class="pain-points-grid">
          ${painPoints.map((point) => painPointCard(point, selectedPainPoint === point.title))}
        </div>
        
        <div class="solution-section ${showSolution ? 'revealed' : ''}">
          <h3 class="solution-title">What if there was a better way?</h3>
          <p class="solution-text">
            State machines turn impossible states into... literally impossible. 
            Transform chaos into predictable, visual workflows your team will actually understand.
          </p>
          <a href="resources/" class="cta-button">
            Discover State Machines →
          </a>
        </div>
      </div>
    </section>
  `;
};

// ✅ Static styles (preserving existing comprehensive styles but with data-state support)
const stateMachineIntroStyles = `
  :host {
    display: block;
    position: relative;
    background: linear-gradient(135deg, rgba(15, 17, 21, 0.95) 0%, rgba(8, 8, 8, 0.98) 100%);
    border-radius: 20px;
    border: 2px solid rgba(13, 153, 255, 0.2);
    padding: 2.5rem;
    margin: 2rem 0;
    overflow: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  :host::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--jasper), var(--jasper-light), transparent);
    opacity: 0.8;
  }
  
  .state-machine-intro {
    position: relative;
  }
  
  .intro-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .intro-title {
    color: var(--jasper, #0D99FF);
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    letter-spacing: -0.02em;
  }
  
  @media (min-width: 768px) {
    .intro-title {
      font-size: 2.5rem;
    }
  }
  
  .intro-subtitle {
    color: var(--teagreen, #F5F5F5);
    font-size: 1.1rem;
    margin: 0;
    opacity: 0.9;
    line-height: 1.6;
  }
  
  @media (min-width: 768px) {
    .intro-subtitle {
      font-size: 1.25rem;
    }
  }
  
  .pain-points-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  @media (min-width: 768px) {
    .pain-points-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
  }
  
  @media (min-width: 1024px) {
    .pain-points-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .pain-point-card {
    background: rgba(15, 17, 21, 0.6);
    border: 1px solid rgba(13, 153, 255, 0.1);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  
  .pain-point-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--jasper), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .pain-point-card:hover,
  .pain-point-card.selected {
    transform: translateY(-4px);
    border-color: rgba(13, 153, 255, 0.3);
    background: rgba(15, 17, 21, 0.8);
    box-shadow: 0 8px 24px rgba(13, 153, 255, 0.15);
  }
  
  .pain-point-card:hover::before,
  .pain-point-card.selected::before {
    opacity: 0.6;
  }
  
  .pain-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    display: block;
  }
  
  .pain-title {
    color: var(--jasper-light, #47B4FF);
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
  }
  
  .pain-description {
    color: var(--teagreen, #F5F5F5);
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0 0 1rem 0;
    opacity: 0.9;
  }
  
  .pain-consequence {
    color: rgba(255, 87, 87, 0.9);
    font-size: 0.85rem;
    font-style: italic;
    margin: 0;
    opacity: 0.8;
  }
  
  .solution-section {
    text-align: center;
    margin: 3rem 0 2rem 0;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease;
  }
  
  .solution-section.revealed {
    opacity: 1;
    transform: translateY(0);
  }
  
  .solution-title {
    color: var(--jasper, #0D99FF);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
  }
  
  @media (min-width: 768px) {
    .solution-title {
      font-size: 1.75rem;
    }
  }
  
  .solution-text {
    color: var(--teagreen, #F5F5F5);
    font-size: 1.1rem;
    line-height: 1.6;
    margin: 0 0 2rem 0;
    opacity: 0.95;
  }
  
  @media (min-width: 768px) {
    .solution-text {
      font-size: 1.2rem;
    }
  }
  
  .cta-button {
    background: linear-gradient(135deg, var(--jasper, #0D99FF) 0%, var(--jasper-light, #47B4FF) 100%);
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    position: relative;
    overflow: hidden;
  }
  
  .cta-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
  }
  
  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(13, 153, 255, 0.3);
  }
  
  .cta-button:hover::before {
    left: 100%;
  }
  
  .expand-trigger {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(13, 153, 255, 0.1);
    border: 1px solid rgba(13, 153, 255, 0.3);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--jasper, #0D99FF);
    font-size: 1.2rem;
  }
  
  .expand-trigger:hover {
    background: rgba(13, 153, 255, 0.2);
    transform: scale(1.1);
  }
  
  .expand-trigger.rotated {
    transform: rotate(180deg);
  }
  
  .expand-trigger.rotated:hover {
    transform: rotate(180deg) scale(1.1);
  }
  
  .collapsible-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.6s ease;
  }
  
  .collapsible-content.expanded {
    max-height: 1000px;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .pain-point-card {
    animation: fadeInUp 0.6s ease forwards;
  }
  
  .pain-point-card:nth-child(1) { animation-delay: 0.1s; }
  .pain-point-card:nth-child(2) { animation-delay: 0.2s; }
  .pain-point-card:nth-child(3) { animation-delay: 0.3s; }
  .pain-point-card:nth-child(4) { animation-delay: 0.4s; }
  .pain-point-card:nth-child(5) { animation-delay: 0.5s; }
  .pain-point-card:nth-child(6) { animation-delay: 0.6s; }
`;

// ✅ Create the component using framework API
const StateMachineIntroComponent = createComponent({
  machine: stateMachineIntroMachine,
  template: stateMachineIntroTemplate,
  styles: stateMachineIntroStyles,
  tagName: 'state-machine-intro', // Maintain compatibility
});

// ✅ Export the component class for programmatic access
export default StateMachineIntroComponent;

// ✅ Export types for external use
export type {
  PainPointData,
  StateMachineIntroConfig,
  StateMachineIntroContext,
  StateMachineIntroEvents,
};

// ✅ Usage Examples:
//
// 1. Basic usage (registered as <state-machine-intro>):
//    <state-machine-intro></state-machine-intro>
//
// 2. Programmatic usage:
//    const intro = new StateMachineIntroComponent();
//    document.body.appendChild(intro);
//
//    // Control expansion state
//    intro.send({ type: 'TOGGLE_EXPAND' });
//    intro.send({ type: 'AUTO_EXPAND' });
//
//    // Track pain point interactions
//    intro.send({ type: 'PAIN_POINT_CLICKED', painPoint: 'Impossible State Bugs' });
//
//    // Update configuration
//    intro.send({
//      type: 'UPDATE_CONFIG',
//      config: {
//        showAnimation: false,
//        expandOnLoad: true
//      }
//    });
//
// Benefits of the new approach:
// ✅ No DOM queries - everything is reactive through state
// ✅ Declarative event handling with framework send attributes
// ✅ XState machine states replace boolean flags (isExpanded)
// ✅ Automatic animation timing with XState delayed transitions
// ✅ Type-safe state management with proper analytics integration
// ✅ Pure template functions with automatic XSS protection
// ✅ Better performance with state-driven CSS classes
// ✅ Improved testability with isolated state machine logic

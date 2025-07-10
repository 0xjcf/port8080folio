// ✅ REACTIVE: Actor-SPA Framework imports
import { type SnapshotFrom, setup } from 'xstate';
import { createComponent, css, html, type RawHTML } from '../../framework/core/index.js';

// Import dependencies
import '../code-examples/chaos-coffee-shop.js';
import '../ui/syntax-highlighter-with-themes.js';

// ✅ REACTIVE: Type definitions
interface ProblemItem {
  icon: string;
  title: string;
  description: string;
}

interface ConceptSection {
  title: string;
  subtitle?: string;
  problems: readonly ProblemItem[];
}

// ✅ REACTIVE: State machine context for static content
interface ConceptsContext {
  problems: readonly ProblemItem[];
  transitionText: typeof TRANSITION_TEXT;
}

// ✅ REACTIVE: Event types (minimal for static content)
type ConceptsEvent = { type: 'REFRESH' };

// ✅ REACTIVE: Static data constants
const PROBLEM_DATA: readonly ProblemItem[] = [
  {
    icon: '⏰',
    title: '"This Should Take 2 Days..."',
    description:
      '...turns into 2 weeks because changing one component breaks three others. Every feature becomes an archaeological dig through scattered state logic.',
  },
  {
    icon: '🐛',
    title: '"It Works on My Machine"',
    description:
      'Race conditions that only happen in production. Edge cases you never tested. Users finding impossible states that crash your app.',
  },
  {
    icon: '😤',
    title: '"Who Wrote This Code?"',
    description:
      '(It was you, 6 months ago.) State scattered across 12 useEffects, boolean flags everywhere, and logic that makes senior devs cry.',
  },
  {
    icon: '🔥',
    title: '"Just Ship It"',
    description:
      'Technical debt piling up. New developers afraid to touch anything. Features taking longer and longer to ship as complexity grows.',
  },
] as const;

const TRANSITION_TEXT = {
  bridge: "You want to ship features faster? Let's talk about what's really slowing you down...",
  solution: 'What if your state logic was visual, predictable, and impossible to break?',
  leadIn: 'Let me show you a better way...',
} as const;

// ✅ REACTIVE: Simple state machine for static content
const conceptsMachine = setup({
  types: {
    context: {} as ConceptsContext,
    events: {} as ConceptsEvent,
  },
}).createMachine({
  id: 'state-machine-concepts',
  initial: 'idle',
  context: {
    problems: PROBLEM_DATA,
    transitionText: TRANSITION_TEXT,
  },
  states: {
    idle: {
      on: {
        REFRESH: 'idle', // Self-transition for potential refresh functionality
      },
    },
  },
});

// ✅ REACTIVE: Template for individual problem item
const renderProblemItem = (problem: ProblemItem): RawHTML => html`
  <div class="problem-item">
    <div class="problem-gradient"></div>
    <h4>${problem.icon} ${problem.title}</h4>
    <p>${problem.description}</p>
  </div>
`;

// ✅ REACTIVE: Template for problems grid
const renderProblemsGrid = (problems: readonly ProblemItem[]): RawHTML => html`
  <div class="problem-grid">
    ${problems.map((problem) => renderProblemItem(problem))}
  </div>
`;

// ✅ REACTIVE: Template for transition section
const renderTransitionSection = (transitionText: typeof TRANSITION_TEXT): RawHTML => html`
  <div class="transition-section">
    <div class="transition-gradient"></div>
    <p class="transition-primary">
      ${transitionText.solution}
    </p>
    <p class="transition-secondary">
      ${transitionText.leadIn}
    </p>
  </div>
`;

// ✅ REACTIVE: Main template function
const conceptsTemplate = (state: SnapshotFrom<typeof conceptsMachine>): RawHTML => {
  const { problems, transitionText } = state.context;

  return html`
    <div class="container">
      <!-- Bridge from Level 1 to Level 2 -->
      <p class="transition-text">
        ${transitionText.bridge}
      </p>
      
      <!-- Clear problem statements -->
      <div class="problems-list">
        <h3 class="concept-title">🚨 The Daily Struggles You Know Too Well</h3>
        
        ${renderProblemsGrid(problems)}
      </div>

      <div class="concept-section">
        <h3 class="concept-title">💻 Here's What Your Code Probably Looks Like</h3>
        <p class="concept-description">
          Sound familiar? You're not alone. Here's the typical useState/useEffect chaos 
          that's slowing down teams everywhere:
        </p>
        
        <chaos-coffee-shop-code></chaos-coffee-shop-code>
      </div>

      <!-- Transition to solution -->
      ${renderTransitionSection(transitionText)}
    </div>
  `;
};

// ✅ REACTIVE: Component styles
const conceptsStyles = css`
  :host {
    display: block;
    width: 100%;
  }
  
  .problem-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  .problem-item {
    background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%);
    border: 1px solid rgba(13, 153, 255, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }
  
  .problem-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--jasper, #0D99FF), transparent);
    opacity: 0.4;
  }
  
  .problem-item h4 {
    color: var(--jasper-light, #47B4FF);
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  
  .problem-item p {
    color: var(--teagreen, #34D399);
    line-height: 1.6;
    margin: 0;
  }
  
  .transition-text {
    text-align: center;
    color: var(--jasper, #0D99FF);
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
  
  .concept-title {
    color: var(--teagreen, #34D399);
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .concept-description {
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
  
  .concept-section {
    margin: 3rem 0;
  }
  
  .transition-section {
    text-align: center;
    margin-top: 3rem;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%);
    border-radius: 16px;
    border: 1px solid rgba(13, 153, 255, 0.2);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }
  
  .transition-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--jasper, #0D99FF), transparent);
    opacity: 0.4;
  }
  
  .transition-primary {
    color: var(--teagreen, #34D399);
    font-size: 1.2rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  .transition-secondary {
    color: rgba(255, 255, 255, 0.7);
    font-style: italic;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    .problem-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// ✅ REACTIVE: Create component using Actor-SPA framework
const StateMachineConceptsComponent = createComponent({
  machine: conceptsMachine,
  template: conceptsTemplate,
  styles: conceptsStyles,
  tagName: 'state-machine-concepts-enhanced',
});

// ✅ REACTIVE: Export helper functions for backward compatibility
export const getProblemsData = (): readonly ProblemItem[] => PROBLEM_DATA;

export const getTransitionText = () => ({ ...TRANSITION_TEXT });

export const getProblemCount = (): number => PROBLEM_DATA.length;

export const getProblemByIndex = (index: number): ProblemItem | null => {
  return PROBLEM_DATA[index] || null;
};

export const findProblemsByKeyword = (keyword: string): ProblemItem[] => {
  const searchTerm = keyword.toLowerCase();
  return PROBLEM_DATA.filter(
    (problem) =>
      problem.title.toLowerCase().includes(searchTerm) ||
      problem.description.toLowerCase().includes(searchTerm)
  );
};

// ✅ REACTIVE: Export the component and types
export default StateMachineConceptsComponent;
export type { ConceptsContext, ConceptSection, ConceptsEvent, ProblemItem };

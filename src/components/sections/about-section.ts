import { setup } from 'xstate';
import { createComponent, css, html } from '../../framework/core/index.js';

// Global framework interface
declare global {
  interface Window {
    actorFramework?: {
      eventBus: {
        emit: (event: string, data?: unknown) => void;
        on: (event: string, handler: (data?: unknown) => void) => void;
      };
    };
  }
}

// Type definitions
export type StatType = 'refactoring' | 'components' | 'actors' | 'sanity';

interface AboutContext {
  stats: {
    type: StatType;
    value: string;
    label: string;
  }[];
  techStack: string[];
}

type AboutEvent = { type: 'STAT_CLICKED'; statType: StatType };

// Static data
const STATS_DATA = [
  { type: 'refactoring' as StatType, value: '3 weeks', label: 'To refactor that monster' },
  { type: 'components' as StatType, value: '12', label: 'Modular state machines' },
  { type: 'actors' as StatType, value: '8', label: 'Actor-based services' },
  { type: 'sanity' as StatType, value: '100%', label: 'Developer sanity restored' },
];

const TECH_STACK = [
  'TypeScript',
  'XState',
  'React',
  'Web Components',
  'Rust',
  'Pine Script',
  'Node.js',
  'Embassy',
  'Tokio',
];

// XState machine
const aboutMachine = setup({
  types: {
    context: {} as AboutContext,
    events: {} as AboutEvent,
  },
  actions: {
    handleStatClick: ({ event }) => {
      // Use framework event bus instead of DOM manipulation
      if (window.actorFramework?.eventBus) {
        window.actorFramework.eventBus.emit('analytics:stat-clicked', {
          stat: event.statType,
          section: 'about',
          timestamp: new Date().toISOString(),
        });
      }
    },
  },
}).createMachine({
  id: 'about',
  initial: 'idle',
  context: {
    stats: STATS_DATA,
    techStack: TECH_STACK,
  },
  states: {
    idle: {
      on: {
        STAT_CLICKED: {
          actions: 'handleStatClick',
        },
      },
    },
  },
});

// Template helper functions (extracted to reduce nesting)
const renderStorySection = () => html`
  <div class="story-section">
    <h3><span>😅</span> The 1,700-Line Wake-Up Call</h3>
    <p>
      Picture this: Building an education platform with XState. Everything's going great. 
      "Just one more state," I kept telling myself. Fast forward three months...
    </p>
    <p>
      <span class="highlight">teacherMachine.ts: 1,732 lines.</span> My VS Code started lagging. 
      The bundle analyzer looked like a pizza chart where someone forgot to cut slices.
    </p>
    <p>
      That's when I realized: I'd created a monster. A fully functional, 
      thoroughly tested, completely unmaintainable monster. 🦖
    </p>
  </div>
`;

const renderLessonItem = (emoji: string, title: string, description: string) => html`
  <div class="lesson-item">
    <span class="lesson-emoji">${emoji}</span>
    <div class="lesson-text">
      <strong>${title}</strong> - ${description}
    </div>
  </div>
`;

// Lesson data for cleaner template generation
const LESSONS_DATA = [
  {
    emoji: '📏',
    title: 'Complexity limits save lives',
    description: "Now I set a 300-line limit. If it's bigger, it needs to be split. Period.",
  },
  {
    emoji: '🎭',
    title: 'Actor isolation is everything',
    description:
      'Split that 1,700-line behemoth into 12 independent state machines. No more debugging nightmares!',
  },
  {
    emoji: '🧪',
    title: "Tests aren't enough",
    description: "100% coverage doesn't mean 100% maintainable. Learned that the hard way.",
  },
  {
    emoji: '🛠️',
    title: 'Tools > discipline',
    description:
      'Built automation to catch complexity before it hurts. Bash scripts are your friend!',
  },
];

const renderLessonsLearned = () => html`
  <div class="lessons-learned">
    <h3>What That Disaster Taught Me</h3>
    ${LESSONS_DATA.map((lesson) => renderLessonItem(lesson.emoji, lesson.title, lesson.description))}
  </div>
`;

const renderStatBox = (stat: AboutContext['stats'][0]) => html`
  <div class="stat-box" 
       send="STAT_CLICKED" 
       stat-type=${stat.type}>
    <p class="stat-number">${stat.value}</p>
    <p class="stat-label">${stat.label}</p>
  </div>
`;

const renderStatsGrid = (stats: AboutContext['stats']) => html`
  <div class="stats-grid">
    ${stats.map(renderStatBox)}
  </div>
`;

const renderTechItem = (tech: string) => html`<span class="tech-item">${tech}</span>`;

const renderTechJourney = (techStack: string[]) => html`
  <div class="tech-journey">
    <h3>My Current Toolkit 🧰</h3>
    <p style="color: var(--teagreen, #F5F5F5); margin: 0.5rem 0;">
      Learned through trial, error, and occasional crying:
    </p>
    <div class="tech-timeline">
      ${techStack.map(renderTechItem)}
    </div>
  </div>
`;

const renderPlotTwist = () => html`
  <div class="story-section" style="margin-top: 2rem;">
    <h3><span>💡</span> The Plot Twist</h3>
    <p>
      That 1,700-line disaster? It's now 12 beautiful, independent state machines. 
      And it's become my most valuable teaching tool.
    </p>
    <p>
      Sometimes your biggest messes lead to your best architectures. 
      And hey, at least my IDE doesn't cry anymore! 🎉
    </p>
  </div>
`;

// Template function
const template = (state: { context: AboutContext }) => html`
  <section class="about-container">
    <div class="content">
      <h2>The Real Story 📖</h2>
      ${renderStorySection()}
      ${renderLessonsLearned()}
    </div>
    
    <div class="sidebar">
      ${renderStatsGrid(state.context.stats)}
      ${renderTechJourney(state.context.techStack)}
      ${renderPlotTwist()}
    </div>
  </section>
`;

// Styles
const styles = css`
  :host {
    display: block;
    width: 100%;
  }
  
  .about-container {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: start;
  }
  
  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  h2 {
    font-size: 2.5rem;
    color: var(--heading-color, #FFFFFF);
    margin: 0 0 1rem 0;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  @media (min-width: 768px) {
    h2 {
      font-size: 3rem;
    }
  }
  
  @media (max-width: 850px) {
    h2 {
      font-size: 2rem;
    }
  }
  
  .story-section {
    background: rgba(13, 153, 255, 0.05);
    border-left: 4px solid var(--jasper, #0D99FF);
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
  }
  
  .story-section h3 {
    color: var(--jasper, #0D99FF);
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .story-section p {
    color: var(--teagreen, #F5F5F5);
    line-height: 1.8;
    margin: 0.75rem 0;
  }
  
  .highlight {
    color: var(--jasper-light, #47B4FF);
    font-weight: 600;
  }
  
  .lessons-learned {
    background: rgba(15, 17, 21, 0.8);
    border: 1px solid rgba(13, 153, 255, 0.2);
    border-radius: 12px;
    padding: 2rem;
    margin-top: 2rem;
  }
  
  .lessons-learned h3 {
    color: var(--heading-color, #FFFFFF);
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }
  
  .lesson-item {
    display: flex;
    align-items: start;
    gap: 1rem;
    margin: 1rem 0;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.5s forwards;
  }
  
  .lesson-item:nth-child(2) { animation-delay: 0.1s; }
  .lesson-item:nth-child(3) { animation-delay: 0.2s; }
  .lesson-item:nth-child(4) { animation-delay: 0.3s; }
  
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .lesson-emoji {
    font-size: 1.5rem;
    line-height: 1;
  }
  
  .lesson-text {
    flex: 1;
    color: var(--teagreen, #F5F5F5);
    line-height: 1.6;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-top: 2rem;
  }
  
  .stat-box {
    background: rgba(13, 153, 255, 0.1);
    border: 1px solid rgba(13, 153, 255, 0.3);
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .stat-box:hover {
    transform: translateY(-4px);
    background: rgba(13, 153, 255, 0.2);
    box-shadow: 0 8px 16px rgba(13, 153, 255, 0.2);
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--jasper, #0D99FF);
    margin: 0;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: var(--teagreen, #F5F5F5);
    margin: 0.5rem 0 0 0;
  }
  
  .tech-journey {
    margin-top: 2rem;
  }
  
  .tech-journey h3 {
    color: var(--heading-color, #FFFFFF);
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
  }
  
  .tech-timeline {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  
  .tech-item {
    background: rgba(13, 153, 255, 0.1);
    color: var(--jasper-light, #47B4FF);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    border: 1px solid rgba(13, 153, 255, 0.3);
    transition: all 0.2s ease;
  }
  
  .tech-item:hover {
    background: rgba(13, 153, 255, 0.2);
    transform: translateY(-2px);
  }
  
  @media (max-width: 850px) {
    .about-container {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    h2 {
      font-size: 2rem;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// Create component using framework
const AboutSectionComponent = createComponent({
  machine: aboutMachine,
  template,
  styles,
  tagName: 'about-section',
});

// Export component
export { AboutSectionComponent };

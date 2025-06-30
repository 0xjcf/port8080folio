import { ActorComponent } from '../actor-component.js';
import '../../ui/loading-indicator.js';

export class BaristaActorUI extends ActorComponent {

  render() {
    // Calculate the base path using import.meta.url
    const componentPath = new URL(import.meta.url).pathname;
    const basePath = componentPath.substring(0, componentPath.indexOf('/src/'));
    const styleHref = `${basePath}/src/components/demos/actors/actor-ui.css`;
    if (!this.snapshot) {
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="${styleHref}">
        
        <div class="actor-box">
          <div class="actor-icon">🧽</div>
          <div class="actor-name">Barista</div>
          <div class="actor-state">Station ready</div>
          <div class="actor-story">Expert barista maintaining the coffee station, ready to craft the perfect cup...</div>
        </div>
      `;
      return;
    }

    const state = this.snapshot.value;
    const context = this.snapshot.context;

    const stateMapping = {
      'idle': {
        text: 'maintaining station',
        icon: '🧽',
        active: true,
        story: context.hasCraftedCoffee
          ? 'Station cleaned and ready for next order!'
          : 'Cleaning equipment, organizing workspace...',
        education: context.hasCraftedCoffee
          ? 'Actors automatically cleanup and reset - self-managing systems'
          : 'Idle actors can do housekeeping without blocking message processing'
      },
      'receivingOrder': {
        text: '← receiving order',
        icon: '📋',
        active: true,
        loading: true,
        story: '"Got it! One cappuccino coming up!"',
        education: 'Mailbox pattern: messages queue up if actor is busy'
      },
      'grindingBeans': {
        text: 'grinding fresh beans',
        icon: '🌱',
        active: true,
        loading: true,
        story: '*Grinding premium coffee beans*',
        education: 'Actors excel at specialized tasks - domain-driven design in action'
      },
      'brewing': {
        text: 'pulling espresso shot',
        icon: '🔥',
        active: true,
        loading: true,
        story: '*Pulling the perfect espresso shot*',
        education: 'Async message processing: actors work independently without blocking each other'
      },
      'finishingCoffee': {
        text: 'steaming milk & finishing',
        icon: '✨',
        active: true,
        loading: true,
        story: '*Steaming milk, creating perfect foam*',
        education: 'Complex workflows stay simple: each actor focuses on its role'
      },
      'coffeeReady': {
        text: '← coffee ready',
        icon: '☕',
        active: true,
        loading: true,
        story: '"Cappuccino ready at the bar!"',
        education: 'Central orchestrator routes messages between actors - clean separation of concerns'
      }
    };

    const stateInfo = stateMapping[state] || { text: state, icon: '🧽', active: false };

    // Handle loading state
    const isLoading = stateInfo.loading || false;

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/src/components/demos/actors/actor-ui.css">
      
      <div class="actor-box actor-card ${isLoading ? 'is-loading' : ''}" data-state="${state}" data-active="${stateInfo.active}">
        <div class="actor-icon state-icon">${stateInfo.icon}</div>
        <div class="actor-name">Barista</div>
        <div class="actor-state state-text">${stateInfo.text}</div>
        <div class="actor-story story-text">${stateInfo.story || ''}</div>
        <div class="actor-education">${stateInfo.education || ''}</div>
        
        ${isLoading ? `
          <loading-indicator>
          </loading-indicator>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('barista-actor-ui', BaristaActorUI);
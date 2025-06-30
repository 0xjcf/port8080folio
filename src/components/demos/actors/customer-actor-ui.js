import { ActorComponent } from '../actor-component.js';
import '../../ui/loading-indicator.js';

export class CustomerActorUI extends ActorComponent {

  render() {
    // Calculate the base path using import.meta.url
    const componentPath = new URL(import.meta.url).pathname;
    const basePath = componentPath.substring(0, componentPath.indexOf('/src/'));
    const styleHref = `${basePath}/src/components/demos/actors/actor-ui.css`;
    if (!this.snapshot) {
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="${styleHref}">
        
        <div class="actor-box">
          <div class="actor-icon">🚶</div>
          <div class="actor-name">Customer</div>
          <div class="actor-state">Entering coffee shop</div>
          <div class="actor-story">Walking in, attracted by the rich aroma of freshly brewed coffee...</div>
        </div>
      `;
      return;
    }

    const state = this.snapshot.value;
    const context = this.snapshot.context;

    const stateMapping = {
      'browsing': {
        text: 'browsing menu',
        icon: '📋',
        active: true,
        story: context.hasCompletedOrder
          ? 'Perfect coffee! Looking at the menu again...'
          : 'Reading the menu, deciding what sounds good today...',
        education: context.hasCompletedOrder
          ? 'Actors retain state between interactions, enabling personalized experiences'
          : 'Each actor instance has isolated state - no global variables or shared memory'
      },
      'ordering': {
        text: 'speaking to cashier →',
        icon: '🗣️',
        active: true,
        story: '"I\'d like a cappuccino please!"',
        education: 'Actors send messages to orchestrator, which routes them - no direct coupling'
      },
      'paying': {
        text: 'handing payment →',
        icon: '💳',
        active: true,
        loading: true, // This state has a 5s delay
        story: '*Hands over $5*',
        education: 'Asynchronous messaging means actors can work independently at their own pace'
      },
      'waiting': {
        text: 'waiting for coffee',
        icon: '⏰',
        active: true,
        story: 'Patiently waiting while barista works...',
        education: 'Actors use event-driven architecture - they sleep until a message arrives'
      },
      'enjoying': {
        text: 'enjoying coffee',
        icon: '☕',
        active: true,
        loading: true, // This state has a 5s delay before returning to browsing
        story: 'Savoring the perfect cappuccino',
        education: 'Actor mailboxes queue messages, ensuring reliable delivery and processing'
      }
    };

    const stateInfo = stateMapping[state] || { text: state, icon: '🚶', active: false };

    // Handle loading state
    const isLoading = stateInfo.loading || false;

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${styleHref}">
      
      <div class="actor-box actor-card ${isLoading ? 'is-loading' : ''}" data-state="${state}" data-active="${stateInfo.active}">
        <div class="actor-icon state-icon">${stateInfo.icon}</div>
        <div class="actor-name">Customer</div>
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

customElements.define('customer-actor-ui', CustomerActorUI);
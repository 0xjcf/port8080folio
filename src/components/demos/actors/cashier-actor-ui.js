import { ActorComponent } from '../actor-component.js';
import '../../ui/loading-indicator.js';

export class CashierActorUI extends ActorComponent {

  render() {
    // Calculate the base path using import.meta.url
    const componentPath = new URL(import.meta.url).pathname;
    const basePath = componentPath.substring(0, componentPath.indexOf('/src/'));
    const styleHref = `${basePath}/src/components/demos/actors/actor-ui.css`;
    if (!this.snapshot) {
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="${styleHref}">
        
        <div class="actor-box">
          <div class="actor-icon">👩‍💼</div>
          <div class="actor-name">Cashier</div>
          <div class="actor-state">Ready to serve</div>
          <div class="actor-story">Experienced cashier, ready to take orders and coordinate with the barista...</div>
        </div>
      `;
      return;
    }

    const state = this.snapshot.value;
    const context = this.snapshot.context;

    const stateMapping = {
      'waiting': {
        text: 'waiting for customers',
        icon: '👋',
        active: true,
        story: context.hasServedCustomer
          ? 'Ready for the next customer!'
          : 'Standing ready at the register...',
        education: context.hasServedCustomer
          ? 'Stateful actors remember context, enabling continuous workflows'
          : 'Event-driven actors consume zero CPU while waiting - ultimate efficiency'
      },
      'readyToTakeOrder': {
        text: '← receiving order',
        icon: '👂',
        active: true,
        loading: true,
        story: '"I\'d like a cappuccino please!"',
        education: 'Single-threaded message processing eliminates race conditions by design'
      },
      'takingOrder': {
        text: 'writing down order',
        icon: '✍️',
        active: true,
        loading: true,
        story: '*Writing down: 1 cappuccino*',
        education: 'Actor encapsulation: state + behavior + messaging = clean architecture'
      },
      'requestingPayment': {
        text: '← requesting payment',
        icon: '💰',
        active: true,
        story: '"That\'ll be $4.50 please"',
        education: 'No shared state means no locks, no synchronization issues'
      },
      'processingPayment': {
        text: '← processing payment',
        icon: '💵',
        active: true,
        loading: true,
        story: '*Processing payment...*',
        education: 'Orchestrator manages actor lifecycle - spawning and coordinating actors'
      },
      'waitingForCoffee': {
        text: 'order sent to barista →',
        icon: '📢',
        active: true,
        story: '"One cappuccino order!"',
        education: 'Orchestrator routes messages between actors - enabling parallel workflows'
      },
      'preparingToServe': {
        text: '← coffee ready',
        icon: '🤲',
        active: true,
        loading: true,
        story: '*Picking up the finished coffee*',
        education: 'Message-driven coordination scales better than shared memory'
      },
      'servingCoffee': {
        text: '← serving coffee',
        icon: '☕',
        active: true,
        loading: true,
        story: '"Here\'s your cappuccino!"',
        education: 'Complete workflows emerge from simple actor interactions'
      }
    };

    const stateInfo = stateMapping[state] || { text: state, icon: '👩‍💼', active: false };

    // Handle loading state
    const isLoading = stateInfo.loading || false;

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${styleHref}">
      
      <div class="actor-box actor-card ${isLoading ? 'is-loading' : ''}" data-state="${state}" data-active="${stateInfo.active}">
        <div class="actor-icon state-icon">${stateInfo.icon}</div>
        <div class="actor-name">Cashier</div>
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

customElements.define('cashier-actor-ui', CashierActorUI);
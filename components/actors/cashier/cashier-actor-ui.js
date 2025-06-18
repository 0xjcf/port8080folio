import { ActorComponent } from '../actor-component.js';

export class CashierActorUI extends ActorComponent {

  render() {
    if (!this.snapshot) {
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="./components/actors/actor-ui.css">
        <div class="actor-box">
          <div class="actor-icon">👩‍💼</div>
          <div class="actor-name">Cashier</div>
          <div class="actor-state">Ready to serve</div>
          <div class="actor-story">An experienced barista with a warm smile, ready to take your perfect order...</div>
        </div>
      `;
      return;
    }

    const state = this.snapshot.value;
    const context = this.snapshot.context;
    
    const stateMapping = {
      'waiting': { 
        text: 'ready to help', 
        icon: '👩‍💼', 
        active: false,
        story: context.hasServedCustomer
          ? 'Another happy customer! Ready to create more coffee moments...'
          : 'An experienced barista with a warm smile, ready to take your perfect order...'
      },
      'readyToTakeOrder': { text: 'listening', icon: '👂', active: true },
      'takingOrder': { text: 'writing order', icon: '✍️', active: true },
      'processingPayment': { text: 'processing payment', icon: '💵', active: true },
      'waitingForCoffee': { text: 'checking barista', icon: '👀', active: true },
      'preparingToServe': { text: 'picking up coffee', icon: '☕', active: true },
      'servingCoffee': { text: 'handing coffee', icon: '🤝', active: true }
    };

    const stateInfo = stateMapping[state] || { text: state, icon: '👩‍💼', active: false };

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./components/actors/actor-ui.css">
      
      <div class="actor-box" data-state="${state}" data-active="${stateInfo.active}">
        <div class="actor-icon">${stateInfo.icon}</div>
        <div class="actor-name">Cashier</div>
        <div class="actor-state">${stateInfo.text}</div>
        ${stateInfo.story ? `<div class="actor-story">${stateInfo.story}</div>` : ''}
      </div>
    `;
  }
}

customElements.define('cashier-actor-ui', CashierActorUI);
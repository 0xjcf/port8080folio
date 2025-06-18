import { ActorComponent } from '../actor-component.js';

export class BaristaActorUI extends ActorComponent {

  render() {
    if (!this.snapshot) {
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="./components/actors/actor-ui.css">
        <div class="actor-box">
          <div class="actor-icon">🧽</div>
          <div class="actor-name">Barista</div>
          <div class="actor-state">Station ready</div>
          <div class="actor-story">A coffee artisan who treats every cup as a masterpiece, waiting for the next creation...</div>
        </div>
      `;
      return;
    }

    const state = this.snapshot.value;
    const context = this.snapshot.context;
    
    const stateMapping = {
      'idle': { 
        text: 'cleaning station', 
        icon: '🧽', 
        active: false,
        story: context.hasCraftedCoffee
          ? 'Another masterpiece delivered! The aroma of success fills the air...'
          : 'A coffee artisan who treats every cup as a masterpiece, waiting for the next creation...'
      },
      'receivedOrder': { text: 'preparing station', icon: '👍', active: true },
      'makingCoffee': { text: 'grinding beans', icon: '🌱', active: true },
      'brewing': { text: 'extracting espresso', icon: '🔥', active: true },
      'coffeeReady': { text: 'perfect brew!', icon: '🎆', active: true }
    };

    const stateInfo = stateMapping[state] || { text: state, icon: '🧽', active: false };

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./components/actors/actor-ui.css">
      
      <div class="actor-box" data-state="${state}" data-active="${stateInfo.active}">
        <div class="actor-icon">${stateInfo.icon}</div>
        <div class="actor-name">Barista</div>
        <div class="actor-state">${stateInfo.text}</div>
        ${stateInfo.story ? `<div class="actor-story">${stateInfo.story}</div>` : ''}
      </div>
    `;
  }
}

customElements.define('barista-actor-ui', BaristaActorUI);
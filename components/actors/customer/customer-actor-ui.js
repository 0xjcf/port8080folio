import { ActorComponent } from '../actor-component.js';

export class CustomerActorUI extends ActorComponent {

  render() {
    if (!this.snapshot) {
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="./components/actors/actor-ui.css">
        <div class="actor-box">
          <div class="actor-icon">🚶</div>
          <div class="actor-name">Customer</div>
          <div class="actor-state">Ready to browse</div>
          <div class="actor-story">A coffee enthusiast walks in, drawn by the aroma of freshly ground beans...</div>
        </div>
      `;
      return;
    }

    const state = this.snapshot.value;
    const context = this.snapshot.context;
    
    const stateMapping = {
      'browsing': { 
        text: 'browsing menu', 
        icon: '🚶', 
        active: false,
        story: context.hasCompletedOrder 
          ? 'That was perfect! Already thinking about the next cup...' 
          : 'A coffee enthusiast walks in, drawn by the aroma of freshly ground beans...'
      },
      'ordering': { text: 'placing order', icon: '🗣️', active: true },
      'waiting': { text: 'waiting patiently', icon: '🧍', active: true },
      'enjoying': { text: 'savoring coffee', icon: '😌', active: true }
    };

    const stateInfo = stateMapping[state] || { text: state, icon: '🚶', active: false };

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./components/actors/actor-ui.css">
      
      <div class="actor-box" data-state="${state}" data-active="${stateInfo.active}">
        <div class="actor-icon">${stateInfo.icon}</div>
        <div class="actor-name">Customer</div>
        <div class="actor-state">${stateInfo.text}</div>
        ${stateInfo.story ? `<div class="actor-story">${stateInfo.story}</div>` : ''}
      </div>
    `;
  }
}

customElements.define('customer-actor-ui', CustomerActorUI);
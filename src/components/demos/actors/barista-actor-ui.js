import { ActorComponent } from '../actor-component.js';

export class BaristaActorUI extends ActorComponent {

  render() {
    if (!this.snapshot) {
      this.shadowRoot.innerHTML = `
        <style>
          .actor-box {
            background: rgba(15, 17, 21, 0.9);
            border: 2px solid rgba(13, 153, 255, 0.2);
            border-radius: 12px;
            padding: 30px 20px;
            text-align: center;
            min-height: 280px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
          }
          .actor-icon {
            font-size: 3rem;
            margin-bottom: 10px;
          }
          .actor-name {
            font-size: 1.2rem;
            color: #0D99FF;
            margin-bottom: 10px;
          }
          .actor-state {
            font-size: 1rem;
            color: #47B4FF;
            margin-bottom: 15px;
            font-style: italic;
          }
          .actor-story {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.5;
            text-align: center;
            font-style: italic;
          }
        </style>
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
      'makingCoffee': { 
        text: 'brewing coffee', 
        icon: '☕', 
        active: true,
        story: 'Each actor is lightweight - you can have millions of them!'
      },
      'done': { 
        text: 'coffee ready!', 
        icon: '✨', 
        active: true,
        story: 'Actor systems scale horizontally - just add more actors!'
      }
    };

    const stateInfo = stateMapping[state] || { text: state, icon: '🧽', active: false };

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/src/components/demos/actors/actor-ui.css">
      
      <div class="actor-box" data-state="${state}" data-active="${stateInfo.active}">
        <div class="actor-icon">${stateInfo.icon}</div>
        <div class="actor-name">Barista</div>
        <div class="actor-state">${stateInfo.text}</div>
        <div class="actor-story">${stateInfo.story || ''}</div>
      </div>
    `;
  }
}

customElements.define('barista-actor-ui', BaristaActorUI);
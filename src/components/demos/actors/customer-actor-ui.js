import { ActorComponent } from '../actor-component.js';

export class CustomerActorUI extends ActorComponent {

  render() {
    if (!this.snapshot) {
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="/src/components/demos/actors/actor-ui.css">
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
      'ordering': { 
        text: 'placing order', 
        icon: '🗣️', 
        active: true,
        story: 'Actors communicate through messages - just like ordering coffee!'
      },
      'paying': { 
        text: 'making payment', 
        icon: '💳', 
        active: true,
        story: 'Each actor processes messages in order - no race conditions!'
      },
      'waiting': { 
        text: 'waiting patiently', 
        icon: '🧍', 
        active: true,
        story: 'In the actor model, each actor maintains its own state independently'
      },
      'enjoying': { 
        text: 'savoring coffee', 
        icon: '😌', 
        active: true,
        story: 'Mission complete! Actors process one message at a time, ensuring order'
      }
    };

    const stateInfo = stateMapping[state] || { text: state, icon: '🚶', active: false };

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/src/components/demos/actors/actor-ui.css">
      
      <div class="actor-box" data-state="${state}" data-active="${stateInfo.active}">
        <div class="actor-icon">${stateInfo.icon}</div>
        <div class="actor-name">Customer</div>
        <div class="actor-state">${stateInfo.text}</div>
        <div class="actor-story">${stateInfo.story || ''}</div>
      </div>
    `;
  }
}

customElements.define('customer-actor-ui', CustomerActorUI);
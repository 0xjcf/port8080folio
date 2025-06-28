import { ActorComponent } from '../actor-component.js';

export class CashierActorUI extends ActorComponent {

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
          <div class="actor-icon">👩‍💼</div>
          <div class="actor-name">Cashier</div>
          <div class="actor-state">Ready to serve</div>
          <div class="actor-story">An experienced cashier with a warm smile, ready to take your perfect order...</div>
        </div>
      `;
      return;
    }

    const state = this.snapshot.value;
    const context = this.snapshot.context;
    
    const stateMapping = {
      'idle': { 
        text: 'ready to help', 
        icon: '👩‍💼', 
        active: false,
        story: context.hasServedCustomer
          ? 'Another happy customer! Ready to create more coffee moments...'
          : 'An experienced cashier with a warm smile, ready to take your perfect order...'
      },
      'takingOrder': { 
        text: 'writing order', 
        icon: '✍️', 
        active: true,
        story: 'Each actor encapsulates its own logic - separation of concerns!'
      },
      'payment': { 
        text: 'waiting for payment', 
        icon: '💳', 
        active: true,
        story: 'Actor mailboxes queue messages, preventing race conditions'
      },
      'processingPayment': { 
        text: 'processing payment', 
        icon: '💵', 
        active: true,
        story: 'Actors can create child actors - like spawning payment processors'
      },
      'orderComplete': { 
        text: 'sending to barista', 
        icon: '📋', 
        active: true,
        story: 'Message passing ensures loose coupling between components'
      }
    };

    const stateInfo = stateMapping[state] || { text: state, icon: '👩‍💼', active: false };

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/src/components/demos/actors/actor-ui.css">
      
      <div class="actor-box" data-state="${state}" data-active="${stateInfo.active}">
        <div class="actor-icon">${stateInfo.icon}</div>
        <div class="actor-name">Cashier</div>
        <div class="actor-state">${stateInfo.text}</div>
        <div class="actor-story">${stateInfo.story || ''}</div>
      </div>
    `;
  }
}

customElements.define('cashier-actor-ui', CashierActorUI);
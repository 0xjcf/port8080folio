class ActorArchitectureDiagram extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/src/styles/state-machine-education.css">
      
      <div class="container">
        <!-- Actor architecture diagram - Full width section -->
        <div class="statechart-diagram-container">
          <h3 class="concept-title" style="text-align: center; margin-bottom: 2rem;">🎭 Actor-Based Architecture in Action</h3>
          
          <div class="actor-architecture">
            <div class="orchestrator-actor">
              <div class="actor-label">Coffee Shop Orchestrator</div>
              <div class="actor-description">Spawns & coordinates all actors</div>
            </div>
            
            <div class="actor-connections">
              <div class="connection-line"></div>
              <div class="connection-line"></div>
              <div class="connection-line"></div>
              <div class="connection-line"></div>
            </div>
            
            <div class="child-actors">
              <div class="actor-box customer-actor">
                <div class="actor-icon">👤</div>
                <div class="actor-name">Customer</div>
                <div class="actor-state">browsing → ordering → enjoying</div>
              </div>
              
              <div class="actor-box cashier-actor">
                <div class="actor-icon">💼</div>
                <div class="actor-name">Cashier</div>
                <div class="actor-state">idle → taking order → payment</div>
              </div>
              
              <div class="actor-box barista-actor">
                <div class="actor-icon">☕</div>
                <div class="actor-name">Barista</div>
                <div class="actor-state">idle → making coffee → done</div>
              </div>
              
              <div class="actor-box message-log-actor">
                <div class="actor-icon">📝</div>
                <div class="actor-name">Message Log</div>
                <div class="actor-state">Collects all events</div>
              </div>
            </div>
          </div>
          
          <p class="pro-tip">
            <strong>Key insight:</strong> Each actor is completely independent. They only communicate through events, 
            making the system modular, testable, and impossible to break with race conditions.
          </p>
        </div>
        
        <style>
          .actor-architecture {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
            margin: 2rem 0;
          }
          
          .orchestrator-actor {
            background: linear-gradient(135deg, rgba(13, 153, 255, 0.2), rgba(15, 17, 21, 0.9));
            border: 2px solid var(--jasper);
            border-radius: 12px;
            padding: 1.5rem 3rem;
            text-align: center;
          }
          
          .actor-label {
            font-size: 1.3rem;
            font-weight: 600;
            color: var(--jasper);
            margin-bottom: 0.5rem;
          }
          
          .actor-description {
            color: var(--teagreen);
            opacity: 0.8;
          }
          
          .actor-connections {
            display: flex;
            gap: 4rem;
            height: 40px;
            position: relative;
          }
          
          .connection-line {
            width: 2px;
            height: 100%;
            background: var(--jasper);
            opacity: 0.5;
          }
          
          .child-actors {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            width: 100%;
            max-width: 900px;
          }
          
          .actor-box {
            background: rgba(15, 17, 21, 0.9);
            border: 2px solid rgba(13, 153, 255, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.3s ease;
          }
          
          .actor-box:hover {
            border-color: var(--jasper);
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 136, 255, 0.2);
          }
          
          .actor-icon {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
          }
          
          .actor-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--jasper);
            margin-bottom: 0.5rem;
          }
          
          .actor-state {
            font-size: 0.9rem;
            color: var(--teagreen);
            opacity: 0.8;
          }
          
          @media (max-width: 768px) {
            .child-actors {
              grid-template-columns: 1fr 1fr;
            }
            
            .actor-connections {
              gap: 2rem;
            }
          }
        </style>
      </div>
    `;
  }
}

customElements.define('actor-architecture-diagram', ActorArchitectureDiagram);
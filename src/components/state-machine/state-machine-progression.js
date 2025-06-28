class StateMachineProgression extends HTMLElement {
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
        <h3 class="concept-title" style="text-align: center; margin-bottom: 3rem;">🎯 Your Journey to Clean Architecture</h3>
        
        <div class="progression-timeline">
          <div class="timeline-item">
            <div class="timeline-marker">1</div>
            <div class="timeline-content">
              <h4>useState & useEffect Chaos</h4>
              <p>Multiple boolean flags, race conditions, sspaghetti code</p>
            </div>
          </div>
          
          <div class="timeline-connector"></div>
          
          <div class="timeline-item">
            <div class="timeline-marker">2</div>
            <div class="timeline-content">
              <h4>Basic State Machines</h4>
              <p>Clear states and transitions, no more impossible combinations</p>
            </div>
          </div>
          
          <div class="timeline-connector"></div>
          
          <div class="timeline-item">
            <div class="timeline-marker">3</div>
            <div class="timeline-content">
              <h4>Actor Model</h4>
              <p>Modular actors that communicate through messages</p>
            </div>
          </div>
          
          <div class="timeline-connector"></div>
          
          <div class="timeline-item">
            <div class="timeline-marker">4</div>
            <div class="timeline-content">
              <h4>Production Ready</h4>
              <p>Scalable, maintainable, and a joy to work with</p>
            </div>
          </div>
        </div>
        
        <p class="progression-note">
          Most teams get stuck between steps 1 and 2. I help you jump straight to step 4, 
          avoiding the common pitfalls and anti-patterns along the way.
        </p>
      </div>
      
      <style>
        .progression-timeline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 3rem 0;
          padding: 0 2rem;
        }
        
        .timeline-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .timeline-marker {
          width: 50px;
          height: 50px;
          background: var(--jasper);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
          box-shadow: 0 4px 12px rgba(13, 153, 255, 0.3);
        }
        
        .timeline-content h4 {
          color: var(--jasper);
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        
        .timeline-content p {
          color: var(--teagreen);
          font-size: 0.9rem;
          line-height: 1.5;
          max-width: 150px;
        }
        
        .timeline-connector {
          flex: 0.5;
          height: 2px;
          background: linear-gradient(90deg, var(--jasper) 0%, var(--jasper) 50%, transparent 50%);
          background-size: 20px 2px;
          margin: 0 1rem;
          margin-bottom: 4rem;
        }
        
        .progression-note {
          text-align: center;
          color: var(--teagreen);
          font-size: 1.1rem;
          margin-top: 2rem;
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .progression-timeline {
            flex-direction: column;
            padding: 0;
          }
          
          .timeline-item {
            margin-bottom: 2rem;
          }
          
          .timeline-connector {
            width: 2px;
            height: 40px;
            background: linear-gradient(180deg, var(--jasper) 0%, var(--jasper) 50%, transparent 50%);
            background-size: 2px 20px;
            margin: 0;
            margin-bottom: 2rem;
          }
          
          .timeline-content p {
            max-width: 250px;
          }
        }
      </style>
    `;
  }
}

customElements.define('state-machine-progression', StateMachineProgression);
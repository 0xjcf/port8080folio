class StateMachineDiagram extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./components/state-machine-education.css">
      
      <div class="container">
        <!-- State machine diagram - Full width section -->
        <div class="statechart-diagram-container">
          <h3 class="concept-title" style="text-align: center; margin-bottom: 2rem;">📊 From Chaos to Clarity: State Machines</h3>
          
          <div class="statechart-diagram">
            <div class="statechart-title">Traditional state machine flow:</div>
            <div class="states-flow">
              <span class="state-indicator start">●</span>
              <div class="state-box">idle</div>
              <span class="state-arrow">→</span>
              <span class="state-event">ORDER</span>
              <span class="state-arrow">→</span>
              <div class="state-box">makingCoffee</div>
              <span class="state-arrow">→</span>
              <span class="state-event">COMPLETE</span>
              <span class="state-arrow">→</span>
              <div class="state-box">done</div>
              <span class="state-indicator end">■</span>
            </div>
          </div>
          
          <p class="pro-tip">
            <strong>Pro tip:</strong> State machines make impossible states impossible. No more "loading AND error" bugs!
          </p>
        </div>
      </div>
    `;
  }
}

customElements.define('state-machine-diagram', StateMachineDiagram);
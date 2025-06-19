class StateMachineIntro extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          margin: 2rem 0;
          overflow: hidden;
        }
        
        .intro-container {
          max-width: 100%;
          margin: 0 auto;
          padding: 1rem;
          text-align: center;
          box-sizing: border-box;
        }
        
        h2 {
          font-size: 2.5rem;
          color: var(--heading-color, #FFFFFF);
          margin: 0 0 1.5rem;
        }
        
        .pain-points {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin: 1.5rem 0;
        }
        
        @media (min-width: 600px) and (max-width: 1024px) {
          .pain-points {
            grid-template-columns: 1fr;
            gap: 1.25rem;
            margin: 1.75rem 0;
          }
          
          .intro-container {
            padding: 1.5rem;
          }
          
          h2 {
            font-size: 2.25rem;
          }
        }
        
        @media (min-width: 1024px) {
          .pain-points {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
          }
        }
        
        .pain-point {
          background: rgba(15, 17, 21, 0.8);
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: left;
          box-sizing: border-box;
          max-width: 100%;
        }
        
        .pain-point-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .emoji {
          font-size: 2rem;
        }
        
        .metric {
          color: var(--jasper, #0D99FF);
          font-weight: bold;
          font-size: 1.25rem;
        }
        
        p {
          color: var(--teagreen, #F5F5F5);
          line-height: 1.6;
          margin: 0;
          font-size: 1rem;
        }
        
        @media (min-width: 768px) {
          p {
            font-size: 1.1rem;
          }
        }
        
        @media (max-width: 480px) {
          :host {
            margin: 1rem 0;
          }
          
          .intro-container {
            padding: 1rem;
          }
          
          h2 {
            font-size: 1.75rem;
            margin: 0 0 1rem;
          }
          
          .pain-point {
            padding: 1rem;
          }
          
          .emoji {
            font-size: 1.5rem;
          }
          
          .metric {
            font-size: 1.1rem;
          }
        }
      </style>
      
      <div class="intro-container">
        <h2>Is Your Frontend Team Fighting These Battles?</h2>
        
        <div class="pain-points">
          <div class="pain-point">
            <div class="pain-point-header">
              <span class="emoji">⏱️</span>
              <span class="metric">3+ days</span>
            </div>
            <p>Simple features taking days to implement because your codebase is a maze of interconnected states</p>
          </div>
          
          <div class="pain-point">
            <div class="pain-point-header">
              <span class="emoji">🐛</span>
              <span class="metric">8+ hours</span>
            </div>
            <p>Debugging sessions that feel like archaeological digs through layers of state management</p>
          </div>
          
          <div class="pain-point">
            <div class="pain-point-header">
              <span class="emoji">😰</span>
              <span class="metric">50% slower</span>
            </div>
            <p>New developers taking weeks to understand the codebase because state flows are unclear</p>
          </div>
        </div>
        
        <p>These aren't just annoying developer problems. They're costing your business real money and slowing down your ability to ship features that matter.</p>
      </div>
    `;
  }
}

customElements.define('state-machine-intro', StateMachineIntro);
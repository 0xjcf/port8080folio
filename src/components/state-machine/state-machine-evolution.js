class StateMachineEvolution extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // Calculate the base path using import.meta.url
    const componentPath = new URL(import.meta.url).pathname;
    const basePath = componentPath.substring(0, componentPath.indexOf('/src/'));
    const styleHref = `${basePath}/src/styles/state-machine-education.css`;
    
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${styleHref}">
      
      <div class="container">
        <div class="evolution-section">
          <h3 class="concept-title">🚀 But Wait... State Machines Aren't Enough</h3>
          <p class="concept-description">
            State machines solve the chaos problem, but what happens when you have multiple features that need to work together? 
            A shopping cart, user authentication, real-time notifications, data fetching... 
          </p>
          <p class="concept-description" style="margin-top: 1rem;">
            <strong>Enter the Actor Model:</strong> Instead of one giant state machine (hello, 1,700-line monster!), 
            you create small, focused "actors" that handle their own state and communicate through messages. 
            Like a well-run coffee shop where everyone knows their role.
          </p>
          
          <div class="comparison-grid">
            <div class="comparison-item">
              <h4>❌ Traditional Approach</h4>
              <ul>
                <li>One massive state machine</li>
                <li>Everything knows about everything</li>
                <li>Change one thing, break three others</li>
                <li>New developer: "Where do I even start?"</li>
              </ul>
            </div>
            
            <div class="comparison-item">
              <h4>✅ Actor Model Approach</h4>
              <ul>
                <li>Small, focused actors</li>
                <li>Each actor minds its own business</li>
                <li>Add features without touching old code</li>
                <li>New developer: "Oh, this makes sense!"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        .evolution-section {
          background: linear-gradient(135deg, rgba(13, 153, 255, 0.05), rgba(15, 17, 21, 0.9));
          border: 2px solid rgba(13, 153, 255, 0.2);
          border-radius: 12px;
          padding: 3rem;
          margin: 2rem 0;
        }
        
        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }
        
        .comparison-item {
          background: rgba(0, 0, 0, 0.3);
          padding: 1.5rem;
          border-radius: 8px;
        }
        
        .comparison-item h4 {
          color: var(--jasper);
          margin-bottom: 1rem;
        }
        
        .comparison-item ul {
          list-style: none;
          padding: 0;
        }
        
        .comparison-item li {
          color: var(--teagreen);
          padding: 0.5rem 0;
          line-height: 1.6;
        }
        
        .comparison-item li::before {
          content: "• ";
          color: var(--jasper);
          font-weight: bold;
        }
        
        @media (max-width: 768px) {
          .comparison-grid {
            grid-template-columns: 1fr;
          }
          
          .evolution-section {
            padding: 2rem;
          }
        }
      </style>
    `;
  }
}

customElements.define('state-machine-evolution', StateMachineEvolution);
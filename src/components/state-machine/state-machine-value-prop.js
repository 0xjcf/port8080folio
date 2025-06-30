class StateMachineValueProp extends HTMLElement {
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
        <div class="concept-section" style="background: linear-gradient(135deg, rgba(13, 153, 255, 0.1), rgba(15, 17, 21, 0.9)); border: 2px solid var(--jasper);">
          <h3 class="concept-title" style="font-size: 1.4rem; font-weight: 600; letter-spacing: -0.01em;">🎯 Ready to Fix Your State Management?</h3>
          <p class="concept-description" style="font-size: 1.2rem; margin-bottom: 2rem;">
            You've just seen how actor-based architecture turns chaos into clarity. 
            Now imagine your most complex feature working this smoothly.
          </p>
          
          <div style="display: grid; gap: 1.5rem; margin: 2rem 0;">
            <div style="background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 8px;">
              <h4 style="color: var(--jasper); margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: 600;">For Your Team:</h4>
              <ul style="color: var(--teagreen); line-height: 1.8; padding-left: 20px;">
                <li>New developers productive in days, not months</li>
                <li>Features that plug in without breaking others</li>
                <li>Code reviews that actually make sense</li>
              </ul>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 8px;">
              <h4 style="color: var(--jasper); margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: 600;">For Your Business:</h4>
              <ul style="color: var(--teagreen); line-height: 1.8; padding-left: 20px;">
                <li>Ship features 3x faster with confidence</li>
                <li>Stop losing users to broken workflows</li>
                <li>Cut maintenance costs by 70%+</li>
              </ul>
            </div>
          </div>
          
          <p class="concept-description" style="margin-top: 2rem; font-size: 1.3rem; color: var(--jasper); text-align: center;">
            <strong>I specialize in rescuing complex React/Vue applications.</strong><br>
            <span style="font-size: 1.1rem;">From 1,700-line components to clean actor architectures.</span>
          </p>
        </div>
      </div>
    `;
  }
}

customElements.define('state-machine-value-prop', StateMachineValueProp);
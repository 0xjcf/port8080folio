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
      <link rel="stylesheet" href="./components/state-machine-education.css">
      
      <div class="container">
        <h2 class="section-title">Your App Works...<br class="mobile-break"/> Until It Doesn't 🤯</h2>
        <p class="subtitle">
          You know that feeling when adding "just one more feature" breaks three others? When fixing a bug creates two more? 
          When your code becomes so complex that even you read it and are afraid to touch it?
        </p>
        <p class="subtitle" style="margin-top: 20px;">
          <strong>You're not alone.</strong> I've seen codebases with 1,700-line components, impossible-to-trace bugs, 
          and developers who'd rather quit than debug their own creation. The problem? Your app's complexity has 
          outgrown your architecture.
        </p>
      </div>
    `;
  }
}

customElements.define('state-machine-intro', StateMachineIntro);
class LoadingState extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.messages = [
      "Brewing some code magic... ☕",
      "Optimizing those bundles... 📦",
      "Making state machines behave... 🤖",
      "Reducing complexity one line at a time... 📏",
      "Lazy loading the good stuff... 🦥",
      "Compiling Rust at the speed of light... 🦀",
      "Teaching components to play nice... 🎯",
      "Hydrating those web components... 💧"
    ];
    
    this.currentMessageIndex = 0;
  }

  connectedCallback() {
    this.render();
    this.startMessageRotation();
  }

  disconnectedCallback() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
  }

  render() {
    // Import brand-icon dynamically
    import('./brand-icon.js').then(() => {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            width: 100%;
          }
          
          .loader-container {
            text-align: center;
            padding: 2rem;
          }
          
          .loading-wrapper {
            margin: 0 auto 2rem;
            animation: rotate 3s linear infinite;
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .loading-message {
            color: var(--teagreen, #F5F5F5);
            font-size: 1.125rem;
            margin: 0;
            min-height: 1.5em;
            opacity: 0;
            animation: fadeIn 0.5s forwards;
          }
          
          @keyframes fadeIn {
            to { opacity: 1; }
          }
          
          .progress-dots {
            display: inline-flex;
            gap: 0.25rem;
            margin-left: 0.5rem;
          }
          
          .dot {
            width: 6px;
            height: 6px;
            background: var(--jasper, #0D99FF);
            border-radius: 50%;
            opacity: 0.3;
            animation: pulse 1.4s infinite;
          }
          
          .dot:nth-child(2) { animation-delay: 0.2s; }
          .dot:nth-child(3) { animation-delay: 0.4s; }
          
          @keyframes pulse {
            0%, 60%, 100% { opacity: 0.3; }
            30% { opacity: 1; }
          }
        </style>
        
        <div class="loader-container">
          <div class="loading-wrapper">
            <brand-icon size="80" animate="true" icon-type="state-machine"></brand-icon>
          </div>
          <p class="loading-message">
            <span id="message-text">${this.messages[0]}</span>
            <span class="progress-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </span>
          </p>
        </div>
      `;
      
      // Restart message rotation after render
      if (this.messageInterval) {
        clearInterval(this.messageInterval);
      }
      this.startMessageRotation();
    });
  }

  startMessageRotation() {
    const messageElement = this.shadowRoot.getElementById('message-text');
    
    this.messageInterval = setInterval(() => {
      messageElement.style.animation = 'none';
      setTimeout(() => {
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
        messageElement.textContent = this.messages[this.currentMessageIndex];
        messageElement.style.animation = 'fadeIn 0.5s forwards';
      }, 100);
    }, 3000);
  }
}

customElements.define('loading-state', LoadingState);

export { LoadingState };
// TypeScript interfaces for Actor Architecture Diagram
interface ActorNode {
  id: string;
  name: string;
  type: 'customer' | 'cashier' | 'barista' | 'orchestrator';
  position: { x: number; y: number };
  state: string;
  description: string;
}

interface MessageFlow {
  from: string;
  to: string;
  message: string;
  type: 'event' | 'command' | 'response';
  timestamp: number;
}

interface DiagramConfig {
  showAnimation?: boolean;
  interactiveMode?: boolean;
  showMessages?: boolean;
  autoPlay?: boolean;
}

interface DiagramState {
  actors: ActorNode[];
  activeMessages: MessageFlow[];
  currentStep: number;
  isPlaying: boolean;
}

class ActorArchitectureDiagram extends HTMLElement {
  private config: DiagramConfig;
  private diagramState!: DiagramState; // Definite assignment assertion
  private animationInterval: number | null = null;
  private svgElement: SVGSVGElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      showAnimation: this.getAttribute('show-animation') !== 'false',
      interactiveMode: this.getAttribute('interactive-mode') === 'true',
      showMessages: this.getAttribute('show-messages') !== 'false',
      autoPlay: this.getAttribute('auto-play') === 'true'
    };
    this.initializeDiagramState();
  }

  static get observedAttributes(): string[] {
    return ['show-animation', 'interactive-mode', 'show-messages', 'auto-play'];
  }

  connectedCallback(): void {
    this.render();
    this.addEventListeners();
    
    if (this.config.autoPlay) {
      setTimeout(() => this.startAnimation(), 1000);
    }
  }

  disconnectedCallback(): void {
    this.pauseAnimation();
    this.removeEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.updateConfig();
      this.render();
    }
  }

  private updateConfig(): void {
    this.config = {
      showAnimation: this.getAttribute('show-animation') !== 'false',
      interactiveMode: this.getAttribute('interactive-mode') === 'true',
      showMessages: this.getAttribute('show-messages') !== 'false',
      autoPlay: this.getAttribute('auto-play') === 'true'
    };
  }

  private initializeDiagramState(): void {
    this.diagramState = {
      actors: [
        {
          id: 'customer',
          name: 'Customer',
          type: 'customer',
          position: { x: 100, y: 150 },
          state: 'idle',
          description: 'Initiates orders and receives coffee'
        },
        {
          id: 'cashier',
          name: 'Cashier',
          type: 'cashier',
          position: { x: 300, y: 150 },
          state: 'idle',
          description: 'Processes orders and payments'
        },
        {
          id: 'barista',
          name: 'Barista',
          type: 'barista',
          position: { x: 500, y: 150 },
          state: 'idle',
          description: 'Prepares coffee orders'
        },
        {
          id: 'orchestrator',
          name: 'Orchestrator',
          type: 'orchestrator',
          position: { x: 300, y: 50 },
          state: 'coordinating',
          description: 'Coordinates communication between actors'
        }
      ],
      activeMessages: [],
      currentStep: 0,
      isPlaying: false
    };
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(15, 17, 21, 0.95) 0%, rgba(8, 8, 8, 0.98) 100%);
          border-radius: 16px;
          border: 2px solid rgba(13, 153, 255, 0.2);
          position: relative;
          overflow: hidden;
        }
        
        :host::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--jasper), var(--jasper-light), transparent);
          opacity: 0.8;
        }
        
        .diagram-container {
          position: relative;
        }
        
        .diagram-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .diagram-title {
          color: var(--jasper, #0D99FF);
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
        }
        
        .diagram-subtitle {
          color: var(--teagreen, #F5F5F5);
          font-size: 1rem;
          margin: 0;
          opacity: 0.9;
        }
        
        .diagram-controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        
        .control-button {
          background: linear-gradient(135deg, var(--jasper, #0D99FF) 0%, var(--jasper-light, #47B4FF) 100%);
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .control-button:disabled {
          background: rgba(13, 153, 255, 0.3);
          cursor: not-allowed;
        }
        
        .control-button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(13, 153, 255, 0.3);
        }
        
        .svg-container {
          width: 100%;
          height: 300px;
          background: rgba(13, 153, 255, 0.05);
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        
        .diagram-svg {
          width: 100%;
          height: 100%;
        }
        
        .actor-node {
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .actor-node:hover .actor-circle {
          stroke-width: 3;
          r: 32;
        }
        
        .actor-circle {
          fill: rgba(13, 153, 255, 0.2);
          stroke: var(--jasper, #0D99FF);
          stroke-width: 2;
          transition: all 0.3s ease;
        }
        
        .actor-circle.active {
          fill: rgba(13, 153, 255, 0.4);
          stroke-width: 3;
          r: 35;
        }
        
        .actor-text {
          fill: var(--teagreen, #F5F5F5);
          font-size: 12px;
          font-weight: 600;
          text-anchor: middle;
          dominant-baseline: central;
        }
        
        .actor-state {
          fill: var(--jasper-light, #47B4FF);
          font-size: 10px;
          text-anchor: middle;
          dominant-baseline: central;
        }
        
        .message-line {
          stroke: var(--jasper, #0D99FF);
          stroke-width: 2;
          stroke-dasharray: 5,5;
          fill: none;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        
        .message-line.active {
          opacity: 1;
          animation: dash 2s linear infinite;
        }
        
        @keyframes dash {
          0% {
            stroke-dashoffset: 10;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .message-text {
          fill: var(--jasper-light, #47B4FF);
          font-size: 10px;
          font-weight: 500;
          text-anchor: middle;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        
        .message-text.active {
          opacity: 1;
        }
        
        .legend {
          margin-top: 1.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .legend-item {
          background: rgba(13, 153, 255, 0.08);
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }
        
        .legend-title {
          color: var(--jasper-light, #47B4FF);
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }
        
        .legend-description {
          color: var(--teagreen, #F5F5F5);
          font-size: 0.8rem;
          margin: 0;
          opacity: 0.9;
          line-height: 1.4;
        }
        
        .educational-note {
          background: rgba(13, 153, 255, 0.08);
          border: 1px solid rgba(13, 153, 255, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 2rem;
          position: relative;
        }
        
        .educational-note::before {
          content: '🏗️';
          position: absolute;
          top: 1rem;
          left: 1rem;
          font-size: 1.5rem;
        }
        
        .educational-note h3 {
          color: var(--jasper, #0D99FF);
          margin: 0 0 1rem 2.5rem;
          font-size: 1.1rem;
        }
        
        .educational-note p {
          color: var(--teagreen, #F5F5F5);
          margin: 0 0 0 2.5rem;
          line-height: 1.6;
          opacity: 0.95;
        }
        
        @media (max-width: 768px) {
          .svg-container {
            height: 250px;
          }
          
          .diagram-controls {
            flex-direction: column;
            align-items: center;
          }
          
          .control-button {
            width: 200px;
          }
        }
      </style>
      
      <div class="diagram-container">
        <div class="diagram-header">
          <h2 class="diagram-title">🏗️ Actor Architecture</h2>
          <p class="diagram-subtitle">Visual representation of actor communication patterns</p>
        </div>
        
        ${this.config.interactiveMode ? `
          <div class="diagram-controls">
            <button class="control-button" id="play-btn" ${this.diagramState.isPlaying ? 'disabled' : ''}>
              Play Animation
            </button>
            <button class="control-button" id="pause-btn" ${!this.diagramState.isPlaying ? 'disabled' : ''}>
              Pause
            </button>
            <button class="control-button" id="reset-btn" ${this.diagramState.isPlaying ? 'disabled' : ''}>
              Reset
            </button>
          </div>
        ` : ''}
        
        <div class="svg-container">
          <svg class="diagram-svg" id="diagram-svg" viewBox="0 0 600 250">
            <!-- Background grid -->
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(13, 153, 255, 0.1)" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <!-- Message lines -->
            ${this.renderMessageLines()}
            
            <!-- Actor nodes -->
            ${this.renderActorNodes()}
            
            <!-- Message text -->
            ${this.renderMessageText()}
          </svg>
        </div>
        
        <div class="legend">
          ${this.diagramState.actors.map(actor => `
            <div class="legend-item">
              <div class="legend-title">${this.escapeHtml(actor.name)}</div>
              <div class="legend-description">${this.escapeHtml(actor.description)}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="educational-note">
          <h3>Actor Model Benefits</h3>
          <p>
            Each actor operates independently with its own state and mailbox. 
            Communication happens only through message passing, creating a 
            loosely coupled, resilient system that's easy to reason about and test.
          </p>
        </div>
      </div>
    `;

    this.svgElement = this.shadowRoot.querySelector('#diagram-svg') as SVGSVGElement;
  }

  private renderActorNodes(): string {
    return this.diagramState.actors.map(actor => `
      <g class="actor-node" data-actor-id="${actor.id}">
        <circle 
          class="actor-circle ${actor.state === 'active' ? 'active' : ''}"
          cx="${actor.position.x}" 
          cy="${actor.position.y}" 
          r="30"
        />
        <text 
          class="actor-text" 
          x="${actor.position.x}" 
          y="${actor.position.y - 5}"
        >
          ${this.escapeHtml(actor.name)}
        </text>
        <text 
          class="actor-state" 
          x="${actor.position.x}" 
          y="${actor.position.y + 8}"
        >
          ${this.escapeHtml(actor.state)}
        </text>
      </g>
    `).join('');
  }

  private renderMessageLines(): string {
    const predefinedMessages = [
      { from: 'customer', to: 'cashier', message: 'ORDER', type: 'event' },
      { from: 'cashier', to: 'orchestrator', message: 'PROCESS_ORDER', type: 'command' },
      { from: 'orchestrator', to: 'barista', message: 'PREPARE_COFFEE', type: 'command' },
      { from: 'barista', to: 'orchestrator', message: 'COFFEE_READY', type: 'response' },
      { from: 'orchestrator', to: 'customer', message: 'ORDER_COMPLETE', type: 'response' }
    ];

    return predefinedMessages.map((msg, index) => {
      const fromActor = this.diagramState.actors.find(a => a.id === msg.from);
      const toActor = this.diagramState.actors.find(a => a.id === msg.to);
      
      if (!fromActor || !toActor) return '';

      const isActive = this.diagramState.activeMessages.some(
        activeMsg => activeMsg.from === msg.from && activeMsg.to === msg.to
      );

      return `
        <line 
          class="message-line ${isActive ? 'active' : ''}"
          x1="${fromActor.position.x}" 
          y1="${fromActor.position.y}" 
          x2="${toActor.position.x}" 
          y2="${toActor.position.y}"
          data-message-index="${index}"
        />
      `;
    }).join('');
  }

  private renderMessageText(): string {
    const predefinedMessages = [
      { from: 'customer', to: 'cashier', message: 'ORDER', type: 'event' },
      { from: 'cashier', to: 'orchestrator', message: 'PROCESS_ORDER', type: 'command' },
      { from: 'orchestrator', to: 'barista', message: 'PREPARE_COFFEE', type: 'command' },
      { from: 'barista', to: 'orchestrator', message: 'COFFEE_READY', type: 'response' },
      { from: 'orchestrator', to: 'customer', message: 'ORDER_COMPLETE', type: 'response' }
    ];

    return predefinedMessages.map((msg, index) => {
      const fromActor = this.diagramState.actors.find(a => a.id === msg.from);
      const toActor = this.diagramState.actors.find(a => a.id === msg.to);
      
      if (!fromActor || !toActor) return '';

      const midX = (fromActor.position.x + toActor.position.x) / 2;
      const midY = (fromActor.position.y + toActor.position.y) / 2 - 10;

      const isActive = this.diagramState.activeMessages.some(
        activeMsg => activeMsg.from === msg.from && activeMsg.to === msg.to
      );

      return `
        <text 
          class="message-text ${isActive ? 'active' : ''}"
          x="${midX}" 
          y="${midY}"
          data-message-index="${index}"
        >
          ${this.escapeHtml(msg.message)}
        </text>
      `;
    }).join('');
  }

  private addEventListeners(): void {
    if (!this.shadowRoot) return;

    const playBtn = this.shadowRoot.getElementById('play-btn');
    const pauseBtn = this.shadowRoot.getElementById('pause-btn');
    const resetBtn = this.shadowRoot.getElementById('reset-btn');

    playBtn?.addEventListener('click', () => this.startAnimation());
    pauseBtn?.addEventListener('click', () => this.pauseAnimation());
    resetBtn?.addEventListener('click', () => this.resetAnimation());

    // Actor node click handlers
    const actorNodes = this.shadowRoot.querySelectorAll('.actor-node');
    actorNodes.forEach(node => {
      node.addEventListener('click', this.handleActorClick.bind(this));
    });
  }

  private removeEventListeners(): void {
    // Event listeners are automatically removed when shadow DOM is destroyed
  }

  private handleActorClick(event: Event): void {
    const target = event.currentTarget as Element;
    const actorId = target.getAttribute('data-actor-id');
    
    if (actorId) {
      this.highlightActor(actorId);
      this.trackEvent('actor_clicked', { actorId });
    }
  }

  private highlightActor(actorId: string): void {
    // Reset all actors
    this.diagramState.actors.forEach(actor => {
      actor.state = actor.id === 'orchestrator' ? 'coordinating' : 'idle';
    });

    // Highlight clicked actor
    const actor = this.diagramState.actors.find(a => a.id === actorId);
    if (actor) {
      actor.state = 'active';
    }

    this.render();
  }

  private startAnimation(): void {
    if (this.diagramState.isPlaying) return;

    this.diagramState.isPlaying = true;
    this.diagramState.currentStep = 0;

    const messageSequence = [
      { from: 'customer', to: 'cashier', message: 'ORDER', duration: 1000 },
      { from: 'cashier', to: 'orchestrator', message: 'PROCESS_ORDER', duration: 1000 },
      { from: 'orchestrator', to: 'barista', message: 'PREPARE_COFFEE', duration: 1500 },
      { from: 'barista', to: 'orchestrator', message: 'COFFEE_READY', duration: 1000 },
      { from: 'orchestrator', to: 'customer', message: 'ORDER_COMPLETE', duration: 1000 }
    ];

    this.animateMessageSequence(messageSequence, 0);
    this.render();
    this.trackEvent('animation_started', { timestamp: Date.now() });
  }

  private animateMessageSequence(sequence: any[], index: number): void {
    if (index >= sequence.length || !this.diagramState.isPlaying) {
      this.diagramState.isPlaying = false;
      this.diagramState.activeMessages = [];
      this.render();
      return;
    }

    const message = sequence[index];
    this.diagramState.activeMessages = [message];
    this.render();

    setTimeout(() => {
      this.animateMessageSequence(sequence, index + 1);
    }, message.duration);
  }

  private pauseAnimation(): void {
    this.diagramState.isPlaying = false;
    this.diagramState.activeMessages = [];
    this.render();
    this.trackEvent('animation_paused', { 
      step: this.diagramState.currentStep 
    });
  }

  private resetAnimation(): void {
    this.diagramState.isPlaying = false;
    this.diagramState.activeMessages = [];
    this.diagramState.currentStep = 0;
    
    // Reset all actor states
    this.diagramState.actors.forEach(actor => {
      actor.state = actor.id === 'orchestrator' ? 'coordinating' : 'idle';
    });

    this.render();
    this.trackEvent('animation_reset', { timestamp: Date.now() });
  }

  private trackEvent(eventName: string, data: any): void {
    // Analytics tracking
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, {
        'event_category': 'actor_architecture_diagram',
        'event_label': eventName,
        'custom_parameters': data
      });
    }

    // Custom analytics
    if (window.customAnalytics) {
      window.customAnalytics.track(eventName, {
        component: 'actor-architecture-diagram',
        ...data
      });
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API methods
  public play(): void {
    this.startAnimation();
  }

  public pause(): void {
    this.pauseAnimation();
  }

  public reset(): void {
    this.resetAnimation();
  }

  public highlightActorById(actorId: string): void {
    this.highlightActor(actorId);
  }

  public getDiagramState(): DiagramState {
    return { ...this.diagramState };
  }
}

// Register the custom element
customElements.define('actor-architecture-diagram', ActorArchitectureDiagram);

export default ActorArchitectureDiagram; 
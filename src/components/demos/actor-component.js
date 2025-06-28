// Base class for actor UI components
export class ActorComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._actor = null;
    this._subscription = null;
    this.snapshot = null;
  }

  get actor() {
    return this._actor;
  }

  set actor(newActor) {
    // Unsubscribe from previous actor
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }

    this._actor = newActor;

    if (this._actor) {
      // Subscribe to actor state changes
      this._subscription = this._actor.subscribe((snapshot) => {
        this.snapshot = snapshot;
        this.render();
      });
      
      // Initial render with current snapshot
      this.snapshot = this._actor.getSnapshot();
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
  }

  render() {
    // Override in subclasses
  }

  renderStyles() {
    // Common styles for actors
    return `
      <style>
        :host {
          display: block;
        }
        .actor-container {
          background: #1a1b26;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 1rem;
          margin: 0.5rem 0;
        }
        .actor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .actor-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #e1e1e1;
        }
        .actor-state {
          background: #0D99FF;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        .actor-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        button {
          background: #0D99FF;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        button:hover {
          background: #0077CC;
        }
        button:disabled {
          background: #4a4a4a;
          cursor: not-allowed;
        }
      </style>
    `;
  }
}
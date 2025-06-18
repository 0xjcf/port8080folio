// Base class for actor-aware components
export class ActorComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._actor = null;
    this._subscription = null;
    this._snapshot = null;
  }

  connectedCallback() {
    // Initial render when connected to DOM
    this.render();
  }

  // Actor setter for parent-provided actors
  set actor(actorRef) {
    this.cleanup();
    
    if (actorRef) {
      this._actor = actorRef;
      this._subscription = actorRef.subscribe((snapshot) => {
        this._snapshot = snapshot;
        this.onSnapshot(snapshot);
        this.render();
      });
    }
  }

  get actor() {
    return this._actor;
  }

  get snapshot() {
    return this._snapshot;
  }

  // Override this to handle snapshot updates
  onSnapshot(snapshot) {
    // Override in subclasses
  }

  // Override this to render UI
  render() {
    // Override in subclasses
  }

  cleanup() {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
  }

  disconnectedCallback() {
    this.cleanup();
  }
}
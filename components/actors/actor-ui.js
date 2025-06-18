// Base class for actor UI components
export class ActorUI extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._state = 'unknown';
    this._context = {};
  }

  set state(value) {
    this._state = value;
    this.updateUI();
  }

  get state() {
    return this._state;
  }

  set context(value) {
    this._context = value;
    this.updateUI();
  }

  get context() {
    return this._context;
  }

  connectedCallback() {
    this.render();
    this.updateUI();
  }

  render() {
    // Override in subclasses
  }

  updateUI() {
    // Override in subclasses
  }
}
// TypeScript interfaces for Actor Component Base Class
interface ActorSnapshot {
  value: string;
  context: any;
  matches: (value: string) => boolean;
  can: (event: any) => boolean;
  [key: string]: any;
}

interface Actor {
  getSnapshot(): ActorSnapshot;
  send(event: any): void;
  subscribe(observer: (snapshot: ActorSnapshot) => void): { unsubscribe(): void };
  start?(): void;
  stop?(): void;
}

interface ActorComponentConfig {
  autoRender?: boolean;
  trackChanges?: boolean;
  debugMode?: boolean;
}

/**
 * ActorComponent - Base class for XState Actor-powered Web Components
 * 
 * Provides common functionality for components that need to:
 * - Subscribe to XState actor state changes
 * - Automatically re-render when actor state updates
 * - Handle actor lifecycle management
 * - Track state changes for debugging/analytics
 */
abstract class ActorComponent extends HTMLElement {
  protected _actor: Actor | null = null;
  protected subscription: { unsubscribe(): void } | null = null;
  protected snapshot: ActorSnapshot | null = null;
  protected config: ActorComponentConfig;

  constructor(config: ActorComponentConfig = {}) {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      autoRender: true,
      trackChanges: false,
      debugMode: false,
      ...config
    };
  }

  static get observedAttributes(): string[] {
    return ['debug-mode', 'auto-render'];
  }

  get actor(): Actor | null {
    return this._actor;
  }

  set actor(newActor: Actor | null) {
    // Clean up existing subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this._actor = newActor;

    if (this._actor) {
      // Subscribe to actor state changes
      this.subscription = this._actor.subscribe((snapshot) => {
        this.handleStateChange(snapshot);
      });

      // Get initial state
      this.handleStateChange(this._actor.getSnapshot());
    } else {
      this.snapshot = null;
      if (this.config.autoRender) {
        this.render();
      }
    }
  }

  connectedCallback(): void {
    this.updateConfigFromAttributes();
    
    if (this.config.autoRender) {
      this.render();
    }
    
    this.onConnected();
  }

  disconnectedCallback(): void {
    this.cleanup();
    this.onDisconnected();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.updateConfigFromAttributes();
      
      if (this.config.autoRender) {
        this.render();
      }
    }
  }

  protected handleStateChange(snapshot: ActorSnapshot): void {
    const previousSnapshot = this.snapshot;
    this.snapshot = snapshot;

    if (this.config.debugMode) {
      console.log(`[${this.constructor.name}] State change:`, {
        from: previousSnapshot?.value || 'none',
        to: snapshot.value,
        context: snapshot.context
      });
    }

    if (this.config.trackChanges) {
      this.trackStateChange(previousSnapshot, snapshot);
    }

    // Call lifecycle hook
    this.onStateChange(snapshot, previousSnapshot);

    // Auto-render if enabled
    if (this.config.autoRender) {
      this.render();
    }
  }

  protected updateConfigFromAttributes(): void {
    this.config.debugMode = this.getAttribute('debug-mode') === 'true';
    this.config.autoRender = this.getAttribute('auto-render') !== 'false';
  }

  protected trackStateChange(previous: ActorSnapshot | null, current: ActorSnapshot): void {
    const eventData = {
      component: this.constructor.name.toLowerCase(),
      fromState: previous?.value || 'none',
      toState: current.value,
      context: current.context,
      timestamp: Date.now()
    };

    // Analytics tracking
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'actor_state_change', {
        'event_category': 'actor_component',
        'event_label': this.constructor.name,
        'custom_parameters': eventData
      });
    }

    // Custom analytics
    if (window.customAnalytics) {
      window.customAnalytics.track('actor_state_change', eventData);
    }
  }

  protected cleanup(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this._actor = null;
    this.snapshot = null;
  }

  protected getStateClasses(): string[] {
    if (!this.snapshot) return ['no-actor'];
    
    const baseClasses = [`state-${this.snapshot.value.replace(/\./g, '-')}`];
    
    // Add context-based classes if available
    if (this.snapshot.context) {
      const context = this.snapshot.context;
      
      if (context.loading) baseClasses.push('loading');
      if (context.error) baseClasses.push('error');
      if (context.success) baseClasses.push('success');
    }
    
    return baseClasses;
  }

  protected createStateElement(content: string = ''): string {
    const stateClasses = this.getStateClasses().join(' ');
    return `<div class="actor-state ${stateClasses}">${content}</div>`;
  }

  protected escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  protected formatState(state: string): string {
    return state
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  // Abstract method - must be implemented by subclasses
  protected abstract render(): void;

  // Lifecycle hooks - can be overridden by subclasses
  protected onConnected(): void {
    // Override in subclasses
  }

  protected onDisconnected(): void {
    // Override in subclasses
  }

  protected onStateChange(current: ActorSnapshot, previous: ActorSnapshot | null): void {
    // Override in subclasses
  }

  // Public API methods
  public getCurrentState(): string | null {
    return this.snapshot?.value || null;
  }

  public getContext(): any {
    return this.snapshot?.context || null;
  }

  public sendEvent(event: any): void {
    this._actor?.send(event);
  }

  public canSendEvent(event: any): boolean {
    return this.snapshot?.can(event) ?? false;
  }

  public matches(state: string): boolean {
    return this.snapshot?.matches(state) ?? false;
  }

  public forceRender(): void {
    this.render();
  }

  public enableDebugMode(enable: boolean = true): void {
    this.config.debugMode = enable;
    this.setAttribute('debug-mode', enable.toString());
  }

  public setAutoRender(autoRender: boolean = true): void {
    this.config.autoRender = autoRender;
    this.setAttribute('auto-render', autoRender.toString());
  }
}

export default ActorComponent; 
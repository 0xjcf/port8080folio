// Import reactive infrastructure and development configuration

import { assign, createActor, fromCallback, setup } from 'xstate';
import { globalEventDelegation } from '../framework/core/global-event-delegation.js';
import { createComponent, css, html } from '../framework/core/index.js';
// Removed ReactiveEventBus import since we're using SimpleEventBus
import { devConfig } from './dev-config.js';

// Create a simple event emitter wrapper for compatibility
class SimpleEventBus {
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  once(event: string, callback: (data: unknown) => void): void {
    const onceWrapper = (data: unknown) => {
      callback(data);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }

  off(event: string, callback: (data: unknown) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }
}

// Create a global event bus instance
const eventBus = new SimpleEventBus();

// Type definitions for external libraries and globals
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    webVitals: {
      getCLS: (callback: (metric: { value: number }) => void) => void;
      getFID: (callback: (metric: { value: number }) => void) => void;
      getLCP: (callback: (metric: { value: number }) => void) => void;
      getFCP: (callback: (metric: { value: number }) => void) => void;
      getTTFB: (callback: (metric: { value: number }) => void) => void;
    };
  }
}

// Type definitions
interface PerformanceMetrics {
  'Page Load Time': number;
  'DOM Content Loaded': number;
  'First Byte': number;
  'DNS Lookup': number;
  'TCP Connection': number;
}

interface ErrorDetails {
  message: string;
  source: string;
  line: number;
  column: number;
  stack: string;
}

type EventCategory = 'performance' | 'error' | 'web_vitals' | 'engagement' | 'external_link';

interface ApplicationContext {
  lastScrollDepth: number;
  konamiIndex: number;
  analyticsConsent: boolean;
  konamiCode: readonly string[];
}

// ===== REACTIVE STORAGE SERVICE =====

function getFromStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// ===== REACTIVE OBSERVER SERVICE =====

class ReactiveObserver {
  private observer: IntersectionObserver;
  private machine: { send: (event: { type: string; isVisible?: boolean }) => void };

  constructor(
    machine: { send: (event: { type: string; isVisible?: boolean }) => void },
    options: IntersectionObserverInit = {}
  ) {
    this.machine = machine;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target.classList.contains('name')) {
          this.machine.send({ type: 'CTA_VISIBILITY_CHANGED', isVisible: entry.isIntersecting });
        }
      });
    }, options);
  }

  observeElement(element: Element | null): void {
    if (element) {
      this.observer.observe(element);
    }
  }

  disconnect(): void {
    this.observer.disconnect();
  }
}

// ===== REACTIVE EVENT BUS =====
// Using global event delegation from framework

class ReactiveEventBus {
  private machine: { send: (event: Record<string, unknown>) => void };
  private listenerIds: string[] = [];

  constructor(machine: { send: (event: Record<string, unknown>) => void }) {
    this.machine = machine;
    this.setupGlobalDelegation();
  }

  private setupGlobalDelegation(): void {
    // Use global event delegation instead of direct addEventListener
    this.listenerIds.push(
      globalEventDelegation.subscribeClick({
        action: 'HANDLE_CLICK',
        callback: (_action, event) => {
          const target = event.target as HTMLElement;
          const link = target.closest('a[target="_blank"]');
          if (link) {
            this.machine.send({
              type: 'EXTERNAL_LINK_CLICKED',
              href: (link as HTMLAnchorElement).href,
            });
          }

          if (target.closest('.cta')) {
            this.machine.send({ type: 'CTA_CLICKED' });
          }
        },
      })
    );

    // Use event bus for form submission
    eventBus.on('form-submitted', (data: unknown) => {
      const { formId } = data as { formId: string };
      if (formId === 'mc-embedded-subscribe-form') {
        this.machine.send({ type: 'FORM_SUBMITTED', formId });
      }
    });

    // Use event bus for window events
    eventBus.on('window-loaded', () => this.machine.send({ type: 'WINDOW_LOADED' }));
    eventBus.on('window-error', (data: unknown) => {
      const details = data as ErrorDetails;
      this.machine.send({ type: 'WINDOW_ERROR', details });
    });
    eventBus.on('popstate', () => this.machine.send({ type: 'POPSTATE' }));

    // Use global event delegation for keyboard
    this.listenerIds.push(
      globalEventDelegation.subscribeKeyboard({
        key: '*', // Listen to all keys
        action: 'KEYDOWN',
        callback: (_action, event) => {
          const e = event as KeyboardEvent;
          this.machine.send({ type: 'KEYDOWN', key: e.key });
        },
      })
    );
  }

  disconnect(): void {
    this.listenerIds.forEach((id) => globalEventDelegation.unsubscribe(id));
  }
}

// ===== SCROLL TRACKING SERVICE =====

const _createScrollTracker = () =>
  fromCallback(({ sendBack }) => {
    let listenerId: string | null = null;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
      sendBack({ type: 'SCROLL_UPDATE', scrollPercent });
    };

    // Use global event delegation with throttling
    listenerId = globalEventDelegation.subscribe(
      {
        id: `scroll-tracker-${Date.now()}`,
        eventType: 'scroll',
        target: 'window',
        action: 'SCROLL',
        throttle: 200,
      },
      () => handleScroll()
    );

    return () => {
      if (listenerId) {
        globalEventDelegation.unsubscribe(listenerId);
      }
    };
  });

// ===== APPLICATION STATE MACHINE =====

type ApplicationEvent =
  | { type: 'DOM_CONTENT_LOADED' }
  | { type: 'WINDOW_LOADED' }
  | { type: 'WINDOW_ERROR'; details: ErrorDetails }
  | { type: 'SCROLL_UPDATE'; scrollPercent: number }
  | { type: 'EXTERNAL_LINK_CLICKED'; href: string }
  | { type: 'CTA_CLICKED' }
  | { type: 'FORM_SUBMITTED'; formId: string }
  | { type: 'POPSTATE' }
  | { type: 'KEYDOWN'; key: string }
  | { type: 'CTA_VISIBILITY_CHANGED'; isVisible: boolean }
  | { type: 'ANALYTICS_CONSENT_LOADED'; hasConsent: boolean }
  | { type: 'EMAIL_PREFILL_COMPLETED' }
  | { type: 'OBSERVER_SETUP_COMPLETED' };

const applicationMachine = setup({
  types: {
    context: {} as ApplicationContext,
    events: {} as ApplicationEvent,
  },
  actors: {
    scrollTracker: fromCallback(({ sendBack }) => {
      let listenerId: string | null = null;

      const handleScroll = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
        sendBack({ type: 'SCROLL_UPDATE', scrollPercent });
      };

      // Use global event delegation with throttling
      listenerId = globalEventDelegation.subscribe(
        {
          id: `scroll-tracker-${Date.now()}`,
          eventType: 'scroll',
          target: 'window',
          action: 'SCROLL',
          throttle: 200,
        },
        () => handleScroll()
      );

      return () => {
        if (listenerId) {
          globalEventDelegation.unsubscribe(listenerId);
        }
      };
    }),
  },
  actions: {
    initializeAnalyticsConsent: assign({
      analyticsConsent: () => {
        const consent = getFromStorage('analytics_consent');
        return consent === 'accepted';
      },
    }),

    handleEmailPreFill: () => {
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');

      if (emailParam) {
        // Use event bus instead of document.dispatchEvent
        eventBus.emit('prefill-email', { email: decodeURIComponent(emailParam) });

        // Clean URL by removing email param
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.delete('email');
        const newSearch = searchParams.toString();
        const newUrl = `${currentPath}${newSearch ? `?${newSearch}` : ''}${currentHash}`;
        history.replaceState({}, '', newUrl);

        if (window.location.hash === '#newsletter-signup') {
          // Use event bus instead of document.dispatchEvent
          eventBus.emit('scroll-to-newsletter', {});
        }
      }
    },

    trackPerformanceMetrics: () => {
      if (window.performance) {
        const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (timing) {
          const metrics: PerformanceMetrics = {
            'Page Load Time': Math.round(timing.duration),
            'DOM Content Loaded': Math.round(
              timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart
            ),
            'First Byte': Math.round(timing.responseStart - timing.requestStart),
            'DNS Lookup': Math.round(timing.domainLookupEnd - timing.domainLookupStart),
            'TCP Connection': Math.round(timing.connectEnd - timing.connectStart),
          };

          Object.entries(metrics).forEach(([label, value]) => {
            trackEvent('performance', 'timing', label, value);
          });
        }
      }

      if (typeof window.webVitals !== 'undefined') {
        window.webVitals.getCLS((metric) => {
          trackEvent(
            'web_vitals',
            'cls',
            'Cumulative Layout Shift',
            Math.round(metric.value * 1000)
          );
        });
        window.webVitals.getFID((metric) => {
          trackEvent('web_vitals', 'fid', 'First Input Delay', Math.round(metric.value));
        });
        window.webVitals.getLCP((metric) => {
          trackEvent('web_vitals', 'lcp', 'Largest Contentful Paint', Math.round(metric.value));
        });
        window.webVitals.getFCP((metric) => {
          trackEvent('web_vitals', 'fcp', 'First Contentful Paint', Math.round(metric.value));
        });
        window.webVitals.getTTFB((metric) => {
          trackEvent('web_vitals', 'ttfb', 'Time to First Byte', Math.round(metric.value));
        });
      }
    },

    handleError: ({ event }) => {
      if (event.type === 'WINDOW_ERROR') {
        trackEvent(
          'error',
          'exception',
          `${event.details.message} at ${event.details.source}:${event.details.line}`
        );
      }
    },

    handleScroll: ({ context, event }) => {
      if (event.type === 'SCROLL_UPDATE') {
        const scrollPercent = event.scrollPercent;
        if (scrollPercent > context.lastScrollDepth && [25, 50, 75, 100].includes(scrollPercent)) {
          trackEvent('engagement', 'scroll_depth', `${scrollPercent}%`);
          context.lastScrollDepth = scrollPercent;
        }
      }
    },

    handleExternalLinkClick: ({ event }) => {
      if (event.type === 'EXTERNAL_LINK_CLICKED') {
        trackEvent('external_link', 'click', event.href);
      }
    },

    handleCTAClick: () => {
      trackEvent('engagement', 'cta_click', 'Lets Connect CTA');
    },

    handleFormSubmit: ({ event }) => {
      if (event.type === 'FORM_SUBMITTED') {
        trackEvent('engagement', 'newsletter_signup', 'Newsletter Form');
      }
    },

    trackCTAVisibility: ({ event }) => {
      if (event.type === 'CTA_VISIBILITY_CHANGED' && !event.isVisible) {
        trackEvent('engagement', 'cta_visible', 'CTA Activated');
      }
    },

    handlePopstate: () => {
      if (window.gtag) {
        window.gtag('config', 'G-5TR1LWNXXY', {
          page_path: window.location.pathname,
          anonymize_ip: true,
        });
      }
    },

    handleKonamiCode: ({ context, event }) => {
      if (event.type === 'KEYDOWN') {
        if (event.key === context.konamiCode[context.konamiIndex]) {
          context.konamiIndex++;
          if (context.konamiIndex === context.konamiCode.length) {
            triggerKonamiEasterEgg();
            context.konamiIndex = 0;
          }
        } else {
          context.konamiIndex = 0;
        }
      }
    },

    setupReactiveServices: ({ self }) => {
      // Create wrappers with compatible interfaces
      const eventBusWrapper = {
        send: (event: Record<string, unknown>) => {
          if ('type' in event) {
            self.send(event as ApplicationEvent);
          }
        },
      };

      const observerWrapper = {
        send: (event: { type: string; isVisible?: boolean }) => {
          if (event.type === 'CTA_VISIBILITY_CHANGED' && event.isVisible !== undefined) {
            self.send({ type: 'CTA_VISIBILITY_CHANGED', isVisible: event.isVisible });
          }
        },
      };

      new ReactiveEventBus(eventBusWrapper);
      const observer = new ReactiveObserver(observerWrapper, {
        threshold: 0.2,
        rootMargin: '0px',
      });
      // Use reactive refs instead of querySelector
      const nameElement = document.body.querySelector('.name');
      if (nameElement) {
        observer.observeElement(nameElement);
      }
    },
  },
}).createMachine({
  id: 'application',
  initial: 'initializing',
  context: {
    lastScrollDepth: 0,
    konamiIndex: 0,
    analyticsConsent: false,
    konamiCode: [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ] as const,
  },
  states: {
    initializing: {
      entry: ['initializeAnalyticsConsent'],
      always: { target: 'ready' },
    },
    ready: {
      entry: ['setupReactiveServices'],
      invoke: {
        src: 'scrollTracker',
      },
      on: {
        DOM_CONTENT_LOADED: {
          actions: ['handleEmailPreFill'],
          target: '.domReady',
        },
        WINDOW_LOADED: { actions: ['trackPerformanceMetrics'] },
        WINDOW_ERROR: { actions: ['handleError'] },
        SCROLL_UPDATE: { actions: ['handleScroll'] },
        EXTERNAL_LINK_CLICKED: { actions: ['handleExternalLinkClick'] },
        CTA_CLICKED: { actions: ['handleCTAClick'] },
        FORM_SUBMITTED: { actions: ['handleFormSubmit'] },
        POPSTATE: { actions: ['handlePopstate'] },
        KEYDOWN: { actions: ['handleKonamiCode'] },
        CTA_VISIBILITY_CHANGED: { actions: ['trackCTAVisibility'] },
      },
      states: {
        domPending: {},
        domReady: {},
      },
    },
  },
});

// ===== ACHIEVEMENT STATE MACHINE =====

const achievementMachine = setup({
  types: {
    context: {} as Record<string, never>,
    events: {} as { type: 'SHOW' } | { type: 'HIDE' } | { type: 'AUTO_HIDE' },
  },
}).createMachine({
  id: 'achievement',
  initial: 'hidden',
  context: {},
  states: {
    hidden: {
      on: { SHOW: { target: 'showing' } },
    },
    showing: {
      after: { 3000: { target: 'hidden' } },
      on: { HIDE: { target: 'hidden' } },
    },
  },
});

// Extract nested template to fix nesting depth
const renderAchievement = (state: string) => html`
  <div class="achievement" data-state=${state}>
    🎮 Achievement Unlocked: Konami Master! 🎉
  </div>
`;

const achievementTemplate = (state: { value: string }) => html`
  ${state.value === 'showing' ? renderAchievement(state.value) : ''}
`;

// Create base component
const AchievementBase = createComponent({
  machine: achievementMachine,
  template: achievementTemplate,
  styles: css`
    .achievement {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #0D99FF, #47B4FF);
      color: white;
      padding: 2rem 3rem;
      border-radius: 12px;
      font-size: 1.5rem;
      font-weight: bold;
      z-index: 10000;
      animation: achievementPop 0.5s ease-out;
      box-shadow: 0 10px 30px rgba(13, 153, 255, 0.4);
    }

    @keyframes achievementPop {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.1);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
  `,
});

// Extend with connected callback
class _AchievementComponent extends AchievementBase {
  connectedCallback() {
    super.connectedCallback();
    // Listen for konami event
    eventBus.on('konami-triggered', () => {
      this.send({ type: 'SHOW' });
    });
  }
}

customElements.define('achievement-badge', _AchievementComponent);

// ===== CONFETTI STATE MACHINE =====

interface ConfettiPiece {
  id: string;
  color: string;
  startX: number;
  endX: number;
  duration: number;
  rotation: number;
}

const confettiMachine = setup({
  types: {
    context: {} as { pieces: ConfettiPiece[] },
    events: {} as { type: 'BURST' } | { type: 'CLEAR' },
  },
  actions: {
    generatePieces: assign({
      pieces: () => {
        const confettiColors = ['#0D99FF', '#47B4FF', '#F5F5F5', '#FFD700'];
        const confettiCount = 100;
        const pieces: ConfettiPiece[] = [];

        for (let i = 0; i < confettiCount; i++) {
          const startX = Math.random() * window.innerWidth;
          pieces.push({
            id: `confetti-${Date.now()}-${i}`,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            startX,
            endX: startX + (Math.random() - 0.5) * 200,
            duration: 2000 + Math.random() * 1000,
            rotation: Math.random() * 720,
          });
        }
        return pieces;
      },
    }),
    clearPieces: assign({ pieces: [] }),
  },
}).createMachine({
  id: 'confetti',
  initial: 'idle',
  context: { pieces: [] },
  states: {
    idle: {
      on: { BURST: { target: 'active', actions: 'generatePieces' } },
    },
    active: {
      after: { 5000: { target: 'idle', actions: 'clearPieces' } },
      on: { CLEAR: { target: 'idle', actions: 'clearPieces' } },
    },
  },
});

// Confetti component template
const renderConfettiPiece = (piece: ConfettiPiece) => html`
  <div 
    class="confetti-piece" 
    data-id=${piece.id}
    style="
      --start-x: ${piece.startX}px;
      --end-x: ${piece.endX}px;
      --duration: ${piece.duration}ms;
      --rotation: ${piece.rotation}deg;
      background: ${piece.color};
    "
  ></div>
`;

const confettiTemplate = (state: { context: { pieces: ConfettiPiece[] } }) => html`
  <div class="confetti-container">
    ${state.context.pieces.map((piece) => renderConfettiPiece(piece))}
  </div>
`;

const confettiStyles = css`
  :host {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
  }

  .confetti-piece {
    position: fixed;
    width: 10px;
    height: 10px;
    left: var(--start-x);
    top: -20px;
    animation: confetti-fall var(--duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  @keyframes confetti-fall {
    to {
      transform: translate(
        calc(var(--end-x) - var(--start-x)),
        calc(100vh + 20px)
      ) rotate(var(--rotation));
      opacity: 0;
    }
  }
`;

// Create base component
const ConfettiBase = createComponent({
  machine: confettiMachine,
  template: confettiTemplate,
  styles: confettiStyles,
});

// Extend with connected callback
class _ConfettiComponent extends ConfettiBase {
  connectedCallback() {
    super.connectedCallback();
    // Listen for konami event
    eventBus.on('konami-triggered', () => {
      this.send({ type: 'BURST' });
    });
  }
}

customElements.define('confetti-burst', _ConfettiComponent);

function triggerKonamiEasterEgg(): void {
  trackEvent('engagement', 'easter_egg', 'konami_code');

  // Use event bus to trigger confetti and achievement
  eventBus.emit('konami-triggered', {});

  // Components will listen for this event and respond accordingly
}

// ===== UTILITY FUNCTIONS =====

function trackEvent(category: EventCategory, action: string, label: string, value?: number): void {
  const appActor = getApplicationActor();
  const hasConsent = appActor?.getSnapshot().context.analyticsConsent;

  if (window.gtag && hasConsent) {
    const eventParams: {
      event_category: EventCategory;
      event_label: string;
      non_interaction: boolean;
      value?: number;
    } = {
      event_category: category,
      event_label: label,
      non_interaction:
        category === 'performance' || category === 'error' || category === 'web_vitals',
    };

    if (value !== undefined) {
      eventParams.value = value;
    }

    window.gtag('event', action, eventParams);
  }
}

function _throttle<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = performance.now();
    if (now - lastCall >= wait) {
      func.apply(this, args);
      lastCall = now;
    }
  };
}

// ===== APPLICATION INITIALIZATION =====

let applicationActor: ReturnType<typeof createActor> | null = null;

function getApplicationActor() {
  return applicationActor;
}

function initializeApplication(): void {
  import('../components/ui/simple-mobile-nav.js').then(() => {}).catch((_err: Error) => {});

  applicationActor = createActor(applicationMachine);
  applicationActor.start();

  // Use event bus for DOM content loaded
  if (document.readyState === 'loading') {
    eventBus.once('dom-content-loaded', () => {
      applicationActor?.send({ type: 'DOM_CONTENT_LOADED' });
    });
    // Emit event when DOM is ready
    globalEventDelegation.subscribe(
      {
        id: 'dom-content-loaded-emitter',
        eventType: 'DOMContentLoaded',
        target: 'document',
        action: 'DOM_READY',
      },
      () => {
        eventBus.emit('dom-content-loaded', {});
      }
    );
  } else {
    applicationActor.send({ type: 'DOM_CONTENT_LOADED' });
  }

  // Easter egg components will be auto-registered and available
  // They can be added to the HTML directly: <achievement-component></achievement-component>
  // and <confetti-burst></confetti-burst>

  devConfig.log('Reactive application architecture initialized');
}

if (devConfig.isEnabled('enablePerformanceLogging')) {
  devConfig.log('Performance logging enabled');
}

initializeApplication();

// LoadingState component refactored to use Actor-SPA Framework API
import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, html, type RawHTML } from '../../framework/core/index.js';

// ✅ Type-safe interfaces following framework patterns
interface LoadingStateContext {
  message: string;
  size: 'small' | 'medium' | 'large';
  color: string;
  overlay: boolean;
  type: LoadingStateType;
}

type LoadingStateType = 'spinner' | 'dots' | 'pulse' | 'skeleton';

type LoadingStateEvents =
  | { type: 'SHOW' }
  | { type: 'HIDE' }
  | { type: 'UPDATE_MESSAGE'; message: string }
  | { type: 'UPDATE_TYPE'; loadingType: LoadingStateType }
  | { type: 'UPDATE_CONFIG'; config: Partial<LoadingStateContext> };

// ✅ XState machine for state management
const loadingStateMachine = setup({
  types: {
    context: {} as LoadingStateContext,
    events: {} as LoadingStateEvents,
  },
  actions: {
    updateMessage: assign({
      message: ({ event }) => (event.type === 'UPDATE_MESSAGE' ? event.message : 'Loading...'),
    }),
    updateType: assign({
      type: ({ event }) => (event.type === 'UPDATE_TYPE' ? event.loadingType : 'spinner'),
    }),
    updateConfig: assign({
      message: ({ event, context }) =>
        event.type === 'UPDATE_CONFIG'
          ? (event.config.message ?? context.message)
          : context.message,
      size: ({ event, context }) =>
        event.type === 'UPDATE_CONFIG' ? (event.config.size ?? context.size) : context.size,
      color: ({ event, context }) =>
        event.type === 'UPDATE_CONFIG' ? (event.config.color ?? context.color) : context.color,
      overlay: ({ event, context }) =>
        event.type === 'UPDATE_CONFIG'
          ? (event.config.overlay ?? context.overlay)
          : context.overlay,
      type: ({ event, context }) =>
        event.type === 'UPDATE_CONFIG' ? (event.config.type ?? context.type) : context.type,
    }),
  },
}).createMachine({
  id: 'loading-state',
  initial: 'visible',
  context: {
    message: 'Loading...',
    size: 'medium',
    color: 'var(--jasper, #0D99FF)',
    overlay: false,
    type: 'spinner',
  },
  states: {
    visible: {
      on: {
        HIDE: 'hidden',
        UPDATE_MESSAGE: { actions: 'updateMessage' },
        UPDATE_TYPE: { actions: 'updateType' },
        UPDATE_CONFIG: { actions: 'updateConfig' },
      },
    },
    hidden: {
      on: {
        SHOW: 'visible',
        UPDATE_MESSAGE: { actions: 'updateMessage' },
        UPDATE_TYPE: { actions: 'updateType' },
        UPDATE_CONFIG: { actions: 'updateConfig' },
      },
    },
  },
});

// ✅ Pure template function using framework html``
const loadingStateTemplate = (state: SnapshotFrom<typeof loadingStateMachine>): RawHTML => {
  const { message, size, color, overlay, type } = state.context;

  // ✅ Use state machine states instead of boolean context
  if (state.matches('hidden')) {
    return html`<div style="display: none;"></div>`;
  }

  const sizeMap = {
    small: { spinner: '24px', text: '0.875rem' },
    medium: { spinner: '32px', text: '1rem' },
    large: { spinner: '48px', text: '1.125rem' },
  };

  const sizes = sizeMap[size];

  // Build CSS custom properties for dynamic styling
  const cssProperties = [
    `--display-mode: ${overlay ? 'flex' : 'inline-flex'}`,
    `--position: ${overlay ? 'fixed' : 'relative'}`,
    `--top: ${overlay ? '0' : 'auto'}`,
    `--left: ${overlay ? '0' : 'auto'}`,
    `--right: ${overlay ? '0' : 'auto'}`,
    `--bottom: ${overlay ? '0' : 'auto'}`,
    `--z-index: ${overlay ? '9999' : 'auto'}`,
    `--background: ${overlay ? 'rgba(0, 0, 0, 0.5)' : 'transparent'}`,
    `--backdrop-filter: ${overlay ? 'blur(4px)' : 'none'}`,
    `--container-background: ${overlay ? 'rgba(15, 17, 21, 0.95)' : 'transparent'}`,
    `--container-padding: ${overlay ? '2rem' : '0'}`,
    `--container-border-radius: ${overlay ? '16px' : '0'}`,
    `--container-border: ${overlay ? '1px solid rgba(13, 153, 255, 0.2)' : 'none'}`,
    `--spinner-size: ${sizes.spinner}`,
    `--text-size: ${sizes.text}`,
    `--color: ${color}`,
  ].join('; ');

  const loadingIndicator = (): RawHTML => {
    switch (type) {
      case 'dots':
        return html`
          <div class="dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        `;
      case 'pulse':
        return html`<div class="pulse-circle"></div>`;
      case 'skeleton':
        return html`<div class="skeleton"></div>`;
      default:
        return html`<div class="spinner"></div>`;
    }
  };

  // Extract message template to reduce nesting
  const messageTemplate = message ? html`<div class="loading-message">${message}</div>` : '';

  return html`
    <div class="loading-container" style=${cssProperties}>
      ${loadingIndicator()}
      ${messageTemplate}
    </div>
  `;
};

// ✅ Static styles using CSS custom properties for dynamic values
const loadingStateStyles = `
  :host {
    display: var(--display-mode, inline-flex);
    align-items: center;
    justify-content: center;
    position: var(--position, relative);
    top: var(--top, auto);
    left: var(--left, auto);
    right: var(--right, auto);
    bottom: var(--bottom, auto);
    z-index: var(--z-index, auto);
    background: var(--background, transparent);
    backdrop-filter: var(--backdrop-filter, none);
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    background: var(--container-background, transparent);
    padding: var(--container-padding, 0);
    border-radius: var(--container-border-radius, 0);
    border: var(--container-border, none);
  }
  
  .spinner {
    width: var(--spinner-size, 32px);
    height: var(--spinner-size, 32px);
    border: 3px solid rgba(13, 153, 255, 0.1);
    border-top: 3px solid var(--color, var(--jasper, #0D99FF));
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .dots {
    display: flex;
    gap: 0.5rem;
  }
  
  .dot {
    width: 8px;
    height: 8px;
    background: var(--color, var(--jasper, #0D99FF));
    border-radius: 50%;
    animation: pulse 1.4s ease-in-out infinite both;
  }
  
  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }
  
  .pulse-circle {
    width: var(--spinner-size, 32px);
    height: var(--spinner-size, 32px);
    background: var(--color, var(--jasper, #0D99FF));
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }
  
  .skeleton {
    width: 200px;
    height: 20px;
    background: linear-gradient(90deg, rgba(13, 153, 255, 0.1) 25%, rgba(13, 153, 255, 0.2) 50%, rgba(13, 153, 255, 0.1) 75%);
    background-size: 200% 100%;
    animation: skeleton 2s ease-in-out infinite;
    border-radius: 4px;
  }
  
  .loading-message {
    color: var(--teagreen, #F5F5F5);
    font-size: var(--text-size, 1rem);
    font-weight: 500;
    text-align: center;
    opacity: 0.9;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes skeleton {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

// ✅ Create the component using framework API
const LoadingStateComponent = createComponent({
  machine: loadingStateMachine,
  template: loadingStateTemplate,
  styles: loadingStateStyles,
});

// ✅ Export the component class for programmatic access
export default LoadingStateComponent;

// ✅ Export types for external use
export type { LoadingStateContext, LoadingStateEvents, LoadingStateType };

// ✅ Usage Examples:
//
// 1. Basic usage (auto-registered as <loading-state-component>):
//    <loading-state-component></loading-state-component>
//
// 2. Programmatic usage:
//    const loading = new LoadingStateComponent();
//    document.body.appendChild(loading);
//
//    // Show/hide programmatically
//    loading.send({ type: 'SHOW' });
//    loading.send({ type: 'HIDE' });
//
//    // Update message
//    loading.send({ type: 'UPDATE_MESSAGE', message: 'Processing...' });
//
//    // Change loading type
//    loading.send({ type: 'UPDATE_TYPE', loadingType: 'dots' });
//
//    // Update multiple config values
//    loading.send({
//      type: 'UPDATE_CONFIG',
//      config: {
//        overlay: true,
//        size: 'large',
//        color: '#FF6B6B'
//      }
//    });
//
// 3. Migration from old API:
//
//    // OLD WAY (manual HTMLElement):
//    const oldLoading = document.createElement('loading-state');
//    oldLoading.setAttribute('message', 'Loading...');
//    oldLoading.show();
//    oldLoading.hide();
//
//    // NEW WAY (Framework API):
//    const newLoading = new LoadingStateComponent();
//    newLoading.send({ type: 'UPDATE_MESSAGE', message: 'Loading...' });
//    newLoading.send({ type: 'SHOW' });
//    newLoading.send({ type: 'HIDE' });
//
// Benefits of the new approach:
// ✅ Type-safe events and state management
// ✅ Automatic XSS protection via html``
// ✅ Declarative state management with XState
// ✅ Automatic lifecycle management
// ✅ Better testability with framework test utilities
// ✅ Consistent API across all framework components

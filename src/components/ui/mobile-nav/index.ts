// Mobile Navigation Actor - Main exports
// Following Actor Model architecture with proper separation of concerns

// Type definitions
export type {
    NavigationSource,
    NavigationItem,
    MobileNavContext,
    MobileNavEvent,
    MobileNavState,
    NavEventDetail,
    NavItemEventDetail,
    NavStateEventDetail
} from './types.js';

// State machine and configuration
export {
    mobileNavMachine,
    initialContext,
    serializableMachineConfig
} from './machine.js';

export type { MobileNavMachine } from './machine.js';

// Actions, guards, and services (for external use if needed)
export { actions, guards, services } from './actions.js';

// Controller/Actor
export { MobileNavController } from './controller.js';
export type { MobileNavActor } from './controller.js';

// Web Component (View layer)
export { default as MobileNavComponent } from './component.js';

// Default export is the controller
export { MobileNavController as default } from './controller.js'; 
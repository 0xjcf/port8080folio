// Mobile Navigation Types - Pure type definitions
export type NavigationSource = 
    | 'button' 
    | 'swipe' 
    | 'keyboard' 
    | 'backdrop' 
    | 'close-button' 
    | 'swipe-right' 
    | 'toggle' 
    | 'navigation' 
    | 'external' 
    | 'api' 
    | 'manual-test' 
    | 'unknown';

export interface NavigationItem {
    href: string;
    text: string;
}

// Context interface - serializable
export interface MobileNavContext {
    isOpen: boolean;
    lastOpenedAt: number | null;
    lastClosedAt: number | null;
    openSource: NavigationSource | null;
    closeSource: NavigationSource | null;
    scrollPosition: number;
    selectedItem: NavigationItem | null;
    interactionCount: number;
}

// Event types - serializable
export type MobileNavEvent =
    | { type: 'OPEN'; source: NavigationSource }
    | { type: 'CLOSE'; source: NavigationSource }
    | { type: 'TOGGLE'; source: NavigationSource }
    | { type: 'SELECT_ITEM'; item: NavigationItem }
    | { type: 'UPDATE_SCROLL'; position: number };

// State value types
export type MobileNavState = 'closed' | 'open';

// Custom event detail interfaces for DOM events
export interface NavEventDetail {
    source: NavigationSource;
}

export interface NavItemEventDetail {
    href: string;
    text: string;
}

export interface NavStateEventDetail {
    state: MobileNavState;
    context: MobileNavContext;
    isOpen: boolean;
}

// Component interface (will be provided by the actual component class)

// Global window extensions will be declared in controller.ts 
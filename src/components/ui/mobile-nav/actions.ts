// Mobile Navigation Actions - Pure business logic
import { assign } from 'xstate';
import { devConfig } from '../../../scripts/dev-config.js';
import type { 
    MobileNavContext, 
    MobileNavEvent, 
    NavigationSource 
} from './types.js';

// Action implementations - these are pure functions
export const actions = {
    // Entry actions
    setOpen: assign({
        isOpen: true,
        lastOpenedAt: () => Date.now()
    }),

    setClosed: assign({
        isOpen: false,
        lastClosedAt: () => Date.now()
    }),

    incrementInteractions: assign({
        interactionCount: ({ context }: { context: MobileNavContext }) => 
            context.interactionCount + 1
    }),

    // Source tracking actions
    setOpenSource: assign({
        openSource: ({ event }: { event: MobileNavEvent }) => {
            if (event.type === 'OPEN' || event.type === 'TOGGLE') {
                return event.source;
            }
            return null;
        }
    }),

    setCloseSource: assign({
        closeSource: ({ event }: { event: MobileNavEvent }) => {
            if (event.type === 'CLOSE' || event.type === 'TOGGLE') {
                return event.source;
            }
            return null;
        }
    }),

    // Navigation selection actions
    selectItem: assign({
        selectedItem: ({ event }: { event: MobileNavEvent }) => {
            if (event.type === 'SELECT_ITEM') {
                return event.item;
            }
            return null;
        },
        closeSource: 'navigation' as NavigationSource
    }),

    // Scroll tracking
    updateScrollPosition: assign({
        scrollPosition: ({ event }: { event: MobileNavEvent }) => {
            if (event.type === 'UPDATE_SCROLL') {
                return event.position;
            }
            return 0;
        }
    }),

    // Analytics and logging
    trackNavigation: ({ context, event }: { 
        context: MobileNavContext; 
        event: MobileNavEvent; 
    }) => {
        if (event.type === 'SELECT_ITEM') {
            devConfig.log('Navigation item selected:', {
                item: event.item,
                openDuration: context.lastOpenedAt ? Date.now() - context.lastOpenedAt : 0,
                totalInteractions: context.interactionCount
            });
        }
    },

    trackOpen: ({ context, event }: { 
        context: MobileNavContext; 
        event: MobileNavEvent; 
    }) => {
        if (event.type === 'OPEN' || event.type === 'TOGGLE') {
            devConfig.log('Navigation opened:', {
                source: event.source,
                previousCloseTime: context.lastClosedAt
            });
        }
    },

    trackClose: ({ context, event }: { 
        context: MobileNavContext; 
        event: MobileNavEvent; 
    }) => {
        if (event.type === 'CLOSE' || event.type === 'TOGGLE') {
            devConfig.log('Navigation closed:', {
                source: event.source,
                openDuration: context.lastOpenedAt ? Date.now() - context.lastOpenedAt : 0
            });
        }
    }
};

// Guards - pure predicate functions
export const guards = {
    isValidOpenSource: ({ event }: { event: MobileNavEvent }) => {
        if (event.type === 'OPEN' || event.type === 'TOGGLE') {
            const validSources: NavigationSource[] = [
                'button', 'keyboard', 'api', 'external', 'manual-test'
            ];
            return validSources.includes(event.source);
        }
        return false;
    },

    isValidCloseSource: ({ event }: { event: MobileNavEvent }) => {
        if (event.type === 'CLOSE' || event.type === 'TOGGLE') {
            const validSources: NavigationSource[] = [
                'backdrop', 'close-button', 'swipe-right', 'keyboard', 'api', 'navigation'
            ];
            return validSources.includes(event.source);
        }
        return false;
    },

    hasValidItem: ({ event }: { event: MobileNavEvent }) => {
        if (event.type === 'SELECT_ITEM') {
            return event.item && 
                   typeof event.item.href === 'string' && 
                   typeof event.item.text === 'string' &&
                   event.item.href.length > 0;
        }
        return false;
    }
};

// Services - for async operations (none needed for mobile nav, but here for completeness)
export const services = {
    // Future: could add analytics service, routing service, etc.
}; 
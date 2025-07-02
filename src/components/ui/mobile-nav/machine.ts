// Mobile Navigation State Machine - Pure serializable configuration
import { createMachine, assign } from 'xstate';
import { devConfig } from '../../../scripts/dev-config.js';
import type { MobileNavContext, NavigationSource } from './types.js';

// Initial context - serializable
export const initialContext: MobileNavContext = {
    isOpen: false,
    lastOpenedAt: null,
    lastClosedAt: null,
    openSource: null,
    closeSource: null,
    scrollPosition: 0,
    selectedItem: null,
    interactionCount: 0
};

// Create the state machine with inline implementations for better TypeScript support
export const mobileNavMachine = createMachine({
    id: 'mobileNavigation',
    initial: 'closed',
    context: initialContext,
    states: {
        closed: {
            entry: [
                assign({
                    isOpen: false,
                    lastClosedAt: () => Date.now()
                }),
                assign(({ event }: any) => ({
                    closeSource: event?.source || null
                })),
                ({ context, event }: any) => {
                    if (event?.source) {
                        devConfig.log('Navigation closed:', {
                            source: event.source,
                            openDuration: context.lastOpenedAt ? Date.now() - context.lastOpenedAt : 0
                        });
                    }
                }
            ],
            on: {
                OPEN: {
                    target: 'open',
                    actions: [
                        assign(({ event }: any) => ({
                            openSource: event.source
                        }))
                    ]
                },
                TOGGLE: {
                    target: 'open',
                    actions: [
                        assign(({ event }: any) => ({
                            openSource: event.source
                        }))
                    ]
                }
            }
        },
        open: {
            entry: [
                assign({
                    isOpen: true,
                    lastOpenedAt: () => Date.now()
                }),
                assign(({ context }: any) => ({
                    interactionCount: context.interactionCount + 1
                })),
                ({ context, event }: any) => {
                    if (event?.source) {
                        devConfig.log('Navigation opened:', {
                            source: event.source,
                            previousCloseTime: context.lastClosedAt
                        });
                    }
                }
            ],
            on: {
                CLOSE: {
                    target: 'closed',
                    actions: [
                        assign(({ event }: any) => ({
                            closeSource: event.source
                        }))
                    ]
                },
                TOGGLE: {
                    target: 'closed',
                    actions: [
                        assign(({ event }: any) => ({
                            closeSource: event.source
                        }))
                    ]
                },
                SELECT_ITEM: {
                    target: 'closed',
                    actions: [
                        assign(({ event }: any) => ({
                            selectedItem: event.item,
                            closeSource: 'navigation' as NavigationSource
                        })),
                        ({ context, event }: any) => {
                            devConfig.log('Navigation item selected:', {
                                item: event.item,
                                openDuration: context.lastOpenedAt ? Date.now() - context.lastOpenedAt : 0,
                                totalInteractions: context.interactionCount
                            });
                        }
                    ]
                },
                UPDATE_SCROLL: {
                    actions: [
                        assign(({ event }: any) => ({
                            scrollPosition: event.position
                        }))
                    ]
                }
            }
        }
    }
});

// Export machine type for actor creation
export type MobileNavMachine = typeof mobileNavMachine;

// Serializable machine configuration (without implementations) 
export const serializableMachineConfig = {
    id: 'mobileNavigation',
    initial: 'closed',
    context: initialContext,
    states: {
        closed: {
            entry: ['setClosed', 'setCloseSource', 'trackClose'],
            on: {
                OPEN: { target: 'open', actions: ['setOpenSource'] },
                TOGGLE: { target: 'open', actions: ['setOpenSource'] }
            }
        },
        open: {
            entry: ['setOpen', 'incrementInteractions', 'trackOpen'],
            on: {
                CLOSE: { target: 'closed', actions: ['setCloseSource'] },
                TOGGLE: { target: 'closed', actions: ['setCloseSource'] },
                SELECT_ITEM: { target: 'closed', actions: ['selectItem', 'trackNavigation'] },
                UPDATE_SCROLL: { actions: ['updateScrollPosition'] }
            }
        }
    }
} as const; 
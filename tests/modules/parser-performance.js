import { extractHighlightedContent, createTestContainer, validateHighlighting, waitForHighlighting } from './test-helper.js';

export class PerformanceParser {
    constructor() {
        this.testCases = [
            {
                name: 'Small Code Block',
                size: 'small',
                code: `
const greeting = 'Hello World';
function sayHello(name) {
    return \`\${greeting}, \${name}!\`;
}
console.log(sayHello('Claude'));
                `.trim()
            },
            {
                name: 'Medium Code Block',
                size: 'medium',
                code: this.generateMediumCodeBlock()
            },
            {
                name: 'Large Code Block',
                size: 'large', 
                code: this.generateLargeCodeBlock()
            },
            {
                name: 'Complex XState Machine',
                size: 'complex',
                code: this.generateComplexXStateMachine()
            }
        ];
        
        this.benchmarkResults = {};
    }

    generateMediumCodeBlock() {
        return `
import { createMachine, assign, spawn } from 'xstate';
import { sendParent } from 'xstate/lib/actions';

const authMachine = createMachine({
    id: 'auth',
    initial: 'idle',
    context: {
        user: null,
        token: null,
        error: null,
        attempts: 0,
        maxAttempts: 3
    },
    states: {
        idle: {
            on: {
                LOGIN: {
                    target: 'authenticating',
                    actions: assign({
                        error: null
                    })
                }
            }
        },
        authenticating: {
            invoke: {
                src: 'authenticate',
                onDone: {
                    target: 'authenticated',
                    actions: [
                        assign({
                            user: (context, event) => event.data.user,
                            token: (context, event) => event.data.token,
                            attempts: 0
                        }),
                        'storeToken',
                        'notifySuccess'
                    ]
                },
                onError: {
                    target: 'failed',
                    actions: [
                        assign({
                            error: (context, event) => event.data,
                            attempts: (context) => context.attempts + 1
                        }),
                        'logError'
                    ]
                }
            }
        },
        authenticated: {
            type: 'compound',
            initial: 'active',
            states: {
                active: {
                    on: {
                        LOGOUT: '#auth.loggingOut',
                        REFRESH_TOKEN: 'refreshing'
                    }
                },
                refreshing: {
                    invoke: {
                        src: 'refreshToken',
                        onDone: {
                            target: 'active',
                            actions: assign({
                                token: (context, event) => event.data.token
                            })
                        },
                        onError: '#auth.failed'
                    }
                }
            }
        },
        failed: {
            always: [
                {
                    target: 'locked',
                    cond: 'maxAttemptsReached'
                },
                {
                    target: 'idle'
                }
            ]
        },
        locked: {
            after: {
                300000: 'idle' // 5 minutes
            },
            on: {
                RESET: {
                    target: 'idle',
                    actions: assign({
                        attempts: 0,
                        error: null
                    })
                }
            }
        },
        loggingOut: {
            invoke: {
                src: 'logout',
                onDone: {
                    target: 'idle',
                    actions: [
                        assign({
                            user: null,
                            token: null,
                            error: null,
                            attempts: 0
                        }),
                        'clearStorage'
                    ]
                }
            }
        }
    }
}, {
    actions: {
        storeToken: (context) => {
            localStorage.setItem('authToken', context.token);
        },
        clearStorage: () => {
            localStorage.removeItem('authToken');
        },
        notifySuccess: () => {
            console.log('Authentication successful');
        },
        logError: (context, event) => {
            console.error('Auth error:', event.data);
        }
    },
    guards: {
        maxAttemptsReached: (context) => {
            return context.attempts >= context.maxAttempts;
        }
    },
    services: {
        authenticate: async (context, event) => {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: event.email,
                    password: event.password
                })
            });
            
            if (!response.ok) {
                throw new Error('Authentication failed');
            }
            
            return response.json();
        },
        refreshToken: async (context) => {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': \`Bearer \${context.token}\`
                }
            });
            
            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            
            return response.json();
        },
        logout: async (context) => {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': \`Bearer \${context.token}\`
                }
            });
        }
    }
});

export default authMachine;
        `.trim();
    }

    generateLargeCodeBlock() {
        return `
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createMachine, assign, spawn, interpret } from 'xstate';
import { useMachine } from '@xstate/react';

// Complex e-commerce cart machine
const cartMachine = createMachine({
    id: 'cart',
    initial: 'idle',
    context: {
        items: [],
        total: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        user: null,
        paymentMethod: null,
        shippingAddress: null,
        billingAddress: null,
        promoCode: null,
        inventory: {},
        loading: false,
        error: null
    },
    states: {
        idle: {
            on: {
                ADD_ITEM: {
                    target: 'updating',
                    actions: 'addItemToCart'
                },
                REMOVE_ITEM: {
                    target: 'updating', 
                    actions: 'removeItemFromCart'
                },
                UPDATE_QUANTITY: {
                    target: 'updating',
                    actions: 'updateItemQuantity'
                },
                APPLY_PROMO: {
                    target: 'validating_promo',
                    actions: assign({
                        promoCode: (context, event) => event.code
                    })
                },
                START_CHECKOUT: {
                    target: 'checkout',
                    cond: 'hasItems'
                }
            }
        },
        updating: {
            invoke: {
                src: 'updateCartTotals',
                onDone: {
                    target: 'idle',
                    actions: assign({
                        total: (context, event) => event.data.total,
                        tax: (context, event) => event.data.tax,
                        shipping: (context, event) => event.data.shipping
                    })
                },
                onError: {
                    target: 'error',
                    actions: assign({
                        error: (context, event) => event.data
                    })
                }
            }
        },
        validating_promo: {
            invoke: {
                src: 'validatePromoCode',
                onDone: {
                    target: 'updating',
                    actions: assign({
                        discount: (context, event) => event.data.discount
                    })
                },
                onError: {
                    target: 'idle',
                    actions: [
                        assign({
                            error: (context, event) => event.data,
                            promoCode: null
                        })
                    ]
                }
            }
        },
        checkout: {
            type: 'compound',
            initial: 'shipping',
            states: {
                shipping: {
                    on: {
                        SET_SHIPPING_ADDRESS: {
                            target: 'payment',
                            actions: assign({
                                shippingAddress: (context, event) => event.address
                            })
                        }
                    }
                },
                payment: {
                    on: {
                        SET_PAYMENT_METHOD: {
                            target: 'review',
                            actions: assign({
                                paymentMethod: (context, event) => event.method
                            })
                        },
                        BACK_TO_SHIPPING: 'shipping'
                    }
                },
                review: {
                    on: {
                        PLACE_ORDER: 'processing',
                        BACK_TO_PAYMENT: 'payment'
                    }
                },
                processing: {
                    invoke: {
                        src: 'processOrder',
                        onDone: {
                            target: 'success',
                            actions: [
                                'clearCart',
                                'storeOrderHistory'
                            ]
                        },
                        onError: {
                            target: 'payment_failed',
                            actions: assign({
                                error: (context, event) => event.data
                            })
                        }
                    }
                },
                payment_failed: {
                    on: {
                        RETRY_PAYMENT: 'processing',
                        CHANGE_PAYMENT: 'payment'
                    }
                },
                success: {
                    type: 'final'
                }
            }
        },
        error: {
            on: {
                RETRY: 'idle',
                CLEAR_ERROR: {
                    target: 'idle',
                    actions: assign({
                        error: null
                    })
                }
            }
        }
    }
}, {
    actions: {
        addItemToCart: assign({
            items: (context, event) => {
                const existingItem = context.items.find(item => item.id === event.item.id);
                if (existingItem) {
                    return context.items.map(item =>
                        item.id === event.item.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                return [...context.items, { ...event.item, quantity: 1 }];
            }
        }),
        removeItemFromCart: assign({
            items: (context, event) => {
                return context.items.filter(item => item.id !== event.itemId);
            }
        }),
        updateItemQuantity: assign({
            items: (context, event) => {
                return context.items.map(item =>
                    item.id === event.itemId
                        ? { ...item, quantity: event.quantity }
                        : item
                );
            }
        }),
        clearCart: assign({
            items: [],
            total: 0,
            discount: 0,
            shipping: 0,
            tax: 0,
            promoCode: null
        }),
        storeOrderHistory: (context, event) => {
            const order = {
                id: event.data.orderId,
                items: context.items,
                total: context.total,
                timestamp: new Date().toISOString()
            };
            
            const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
            history.push(order);
            localStorage.setItem('orderHistory', JSON.stringify(history));
        }
    },
    guards: {
        hasItems: (context) => context.items.length > 0,
        isValidAddress: (context) => {
            return context.shippingAddress && 
                   context.shippingAddress.street &&
                   context.shippingAddress.city &&
                   context.shippingAddress.zipCode;
        },
        isValidPayment: (context) => {
            return context.paymentMethod && context.paymentMethod.type;
        }
    },
    services: {
        updateCartTotals: async (context) => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const subtotal = context.items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);
            
            const discount = context.discount || 0;
            const shipping = subtotal > 50 ? 0 : 5.99;
            const tax = (subtotal - discount) * 0.08;
            const total = subtotal - discount + shipping + tax;
            
            return { total, tax, shipping };
        },
        validatePromoCode: async (context) => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const validCodes = {
                'SAVE10': { discount: 10, type: 'percentage' },
                'FREESHIP': { discount: 5.99, type: 'fixed' },
                'WELCOME': { discount: 15, type: 'percentage' }
            };
            
            const code = validCodes[context.promoCode];
            if (!code) {
                throw new Error('Invalid promo code');
            }
            
            const subtotal = context.items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);
            
            const discount = code.type === 'percentage' 
                ? subtotal * (code.discount / 100)
                : code.discount;
                
            return { discount };
        },
        processOrder: async (context) => {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate random failure
            if (Math.random() < 0.1) {
                throw new Error('Payment processing failed');
            }
            
            return {
                orderId: \`ORD-\${Date.now()}\`,
                status: 'confirmed',
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };
        }
    }
});

// React component using the cart machine
const ShoppingCart = () => {
    const [state, send] = useMachine(cartMachine);
    const [newItem, setNewItem] = useState('');
    
    const { items, total, discount, shipping, tax, error } = state.context;
    
    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [items]);
    
    const handleAddItem = useCallback((item) => {
        send({ type: 'ADD_ITEM', item });
    }, [send]);
    
    const handleRemoveItem = useCallback((itemId) => {
        send({ type: 'REMOVE_ITEM', itemId });
    }, [send]);
    
    const handleUpdateQuantity = useCallback((itemId, quantity) => {
        send({ type: 'UPDATE_QUANTITY', itemId, quantity });
    }, [send]);
    
    const renderCartItems = () => {
        return items.map(item => (
            <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>\${item.price.toFixed(2)}</p>
                    <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                    />
                    <button onClick={() => handleRemoveItem(item.id)}>
                        Remove
                    </button>
                </div>
            </div>
        ));
    };
    
    const renderCheckoutSteps = () => {
        if (!state.matches('checkout')) return null;
        
        return (
            <div className="checkout-steps">
                {state.matches('checkout.shipping') && (
                    <ShippingForm onSubmit={(address) => 
                        send({ type: 'SET_SHIPPING_ADDRESS', address })
                    } />
                )}
                
                {state.matches('checkout.payment') && (
                    <PaymentForm onSubmit={(method) => 
                        send({ type: 'SET_PAYMENT_METHOD', method })
                    } />
                )}
                
                {state.matches('checkout.review') && (
                    <OrderReview 
                        items={items}
                        total={total}
                        onConfirm={() => send({ type: 'PLACE_ORDER' })}
                    />
                )}
                
                {state.matches('checkout.processing') && (
                    <div className="processing">
                        <h3>Processing your order...</h3>
                        <div className="spinner" />
                    </div>
                )}
                
                {state.matches('checkout.success') && (
                    <div className="success">
                        <h3>Order placed successfully!</h3>
                        <p>Thank you for your purchase.</p>
                    </div>
                )}
            </div>
        );
    };
    
    return (
        <div className="shopping-cart">
            <h1>Shopping Cart</h1>
            
            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => send({ type: 'CLEAR_ERROR' })}>
                        Dismiss
                    </button>
                </div>
            )}
            
            <div className="cart-contents">
                {items.length === 0 ? (
                    <p>Your cart is empty</p>
                ) : (
                    <>
                        <div className="cart-items">
                            {renderCartItems()}
                        </div>
                        
                        <div className="cart-summary">
                            <div className="summary-line">
                                <span>Subtotal:</span>
                                <span>\${subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="summary-line discount">
                                    <span>Discount:</span>
                                    <span>-\${discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="summary-line">
                                <span>Shipping:</span>
                                <span>\${shipping.toFixed(2)}</span>
                            </div>
                            <div className="summary-line">
                                <span>Tax:</span>
                                <span>\${tax.toFixed(2)}</span>
                            </div>
                            <div className="summary-line total">
                                <span>Total:</span>
                                <span>\${total.toFixed(2)}</span>
                            </div>
                            
                            <button 
                                className="checkout-button"
                                onClick={() => send({ type: 'START_CHECKOUT' })}
                                disabled={items.length === 0}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
            
            {renderCheckoutSteps()}
        </div>
    );
};

export default ShoppingCart;
        `.trim();
    }

    generateComplexXStateMachine() {
        return `
import { createMachine, assign, spawn, interpret } from 'xstate';
import { sendParent, pure, choose } from 'xstate/lib/actions';

// Complex multi-level state machine for a smart home system
const deviceMachine = createMachine({
    id: 'device',
    initial: 'offline',
    context: {
        id: null,
        type: null,
        status: 'offline',
        battery: 100,
        lastSeen: null,
        settings: {},
        capabilities: [],
        errorCount: 0
    },
    states: {
        offline: {
            on: {
                CONNECT: {
                    target: 'connecting',
                    actions: assign({
                        lastSeen: () => new Date().toISOString()
                    })
                }
            }
        },
        connecting: {
            invoke: {
                src: 'establishConnection',
                onDone: {
                    target: 'online',
                    actions: assign({
                        status: 'online',
                        errorCount: 0
                    })
                },
                onError: {
                    target: 'offline',
                    actions: assign({
                        errorCount: (context) => context.errorCount + 1
                    })
                }
            }
        },
        online: {
            type: 'compound',
            initial: 'idle',
            invoke: {
                src: 'heartbeat',
                onError: 'offline'
            },
            states: {
                idle: {
                    on: {
                        COMMAND: 'executing',
                        UPDATE_SETTINGS: {
                            actions: assign({
                                settings: (context, event) => ({
                                    ...context.settings,
                                    ...event.settings
                                })
                            })
                        },
                        LOW_BATTERY: {
                            target: 'low_power',
                            cond: 'batteryLow'
                        }
                    }
                },
                executing: {
                    invoke: {
                        src: 'executeCommand',
                        onDone: 'idle',
                        onError: {
                            target: 'error',
                            actions: assign({
                                errorCount: (context) => context.errorCount + 1
                            })
                        }
                    }
                },
                error: {
                    after: {
                        5000: 'idle'
                    },
                    on: {
                        RESET: 'idle'
                    }
                },
                low_power: {
                    on: {
                        CHARGE_COMPLETE: 'idle',
                        CRITICAL_BATTERY: 'offline'
                    }
                }
            }
        }
    }
}, {
    guards: {
        batteryLow: (context) => context.battery < 20
    },
    services: {
        establishConnection: async (context) => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { connected: true };
        },
        heartbeat: () => (callback) => {
            const interval = setInterval(() => {
                callback({ type: 'HEARTBEAT' });
            }, 30000);
            
            return () => clearInterval(interval);
        },
        executeCommand: async (context, event) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { result: 'success' };
        }
    }
});

const roomMachine = createMachine({
    id: 'room',
    initial: 'empty',
    context: {
        name: '',
        devices: [],
        temperature: 22,
        humidity: 45,
        lighting: 50,
        occupancy: false,
        automations: []
    },
    states: {
        empty: {
            on: {
                PERSON_ENTERS: {
                    target: 'occupied',
                    actions: [
                        assign({ occupancy: true }),
                        'triggerWelcomeAutomation'
                    ]
                },
                ADD_DEVICE: {
                    actions: assign({
                        devices: (context, event) => [
                            ...context.devices,
                            spawn(deviceMachine.withContext({
                                ...event.device,
                                id: event.device.id
                            }))
                        ]
                    })
                }
            }
        },
        occupied: {
            type: 'compound',
            initial: 'normal',
            states: {
                normal: {
                    on: {
                        ADJUST_TEMPERATURE: {
                            actions: assign({
                                temperature: (context, event) => event.temperature
                            })
                        },
                        ADJUST_LIGHTING: {
                            actions: assign({
                                lighting: (context, event) => event.level
                            })
                        },
                        MOTION_DETECTED: {
                            actions: 'updateLastMotion'
                        },
                        NO_MOTION: {
                            target: 'idle',
                            after: {
                                300000: '#room.empty' // 5 minutes
                            }
                        }
                    }
                },
                idle: {
                    after: {
                        300000: '#room.empty'
                    },
                    on: {
                        MOTION_DETECTED: 'normal'
                    }
                }
            },
            on: {
                PERSON_LEAVES: {
                    target: 'empty',
                    actions: [
                        assign({ occupancy: false }),
                        'triggerGoodbyeAutomation'
                    ]
                }
            }
        }
    }
}, {
    actions: {
        triggerWelcomeAutomation: (context) => {
            // Turn on lights, adjust temperature, etc.
            console.log(\`Welcome to \${context.name}\`);
        },
        triggerGoodbyeAutomation: (context) => {
            // Turn off devices, save energy, etc.
            console.log(\`Goodbye from \${context.name}\`);
        },
        updateLastMotion: assign({
            lastMotion: () => new Date().toISOString()
        })
    }
});

const homeMachine = createMachine({
    id: 'smartHome',
    initial: 'initializing',
    context: {
        rooms: [],
        users: [],
        scenes: [],
        schedules: [],
        securityMode: 'disarmed',
        alerts: [],
        systemHealth: 'good'
    },
    states: {
        initializing: {
            invoke: {
                src: 'loadConfiguration',
                onDone: {
                    target: 'ready',
                    actions: assign({
                        rooms: (context, event) => event.data.rooms.map(room =>
                            spawn(roomMachine.withContext(room))
                        ),
                        users: (context, event) => event.data.users,
                        scenes: (context, event) => event.data.scenes
                    })
                },
                onError: 'error'
            }
        },
        ready: {
            type: 'parallel',
            states: {
                operation: {
                    initial: 'normal',
                    states: {
                        normal: {
                            on: {
                                EMERGENCY: 'emergency',
                                MAINTENANCE_MODE: 'maintenance'
                            }
                        },
                        emergency: {
                            entry: 'activateEmergencyProtocol',
                            on: {
                                EMERGENCY_RESOLVED: 'normal'
                            }
                        },
                        maintenance: {
                            on: {
                                EXIT_MAINTENANCE: 'normal'
                            }
                        }
                    }
                },
                security: {
                    initial: 'disarmed',
                    states: {
                        disarmed: {
                            on: {
                                ARM_HOME: 'armed_home',
                                ARM_AWAY: 'armed_away'
                            }
                        },
                        armed_home: {
                            on: {
                                DISARM: 'disarmed',
                                ARM_AWAY: 'armed_away',
                                INTRUSION: 'alarming'
                            }
                        },
                        armed_away: {
                            on: {
                                DISARM: 'disarmed',
                                INTRUSION: 'alarming'
                            }
                        },
                        alarming: {
                            entry: 'triggerAlarm',
                            on: {
                                DISARM: 'disarmed'
                            },
                            after: {
                                600000: 'armed_away' // Auto-reset after 10 minutes
                            }
                        }
                    }
                },
                automation: {
                    initial: 'enabled',
                    states: {
                        enabled: {
                            invoke: {
                                src: 'automationEngine'
                            },
                            on: {
                                DISABLE_AUTOMATION: 'disabled'
                            }
                        },
                        disabled: {
                            on: {
                                ENABLE_AUTOMATION: 'enabled'
                            }
                        }
                    }
                }
            }
        },
        error: {
            on: {
                RETRY: 'initializing',
                FACTORY_RESET: {
                    target: 'initializing',
                    actions: 'clearAllData'
                }
            }
        }
    }
}, {
    actions: {
        activateEmergencyProtocol: (context) => {
            // Turn on all lights, unlock doors, call emergency services
            console.log('Emergency protocol activated');
        },
        triggerAlarm: (context) => {
            // Sound alarms, notify security company, send alerts
            console.log('Security alarm triggered');
        },
        clearAllData: assign({
            rooms: [],
            users: [],
            scenes: [],
            schedules: [],
            alerts: []
        })
    },
    services: {
        loadConfiguration: async () => {
            // Load saved configuration from storage
            await new Promise(resolve => setTimeout(resolve, 3000));
            return {
                rooms: [
                    { name: 'Living Room', devices: [], temperature: 22 },
                    { name: 'Kitchen', devices: [], temperature: 20 },
                    { name: 'Bedroom', devices: [], temperature: 18 }
                ],
                users: [
                    { id: 1, name: 'John', permissions: ['admin'] },
                    { id: 2, name: 'Jane', permissions: ['user'] }
                ],
                scenes: [
                    { name: 'Movie Night', settings: { lighting: 10, temperature: 23 } },
                    { name: 'Good Morning', settings: { lighting: 80, temperature: 22 } }
                ]
            };
        },
        automationEngine: () => (callback, onReceive) => {
            // Automation logic runs continuously
            const interval = setInterval(() => {
                const currentHour = new Date().getHours();
                
                if (currentHour === 7) {
                    callback({ type: 'TRIGGER_SCENE', scene: 'Good Morning' });
                } else if (currentHour === 22) {
                    callback({ type: 'TRIGGER_SCENE', scene: 'Good Night' });
                }
            }, 60000); // Check every minute
            
            onReceive((event) => {
                if (event.type === 'SCHEDULE_AUTOMATION') {
                    // Handle scheduled automations
                    console.log('Scheduling automation:', event.automation);
                }
            });
            
            return () => clearInterval(interval);
        }
    }
});

export { deviceMachine, roomMachine, homeMachine };
        `.trim();
    }

    async runTests() {
        const results = [];
        const performanceData = {
            times: [],
            avgTime: 0,
            minTime: Infinity,
            maxTime: 0,
            totalTests: 0
        };
        
        for (const testCase of this.testCases) {
            const testResult = await this.runSingleTest(testCase);
            results.push(testResult);
            
            // Collect performance data
            if (testResult.performance) {
                performanceData.times.push(...testResult.performance.times);
                performanceData.totalTests += testResult.performance.iterations;
            }
        }

        // Calculate overall performance metrics
        if (performanceData.times.length > 0) {
            performanceData.avgTime = (performanceData.times.reduce((a, b) => a + b, 0) / performanceData.times.length).toFixed(2);
            performanceData.minTime = Math.min(...performanceData.times).toFixed(2);
            performanceData.maxTime = Math.max(...performanceData.times).toFixed(2);
        }

        const allPassed = results.every(result => result.passed);
        
        return {
            status: allPassed ? 'pass' : 'fail',
            tests: results,
            performance: performanceData,
            summary: {
                total: results.length,
                passed: results.filter(r => r.passed).length,
                failed: results.filter(r => !r.passed).length
            }
        };
    }

    async runSingleTest(testCase) {
        try {
            const benchmarks = await this.benchmarkAllHighlighters(testCase.code, testCase.size);
            
            const validations = [
                this.validatePerformance(benchmarks, testCase.size),
                this.validateMemoryUsage(benchmarks),
                this.validateOutputConsistency(benchmarks)
            ];

            const passed = validations.every(v => v.passed);
            
            return {
                name: testCase.name,
                passed,
                output: this.generatePerformanceHTML(benchmarks),
                performance: benchmarks.summary,
                validations: validations.filter(v => !v.passed)
            };
        } catch (error) {
            return {
                name: testCase.name,
                passed: false,
                error: error.message
            };
        }
    }

    async benchmarkAllHighlighters(code, size) {
        const results = {
            original: await this.benchmarkHighlighter('original', code),
            v2: await this.benchmarkHighlighter('v2', code),
            simple: await this.benchmarkHighlighter('simple', code)
        };

        // Calculate summary statistics
        const allTimes = Object.values(results).flatMap(r => r.times);
        const summary = {
            times: allTimes,
            avgTime: (allTimes.reduce((a, b) => a + b, 0) / allTimes.length).toFixed(2),
            minTime: Math.min(...allTimes).toFixed(2),
            maxTime: Math.max(...allTimes).toFixed(2),
            iterations: Object.values(results)[0].iterations,
            codeSize: code.length
        };

        return { ...results, summary };
    }

    async benchmarkHighlighter(type, code) {
        const iterations = this.getIterationsForSize(code.length);
        const times = [];
        let memoryBefore, memoryAfter;

        for (let i = 0; i < iterations; i++) {
            // Measure memory before
            if (performance.memory) {
                memoryBefore = performance.memory.usedJSHeapSize;
            }

            const startTime = performance.now();
            
            try {
                await this.runHighlighter(type, code);
            } catch (error) {
                console.error(`Error in ${type} highlighter:`, error);
                times.push(Infinity); // Mark as failed
                continue;
            }
            
            const endTime = performance.now();
            times.push(endTime - startTime);

            // Measure memory after
            if (performance.memory) {
                memoryAfter = performance.memory.usedJSHeapSize;
            }

            // Force garbage collection if available (for more accurate memory measurements)
            if (window.gc) {
                window.gc();
            }
        }

        return {
            type,
            times,
            avgTime: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
            minTime: Math.min(...times).toFixed(2),
            maxTime: Math.max(...times).toFixed(2),
            iterations,
            memoryDelta: memoryAfter && memoryBefore ? memoryAfter - memoryBefore : null
        };
    }

    async runHighlighter(type, code) {
        // Wait for highlighters to be loaded
        if (window.highlightersLoaded) {
            await window.highlightersLoaded;
        }
        
        let element;
        
        switch (type) {
            case 'original':
                element = document.createElement('syntax-highlighter');
                break;
            case 'v2':
                element = document.createElement('syntax-highlighter-v2');
                break;
            case 'simple':
                element = document.createElement('code-highlight');
                break;
            default:
                throw new Error(`Unknown highlighter type: ${type}`);
        }

        element.textContent = code;
        document.body.appendChild(element);
        
        // Wait for highlighting to complete
        await new Promise(resolve => setTimeout(resolve, 10));
        
        document.body.removeChild(element);
        return element.innerHTML;
    }

    getIterationsForSize(codeLength) {
        if (codeLength < 1000) return 10;       // Small code
        if (codeLength < 5000) return 5;        // Medium code
        if (codeLength < 20000) return 3;       // Large code
        return 1;                               // Very large code
    }

    validatePerformance(benchmarks, size) {
        const checks = [];
        const performanceThresholds = {
            small: 50,   // 50ms max for small code
            medium: 200, // 200ms max for medium code
            large: 1000, // 1s max for large code
            complex: 2000 // 2s max for complex code
        };

        const threshold = performanceThresholds[size] || 1000;

        Object.entries(benchmarks).forEach(([type, result]) => {
            if (type === 'summary') return;
            
            if (result.avgTime > threshold) {
                checks.push({
                    type,
                    avgTime: result.avgTime,
                    threshold,
                    issue: `Average time (${result.avgTime}ms) exceeds threshold (${threshold}ms)`
                });
            }

            // Check for outliers (times much slower than average)
            const avgTime = parseFloat(result.avgTime);
            const outliers = result.times.filter(time => time > avgTime * 3);
            if (outliers.length > 0) {
                checks.push({
                    type,
                    outliers: outliers.length,
                    issue: `${outliers.length} performance outliers detected`
                });
            }
        });

        return {
            name: 'Performance Validation',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateMemoryUsage(benchmarks) {
        const checks = [];
        const memoryThreshold = 1024 * 1024; // 1MB

        Object.entries(benchmarks).forEach(([type, result]) => {
            if (type === 'summary' || !result.memoryDelta) return;
            
            if (result.memoryDelta > memoryThreshold) {
                checks.push({
                    type,
                    memoryDelta: result.memoryDelta,
                    threshold: memoryThreshold,
                    issue: `Memory usage (${(result.memoryDelta / 1024 / 1024).toFixed(2)}MB) exceeds threshold`
                });
            }
        });

        return {
            name: 'Memory Usage Validation',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateOutputConsistency(benchmarks) {
        const checks = [];
        
        // All highlighters should produce some output
        Object.entries(benchmarks).forEach(([type, result]) => {
            if (type === 'summary') return;
            
            if (result.times.includes(Infinity)) {
                checks.push({
                    type,
                    issue: 'Highlighter failed to produce output'
                });
            }
        });

        return {
            name: 'Output Consistency',
            passed: checks.length === 0,
            issues: checks
        };
    }

    generatePerformanceHTML(benchmarks) {
        const chartData = Object.entries(benchmarks)
            .filter(([type]) => type !== 'summary')
            .map(([type, result]) => ({
                type,
                avgTime: parseFloat(result.avgTime),
                minTime: parseFloat(result.minTime),
                maxTime: parseFloat(result.maxTime)
            }));

        // For performance, show the benchmark data in each column
        return `
            <div class="highlighter-output">
                <div style="padding: 15px; text-align: center;">
                    <h5 style="margin: 0 0 10px 0; color: #0ea5e9;">ORIGINAL</h5>
                    <div style="font-size: 28px; font-weight: 600; color: #4ade80; margin-bottom: 5px;">
                        ${chartData.find(d => d.type === 'original')?.avgTime || 'N/A'}ms
                    </div>
                    <div style="font-size: 12px; color: #888;">
                        ${chartData.find(d => d.type === 'original')?.minTime || 'N/A'}ms - ${chartData.find(d => d.type === 'original')?.maxTime || 'N/A'}ms
                    </div>
                </div>
            </div>
            <div class="highlighter-output">
                <div style="padding: 15px; text-align: center;">
                    <h5 style="margin: 0 0 10px 0; color: #0ea5e9;">V2</h5>
                    <div style="font-size: 28px; font-weight: 600; color: #4ade80; margin-bottom: 5px;">
                        ${chartData.find(d => d.type === 'v2')?.avgTime || 'N/A'}ms
                    </div>
                    <div style="font-size: 12px; color: #888;">
                        ${chartData.find(d => d.type === 'v2')?.minTime || 'N/A'}ms - ${chartData.find(d => d.type === 'v2')?.maxTime || 'N/A'}ms
                    </div>
                </div>
            </div>
            <div class="highlighter-output">
                <div style="padding: 15px; text-align: center;">
                    <h5 style="margin: 0 0 10px 0; color: #0ea5e9;">SIMPLE</h5>
                    <div style="font-size: 28px; font-weight: 600; color: #4ade80; margin-bottom: 5px;">
                        ${chartData.find(d => d.type === 'simple')?.avgTime || 'N/A'}ms
                    </div>
                    <div style="font-size: 12px; color: #888;">
                        ${chartData.find(d => d.type === 'simple')?.minTime || 'N/A'}ms - ${chartData.find(d => d.type === 'simple')?.maxTime || 'N/A'}ms
                    </div>
                </div>
            </div>
        `;
    }
}
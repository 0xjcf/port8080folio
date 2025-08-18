export interface TelemetryEvent {
    event: 'format_request' | 'actor_error' | 'latency_bucket' | 'feature_used' | 'extension_activated' | 'configuration_changed';
    properties: {
        latency_ms?: number;
        file_size_kb?: number;
        template_count?: number;
        formatter_used?: 'biome' | 'prettier' | 'fallback';
        error_code?: string;
        feature_name?: string;
        extension_version?: string;
        vscode_version?: string;
        platform?: string;
        config_changes?: string[];
    };
    user_id?: string;
    session_id: string;
    timestamp: number;
}
export interface TelemetryContext {
    enabled: boolean;
    sessionId: string;
    userId: string;
    buffer: TelemetryEvent[];
    maxBufferSize: number;
    lastFlush: number;
    flushInterval: number;
    stats: {
        totalEvents: number;
        formatRequests: number;
        errors: number;
        lastActivity: Date | null;
    };
    config: {
        enableAnalytics: boolean;
        flushIntervalMs: number;
        maxBufferSize: number;
        endpoint?: string;
    };
}
export type TelemetryActorEvent = {
    type: 'INITIALIZE';
    sessionId: string;
    userId: string;
} | {
    type: 'TRACK_EVENT';
    event: TelemetryEvent;
} | {
    type: 'TRACK_FORMAT_REQUEST';
    properties: {
        latency_ms: number;
        file_size_kb: number;
        template_count: number;
        formatter_used: 'biome' | 'prettier' | 'fallback';
    };
} | {
    type: 'TRACK_ERROR';
    properties: {
        error_code: string;
        component: string;
        recoverable: boolean;
    };
} | {
    type: 'TRACK_FEATURE_USAGE';
    featureName: string;
} | {
    type: 'CONFIGURE';
    config: Partial<TelemetryContext['config']>;
} | {
    type: 'FLUSH_BUFFER';
} | {
    type: 'CLEAR_BUFFER';
} | {
    type: 'DISABLE';
} | {
    type: 'ENABLE';
};
export declare const telemetryMachine: import("xstate").StateMachine<TelemetryContext, {
    type: "INITIALIZE";
    sessionId: string;
    userId: string;
} | {
    type: "TRACK_EVENT";
    event: TelemetryEvent;
} | {
    type: "TRACK_FORMAT_REQUEST";
    properties: {
        latency_ms: number;
        file_size_kb: number;
        template_count: number;
        formatter_used: "biome" | "prettier" | "fallback";
    };
} | {
    type: "TRACK_ERROR";
    properties: {
        error_code: string;
        component: string;
        recoverable: boolean;
    };
} | {
    type: "TRACK_FEATURE_USAGE";
    featureName: string;
} | {
    type: "CONFIGURE";
    config: Partial<TelemetryContext["config"]>;
} | {
    type: "FLUSH_BUFFER";
} | {
    type: "CLEAR_BUFFER";
} | {
    type: "DISABLE";
} | {
    type: "ENABLE";
}, {}, never, import("xstate").Values<{
    initialize: {
        type: "initialize";
        params: import("xstate").NonReducibleUnknown;
    };
    loadConfiguration: {
        type: "loadConfiguration";
        params: import("xstate").NonReducibleUnknown;
    };
    clearBuffer: {
        type: "clearBuffer";
        params: import("xstate").NonReducibleUnknown;
    };
    trackEvent: {
        type: "trackEvent";
        params: import("xstate").NonReducibleUnknown;
    };
    trackFormatRequest: {
        type: "trackFormatRequest";
        params: import("xstate").NonReducibleUnknown;
    };
    trackError: {
        type: "trackError";
        params: import("xstate").NonReducibleUnknown;
    };
    trackFeatureUsage: {
        type: "trackFeatureUsage";
        params: import("xstate").NonReducibleUnknown;
    };
    flushBuffer: {
        type: "flushBuffer";
        params: unknown;
    };
    updateConfig: {
        type: "updateConfig";
        params: import("xstate").NonReducibleUnknown;
    };
    enable: {
        type: "enable";
        params: import("xstate").NonReducibleUnknown;
    };
    disable: {
        type: "disable";
        params: import("xstate").NonReducibleUnknown;
    };
}>, import("xstate").Values<{
    shouldFlush: {
        type: "shouldFlush";
        params: unknown;
    };
    isEnabled: {
        type: "isEnabled";
        params: unknown;
    };
}>, never, "active" | "uninitialized" | "loading", string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "telemetry";
    readonly initial: "uninitialized";
    readonly context: {
        readonly enabled: false;
        readonly sessionId: "";
        readonly userId: "";
        readonly buffer: [];
        readonly maxBufferSize: 100;
        readonly lastFlush: number;
        readonly flushInterval: 60000;
        readonly stats: {
            readonly totalEvents: 0;
            readonly formatRequests: 0;
            readonly errors: 0;
            readonly lastActivity: null;
        };
        readonly config: {
            readonly enableAnalytics: false;
            readonly flushIntervalMs: 60000;
            readonly maxBufferSize: 100;
        };
    };
    readonly states: {
        readonly uninitialized: {
            readonly on: {
                readonly INITIALIZE: {
                    readonly target: "loading";
                    readonly actions: "initialize";
                };
            };
        };
        readonly loading: {
            readonly entry: "loadConfiguration";
            readonly always: {
                readonly target: "active";
            };
        };
        readonly active: {
            readonly on: {
                readonly TRACK_EVENT: {
                    readonly actions: "trackEvent";
                };
                readonly TRACK_FORMAT_REQUEST: {
                    readonly actions: "trackFormatRequest";
                };
                readonly TRACK_ERROR: {
                    readonly actions: "trackError";
                };
                readonly TRACK_FEATURE_USAGE: {
                    readonly actions: "trackFeatureUsage";
                };
                readonly CONFIGURE: {
                    readonly actions: "updateConfig";
                };
                readonly FLUSH_BUFFER: readonly [{
                    readonly guard: "isEnabled";
                    readonly actions: readonly ["flushBuffer", "clearBuffer"];
                }];
                readonly CLEAR_BUFFER: {
                    readonly actions: "clearBuffer";
                };
                readonly ENABLE: {
                    readonly actions: "enable";
                };
                readonly DISABLE: {
                    readonly actions: "disable";
                };
            };
            readonly after: {
                readonly 60000: readonly [{
                    readonly guard: "shouldFlush";
                    readonly actions: readonly ["flushBuffer", "clearBuffer"];
                }];
            };
        };
    };
}>;
export declare function createFormatRequestEvent(latency_ms: number, file_size_kb: number, template_count: number, formatter_used: 'biome' | 'prettier' | 'fallback'): TelemetryActorEvent;
export declare function createErrorEvent(error_code: string, component: string, recoverable: boolean): TelemetryActorEvent;
export declare function createFeatureUsageEvent(featureName: string): TelemetryActorEvent;
//# sourceMappingURL=telemetryActor.d.ts.map
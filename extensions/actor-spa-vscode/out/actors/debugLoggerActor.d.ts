import * as vscode from 'vscode';
export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
    TRACE = 4
}
export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    component: string;
    message: string;
    data?: unknown;
    error?: Error;
    correlationId?: string;
}
export interface DebugLoggerContext {
    outputChannel: vscode.OutputChannel | null;
    logLevel: LogLevel;
    enabledComponents: Set<string>;
    logBuffer: LogEntry[];
    maxBufferSize: number;
    configuration: {
        logLevel: string;
        enabledComponents: string[];
    };
    telemetryEnabled: boolean;
    stats: {
        totalLogs: number;
        errorCount: number;
        warningCount: number;
        lastActivity: Date | null;
    };
}
export type DebugLoggerEvent = {
    type: 'INITIALIZE';
    outputChannel: vscode.OutputChannel;
} | {
    type: 'LOG';
    level: LogLevel;
    component: string;
    message: string;
    data?: unknown;
    error?: Error;
    correlationId?: string;
} | {
    type: 'CONFIGURE';
    configuration: {
        logLevel: string;
        enabledComponents: string[];
        telemetryEnabled?: boolean;
    };
} | {
    type: 'CLEAR_BUFFER';
} | {
    type: 'EXPORT_LOGS';
} | {
    type: 'SEND_TELEMETRY';
    event: TelemetryEvent;
} | {
    type: 'SHOW_CHANNEL';
} | {
    type: 'RESET';
};
export interface TelemetryEvent {
    event: 'format_request' | 'actor_error' | 'latency_bucket' | 'feature_used';
    properties: {
        latency_ms?: number;
        file_size_kb?: number;
        template_count?: number;
        formatter_used?: 'biome' | 'prettier' | 'fallback';
        error_code?: string;
        feature_name?: string;
    };
    user_id?: string;
    session_id?: string;
    timestamp: number;
}
export declare const COMPONENTS: {
    readonly EXTENSION: "Extension";
    readonly ACTOR_FORMATTER: "ActorFormatter";
    readonly COORDINATOR: "Coordinator";
    readonly DISCOVERY: "Discovery";
    readonly FORMATTING: "Formatting";
    readonly PARSER: "Parser";
    readonly VALIDATOR: "Validator";
    readonly DEBUG_LOGGER: "DebugLogger";
    readonly TELEMETRY: "Telemetry";
};
export declare const debugLoggerMachine: import("xstate").StateMachine<DebugLoggerContext, {
    type: "INITIALIZE";
    outputChannel: vscode.OutputChannel;
} | {
    type: "LOG";
    level: LogLevel;
    component: string;
    message: string;
    data?: unknown;
    error?: Error;
    correlationId?: string;
} | {
    type: "CONFIGURE";
    configuration: {
        logLevel: string;
        enabledComponents: string[];
        telemetryEnabled?: boolean;
    };
} | {
    type: "CLEAR_BUFFER";
} | {
    type: "EXPORT_LOGS";
} | {
    type: "SEND_TELEMETRY";
    event: TelemetryEvent;
} | {
    type: "SHOW_CHANNEL";
} | {
    type: "RESET";
}, {}, never, import("xstate").Values<{
    resetState: {
        type: "resetState";
        params: import("xstate").NonReducibleUnknown;
    };
    initializeOutputChannel: {
        type: "initializeOutputChannel";
        params: import("xstate").NonReducibleUnknown;
    };
    loadConfiguration: {
        type: "loadConfiguration";
        params: import("xstate").NonReducibleUnknown;
    };
    processLogEntry: {
        type: "processLogEntry";
        params: import("xstate").NonReducibleUnknown;
    };
    outputToChannel: {
        type: "outputToChannel";
        params: unknown;
    };
    clearBuffer: {
        type: "clearBuffer";
        params: import("xstate").NonReducibleUnknown;
    };
    showChannel: {
        type: "showChannel";
        params: unknown;
    };
    sendTelemetry: {
        type: "sendTelemetry";
        params: unknown;
    };
}>, import("xstate").Values<{
    isConfigured: {
        type: "isConfigured";
        params: unknown;
    };
    shouldLog: {
        type: "shouldLog";
        params: unknown;
    };
}>, never, "active" | "uninitialized" | "loading", string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "debugLogger";
    readonly initial: "uninitialized";
    readonly context: {
        readonly outputChannel: null;
        readonly logLevel: LogLevel.INFO;
        readonly enabledComponents: Set<string>;
        readonly logBuffer: [];
        readonly maxBufferSize: 1000;
        readonly configuration: {
            readonly logLevel: "info";
            readonly enabledComponents: ["*"];
        };
        readonly telemetryEnabled: false;
        readonly stats: {
            readonly totalLogs: 0;
            readonly errorCount: 0;
            readonly warningCount: 0;
            readonly lastActivity: null;
        };
    };
    readonly states: {
        readonly uninitialized: {
            readonly on: {
                readonly INITIALIZE: {
                    readonly target: "loading";
                    readonly actions: "initializeOutputChannel";
                };
            };
        };
        readonly loading: {
            readonly entry: "loadConfiguration";
            readonly always: {
                readonly target: "active";
                readonly guard: "isConfigured";
            };
        };
        readonly active: {
            readonly on: {
                readonly LOG: readonly [{
                    readonly guard: "shouldLog";
                    readonly actions: readonly ["processLogEntry", "outputToChannel"];
                }];
                readonly CONFIGURE: {
                    readonly actions: "loadConfiguration";
                };
                readonly CLEAR_BUFFER: {
                    readonly actions: "clearBuffer";
                };
                readonly SHOW_CHANNEL: {
                    readonly actions: "showChannel";
                };
                readonly SEND_TELEMETRY: {
                    readonly actions: "sendTelemetry";
                };
                readonly RESET: {
                    readonly actions: "resetState";
                };
            };
        };
    };
}>;
export declare function createLogEvent(level: LogLevel, component: string, message: string, data?: unknown, error?: Error, correlationId?: string): DebugLoggerEvent;
export declare function createTelemetryEvent(event: TelemetryEvent['event'], properties: TelemetryEvent['properties']): DebugLoggerEvent;
//# sourceMappingURL=debugLoggerActor.d.ts.map
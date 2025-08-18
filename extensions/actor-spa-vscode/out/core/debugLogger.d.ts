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
}
export declare class DebugLogger {
    private static instance;
    private outputChannel;
    private logLevel;
    private enabledComponents;
    private logBuffer;
    private maxBufferSize;
    private constructor();
    static getInstance(outputChannel?: vscode.OutputChannel): DebugLogger;
    private loadConfiguration;
    private stringToLogLevel;
    private shouldLog;
    private log;
    private outputToChannel;
    error(component: string, message: string, data?: unknown, error?: Error): void;
    warn(component: string, message: string, data?: unknown): void;
    info(component: string, message: string, data?: unknown): void;
    debug(component: string, message: string, data?: unknown): void;
    trace(component: string, message: string, data?: unknown): void;
    show(): void;
    clear(): void;
    getLogBuffer(): LogEntry[];
    exportLogs(): string;
    safeExecute<T>(component: string, operation: string, fn: () => Promise<T>, fallback?: T): Promise<T | undefined>;
    safeExecuteSync<T>(component: string, operation: string, fn: () => T, fallback?: T): T | undefined;
}
export declare function createDebugLogger(outputChannel: vscode.OutputChannel): DebugLogger;
export declare const COMPONENTS: {
    readonly EXTENSION: "Extension";
    readonly ACTOR_FORMATTER: "ActorFormatter";
    readonly COORDINATOR: "Coordinator";
    readonly DISCOVERY: "Discovery";
    readonly FORMATTING: "Formatting";
    readonly PARSER: "Parser";
    readonly VALIDATOR: "Validator";
};
//# sourceMappingURL=debugLogger.d.ts.map
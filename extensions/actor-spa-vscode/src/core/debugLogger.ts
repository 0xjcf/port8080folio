import * as vscode from 'vscode';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  component: string;
  message: string;
  data?: unknown;
  error?: Error;
}

export class DebugLogger {
  private static instance: DebugLogger;
  private outputChannel: vscode.OutputChannel;
  private logLevel: LogLevel = LogLevel.INFO;
  private enabledComponents: Set<string> = new Set();
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000;

  private constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
    this.loadConfiguration();

    // Watch for configuration changes
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('actor-spa.debug')) {
        this.loadConfiguration();
      }
    });
  }

  public static getInstance(outputChannel?: vscode.OutputChannel): DebugLogger {
    if (!DebugLogger.instance) {
      if (!outputChannel) {
        throw new Error('DebugLogger must be initialized with an output channel');
      }
      DebugLogger.instance = new DebugLogger(outputChannel);
    }
    return DebugLogger.instance;
  }

  private loadConfiguration(): void {
    const config = vscode.workspace.getConfiguration('actor-spa.debug');

    // Set log level
    const levelString = config.get<string>('logLevel', 'info').toLowerCase();
    this.logLevel = this.stringToLogLevel(levelString);

    // Set enabled components
    const enabledComponents = config.get<string[]>('enabledComponents', ['*']);
    this.enabledComponents = new Set(enabledComponents);

    // If '*' is in enabled components, enable all
    if (this.enabledComponents.has('*')) {
      this.enabledComponents.clear();
      this.enabledComponents.add('*');
    }

    this.log(
      LogLevel.INFO,
      'DebugLogger',
      `Configuration loaded: level=${LogLevel[this.logLevel]}, components=${Array.from(this.enabledComponents).join(', ')}`
    );
  }

  private stringToLogLevel(level: string): LogLevel {
    switch (level) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'info':
        return LogLevel.INFO;
      case 'debug':
        return LogLevel.DEBUG;
      case 'trace':
        return LogLevel.TRACE;
      default:
        return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel, component: string): boolean {
    if (level > this.logLevel) {
      return false;
    }

    if (this.enabledComponents.has('*')) {
      return true;
    }

    return this.enabledComponents.has(component);
  }

  private log(
    level: LogLevel,
    component: string,
    message: string,
    data?: unknown,
    error?: Error
  ): void {
    if (!this.shouldLog(level, component)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      component,
      message,
      data,
      error,
    };

    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Format and output
    this.outputToChannel(entry);
  }

  private outputToChannel(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelStr = LogLevel[entry.level].padEnd(5);
    const componentStr = entry.component.padEnd(15);

    let logLine = `[${timestamp}] [${levelStr}] [${componentStr}] ${entry.message}`;

    if (entry.data) {
      logLine += `\n    Data: ${JSON.stringify(entry.data, null, 2)}`;
    }

    if (entry.error) {
      logLine += `\n    Error: ${entry.error.message}`;
      if (entry.error.stack) {
        logLine += `\n    Stack: ${entry.error.stack}`;
      }
    }

    this.outputChannel.appendLine(logLine);
  }

  // Public logging methods
  public error(component: string, message: string, data?: unknown, error?: Error): void {
    this.log(LogLevel.ERROR, component, message, data, error);
    // Also show error message to user for critical errors
    if (error) {
      vscode.window.showErrorMessage(`Actor-SPA ${component}: ${message}`);
    }
  }

  public warn(component: string, message: string, data?: unknown): void {
    this.log(LogLevel.WARN, component, message, data);
  }

  public info(component: string, message: string, data?: unknown): void {
    this.log(LogLevel.INFO, component, message, data);
  }

  public debug(component: string, message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, component, message, data);
  }

  public trace(component: string, message: string, data?: unknown): void {
    this.log(LogLevel.TRACE, component, message, data);
  }

  // Utility methods
  public show(): void {
    this.outputChannel.show();
  }

  public clear(): void {
    this.outputChannel.clear();
    this.logBuffer = [];
  }

  public getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  public exportLogs(): string {
    return this.logBuffer
      .map((entry) => {
        const timestamp = entry.timestamp.toISOString();
        const levelStr = LogLevel[entry.level];
        let line = `[${timestamp}] [${levelStr}] [${entry.component}] ${entry.message}`;

        if (entry.data) {
          line += `\n    Data: ${JSON.stringify(entry.data, null, 2)}`;
        }

        if (entry.error) {
          line += `\n    Error: ${entry.error.message}`;
          if (entry.error.stack) {
            line += `\n    Stack: ${entry.error.stack}`;
          }
        }

        return line;
      })
      .join('\n');
  }

  // Try-catch wrapper for better error handling
  public async safeExecute<T>(
    component: string,
    operation: string,
    fn: () => Promise<T>,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      this.debug(component, `Starting ${operation}`);
      const result = await fn();
      this.debug(component, `Successfully completed ${operation}`);
      return result;
    } catch (error) {
      this.error(
        component,
        `Failed to ${operation}`,
        { operation },
        error instanceof Error ? error : new Error(String(error))
      );
      return fallback;
    }
  }

  public safeExecuteSync<T>(
    component: string,
    operation: string,
    fn: () => T,
    fallback?: T
  ): T | undefined {
    try {
      this.debug(component, `Starting ${operation}`);
      const result = fn();
      this.debug(component, `Successfully completed ${operation}`);
      return result;
    } catch (error) {
      this.error(
        component,
        `Failed to ${operation}`,
        { operation },
        error instanceof Error ? error : new Error(String(error))
      );
      return fallback;
    }
  }
}

// Export convenience function
export function createDebugLogger(outputChannel: vscode.OutputChannel): DebugLogger {
  return DebugLogger.getInstance(outputChannel);
}

// Export component names for consistency
export const COMPONENTS = {
  EXTENSION: 'Extension',
  ACTOR_FORMATTER: 'ActorFormatter',
  COORDINATOR: 'Coordinator',
  DISCOVERY: 'Discovery',
  FORMATTING: 'Formatting',
  PARSER: 'Parser',
  VALIDATOR: 'Validator',
} as const;

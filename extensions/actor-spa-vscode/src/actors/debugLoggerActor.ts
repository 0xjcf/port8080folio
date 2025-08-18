import * as vscode from 'vscode';
import { assign, setup } from 'xstate';

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

export type DebugLoggerEvent =
  | {
      type: 'INITIALIZE';
      outputChannel: vscode.OutputChannel;
    }
  | {
      type: 'LOG';
      level: LogLevel;
      component: string;
      message: string;
      data?: unknown;
      error?: Error;
      correlationId?: string;
    }
  | {
      type: 'CONFIGURE';
      configuration: {
        logLevel: string;
        enabledComponents: string[];
        telemetryEnabled?: boolean;
      };
    }
  | {
      type: 'CLEAR_BUFFER';
    }
  | {
      type: 'EXPORT_LOGS';
    }
  | {
      type: 'SEND_TELEMETRY';
      event: TelemetryEvent;
    }
  | {
      type: 'SHOW_CHANNEL';
    }
  | {
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

// Component names for consistency
export const COMPONENTS = {
  EXTENSION: 'Extension',
  ACTOR_FORMATTER: 'ActorFormatter',
  COORDINATOR: 'Coordinator',
  DISCOVERY: 'Discovery',
  FORMATTING: 'Formatting',
  PARSER: 'Parser',
  VALIDATOR: 'Validator',
  DEBUG_LOGGER: 'DebugLogger',
  TELEMETRY: 'Telemetry',
} as const;

export const debugLoggerMachine = setup({
  types: {
    context: {} as DebugLoggerContext,
    events: {} as DebugLoggerEvent,
  },
  actions: {
    initializeOutputChannel: assign({
      outputChannel: ({ event }) => {
        if (event.type === 'INITIALIZE') {
          return event.outputChannel;
        }
        return null;
      },
    }),

    loadConfiguration: assign({
      configuration: () => {
        const config = vscode.workspace.getConfiguration('actor-spa.debug');
        return {
          logLevel: config.get<string>('logLevel', 'info'),
          enabledComponents: config.get<string[]>('enabledComponents', ['*']),
        };
      },
      logLevel: ({ context }) => {
        const levelString = context.configuration.logLevel.toLowerCase();
        switch (levelString) {
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
      },
      enabledComponents: ({ context }) => {
        const components = new Set(context.configuration.enabledComponents);
        if (components.has('*')) {
          components.clear();
          components.add('*');
        }
        return components;
      },
      telemetryEnabled: () => {
        const config = vscode.workspace.getConfiguration('actor-spa.telemetry');
        return config.get<boolean>('enabled', false);
      },
    }),

    processLogEntry: assign({
      logBuffer: ({ context, event }) => {
        if (event.type !== 'LOG') return context.logBuffer;

        // Check if we should log this
        if (event.level > context.logLevel) return context.logBuffer;
        if (
          !context.enabledComponents.has('*') &&
          !context.enabledComponents.has(event.component)
        ) {
          return context.logBuffer;
        }

        const entry: LogEntry = {
          timestamp: new Date(),
          level: event.level,
          component: event.component,
          message: event.message,
          data: event.data,
          error: event.error,
          correlationId: event.correlationId,
        };

        const newBuffer = [...context.logBuffer, entry];

        // Maintain buffer size
        if (newBuffer.length > context.maxBufferSize) {
          newBuffer.shift();
        }

        return newBuffer;
      },
      stats: ({ context, event }) => {
        if (event.type !== 'LOG') return context.stats;

        return {
          ...context.stats,
          totalLogs: context.stats.totalLogs + 1,
          errorCount: context.stats.errorCount + (event.level === LogLevel.ERROR ? 1 : 0),
          warningCount: context.stats.warningCount + (event.level === LogLevel.WARN ? 1 : 0),
          lastActivity: new Date(),
        };
      },
    }),

    outputToChannel: ({ context, event }) => {
      if (event.type !== 'LOG' || !context.outputChannel) return;

      const entry: LogEntry = {
        timestamp: new Date(),
        level: event.level,
        component: event.component,
        message: event.message,
        data: event.data,
        error: event.error,
        correlationId: event.correlationId,
      };

      // Format output
      const timestamp = entry.timestamp.toISOString();
      const levelStr = LogLevel[entry.level].padEnd(5);
      const componentStr = entry.component.padEnd(15);
      const correlationStr = entry.correlationId ? ` [${entry.correlationId.slice(0, 8)}]` : '';

      let logLine = `[${timestamp}] [${levelStr}] [${componentStr}]${correlationStr} ${entry.message}`;

      if (entry.data) {
        logLine += `\n    Data: ${JSON.stringify(entry.data, null, 2)}`;
      }

      if (entry.error) {
        logLine += `\n    Error: ${entry.error.message}`;
        if (entry.error.stack) {
          logLine += `\n    Stack: ${entry.error.stack}`;
        }
      }

      context.outputChannel.appendLine(logLine);

      // Show error messages to user for critical errors
      if (entry.level === LogLevel.ERROR && entry.error) {
        vscode.window.showErrorMessage(`Actor-SPA ${entry.component}: ${entry.message}`);
      }
    },

    clearBuffer: assign({
      logBuffer: () => [],
    }),

    showChannel: ({ context }) => {
      if (context.outputChannel) {
        context.outputChannel.show();
      }
    },

    sendTelemetry: ({ context, event }) => {
      if (event.type !== 'SEND_TELEMETRY' || !context.telemetryEnabled) return;

      // In a real implementation, this would send to a telemetry service
      // For now, we'll just log it
      const _telemetryEntry: LogEntry = {
        timestamp: new Date(),
        level: LogLevel.DEBUG,
        component: COMPONENTS.TELEMETRY,
        message: `Telemetry event: ${event.event.event}`,
        data: event.event.properties,
      };

      if (context.outputChannel) {
        context.outputChannel.appendLine(`[TELEMETRY] ${JSON.stringify(event, null, 2)}`);
      }
    },

    resetState: assign({
      logBuffer: () => [],
      stats: () => ({
        totalLogs: 0,
        errorCount: 0,
        warningCount: 0,
        lastActivity: null,
      }),
    }),
  },

  guards: {
    isConfigured: ({ context }) => context.outputChannel !== null,
    shouldLog: ({ context, event }) => {
      if (event.type !== 'LOG') return false;
      if (event.level > context.logLevel) return false;
      if (!context.enabledComponents.has('*') && !context.enabledComponents.has(event.component)) {
        return false;
      }
      return true;
    },
  },
}).createMachine({
  id: 'debugLogger',
  initial: 'uninitialized',
  context: {
    outputChannel: null,
    logLevel: LogLevel.INFO,
    enabledComponents: new Set(['*']),
    logBuffer: [],
    maxBufferSize: 1000,
    configuration: {
      logLevel: 'info',
      enabledComponents: ['*'],
    },
    telemetryEnabled: false,
    stats: {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      lastActivity: null,
    },
  },
  states: {
    uninitialized: {
      on: {
        INITIALIZE: {
          target: 'loading',
          actions: 'initializeOutputChannel',
        },
      },
    },
    loading: {
      entry: 'loadConfiguration',
      always: {
        target: 'active',
        guard: 'isConfigured',
      },
    },
    active: {
      on: {
        LOG: [
          {
            guard: 'shouldLog',
            actions: ['processLogEntry', 'outputToChannel'],
          },
        ],
        CONFIGURE: {
          actions: 'loadConfiguration',
        },
        CLEAR_BUFFER: {
          actions: 'clearBuffer',
        },
        SHOW_CHANNEL: {
          actions: 'showChannel',
        },
        SEND_TELEMETRY: {
          actions: 'sendTelemetry',
        },
        RESET: {
          actions: 'resetState',
        },
      },
    },
  },
});

// Helper functions to create properly formatted events
export function createLogEvent(
  level: LogLevel,
  component: string,
  message: string,
  data?: unknown,
  error?: Error,
  correlationId?: string
): DebugLoggerEvent {
  return {
    type: 'LOG',
    level,
    component,
    message,
    data,
    error,
    correlationId,
  };
}

export function createTelemetryEvent(
  event: TelemetryEvent['event'],
  properties: TelemetryEvent['properties']
): DebugLoggerEvent {
  return {
    type: 'SEND_TELEMETRY',
    event: {
      event,
      properties,
      timestamp: Date.now(),
    },
  };
}

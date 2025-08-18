import * as vscode from 'vscode';
import { assign, setup } from 'xstate';

// Telemetry event types from architecture
export interface TelemetryEvent {
  event:
    | 'format_request'
    | 'actor_error'
    | 'latency_bucket'
    | 'feature_used'
    | 'extension_activated'
    | 'configuration_changed';
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
  user_id?: string; // hashed
  session_id: string;
  timestamp: number;
}

export interface TelemetryContext {
  enabled: boolean;
  sessionId: string;
  userId: string; // hashed
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

export type TelemetryActorEvent =
  | {
      type: 'INITIALIZE';
      sessionId: string;
      userId: string;
    }
  | {
      type: 'TRACK_EVENT';
      event: TelemetryEvent;
    }
  | {
      type: 'TRACK_FORMAT_REQUEST';
      properties: {
        latency_ms: number;
        file_size_kb: number;
        template_count: number;
        formatter_used: 'biome' | 'prettier' | 'fallback';
      };
    }
  | {
      type: 'TRACK_ERROR';
      properties: {
        error_code: string;
        component: string;
        recoverable: boolean;
      };
    }
  | {
      type: 'TRACK_FEATURE_USAGE';
      featureName: string;
    }
  | {
      type: 'CONFIGURE';
      config: Partial<TelemetryContext['config']>;
    }
  | {
      type: 'FLUSH_BUFFER';
    }
  | {
      type: 'CLEAR_BUFFER';
    }
  | {
      type: 'DISABLE';
    }
  | {
      type: 'ENABLE';
    };

// Helper functions for privacy-first telemetry
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

function hashUserId(): string {
  // In production, this would use a proper hash with salt
  // For now, generate a stable but anonymous ID
  const machineId = vscode.env.machineId;
  return `user-${machineId.substring(0, 8)}`;
}

function shouldFlush(context: TelemetryContext): boolean {
  const timeSinceLastFlush = Date.now() - context.lastFlush;
  return (
    context.buffer.length >= context.maxBufferSize || timeSinceLastFlush >= context.flushInterval
  );
}

// Privacy-first telemetry - redacts all code content
function sanitizeEvent(event: TelemetryEvent): TelemetryEvent {
  return {
    ...event,
    properties: {
      ...event.properties,
      // Ensure no code content is included
      file_size_kb: event.properties.file_size_kb,
      template_count: event.properties.template_count,
      latency_ms: event.properties.latency_ms,
      formatter_used: event.properties.formatter_used,
      error_code: event.properties.error_code,
      feature_name: event.properties.feature_name,
      // Platform info is okay for analytics
      extension_version: event.properties.extension_version,
      vscode_version: event.properties.vscode_version,
      platform: event.properties.platform,
    },
  };
}

export const telemetryMachine = setup({
  types: {
    context: {} as TelemetryContext,
    events: {} as TelemetryActorEvent,
  },
  actions: {
    initialize: assign({
      sessionId: ({ event }) => {
        if (event.type === 'INITIALIZE') {
          return event.sessionId;
        }
        return generateSessionId();
      },
      userId: ({ event }) => {
        if (event.type === 'INITIALIZE') {
          return event.userId;
        }
        return hashUserId();
      },
    }),

    loadConfiguration: assign({
      config: () => {
        const config = vscode.workspace.getConfiguration('actor-spa.telemetry');
        return {
          enableAnalytics: config.get<boolean>('enabled', false),
          flushIntervalMs: config.get<number>('flushIntervalMs', 60000), // 1 minute
          maxBufferSize: config.get<number>('maxBufferSize', 100),
          endpoint: config.get<string>('endpoint'),
        };
      },
      enabled: ({ context }) => {
        // Respect VS Code's telemetry setting
        const vscodeEnabled = vscode.env.isTelemetryEnabled;
        return vscodeEnabled && context.config.enableAnalytics;
      },
    }),

    trackEvent: assign({
      buffer: ({ context, event }) => {
        if (event.type !== 'TRACK_EVENT' || !context.enabled) {
          return context.buffer;
        }

        const sanitizedEvent = sanitizeEvent(event.event);
        const newBuffer = [...context.buffer, sanitizedEvent];

        // Maintain buffer size
        if (newBuffer.length > context.maxBufferSize) {
          newBuffer.shift();
        }

        return newBuffer;
      },
      stats: ({ context, event }) => {
        if (event.type !== 'TRACK_EVENT' || !context.enabled) {
          return context.stats;
        }

        return {
          ...context.stats,
          totalEvents: context.stats.totalEvents + 1,
          formatRequests:
            context.stats.formatRequests + (event.event.event === 'format_request' ? 1 : 0),
          errors: context.stats.errors + (event.event.event === 'actor_error' ? 1 : 0),
          lastActivity: new Date(),
        };
      },
    }),

    trackFormatRequest: assign({
      buffer: ({ context, event }) => {
        if (event.type !== 'TRACK_FORMAT_REQUEST' || !context.enabled) {
          return context.buffer;
        }

        const telemetryEvent: TelemetryEvent = {
          event: 'format_request',
          properties: event.properties,
          session_id: context.sessionId,
          user_id: context.userId,
          timestamp: Date.now(),
        };

        const sanitizedEvent = sanitizeEvent(telemetryEvent);
        const newBuffer = [...context.buffer, sanitizedEvent];

        if (newBuffer.length > context.maxBufferSize) {
          newBuffer.shift();
        }

        return newBuffer;
      },
      stats: ({ context }) => ({
        ...context.stats,
        totalEvents: context.stats.totalEvents + 1,
        formatRequests: context.stats.formatRequests + 1,
        lastActivity: new Date(),
      }),
    }),

    trackError: assign({
      buffer: ({ context, event }) => {
        if (event.type !== 'TRACK_ERROR' || !context.enabled) {
          return context.buffer;
        }

        const telemetryEvent: TelemetryEvent = {
          event: 'actor_error',
          properties: event.properties,
          session_id: context.sessionId,
          user_id: context.userId,
          timestamp: Date.now(),
        };

        const sanitizedEvent = sanitizeEvent(telemetryEvent);
        const newBuffer = [...context.buffer, sanitizedEvent];

        if (newBuffer.length > context.maxBufferSize) {
          newBuffer.shift();
        }

        return newBuffer;
      },
      stats: ({ context }) => ({
        ...context.stats,
        totalEvents: context.stats.totalEvents + 1,
        errors: context.stats.errors + 1,
        lastActivity: new Date(),
      }),
    }),

    trackFeatureUsage: assign({
      buffer: ({ context, event }) => {
        if (event.type !== 'TRACK_FEATURE_USAGE' || !context.enabled) {
          return context.buffer;
        }

        const telemetryEvent: TelemetryEvent = {
          event: 'feature_used',
          properties: {
            feature_name: event.featureName,
          },
          session_id: context.sessionId,
          user_id: context.userId,
          timestamp: Date.now(),
        };

        const sanitizedEvent = sanitizeEvent(telemetryEvent);
        const newBuffer = [...context.buffer, sanitizedEvent];

        if (newBuffer.length > context.maxBufferSize) {
          newBuffer.shift();
        }

        return newBuffer;
      },
      stats: ({ context }) => ({
        ...context.stats,
        totalEvents: context.stats.totalEvents + 1,
        lastActivity: new Date(),
      }),
    }),

    flushBuffer: ({ context }) => {
      if (!context.enabled || context.buffer.length === 0) {
        return;
      }

      // In a real implementation, this would send to analytics service
      // Note: This should communicate with debugLoggerActor instead of direct logging
      // For now, we'll skip logging here since it creates a circular dependency
      // The caller should handle logging through the debugLoggerActor
    },

    clearBuffer: assign({
      buffer: () => [],
      lastFlush: () => Date.now(),
    }),

    updateConfig: assign({
      config: ({ context, event }) => {
        if (event.type === 'CONFIGURE') {
          return { ...context.config, ...event.config };
        }
        return context.config;
      },
      enabled: ({ context, event }) => {
        if (event.type === 'CONFIGURE') {
          const newConfig = { ...context.config, ...event.config };
          const vscodeEnabled = vscode.env.isTelemetryEnabled;
          return vscodeEnabled && newConfig.enableAnalytics;
        }
        return context.enabled;
      },
    }),

    enable: assign({
      enabled: () => {
        const vscodeEnabled = vscode.env.isTelemetryEnabled;
        return vscodeEnabled; // Only enable if VS Code allows it
      },
    }),

    disable: assign({
      enabled: () => false,
    }),
  },

  guards: {
    shouldFlush: ({ context }) => shouldFlush(context),
    isEnabled: ({ context }) => context.enabled,
  },
}).createMachine({
  id: 'telemetry',
  initial: 'uninitialized',
  context: {
    enabled: false,
    sessionId: '',
    userId: '',
    buffer: [],
    maxBufferSize: 100,
    lastFlush: Date.now(),
    flushInterval: 60000, // 1 minute
    stats: {
      totalEvents: 0,
      formatRequests: 0,
      errors: 0,
      lastActivity: null,
    },
    config: {
      enableAnalytics: false,
      flushIntervalMs: 60000,
      maxBufferSize: 100,
    },
  },
  states: {
    uninitialized: {
      on: {
        INITIALIZE: {
          target: 'loading',
          actions: 'initialize',
        },
      },
    },
    loading: {
      entry: 'loadConfiguration',
      always: {
        target: 'active',
      },
    },
    active: {
      on: {
        TRACK_EVENT: {
          actions: 'trackEvent',
        },
        TRACK_FORMAT_REQUEST: {
          actions: 'trackFormatRequest',
        },
        TRACK_ERROR: {
          actions: 'trackError',
        },
        TRACK_FEATURE_USAGE: {
          actions: 'trackFeatureUsage',
        },
        CONFIGURE: {
          actions: 'updateConfig',
        },
        FLUSH_BUFFER: [
          {
            guard: 'isEnabled',
            actions: ['flushBuffer', 'clearBuffer'],
          },
        ],
        CLEAR_BUFFER: {
          actions: 'clearBuffer',
        },
        ENABLE: {
          actions: 'enable',
        },
        DISABLE: {
          actions: 'disable',
        },
      },
      // Auto-flush based on time interval
      after: {
        60000: [
          {
            guard: 'shouldFlush',
            actions: ['flushBuffer', 'clearBuffer'],
          },
        ],
      },
    },
  },
});

// Helper functions to create telemetry events
export function createFormatRequestEvent(
  latency_ms: number,
  file_size_kb: number,
  template_count: number,
  formatter_used: 'biome' | 'prettier' | 'fallback'
): TelemetryActorEvent {
  return {
    type: 'TRACK_FORMAT_REQUEST',
    properties: {
      latency_ms,
      file_size_kb,
      template_count,
      formatter_used,
    },
  };
}

export function createErrorEvent(
  error_code: string,
  component: string,
  recoverable: boolean
): TelemetryActorEvent {
  return {
    type: 'TRACK_ERROR',
    properties: {
      error_code,
      component,
      recoverable,
    },
  };
}

export function createFeatureUsageEvent(featureName: string): TelemetryActorEvent {
  return {
    type: 'TRACK_FEATURE_USAGE',
    featureName,
  };
}

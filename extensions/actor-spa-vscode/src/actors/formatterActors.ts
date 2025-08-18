import type * as vscode from 'vscode';
import { assign, fromPromise, setup } from 'xstate';

// Proper event schema as defined in architecture
export interface ActorEvent {
  type: string;
  payload: unknown;
  metadata: {
    timestamp: number;
    source: string;
    correlationId: string;
  };
}

export interface ErrorEnvelope {
  error: string;
  code: string;
  context: Record<string, unknown>;
  recoverable: boolean;
}

// Shared context for all formatters
export interface FormatterContext {
  content: string;
  language: 'html' | 'css';
  options: vscode.FormattingOptions;
  config: FormatterConfig;
  result: string | null;
  error: ErrorEnvelope | null;
  stats: {
    startTime: number;
    endTime: number | null;
    processingTimeMs: number;
  };
}

export interface FormatterConfig {
  timeout: number;
  indentSize: number;
  preserveNewlines: boolean;
}

export type FormatterEvent =
  | {
      type: 'FORMAT';
      content: string;
      language: 'html' | 'css';
      options: vscode.FormattingOptions;
      config?: Partial<FormatterConfig>;
      correlationId: string;
    }
  | {
      type: 'CANCEL';
      correlationId: string;
    }
  | {
      type: 'RESET';
      correlationId: string;
    };

// Helper to create properly formatted events
export function createFormatterEvent(
  type: 'FORMAT',
  content: string,
  language: 'html' | 'css',
  options: vscode.FormattingOptions,
  correlationId: string,
  config?: Partial<FormatterConfig>
): FormatterEvent;
export function createFormatterEvent(
  type: 'CANCEL' | 'RESET',
  correlationId: string
): FormatterEvent;
export function createFormatterEvent(
  type: string,
  contentOrCorrelationId: string,
  language?: 'html' | 'css',
  options?: vscode.FormattingOptions,
  correlationId?: string,
  config?: Partial<FormatterConfig>
): FormatterEvent {
  if (type === 'FORMAT') {
    return {
      type: 'FORMAT',
      content: contentOrCorrelationId,
      language: language || ('html' as 'html' | 'css'),
      options: options || { tabSize: 2, insertSpaces: true },
      correlationId: correlationId || '',
      config,
    };
  }
  return {
    type: type as 'CANCEL' | 'RESET',
    correlationId: contentOrCorrelationId,
  };
}

// Biome formatter actor (simplified for now)
const biomeFormattingActor = fromPromise(
  async ({ input }: { input: { content: string; language: string; config: FormatterConfig } }) => {
    const { content } = input;

    try {
      // For now, simulate Biome formatting with basic logic
      // In a real implementation, this would call the actual Biome CLI
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate processing time

      // Basic formatting simulation
      let formatted = content.trim();
      if (formatted.length > 0) {
        formatted = formatted
          .replace(/>\s+</g, '>\n<')
          .replace(/^\s+/gm, '')
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .join('\n');
      }

      return `/* Biome formatted */\n${formatted}`;
    } catch (error) {
      throw new Error(
        `Biome formatting failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// Prettier formatter actor (simplified)
const prettierFormattingActor = fromPromise(
  async ({ input }: { input: { content: string; language: string; config: FormatterConfig } }) => {
    const { content, config } = input;

    try {
      // Simulate prettier formatting
      await new Promise((resolve) => setTimeout(resolve, 150));

      let formatted = content.trim();
      if (formatted.length > 0) {
        const indent = ' '.repeat(config.indentSize);
        formatted = formatted
          .replace(/>\s*</g, '>\n<')
          .split('\n')
          .map((line) => {
            const trimmed = line.trim();
            if (!trimmed) {
              return '';
            }
            return trimmed.startsWith('<') ? trimmed : `${indent}${trimmed}`;
          })
          .join('\n');
      }

      return `/* Prettier formatted */\n${formatted}`;
    } catch (error) {
      throw new Error(
        `Prettier formatting failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// Fallback formatter actor
const fallbackFormattingActor = fromPromise(
  async ({ input }: { input: { content: string; language: string; config: FormatterConfig } }) => {
    const { content } = input;

    try {
      // Simple fallback - just clean whitespace
      const formatted = content.trim().replace(/\s+/g, ' ');
      return `/* Fallback formatted */\n${formatted}`;
    } catch (error) {
      throw new Error(
        `Fallback formatting failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// Base formatter machine setup
const createFormatterMachine = (
  formatterName: string,
  formatterActor: typeof biomeFormattingActor
) => {
  return setup({
    types: {
      context: {} as FormatterContext,
      events: {} as FormatterEvent,
    },
    actors: {
      formatter: formatterActor,
    },
    actions: {
      initializeFormatting: assign({
        content: ({ event }) => {
          if (event.type === 'FORMAT') {
            return event.content;
          }
          return '';
        },
        language: ({ event }) => {
          if (event.type === 'FORMAT') {
            return event.language;
          }
          return 'html';
        },
        options: ({ event }) => {
          if (event.type === 'FORMAT') {
            return event.options;
          }
          return { tabSize: 2, insertSpaces: true };
        },
        config: ({ event }) => {
          if (event.type === 'FORMAT') {
            const defaultConfig: FormatterConfig = {
              timeout: 10000,
              indentSize: event.options.tabSize || 2,
              preserveNewlines: true,
            };
            return { ...defaultConfig, ...event.config };
          }
          return {
            timeout: 10000,
            indentSize: 2,
            preserveNewlines: true,
          };
        },
        stats: () => ({
          startTime: Date.now(),
          endTime: null,
          processingTimeMs: 0,
        }),
        result: null,
        error: null,
      }),

      resetState: assign({
        content: '',
        language: 'html',
        options: { tabSize: 2, insertSpaces: true },
        config: {
          timeout: 10000,
          indentSize: 2,
          preserveNewlines: true,
        },
        result: null,
        error: null,
        stats: {
          startTime: 0,
          endTime: null,
          processingTimeMs: 0,
        },
      }),
    },
  }).createMachine({
    id: formatterName,
    initial: 'idle',
    context: {
      content: '',
      language: 'html',
      options: { tabSize: 2, insertSpaces: true },
      config: {
        timeout: 10000,
        indentSize: 2,
        preserveNewlines: true,
      },
      result: null,
      error: null,
      stats: {
        startTime: 0,
        endTime: null,
        processingTimeMs: 0,
      },
    },
    states: {
      idle: {
        on: {
          FORMAT: {
            target: 'formatting',
            actions: 'initializeFormatting',
          },
        },
      },
      formatting: {
        invoke: {
          src: 'formatter',
          input: ({ context }) => ({
            content: context.content,
            language: context.language,
            config: context.config,
          }),
          onDone: {
            target: 'completed',
            actions: assign({
              result: ({ event }) => event.output,
              stats: ({ context }) => ({
                ...context.stats,
                endTime: Date.now(),
                processingTimeMs: Date.now() - context.stats.startTime,
              }),
            }),
          },
          onError: {
            target: 'error',
            actions: assign({
              error: ({ event }) => ({
                error: event.error instanceof Error ? event.error.message : String(event.error),
                code: 'FORMATTING_ERROR',
                context: { formatterName },
                recoverable: true,
              }),
              stats: ({ context }) => ({
                ...context.stats,
                endTime: Date.now(),
                processingTimeMs: Date.now() - context.stats.startTime,
              }),
            }),
          },
        },
        on: {
          CANCEL: {
            target: 'cancelled',
          },
        },
      },
      completed: {
        type: 'final',
      },
      error: {
        on: {
          RESET: {
            target: 'idle',
            actions: 'resetState',
          },
        },
      },
      cancelled: {
        on: {
          RESET: {
            target: 'idle',
            actions: 'resetState',
          },
        },
      },
    },
  });
};

// Export individual formatter machines
export const biomeFormatterMachine = createFormatterMachine('biome', biomeFormattingActor);
export const prettierFormatterMachine = createFormatterMachine('prettier', prettierFormattingActor);
export const fallbackFormatterMachine = createFormatterMachine('fallback', fallbackFormattingActor);

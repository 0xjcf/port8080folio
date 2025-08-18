import * as vscode from 'vscode';
import { assign, createActor, fromPromise, setup } from 'xstate';
import { discoveryMachine, type TemplateInfo } from './discoveryMachine';

export interface FormattingJob {
  id: string;
  template: TemplateInfo;
  status: 'pending' | 'formatting' | 'completed' | 'error';
  result?: string;
  error?: string;
  startTime: number;
  endTime?: number;
}

export interface CoordinatorContext {
  document: vscode.TextDocument | null;
  options: vscode.FormattingOptions;
  templates: TemplateInfo[];
  jobs: FormattingJob[];
  completedJobs: FormattingJob[];
  errors: string[];
  edits: vscode.TextEdit[];
  stats: {
    totalTemplates: number;
    successfulJobs: number;
    failedJobs: number;
    processingTimeMs: number;
    startTime: number;
    endTime?: number;
  };
  config: {
    maxParallelJobs: number;
    timeout: number;
    preferredFormatter: 'biome' | 'prettier' | 'fallback';
    enableParallelProcessing: boolean;
  };
}

export type CoordinatorEvent =
  | {
      type: 'FORMAT';
      document: vscode.TextDocument;
      options: vscode.FormattingOptions;
      token?: vscode.CancellationToken;
    }
  | { type: 'DISCOVERY_COMPLETE'; templates: TemplateInfo[] }
  | { type: 'JOB_COMPLETE'; jobId: string; result: string }
  | { type: 'JOB_ERROR'; jobId: string; error: string }
  | { type: 'ALL_JOBS_COMPLETE' }
  | { type: 'TIMEOUT' }
  | { type: 'CANCEL' }
  | { type: 'ERROR'; error: string }
  | { type: 'RETRY' }
  | { type: 'RESET' };

// Actor for running discovery
const runDiscoveryActor = fromPromise(
  async ({ input }: { input: { document: vscode.TextDocument } }) => {
    const { document } = input;

    // Create and run discovery actor
    const discoveryActor = createActor(discoveryMachine);
    discoveryActor.start();

    return new Promise<TemplateInfo[]>((resolve, reject) => {
      const subscription = discoveryActor.subscribe({
        next: (state) => {
          if (state.matches('completed')) {
            discoveryActor.stop();
            resolve(state.context.templates);
          } else if (state.matches('error')) {
            discoveryActor.stop();
            reject(new Error(state.context.errors.join(', ')));
          }
        },
        error: (error) => {
          discoveryActor.stop();
          reject(error);
        },
      });

      // Start discovery
      discoveryActor.send({ type: 'DISCOVER', document });

      // Cleanup subscription after 30 seconds
      setTimeout(() => {
        subscription.unsubscribe();
        discoveryActor.stop();
        reject(new Error('Discovery timeout'));
      }, 30000);
    });
  }
);

// Note: Individual template formatting is now handled inline in parallelFormattingActor
// to avoid circular dependencies and simplify the actor model

// Actor for parallel processing
const parallelFormattingActor = fromPromise(
  async ({
    input,
  }: {
    input: {
      templates: TemplateInfo[];
      options: vscode.FormattingOptions;
      config: CoordinatorContext['config'];
    };
  }) => {
    const { templates, options, config } = input;

    const jobs: FormattingJob[] = templates.map((template, index) => ({
      id: `job-${index}`,
      template,
      status: 'pending' as const,
      startTime: Date.now(),
    }));

    const results: FormattingJob[] = [];
    const batchSize = config.enableParallelProcessing ? config.maxParallelJobs : 1;

    // Process templates in batches
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      const batchPromises = batch.map(async (job) => {
        try {
          job.status = 'formatting';

          // Import and call the formatting provider directly
          const { ActorSpaFormattingProvider } = await import('../providers/formattingProvider');
          // Create output channel for debugging
          const outputChannel = vscode.window.createOutputChannel('Actor-SPA Coordinator Debug');
          const formatter = new ActorSpaFormattingProvider(outputChannel);

          // Debug: Log the template we're about to format
          outputChannel.appendLine(
            `🔧 Formatting job ${job.id}: ${job.template.language} template`
          );
          outputChannel.appendLine(
            `📝 Original content (${job.template.content.length} chars): ${job.template.content.substring(0, 200)}${job.template.content.length > 200 ? '...' : ''}`
          );
          outputChannel.show();

          // Create a mock document for the template content
          const mockUri = vscode.Uri.parse(
            `untitled:template-${Date.now()}.${job.template.language}`
          );
          const mockDocument = {
            getText: () => job.template.content,
            fileName: mockUri.fsPath,
            languageId: job.template.language === 'html' ? 'html' : 'css',
            lineCount: job.template.lineCount,
            positionAt: (offset: number) => new vscode.Position(0, offset),
            offsetAt: (position: vscode.Position) => position.character,
          } as vscode.TextDocument;

          // Create format promise
          const formatPromise = formatter
            .provideDocumentFormattingEdits(
              mockDocument,
              options,
              new vscode.CancellationTokenSource().token
            )
            .then((edits) => {
              if (edits.length > 0) {
                return edits[0].newText;
              }
              return job.template.content;
            });

          const result = await Promise.race([
            formatPromise,
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error('Formatting timeout'));
              }, config.timeout);
            }),
          ]);

          job.status = 'completed';
          job.result = result;
          job.endTime = Date.now();

          return job;
        } catch (error) {
          job.status = 'error';
          job.error = error instanceof Error ? error.message : String(error);
          job.endTime = Date.now();

          return job;
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          const job = batch[index];
          job.status = 'error';
          job.error =
            result.reason instanceof Error ? result.reason.message : String(result.reason);
          job.endTime = Date.now();
          results.push(job);
        }
      });
    }

    return results;
  }
);

// Utility functions
function getConfiguration(): CoordinatorContext['config'] {
  const config = vscode.workspace.getConfiguration('actor-spa.formatting');

  return {
    maxParallelJobs: config.get<number>('maxParallelJobs', 4),
    timeout: config.get<number>('timeout', 10000),
    preferredFormatter: config.get<'biome' | 'prettier' | 'fallback'>(
      'preferredFormatter',
      'biome'
    ),
    enableParallelProcessing: config.get<boolean>('enableParallelProcessing', true),
  };
}

function createTextEdits(jobs: FormattingJob[]): vscode.TextEdit[] {
  const edits: vscode.TextEdit[] = [];

  for (const job of jobs) {
    if (job.status === 'completed' && job.result && job.result !== job.template.content) {
      edits.push(vscode.TextEdit.replace(job.template.range, job.result));
    }
  }

  return edits;
}

export const coordinatorMachine = setup({
  types: {
    context: {} as CoordinatorContext,
    events: {} as CoordinatorEvent,
  },
  actors: {
    runDiscovery: runDiscoveryActor,
    parallelFormatting: parallelFormattingActor,
  },
  actions: {
    initializeFormatting: assign({
      document: ({ event }) => {
        if (event.type === 'FORMAT') {
          return event.document;
        }
        return null;
      },
      options: ({ event }) => {
        if (event.type === 'FORMAT') {
          return event.options;
        }
        return { tabSize: 2, insertSpaces: true };
      },
      config: () => getConfiguration(),
      stats: () => ({
        totalTemplates: 0,
        successfulJobs: 0,
        failedJobs: 0,
        processingTimeMs: 0,
        startTime: Date.now(),
      }),
      templates: [],
      jobs: [],
      completedJobs: [],
      errors: [],
      edits: [],
    }),

    setDiscoveryResults: assign({
      templates: ({ event }) => {
        if (event.type === 'DISCOVERY_COMPLETE') {
          return event.templates;
        }
        return [];
      },
      stats: ({ context, event }) => {
        if (event.type === 'DISCOVERY_COMPLETE') {
          return {
            ...context.stats,
            totalTemplates: event.templates.length,
          };
        }
        return context.stats;
      },
    }),

    setFormattingResults: assign({
      completedJobs: ({ event }) => {
        if (event.type === 'ALL_JOBS_COMPLETE') {
          // This would be set by the parallel formatting actor
          return [];
        }
        return [];
      },
      edits: ({ context }) => {
        return createTextEdits(context.completedJobs);
      },
      stats: ({ context }) => {
        const endTime = Date.now();
        const successfulJobs = context.completedJobs.filter(
          (job) => job.status === 'completed'
        ).length;
        const failedJobs = context.completedJobs.filter((job) => job.status === 'error').length;

        return {
          ...context.stats,
          successfulJobs,
          failedJobs,
          processingTimeMs: endTime - context.stats.startTime,
          endTime,
        };
      },
    }),

    addError: assign({
      errors: ({ context, event }) => {
        if (event.type === 'ERROR') {
          return [...context.errors, event.error];
        }
        return context.errors;
      },
    }),

    resetState: assign({
      document: null,
      options: { tabSize: 2, insertSpaces: true },
      templates: [],
      jobs: [],
      completedJobs: [],
      errors: [],
      edits: [],
      stats: {
        totalTemplates: 0,
        successfulJobs: 0,
        failedJobs: 0,
        processingTimeMs: 0,
        startTime: Date.now(),
      },
      config: () => getConfiguration(),
    }),
  },
}).createMachine({
  id: 'coordinator',
  initial: 'idle',
  context: {
    document: null,
    options: { tabSize: 2, insertSpaces: true },
    templates: [],
    jobs: [],
    completedJobs: [],
    errors: [],
    edits: [],
    stats: {
      totalTemplates: 0,
      successfulJobs: 0,
      failedJobs: 0,
      processingTimeMs: 0,
      startTime: Date.now(),
    },
    config: {
      maxParallelJobs: 4,
      timeout: 10000,
      preferredFormatter: 'biome',
      enableParallelProcessing: true,
    },
  },
  states: {
    idle: {
      on: {
        FORMAT: {
          target: 'discovering',
          actions: 'initializeFormatting',
        },
      },
    },

    discovering: {
      invoke: {
        id: 'runDiscovery',
        src: 'runDiscovery',
        input: ({ context }) => {
          if (!context.document) {
            throw new Error('No document provided for discovery');
          }
          return {
            document: context.document,
          };
        },
        onDone: {
          target: 'coordinating',
          actions: assign({
            templates: ({ event }) => event.output,
            stats: ({ context, event }) => ({
              ...context.stats,
              totalTemplates: event.output.length,
            }),
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            errors: ({ context, event }) => [
              ...context.errors,
              `Discovery error: ${String(event.error)}`,
            ],
          }),
        },
      },
    },

    coordinating: {
      always: [
        {
          target: 'completing',
          guard: ({ context }) => context.templates.length === 0,
        },
        {
          target: 'parallelProcessing',
        },
      ],
    },

    parallelProcessing: {
      invoke: {
        id: 'parallelFormatting',
        src: 'parallelFormatting',
        input: ({ context }) => ({
          templates: context.templates,
          options: context.options,
          config: context.config,
        }),
        onDone: {
          target: 'aggregating',
          actions: assign({
            completedJobs: ({ event }) => event.output,
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            errors: ({ context, event }) => [
              ...context.errors,
              `Parallel processing error: ${String(event.error)}`,
            ],
          }),
        },
      },
    },

    aggregating: {
      entry: assign({
        edits: ({ context }) => createTextEdits(context.completedJobs),
        stats: ({ context }) => {
          const endTime = Date.now();
          const successfulJobs = context.completedJobs.filter(
            (job) => job.status === 'completed'
          ).length;
          const failedJobs = context.completedJobs.filter((job) => job.status === 'error').length;

          return {
            ...context.stats,
            successfulJobs,
            failedJobs,
            processingTimeMs: endTime - context.stats.startTime,
            endTime,
          };
        },
      }),
      always: {
        target: 'completing',
      },
    },

    completing: {
      type: 'final',
    },

    error: {
      on: {
        RETRY: {
          target: 'discovering',
        },
        RESET: {
          target: 'idle',
          actions: 'resetState',
        },
      },
    },
  },
});

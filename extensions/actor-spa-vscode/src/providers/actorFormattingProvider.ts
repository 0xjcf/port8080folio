import * as vscode from 'vscode';
import { createActor } from 'xstate';
import { COMPONENTS, type DebugLogger } from '../core/debugLogger';
import { coordinatorMachine } from '../machines/coordinatorMachine';

/**
 * Actor-based formatting provider that uses XState machines for orchestration
 * This provides better error handling, race condition prevention, and performance
 */
export class ActorFormattingProvider implements vscode.DocumentFormattingEditProvider {
  private version: string;
  private debugLogger?: DebugLogger;

  constructor(_outputChannel?: vscode.OutputChannel, debugLogger?: DebugLogger) {
    this.debugLogger = debugLogger;

    // Get extension version
    const extension = vscode.extensions.getExtension('actor-spa.actor-spa-framework');
    this.version = extension?.packageJSON?.version || 'unknown';

    this.log(`🚀 Actor-based formatting provider v${this.version} initialized`);
  }

  private log(message: string, data?: unknown): void {
    if (this.debugLogger) {
      this.debugLogger.debug(COMPONENTS.ACTOR_FORMATTER, message, data);
    }
    // Note: No fallback console.log - if debugLogger isn't available,
    // the logging is simply skipped to follow proper actor communication patterns
  }

  async provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    this.log(`🎬 Starting actor-based formatting for ${document.fileName}`, {
      languageId: document.languageId,
      lineCount: document.lineCount,
      tabSize: options.tabSize,
      insertSpaces: options.insertSpaces,
    });

    try {
      // Check if formatting is enabled
      const config = vscode.workspace.getConfiguration('actor-spa.formatting');
      if (!config.get<boolean>('enabled', true)) {
        this.log('❌ Formatting disabled in configuration');
        return [];
      }

      // Create coordinator actor
      const coordinatorActor = createActor(coordinatorMachine);

      this.log('🎭 Created coordinator actor, starting machine');
      coordinatorActor.start();

      return new Promise<vscode.TextEdit[]>((resolve) => {
        let hasResolved = false;

        // Set up cancellation handling
        const cancellationListener = token.onCancellationRequested(() => {
          if (!hasResolved) {
            hasResolved = true;
            this.log('⚠️ Formatting cancelled by user');
            coordinatorActor.stop();
            resolve([]);
          }
        });

        // Subscribe to state changes
        const subscription = coordinatorActor.subscribe({
          next: (state) => {
            this.log(`📊 Actor state: ${JSON.stringify(state.value)}`, {
              context: {
                templatesFound: state.context.templates.length,
                jobsCompleted: state.context.completedJobs.length,
                errors: state.context.errors.length,
                edits: state.context.edits.length,
              },
            });

            // Handle completion
            if (state.matches('completing') && !hasResolved) {
              hasResolved = true;

              const stats = state.context.stats;
              this.log('✅ Formatting completed successfully', {
                totalTemplates: stats.totalTemplates,
                successfulJobs: stats.successfulJobs,
                failedJobs: stats.failedJobs,
                processingTimeMs: stats.processingTimeMs,
                editsGenerated: state.context.edits.length,
              });

              // Clean up
              subscription.unsubscribe();
              cancellationListener.dispose();
              coordinatorActor.stop();

              resolve(state.context.edits);
            }

            // Handle errors
            else if (state.matches('error') && !hasResolved) {
              hasResolved = true;

              const errors = state.context.errors;
              this.log('❌ Formatting failed with errors', {
                errors,
                errorCount: errors.length,
              });

              // Clean up
              subscription.unsubscribe();
              cancellationListener.dispose();
              coordinatorActor.stop();

              // Don't reject - return empty edits instead to avoid disrupting the user
              resolve([]);
            }
          },
          error: (error) => {
            if (!hasResolved) {
              hasResolved = true;

              this.log('💥 Actor subscription error', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              });

              // Clean up
              subscription.unsubscribe();
              cancellationListener.dispose();
              coordinatorActor.stop();

              // Don't reject - return empty edits instead
              resolve([]);
            }
          },
        });

        // Start the formatting process
        this.log('🚀 Sending FORMAT event to coordinator');
        coordinatorActor.send({
          type: 'FORMAT',
          document,
          options,
          token,
        });

        // Set up timeout as a safety measure
        setTimeout(() => {
          if (!hasResolved) {
            hasResolved = true;

            this.log('⏰ Formatting timeout - operation took too long');

            // Clean up
            subscription.unsubscribe();
            cancellationListener.dispose();
            coordinatorActor.stop();

            resolve([]);
          }
        }, 60000); // 60 second timeout
      });
    } catch (error) {
      this.log('💥 Unexpected formatting error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Return empty edits instead of throwing to avoid disrupting the user
      return [];
    }
  }
}

/**
 * Range formatting provider that delegates to the document formatter
 */
export class ActorRangeFormattingProvider implements vscode.DocumentRangeFormattingEditProvider {
  private formattingProvider: ActorFormattingProvider;

  constructor(outputChannel?: vscode.OutputChannel, debugLogger?: DebugLogger) {
    this.formattingProvider = new ActorFormattingProvider(outputChannel, debugLogger);
  }

  async provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    _range: vscode.Range,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    // For now, format the whole document since template literals can span multiple lines
    // In the future, we could enhance this to only format templates that intersect with the range
    return this.formattingProvider.provideDocumentFormattingEdits(document, options, token);
  }
}

/**
 * Factory function to create the appropriate formatting provider based on configuration
 */
export function createFormattingProvider(
  outputChannel?: vscode.OutputChannel,
  debugLogger?: DebugLogger
): {
  documentProvider: vscode.DocumentFormattingEditProvider;
  rangeProvider: vscode.DocumentRangeFormattingEditProvider;
} {
  const config = vscode.workspace.getConfiguration('actor-spa');
  const useActorFormatter = config.get<boolean>('useActorFormatter', true);

  if (useActorFormatter) {
    const documentProvider = new ActorFormattingProvider(outputChannel, debugLogger);
    const rangeProvider = new ActorRangeFormattingProvider(outputChannel, debugLogger);

    return { documentProvider, rangeProvider };
  }

  // Fallback to the legacy XState formatter
  const {
    XStateFormattingProvider,
    XStateRangeFormattingProvider,
  } = require('./xstateFormattingProvider');

  return {
    documentProvider: new XStateFormattingProvider(outputChannel),
    rangeProvider: new XStateRangeFormattingProvider(outputChannel),
  };
}

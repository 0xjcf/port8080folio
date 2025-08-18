import * as vscode from 'vscode';
// Import AI Communication
import {
  cleanupAICommunication,
  initializeAICommunication,
  registerAICommunicationCommands,
} from './commands/aiCommunication';
// Import centralized debug logger
import { COMPONENTS, createDebugLogger, type DebugLogger } from './core/debugLogger';
// Import the new actor-based formatting providers
import { createFormattingProvider } from './providers/actorFormattingProvider';
// Keep legacy providers for fallback (imported dynamically when needed)
import {
  ActorSpaFormattingProvider,
  ActorSpaRangeFormattingProvider,
} from './providers/formattingProvider';
// Import reactive-lint provider
import { ReactiveLintProvider } from './providers/reactiveLintProvider';
// Import simple formatting provider
import { SimpleFormattingProvider } from './providers/simpleFormattingProvider';

// Global output channel for logging
let outputChannel: vscode.OutputChannel;
let debugLogger: DebugLogger;

export function activate(context: vscode.ExtensionContext) {
  try {
    // Get extension version from package.json
    const extension = vscode.extensions.getExtension('actor-spa.actor-spa-framework');
    const version = extension?.packageJSON?.version || 'unknown';

    // Create output channel for logs
    outputChannel = vscode.window.createOutputChannel('Actor-SPA Framework');
    outputChannel.show(); // Make sure output channel is visible

    // Initialize debug logger
    debugLogger = createDebugLogger(outputChannel);

    debugLogger.info(
      COMPONENTS.EXTENSION,
      `🚀 Actor-SPA Framework extension v${version} activated`
    );

    // Add detailed logging
    debugLogger.debug(COMPONENTS.EXTENSION, 'Extension context details', {
      extensionPath: context.extensionPath,
      globalState: !!context.globalState,
      workspaceState: !!context.workspaceState,
      version,
    });

    // Get formatter configuration
    const config = vscode.workspace.getConfiguration('actor-spa');
    const formatterType = config.get<string>('formatting.formatter', 'simple');

    // Create the appropriate formatter based on configuration
    let formattingProvider: vscode.DocumentFormattingEditProvider;
    let rangeFormattingProvider: vscode.DocumentRangeFormattingEditProvider;

    switch (formatterType) {
      case 'simple': {
        debugLogger.info(COMPONENTS.EXTENSION, '🎯 Using Simple formatter (recommended)');
        const simpleProvider = new SimpleFormattingProvider(outputChannel);
        formattingProvider = simpleProvider;
        rangeFormattingProvider = simpleProvider; // Simple provider implements both interfaces
        break;
      }

      case 'actor': {
        debugLogger.info(COMPONENTS.EXTENSION, '🤖 Using Actor-based formatter');
        const actorProviders = createFormattingProvider(outputChannel, debugLogger);
        formattingProvider = actorProviders.documentProvider;
        rangeFormattingProvider = actorProviders.rangeProvider;
        break;
      }
      default:
        debugLogger.info(COMPONENTS.EXTENSION, '📦 Using Legacy formatter');
        formattingProvider = new ActorSpaFormattingProvider(outputChannel);
        rangeFormattingProvider = new ActorSpaRangeFormattingProvider(outputChannel);
        break;
    }

    // Language selectors
    const selector: vscode.DocumentSelector = [
      { language: 'typescript', scheme: 'file' },
      { language: 'javascript', scheme: 'file' },
      { language: 'typescriptreact', scheme: 'file' },
      { language: 'javascriptreact', scheme: 'file' },
    ];

    // Register providers with correct method names
    const documentFormattingProvider = vscode.languages.registerDocumentFormattingEditProvider(
      selector,
      formattingProvider
    );

    const documentRangeFormattingProvider =
      vscode.languages.registerDocumentRangeFormattingEditProvider(
        selector,
        rangeFormattingProvider
      );

    // Register reactive-lint provider
    const reactiveLintProvider = new ReactiveLintProvider(outputChannel);
    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
      selector,
      reactiveLintProvider
    );

    // Set up reactive-lint diagnostics on document changes
    const documentChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
      if (
        event.document.languageId === 'typescript' ||
        event.document.languageId === 'typescriptreact'
      ) {
        // Debounce analysis to avoid excessive calls
        setTimeout(() => {
          reactiveLintProvider.analyzeFile(event.document);
        }, 1000);
      }
    });

    // Analyze open documents on startup
    vscode.workspace.textDocuments.forEach((document) => {
      if (document.languageId === 'typescript' || document.languageId === 'typescriptreact') {
        reactiveLintProvider.analyzeFile(document);
      }
    });

    // Register commands
    const generateComponentCommand = vscode.commands.registerCommand(
      'actor-spa.generateComponent',
      () => {
        debugLogger.info(COMPONENTS.EXTENSION, '📦 Generate Component command executed');
        vscode.window.showInformationMessage('Actor-SPA: Generate Component command executed!');
      }
    );

    const showReactivePatternDocsCommand = vscode.commands.registerCommand(
      'actor-spa.showReactivePatternDocs',
      (rule: string) => {
        debugLogger.info(
          COMPONENTS.EXTENSION,
          `📖 Showing reactive pattern docs for rule: ${rule}`
        );

        // Open the reactive patterns documentation
        const docUri = vscode.Uri.file(
          `${vscode.workspace.workspaceFolders?.[0]?.uri.fsPath}/docs/REACTIVE_PATTERNS.md`
        );

        vscode.window.showTextDocument(docUri).then(
          () => {
            // Find the section for this rule
            const editor = vscode.window.activeTextEditor;
            if (editor) {
              const document = editor.document;
              const text = document.getText();
              const searchPattern = new RegExp(`### \\d+\\. \`${rule}\``, 'i');
              const match = text.match(searchPattern);

              if (match && match.index !== undefined) {
                const position = document.positionAt(match.index);
                const range = new vscode.Range(position, position);
                editor.selection = new vscode.Selection(range.start, range.end);
                editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
              }
            }
          },
          (error) => {
            vscode.window.showErrorMessage(
              `Could not open reactive patterns documentation: ${error.message}`
            );
          }
        );
      }
    );

    const generateMachineCommand = vscode.commands.registerCommand(
      'actor-spa.generateMachine',
      () => {
        debugLogger.info(COMPONENTS.EXTENSION, '🤖 Generate Machine command executed');
        vscode.window.showInformationMessage('Actor-SPA: Generate Machine command executed!');
      }
    );

    // Initialize AI Communication
    initializeAICommunication(context, outputChannel).catch((error) => {
      debugLogger.error(
        COMPONENTS.EXTENSION,
        '❌ Failed to initialize AI Communication',
        undefined,
        error instanceof Error ? error : new Error(String(error))
      );
    });

    // Register AI Communication commands
    registerAICommunicationCommands(context);

    // Add all disposables to context
    context.subscriptions.push(
      outputChannel,
      documentFormattingProvider,
      documentRangeFormattingProvider,
      codeActionProvider,
      documentChangeListener,
      generateComponentCommand,
      generateMachineCommand,
      showReactivePatternDocsCommand,
      reactiveLintProvider
    );

    debugLogger.info(COMPONENTS.EXTENSION, '✅ All providers registered successfully');
  } catch (error) {
    // Create output channel even if other initialization fails
    if (!outputChannel) {
      outputChannel = vscode.window.createOutputChannel('Actor-SPA Framework');
    }

    // Initialize debug logger for error handling
    if (!debugLogger) {
      debugLogger = createDebugLogger(outputChannel);
    }

    debugLogger.error(
      COMPONENTS.EXTENSION,
      '❌ Extension activation failed',
      undefined,
      error instanceof Error ? error : new Error(String(error))
    );

    // Try to continue with simple formatter as ultimate fallback
    try {
      const fallbackProvider = new SimpleFormattingProvider(outputChannel);
      const selector: vscode.DocumentSelector = [
        { language: 'typescript', scheme: 'file' },
        { language: 'javascript', scheme: 'file' },
        { language: 'typescriptreact', scheme: 'file' },
        { language: 'javascriptreact', scheme: 'file' },
      ];

      const fallbackRegistration = vscode.languages.registerDocumentFormattingEditProvider(
        selector,
        fallbackProvider
      );

      context.subscriptions.push(outputChannel, fallbackRegistration);
      debugLogger.info(COMPONENTS.EXTENSION, '🆘 Fallback to simple formatter activated');
    } catch (fallbackError) {
      debugLogger.error(
        COMPONENTS.EXTENSION,
        '💥 Fallback also failed',
        undefined,
        fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError))
      );
    }
  }
}

export function deactivate() {
  if (debugLogger) {
    debugLogger.info(COMPONENTS.EXTENSION, '👋 Actor-SPA Framework extension deactivated');
  }

  // Cleanup AI Communication
  cleanupAICommunication();

  if (outputChannel) {
    outputChannel.dispose();
  }
}

// Export output channel for use in other modules
export function getOutputChannel(): vscode.OutputChannel {
  return outputChannel;
}

// Export debug logger for use in other modules
export function getDebugLogger(): DebugLogger {
  return debugLogger;
}

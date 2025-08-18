import * as vscode from 'vscode';
import { ActorSpaFormattingProvider } from './formattingProvider';

/**
 * XState-based formatting provider - FIXED VERSION
 * Now properly uses XState machine with error handling
 */
export class XStateFormattingProvider implements vscode.DocumentFormattingEditProvider {
  private legacyFormatter: ActorSpaFormattingProvider;
  private version: string;

  constructor(private outputChannel?: vscode.OutputChannel) {
    try {
      // Get extension version
      const extension = vscode.extensions.getExtension('actor-spa.actor-spa-framework');
      this.version = extension?.packageJSON?.version || 'unknown';

      this.legacyFormatter = new ActorSpaFormattingProvider(outputChannel);

      // Test XState imports during construction
      this.testXStateImports();

      this.log(`🤖 XState Formatter v${this.version} initialized - XState machine ready`);
    } catch (error) {
      this.version = 'unknown';
      this.log(
        `❌ XState Formatter initialization error: ${error instanceof Error ? error.message : String(error)}`
      );
      this.log(`📊 Error stack: ${error instanceof Error ? error.stack : 'No stack'}`);
      // Create legacy formatter as fallback
      this.legacyFormatter = new ActorSpaFormattingProvider(outputChannel);
    }
  }

  private testXStateImports(): void {
    try {
      // Dynamic import to avoid breaking extension activation
      const xstate = require('xstate');

      this.log('🔧 XState imports test successful', {
        xstateAvailable: !!xstate,
        createActorType: typeof xstate.createActor,
      });
    } catch (importError) {
      this.log('❌ XState imports failed during test', {
        error: importError instanceof Error ? importError.message : String(importError),
        stack: importError instanceof Error ? importError.stack : 'No stack',
      });
      throw new Error(
        `XState imports failed: ${importError instanceof Error ? importError.message : String(importError)}`
      );
    }
  }

  private log(message: string, data?: unknown): void {
    try {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [XState Formatter] ${message}`;
      // Logging disabled to follow actor pattern - use output channel only
      if (this.outputChannel) {
        const dataStr = data ? ` | Data: ${JSON.stringify(data, null, 2)}` : '';
        this.outputChannel.appendLine(`${logMessage}${dataStr}`);
        this.outputChannel.show(); // Ensure channel is visible
      }
    } catch (_logError) {
      // Fallback logging disabled to follow actor pattern
    }
  }

  async provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    this.log(`🚀 XState formatter v${this.version} activated - Using state machine`);

    this.log(
      `🔍 Processing document: ${document.fileName} (${document.getText().length} characters)`
    );
    this.log(
      `📊 Formatting options: tabSize=${options.tabSize}, insertSpaces=${options.insertSpaces}`
    );

    try {
      return await this.formatWithXStateMachine(document, options, token);
    } catch (xstateError) {
      this.log('❌ XState machine failed, falling back to legacy formatter', {
        error: xstateError instanceof Error ? xstateError.message : String(xstateError),
        stack: xstateError instanceof Error ? xstateError.stack : 'No stack',
      });

      // Fallback to legacy formatter
      try {
        return await this.legacyFormatter.provideDocumentFormattingEdits(document, options, token);
      } catch (legacyError) {
        this.log('❌ Even legacy formatter failed', {
          error: legacyError instanceof Error ? legacyError.message : String(legacyError),
          stack: legacyError instanceof Error ? legacyError.stack : 'No stack',
        });
        return [];
      }
    }
  }

  private async formatWithXStateMachine(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    _token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    this.log('🤖 Starting XState formatter machine');

    try {
      // Dynamic imports to avoid breaking extension activation
      this.log('📦 Loading XState modules...');
      const { createActor } = require('xstate');
      const { formatterMachine } = require('../machines/formatterMachine');

      this.log('🔧 XState modules loaded successfully');

      // Create actor from machine
      this.log('🎭 Creating XState actor...');
      const actor = createActor(formatterMachine);

      this.log('🎭 Created XState actor, starting machine');

      // Start the machine
      this.log('🚀 Starting XState machine...');
      actor.start();

      this.log('🚀 XState machine started successfully');

      // Get the document text
      const documentText = document.getText();

      this.log('📝 Processing document text with XState machine', {
        textLength: documentText.length,
        fileName: document.fileName,
        firstChars: documentText.substring(0, 100),
      });

      // Send the START_FORMATTING event to the machine
      this.log('📤 Sending START_FORMATTING event...');
      actor.send({
        type: 'START_FORMATTING',
        input: documentText,
        options,
      });

      this.log('📤 START_FORMATTING event sent successfully');

      // Get the current state and check for formatted edits
      this.log('📊 Getting machine state...');
      const currentState = actor.getSnapshot();

      this.log('📊 XState machine state', {
        state: currentState.value,
        contextKeys: Object.keys(currentState.context),
        hasFormattedEdits: currentState.context.formattedEdits?.length > 0,
        editsCount: currentState.context.formattedEdits?.length || 0,
        hasInput: !!currentState.context.input,
        inputLength: currentState.context.input?.length || 0,
      });

      // Stop the actor
      this.log('🛑 Stopping XState machine...');
      actor.stop();

      this.log('🛑 XState machine stopped');

      // Return the formatted edits
      const edits = currentState.context.formattedEdits || [];

      this.log(`✅ XState machine completed with ${edits.length} edits`);

      return edits;
    } catch (error) {
      this.log('❌ XState machine processing failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack',
        errorName: error instanceof Error ? error.name : 'Unknown',
      });
      throw error;
    }
  }
}

export class XStateRangeFormattingProvider implements vscode.DocumentRangeFormattingEditProvider {
  private formattingProvider: XStateFormattingProvider;

  constructor(outputChannel?: vscode.OutputChannel) {
    this.formattingProvider = new XStateFormattingProvider(outputChannel);
  }

  async provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    _range: vscode.Range,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    // For now, format the whole document
    return this.formattingProvider.provideDocumentFormattingEdits(document, options, token);
  }
}

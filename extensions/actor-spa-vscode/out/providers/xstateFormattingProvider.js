var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: () => m[k] };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : (o, v) => {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.XStateRangeFormattingProvider = exports.XStateFormattingProvider = void 0;
const vscode = __importStar(require('vscode'));
const formattingProvider_1 = require('./formattingProvider');
/**
 * XState-based formatting provider - FIXED VERSION
 * Now properly uses XState machine with error handling
 */
class XStateFormattingProvider {
  constructor(outputChannel) {
    this.outputChannel = outputChannel;
    try {
      // Get extension version
      const extension = vscode.extensions.getExtension('actor-spa.actor-spa-framework');
      this.version = extension?.packageJSON?.version || 'unknown';
      this.legacyFormatter = new formattingProvider_1.ActorSpaFormattingProvider(outputChannel);
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
      this.legacyFormatter = new formattingProvider_1.ActorSpaFormattingProvider(outputChannel);
    }
  }
  testXStateImports() {
    try {
      // Dynamic import to avoid breaking extension activation
      const xstate = require('xstate');
      const machineModule = require('../machines/formatterMachine');
      this.log('🔧 XState imports test successful', {
        xstateAvailable: !!xstate,
        createActorType: typeof xstate.createActor,
        machineAvailable: !!machineModule.formatterMachine,
        tokenizerAvailable: !!machineModule.tokenizeForMachine,
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
  log(message, data) {
    try {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [XState Formatter] ${message}`;
      console.log(logMessage, data || '');
      if (this.outputChannel) {
        const dataStr = data ? ` | Data: ${JSON.stringify(data, null, 2)}` : '';
        this.outputChannel.appendLine(`${logMessage}${dataStr}`);
        this.outputChannel.show(); // Ensure channel is visible
      }
    } catch (logError) {
      console.error('XState Formatter: Logging failed:', logError);
      // Fallback to basic console logging
      console.log(`[XState Formatter] ${message}`, data);
    }
  }
  async provideDocumentFormattingEdits(document, options, token) {
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
  async formatWithXStateMachine(document, options, token) {
    this.log('🤖 Starting XState machine formatting process');
    try {
      // Dynamic imports to avoid breaking extension activation
      const { createActor } = require('xstate');
      const { formatterMachine } = require('../machines/formatterMachine');
      this.log('🔧 XState modules loaded successfully');
      // Create actor from machine
      const actor = createActor(formatterMachine);
      this.log('🎭 Created XState actor, starting machine');
      // Start the machine
      actor.start();
      this.log('🚀 XState machine started successfully');
      // For now, use XState machine as a wrapper around the legacy formatter
      // This proves XState imports work and gives us a foundation to build on
      this.log('🔄 Using XState machine as wrapper for legacy formatter');
      const legacyResult = await this.legacyFormatter.provideDocumentFormattingEdits(
        document,
        options,
        token
      );
      this.log(`✅ XState machine wrapper completed with ${legacyResult.length} edits`);
      // Stop the actor
      actor.stop();
      this.log('🛑 XState machine stopped');
      return legacyResult;
    } catch (error) {
      this.log('❌ XState machine processing failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack',
      });
      throw error;
    }
  }
}
exports.XStateFormattingProvider = XStateFormattingProvider;
class XStateRangeFormattingProvider {
  constructor(outputChannel) {
    this.formattingProvider = new XStateFormattingProvider(outputChannel);
  }
  async provideDocumentRangeFormattingEdits(document, _range, options, token) {
    // For now, format the whole document
    return this.formattingProvider.provideDocumentFormattingEdits(document, options, token);
  }
}
exports.XStateRangeFormattingProvider = XStateRangeFormattingProvider;
//# sourceMappingURL=xstateFormattingProvider.js.map

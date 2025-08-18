import * as vscode from 'vscode';
import { type DebugLogger } from '../core/debugLogger';
/**
 * Actor-based formatting provider that uses XState machines for orchestration
 * This provides better error handling, race condition prevention, and performance
 */
export declare class ActorFormattingProvider implements vscode.DocumentFormattingEditProvider {
    private version;
    private debugLogger?;
    constructor(_outputChannel?: vscode.OutputChannel, debugLogger?: DebugLogger);
    private log;
    provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): Promise<vscode.TextEdit[]>;
}
/**
 * Range formatting provider that delegates to the document formatter
 */
export declare class ActorRangeFormattingProvider implements vscode.DocumentRangeFormattingEditProvider {
    private formattingProvider;
    constructor(outputChannel?: vscode.OutputChannel, debugLogger?: DebugLogger);
    provideDocumentRangeFormattingEdits(document: vscode.TextDocument, _range: vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken): Promise<vscode.TextEdit[]>;
}
/**
 * Factory function to create the appropriate formatting provider based on configuration
 */
export declare function createFormattingProvider(outputChannel?: vscode.OutputChannel, debugLogger?: DebugLogger): {
    documentProvider: vscode.DocumentFormattingEditProvider;
    rangeProvider: vscode.DocumentRangeFormattingEditProvider;
};
//# sourceMappingURL=actorFormattingProvider.d.ts.map
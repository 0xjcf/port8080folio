import * as vscode from 'vscode';
export declare class ReactiveLintProvider implements vscode.CodeActionProvider {
    private static readonly DIAGNOSTIC_COLLECTION_NAME;
    private diagnosticCollection;
    private outputChannel;
    constructor(outputChannel: vscode.OutputChannel);
    /**
     * Run reactive-lint on a file and update diagnostics
     */
    analyzeFile(document: vscode.TextDocument): Promise<void>;
    /**
     * Check if document should be analyzed
     */
    private shouldAnalyze;
    /**
     * Run reactive-lint CLI on a file
     */
    private runReactiveLint;
    /**
     * Parse reactive-lint JSON output
     */
    private parseReactiveLintOutput;
    /**
     * Parse reactive-lint plain text output
     */
    private parsePlainTextOutput;
    /**
     * Update VS Code diagnostics
     */
    private updateDiagnostics;
    /**
     * Provide code actions for reactive-lint violations
     */
    provideCodeActions(document: vscode.TextDocument, _range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, _token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]>;
    /**
     * Create quick fix action for a specific rule
     */
    private createQuickFix;
    /**
     * Create quick fix for boolean context violations
     */
    private createBooleanToStateQuickFix;
    /**
     * Create quick fix for DOM query violations
     */
    private createDomQueryQuickFix;
    /**
     * Create quick fix for timer violations
     */
    private createTimerQuickFix;
    /**
     * Create quick fix for event listener violations
     */
    private createEventListenerQuickFix;
    /**
     * Dispose resources
     */
    dispose(): void;
}
//# sourceMappingURL=reactiveLintProvider.d.ts.map
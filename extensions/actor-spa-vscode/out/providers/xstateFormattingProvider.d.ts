import * as vscode from 'vscode';
/**
 * XState-based formatting provider - FIXED VERSION
 * Now properly uses XState machine with error handling
 */
export declare class XStateFormattingProvider implements vscode.DocumentFormattingEditProvider {
    private outputChannel?;
    private legacyFormatter;
    private version;
    constructor(outputChannel?: vscode.OutputChannel | undefined);
    private testXStateImports;
    private log;
    provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): Promise<vscode.TextEdit[]>;
    private formatWithXStateMachine;
}
export declare class XStateRangeFormattingProvider implements vscode.DocumentRangeFormattingEditProvider {
    private formattingProvider;
    constructor(outputChannel?: vscode.OutputChannel);
    provideDocumentRangeFormattingEdits(document: vscode.TextDocument, _range: vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken): Promise<vscode.TextEdit[]>;
}
//# sourceMappingURL=xstateFormattingProvider.d.ts.map
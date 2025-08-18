import * as vscode from 'vscode';
/**
 * Simple, focused formatter for actor-spa template literals.
 * No actors, no state machines, no external processes - just clean formatting logic.
 */
export declare class SimpleFormattingProvider implements vscode.DocumentFormattingEditProvider, vscode.DocumentRangeFormattingEditProvider {
    private outputChannel?;
    constructor(outputChannel?: vscode.OutputChannel | undefined);
    provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, _token: vscode.CancellationToken): Promise<vscode.TextEdit[]>;
    provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions, _token: vscode.CancellationToken): Promise<vscode.TextEdit[]>;
    private findTemplates;
    private findClosingBacktick;
    private getIndentLevel;
    private formatTemplate;
    private extractExpressions;
    private restoreExpressions;
    private formatHtml;
    private formatCss;
    private applyTemplateIndentation;
}
//# sourceMappingURL=simpleFormattingProvider.d.ts.map
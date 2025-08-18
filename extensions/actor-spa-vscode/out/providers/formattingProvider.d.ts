import * as vscode from 'vscode';
export declare class ActorSpaFormattingProvider implements vscode.DocumentFormattingEditProvider {
    private outputChannel?;
    private version;
    constructor(outputChannel?: vscode.OutputChannel | undefined);
    private log;
    private logDebug;
    provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): Promise<vscode.TextEdit[]>;
    private findTemplates;
    private findTemplatesOfType;
    private isNestedTemplate;
    private findClosingBacktick;
    private getIndentLevel;
    private validateTemplateContent;
    private formatTemplate;
    private formatWithBiome;
    private simpleFormat;
    private simpleHtmlFormat;
    private tryCreateSingleLineTag;
    private simpleCssFormat;
    private extractExpressions;
    private restoreExpressions;
    private applyTemplateLiteralStyle;
}
export declare class ActorSpaRangeFormattingProvider implements vscode.DocumentRangeFormattingEditProvider {
    private formattingProvider;
    constructor(outputChannel?: vscode.OutputChannel);
    provideDocumentRangeFormattingEdits(document: vscode.TextDocument, _range: vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken): Promise<vscode.TextEdit[]>;
}
//# sourceMappingURL=formattingProvider.d.ts.map
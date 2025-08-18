import * as vscode from 'vscode';
export declare class ActorSpaCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList>;
    private isInsideHtmlTemplate;
    private getHtmlCompletions;
    private getTemplateCompletions;
    private createAttributeCompletion;
    private createExpressionCompletion;
    private createElementCompletion;
}
//# sourceMappingURL=completionProvider.d.ts.map
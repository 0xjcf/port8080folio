import * as vscode from 'vscode';
export declare class ActorSpaValidationProvider implements vscode.CodeActionProvider {
    provideCodeActions(document: vscode.TextDocument, _range: vscode.Range | vscode.Selection, _context: vscode.CodeActionContext, _token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]>;
    private validateTemplate;
}
//# sourceMappingURL=validationProvider.d.ts.map
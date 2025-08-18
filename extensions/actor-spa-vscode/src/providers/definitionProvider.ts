import type * as vscode from 'vscode';

export class ActorSpaDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(
    _document: vscode.TextDocument,
    _position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
    // Basic implementation - can be expanded later
    return [];
  }
}

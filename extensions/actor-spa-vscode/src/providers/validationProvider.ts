import * as vscode from 'vscode';

export class ActorSpaValidationProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range | vscode.Selection,
    _context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    const text = document.getText();
    const actions: vscode.CodeAction[] = [];

    // Validate html template literals
    const templateRegex = /html`([^`]*)`/g;

    let match = templateRegex.exec(text);
    while (match !== null) {
      const templateContent = match[1];
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);

      // Check for common issues
      const issues = this.validateTemplate(templateContent);

      for (const issue of issues) {
        const action = new vscode.CodeAction(
          `Fix: ${issue.message}`,
          vscode.CodeActionKind.QuickFix
        );

        action.edit = new vscode.WorkspaceEdit();
        action.edit.replace(document.uri, new vscode.Range(startPos, endPos), issue.fix);

        actions.push(action);
      }

      match = templateRegex.exec(text);
    }

    return actions;
  }

  private validateTemplate(content: string): Array<{ message: string; fix: string }> {
    const issues: Array<{ message: string; fix: string }> = [];

    // Check for missing ARIA labels on interactive elements
    if (content.includes('<button') && !content.includes('aria-label')) {
      issues.push({
        message: 'Interactive button missing aria-label',
        fix: content.replace(/<button/g, '<button aria-label="Button action"'),
      });
    }

    // Check for form inputs without labels
    if (
      content.includes('<input') &&
      !content.includes('aria-label') &&
      !content.includes('aria-labelledby')
    ) {
      issues.push({
        message: 'Input missing accessibility label',
        fix: content.replace(/<input/g, '<input aria-label="Input field"'),
      });
    }

    // Check for unescaped variables that might need raw()
    const rawHtmlPattern = /<[^>]*>\${[^}]*}<\/[^>]*>/;
    if (rawHtmlPattern.test(content)) {
      issues.push({
        message: 'Consider using raw() for HTML content',
        fix: content.replace(/\${([^}]*)}/g, (_match, capture) => `\${raw(${capture})}`),
      });
    }

    // Check for missing send events on interactive elements
    if (
      content.includes('<button') &&
      !content.includes('send=') &&
      !content.includes('data-send=')
    ) {
      issues.push({
        message: 'Interactive button should have send event',
        fix: content.replace(/<button/g, '<button send="ACTION"'),
      });
    }

    return issues;
  }
}

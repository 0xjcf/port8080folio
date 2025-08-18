import * as vscode from 'vscode';

export class ActorSpaCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const lineText = document.lineAt(position).text;
    const linePrefix = lineText.substring(0, position.character);

    // Check if we're inside an html`` template literal
    if (this.isInsideHtmlTemplate(document, position)) {
      return this.getHtmlCompletions(linePrefix, position);
    }

    // Check if we're typing 'html`'
    if (linePrefix.endsWith('html')) {
      return this.getTemplateCompletions();
    }

    return [];
  }

  private isInsideHtmlTemplate(document: vscode.TextDocument, position: vscode.Position): boolean {
    const text = document.getText();
    const offset = document.offsetAt(position);

    // Find the nearest html`` template literal
    const beforeText = text.substring(0, offset);
    const lastHtmlStart = beforeText.lastIndexOf('html`');
    const lastHtmlEnd = beforeText.lastIndexOf('`', lastHtmlStart);

    return lastHtmlStart > lastHtmlEnd;
  }

  private getHtmlCompletions(
    linePrefix: string,
    _position: vscode.Position
  ): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];

    // Framework-specific attributes
    if (linePrefix.includes('<') && !linePrefix.includes('>')) {
      completions.push(
        this.createAttributeCompletion('send', 'Event name to send', 'send="EVENT_NAME"'),
        this.createAttributeCompletion(
          'payload',
          'JSON payload for event',
          'payload=\'{"key": "value"}\''
        ),
        this.createAttributeCompletion(
          'data-send',
          'Legacy event attribute',
          'data-send="EVENT_NAME"'
        ),
        this.createAttributeCompletion(
          'data-send-payload',
          'Legacy payload attribute',
          'data-send-payload=\'{"key": "value"}\''
        ),
        this.createAttributeCompletion(
          'data-state',
          'State attribute for CSS',
          `data-state="\${state.value}"`
        ),
        this.createAttributeCompletion(
          'aria-label',
          'Accessibility label',
          'aria-label="Description"'
        ),
        this.createAttributeCompletion(
          'aria-pressed',
          'Button pressed state',
          `aria-pressed="\${state.context.pressed}"`
        ),
        this.createAttributeCompletion('role', 'ARIA role', 'role="button"')
      );
    }

    // Template expressions
    if (linePrefix.includes('${')) {
      completions.push(
        this.createExpressionCompletion('state.context', 'Access state context', 'state.context.'),
        this.createExpressionCompletion(
          'state.matches',
          'Check state value',
          "state.matches('stateName')"
        ),
        this.createExpressionCompletion('state.value', 'Current state value', 'state.value')
        // Note: raw() and each() functions have been removed
        // Use native JavaScript: items.map() instead of each()
        // Use html`` templates or direct HTML instead of raw()
      );
    }

    // HTML elements
    completions.push(
      this.createElementCompletion(
        'button',
        'Button with send event',
        '<button send="EVENT_NAME">Text</button>'
      ),
      this.createElementCompletion(
        'form',
        'Form with send event',
        '<form send="SUBMIT_EVENT">\n  <input name="field" />\n  <button type="submit">Submit</button>\n</form>'
      ),
      this.createElementCompletion(
        'div',
        'Div with state attribute',
        `<div data-state="\${state.value}">Content</div>`
      ),
      this.createElementCompletion(
        'input',
        'Input with binding',
        `<input name="field" value="\${state.context.value}" />`
      ),
      this.createElementCompletion(
        'ul',
        'List with native map',
        '<ul>\\n  $${items.map(item => html`<li>$${item}</li>`)}\\n</ul>'
      )
    );

    return completions;
  }

  private getTemplateCompletions(): vscode.CompletionItem[] {
    const templateCompletion = new vscode.CompletionItem(
      'html template',
      vscode.CompletionItemKind.Snippet
    );
    templateCompletion.insertText = new vscode.SnippetString('html`\n  <div>\n    $0\n  </div>\n`');
    templateCompletion.documentation = new vscode.MarkdownString(
      'Create an Actor-SPA HTML template literal'
    );
    templateCompletion.detail = 'Actor-SPA template literal';

    return [templateCompletion];
  }

  private createAttributeCompletion(
    name: string,
    description: string,
    snippet: string
  ): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(name, vscode.CompletionItemKind.Property);
    completion.insertText = new vscode.SnippetString(snippet);
    completion.documentation = new vscode.MarkdownString(description);
    completion.detail = 'Actor-SPA Framework Attribute';
    return completion;
  }

  private createExpressionCompletion(
    name: string,
    description: string,
    snippet: string
  ): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
    completion.insertText = new vscode.SnippetString(snippet);
    completion.documentation = new vscode.MarkdownString(description);
    completion.detail = 'Actor-SPA Framework Expression';
    return completion;
  }

  private createElementCompletion(
    name: string,
    description: string,
    snippet: string
  ): vscode.CompletionItem {
    const completion = new vscode.CompletionItem(name, vscode.CompletionItemKind.Snippet);
    completion.insertText = new vscode.SnippetString(snippet);
    completion.documentation = new vscode.MarkdownString(description);
    completion.detail = 'Actor-SPA Framework Element';
    return completion;
  }
}

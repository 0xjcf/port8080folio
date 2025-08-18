var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: () => m[k] };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : (o, v) => {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActorSpaCompletionProvider = void 0;
const vscode = __importStar(require('vscode'));
class ActorSpaCompletionProvider {
  provideCompletionItems(document, position, _token, _context) {
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
  isInsideHtmlTemplate(document, position) {
    const text = document.getText();
    const offset = document.offsetAt(position);
    // Find the nearest html`` template literal
    const beforeText = text.substring(0, offset);
    const lastHtmlStart = beforeText.lastIndexOf('html`');
    const lastHtmlEnd = beforeText.lastIndexOf('`', lastHtmlStart);
    return lastHtmlStart > lastHtmlEnd;
  }
  getHtmlCompletions(linePrefix, _position) {
    const completions = [];
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
          'data-state="${state.value}"'
        ),
        this.createAttributeCompletion(
          'aria-label',
          'Accessibility label',
          'aria-label="Description"'
        ),
        this.createAttributeCompletion(
          'aria-pressed',
          'Button pressed state',
          'aria-pressed="${state.context.pressed}"'
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
        this.createExpressionCompletion('state.value', 'Current state value', 'state.value'),
        this.createExpressionCompletion(
          'each',
          'Iterate over array',
          'each(items, (item, index) => html`<li>${item}</li>`)'
        ),
        this.createExpressionCompletion('raw', 'Insert raw HTML', 'raw(htmlString)')
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
        '<div data-state="${state.value}">Content</div>'
      ),
      this.createElementCompletion(
        'input',
        'Input with binding',
        '<input name="field" value="${state.context.value}" />'
      ),
      this.createElementCompletion(
        'ul',
        'List with each helper',
        '<ul>\n  ${each(items, (item) => html`<li>${item}</li>`)}\n</ul>'
      )
    );
    return completions;
  }
  getTemplateCompletions() {
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
  createAttributeCompletion(name, description, snippet) {
    const completion = new vscode.CompletionItem(name, vscode.CompletionItemKind.Property);
    completion.insertText = new vscode.SnippetString(snippet);
    completion.documentation = new vscode.MarkdownString(description);
    completion.detail = 'Actor-SPA Framework Attribute';
    return completion;
  }
  createExpressionCompletion(name, description, snippet) {
    const completion = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
    completion.insertText = new vscode.SnippetString(snippet);
    completion.documentation = new vscode.MarkdownString(description);
    completion.detail = 'Actor-SPA Framework Expression';
    return completion;
  }
  createElementCompletion(name, description, snippet) {
    const completion = new vscode.CompletionItem(name, vscode.CompletionItemKind.Snippet);
    completion.insertText = new vscode.SnippetString(snippet);
    completion.documentation = new vscode.MarkdownString(description);
    completion.detail = 'Actor-SPA Framework Element';
    return completion;
  }
}
exports.ActorSpaCompletionProvider = ActorSpaCompletionProvider;
//# sourceMappingURL=completionProvider.js.map

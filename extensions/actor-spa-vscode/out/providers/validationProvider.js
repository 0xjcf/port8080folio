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
exports.ActorSpaValidationProvider = void 0;
const vscode = __importStar(require('vscode'));
class ActorSpaValidationProvider {
  provideCodeActions(document, _range, _context, _token) {
    const text = document.getText();
    const actions = [];
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
  validateTemplate(content) {
    const issues = [];
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
        fix: content.replace(/\${([^}]*)}/g, '${raw($1)}'),
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
exports.ActorSpaValidationProvider = ActorSpaValidationProvider;
//# sourceMappingURL=validationProvider.js.map

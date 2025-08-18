import * as vscode from 'vscode';

interface TemplateInfo {
  range: vscode.Range;
  content: string;
  language: 'html' | 'css';
  indentLevel: number;
}

interface Expression {
  placeholder: string;
  content: string;
}

/**
 * Simple, focused formatter for actor-spa template literals.
 * No actors, no state machines, no external processes - just clean formatting logic.
 */
export class SimpleFormattingProvider
  implements vscode.DocumentFormattingEditProvider, vscode.DocumentRangeFormattingEditProvider
{
  constructor(private outputChannel?: vscode.OutputChannel) {}

  async provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    _token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    const templates = this.findTemplates(document);
    const edits: vscode.TextEdit[] = [];

    for (const template of templates) {
      const formatted = this.formatTemplate(template, options);
      if (formatted !== template.content) {
        edits.push(vscode.TextEdit.replace(template.range, formatted));
      }
    }

    return edits;
  }

  async provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    range: vscode.Range,
    options: vscode.FormattingOptions,
    _token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    // For template literals, we format the whole template if the range intersects
    const templates = this.findTemplates(document);
    const edits: vscode.TextEdit[] = [];

    for (const template of templates) {
      // Check if the template intersects with the requested range
      if (range.intersection(template.range)) {
        const formatted = this.formatTemplate(template, options);
        if (formatted !== template.content) {
          edits.push(vscode.TextEdit.replace(template.range, formatted));
        }
      }
    }

    return edits;
  }

  private findTemplates(document: vscode.TextDocument): TemplateInfo[] {
    const templates: TemplateInfo[] = [];
    const text = document.getText();

    // Find both html`` and css`` templates
    const regex = /\b(html|css)\s*`/g;
    let match: RegExpExecArray | null;

    // Restructure to avoid assignment in expression
    match = regex.exec(text);
    while (match !== null) {
      const language = match[1] as 'html' | 'css';
      const tagStart = match.index;
      const contentStart = tagStart + match[0].length;

      // Find closing backtick (handling nested template literals)
      const contentEnd = this.findClosingBacktick(text, contentStart);
      if (contentEnd === -1) {
        match = regex.exec(text);
        continue;
      }

      const content = text.slice(contentStart, contentEnd);
      const startPos = document.positionAt(contentStart);
      const endPos = document.positionAt(contentEnd);
      const indentLevel = this.getIndentLevel(document, startPos.line);

      templates.push({
        range: new vscode.Range(startPos, endPos),
        content,
        language,
        indentLevel,
      });

      match = regex.exec(text);
    }

    return templates;
  }

  private findClosingBacktick(text: string, start: number): number {
    let depth = 1;
    let i = start;

    while (i < text.length && depth > 0) {
      if (text[i] === '\\') {
        i += 2; // Skip escaped character
        continue;
      }

      if (text[i] === '`') {
        // Check if it's a template literal start (e.g., html` or css`)
        const before = text.slice(Math.max(0, i - 10), i);
        if (/\b(html|css)\s*$/.test(before)) {
          depth++;
        } else {
          depth--;
        }
      }

      i++;
    }

    return depth === 0 ? i - 1 : -1;
  }

  private getIndentLevel(document: vscode.TextDocument, line: number): number {
    const lineText = document.lineAt(line).text;
    const match = lineText.match(/^(\s*)/);
    return match ? Math.floor(match[1].length / 2) : 0;
  }

  private formatTemplate(template: TemplateInfo, options: vscode.FormattingOptions): string {
    const { content, language, indentLevel } = template;

    if (!content.trim()) return content;

    // Extract expressions to preserve them
    const { cleanContent, expressions } = this.extractExpressions(content);

    // Format based on language
    const formatted =
      language === 'html' ? this.formatHtml(cleanContent) : this.formatCss(cleanContent);

    // Restore expressions
    const withExpressions = this.restoreExpressions(formatted, expressions);

    // Apply template literal indentation
    return this.applyTemplateIndentation(withExpressions, indentLevel, options);
  }

  private extractExpressions(content: string): { cleanContent: string; expressions: Expression[] } {
    const expressions: Expression[] = [];
    let cleanContent = content;
    let exprIndex = 0;

    // Replace ${...} with placeholders
    cleanContent = cleanContent.replace(/\$\{[^}]*\}/g, (match) => {
      const placeholder = `__EXPR_${exprIndex++}__`;
      expressions.push({ placeholder, content: match });
      return placeholder;
    });

    return { cleanContent, expressions };
  }

  private restoreExpressions(content: string, expressions: Expression[]): string {
    let result = content;
    for (const expr of expressions) {
      result = result.replace(expr.placeholder, expr.content);
    }
    return result;
  }

  private formatHtml(content: string): string {
    // Simple HTML formatting that preserves structure
    return content
      .replace(/>\s*</g, '>\n<') // Add newlines between tags
      .replace(/(<[^>]+>)\s*([^<\s][^<]*?)\s*(<\/[^>]+>)/g, '$1$2$3') // Keep simple elements on one line
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, index, lines) => {
        // Calculate indentation based on tag nesting
        let indent = 0;
        for (let i = 0; i < index; i++) {
          if (lines[i].match(/<[^/][^>]*[^/]>/) && !lines[i].match(/<[^>]*\/>/)) {
            indent++;
          }
          if (lines[i].match(/<\/[^>]+>/)) {
            indent--;
          }
        }
        if (line.match(/<\/[^>]+>/)) {
          indent--;
        }
        return '  '.repeat(Math.max(0, indent)) + line;
      })
      .join('\n');
  }

  private formatCss(content: string): string {
    // Simple CSS formatting
    return content
      .replace(/;\s*/g, ';\n') // Newline after semicolons
      .replace(/\{\s*/g, ' {\n') // Newline after opening braces
      .replace(/\}\s*/g, '\n}\n') // Newlines around closing braces
      .replace(/,\s*/g, ',\n') // Newline after commas in selectors
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, index, lines) => {
        // Calculate indentation
        let indent = 0;
        for (let i = 0; i < index; i++) {
          if (lines[i].includes('{')) indent++;
          if (lines[i].includes('}')) indent--;
        }
        if (line === '}') indent--;
        return '  '.repeat(Math.max(0, indent)) + line;
      })
      .join('\n');
  }

  private applyTemplateIndentation(
    content: string,
    baseIndent: number,
    options: vscode.FormattingOptions
  ): string {
    if (!content.trim()) return content;

    const indent = options.insertSpaces
      ? ' '.repeat(options.tabSize * (baseIndent + 1))
      : '\t'.repeat(baseIndent + 1);

    const lines = content.split('\n');
    const indentedLines = lines.map((line) => (line.trim() ? indent + line : ''));

    const baseIndentStr = options.insertSpaces
      ? ' '.repeat(options.tabSize * baseIndent)
      : '\t'.repeat(baseIndent);

    return `\n${indentedLines.join('\n')}\n${baseIndentStr}`;
  }
}

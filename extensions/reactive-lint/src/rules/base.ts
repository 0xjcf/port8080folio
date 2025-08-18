import type {
  AnyRuleConfig,
  BaseRuleInterface,
  Position,
  RuleContext,
  Severity,
  TsMorphNode,
  TsSourceFile,
  Violation,
} from '../types.js';

/**
 * Base Rule class
 * All linting rules should extend this class
 */
export abstract class Rule implements BaseRuleInterface {
  protected config: AnyRuleConfig;
  protected severity: Severity;
  protected message: string;
  protected autofix: boolean;

  constructor(config: AnyRuleConfig = {}) {
    this.config = config;
    this.severity = config.severity || 'error';
    this.message = config.message || 'Rule violation detected';
    this.autofix = config.autofix !== false;
  }

  /**
   * Abstract method to check for violations
   */
  abstract check(
    sourceFile: TsSourceFile,
    content: string,
    context: RuleContext
  ): Promise<Violation[]>;

  /**
   * Create a violation object
   */
  createViolation(options: Partial<Violation>): Violation {
    // Use a simpler approach since we can't import the function as a type
    return {
      ruleId: options.ruleId || 'unknown',
      message: options.message || this.message,
      severity: options.severity || this.severity,
      file: options.file || '',
      line: options.line || 0,
      column: options.column || 0,
      endLine: options.endLine,
      endColumn: options.endColumn,
      source: options.source || '',
      fix: options.fix || null,
      suggestions: options.suggestions || [],
      timestamp: Date.now(),
    };
  }

  /**
   * Get text position from node
   */
  getNodePosition(node: TsMorphNode): Position {
    const start = node.getStart();
    const text = node.getText();

    // Calculate line and column from position
    const startLineNumber = node.getStartLineNumber();
    const startLinePos = node.getStartLinePos();
    const startColumn = start - startLinePos + 1;

    // Calculate end position
    const lines = text.split('\n');
    const endLineNumber = startLineNumber + lines.length - 1;
    const endColumn =
      lines.length === 1 ? startColumn + text.length : lines[lines.length - 1].length + 1;

    return {
      line: startLineNumber,
      column: startColumn,
      endLine: endLineNumber,
      endColumn,
      source: text,
    };
  }

  /**
   * Get source context around a line
   */
  getSourceContext(sourceFile: TsSourceFile, line: number, contextLines = 2): string {
    try {
      const fullText = sourceFile.getFullText();
      const lines = fullText.split('\n');

      const startLine = Math.max(0, line - contextLines - 1);
      const endLine = Math.min(lines.length - 1, line + contextLines - 1);

      return lines.slice(startLine, endLine + 1).join('\n');
    } catch {
      return '';
    }
  }

  /**
   * Format TODO comment with reactive-lint signature
   */
  protected formatTodo(message: string): string {
    return `/* TODO [reactive-lint]: ${message} */`;
  }
}

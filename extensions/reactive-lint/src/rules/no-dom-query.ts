import { SyntaxKind } from 'ts-morph';
import type { AnyRuleConfig, RuleContext, TsMorphNode, TsSourceFile, Violation } from '../types.js';
import { Rule } from './base.js';

/**
 * Rule: no-dom-query
 * Detects direct DOM queries that should be replaced with reactive refs
 */
export class NoDOMQuery extends Rule {
  constructor(config: AnyRuleConfig = {}) {
    super({
      ...config,
      message: config.message || 'Use reactive refs instead of DOM queries',
      autofix: config.autofix !== false,
    });
  }

  async check(
    sourceFile: TsSourceFile,
    _content: string,
    context: RuleContext
  ): Promise<Violation[]> {
    const violations: Violation[] = [];

    // Find all call expressions
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const callExpression of callExpressions) {
      const expression = callExpression.getExpression();

      // Check for property access expressions (e.g., document.querySelector)
      if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
        const propertyAccess = expression.asKind(SyntaxKind.PropertyAccessExpression);
        if (!propertyAccess) continue;

        const propertyName = propertyAccess.getName();

        // Check for DOM query methods
        if (this.isDOMQueryMethod(propertyName)) {
          const objectExpression = propertyAccess.getExpression();
          const objectText = objectExpression.getText();

          // Check if it's a DOM query (document.*, element.*, etc.)
          if (this.isDOMObject(objectText) || this.seemsLikeElement(objectText)) {
            const position = this.getNodePosition(callExpression);
            const sourceContext = this.getSourceContext(sourceFile, position.line);

            violations.push(
              this.createViolation({
                ruleId: 'no-dom-query',
                file: context.file,
                line: position.line,
                column: position.column,
                endLine: position.endLine,
                endColumn: position.endColumn,
                source: sourceContext,
                fix: this.autofix ? this.generateFix(callExpression) : null,
              })
            );
          }
        }
      }
    }

    return violations;
  }

  /**
   * Check if method name is a DOM query method
   */
  private isDOMQueryMethod(methodName: string): boolean {
    const queryMethods = [
      'querySelector',
      'querySelectorAll',
      'getElementById',
      'getElementsByClassName',
      'getElementsByTagName',
      'getElementsByName',
    ];

    return queryMethods.includes(methodName);
  }

  /**
   * Check if object appears to be a DOM object
   */
  private isDOMObject(objectText: string): boolean {
    const domObjects = ['document', 'window.document', 'this.document', 'globalThis.document'];

    return domObjects.includes(objectText);
  }

  /**
   * Check if object seems like an element
   */
  private seemsLikeElement(objectText: string): boolean {
    // Look for common element variable patterns
    const elementPatterns = [
      /^element$/i,
      /^el$/i,
      /^node$/i,
      /^target$/i,
      /^container$/i,
      /Element$/,
      /^this\..*Element$/,
      /^.*\.element$/i,
      /^.*\.node$/i,
    ];

    return elementPatterns.some((pattern) => pattern.test(objectText));
  }

  /**
   * Generate a fix suggestion
   */
  private generateFix(
    callExpression: TsMorphNode
  ): { range: [number, number]; text: string } | null {
    if (!this.autofix) return null;

    try {
      const args = (
        callExpression as unknown as { getArguments?: () => unknown[] }
      ).getArguments?.();
      const methodName =
        (callExpression as unknown as { getExpression?: () => { getName?: () => string } })
          .getExpression?.()
          ?.getName?.() || 'querySelector';

      if (args && args.length > 0) {
        const selector = (args[0] as { getText?: () => string }).getText?.();

        if (methodName === 'querySelector' || methodName === 'querySelectorAll') {
          return {
            range: [callExpression.getStart(), callExpression.getEnd()],
            text: this.formatTodo(`Use reactive ref instead of querySelector(${selector})`),
          };
        }

        if (selector && methodName === 'getElementById') {
          const id = selector.replace(/['"]/g, '');
          return {
            range: [callExpression.getStart(), callExpression.getEnd()],
            text: this.formatTodo(`Use reactive ref for element with id="${id}"`),
          };
        }
      }
    } catch {
      // If we can't analyze the call, provide a generic suggestion
    }

    return {
      range: [callExpression.getStart(), callExpression.getEnd()],
      text: this.formatTodo('Replace with reactive ref'),
    };
  }
}

export default NoDOMQuery;

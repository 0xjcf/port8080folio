import { SyntaxKind } from 'ts-morph';
import type { AnyRuleConfig, RuleContext, TsSourceFile, Violation } from '../types.js';
import { Rule } from './base.js';

/**
 * Rule: no-event-listeners
 * Detects direct addEventListener usage and suggests state machine event mapping
 * ✅ FRAMEWORK-AWARE: Respects Actor-SPA framework exceptions
 */
export class NoEventListeners extends Rule {
  private frameworkExceptions: string[] = [];

  constructor(config: AnyRuleConfig = {}) {
    super({
      ...config,
      message:
        config.message ||
        'Use declarative event mapping through state machines instead of addEventListener',
      autofix: false, // Complex transformation, autofix disabled
    });

    // ✅ FRAMEWORK: Load exceptions from config
    this.frameworkExceptions = config.exceptions || [];
  }

  async check(
    sourceFile: TsSourceFile,
    _content: string,
    context: RuleContext
  ): Promise<Violation[]> {
    const violations: Violation[] = [];

    // Find all call expressions for addEventListener/removeEventListener
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const callExpression of callExpressions) {
      const expression = callExpression.getExpression();

      if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
        const propertyAccess = expression.asKind(SyntaxKind.PropertyAccessExpression);
        if (!propertyAccess) continue;

        const methodName = propertyAccess.getName();

        if (['addEventListener', 'removeEventListener'].includes(methodName)) {
          // ✅ FRAMEWORK CHECK: Skip if this matches framework exceptions
          const callText = callExpression.getText();
          if (this.isFrameworkException(callText)) {
            continue; // Skip this violation - it's a framework-sanctioned pattern
          }

          const position = this.getNodePosition(callExpression);
          const sourceContext = this.getSourceContext(sourceFile, position.line);

          violations.push(
            this.createViolation({
              ruleId: 'no-event-listeners',
              file: context.file,
              line: position.line,
              column: position.column,
              endLine: position.endLine,
              endColumn: position.endColumn,
              source: sourceContext,
              message: this.getSpecificMessage(methodName),
              fix: this.generatePrimaryFix(methodName, callExpression),
              suggestions: this.generateSuggestions(methodName, callExpression),
            })
          );
        }
      }
    }

    return violations;
  }

  /**
   * ✅ FRAMEWORK: Check if a pattern matches framework exceptions
   */
  private isFrameworkException(text: string): boolean {
    return this.frameworkExceptions.some((pattern) => {
      try {
        // Handle regex patterns
        if (pattern.includes('\\')) {
          const regex = new RegExp(pattern);
          return regex.test(text);
        }

        // Handle simple string patterns
        return text.includes(pattern);
      } catch {
        // If regex is invalid, fall back to string matching
        return text.includes(pattern);
      }
    });
  }

  /**
   * Get specific message based on the event listener method
   */
  private getSpecificMessage(methodName: string): string {
    switch (methodName) {
      case 'addEventListener':
        return 'Use declarative event mapping through state machines instead of addEventListener';
      case 'removeEventListener':
        return 'Use declarative event handling instead of manual listener management';
      default:
        return 'Use declarative event mapping through state machines';
    }
  }

  /**
   * Generate a primary fix for event listener usage
   */
  private generatePrimaryFix(
    methodName: string,
    callExpression: import('ts-morph').CallExpression
  ): { range: [number, number]; text: string } | null {
    const start = callExpression.getStart();
    const end = callExpression.getEnd();

    // Try to extract event type from arguments
    const args = callExpression.getArguments();
    let eventType = 'EVENT_NAME';

    if (args.length > 0) {
      const firstArg = args[0];
      const argText = firstArg.getText();
      // Remove quotes from string literal
      if (argText.startsWith('"') || argText.startsWith("'")) {
        eventType = argText.slice(1, -1);
      }
    }

    const actionName = this.convertEventToAction(eventType);

    if (methodName === 'addEventListener') {
      return {
        range: [start, end] as [number, number],
        text: this.formatTodo(
          `Use send="${actionName}" attribute in template instead of addEventListener('${eventType}')`
        ),
      };
    }

    return {
      range: [start, end] as [number, number],
      text: this.formatTodo(`Replace ${methodName} with declarative event handling`),
    };
  }

  /**
   * Generate suggestions for fixing event listener usage
   */
  private generateSuggestions(
    methodName: string,
    callExpression: import('ts-morph').CallExpression
  ): Array<{ desc: string; fix: { range: [number, number]; text: string } }> {
    const suggestions = [];
    const start = callExpression.getStart();
    const end = callExpression.getEnd();

    // Try to extract event type from arguments
    const args = callExpression.getArguments();
    let eventType = 'EVENT_NAME';

    if (args.length > 0) {
      const firstArg = args[0];
      const argText = firstArg.getText();
      // Remove quotes from string literal
      if (argText.startsWith('"') || argText.startsWith("'")) {
        eventType = argText.slice(1, -1);
      }
    }

    const actionName = this.convertEventToAction(eventType);

    if (methodName === 'addEventListener') {
      // Note: Removed redundant first suggestion that duplicates primary fix

      suggestions.push({
        desc: 'Use GlobalEventDelegation for global event handling',
        fix: {
          range: [start, end] as [number, number],
          text: this.formatTodo(
            `Use globalEventDelegation.subscribe${this.capitalizeFirst(eventType)}() for global events`
          ),
        },
      });
    }

    suggestions.push({
      desc: 'Use XState state machine event handling',
      fix: {
        range: [start, end] as [number, number],
        text: this.formatTodo(`Define ${actionName} in machine events and use send() method`),
      },
    });

    // Remove the generic suggestion as it's too similar to primary fix

    return suggestions;
  }

  /**
   * Convert event type to action name
   */
  private convertEventToAction(eventType: string): string {
    const eventToAction: Record<string, string> = {
      click: 'CLICK',
      submit: 'SUBMIT',
      change: 'CHANGE',
      input: 'INPUT',
      focus: 'FOCUS',
      blur: 'BLUR',
      keydown: 'KEY_DOWN',
      keyup: 'KEY_UP',
      mouseenter: 'MOUSE_ENTER',
      mouseleave: 'MOUSE_LEAVE',
      resize: 'RESIZE',
      scroll: 'SCROLL',
      load: 'LOAD',
      error: 'ERROR',
    };

    return (
      eventToAction[eventType.toLowerCase()] || eventType.toUpperCase().replace(/[^A-Z0-9]/g, '_')
    );
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default NoEventListeners;

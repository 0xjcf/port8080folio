import { SyntaxKind } from 'ts-morph';
import type { AnyRuleConfig, RuleContext, TsSourceFile, Violation } from '../types.js';
import { Rule } from './base.js';

/**
 * Rule: no-dom-manipulation
 * Detects direct DOM manipulation and suggests template-based reactive patterns
 * ✅ FRAMEWORK-AWARE: Respects Actor-SPA framework exceptions
 */
export class NoDomManipulation extends Rule {
  private frameworkExceptions: string[] = [];

  private readonly DOM_MANIPULATION_METHODS = [
    // Direct content manipulation
    'innerHTML',
    'innerText',
    'textContent',
    'outerHTML',

    // Attribute manipulation
    'setAttribute',
    'getAttribute',
    'removeAttribute',
    'hasAttribute',
    'toggleAttribute',

    // Class manipulation
    'classList',
    'className',

    // Style manipulation
    'style',

    // DOM structure manipulation
    'appendChild',
    'removeChild',
    'insertBefore',
    'insertAfter',
    'replaceChild',
    'replaceWith',
    'append',
    'prepend',
    'insertAdjacentHTML',
    'insertAdjacentElement',
    'insertAdjacentText',

    // Element creation and modification
    'createElement',
    'createTextNode',
    'createDocumentFragment',
    'cloneNode',

    // Event manipulation (should use declarative send attributes)
    'addEventListener',
    'removeEventListener',
    'dispatchEvent',
  ];

  private readonly DOM_PROPERTIES = [
    'innerHTML',
    'innerText',
    'textContent',
    'outerHTML',
    'className',
    'id',
    'value',
    'checked',
    'selected',
    'disabled',
    'hidden',
    'src',
    'href',
    'title',
    'alt',
  ];

  constructor(config: AnyRuleConfig = {}) {
    super({
      ...config,
      message:
        config.message ||
        'Use template functions and reactive state updates instead of direct DOM manipulation',
      autofix: true,
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

    // Check for DOM manipulation patterns
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    const propertyAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);

    // Check dispatchEvent calls
    for (const callExpression of callExpressions) {
      const expression = callExpression.getExpression();

      if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
        const propertyAccess = expression.asKind(SyntaxKind.PropertyAccessExpression);
        if (!propertyAccess) continue;

        const methodName = propertyAccess.getName();

        if (['dispatchEvent'].includes(methodName)) {
          // ✅ FRAMEWORK CHECK: Skip if this matches framework exceptions
          const callText = callExpression.getText();
          if (this.isFrameworkException(callText)) {
            continue; // Skip this violation - it's a framework-sanctioned pattern
          }

          const position = this.getNodePosition(callExpression);
          const sourceContext = this.getSourceContext(sourceFile, position.line);

          violations.push(
            this.createViolation({
              ruleId: 'no-dom-manipulation',
              file: context.file,
              line: position.line,
              column: position.column,
              endLine: position.endLine,
              endColumn: position.endColumn,
              source: sourceContext,
              message: `Avoid direct DOM manipulation of '${methodName}'. Use template functions instead.`,
              fix: null,
              suggestions: this.generateDomManipulationSuggestions(methodName, callExpression),
            })
          );
        }
      }
    }

    // Find all property access expressions (obj.prop)
    for (const propertyAccess of propertyAccesses) {
      const propertyName = propertyAccess.getName();

      // Check if this is a DOM manipulation method/property
      if (this.isDOMManipulation(propertyName, propertyAccess)) {
        const position = this.getNodePosition(propertyAccess);
        const sourceContext = this.getSourceContext(sourceFile, position.line);

        violations.push(
          this.createViolation({
            ruleId: 'no-dom-manipulation',
            file: context.file,
            line: position.line,
            column: position.column,
            endLine: position.endLine,
            endColumn: position.endColumn,
            source: sourceContext,
            message: this.getSpecificMessage(propertyName),
            fix: this.generatePrimaryFix(propertyName, propertyAccess),
            suggestions: this.generateSuggestions(propertyName, propertyAccess),
          })
        );
      }
    }

    return violations;
  }

  /**
   * Check if property access is DOM manipulation
   */
  private isDOMManipulation(
    propertyName: string,
    propertyAccess: import('ts-morph').PropertyAccessExpression
  ): boolean {
    // ✅ FRAMEWORK CHECK: Skip if this matches framework exceptions
    const propertyText = propertyAccess.getText();
    if (this.isFrameworkException(propertyText)) {
      return false; // Skip this - it's a framework-sanctioned pattern
    }

    // Check if it's a known DOM manipulation property
    if (
      this.DOM_MANIPULATION_METHODS.includes(propertyName) ||
      this.DOM_PROPERTIES.includes(propertyName)
    ) {
      // Try to determine if this is being called on a DOM element
      const expression = propertyAccess.getExpression();
      const expressionText = expression.getText();

      // Common DOM element access patterns
      const domPatterns = [
        /^document\./,
        /^window\./,
        /\.querySelector/,
        /\.getElementById/,
        /\.getElementsBy/,
        /\.closest/,
        /\.parentNode/,
        /\.parentElement/,
        /\.children/,
        /\.firstChild/,
        /\.lastChild/,
        /\.nextSibling/,
        /\.previousSibling/,
        /^this\.\$el/, // Vue-style element reference
        /^this\.el/, // Common element reference
        /^this\.element/,
        /element$/, // Variables ending with 'element'
        /node$/, // Variables ending with 'node'
        /^el[A-Z]/, // Variables starting with 'el' (elButton, elForm)
        /^btn[A-Z]/, // Button references
        /^input[A-Z]/, // Input references
        /^form[A-Z]/, // Form references
      ];

      return domPatterns.some((pattern) => pattern.test(expressionText));
    }

    return false;
  }

  /**
   * Get specific message based on the type of DOM manipulation
   */
  private getSpecificMessage(methodOrProperty: string): string {
    const messages: Record<string, string> = {
      innerHTML: 'Use html template literals instead of innerHTML manipulation',
      innerText: 'Use template functions with reactive state instead of innerText',
      textContent: 'Use template functions with reactive state instead of textContent',
      setAttribute: 'Use template attributes instead of setAttribute()',
      getAttribute: 'Access data through component state instead of getAttribute()',
      classList: 'Use conditional CSS classes in templates instead of classList manipulation',
      className: 'Use conditional CSS classes in templates instead of className manipulation',
      style: 'Use CSS classes and data-state attributes instead of direct style manipulation',
      appendChild: 'Use template rendering instead of appendChild()',
      removeChild: 'Use conditional template rendering instead of removeChild()',
      createElement: 'Use html template literals instead of createElement()',
      addEventListener: 'Use send attributes for declarative event handling',
      removeEventListener: 'Use declarative event handling instead of manual listener management',
    };

    return (
      messages[methodOrProperty] ||
      `Avoid direct DOM manipulation of '${methodOrProperty}'. Use template functions instead.`
    );
  }

  /**
   * Generate an actionable fix for common DOM manipulation patterns
   */
  private generatePrimaryFix(
    methodOrProperty: string,
    node: import('ts-morph').Node
  ): { range: [number, number]; text: string } | null {
    const start = node.getStart();
    const end = node.getEnd();
    const nodeText = node.getText();

    // For simple cases, provide direct replacements
    switch (methodOrProperty) {
      case 'innerHTML':
        // Replace element.innerHTML = 'content' with template approach
        if (nodeText.includes('=')) {
          return {
            range: [start, end] as [number, number],
            text: this.formatTodo('Use html template literals instead of innerHTML'),
          };
        }
        break;

      case 'addEventListener':
        // Replace addEventListener with send attribute comment
        return {
          range: [start, end] as [number, number],
          text: this.formatTodo('Use send="EVENT_NAME" attribute in template'),
        };

      case 'setAttribute':
        // Replace setAttribute with template attribute comment
        return {
          range: [start, end] as [number, number],
          text: this.formatTodo('Use template attributes like <div attr=#{state.value}>'),
        };

      case 'querySelector':
      case 'getElementById':
        // Replace DOM queries with reactive refs comment
        return {
          range: [start, end] as [number, number],
          text: this.formatTodo('Use reactive refs instead of DOM queries'),
        };
    }

    return null;
  }

  /**
   * Generate suggestions for fixing the violation
   */
  private generateSuggestions(
    methodOrProperty: string,
    node?: import('ts-morph').Node
  ): Array<{ desc: string; fix: { range: [number, number]; text: string } }> {
    const suggestions = [];

    // If we have a node, calculate real ranges
    const start = node?.getStart() || 0;
    const end = node?.getEnd() || 0;

    // Specific suggestions based on the method/property
    switch (methodOrProperty) {
      case 'innerHTML':
      case 'innerText':
      case 'textContent':
        suggestions.push({
          desc: 'Use html template literals with reactive state',
          fix: {
            range: [start, end] as [number, number],
            text: this.formatTodo('Replace with template: html`<div>#{state.content}</div>`'),
          },
        });
        break;

      case 'setAttribute':
      case 'getAttribute':
        suggestions.push({
          desc: 'Use template attributes with reactive data',
          fix: {
            range: [start, end] as [number, number],
            text: this.formatTodo('Use template attributes: html`<div attr=#{state.value}>`'),
          },
        });
        break;

      case 'classList':
      case 'className':
        suggestions.push({
          desc: 'Use conditional CSS classes in templates',
          fix: {
            range: [start, end] as [number, number],
            text: this.formatTodo(
              'Use template classes: html`<div class=#{state.active ? "active" : ""}>`'
            ),
          },
        });
        break;

      case 'appendChild':
      case 'removeChild':
        suggestions.push({
          desc: 'Use conditional template rendering',
          fix: {
            range: [start, end] as [number, number],
            text: this.formatTodo(
              'Use conditional templates: #{state.showElement && html`<div>content</div>`}'
            ),
          },
        });
        break;

      case 'addEventListener':
        suggestions.push({
          desc: 'Use send attributes for event handling',
          fix: {
            range: [start, end] as [number, number],
            text: this.formatTodo('Use declarative events: html`<button send="CLICK_ACTION">`'),
          },
        });
        break;

      default:
        suggestions.push({
          desc: 'Replace with template-based reactive approach',
          fix: {
            range: [start, end] as [number, number],
            text: this.formatTodo('Use template functions with state management'),
          },
        });
    }

    // General Actor-SPA framework suggestion
    suggestions.push({
      desc: 'Follow Actor-SPA framework patterns for reactive UI updates',
      fix: {
        range: [start, end] as [number, number],
        text: this.formatTodo('Use machine state and template functions for reactive updates'),
      },
    });

    return suggestions;
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
   * Generate specific suggestions for DOM manipulation violations.
   * This method is called for 'dispatchEvent' violations.
   */
  private generateDomManipulationSuggestions(
    methodName: string,
    node: import('ts-morph').CallExpression
  ): Array<{ desc: string; fix: { range: [number, number]; text: string } }> {
    const suggestions = [];
    const start = node.getStart();
    const end = node.getEnd();

    switch (methodName) {
      case 'dispatchEvent':
        suggestions.push({
          desc: 'Use declarative event handling',
          fix: {
            range: [start, end] as [number, number],
            text: this.formatTodo('Use declarative events: html`<button send="CLICK_ACTION">`'),
          },
        });
        break;
      default:
        suggestions.push({
          desc: 'Replace with template-based reactive approach',
          fix: {
            range: [start, end] as [number, number],
            text: this.formatTodo('Use template functions with state management'),
          },
        });
    }

    return suggestions;
  }
}

export default NoDomManipulation;

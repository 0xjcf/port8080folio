import { SyntaxKind } from 'ts-morph';
import type { AnyRuleConfig, RuleContext, TsSourceFile, Violation } from '../types.js';
import { Rule } from './base.js';

export class NoMultipleDataAttributes extends Rule {
  private readonly DATA_ATTRIBUTE_PATTERNS = [
    /^data-/, // All data- attributes
  ];

  private readonly FRAMEWORK_DATA_ATTRIBUTES = [
    'data-state', // Framework's preferred state attribute
    'data-send', // Event handling attribute
    'data-action', // Alternative event handling
    'data-aria-', // Accessibility attributes (allowed)
  ];

  private readonly STATE_LIKE_DATA_ATTRIBUTES = [
    'data-loading',
    'data-visible',
    'data-active',
    'data-selected',
    'data-disabled',
    'data-expanded',
    'data-collapsed',
    'data-open',
    'data-closed',
    'data-valid',
    'data-invalid',
    'data-error',
    'data-success',
    'data-pending',
    'data-complete',
    'data-dirty',
    'data-clean',
    'data-empty',
    'data-filled',
    'data-ready',
    'data-busy',
    'data-idle',
    'data-focus',
    'data-blur',
    'data-hover',
    'data-pressed',
    'data-checked',
    'data-unchecked',
  ];

  constructor(config: AnyRuleConfig = {}) {
    super({
      ...config,
      message:
        config.message || 'Use single data-state attribute instead of multiple data attributes',
    });
  }

  async check(
    sourceFile: TsSourceFile,
    _content: string,
    context: RuleContext
  ): Promise<Violation[]> {
    const violations: Violation[] = [];

    // Find all template literals that might contain HTML
    const templateLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.TemplateExpression);
    const noSubstitutionTemplateLiterals = sourceFile.getDescendantsOfKind(
      SyntaxKind.NoSubstitutionTemplateLiteral
    );

    // Combine all template literals
    const allTemplateLiterals = [...templateLiterals, ...noSubstitutionTemplateLiterals];

    for (const template of allTemplateLiterals) {
      const templateText = template.getText();

      // Check if this looks like an HTML template (contains html` or has HTML-like content)
      if (this.isHTMLTemplate(templateText)) {
        const dataAttributeUsage = this.analyzeDataAttributes(templateText);

        if (dataAttributeUsage.hasViolation) {
          const position = this.getNodePosition(template);
          const sourceContext = this.getSourceContext(sourceFile, position.line);

          violations.push(
            this.createViolation({
              ruleId: 'no-multiple-data-attributes',
              file: context.file,
              line: position.line,
              column: position.column,
              endLine: position.endLine,
              endColumn: position.endColumn,
              source: sourceContext,
              message: this.getSpecificMessage(dataAttributeUsage),
              suggestions: this.generateSuggestions(dataAttributeUsage),
            })
          );
        }
      }
    }

    return violations;
  }

  /**
   * Check if template literal contains HTML
   */
  private isHTMLTemplate(templateText: string): boolean {
    // Check for html` tagged template
    if (templateText.startsWith('html`') || templateText.includes('html`')) {
      return true;
    }

    // Check for HTML-like content
    const htmlPatterns = [
      /<[a-zA-Z][^>]*>/, // HTML tags
      /data-[a-zA-Z-]+=/, // Data attributes
      /class\s*=/, // Class attributes
      /id\s*=/, // ID attributes
    ];

    return htmlPatterns.some((pattern) => pattern.test(templateText));
  }

  /**
   * Analyze data attribute usage in template
   */
  private analyzeDataAttributes(templateText: string): DataAttributeAnalysis {
    const analysis: DataAttributeAnalysis = {
      hasViolation: false,
      foundAttributes: [],
      stateAttributes: [],
      frameworkAttributes: [],
      hasDataState: false,
    };

    // Find all data attributes
    const dataAttributeRegex = /data-([a-zA-Z0-9-]+)(?:\s*=\s*[{"`'][^{"`']*[{"`'])?/g;
    let match: RegExpExecArray | null;

    while (true) {
      match = dataAttributeRegex.exec(templateText);
      if (match === null) break;

      const attributeName = `data-${match[1]}`;

      analysis.foundAttributes.push(attributeName);

      // Check if it's a framework attribute
      if (this.isFrameworkAttribute(attributeName)) {
        analysis.frameworkAttributes.push(attributeName);
        if (attributeName === 'data-state') {
          analysis.hasDataState = true;
        }
      }
      // Check if it's a state-like attribute
      else if (this.isStateAttribute(attributeName)) {
        analysis.stateAttributes.push(attributeName);
      }
    }

    // Determine if there's a violation
    // Violation occurs when:
    // 1. Multiple state-like data attributes are used
    // 2. State-like attributes are used alongside data-state
    // 3. Multiple data attributes that could be consolidated into data-state
    analysis.hasViolation =
      analysis.stateAttributes.length > 1 ||
      (analysis.stateAttributes.length > 0 && analysis.hasDataState) ||
      (analysis.stateAttributes.length > 0 && !analysis.hasDataState);

    return analysis;
  }

  /**
   * Check if attribute is a framework-allowed attribute
   */
  private isFrameworkAttribute(attributeName: string): boolean {
    return this.FRAMEWORK_DATA_ATTRIBUTES.some(
      (framework) => attributeName === framework || attributeName.startsWith(framework)
    );
  }

  /**
   * Check if attribute represents state
   */
  private isStateAttribute(attributeName: string): boolean {
    return this.STATE_LIKE_DATA_ATTRIBUTES.includes(attributeName);
  }

  /**
   * Get specific message based on the violation
   */
  private getSpecificMessage(analysis: DataAttributeAnalysis): string {
    if (analysis.stateAttributes.length > 1) {
      return `Multiple state data attributes (${analysis.stateAttributes.join(', ')}) should be consolidated into a single data-state attribute.`;
    }

    if (analysis.stateAttributes.length > 0 && analysis.hasDataState) {
      return `State data attributes (${analysis.stateAttributes.join(', ')}) should not be used alongside data-state. Use only data-state for state management.`;
    }

    if (analysis.stateAttributes.length > 0) {
      return `State data attribute (${analysis.stateAttributes.join(', ')}) should be replaced with data-state attribute pattern.`;
    }

    return 'Multiple data attributes detected. Consider using data-state pattern for better state management.';
  }

  /**
   * Generate suggestions for fixing the violation
   */
  private generateSuggestions(
    analysis: DataAttributeAnalysis
  ): Array<{ desc: string; fix: { range: [number, number]; text: string } }> {
    const suggestions = [];

    if (analysis.stateAttributes.length > 0) {
      // Suggest converting to data-state pattern
      const stateValue = this.suggestStateValue(analysis.stateAttributes);

      suggestions.push({
        desc: `Replace with data-state="${stateValue}"`,
        fix: {
          range: [0, 0] as [number, number],
          text: this.formatTodo(
            `Replace ${analysis.stateAttributes.join(', ')} with data-state="${stateValue}"`
          ),
        },
      });

      // Suggest using machine states instead
      suggestions.push({
        desc: 'Use XState machine states for state management',
        fix: {
          range: [0, 0] as [number, number],
          text: this.formatTodo(
            `Use machine state: state.matches('${stateValue}') instead of data attributes`
          ),
        },
      });
    }

    // General framework pattern suggestion
    suggestions.push({
      desc: 'Follow Actor-SPA framework data attribute patterns',
      fix: {
        range: [0, 0] as [number, number],
        text: this.formatTodo(
          'Use data-state for state, data-send for events, avoid multiple state data attributes'
        ),
      },
    });

    // CSS styling suggestion
    suggestions.push({
      desc: 'Use [data-state] CSS selectors for styling',
      fix: {
        range: [0, 0] as [number, number],
        text: this.formatTodo(
          'CSS: [data-state="loading"] { ... } instead of [data-loading] { ... }'
        ),
      },
    });

    return suggestions;
  }

  /**
   * Suggest appropriate state value based on attributes
   */
  private suggestStateValue(attributes: string[]): string {
    // Map common data attributes to appropriate state values
    const stateMap: Record<string, string> = {
      'data-loading': 'loading',
      'data-visible': 'visible',
      'data-active': 'active',
      'data-selected': 'selected',
      'data-disabled': 'disabled',
      'data-expanded': 'expanded',
      'data-collapsed': 'collapsed',
      'data-open': 'open',
      'data-closed': 'closed',
      'data-valid': 'valid',
      'data-invalid': 'invalid',
      'data-error': 'error',
      'data-success': 'success',
      'data-pending': 'pending',
      'data-complete': 'complete',
      'data-dirty': 'dirty',
      'data-clean': 'clean',
      'data-ready': 'ready',
      'data-busy': 'busy',
      'data-idle': 'idle',
    };

    // If multiple attributes, suggest a compound state
    if (attributes.length > 1) {
      const mappedStates = attributes.map((attr) => stateMap[attr] || attr.replace('data-', ''));
      return mappedStates.join('.');
    }

    // Single attribute mapping
    const singleAttr = attributes[0];
    return stateMap[singleAttr] || singleAttr.replace('data-', '');
  }
}

interface DataAttributeAnalysis {
  hasViolation: boolean;
  foundAttributes: string[];
  stateAttributes: string[];
  frameworkAttributes: string[];
  hasDataState: boolean;
}

export default NoMultipleDataAttributes;

import { SyntaxKind } from 'ts-morph';
import type {
  AnyRuleConfig,
  RuleContext,
  TemplateNestingConfig,
  TsMorphNode,
  TsSourceFile,
  Violation,
} from '../types.js';
import { Rule } from './base.js';

/**
 * Rule: prefer-extracted-templates
 * Detects deeply nested template literals and suggests extraction
 * This implements the TEMPLATE_BEST_PRACTICE.md guidance using AST analysis
 */
export class PreferExtractedTemplates extends Rule {
  protected config: TemplateNestingConfig;

  constructor(ruleConfig: AnyRuleConfig = {}) {
    super({
      ...ruleConfig,
      message:
        ruleConfig.message ||
        'Template nesting too deep. Consider extracting nested templates into separate functions.',
      autofix: ruleConfig.autofix !== false,
    });

    this.config = {
      maxNestingDepth: (ruleConfig as TemplateNestingConfig).maxNestingDepth || 2,
      minExtractedLines: (ruleConfig as TemplateNestingConfig).minExtractedLines || 3,
      allowInlineExpressions:
        (ruleConfig as TemplateNestingConfig).allowInlineExpressions !== false,
    };
  }

  async check(
    sourceFile: TsSourceFile,
    _content: string,
    context: RuleContext
  ): Promise<Violation[]> {
    const violations: Violation[] = [];

    // Find all tagged template expressions (html`...`, css`...`, etc.)
    const taggedTemplates = sourceFile.getDescendantsOfKind(SyntaxKind.TaggedTemplateExpression);

    for (const template of taggedTemplates) {
      const depth = this.computeTemplateDepth(template);

      if (depth > this.config.maxNestingDepth) {
        const position = this.getNodePosition(template);
        const sourceContext = this.getSourceContext(sourceFile, position.line);

        // Check if it's long enough to warrant extraction
        const templateText = template.getText();
        const lineCount = templateText.split('\n').length;

        if (lineCount >= this.config.minExtractedLines) {
          violations.push(
            this.createViolation({
              ruleId: 'prefer-extracted-templates',
              file: context.file,
              line: position.line,
              column: position.column,
              endLine: position.endLine,
              endColumn: position.endColumn,
              source: sourceContext,
              message: `${this.message} (depth: ${depth}, max: ${this.config.maxNestingDepth})`,
              fix: this.autofix ? this.generateFix(template, depth) : null,
              suggestions: this.generateSuggestions(template, depth),
            })
          );
        }
      }
    }

    return violations;
  }

  /**
   * Compute the nesting depth of template expressions
   */
  private computeTemplateDepth(node: TsMorphNode): number {
    if (!this.isTemplateNode(node)) {
      return 0;
    }

    // Find all nested template expressions within this node
    const nestedTemplates = this.findNestedTemplates(node);

    if (nestedTemplates.length === 0) {
      return 1; // This template itself
    }

    // Recursively compute depth of nested templates
    const nestedDepths = nestedTemplates.map((nested) => this.computeTemplateDepth(nested));
    const maxNestedDepth = Math.max(...nestedDepths);

    return 1 + maxNestedDepth;
  }

  /**
   * Check if a node is a template node
   */
  private isTemplateNode(node: TsMorphNode): boolean {
    if (!node || typeof node.getKind !== 'function') return false;

    const kind = node.getKind();
    return kind === SyntaxKind.TaggedTemplateExpression || kind === SyntaxKind.TemplateExpression;
  }

  /**
   * Find nested template expressions within a node
   */
  private findNestedTemplates(node: TsMorphNode): TsMorphNode[] {
    if (
      !node ||
      typeof (node as unknown as { getDescendantsOfKind?: (kind: number) => TsMorphNode[] })
        .getDescendantsOfKind !== 'function'
    ) {
      return [];
    }

    const nodeWithMethods = node as unknown as {
      getDescendantsOfKind: (kind: number) => TsMorphNode[];
    };
    const taggedTemplates = nodeWithMethods.getDescendantsOfKind(
      SyntaxKind.TaggedTemplateExpression
    );
    const templateExpressions = nodeWithMethods.getDescendantsOfKind(SyntaxKind.TemplateExpression);

    // Filter out the root node itself and direct children only
    return [...taggedTemplates, ...templateExpressions].filter((child: TsMorphNode) => {
      return child !== node && this.isDirectChild(node, child);
    });
  }

  /**
   * Check if child is a direct child template (not deeply nested in other structures)
   */
  private isDirectChild(parent: TsMorphNode, child: TsMorphNode): boolean {
    if (!parent || !child) return false;

    try {
      const parentStart = parent.getStart();
      const parentEnd = parent.getEnd();
      const childStart = child.getStart();
      const childEnd = child.getEnd();

      // Child must be within parent bounds
      if (childStart < parentStart || childEnd > parentEnd) {
        return false;
      }

      // Check if there's another template node between parent and child
      const nodeWithMethods = parent as unknown as {
        getDescendantsOfKind: (kind: number) => TsMorphNode[];
      };
      const siblings = nodeWithMethods.getDescendantsOfKind(SyntaxKind.TaggedTemplateExpression);

      for (const sibling of siblings) {
        if (sibling === child || sibling === parent) continue;

        const siblingStart = sibling.getStart();
        const siblingEnd = sibling.getEnd();

        // If sibling contains child, then child is not a direct child of parent
        if (siblingStart <= childStart && siblingEnd >= childEnd) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a fix suggestion
   */
  private generateFix(
    template: TsMorphNode,
    _depth: number
  ): { range: [number, number]; text: string } | null {
    if (!this.autofix) return null;

    try {
      const templateText = template.getText();
      const extractedFunctionName = `extracted${Date.now()}`;

      // Simple extraction - wrap in a function
      const _fixText = `${extractedFunctionName}()`;

      return {
        range: [template.getStart(), template.getEnd()],
        text: `${this.formatTodo(`Extract to function ${extractedFunctionName}`)}\n${templateText}`,
      };
    } catch {
      return null;
    }
  }

  /**
   * Generate suggestions for fixing the violation
   */
  private generateSuggestions(
    template: TsMorphNode,
    depth: number
  ): Array<{ desc: string; fix: { range: [number, number]; text: string } }> {
    const suggestions = [];

    suggestions.push({
      desc: 'Extract nested template to a separate function',
      fix: {
        range: [template.getStart(), template.getEnd()] as [number, number],
        text: this.formatTodo(
          'Extract this template to a separate function for better readability'
        ),
      },
    });

    if (depth > 3) {
      suggestions.push({
        desc: 'Break down into multiple smaller template functions',
        fix: {
          range: [template.getStart(), template.getEnd()] as [number, number],
          text: this.formatTodo(
            'This template is very deeply nested. Consider breaking it into multiple smaller functions'
          ),
        },
      });
    }

    return suggestions;
  }
}

export default PreferExtractedTemplates;

/**
 * Conceptual implementation of prefer-extracted-templates linter rule
 * This would be implemented as a Biome rule or ESLint plugin
 */

interface RuleOptions {
  maxNestingDepth: number;
  minExtractedLines: number;
  allowInlineExpressions: boolean;
}

const DEFAULT_OPTIONS: RuleOptions = {
  maxNestingDepth: 2,
  minExtractedLines: 3,
  allowInlineExpressions: true,
};

interface TemplateInfo {
  depth: number;
  lineCount: number;
  hasComplexContent: boolean;
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

// Define basic AST node types for type safety
interface ASTNode {
  type: string;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

interface TaggedTemplateExpression extends ASTNode {
  type: 'TaggedTemplateExpression';
  tag: {
    name: string;
  };
  quasi: {
    quasis: unknown[];
    expressions: CallExpression[];
  };
}

interface CallExpression extends ASTNode {
  type: 'CallExpression';
  callee: {
    property?: { name: string };
  };
  arguments: Array<{
    body?: TaggedTemplateExpression;
  }>;
}

interface RuleContext {
  report: (options: {
    node: ASTNode;
    message: string;
    suggest?: Array<{ desc: string; fix: null }>;
  }) => void;
}

/**
 * Analyzes template literal nesting depth and complexity
 */
function analyzeTemplateLiteral(node: ASTNode, depth = 0): TemplateInfo[] {
  const violations: TemplateInfo[] = [];
  let currentDepth = depth;

  // Check if this is a tagged template literal (html`...`, css`...`)
  if (node.type === 'TaggedTemplateExpression') {
    const taggedNode = node as TaggedTemplateExpression;
    const tag = taggedNode.tag.name;
    if (['html', 'css', 'svg'].includes(tag)) {
      currentDepth++;

      // Analyze quasi elements (template parts)
      for (const _element of taggedNode.quasi.quasis) {
        // Check expressions within the template
        for (const expr of taggedNode.quasi.expressions) {
          if (expr.type === 'CallExpression' && expr.callee.property?.name === 'map') {
            // Found a map expression, check its return value
            const mapReturn = expr.arguments[0];
            if (mapReturn?.body?.type === 'TaggedTemplateExpression') {
              // Recursively analyze nested templates
              const nestedViolations = analyzeTemplateLiteral(mapReturn.body, currentDepth);
              violations.push(...nestedViolations);
            }
          }
        }
      }

      // Check if current depth exceeds max
      if (currentDepth > DEFAULT_OPTIONS.maxNestingDepth && node.loc) {
        const lineCount = node.loc.end.line - node.loc.start.line + 1;
        const hasComplexContent = lineCount >= DEFAULT_OPTIONS.minExtractedLines;

        violations.push({
          depth: currentDepth,
          lineCount,
          hasComplexContent,
          location: node.loc,
        });
      }
    }
  }

  return violations;
}

/**
 * Generate helpful error message with extraction suggestion
 */
function generateErrorMessage(violation: TemplateInfo): string {
  const baseMessage =
    `Template literal is nested ${violation.depth} levels deep. ` +
    'Consider extracting inner templates into separate functions for better ' +
    'readability and maintainability.';

  if (violation.hasComplexContent) {
    return (
      baseMessage +
      '\n\nThis template contains complex content that would ' +
      'benefit from being a standalone component function.'
    );
  }

  return baseMessage;
}

/**
 * Generate code suggestion for extraction
 */
function _generateCodeSuggestion(templateContent: string): string {
  // Analyze content to suggest a good function name
  const hasListItem = templateContent.includes('<li');
  const hasCard = templateContent.includes('card');
  const hasRow = templateContent.includes('row');

  let suggestedName = 'template';
  if (hasListItem) suggestedName = 'listItem';
  else if (hasCard) suggestedName = 'cardTemplate';
  else if (hasRow) suggestedName = 'rowTemplate';

  return `
Suggestion: Extract the template into a function:

const ${suggestedName} = (item) => html\`
  ${templateContent.trim()}
\`;`;
}

/**
 * Example Biome rule implementation structure
 */
export const preferExtractedTemplates = {
  name: 'prefer-extracted-templates',
  category: 'best-practices',

  create(context: RuleContext) {
    return {
      TaggedTemplateExpression(node: ASTNode) {
        const violations = analyzeTemplateLiteral(node);

        for (const violation of violations) {
          context.report({
            node,
            message: generateErrorMessage(violation),
            suggest: [
              {
                desc: 'Extract template into a function',
                fix: null, // Manual refactoring required
              },
            ],
          });
        }
      },
    };
  },
};

/**
 * Helper to check if a template should be extracted based on complexity
 */
export function shouldExtractTemplate(templateAST: ASTNode, options = DEFAULT_OPTIONS): boolean {
  const info = analyzeTemplateLiteral(templateAST);

  return info.some(
    (violation) =>
      violation.depth > options.maxNestingDepth ||
      (violation.hasComplexContent && violation.lineCount >= options.minExtractedLines)
  );
}

interface CodeIssue {
  line: number;
  message: string;
  severity: 'warning' | 'error';
}

/**
 * Example usage in a code review tool
 */
export function reviewTemplateComplexity(code: string): {
  issues: CodeIssue[];
} {
  // This would use an AST parser like @babel/parser or typescript
  // For demonstration purposes only
  const issues: CodeIssue[] = [];

  // Simple regex-based detection (real implementation would use AST)
  const templateRegex = /(html|css|svg)`[\s\S]*?`/g;
  const matches = Array.from(code.matchAll(templateRegex));

  for (const match of matches) {
    const template = match[0];
    const nestingDepth = (template.match(/\${.*?(html|css|svg)`/g) || []).length;

    if (nestingDepth >= DEFAULT_OPTIONS.maxNestingDepth) {
      const line = code.substring(0, match.index || 0).split('\n').length;
      issues.push({
        line,
        message: `Template has ${nestingDepth + 1} levels of nesting. Consider extraction.`,
        severity: 'warning',
      });
    }
  }

  return { issues };
}

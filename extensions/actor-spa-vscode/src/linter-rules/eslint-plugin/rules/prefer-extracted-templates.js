/**
 * ESLint rule: prefer-extracted-templates
 * Encourages extracting complex nested template literals into separate functions
 */

const DEFAULT_OPTIONS = {
  maxNestingDepth: 2,
  minExtractedLines: 3,
  allowInlineExpressions: true,
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage extracting complex nested template literals into separate functions',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/actor-spa/docs/template-best-practices',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          maxNestingDepth: {
            type: 'integer',
            minimum: 1,
            default: 2,
          },
          minExtractedLines: {
            type: 'integer',
            minimum: 1,
            default: 3,
          },
          allowInlineExpressions: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooDeep:
        'Template literal is nested {{depth}} levels deep. Consider extracting inner templates into separate functions.',
      complexTemplate:
        'This template contains {{lines}} lines and is nested {{depth}} levels deep. Extract it into a separate function for better maintainability.',
      extractSuggestion: 'Extract this template into a function named `{{suggestedName}}`',
    },
  },

  create(context) {
    const options = { ...DEFAULT_OPTIONS, ...(context.options[0] || {}) };
    const _sourceCode = context.getSourceCode();

    // Track nesting depth as we traverse
    const _currentDepth = 0;
    const _templateStack = [];

    function checkTemplateNesting(node, depth) {
      const tag = node.tag;

      // Check if this is a template literal we care about
      if (tag && tag.type === 'Identifier' && ['html', 'css', 'svg'].includes(tag.name)) {
        // Calculate line count
        const startLine = node.loc.start.line;
        const endLine = node.loc.end.line;
        const lineCount = endLine - startLine + 1;

        // Check if it violates our rules
        if (depth > options.maxNestingDepth) {
          const isComplex = lineCount >= options.minExtractedLines;

          context.report({
            node,
            messageId: isComplex ? 'complexTemplate' : 'tooDeep',
            data: {
              depth: depth,
              lines: lineCount,
            },
          });
        } else if (depth === options.maxNestingDepth && lineCount >= options.minExtractedLines) {
          // Warn about templates that are at the limit and complex
          context.report({
            node,
            messageId: 'complexTemplate',
            data: {
              depth: depth,
              lines: lineCount,
            },
          });
        }

        // Check expressions within the template
        if (node.quasi?.expressions) {
          node.quasi.expressions.forEach((expr) => {
            checkExpression(expr, depth);
          });
        }
      }
    }

    function checkExpression(expr, depth) {
      // Check if this is a map call that might contain templates
      if (
        expr.type === 'CallExpression' &&
        expr.callee.type === 'MemberExpression' &&
        expr.callee.property.name === 'map'
      ) {
        const callback = expr.arguments[0];
        if (callback) {
          // Increase depth for the map callback
          checkCallback(callback, depth + 1);
        }
      } else if (expr.type === 'ConditionalExpression') {
        // Check both branches of ternary operators
        checkNode(expr.consequent, depth);
        checkNode(expr.alternate, depth);
      }
    }

    function checkCallback(callback, depth) {
      if (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression') {
        if (callback.body.type === 'BlockStatement') {
          // Check all statements in the block
          callback.body.body.forEach((stmt) => {
            if (stmt.type === 'ReturnStatement' && stmt.argument) {
              checkNode(stmt.argument, depth);
            }
          });
        } else {
          // Expression body
          checkNode(callback.body, depth);
        }
      }
    }

    function checkNode(node, depth) {
      if (!node) return;

      if (node.type === 'TaggedTemplateExpression') {
        checkTemplateNesting(node, depth);
      } else if (node.type === 'CallExpression' || node.type === 'ConditionalExpression') {
        checkExpression(node, depth);
      }
    }

    return {
      TaggedTemplateExpression(node) {
        // Start checking from depth 1 for top-level templates
        checkTemplateNesting(node, 1);
      },
    };
  },
};

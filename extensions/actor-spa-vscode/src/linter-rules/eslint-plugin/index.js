/**
 * ESLint plugin for Actor-SPA Framework
 * Provides linting rules for template literal best practices
 */

module.exports = {
  rules: {
    'prefer-extracted-templates': require('./rules/prefer-extracted-templates'),
  },
  configs: {
    recommended: {
      plugins: ['actor-spa'],
      rules: {
        'actor-spa/prefer-extracted-templates': [
          'warn',
          {
            maxNestingDepth: 2,
            minExtractedLines: 3,
            allowInlineExpressions: true,
          },
        ],
      },
    },
    strict: {
      plugins: ['actor-spa'],
      rules: {
        'actor-spa/prefer-extracted-templates': [
          'error',
          {
            maxNestingDepth: 1,
            minExtractedLines: 2,
            allowInlineExpressions: false,
          },
        ],
      },
    },
  },
};

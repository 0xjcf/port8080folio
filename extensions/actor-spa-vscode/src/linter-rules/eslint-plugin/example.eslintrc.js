/**
 * Example ESLint configuration for using actor-spa plugin alongside Biome
 *
 * This configuration adds Actor-SPA specific rules while letting Biome
 * handle general formatting and linting.
 */

module.exports = {
  // Extend from your existing config if any
  extends: [
    // Your existing extends...
  ],

  // Add the actor-spa plugin
  plugins: ['actor-spa'],

  // Configure parser for TypeScript (if using TypeScript)
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },

  // Actor-SPA specific rules
  rules: {
    // Encourage extracting complex templates
    'actor-spa/prefer-extracted-templates': [
      'warn',
      {
        maxNestingDepth: 2, // Warn when templates are nested more than 2 levels
        minExtractedLines: 3, // Suggest extraction for templates with 3+ lines
        allowInlineExpressions: true,
      },
    ],

    // For stricter enforcement, use:
    // 'actor-spa/prefer-extracted-templates': ['error', {
    //   maxNestingDepth: 1,
    //   minExtractedLines: 2,
    //   allowInlineExpressions: false
    // }]
  },

  // You can also use predefined configs
  // extends: ['plugin:actor-spa/recommended']  // or 'plugin:actor-spa/strict'

  // Ignore patterns (if needed)
  ignorePatterns: ['node_modules/', 'dist/', 'out/', '*.d.ts'],
};

/**
 * To use this configuration:
 *
 * 1. Install dependencies:
 *    npm install --save-dev eslint eslint-plugin-actor-spa @typescript-eslint/parser
 *
 * 2. Create .eslintrc.js in your project root with this configuration
 *
 * 3. Add to package.json scripts:
 *    "lint:templates": "eslint --ext .ts,.tsx src/"
 *
 * 4. Run alongside Biome:
 *    "lint": "biome check src && eslint --ext .ts,.tsx src/"
 */

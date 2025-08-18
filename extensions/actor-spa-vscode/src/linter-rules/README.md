# Linter Rules for Actor-SPA Framework

## Overview

This directory contains implementations and specifications for custom linter rules that promote best practices in Actor-SPA Framework development.

## Current Status

### `prefer-extracted-templates` Rule

**Status**: Specification and ESLint implementation ready. Awaiting Biome custom rule support.

**Purpose**: Encourages developers to extract complex nested template literals into separate functions for better readability, testability, and maintainability.

## Implementation Approaches

### 1. Biome (Future)

Biome currently doesn't support custom rules through a plugin system. Rules must be implemented in Rust and compiled into the Biome binary. We're tracking the development of their plugin system.

**Tracking Issue**: https://github.com/biomejs/biome/issues/5649

### 2. ESLint Plugin (Available Now)

We provide an ESLint plugin that can be used alongside Biome:
- `eslint-plugin-actor-spa` - Full ESLint plugin implementation
- Can be used in projects that use Biome for formatting and ESLint for additional linting

### 3. Standalone Analyzer (Available Now)

A TypeScript-based analyzer that can be run independently:
- `analyze-templates.ts` - Standalone CLI tool
- Can be integrated into CI/CD pipelines
- Provides detailed reports about template complexity

## Usage

### ESLint Plugin

```bash
# Install the plugin
npm install --save-dev eslint-plugin-actor-spa

# Configure in .eslintrc.js
module.exports = {
  plugins: ['actor-spa'],
  rules: {
    'actor-spa/prefer-extracted-templates': ['warn', {
      maxNestingDepth: 2,
      minExtractedLines: 3
    }]
  }
};
```

### Standalone Analyzer

```bash
# Run the analyzer
npx actor-spa-analyze --max-depth 2 src/**/*.ts

# Or add to package.json scripts
"scripts": {
  "lint:templates": "actor-spa-analyze --max-depth 2 src/**/*.ts"
}
```

## Rule Specifications

See individual rule files for detailed specifications:
- `prefer-extracted-templates.ts` - Conceptual implementation and specification

## Contributing

When Biome adds plugin support, we'll migrate these rules. Until then, contributions to the ESLint plugin and standalone analyzer are welcome! 
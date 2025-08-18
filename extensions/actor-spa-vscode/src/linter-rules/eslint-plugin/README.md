# eslint-plugin-actor-spa

ESLint plugin for the Actor-SPA Framework that enforces template literal best practices.

## Why?

While working on the Actor-SPA Framework, we discovered that extracting complex nested template literals into separate functions is not just a workaround for formatter limitations - it's actually a best practice that improves:

- **Readability**: Each template has a single, clear purpose
- **Testability**: Template functions can be tested in isolation
- **Reusability**: Templates can be shared across components
- **Type Safety**: Better TypeScript inference and checking
- **Maintainability**: Changes are localized to specific functions
- **Performance**: Template functions can be memoized

## Installation

```bash
npm install --save-dev eslint-plugin-actor-spa
# or
yarn add -D eslint-plugin-actor-spa
# or
pnpm add -D eslint-plugin-actor-spa
```

## Usage

Add `actor-spa` to your ESLint configuration:

### Basic Configuration

```js
// .eslintrc.js
module.exports = {
  plugins: ['actor-spa'],
  rules: {
    'actor-spa/prefer-extracted-templates': 'warn'
  }
};
```

### Using Predefined Configs

```js
// .eslintrc.js
module.exports = {
  extends: ['plugin:actor-spa/recommended']
};
```

Available configs:
- `plugin:actor-spa/recommended` - Balanced rules for most projects
- `plugin:actor-spa/strict` - Stricter rules for maximum code quality

## Rules

### prefer-extracted-templates

Encourages extracting complex nested template literals into separate functions.

#### Options

```js
'actor-spa/prefer-extracted-templates': ['warn', {
  maxNestingDepth: 2,          // Maximum allowed nesting depth
  minExtractedLines: 3,        // Minimum lines before suggesting extraction
  allowInlineExpressions: true // Allow simple inline expressions
}]
```

#### Examples

❌ **Bad** - Deeply nested templates:

```typescript
const component = html`
  <div class="container">
    ${items.map(item => html`
      <div class="item">
        ${item.children.map(child => html`
          <div class="child">
            ${child.tags.map(tag => html`
              <span class="tag">${tag}</span>
            `)}
          </div>
        `)}
      </div>
    `)}
  </div>
`;
```

✅ **Good** - Extracted template functions:

```typescript
const tagTemplate = (tag: string) => html`
  <span class="tag">${tag}</span>
`;

const childTemplate = (child: Child) => html`
  <div class="child">
    ${child.tags.map(tagTemplate)}
  </div>
`;

const itemTemplate = (item: Item) => html`
  <div class="item">
    ${item.children.map(childTemplate)}
  </div>
`;

const component = html`
  <div class="container">
    ${items.map(itemTemplate)}
  </div>
`;
```

## Using with Biome

This plugin works great alongside Biome. Use Biome for general formatting and linting, and this plugin for Actor-SPA specific rules:

```json
// package.json
{
  "scripts": {
    "lint": "biome check src && eslint src",
    "lint:fix": "biome check --apply src && eslint --fix src"
  }
}
```

```js
// .eslintrc.js
module.exports = {
  // Let Biome handle general rules
  extends: ['plugin:actor-spa/recommended'],
  
  // Only run on TypeScript files
  overrides: [{
    files: ['*.ts', '*.tsx'],
    parser: '@typescript-eslint/parser'
  }]
};
```

## CLI Usage

You can also use our standalone analyzer without ESLint:

```bash
npx actor-spa-analyze src/**/*.ts --max-depth 2
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Future Plans

We're tracking Biome's plugin system development. Once Biome supports custom rules, we'll provide a native Biome implementation of these rules.

## License

MIT 
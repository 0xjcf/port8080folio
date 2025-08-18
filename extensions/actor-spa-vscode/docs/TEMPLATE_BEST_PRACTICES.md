# Template Literal Best Practices

## Overview

While working on formatter limitations, we discovered that extracting complex nested templates into separate functions is not just a workaround - it's actually a best practice that improves code quality, readability, and maintainability.

## The Rule: Avoid Deep Template Nesting

### ❌ Avoid: Deeply Nested Templates

```typescript
// This is hard to read, maintain, and format
const badExample = html`
  <div class="container">
    ${items.map(item => html`
      <div class="item">
        ${item.children.map(child => html`
          <div class="child">
            ${child.nested.map(n => html`
              <span>${n.value}</span>
            `)}
          </div>
        `)}
      </div>
    `)}
  </div>
`;
```

### ✅ Prefer: Extracted Template Functions

```typescript
// Clear, testable, and reusable components
const nestedItem = (n: Nested) => html`
  <span>${n.value}</span>
`;

const childItem = (child: Child) => html`
  <div class="child">
    ${child.nested.map(nestedItem)}
  </div>
`;

const itemTemplate = (item: Item) => html`
  <div class="item">
    ${item.children.map(childItem)}
  </div>
`;

const goodExample = html`
  <div class="container">
    ${items.map(itemTemplate)}
  </div>
`;
```

## Benefits of This Pattern

### 1. **Improved Readability**
- Each template has a single, clear purpose
- Easier to understand the structure at a glance
- Natural component boundaries

### 2. **Better Testability**
- Each template function can be tested in isolation
- Easier to mock data for specific parts
- Clear inputs and outputs

### 3. **Enhanced Reusability**
- Template functions can be shared across components
- Natural building blocks for UI composition
- Promotes DRY principles

### 4. **Easier Maintenance**
- Changes to nested structures are localized
- Clearer git diffs when modifying templates
- Easier to refactor

### 5. **Better Performance**
- Template functions can be memoized if needed
- Easier to optimize rendering of specific parts
- Natural boundaries for React.memo or similar optimizations

### 6. **Type Safety**
- Each function has clear parameter types
- Better IntelliSense support
- Easier to catch type errors

## Proposed Linter Rule: `prefer-extracted-templates`

### Rule Details

**Rule Name**: `actor-spa/prefer-extracted-templates`

**Category**: Best Practices

**Fixable**: No (requires manual refactoring)

**Recommended**: Yes

### Configuration

```json
{
  "rules": {
    "actor-spa/prefer-extracted-templates": ["warn", {
      "maxNestingDepth": 2,
      "minExtractedLines": 3,
      "allowInlineExpressions": true
    }]
  }
}
```

### Options

- `maxNestingDepth` (default: 2) - Maximum allowed nesting depth for template literals
- `minExtractedLines` (default: 3) - Minimum lines before suggesting extraction
- `allowInlineExpressions` (default: true) - Allow simple inline expressions without warning

### Examples

#### ⚠️ Warning Cases

```typescript
// Nesting depth of 3 - triggers warning
const deepNesting = html`
  <div>
    ${items.map(item => html`
      <div>
        ${item.children.map(child => html`
          <span>${child.value}</span>
        `)}
      </div>
    `)}
  </div>
`;

// Complex template in map - triggers warning
const complexMap = html`
  <ul>
    ${items.map(item => html`
      <li class="item ${item.active ? 'active' : ''}">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <button onclick=${() => handleClick(item.id)}>
          Click
        </button>
      </li>
    `)}
  </ul>
`;
```

#### ✅ Passing Cases

```typescript
// Simple expression - allowed
const simpleList = html`
  <ul>
    ${items.map(item => html`<li>${item.name}</li>`)}
  </ul>
`;

// Extracted function - encouraged
const itemTemplate = (item: Item) => html`
  <li class="item ${item.active ? 'active' : ''}">
    <h3>${item.title}</h3>
    <p>${item.description}</p>
  </li>
`;

const betterList = html`
  <ul>
    ${items.map(itemTemplate)}
  </ul>
`;

// Two levels with simple content - allowed
const twoLevels = html`
  <div>
    ${sections.map(section => html`
      <section>
        <h2>${section.title}</h2>
        ${section.items.map(item => html`<p>${item}</p>`)}
      </section>
    `)}
  </div>
`;
```

### Error Messages

```
Template literal is nested 3 levels deep. Consider extracting inner templates into separate functions for better readability and maintainability.

Suggestion: Extract the innermost template into a function:
const childTemplate = (child) => html`<span>${child.value}</span>`;
```

## Implementation Strategy

### Phase 1: Documentation and Guidelines
1. Document the pattern as a best practice
2. Add examples to the framework documentation
3. Create code snippets for common patterns

### Phase 2: Linter Rule Development
1. Implement AST visitor for template literal detection
2. Add nesting depth calculation
3. Create helpful error messages with suggestions
4. Add configuration options

### Phase 3: Auto-fix Support (Future)
1. Analyze template structure
2. Suggest function names based on content
3. Generate extracted function with proper types
4. Update the original template to use the function

## Migration Guide

For existing codebases, migrate gradually:

1. **Identify**: Run the linter to find deeply nested templates
2. **Prioritize**: Start with the most complex templates
3. **Extract**: Create meaningful function names
4. **Type**: Add proper TypeScript types
5. **Test**: Add unit tests for extracted functions
6. **Document**: Add JSDoc comments for complex templates

## Conclusion

What started as a formatter limitation revealed a powerful pattern for organizing template literals. By encouraging developers to extract complex templates into functions, we promote:

- Cleaner, more maintainable code
- Better separation of concerns
- Improved testability
- Enhanced reusability

This linter rule will help enforce these best practices automatically, making our codebases more consistent and easier to work with. 
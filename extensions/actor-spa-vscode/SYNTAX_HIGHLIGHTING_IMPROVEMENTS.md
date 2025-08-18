# Syntax Highlighting Improvements for Short Circuits and Ternaries

## Overview

This update significantly improves syntax highlighting for logical expressions and conditional rendering patterns in Actor-SPA framework template literals. The improvements focus on better visual distinction between conditions, operators, and template content.

## New Highlighting Features

### 1. Short Circuit Operators (`&&`)

Enhanced highlighting for short circuit expressions with template literals:

```typescript
${state.matches('loading') && html`<div class="spinner">Loading...</div>`}
${state.context.showContent && html`<span>Content is visible</span>`}
${!state.context.isLoading && state.context.showContent && html`
  <section class="content-ready">
    <h2>Content is ready to display</h2>
  </section>
`}
```

**Highlighting improvements:**
- `&&` operators are highlighted with distinct colors and bold styling
- Conditions before `&&` are properly scoped as logical conditions
- `state.matches()` calls receive special highlighting
- State property access (`state.context.*`) is highlighted with italic styling

### 2. Logical OR Operators (`||`)

Better highlighting for OR expressions in template contexts:

```typescript
${(state.matches('error') || state.matches('timeout') || state.context.hasError) && html`
  <div class="error-container">
    <h3>Something went wrong</h3>
  </div>
`}
```

**Highlighting improvements:**
- `||` operators receive distinct coloring
- Grouped conditions with parentheses are properly highlighted
- Multiple OR conditions are visually separated

### 3. Ternary Operators (`? :`)

Enhanced ternary operator highlighting with better branch distinction:

```typescript
${state.matches('active') 
  ? html`<span class="active">Active</span>` 
  : html`<span class="inactive">Inactive</span>`}

${state.context.user.name 
  ? html`<h1>Welcome ${state.context.user.name}!</h1>` 
  : html`<h1>Welcome Guest!</h1>`}
```

**Highlighting improvements:**
- `?` and `:` operators have distinct colors and bold styling
- True and false branches are properly scoped
- Nested ternary operators are correctly highlighted
- Conditions are highlighted separately from branches

### 4. Complex Nested Expressions

Improved handling of complex logical expressions:

```typescript
${((state.matches('idle') && state.context.showContent) || 
   (state.matches('success') && !state.context.isLoading)) && html`
  <div class="ready-state">
    <h2>System Ready</h2>
    ${state.context.count > 0 ? html`<p>Items: ${state.context.count}</p>` : ''}
  </div>
`}
```

**Highlighting improvements:**
- Parentheses grouping is highlighted with special colors
- Nested logical operators maintain proper hierarchy
- Mixed AND/OR expressions are visually distinct

### 5. State Access Patterns

Special highlighting for common Actor-SPA state access patterns:

```typescript
${state.matches('loading')}     // state.matches() calls
${state.context.user.name}      // state.context property access
${state.value}                  // state property access
```

**Highlighting improvements:**
- `state` object is highlighted as a special variable
- `.matches()` method calls receive function-specific styling
- `.context` property access is highlighted distinctly
- State values in `.matches()` calls are highlighted as special strings

## Theme Support

All improvements are supported across all Actor-SPA themes:

### GitHub Dark Theme
- Logical operators: Bold red (`#FF7B72`)
- Ternary operators: Bold orange (`#F85149`)
- State access: Italic blue (`#79C0FF`)
- State values: Bold green (`#A5C261`)
- Expression groups: Bold purple (`#D2A8FF`)

### Minimal Light Theme
- Logical operators: Bold purple (`#AF00DB`)
- Ternary operators: Bold red (`#D73A49`)
- State access: Italic dark blue (`#001080`)
- State values: Bold blue (`#0451A5`)
- Expression groups: Bold brown (`#795E26`)

### Monokai Theme
- Logical operators: Bold pink (`#F92672`)
- Ternary operators: Bold orange (`#FD971F`)
- State access: Italic cyan (`#66D9EF`)
- State values: Bold yellow (`#E6DB74`)
- Expression groups: Bold purple (`#AE81FF`)

## Grammar Improvements

The TextMate grammar now includes:

1. **Lookahead patterns** to detect logical expressions with template literals
2. **Proper scoping** for different parts of logical expressions
3. **Nested template literal support** within logical expressions
4. **State access pattern recognition** for Actor-SPA specific syntax
5. **Complex expression grouping** with parentheses support

## Testing

Use the `test-syntax-highlighting-patterns.ts` file to verify all improvements:

1. Short circuit patterns with various complexity levels
2. Ternary expressions with nested template literals
3. Complex mixed logical expressions
4. Real-world component patterns
5. Edge cases and complex nesting scenarios

## Benefits

These improvements provide:

1. **Better code readability** - easier to distinguish between conditions and content
2. **Faster pattern recognition** - developers can quickly identify logical structures
3. **Reduced cognitive load** - visual hierarchy helps understand complex expressions
4. **Framework-specific highlighting** - Actor-SPA patterns are properly recognized
5. **Consistent theming** - all improvements work across different color schemes

## Implementation Details

The improvements are implemented through:

1. **Enhanced TextMate grammar** (`actor-spa-template-literals.tmLanguage.json`)
2. **New scope definitions** for logical expressions and state access
3. **Updated theme files** with new token color rules
4. **Comprehensive test coverage** for all pattern types

This ensures that complex conditional rendering patterns in Actor-SPA framework templates are properly highlighted and easy to read. 
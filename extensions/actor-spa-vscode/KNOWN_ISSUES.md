# Known Issues

## Complex Nested Templates

### Issue Description
The formatter has limitations when handling deeply nested template literals (3+ levels deep). While simple templates format correctly, complex nested structures may not format as expected.

### Examples of Problematic Patterns

```typescript
// Deep nesting - formatting may be inconsistent
const deeplyNested = html`
  <div>
    ${items.map(item => html`
      <div>
        ${item.children.map(child => html`
          <div>
            ${child.nested.map(n => html`
              <span>${n.value}</span>
            `)}
          </div>
        `)}
      </div>
    `)}
  </div>
`;

// Mixed template types - may not format correctly
const mixedTemplates = html`
  <div>
    <style>
      ${css`
        .container {
          ${theme.dark ? css`
            background: black;
            color: white;
          ` : css`
            background: white;
            color: black;
          `}
        }
      `}
    </style>
  </div>
`;
```

### Best Practice Solution (Not a Workaround!)

We've discovered that extracting complex templates into separate functions is actually a **best practice** that improves code quality, not just a formatter workaround. This pattern offers numerous benefits:

```typescript
// 🎯 Best Practice: Extract templates into functions
const nestedItem = (n: Nested) => html`
  <span>${n.value}</span>
`;

const childItem = (child: Child) => html`
  <div>
    ${child.nested.map(nestedItem)}
  </div>
`;

const itemTemplate = (item: Item) => html`
  <div>
    ${item.children.map(childItem)}
  </div>
`;

// Clean, readable, and perfectly formatted!
const betterApproach = html`
  <div>
    ${items.map(itemTemplate)}
  </div>
`;
```

**Why This Is Better:**
- ✅ **Improved Readability** - Each template has a single, clear purpose
- ✅ **Better Testability** - Test each template function in isolation
- ✅ **Enhanced Reusability** - Share templates across components
- ✅ **Type Safety** - Each function has clear parameter types
- ✅ **Easier Maintenance** - Changes are localized to specific functions
- ✅ **Better Performance** - Can memoize template functions if needed

### Coming Soon: Linter Rule

We're developing a linter rule (`prefer-extracted-templates`) that will encourage this pattern automatically. It will:
- Warn when templates are nested more than 2 levels deep
- Suggest extracting complex templates into functions
- Provide helpful refactoring suggestions

See [Template Best Practices](./docs/TEMPLATE_BEST_PRACTICES.md) for detailed guidelines.

### Alternative Solutions

If you absolutely need complex nested templates inline:

1. **Disable formatting for specific templates:**
   ```typescript
   // biome-ignore format: Complex template
   const complexTemplate = html`...`;
   ```

2. **Use the command palette to format only selections:**
   - Select the code you want to format
   - Press `Cmd/Ctrl + Shift + P`
   - Run "Format Selection"

3. **Configure formatter to skip certain files:**
   ```json
   {
     "actor-spa.formatting.excludePatterns": [
       "**/complex-templates/**"
     ]
   }
   ```

## Other Known Issues

### Issue: Expression Formatting in Edge Cases
Some edge cases with complex expressions inside `${}` may not preserve formatting exactly.

**Solution:** Use parentheses to group complex expressions:
```typescript
const template = html`
  <div>${(someCondition 
    ? complexExpression 
    : otherExpression)}</div>
`;
```

### Issue: Comments in Templates
Comments inside template literals may affect formatting.

**Solution:** Place comments outside the template literal:
```typescript
// Comment about the template
const template = html`
  <div>Content</div>
`;
```

## Reporting Issues

If you encounter other formatting issues:
1. Check if extracting templates improves the situation (it usually does!)
2. Try the alternative solutions above
3. Report the issue on [GitHub](https://github.com/YourUsername/actor-spa-vscode/issues) with a minimal reproduction 
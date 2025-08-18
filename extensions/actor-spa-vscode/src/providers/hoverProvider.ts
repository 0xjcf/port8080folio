import * as vscode from 'vscode';

export class ActorSpaHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
      return;
    }

    const word = document.getText(wordRange);
    const line = document.lineAt(position).text;

    // Check for framework-specific attributes and functions
    const hoverInfo = this.getFrameworkHoverInfo(word, line);
    if (hoverInfo) {
      return new vscode.Hover(hoverInfo, wordRange);
    }

    return;
  }

  private getFrameworkHoverInfo(word: string, _line: string): vscode.MarkdownString | undefined {
    const frameworkInfo: Record<string, string> = {
      send: `
**Actor-SPA Event Attribute**

Sends an event to the state machine when the element is interacted with.

\`\`\`html
<button send="INCREMENT">+</button>
<form send="SUBMIT_FORM">...</form>
\`\`\`

**Automatic Event Creation:**
- Button clicks → event with attributes as properties
- Form submits → event with form data as properties
- All attributes are converted to camelCase
            `,
      payload: `
**Actor-SPA Payload Attribute**

Provides structured data payload for complex events.

\`\`\`html
<button send="COMPLEX_ACTION" payload='{"priority": "high", "data": [1,2,3]}'>
  Action
</button>
\`\`\`

**Usage:**
- Must be valid JSON string
- Creates event: \`{ type: "COMPLEX_ACTION", payload: {...} }\`
            `,
      'data-send': `
**Legacy Actor-SPA Event Attribute**

Legacy version of the \`send\` attribute for backwards compatibility.

\`\`\`html
<button data-send="INCREMENT" data-item-id="123">+</button>
\`\`\`

**Recommendation:** Use \`send\` attribute for new code.
            `,
      html: `
**Actor-SPA Template Literal Function**

Creates safe, reactive HTML templates with automatic XSS protection.

\`\`\`typescript
const template = (state: SnapshotFrom<typeof machine>) => html\`
  <div data-state="\${state.value}">
    <span>\${state.context.count}</span>
  </div>
\`;
\`\`\`

**Features:**
- Automatic HTML escaping
- Template interpolation with \`\${}\`
- Array handling with automatic joining
- Nested template support
            `,
      'state.matches': `
**XState State Matcher**

Checks if the current state matches the given state value.

\`\`\`typescript
state.matches('loading')  // boolean
state.matches({idle: 'editing'})  // nested states
\`\`\`

**Usage in Templates:**
\`\`\`html
\${state.matches('loading') 
  ? html\`<div>Loading...</div>\`
  : html\`<div>Content</div>\`
}
\`\`\`
            `,
      'state.context': `
**XState Context Access**

Access the current context data from the state machine.

\`\`\`typescript
const { count, user, items } = state.context;
\`\`\`

**Usage in Templates:**
\`\`\`html
<span>Count: \${state.context.count}</span>
<p>User: \${state.context.user.name}</p>
\`\`\`
            `,
      each: `
**Function Removed - Use Native Array.map()**

The \`each()\` helper has been removed. Use native JavaScript instead.

\`\`\`typescript
// OLD: each(items, (item, index) => html\`...\`)
// NEW: 
items.map((item, index) => html\`
  <li data-index="\${index}">\${item.name}</li>
\`)
\`\`\`

**Benefits:**
- Native JavaScript performance
- Better TypeScript support
- Standard JavaScript patterns
            `,
      raw: `
**Function Removed - Use Direct HTML**

The \`raw()\` helper has been removed. Use html\`\` templates or direct HTML instead.

\`\`\`typescript
// OLD: raw('<strong>Bold text</strong>')
// NEW: Direct HTML in template
html\`<div><strong>Bold text</strong></div>\`

// Or for trusted content, use direct strings
const trustedHtml = '<strong>Bold text</strong>';
\`\`\`

**Alternatives:**
- Use html\`\` templates for most cases
- Insert trusted HTML strings directly
- Use native JavaScript template strings
            `,
      createComponent: `
**Actor-SPA Component Factory**

Creates a reactive component with automatic lifecycle management.

\`\`\`typescript
const component = createComponent({
  machine: myMachine,
  template: myTemplate
});
\`\`\`

**Features:**
- Automatic actor lifecycle
- Reactive DOM updates
- Event bus integration
- ARIA observer integration
            `,
    };

    const info = frameworkInfo[word];
    if (info) {
      return new vscode.MarkdownString(info);
    }

    // Check for aria attributes
    if (word.startsWith('aria-')) {
      return new vscode.MarkdownString(`
**ARIA Accessibility Attribute**

The \`${word}\` attribute improves accessibility for screen readers and assistive technologies.

**Best Practices:**
- Always provide meaningful values
- Test with screen readers
- Follow ARIA specification guidelines

**More Info:** [ARIA Documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
            `);
    }

    return;
  }
}

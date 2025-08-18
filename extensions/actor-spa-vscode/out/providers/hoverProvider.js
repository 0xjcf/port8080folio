var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: () => m[k] };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : (o, v) => {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActorSpaHoverProvider = void 0;
const vscode = __importStar(require('vscode'));
class ActorSpaHoverProvider {
  provideHover(document, position, _token) {
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
  getFrameworkHoverInfo(word, _line) {
    const frameworkInfo = {
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
**Actor-SPA Each Helper**

Safely iterate over arrays in templates with index support.

\`\`\`typescript
each(items, (item, index) => html\`
  <li data-index="\${index}">\${item.name}</li>
\`)
\`\`\`

**Features:**
- Automatic array joining
- Optional index parameter
- Nested template support
- Safe for empty arrays
            `,
      raw: `
**Actor-SPA Raw HTML Helper**

Insert pre-sanitized HTML content bypassing automatic escaping.

\`\`\`typescript
raw('<strong>Bold text</strong>')
\`\`\`

**⚠️ Security Warning:**
Only use with trusted, pre-sanitized content. This bypasses XSS protection.
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
exports.ActorSpaHoverProvider = ActorSpaHoverProvider;
//# sourceMappingURL=hoverProvider.js.map

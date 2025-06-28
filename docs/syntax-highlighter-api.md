# Syntax Highlighter API Documentation

## Web Component Usage

### Basic Usage
```html
<syntax-highlighter language="javascript">
  // Your code here
</syntax-highlighter>
```

### Attributes
- `language`: Programming language (default: "javascript")
- `highlight-mode`: "default" or "section" (default: "default")
- `highlight-section`: Section to highlight when in section mode
  - Options: "context", "states", "on", "actions", "guards", "invoke"

### Dynamic Control
The component provides interactive controls in the header for toggling highlight modes.

## Programmatic API

### Tokenizer Class

```javascript
import { Tokenizer } from './syntax-highlighter-v2.js';

const tokenizer = new Tokenizer(code, options);
```

#### Options
```javascript
{
  highlightMode: 'default' | 'section',
  highlightSection: 'context' | 'states' | 'on' | 'actions' | 'guards' | 'invoke'
}
```

#### Methods
- `tokenize()`: Returns HTML string with syntax highlighting
- `addToken(type, start, end)`: Add a token (internal use)

#### Token Structure
```javascript
{
  type: string,      // Token type (e.g., 'keyword', 'string', 'contextProperty')
  start: number,     // Start position in code
  end: number,       // End position in code
  value: string,     // Token text
  section: string    // Section this token belongs to
}
```

## VSCode Extension Integration

### Example Implementation
```javascript
// vscode-extension.js
import * as vscode from 'vscode';
import { Tokenizer } from './syntax-highlighter-v2.js';

export function highlightXStateSection(document, section) {
  const code = document.getText();
  const tokenizer = new Tokenizer(code, {
    highlightMode: 'section',
    highlightSection: section
  });
  
  // Get raw tokens instead of HTML
  tokenizer.tokenize();
  const tokens = tokenizer.tokens;
  
  // Create VSCode decorations
  const highlightDecoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 216, 102, 0.3)',
    color: '#FFD866'
  });
  
  const dimDecoration = vscode.window.createTextEditorDecorationType({
    opacity: '0.5'
  });
  
  // Apply decorations based on tokens
  const highlightRanges = [];
  const dimRanges = [];
  
  tokens.forEach(token => {
    const range = new vscode.Range(
      document.positionAt(token.start),
      document.positionAt(token.end)
    );
    
    if (token.section === section) {
      highlightRanges.push(range);
    } else {
      dimRanges.push(range);
    }
  });
  
  // Apply decorations to active editor
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    editor.setDecorations(highlightDecoration, highlightRanges);
    editor.setDecorations(dimDecoration, dimRanges);
  }
}
```

### Command Registration
```javascript
// extension.js
context.subscriptions.push(
  vscode.commands.registerCommand('xstate.highlightContext', () => {
    highlightXStateSection(vscode.window.activeTextEditor.document, 'context');
  })
);
```

## Extending the Highlighter

### Adding New Sections
1. Add section name to the select options in the web component
2. Add section detection in `matchIdentifier()` method:
```javascript
else if (word === 'newSection' && after === ':') {
  this.state.currentSection = word;
  this.state.sectionDepth = this.state.scopeStack.length;
}
```

### Custom Themes
Override CSS variables:
```css
syntax-highlighter {
  --section-highlight: #00FF00;  /* Green highlight */
  --section-dim: #404040;        /* Darker dim */
}
```

### Export Tokens for External Processing
```javascript
class ExtendedTokenizer extends Tokenizer {
  getTokens() {
    this.tokenize();
    return this.tokens;
  }
  
  getTokensBySection(section) {
    return this.getTokens().filter(token => token.section === section);
  }
}
```

## Use Cases

1. **Educational Tools**: Highlight specific parts of XState machines for teaching
2. **Code Reviews**: Focus on specific configuration sections
3. **Debugging**: Isolate context or state definitions
4. **Documentation**: Generate focused code examples
5. **IDE Features**: Quick navigation and section folding
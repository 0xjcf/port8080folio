# Actor-SPA Framework VS Code Extension

The official VS Code extension for the Actor-SPA Framework, providing syntax highlighting, formatting, IntelliSense, and AI communication capabilities for actor-based TypeScript applications.

## Features

### 🎨 Syntax Highlighting
- Full support for `html`, `css`, and `svg` template literals
- Proper highlighting for embedded expressions `${...}`
- XState v5 machine highlighting with state and action recognition
- Proper tag matching and attribute highlighting

### 🔧 Formatting
- **Simple template formatting** for `html` and `css` template literals
- Preserves expressions and maintains proper indentation
- Note: Complex nested templates (3+ levels) have limited support - see [Known Issues](./KNOWN_ISSUES.md)

### 🤖 AI Communication
- Enables seamless AI agent collaboration through XState actors
- Supports external agent integration (Claude, Cursor, etc.)
- Message queue system for reliable communication
- WebSocket server for real-time agent connections

### 💡 IntelliSense
- Auto-completion for HTML tags and CSS properties in template literals
- XState v5 API completions
- Hover information for framework APIs
- Go to definition support

### 🎯 Code Snippets
- Quick scaffolding for actors and machines
- Template literal snippets
- Common patterns and boilerplate

## Installation

1. Install from VS Code Marketplace: [Actor-SPA Framework](https://marketplace.visualstudio.com/items?itemName=actor-spa.actor-spa-framework)
2. Or install manually:
   ```bash
   code --install-extension actor-spa-framework-0.2.3.vsix
   ```

## Usage

### Template Literals

```typescript
// Syntax highlighting and formatting for templates
const template = html`
  <div class="container">
    <h1>${title}</h1>
    <p>${description}</p>
  </div>
`;

// CSS templates with proper highlighting
const styles = css`
  .container {
    padding: 1rem;
    background: var(--bg-color);
  }
`;
```

### XState v5 Support

```typescript
// Full syntax highlighting for state machines
const machine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: {
      on: { TOGGLE: 'active' }
    },
    active: {
      on: { TOGGLE: 'inactive' }
    }
  }
});
```

## Template Best Practices

We've discovered that extracting complex nested templates into separate functions is not just a workaround for formatter limitations - it's actually a best practice that improves code quality.

### ❌ Avoid: Deeply Nested Templates

```typescript
// Hard to read, maintain, and format
const badExample = html`
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
```

### ✅ Prefer: Extracted Template Functions

```typescript
// Clear, testable, and reusable
const childTemplate = (child: Child) => html`
  <span>${child.value}</span>
`;

const itemTemplate = (item: Item) => html`
  <div>
    ${item.children.map(childTemplate)}
  </div>
`;

const goodExample = html`
  <div>
    ${items.map(itemTemplate)}
  </div>
`;
```

**Benefits:**
- Improved readability and maintainability
- Better testability (each template function can be tested in isolation)
- Enhanced reusability across components
- Natural component boundaries
- Better type safety and IntelliSense support

**Coming Soon:** A linter rule (`prefer-extracted-templates`) will help enforce this pattern automatically. See [Template Best Practices](./docs/TEMPLATE_BEST_PRACTICES.md) for more details.

## Configuration

### Extension Settings

- `actor-spa.formatting.enable`: Enable/disable template formatting
- `actor-spa.ai.enableCommunication`: Enable AI agent communication
- `actor-spa.ai.communicationPort`: WebSocket port for AI agents (default: 3000)
- `actor-spa.debug.logLevel`: Debug logging level (error, warn, info, debug)

### Formatting Configuration

You can disable formatting for specific templates:

```typescript
// biome-ignore format: Complex nested template
const complexTemplate = html`...`;
```

## AI Agent Integration

The extension provides a powerful AI communication system for external agents:

```typescript
// In your VS Code extension or external agent
import { createActor } from 'xstate';
import { aiCommunicationBridge } from 'actor-spa-vscode';

const bridge = createActor(aiCommunicationBridge);
bridge.start();

// Send messages to AI agents
bridge.send({
  type: 'SEND_MESSAGE',
  payload: {
    content: 'Analyze this component',
    metadata: { file: 'component.ts' }
  }
});
```

See [AI Communication Guide](./docs/AI_COMMUNICATION_GUIDE.md) for detailed integration instructions.

## Known Issues

- Complex nested templates (3+ levels deep) may not format correctly
- Mixed template types in the same expression have limited support
- See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) for workarounds

## Development

```bash
# Install dependencies
pnpm install

# Compile and watch
pnpm run watch

# Run tests
pnpm test

# Package extension
pnpm run package
```

## Changelog

### v0.2.3
- Fixed all linter and type errors
- Simplified formatter to focus on simple templates
- Added comprehensive documentation for known limitations
- Introduced template best practices guide
- Prepared for upcoming `prefer-extracted-templates` linter rule

### v0.2.0
- Added AI communication system with XState actors
- WebSocket server for external agent connections
- Message queue for reliable communication

### v0.1.0
- Initial release
- Basic syntax highlighting for template literals
- XState v5 support

## License

MIT

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## Support

- [GitHub Issues](https://github.com/YourUsername/actor-spa-vscode/issues)
- [Documentation](./docs/)
- [Discord Community](https://discord.gg/actor-spa) 
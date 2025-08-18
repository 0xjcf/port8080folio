# Actor-SPA VS Code Extension Development Guide

## Overview

This guide covers the development, testing, and deployment of the Actor-SPA VS Code extension, which provides comprehensive language support for the Actor-SPA framework including syntax highlighting, IntelliSense, formatting, and validation.

## Architecture

### Core Components

1. **Extension Entry Point** (`src/extension.ts`)
   - Registers all language providers
   - Manages extension lifecycle
   - Handles configuration changes

2. **Language Service Providers** (`src/providers/`)
   - `completionProvider.ts` - Auto-completion within template literals
   - `hoverProvider.ts` - Contextual help and documentation
   - `validationProvider.ts` - Template validation and diagnostics
   - `definitionProvider.ts` - Go-to-definition and find references
   - `formattingProvider.ts` - Document and range formatting

3. **TypeScript Server Plugin** (`src/typescript-plugin.ts`)
   - Enhances TypeScript language service
   - Provides framework-specific IntelliSense

4. **TextMate Grammars** (`syntaxes/`)
   - `actor-spa-html-injection.tmLanguage.json` - HTML syntax injection
   - `actor-spa-css-injection.tmLanguage.json` - CSS syntax injection
   - `xstate-injection.tmLanguage.json` - XState machine highlighting

## Features

### Syntax Highlighting

The extension uses TextMate grammar injection to provide syntax highlighting for:

- **HTML Template Literals**: `html`` with full HTML tokenization
- **CSS Template Literals**: `css`` with complete CSS syntax
- **Framework Attributes**: `send`, `payload`, `send:*` attributes
- **XState Machines**: State machine definitions with specialized highlighting

### IntelliSense & Completions

Intelligent auto-completion for:

- HTML elements and attributes within `html`` templates
- CSS properties and values within `css`` templates
- Framework-specific attributes and values
- XState machine configurations

### Formatting Support

**NEW**: Comprehensive formatting for template literals:

- **HTML Formatting**: Automatic formatting of HTML content within `html`` templates
- **CSS Formatting**: Automatic formatting of CSS content within `css`` templates
- **Template Expression Handling**: Proper handling of `${...}` expressions
- **Configurable Settings**: Customizable indentation and formatting options

#### Formatting Implementation

The formatting provider (`formattingProvider.ts`) works by:

1. **Template Detection**: Uses regex to find `html`` and `css`` template literals
2. **Content Extraction**: Extracts the content between the backticks
3. **Temporary Document Creation**: Creates temporary HTML/CSS documents
4. **Built-in Formatter Usage**: Uses VS Code's built-in HTML/CSS formatters
5. **Template Reconstruction**: Applies formatting and reconstructs the template

#### Configuration Options

```json
{
  "actor-spa.formatting.enabled": true,
  "actor-spa.formatting.htmlIndentSize": 2,
  "actor-spa.formatting.cssIndentSize": 2,
  "actor-spa.formatting.preserveNewlines": true
}
```

### Validation & Diagnostics

- Template syntax validation
- Framework attribute validation
- Accessibility checks
- XState machine validation

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- pnpm package manager
- VS Code

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/port8080folio.git
cd port8080folio/extensions/actor-spa-vscode

# Install dependencies
pnpm install

# Compile TypeScript
pnpm run compile
```

### Development Workflow

1. **Start Development Mode**
   ```bash
   pnpm run dev
   ```

2. **Watch for Changes**
   ```bash
   pnpm run watch
   ```

3. **Launch Extension Host**
   - Press `F5` in VS Code
   - Or use the Debug panel and select "Run Extension"

4. **Test Changes**
   - Open the Extension Development Host window
   - Create test files with `html`` and `css`` templates
   - Test formatting with `Alt+Shift+F` or `Ctrl+K Ctrl+F`

### Testing

#### Manual Testing

Create test files with various template literal scenarios:

```typescript
// test-formatting.ts
const template = html`
<div>
<h1>Test</h1>
<p>Content</p>
</div>
`;

const styles = css`
.container {
display: flex;
gap: 16px;
}
`;
```

#### Automated Testing

```bash
# Run all tests
pnpm run test

# Run specific test suites
pnpm run test -- --grep "formatting"
```

### Debugging

1. **Extension Host Debugging**
   - Set breakpoints in TypeScript files
   - Use VS Code's debugger (F5)
   - Check Debug Console for logs

2. **Grammar Debugging**
   - Use "Developer: Inspect Editor Tokens and Scopes"
   - Check TextMate scope assignments
   - Verify grammar injection is working

3. **Formatting Debugging**
   - Enable debug logging in `formattingProvider.ts`
   - Check console.log output in Extension Host
   - Test with various template configurations

## Code Quality

### Linting and Formatting

```bash
# Check code quality
pnpm run check

# Format code
pnpm run format

# Lint code
pnpm run lint
```

### Code Standards

- Follow TypeScript strict mode
- Use explicit types (avoid `any`)
- Prefer full names over abbreviations
- Add JSDoc comments for public APIs
- Use `const` for immutable values

## Packaging and Distribution

### Local Testing

```bash
# Package extension
pnpm run package

# Install locally
pnpm run install-local
```

### Publishing

```bash
# Publish to VS Code Marketplace
pnpm run publish
```

## Contributing

### Adding New Features

1. **Language Features**
   - Add new providers in `src/providers/`
   - Register in `src/extension.ts`
   - Update `package.json` contributions

2. **Grammar Features**
   - Modify TextMate grammar files
   - Test with various code samples
   - Update themes if needed

3. **Formatting Features**
   - Extend `formattingProvider.ts`
   - Add configuration options
   - Test with edge cases

### Testing Guidelines

1. **Test Template Literals**
   - Various HTML structures
   - Complex CSS rules
   - Nested template expressions
   - Malformed content

2. **Test Formatting**
   - Document formatting (`Alt+Shift+F`)
   - Range formatting (`Ctrl+K Ctrl+F`)
   - Configuration changes
   - Edge cases and error handling

3. **Test Integration**
   - TypeScript files (.ts)
   - JavaScript files (.js)
   - React files (.tsx, .jsx)
   - Various VS Code versions

## Troubleshooting

### Common Issues

1. **Grammar Not Applied**
   - Check `package.json` grammar contributions
   - Verify file extensions in `injectTo`
   - Reload VS Code window

2. **Formatting Not Working**
   - Check configuration settings
   - Verify template literal syntax
   - Check console for errors

3. **Extension Not Loading**
   - Check `package.json` activation events
   - Verify TypeScript compilation
   - Check extension console logs

### Debug Steps

1. **Enable Debug Logging**
   ```typescript
   console.log('Debug info:', { variable });
   ```

2. **Check Extension Host Console**
   - Help → Toggle Developer Tools
   - Check Console tab for errors

3. **Test in Clean Environment**
   - Disable other extensions
   - Use minimal test files
   - Check VS Code version compatibility

## Future Enhancements

### Planned Features

1. **Enhanced Formatting**
   - Prettier integration
   - Custom formatting rules
   - Better template expression handling

2. **Advanced Validation**
   - HTML accessibility checks
   - CSS property validation
   - Framework-specific linting

3. **Performance Improvements**
   - Incremental parsing
   - Caching for large files
   - Background processing

4. **Additional Language Support**
   - Vue.js templates
   - Svelte components
   - Angular templates

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [TextMate Grammar Guide](https://macromates.com/manual/en/language_grammars)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines) 
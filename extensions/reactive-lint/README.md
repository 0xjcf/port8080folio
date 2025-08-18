# @actor-spa/reactive-lint

> **Version 1.1.0** - Production-ready AST-based linter for reactive patterns in Actor-SPA framework.

Detects anti-patterns and guides developers toward proper state machine usage with comprehensive reporting and CI/CD integration.

## ✨ Features

- 🔍 **AST-based analysis** - Precise detection using TypeScript compiler API
- ⚡ **Parallel processing** - Fast scanning with configurable concurrency
- 📊 **Multiple output formats** - Pretty console, JSON, SARIF formats
- 🎯 **7 comprehensive rules** - Covers DOM, events, async, state, and templates
- 🏗️ **Event-driven architecture** - XState orchestration with reactive event bus
- 🚀 **Production ready** - Full CLI, proper exit codes, CI/CD integration
- 📈 **Performance metrics** - Timing, statistics, and detailed reporting

## 🚀 Quick Start

```bash
# Install globally
npm install -g @actor-spa/reactive-lint

# Or install locally
npm install --save-dev @actor-spa/reactive-lint

# Run the linter
reactive-lint src/**/*.ts

# Pretty output (default)
reactive-lint --format pretty src/

# JSON for CI/CD
reactive-lint --format json src/ > results.json

# SARIF for GitHub Security
reactive-lint --format sarif src/ > results.sarif

# Show available rules
reactive-lint rules
```

## 📖 Usage

### Command Line Interface

```bash
# Basic usage
reactive-lint [patterns...]

# Options
reactive-lint src/ --format json --config ./my-config.yaml
reactive-lint src/ --verbose --max-concurrency 8
reactive-lint src/ --exit-code --format sarif

# Show help
reactive-lint --help

# List all rules with descriptions
reactive-lint rules
```

### Output Formats

#### Pretty (Human-readable)
```
🔍 Reactive Lint - Actor-SPA Pattern Analysis
Files: 3
Rules: no-dom-query, no-event-listeners, no-dom-manipulation...

❌ ERROR src/component.ts:42:15 Use reactive refs instead of DOM queries (no-dom-query)
⚠️ WARNING src/state.ts:18:5 Boolean flag should be machine state (no-context-booleans)

Summary:
  ❌ 2 errors
  ⚠️ 3 warnings
  📄 3 files scanned
  ⏱️ 145ms

❌ Found errors that must be fixed.
```

#### JSON (Machine-readable)
```json
{
  "version": "1.1.0",
  "timestamp": "2025-07-08T19:38:25.610Z",
  "summary": {
    "filesScanned": 3,
    "violations": 5,
    "errors": 2,
    "warnings": 3,
    "duration": 145
  },
  "violations": [...]
}
```

#### SARIF (GitHub Security)
```json
{
  "version": "2.1.0",
  "$schema": "https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0.json",
  "runs": [...]
}
```

## ⚙️ Configuration

Create `config.yaml` in your project root:

```yaml
engine: ast
maxConcurrency: 4

include:
  - "src/**/*.{ts,tsx,js,jsx}"

exclude:
  - "node_modules/**"
  - "dist/**"
  - "test/**"

rules:
  no-dom-query:
    severity: error
  
  no-event-listeners:
    severity: error
    
  no-dom-manipulation:
    severity: error
    
  no-timers:
    severity: error
    
  no-context-booleans:
    severity: warning
    
  no-multiple-data-attributes:
    severity: error
    
  prefer-extracted-templates:
    severity: warning

exitCode:
  onError: 1
  onWarning: 0
```

## 📋 Available Rules

| Rule | Category | Fixable | Description |
|------|----------|---------|-------------|
| `no-dom-query` | DOM | 🔧 | Avoid direct DOM queries (querySelector, getElementById, etc.) |
| `no-event-listeners` | Events | ❌ | Use declarative event mapping instead of addEventListener |
| `no-dom-manipulation` | DOM | 🔧 | Use template functions instead of direct DOM manipulation |
| `no-timers` | Async | ❌ | Use XState delayed transitions or services for async operations |
| `no-context-booleans` | State | ❌ | Use machine states instead of boolean flags in context |
| `no-multiple-data-attributes` | Styling | 🔧 | Use single data-state attribute instead of multiple data attributes |
| `prefer-extracted-templates` | Templates | 🔧 | Limit template nesting depth and encourage extraction |

**Legend:** 🔧 = Auto-fixable, ❌ = Manual fix required

## 🏗️ Architecture

```
src/
├── cli.ts                 # CLI entry point with commander.js
├── types.ts              # TypeScript definitions
├── core/
│   ├── event-bus.ts      # Reactive event bus with statistics
│   └── linter.ts         # XState-orchestrated main linter
├── reporters/
│   ├── index.ts          # Reporter factory and registry
│   ├── pretty.ts         # Colorized console output with chalk
│   ├── json.ts           # Structured JSON for CI/CD
│   └── sarif.ts          # GitHub Security tab integration
└── rules/
    ├── index.ts          # Rule loader and registry
    ├── base.ts           # Base rule class with utilities
    ├── no-dom-query.ts   # DOM query detection
    ├── no-event-listeners.ts # Event listener detection
    ├── no-dom-manipulation.ts # DOM manipulation detection
    ├── no-timers.ts      # Timer usage detection
    ├── no-context-booleans.ts # Boolean context detection
    ├── no-multiple-data-attributes.ts # Data attribute analysis
    └── prefer-extracted-templates.ts # Template nesting analysis
```

## 🔧 Development

```bash
# Clone and setup
git clone <repo>
cd extensions/reactive-lint
pnpm install

# Development workflow
pnpm run build:watch     # Watch mode compilation
pnpm run dev             # Run with tsx for testing
pnpm run test            # Run test suite
pnpm run lint            # Code quality checks

# Production build
pnpm run build           # Compile to dist/
pnpm run prepublishOnly  # Full quality pipeline
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: Reactive Lint
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install -g @actor-spa/reactive-lint
        
      - name: Run Reactive Lint
        run: reactive-lint --format sarif src/ > reactive-lint.sarif
        
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: reactive-lint.sarif
```

### NPM Scripts

```json
{
  "scripts": {
    "lint:reactive": "reactive-lint src/",
    "lint:reactive:ci": "reactive-lint --format json src/ > reactive-lint.json",
    "lint:reactive:sarif": "reactive-lint --format sarif src/ > reactive-lint.sarif"
  }
}
```

## 📊 Performance

- **Fast AST parsing** with ts-morph
- **Parallel file processing** (configurable concurrency)
- **Event-driven architecture** for real-time feedback
- **Memory efficient** with file cleanup after processing
- **Typical performance**: ~50-100 files/second depending on complexity

## 🤝 Contributing

1. **Add new rules**: Implement `Rule` interface in `src/rules/`
2. **Extend reporters**: Add new output formats in `src/reporters/`
3. **Improve performance**: Optimize AST traversal or parallel processing
4. **Write tests**: Add test cases for new functionality
5. **Update docs**: Keep README and CHANGELOG current

## 📜 License

MIT - See [LICENSE](./LICENSE) file for details.

## 🔗 Related

- [Actor-SPA Framework](../../README.md) - Main framework documentation
- [VSCode Extension](../actor-spa-vscode/) - IDE integration
- [Template Best Practices](../../docs/TEMPLATE_BEST_PRACTICES.md) - Template guidelines

---

**Version 1.1.0** - Ready for production use! 🎉 
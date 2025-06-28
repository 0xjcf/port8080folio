# Proposed Project Structure

## Current Structure Issues
- Test files mixed with production code
- Deprecated components still present
- No clear separation between different component types
- Unused files cluttering the project

## Proposed New Structure

```
port8080folio/
├── public/                    # Static assets
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── images/
│       ├── me.jpeg
│       ├── José C. Flores.png
│       ├── brandpost1.png
│       ├── brandpost2.png
│       └── wftmb.avif
│
├── src/                       # Source code
│   ├── components/           # All components
│   │   ├── sections/        # Page sections
│   │   │   ├── hero-section-enhanced.js
│   │   │   ├── about-section.js
│   │   │   ├── projects-section.js
│   │   │   └── blog-posts.js
│   │   │
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── project-card.js
│   │   │   ├── brand-icon.js
│   │   │   ├── privacy-notice.js
│   │   │   └── syntax-highlighter-with-themes.js
│   │   │
│   │   ├── state-machine/   # State machine education
│   │   │   ├── state-machine-intro.js
│   │   │   ├── state-machine-concepts-enhanced.js
│   │   │   ├── state-machine-diagram-enhanced.js
│   │   │   ├── state-machine-evolution.js
│   │   │   ├── state-machine-progression.js
│   │   │   ├── state-machine-benefits.js
│   │   │   └── state-machine-code-example.js
│   │   │
│   │   ├── demos/           # Interactive demos
│   │   │   ├── coffee-shop-app-clean.js
│   │   │   ├── actor-architecture-diagram.js
│   │   │   └── actors/
│   │   │       ├── customer-actor-ui.js
│   │   │       ├── cashier-actor-ui.js
│   │   │       ├── barista-actor-ui.js
│   │   │       └── actor-ui.css
│   │   │
│   │   └── tokenizer/       # Syntax highlighting system
│   │       ├── index.js
│   │       ├── tokenizer.js
│   │       ├── lexer.js
│   │       ├── jsx-lexer.js
│   │       ├── xstate-lexer.js
│   │       ├── parser.js
│   │       ├── jsx-parser.js
│   │       ├── renderer.js
│   │       └── syntax-highlighter-v3.js
│   │
│   ├── styles/              # Stylesheets
│   │   ├── main.css        # (renamed from styles.css)
│   │   └── state-machine-education.css
│   │
│   └── scripts/            # JavaScript files
│       └── main.js         # (renamed from index.js)
│
├── tests/                   # All test files
│   ├── test-tokenizer.html
│   ├── test-simple-tokenizer.html
│   └── modules/
│       ├── v2-test-basic.js
│       ├── v2-test-jsx.js
│       └── ... (other test modules)
│
├── intake/                  # Intake form (separate app)
│   ├── intake.html
│   ├── intake-form.js
│   └── styles.css
│
├── docs/                    # Documentation
│   ├── README.md
│   ├── BRAND.md
│   ├── Claude.md
│   ├── marketing.md
│   └── syntax-highlighter-api.md
│
├── index.html              # Main page
├── privacy-policy.html     # Privacy policy
├── 404.html               # Error page
├── package.json           # Dependencies (if needed)
└── .gitignore            # Git ignore file
```

## Benefits of This Structure

1. **Clear Separation**: Production code in `src/`, tests in `tests/`, docs in `docs/`
2. **Component Organization**: Components grouped by purpose (sections, ui, demos, etc.)
3. **Asset Management**: All static assets in `public/`
4. **Maintainability**: Easy to find and update files
5. **Build-Ready**: Structure supports future build process additions
6. **Clean Root**: Only essential HTML files in root

## Migration Steps

1. Create new directory structure
2. Move files to appropriate locations
3. Update all import paths
4. Remove deprecated files
5. Test everything still works
6. Update documentation

## Files to Remove

### Deprecated Components
- `components/hero-section.js`
- `components/state-machine-concepts.js`
- `components/state-machine-diagram.js`
- `components/syntax-highlighter.js`
- `components/syntax-highlighter-v2.js`
- `components/code-highlight.js`
- `components/code-block.js`
- `components/code-block-simple.js`

### Unused Actor Files
- `components/actors/barista-machine-actor.js`
- `components/actors/cashier-machine-actor.js`
- `components/actors/customer-machine-actor.js`
- `components/actors/coffee-shop-orchestrator.js`
- `components/actors/message-log-actor.js`
- `components/actors/actor-component.js`
- `components/actors/actor-ui.js`

### Test Files (move to tests/)
- All `test-*.html` files
- `test-modules/` directory

### Unused Code Examples
- Review `components/code-examples/` - likely not needed as separate files
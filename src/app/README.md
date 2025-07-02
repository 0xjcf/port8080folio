# Portfolio Application

This directory contains portfolio-specific code that uses the framework located in `../framework/`.

## Hybrid Approach Philosophy

Following our Framework-First Strategy, this structure demonstrates:

1. **Clear Boundary**: Framework code in `../framework/` never imports from `../app/`
2. **Portfolio Validation**: Every framework feature is validated through real portfolio use cases
3. **Continuous Extraction**: Generic patterns get moved to framework as they emerge

## Directory Structure

```
src/
├── framework/                    # Generic framework (future @actor-spa package)
│   ├── core/                    # Core base classes and utilities
│   ├── router/                  # Generic SPA router (Phase 0.2)
│   ├── ui-orchestrator/         # Generic UI coordinator (Phase 0.2)
│   └── patterns/                # Reusable patterns (extracted as they emerge)
└── app/                         # Portfolio-specific implementation
    ├── actors/                  # Portfolio-specific actors
    │   ├── navigation/          # Portfolio navigation actor
    │   ├── content/             # Portfolio content management
    │   └── forms/               # Portfolio form handling
    ├── components/              # Portfolio-specific components
    │   ├── organisms/           # Complex portfolio components
    │   └── templates/           # Page templates
    └── config/                  # Portfolio-specific configuration
```

## Implementation Order

### Phase 0.2: Navigation Actor (Using Framework)
- Implement portfolio navigation using `BaseActor` and `BaseController`
- Extract generic router patterns to `../framework/router/`
- Validate framework patterns work for real use case

### Phase 0.3: Forms Actor (Using Framework)
- Implement newsletter/contact forms using framework
- Extract generic form patterns to `../framework/patterns/`
- Validate form handling approaches

### Phase 0.4: Content Actor (Using Framework)
- Implement blog/case study content management
- Extract content patterns to framework if generic enough
- Keep portfolio-specific content logic in app

## Key Principles

1. **Portfolio Uses Framework**: Never the other way around
2. **Real Use Cases**: No speculative framework features
3. **Extract When Generic**: Move reusable patterns to framework immediately
4. **Keep Specific Here**: Portfolio branding, content, custom logic stays in app

This approach ensures we build a robust, reusable framework while making real progress on the portfolio. 
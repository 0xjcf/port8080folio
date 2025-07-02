# Actor-SPA Framework Architecture

## Overview

The Actor-SPA framework is an extractable, modular approach to building Single Page Applications using XState actors and Web Components. This document outlines the framework's architecture and how it separates from application code.

## Core Philosophy

1. **Actor-based state management** - All state lives in XState actors
2. **Web Components for UI** - Framework-agnostic view layer
3. **Progressive enhancement** - Works without JavaScript
4. **Zero-build development** - Uses import maps and ES modules
5. **Type-safe** - Full TypeScript support

## Framework Structure

```
actor-spa/
├── framework/                    # Extractable framework code
│   ├── actors/
│   │   ├── router/              # Generic SPA router
│   │   ├── ui-orchestrator/     # UI coordination
│   │   └── base/                # Base actor utilities
│   ├── components/
│   │   ├── app-shell/           # Main app container
│   │   ├── templates/           # Base page templates
│   │   └── primitives/          # Core UI primitives
│   ├── utilities/
│   │   ├── history/             # Browser history management
│   │   ├── seo/                 # Meta tags & structured data
│   │   ├── code-splitting/      # Dynamic imports
│   │   └── accessibility/       # A11y helpers
│   └── dev-tools/
│       ├── inspector/           # Actor visualization
│       └── testing/             # Test utilities
│
└── app/                         # Your application code
    ├── actors/                  # App-specific actors
    ├── components/              # App-specific components
    └── pages/                   # Page implementations
```

## Key Framework Components

### 1. Router Actor
Manages browser history and client-side navigation with built-in:
- History state management
- Scroll position restoration  
- Route prefetching
- Code splitting support
- SEO meta tag updates

### 2. UI Orchestrator
Coordinates all actors and provides:
- Actor lifecycle management
- Inter-actor communication
- Global state coordination
- Plugin system support
- Error boundaries

### 3. Base Templates
Provides progressive enhancement patterns:
```typescript
abstract class BaseTemplate extends HTMLElement {
    abstract enhance(): void;  // Enhance existing HTML
    abstract render(): void;   // Full client render
}
```

### 4. Development Tools
- XState Inspector integration
- Performance monitoring
- Actor relationship visualization
- Testing utilities

## Framework API

### Creating an App
```typescript
import { createActorSPA } from 'actor-spa';

const app = createActorSPA({
    router: {
        routes: [...],
        prefetchStrategy: 'hover'
    },
    seo: {
        defaultMeta: {...}
    },
    plugins: [
        analyticsPlugin,
        i18nPlugin
    ]
});

app.start();
```

### Creating Actors
```typescript
import { createActor } from 'actor-spa';

export const searchActor = createActor({
    id: 'search',
    machine: searchMachine,
    actions: searchActions
});
```

### Plugin System
```typescript
interface ActorSPAPlugin {
    name: string;
    install(app: ActorSPAApp): void;
}

const myPlugin: ActorSPAPlugin = {
    name: 'my-plugin',
    install(app) {
        app.registerActor('custom', customActor);
        app.on('route:change', handleRouteChange);
    }
};
```

## Framework vs Application Separation

### Framework Responsibilities
- Router and history management
- Actor lifecycle and communication
- Base component patterns
- Development tools
- Performance optimizations
- Accessibility infrastructure

### Application Responsibilities  
- Business logic and actors
- UI components and styling
- Page content and structure
- API integrations
- Analytics and tracking
- App-specific features

## Benefits of This Architecture

1. **Reusability** - Framework can be used for multiple projects
2. **Maintainability** - Clear separation of concerns
3. **Testability** - Framework and app can be tested independently
4. **Upgradability** - Update framework without touching app code
5. **Community** - Can be open-sourced and improved by others

## Future Extraction Plan

When ready to extract as a library:

1. Move `src/framework/` to separate repository
2. Publish as `@your-org/actor-spa` on npm
3. Update imports in application code
4. Add versioning and changelog
5. Create documentation site
6. Add example projects

## Comparison to Other Frameworks

| Feature | Actor-SPA | React | Vue | Svelte |
|---------|-----------|--------|-----|---------|
| State Management | Built-in (XState) | External | Vuex/Pinia | Stores |
| Components | Web Components | React Components | Vue Components | Svelte Components |
| Build Step | Optional | Required | Required | Required |
| TypeScript | First-class | Good | Good | Good |
| Bundle Size | ~50KB | ~45KB | ~34KB | ~10KB |
| Progressive Enhancement | Native | Possible | Possible | Possible |
| Framework Lock-in | None | High | Medium | Medium |

## Conclusion

The Actor-SPA framework provides a modern, modular approach to building SPAs that:
- Embraces web standards
- Provides excellent DX
- Scales from simple to complex apps
- Can be extracted and shared
- Maintains flexibility and upgradability 
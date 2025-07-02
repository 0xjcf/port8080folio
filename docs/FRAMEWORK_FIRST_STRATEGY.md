# Framework-First Implementation Strategy

## Recommended Approach: Hybrid Framework-Through-Features

After analyzing the options, I recommend a **hybrid approach** that builds the framework through concrete portfolio features. This gives us the architectural benefits of framework-first with the practical validation of portfolio-first.

## Why Not Pure Framework-First?

### Risks of Pure Framework-First:
1. **Over-engineering** - Building abstractions without real use cases
2. **Analysis paralysis** - Too many decisions without constraints
3. **Delayed value** - No visible progress for stakeholders
4. **Wrong abstractions** - Patterns that don't fit real needs

### Risks of Pure Portfolio-First:
1. **Technical debt** - Shortcuts become permanent
2. **Difficult extraction** - Framework and app code intertwined
3. **Inconsistent patterns** - Each feature solved differently
4. **Refactoring burden** - Major rewrites for extraction

## Recommended: Modified Phase 0 Approach

### Phase 0.1: Framework Structure (3 days)
```
src/
├── framework/                    # Future @actor-spa package
│   ├── core/                    # Core abstractions
│   │   ├── actor-base.ts
│   │   ├── controller-base.ts
│   │   └── component-base.ts
│   ├── router/                  # Generic router
│   ├── ui-orchestrator/         # Generic coordinator
│   └── patterns/                # Reusable patterns
│       ├── error-boundary.ts
│       ├── data-persistence.ts
│       └── accessibility.ts
└── app/                         # Portfolio implementation
    ├── actors/
    ├── components/
    └── pages/
```

### Phase 0.2: Core Framework Components (1 week)
Build these generic framework pieces FIRST:

1. **BaseActor Class**
```typescript
// framework/core/actor-base.ts
export abstract class BaseActor<TContext, TEvent> {
    abstract machine: StateMachine<TContext, TEvent>;
    abstract actions: Record<string, Action>;
    
    // Common functionality all actors need
    protected setupErrorBoundary() {}
    protected enablePersistence() {}
    protected setupDevTools() {}
}
```

2. **BaseController Class**
```typescript
// framework/core/controller-base.ts
export abstract class BaseController<TComponent extends HTMLElement> {
    protected component: TComponent;
    protected actor: AnyActor;
    
    // Common controller patterns
    protected syncDataState() {}
    protected setupEventListeners() {}
    protected cleanup() {}
}
```

3. **Router Foundation**
```typescript
// framework/router/index.ts
export function createRouter(config: RouterConfig) {
    // Generic SPA router that any app can use
}
```

### Phase 0.3: First Portfolio Feature Using Framework (1 week)
Implement navigation using the framework:

```typescript
// app/actors/navigation/navigation-actor.ts
import { BaseActor } from '@framework/core/actor-base';

export class NavigationActor extends BaseActor<NavContext, NavEvent> {
    // Portfolio-specific navigation logic
    // But using framework patterns
}
```

## Modified Implementation Order

### Week 1-2: Framework Foundation Through Navigation
1. Create framework structure
2. Build base classes
3. Implement generic router
4. Create navigation actor using framework
5. Validate patterns work

### Week 3-4: Forms Framework Through Portfolio Forms
1. Create generic form patterns in framework
2. Build form validation strategies
3. Implement newsletter form using patterns
4. Extract reusable form components

### Week 5-6: Search & Content Patterns
1. Build generic search actor pattern
2. Create content management patterns
3. Implement portfolio search
4. Validate performance patterns

### Week 7-8: Testing & Deployment Framework
1. Create testing utilities in framework
2. Build deployment abstractions
3. Test portfolio with framework tools
4. Prepare for extraction

## Key Principles

### 1. Clear Boundaries from Day One
```typescript
// ❌ Bad: Mixed concerns
import { portfolioConfig } from '../config';
export class Router { }

// ✅ Good: Clean separation  
export class Router {
    constructor(private config: RouterConfig) { }
}
```

### 2. Portfolio Validates Framework
- Every framework feature must be used by portfolio
- No speculative abstractions
- Real use cases drive design

### 3. Continuous Extraction
- After each feature, evaluate what's generic
- Move generic patterns to framework immediately
- Keep portfolio-specific code in app/

## Success Metrics

### Framework Quality
- [ ] Zero portfolio imports in framework/
- [ ] All framework code has tests
- [ ] Framework can be npm installed
- [ ] Clear API documentation

### Portfolio Progress  
- [ ] Visible progress each week
- [ ] All features use framework
- [ ] No framework code in app/
- [ ] Easy to understand structure

## Decision Tree

```
For each new feature:
1. Can this be generic? → Build in framework/
2. Is it portfolio-specific? → Build in app/
3. Mixed? → Generic parts in framework/, specific in app/
4. Unsure? → Build in app/, refactor later
```

## Example: Building Navigation

### Step 1: Framework Pattern
```typescript
// framework/patterns/navigation.ts
export interface NavigationPattern {
    routes: Route[];
    getCurrentRoute(): string;
    navigate(path: string): void;
    onRouteChange(callback: Function): void;
}
```

### Step 2: Portfolio Implementation
```typescript
// app/actors/navigation/index.ts
import { NavigationPattern } from '@framework/patterns/navigation';

export class PortfolioNavigation implements NavigationPattern {
    routes = [
        { path: '/', component: HomePage },
        { path: '/about', component: AboutPage }
    ];
    // Portfolio-specific implementation
}
```

### Step 3: Extract Generic Parts
```typescript
// framework/actors/navigation/base.ts
export abstract class BaseNavigationActor {
    // Common navigation logic extracted
}
```

## Conclusion

The hybrid approach gives us:
1. **Clean architecture** from the start
2. **Real validation** through portfolio features  
3. **Continuous extraction** as patterns emerge
4. **Visible progress** for stakeholders
5. **Reusable framework** as a byproduct

Start with framework structure, but build it through real features. This way, you're always making progress on both goals simultaneously. 
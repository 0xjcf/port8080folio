# Website Restructure & Architecture Implementation Plan

## Project Overview
Transform the current single-page portfolio into a structured multi-page website with actor-based architecture, comprehensive accessibility, and modern design patterns while maintaining the 5 levels of market awareness on the home page.

## Current State
- Single-page portfolio with coffee shop demo
- Long scrolling experience (user feedback: "too big")
- State machine education integrated into home page
- Working actor-based coffee shop demo
- Mix of JavaScript and TypeScript components
- Inconsistent state management patterns
- Manual ARIA attribute management

## Target Architecture
```
/
├── index.html                     # Single entry point for the SPA
├── src/
│   ├── actors/                    # Feature-based actors with their components
│   │   ├── navigation/
│   │   │   └── components/        # Navigation atoms/molecules
│   │   ├── forms/
│   │   │   └── components/        # Form atoms/molecules
│   │   ├── search/
│   │   │   └── components/        # Search atoms/molecules
│   │   ├── content/
│   │   │   └── components/        # Content atoms/molecules
│   │   ├── router/                # Client-side routing actor
│   │   │   ├── machine.ts
│   │   │   ├── controller.ts
│   │   │   └── actions.ts
│   │   └── ui-orchestrator/
│   ├── shared/
│   │   ├── atoms/                 # Cross-actor atoms
│   │   ├── molecules/             # Cross-actor molecules
│   │   └── utilities/
│   ├── components/
│   │   ├── organisms/             # Complex components
│   │   └── templates/             # Page templates
│   │       ├── home-page.ts
│   │       ├── about-page.ts
│   │       ├── blog-page.ts
│   │       ├── case-studies-page.ts
│   │       └── resources-page.ts
│   └── styles/
│       ├── tokens/
│       ├── themes/
│       └── mixins/
└── public/                        # Static assets
    ├── robots.txt
    └── sitemap.xml
```

**Note**: Single `index.html` imports the app shell and router. The router actor handles client-side navigation between page templates, maintaining clean URLs with the History API.

Example root `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Portfolio</title>
    <link rel="stylesheet" href="/dist/styles/main.css">
    <script type="importmap">
    {
        "imports": {
            "xstate": "https://cdn.jsdelivr.net/npm/xstate@5/+esm"
        }
    }
    </script>
    <script type="module" src="/dist/scripts/main.js"></script>
</head>
<body>
    <!-- App shell with router outlet -->
    <app-shell>
        <nav-bar slot="header"></nav-bar>
        <router-outlet slot="main"></router-outlet>
        <site-footer slot="footer"></site-footer>
    </app-shell>
</body>
</html>
```

Router actor handles navigation:
```typescript
// src/actors/router/machine.ts
export const routerMachine = createMachine({
    id: 'router',
    initial: 'idle',
    context: {
        currentRoute: '/',
        previousRoute: null
    },
    states: {
        idle: {
            on: {
                NAVIGATE: {
                    target: 'loading',
                    actions: ['saveCurrentRoute', 'updateURL']
                }
            }
        },
        loading: {
            invoke: {
                src: 'loadPageTemplate',
                onDone: {
                    target: 'idle',
                    actions: ['renderTemplate', 'announcePageChange']
                },
                onError: {
                    target: 'error',
                    actions: ['showErrorPage']
                }
            }
        }
    }
});
```

## Architectural Principles

### Core Patterns
Based on our design system documentation:
- **Actor Pattern**: Components → Controllers → Machines → Actions
- **Data-State CSS**: Use data attributes for state representation
- **ARIA Automation**: Automatic accessibility attribute updates
- **TypeScript First**: All new code in TypeScript
- **Progressive Enhancement**: Works without JavaScript

### Atomic Design + Actors
Components are organized by both atomic level AND feature actor:

```
src/
├── actors/[feature]/components/     # Feature-specific atoms/molecules
│   ├── navigation/components/
│   │   ├── nav-link.ts (atom)
│   │   ├── nav-item.ts (molecule)
│   │   └── navbar.ts (organism)
│   └── forms/components/
│       ├── input.ts (atom)
│       ├── form-field.ts (molecule)
│       └── contact-form.ts (organism)
├── shared/                          # Cross-actor components
│   ├── atoms/                       # button, icon, typography
│   └── molecules/                   # card, badge, tooltip
└── components/
    ├── organisms/                   # Complex cross-actor components
    └── templates/                   # Page-level compositions
```

This hybrid approach ensures:
- Feature cohesion (actor components stay together)
- Reusability (shared atoms/molecules across actors)
- Clear ownership (actors own their specific components)
- Atomic composition (templates compose from all levels)

### Component Classification Guide

**Atoms** (Base elements, no dependencies):
- Buttons, inputs, labels, icons
- Typography components (headings, paragraphs)
- Single-purpose, reusable everywhere
- No internal state management

**Molecules** (Simple compositions):
- Form fields (label + input + error)
- Cards (image + title + text)
- Navigation items (icon + label)
- May have simple local state

**Organisms** (Complex features):
- Complete forms with validation
- Navigation bars with mobile states
- Search interfaces with results
- Often connected to actors/controllers

**Templates** (Page layouts):
- Compose organisms into full pages
- Define content zones and layout
- Handle page-level state coordination
- Import from all atomic levels

## Implementation Phases (6 Total)

### Phase 0: Architecture Foundation (CRITICAL - Do First)
**Goal**: Establish design system and core utilities before any restructuring

#### 0.0 Framework Structure Setup (NEW - Do First)
- [ ] Create `src/framework/` directory structure
- [ ] Create `src/app/` for portfolio-specific code
- [ ] Set up framework base classes:
  - [ ] `BaseActor` abstract class
  - [ ] `BaseController` abstract class  
  - [ ] `BaseComponent` abstract class
- [ ] Create framework configuration system
- [ ] Set up framework/app boundary rules
- [ ] Document framework API surface

#### 0.1 Design System & Atomic Structure Setup
- [ ] Extract design tokens from main.css to `src/styles/tokens/`
- [ ] Create color, typography, spacing, and animation tokens
- [ ] Set up CSS custom properties for theming
- [ ] Document token usage patterns
- [ ] Create atomic design directories:
  - [ ] `src/shared/atoms/` for base elements
  - [ ] `src/shared/molecules/` for simple components
  - [ ] `src/components/organisms/` for complex components
  - [ ] `src/components/templates/` for page layouts

#### 0.2 Accessibility Infrastructure
- [ ] Implement AriaObserver for automated ARIA updates
- [ ] Create accessibility helper utilities
- [ ] Set up screen reader announcer
- [ ] Add focus management utilities
- [ ] Implement motion preference detection

#### 0.3 SEO & Progressive Enhancement Setup
- [ ] Create pre-rendering build script
- [ ] Set up `<noscript>` content structure
- [ ] Implement meta tag management system
- [ ] Create structured data templates
- [ ] Set up server-side fallback strategy

#### 0.4 Core Actor Setup
- [ ] Create ui-orchestrator actor (root coordinator)
- [ ] Create router actor for SPA navigation
- [ ] Set up actor communication patterns
- [ ] Create base controller class
- [ ] Implement data-state synchronization
- [ ] Set up app-shell component structure

#### 0.5 Framework Core Implementation
- [ ] Implement `BaseActor` with common patterns
- [ ] Implement `BaseController` with lifecycle hooks
- [ ] Create generic router actor in framework
- [ ] Create generic UI orchestrator in framework
- [ ] Build framework testing utilities
- [ ] Create framework development tools

#### 0.6 Performance Infrastructure
- [ ] Implement code splitting setup
- [ ] Create route-based lazy loading
- [ ] Set up link prefetching
- [ ] Configure bundle analysis tools
- [ ] Create progressive actor loading

#### 0.7 Error Handling & Recovery Patterns
- [ ] Create error boundary actors for graceful failures
- [ ] Implement retry strategies with exponential backoff
- [ ] Set up fallback UI components
- [ ] Create user-friendly error messages
- [ ] Add error tracking integration
- [ ] Implement offline detection and recovery

#### 0.8 Security Infrastructure
- [ ] Set up Content Security Policy (CSP) headers
- [ ] Implement XSS prevention utilities
- [ ] Create safe HTML rendering functions
- [ ] Add input validation patterns
- [ ] Set up CORS handling for APIs
- [ ] Implement rate limiting for forms

#### 0.9 State Persistence & Hydration
- [ ] Create state persistence actor
- [ ] Implement localStorage/sessionStorage strategies
- [ ] Add state versioning for migrations
- [ ] Create cross-tab synchronization
- [ ] Implement state rehydration on reload
- [ ] Add privacy-aware storage options

#### 0.10 Reactive Infrastructure (CRITICAL - Required for all components)
- [ ] Create reactive event bus for declarative event handling
- [ ] Implement template-based rendering system
- [ ] Build reactive data binding utilities
- [ ] Create state machine timer services
- [ ] Implement reactive observer patterns (IntersectionObserver, ResizeObserver)
- [ ] Add reactive form handling utilities
- [ ] Create reactive animation system using invoke services
- [ ] Build declarative DOM update system
- [ ] Implement differential rendering for performance
- [ ] Create reactive debugging tools
- [ ] Add Biome configuration and custom reactive pattern checker
- [ ] Document all reactive patterns with examples

### Phase 1: Navigation Actor & Page Structure (HIGH PRIORITY)
**Goal**: Create page structure with actor-based navigation

#### 1.1 Navigation Actor Implementation
- [ ] Migrate mobile-nav to `src/actors/navigation/`
- [ ] Create navigation state machine with proper separation
- [ ] Implement controller with data-state pattern
- [ ] Add ARIA automation for navigation states
- [ ] Ensure keyboard navigation (roving tabindex)

#### 1.2 Create Router Actor
- [ ] Create `src/actors/router/` directory
- [ ] Build router state machine for client-side navigation
- [ ] Implement History API integration with state caching
- [ ] Add route definitions with lazy loading config
- [ ] Handle deep linking and browser back/forward
- [ ] Integrate with ui-orchestrator for coordination
- [ ] Add prefetch-on-hover functionality

#### 1.3 Create Page Templates (Atomic Design)
- [ ] Create `src/components/templates/` directory
- [ ] Build `home-page.ts` template component
- [ ] Build `about-page.ts` template component
- [ ] Build `blog-page.ts` template component
- [ ] Build `case-studies-page.ts` template component
- [ ] Build `resources-page.ts` template component
- [ ] Update root `index.html` to import router and templates
- [ ] Add skip links for accessibility in app shell

#### 1.4 Navigation Integration
- [ ] Connect navigation actor to router actor
- [ ] Implement View Transitions API for page changes
- [ ] Update all internal links to use router
- [ ] Add breadcrumb component with router awareness
- [ ] Ensure browser history works correctly

### Phase 2: Forms Actor & Content Migration (HIGH PRIORITY)
**Goal**: Implement forms actor and migrate content with proper patterns

#### 2.1 Forms Actor Implementation
- [ ] Create forms actor in `src/actors/forms/`
- [ ] Migrate newsletter form with validation
- [ ] Implement accessible form patterns
- [ ] Add real-time validation with ARIA announcements
- [ ] Create contact form with proper error handling

#### 2.2 Content Actor Setup
- [ ] Create content actor for managing page sections
- [ ] Implement lazy loading for heavy components
- [ ] Add skeleton screens for loading states
- [ ] Set up intersection observer for performance

#### 2.3 Home Page Optimization
- [ ] Keep: Hero section with proper heading hierarchy
- [ ] Keep: Coffee shop demo (ensure touch-friendly)
- [ ] Keep: Essential state machine intro
- [ ] Keep: Contact form with forms actor
- [ ] Add: Loading states for dynamic content
- [ ] Add: Error boundaries for graceful failures

#### 2.4 Page Composition with Atomic Components
- [ ] **Home Page Template**: 
  - [ ] Hero organism (problem → solution flow)
  - [ ] Coffee shop demo organism
  - [ ] Newsletter form organism
  - [ ] Contact section organism
- [ ] **About Page Template**:
  - [ ] About hero organism
  - [ ] Team section molecules
  - [ ] Skills/experience organisms
- [ ] **Case Studies Template**:
  - [ ] Project card molecules
  - [ ] Filter/sort organisms
  - [ ] Detail view templates
- [ ] **Resources Template**:
  - [ ] Resource card molecules
  - [ ] Category navigation organism
  - [ ] Code example organisms
- [ ] **Blog Template**:
  - [ ] Article card molecules
  - [ ] Blog post template
  - [ ] Category/tag organisms
- [ ] Ensure all templates use consistent atomic components

#### 2.5 Accessibility Audit
- [ ] Verify all images have alt text
- [ ] Check color contrast ratios (AA compliance)
- [ ] Ensure touch targets are 44x44px minimum
- [ ] Add language attributes for i18n readiness
- [ ] Test with screen readers

#### 2.6 Content Management Architecture
- [ ] Create content actor for blog/case studies
- [ ] Design markdown-based content structure
- [ ] Implement content versioning system
- [ ] Create content preview functionality
- [ ] Add draft/publish workflow
- [ ] Set up content caching strategy

#### 2.7 Mobile-Specific Enhancements
- [ ] Implement touch gesture handling
- [ ] Add swipe navigation between pages
- [ ] Create mobile-optimized interactions
- [ ] Implement viewport lock for modals
- [ ] Add pull-to-refresh where appropriate
- [ ] Optimize for one-handed use

### Phase 3: Search Actor & Performance (MEDIUM PRIORITY)
**Goal**: Implement search functionality and optimize performance

#### 3.1 Search Actor Implementation
- [ ] Create search actor in `src/actors/search/`
- [ ] Implement search modal with focus trap
- [ ] Add keyboard shortcuts (/ to open)
- [ ] Implement fuzzy search algorithm
- [ ] Add search result announcements

#### 3.2 Performance Optimization
- [ ] Implement container queries for components
- [ ] Add View Transitions API between pages
- [ ] Set up resource hints (preconnect, prefetch)
- [ ] Optimize critical rendering path
- [ ] Implement optimistic UI updates

#### 3.3 Progressive Enhancement
- [ ] Ensure site works without JavaScript
- [ ] Add service worker for offline support
- [ ] Implement adaptive loading based on connection
- [ ] Add proper loading="lazy" for images
- [ ] Use Intersection Observer for animations

#### 3.4 SEO and Metadata
- [ ] Add structured data (JSON-LD)
- [ ] Implement dynamic meta tags
- [ ] Create XML sitemap
- [ ] Add canonical URLs
- [ ] Optimize for Core Web Vitals

### Phase 4: Developer Experience & Testing (MEDIUM PRIORITY)
**Goal**: Tools to manage complexity and ensure quality

#### 4.1 Developer Tools
- [ ] Create actor visualizer for development
- [ ] Add XState Inspector integration
- [ ] Build testing utilities for actors
- [ ] Create development-only debugging panel
- [ ] Add performance monitoring dashboard

#### 4.2 Testing Implementation
- [ ] Unit tests for all actors and actions
- [ ] Integration tests for actor communication
- [ ] Accessibility testing with axe-core
- [ ] Cross-browser testing
- [ ] Performance testing and monitoring
- [ ] SEO testing with pre-rendered pages

#### 4.3 Final TypeScript Migration
- [ ] Convert remaining JS files to TypeScript
- [ ] Add proper type definitions
- [ ] Enable strict TypeScript settings
- [ ] Document public APIs with JSDoc

#### 4.4 Documentation & Cleanup
- [ ] Update component documentation
- [ ] Create usage examples
- [ ] Remove dead code
- [ ] Optimize bundle sizes
- [ ] Archive old implementations

#### 4.5 Production Readiness
- [ ] Set up build pipeline with pre-rendering
- [ ] Configure service worker for offline
- [ ] Implement error tracking (Sentry/Rollbar)
- [ ] Set up performance monitoring (Web Vitals)
- [ ] Create deployment scripts

### Phase 5: Deployment & Operations (LOW PRIORITY)
**Goal**: Production-ready deployment and monitoring

#### 5.1 CI/CD Pipeline
- [ ] Set up GitHub Actions workflow
- [ ] Configure automated testing on PR
- [ ] Implement build optimization
- [ ] Add lighthouse CI checks
- [ ] Set up staging environment
- [ ] Configure production deployment

#### 5.2 Monitoring & Analytics
- [ ] Implement analytics actor
- [ ] Set up custom event tracking
- [ ] Add performance monitoring
- [ ] Create error alerting system
- [ ] Implement A/B testing framework
- [ ] Add user session recording (privacy-aware)

#### 5.3 CDN & Asset Optimization
- [ ] Configure CDN for static assets
- [ ] Implement image optimization pipeline
- [ ] Set up font loading strategy
- [ ] Configure cache headers
- [ ] Implement Brotli compression
- [ ] Add resource hints optimization

#### 5.4 Internationalization Foundation
- [ ] Create i18n actor for translations
- [ ] Set up translation key system
- [ ] Implement locale detection
- [ ] Add RTL layout support
- [ ] Create language switcher component
- [ ] Prepare for dynamic translation loading

## Implementation Guidelines

### Actor Pattern Rules
1. **Components receive controllers**, never actors directly
2. **Separate actions from machines** for serializability
3. **Use data-state for CSS**, not JavaScript DOM manipulation
4. **Controllers manage actor lifecycle** and state sync
5. **NO direct DOM queries** - Use refs or data attributes instead of querySelector/getElementById
6. **NO imperative event listeners** - Use declarative event mapping through the reactive event bus
7. **NO manual attribute updates** - Use reactive data binding (except data-* attributes)
8. **NO unmanaged timers** - Use state machine delays/after/invoke services
9. **NO direct style manipulation** - Use data attributes and CSS
10. **NO innerHTML/textContent assignments** - Use template functions with state

### Reactive Pattern Requirements

#### Forbidden Patterns (Will fail code review)
```typescript
// ❌ Direct DOM queries
element = document.querySelector('.class');
button = this.shadowRoot.getElementById('id');

// ❌ Imperative event handling
element.addEventListener('click', handler);
form.onsubmit = handler;

// ❌ Direct DOM manipulation
element.setAttribute('aria-expanded', 'true');
element.classList.add('active');
element.style.display = 'none';
element.innerHTML = '<div>content</div>';
element.textContent = 'text';

// ❌ Unmanaged async
setTimeout(() => doSomething(), 1000);
setInterval(() => poll(), 5000);
```

#### Required Patterns
```typescript
// ✅ Reactive refs
@query('[data-ref="button"]') button: HTMLElement;

// ✅ Declarative events
this.bindEvents({
  'click [data-action="submit"]': 'SUBMIT',
  'input [data-field]': 'UPDATE_FIELD'
});

// ✅ State-driven attributes
this.setAttribute('data-expanded', state.context.isExpanded);
// CSS: [data-expanded="true"] { ... }

// ✅ Template-based rendering
protected template(state: ActorSnapshot): string {
  return `<div>${state.context.content}</div>`;
}

// ✅ State machine timers
after: { 1000: 'nextState' }
invoke: { src: 'pollService' }
```

### Complementary Design Patterns

#### Command Pattern
Use for undoable/redoable actions:
```typescript
interface Command {
    execute(): void;
    undo(): void;
}

class EditCommand implements Command {
    constructor(private actor: any, private oldValue: string, private newValue: string) {}
    execute() { this.actor.send({ type: 'UPDATE', value: this.newValue }); }
    undo() { this.actor.send({ type: 'UPDATE', value: this.oldValue }); }
}
```

#### Strategy Pattern
For swappable behaviors (validation, formatting):
```typescript
interface ValidationStrategy {
    validate(value: string): boolean;
}

class EmailValidation implements ValidationStrategy {
    validate(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
}
```

#### Facade Pattern
Simplify complex actor interactions:
```typescript
class SearchFacade {
    constructor(
        private searchActor: any,
        private filterActor: any,
        private resultsActor: any
    ) {}
    
    async performSearch(query: string) {
        // Coordinate multiple actors
    }
}
```

#### Repository Pattern
Abstract data access:
```typescript
interface ContentRepository {
    getPost(id: string): Promise<Post>;
    searchPosts(query: string): Promise<Post[]>;
}

class MarkdownContentRepository implements ContentRepository {
    // Implementation details
}
```

### Accessibility Requirements
1. **ARIA automation** for all state changes
2. **Focus management** for modals and navigation
3. **Keyboard support** for all interactions
4. **Screen reader announcements** for dynamic content
5. **Motion preferences** respected throughout

### Performance Standards
1. **Lazy load** non-critical components
2. **Use skeleton screens** during loading
3. **Implement optimistic updates** where possible
4. **Container queries** over media queries
5. **Progressive enhancement** as baseline

### Testing Strategy

#### Unit Testing
- Test actors in isolation with mock dependencies
- Test actions as pure functions
- Test guards and services separately
- Use `createTestActor` utility for consistency

#### Integration Testing
- Test actor communication patterns
- Test controller-component integration
- Test router navigation flows
- Test form submission workflows

#### E2E Testing
- Use Playwright for cross-browser testing
- Test critical user journeys
- Test accessibility with automated tools
- Test performance metrics

#### Visual Regression Testing
- Capture component screenshots
- Test responsive layouts
- Test theme variations
- Test loading/error states

#### Reactive Pattern Testing
- Custom reactive pattern checker script
- Biome for code quality and formatting
- Unit tests verify no direct DOM manipulation
- Integration tests check reactive data flow
- Automated checks for forbidden patterns in CI/CD
- Pre-commit hooks to prevent non-reactive code

Example test:
```typescript
test('component uses only reactive patterns', () => {
  const component = new TestComponent();
  const controller = new TestController(component);
  
  // Verify no direct DOM manipulation
  expect(component.querySelector).not.toHaveBeenCalled();
  expect(component.addEventListener).not.toHaveBeenCalled();
  
  // Verify state-driven updates
  controller.send('UPDATE');
  expect(component.getAttribute('data-state')).toBe('updated');
});
```

## Key Principles

### Reactive First
- **All UI updates must be state-driven** - No direct DOM manipulation
- **All events must go through state machines** - No imperative event handlers
- **All async operations must be managed** - No untracked timers or promises
- **All components must be purely reactive** - State in, UI out
- **Refer to [Reactive Patterns Audit](./REACTIVE_PATTERNS_AUDIT.md)** for implementation details

### 5 Levels of Market Awareness (Home Page Focus)
1. **Problem Unaware**: Hero section with problem introduction
2. **Problem Aware**: Problem definition and pain points
3. **Solution Aware**: State machine solution introduction
4. **Product Aware**: Coffee shop demo showcase
5. **Most Aware**: CTA and contact information

### Content Strategy
- **Home Page**: Conversion-focused, awareness funnel
- **About Page**: Trust-building, credibility
- **Case Studies**: Social proof, detailed examples
- **Resources**: Value delivery, SEO content
- **Blog**: Thought leadership, ongoing content

## Success Metrics

### User Experience
- [ ] Reduce home page scroll time by 60%
- [ ] Initial bundle size < 50KB (gzipped)
- [ ] Page load time under 3 seconds on 3G
- [ ] Time to Interactive under 3.5 seconds  
- [ ] First Contentful Paint under 1.5 seconds
- [ ] Route transitions < 100ms
- [ ] Accessibility score 95+ on Lighthouse
- [ ] SEO score 100 on Lighthouse

### Code Quality
- [ ] 100% TypeScript coverage for new code
- [ ] Zero manual ARIA attribute updates
- [ ] All actors follow standard pattern
- [ ] 90%+ test coverage for actors
- [ ] Zero accessibility violations (axe-core)

### Business Impact
- [ ] Maintain coffee shop demo prominence
- [ ] Increase user engagement across pages
- [ ] Improve conversion on contact forms
- [ ] Maintain or improve SEO rankings
- [ ] Reduce bounce rate by 20%

## Technical Considerations

### Architecture
- Actor-based state management throughout
- Strict separation of concerns (Component → Controller → Machine → Actions)
- Data-state pattern for all UI states
- TypeScript for type safety
- Progressive enhancement baseline

### Data Flow Architecture

#### Unidirectional Data Flow
```
User Input → Component → Controller → Actor → State Change → UI Update
```

#### Actor Communication Patterns
1. **Direct Messaging**: Parent-child actor communication
2. **Event Bus**: Decoupled cross-actor events
3. **Shared Context**: UI orchestrator as mediator
4. **State Synchronization**: Cross-tab consistency

#### Real-time Considerations (Future)
- WebSocket actor for live updates
- Server-Sent Events for notifications
- Optimistic updates with rollback
- Conflict resolution strategies
- Offline queue for actions

### Accessibility
- ARIA automation via AriaObserver
- Focus management for all modals
- Keyboard navigation throughout
- Screen reader announcements
- Color contrast AA compliance minimum

### Performance
- Code splitting by route
- Lazy loading for heavy components
- Service worker for offline support
- Optimistic UI updates
- Container queries for responsive components

### SEO Considerations
Since we're building a SPA, we need to ensure SEO isn't compromised:
- Server-side rendering (SSR) or static generation for initial page loads
- Proper meta tag management per route
- Structured data (JSON-LD) updates on navigation
- XML sitemap listing all routes
- Fallback for crawlers that don't execute JavaScript
- Consider using `<noscript>` tags for critical content

## Migration Strategy

### Incremental Approach
1. **Start with navigation** - Most visible, sets patterns
2. **Forms next** - High user interaction
3. **Search follows** - Builds on established patterns
4. **Content last** - Easiest to migrate

### Safety Measures
- Feature flags for new implementations
- A/B testing for major changes
- Parallel running of old/new code
- Comprehensive error boundaries
- Analytics tracking for issues

## Resources & Documentation

### Required Reading
- [Design System Architecture](./DESIGN_SYSTEM.md)
- [Actor Pattern Example](./ACTOR_PATTERN_EXAMPLE.md)
- [ARIA Automation Patterns](./ARIA_AUTOMATION_PATTERNS.md)
- [Accessibility & UX Guide](./ACCESSIBILITY_UX_GUIDE.md)
- [SPA Trade-off Mitigation](./SPA_TRADEOFF_MITIGATION.md)
- [Actor-SPA Framework Architecture](./ACTOR_SPA_FRAMEWORK.md)
- **[Reactive Patterns Audit](./REACTIVE_PATTERNS_AUDIT.md)** - CRITICAL: Must read before implementation

### Tools & Libraries
- **XState v5** - State management
- **TypeScript 5.x** - Type safety
- **Import Maps** - Module resolution
- **Web Components** - Component model
- **View Transitions API** - Navigation

## Timeline Estimation

### Phase Timeline (8-9 weeks total)
- **Phase 0**: 2 weeks - Foundation + Mitigations (Critical)
- **Phase 1**: 1 week - Navigation & Structure
- **Phase 2**: 1.5 weeks - Forms & Content
- **Phase 3**: 1 week - Search & Performance
- **Phase 4**: 1.5 weeks - Developer Tools & Testing
- **Phase 5**: 1 week - Deployment & Operations
- **Buffer**: 1 week - Contingency

### Risk Mitigation

#### Technical Risks
- **Risk**: Actor communication complexity
  - **Mitigation**: Start with simple patterns, document thoroughly
- **Risk**: Performance degradation with many actors
  - **Mitigation**: Lazy load actors, monitor performance metrics
- **Risk**: SEO issues with SPA
  - **Mitigation**: Pre-rendering, progressive enhancement

#### Project Risks
- **Risk**: Scope creep
  - **Mitigation**: Strict phase boundaries, MVP focus
- **Risk**: Browser compatibility issues
  - **Mitigation**: Progressive enhancement, polyfills where needed
- **Risk**: Accessibility regressions
  - **Mitigation**: Automated testing, regular audits

### Daily Priorities
1. **Morning**: Architecture/Actor work (high focus)
2. **Afternoon**: UI/Content migration
3. **End of day**: Testing & documentation

### Critical Path Items
1. Design system tokens (blocks everything)
2. UI orchestrator (coordinates all actors)
3. Navigation actor (users see this first)
4. ARIA automation (accessibility baseline)
5. Forms actor (user interaction)

## Definition of Done

### For Each Actor
- [ ] TypeScript implementation
- [ ] State machine with separated actions
- [ ] Controller with data-state sync
- [ ] ARIA automation configured
- [ ] Unit tests written
- [ ] Documentation complete
- [ ] Accessibility tested
- [ ] **All reactive patterns followed (no ESLint errors)**
- [ ] **No direct DOM manipulation**
- [ ] **All events through state machine**

### For Each Page
- [ ] Semantic HTML structure
- [ ] Progressive enhancement works
- [ ] Loading states implemented
- [ ] Error boundaries in place
- [ ] Meta tags and SEO
- [ ] Performance budget met
- [ ] Accessibility audit passed

## Pre-Implementation Checklist

### Technical Requirements
- [ ] Node.js 18+ installed
- [ ] TypeScript 5.x configured
- [ ] Git repository initialized
- [ ] Import maps supported in target browsers
- [ ] Development server configured

### Documentation Review
- [ ] All team members read core documentation
- [ ] Architecture decisions understood
- [ ] Design patterns reviewed
- [ ] Accessibility guidelines clear
- [ ] Performance budgets agreed
- [ ] **Reactive patterns audit reviewed and understood**
- [ ] **Biome configuration and reactive pattern checker set up**

### Environment Setup
- [ ] VS Code with recommended extensions
- [ ] XState VS Code extension installed
- [ ] Prettier/ESLint configured
- [ ] Git hooks for code quality
- [ ] Browser dev tools configured

### Initial Decisions
- [ ] CSS methodology chosen (CSS Modules/PostCSS)
- [ ] Testing framework selected (Vitest/Jest)
- [ ] E2E tool chosen (Playwright/Cypress)
- [ ] Deployment platform selected
- [ ] Analytics provider chosen

## Notes
- Coffee shop demo becomes showcase of actor pattern
- Each page demonstrates different architectural benefits
- Mobile-first with desktop enhancements
- Performance budgets enforced
- Accessibility is non-negotiable
- Start small, validate patterns, then scale
- Extract framework when patterns stabilize
- Consider open-sourcing actor-spa framework

## SPA Architecture Considerations

### Benefits of this approach:
- ✅ Instant navigation between pages
- ✅ Shared state across routes
- ✅ Smooth transitions and animations
- ✅ Single codebase to maintain
- ✅ Better performance after initial load

### Trade-offs to consider (with mitigations):
- ⚠️ SEO requires additional setup → ✅ Pre-rendering + Progressive Enhancement
- ⚠️ Initial bundle size larger → ✅ Code Splitting + Lazy Loading
- ⚠️ JavaScript required for navigation → ✅ HTML-First + Graceful Degradation
- ⚠️ More complex than static pages → ✅ Developer Tools + Testing Utils
- ⚠️ Browser history management needed → ✅ Smart History with State Cache

**See [SPA Trade-off Mitigation Guide](./SPA_TRADEOFF_MITIGATION.md) for implementation details**

### When to use this architecture:
- Interactive applications with complex state
- Portfolio sites with rich interactions
- Apps requiring smooth transitions
- When team knows state management well
- When SEO can be handled properly

### When to keep it simple:
- Content-heavy sites with minimal interaction
- SEO is critical and resources limited
- Team unfamiliar with state machines
- Quick landing pages or campaigns
- Progressive enhancement is priority
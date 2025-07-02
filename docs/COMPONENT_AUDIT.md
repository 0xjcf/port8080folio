# Component Audit & Categorization

This document categorizes all existing components according to atomic design principles.

## Current Component Inventory

### 🔵 Atoms (Basic Building Blocks)

| Component | Current Location | Status | Notes |
|-----------|-----------------|---------|-------|
| `brand-icon` | `src/components/ui/brand-icon.ts` | ✅ TypeScript | Icon with animation support |
| `loading-state` | `src/components/ui/loading-state.js` | ⚠️ JavaScript | Needs TS migration |
| Buttons | `src/styles/main.css` | ❌ Not componentized | Extract from global CSS |
| Typography | `src/styles/main.css` | ❌ Not componentized | H1-H6, p styles need extraction |
| Form inputs | `src/styles/main.css` | ❌ Not componentized | Input, textarea styles |
| Links | `src/styles/main.css` | ❌ Not componentized | Anchor styles |

### 🟢 Molecules (Simple Combinations)

| Component | Current Location | Status | Notes |
|-----------|-----------------|---------|-------|
| `breadcrumbs` | `src/components/ui/breadcrumbs.ts` | ✅ TypeScript | Navigation breadcrumb |
| `project-card` | `src/components/ui/project-card.js` | ⚠️ JavaScript | Portfolio card display |
| `nav-item` | Inside `navbar.ts` | ⚠️ Embedded | Extract as separate molecule |
| `form-group` | Not componentized | ❌ In CSS only | Label + input + helper |
| `stat-card` | Inside templates | ❌ Embedded | Statistics display card |
| `social-link` | Inside `navbar.ts` | ⚠️ Embedded | Social media links |

### 🟡 Organisms (Complex Components)

| Component | Current Location | Status | Notes |
|-----------|-----------------|---------|-------|
| `navbar` | `src/components/ui/navbar.ts` | ✅ TypeScript | Main navigation |
| `mobile-nav` | `src/components/ui/mobile-nav/` | ✅ TypeScript | Actor-based mobile nav |
| `search-modal` | `src/components/ui/search-modal.ts` | ✅ TypeScript | Search interface |
| `search-component` | `src/components/ui/search-component.ts` | ✅ TypeScript | Search functionality |
| `privacy-notice` | `src/components/ui/privacy-notice.ts` | ✅ TypeScript | GDPR banner |
| `related-content` | `src/components/ui/related-content.ts` | ✅ TypeScript | Content suggestions |
| `syntax-highlighter-v3` | `src/components/tokenizer/syntax-highlighter-v3.js` | ⚠️ JavaScript | Code highlighting |
| `ui-orchestrator` | `src/components/ui/ui-orchestrator.ts` | ✅ TypeScript | UI state manager |
| Newsletter form | Inside `index.html` | ❌ Not componentized | Extract as organism |
| Footer | Inside HTML files | ❌ Not componentized | Extract as organism |

### 🟠 Templates (Page Layouts)

| Component | Current Location | Status | Notes |
|-----------|-----------------|---------|-------|
| `hero-section-enhanced` | `src/components/sections/hero-section-enhanced.ts` | ✅ TypeScript | Hero layout |
| `about-section` | `src/components/sections/about-section.ts` | ✅ TypeScript | About content |
| `projects-section` | `src/components/sections/projects-section.ts` | ✅ TypeScript | Portfolio grid |
| `blog-posts` | `src/components/sections/blog-posts.ts` | ✅ TypeScript | Blog listing |
| `state-machine-intro` | `src/components/state-machine/state-machine-intro.js` | ⚠️ JavaScript | Education section |

### 🔴 Special Components (Domain-Specific)

| Component | Current Location | Status | Notes |
|-----------|-----------------|---------|-------|
| `coffee-shop-app-clean` | `src/components/demos/coffee-shop-app-clean.js` | ⚠️ JavaScript | XState demo |
| `actor-architecture-diagram` | `src/components/demos/actor-architecture-diagram.js` | ⚠️ JavaScript | Architecture viz |
| `customer-actor-ui` | `src/components/demos/actors/customer-actor-ui.js` | ⚠️ JavaScript | Demo UI |
| `cashier-actor-ui` | `src/components/demos/actors/cashier-actor-ui.js` | ⚠️ JavaScript | Demo UI |
| `barista-actor-ui` | `src/components/demos/actors/barista-actor-ui.js` | ⚠️ JavaScript | Demo UI |

## Component Status Summary

### TypeScript Migration Status
- ✅ **Complete (TypeScript)**: 16 components
- ⚠️ **JavaScript (Needs Migration)**: 11 components  
- ❌ **Not Componentized**: 10+ elements

### By Atomic Level
- **Atoms**: 1/6 componentized (17%)
- **Molecules**: 2/6 componentized (33%)
- **Organisms**: 8/10 componentized (80%)
- **Templates**: 5/5 componentized (100%)

## Priority Migration List

### Phase 1: Critical Atoms (Week 1)
1. **Button Component** - Extract from CSS, most reused element
2. **Input Component** - Form foundation
3. **Typography Components** - Consistent text styling
4. **Link Component** - Standardize anchor behavior

### Phase 2: Essential Molecules (Week 2)
1. **FormGroup** - Combine label, input, helper, error
2. **Card** - Unify project-card, stat-card patterns
3. **NavItem** - Extract from navbar
4. **SocialLink** - Reusable social media links

### Phase 3: Missing Organisms (Week 3)
1. **Newsletter Form** - Complex form with validation
2. **Footer** - Site-wide footer component
3. **Code Examples** - Unify syntax highlighting

### Phase 4: JavaScript to TypeScript (Week 4)
1. `loading-state` → TypeScript
2. `project-card` → TypeScript
3. `state-machine-intro` → TypeScript
4. All demo components → TypeScript

### Phase 5: Optimization (Week 5)
1. Performance audit
2. Bundle size optimization
3. Lazy loading implementation
4. Documentation completion

## Design Token Dependencies

### Colors Currently Used
- `var(--indigodye)` → `--color-bg-primary`
- `var(--secondary-bg)` → `--color-bg-secondary`
- `var(--tertiary-bg)` → `--color-bg-tertiary`
- `var(--teagreen)` → `--color-text-primary`
- `var(--jasper)` → `--color-accent`
- `var(--jasper-light)` → `--color-accent-light`
- `var(--heading-color)` → `--color-text-heading`

### Font Weights in Use
- Normal (400) - Body text
- Medium (500) - Subtle emphasis
- Semibold (600) - Buttons, labels, CTAs
- Bold (700) - Headings

### Common Patterns to Extract

1. **Glass Morphism Effect**
   ```css
   background: rgba(255, 255, 255, 0.02);
   backdrop-filter: blur(10px);
   border: 1px solid rgba(255, 255, 255, 0.05);
   ```

2. **Focus Ring**
   ```css
   outline: 2px solid var(--jasper);
   outline-offset: 2px;
   ```

3. **Hover Lift**
   ```css
   transform: translateY(-2px);
   box-shadow: 0 8px 24px rgba(13, 153, 255, 0.3);
   ```

4. **Loading State**
   ```css
   opacity: 0.6;
   cursor: not-allowed;
   pointer-events: none;
   ```

## Next Actions

1. **Create Button Atom** - First component to establish patterns
2. **Set up design token files** - Extract from main.css
3. **Build component generator** - Scaffold new components
4. **Create Storybook instance** - Component development environment
5. **Write migration scripts** - Automate conversions where possible 
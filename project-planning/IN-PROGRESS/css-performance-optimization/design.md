# CSS Performance Optimization Design

## Architecture Overview

The CSS architecture will use modern cascade layers to manage specificity, OKLCH color space for consistent colors, and a token-based design system for maintainability.

```mermaid
graph TD
    A[HTML Document] --> B[Critical CSS Inline]
    A --> C[Main CSS Bundle]
    C --> D[@layer base]
    C --> E[@layer tokens]
    C --> F[@layer layout]
    C --> G[@layer components]
    C --> H[@layer sections]
    C --> I[@layer utilities]
    C --> J[@layer overrides]
    
    D --> K[Reset Styles]
    E --> L[Design Tokens]
    F --> M[Grid/Container]
    G --> N[Reusable Components]
    H --> O[Page Sections]
    I --> P[Utility Classes]
    J --> Q[Last Resort Fixes]
```

## Technical Design

### Core Components

#### CSS Layer Architecture
- **Purpose**: Manage specificity without !important
- **Responsibilities**: Order cascade properly, prevent conflicts
- **Implementation**:
  ```css
  @layer base, tokens, layout, components, sections, utilities, overrides;
  ```

#### Design Token System
- **Purpose**: Single source of truth for design values
- **Responsibilities**: Colors, spacing, typography, z-index
- **Interface**:
  ```css
  :root {
    /* Colors in OKLCH */
    --color-primary: oklch(59% 0.24 25);
    --color-surface: oklch(15% 0.01 25);
    
    /* Z-index scale */
    --z-base: 0;
    --z-dropdown: 10;
    --z-sticky: 20;
    --z-modal: 30;
    --z-overlay: 50;
    
    /* Spacing scale */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 2rem;
    --space-xl: 4rem;
  }
  ```

#### Component Architecture
- **Purpose**: Reusable UI patterns
- **Responsibilities**: Buttons, cards, forms, tags
- **Naming**: BEM convention
  ```css
  .component-name {}
  .component-name__element {}
  .component-name--modifier {}
  ```

### State Management
CSS-only state management using:
- `:target` pseudo-class for navigation
- `:has()` for parent selection
- Custom properties for dynamic theming
- Data attributes for component states

### Data Flow
1. **HTML loads** with critical inline CSS
2. **Main CSS loads** with cascade layers
3. **Tokens applied** from root custom properties
4. **Components styled** using token values
5. **Sections composed** from components
6. **Utilities override** when needed
7. **Browser paints** optimized layout

## Implementation Details

### Technology Stack
- **CSS Features**: Custom properties, cascade layers, OKLCH colors
- **Build Tools**: PostCSS, cssnano, autoprefixer
- **Linting**: Biome 2.2.0
- **Testing**: Visual regression, Lighthouse
- **Delivery**: Static files, long-term caching

### Design Patterns

#### Cascade Layers Pattern
```css
/* 01-reset.css */
@layer base {
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

/* 02-tokens.css */
@layer tokens {
  :root {
    --brand-primary: oklch(59% 0.24 25);
  }
}

/* 05-components.css */
@layer components {
  .button {
    background: var(--brand-primary);
    /* No !important needed */
  }
}
```

#### BEM Naming Pattern
```css
/* Block */
.service-card {}

/* Element */
.service-card__icon {}
.service-card__title {}
.service-card__metrics {}

/* Modifier */
.service-card--featured {}
.service-card--disabled {}
```

#### OKLCH Color System
```css
:root {
  /* Brand colors */
  --brand-orange: oklch(71% 0.18 41);
  --brand-red: oklch(53% 0.21 16);
  
  /* Gradients using OKLCH */
  --brand-gradient: linear-gradient(
    135deg,
    oklch(71% 0.18 41),
    oklch(53% 0.21 16)
  );
}
```

### Component Examples

#### Button Component
```css
@layer components {
  .button {
    /* Base styles using tokens */
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    font-size: var(--text-md);
    transition: transform 0.2s;
  }
  
  .button--primary {
    background: var(--brand-gradient);
    color: var(--color-white);
  }
  
  .button--secondary {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }
}
```

#### Card Component
```css
@layer components {
  .card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
  }
  
  .card__header {
    margin-bottom: var(--space-md);
  }
  
  .card__content {
    color: var(--color-text);
  }
}
```

## Testing Strategy

### Performance Testing
- **Lighthouse CI**: Automated performance scoring
- **WebPageTest**: Real device testing
- **Chrome DevTools**: Runtime performance profiling

### Visual Testing
- **Screenshot comparison**: Before/after each change
- **Cross-browser testing**: Chrome, Firefox, Safari, Edge
- **Device testing**: iPhone SE, iPad, Android devices

### CSS Testing
- **Biome linting**: No !important, proper specificity
- **Coverage analysis**: < 25% unused CSS
- **Bundle size**: < 50KB gzipped

## Performance Considerations

### Critical CSS Strategy
```html
<style>
  /* Inline critical CSS for above-the-fold */
  :root { /* tokens */ }
  .hero { /* hero shell */ }
  body { /* layout */ }
</style>
<link rel="stylesheet" href="main.css">
```

### GPU Optimization Rules
- Max 2 `backdrop-filter` elements in viewport
- Use `transform` and `opacity` for animations only
- Avoid `filter: blur()` on mobile
- Provide `@supports` fallbacks

### Mobile Optimizations
- Single `@media` block per file
- Reduce visual effects on mobile
- Use `content-visibility: auto` for sections
- Minimize repaints during scroll

### Build Optimizations
- PostCSS plugin chain:
  1. `postcss-import` - combine files
  2. `postcss-custom-media` - process breakpoints
  3. `autoprefixer` - add vendor prefixes
  4. `postcss-merge-rules` - deduplicate
  5. `cssnano` - minify output
- Content-hashed filenames for caching
- Gzip/Brotli compression
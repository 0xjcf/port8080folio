# Performance and Optimization Plan (HTML + CSS First)

## 1) Audit Overview

- Scope: `index.html`, `styles/` (00–14), minimal inline scripts.
- Goals: Fast First Paint, low main-thread work, smooth scrolling on low-end mobiles, preserve "premium" look.
- Principles: Token-driven CSS, minimal JS, avoid `!important`, remove duplication, reduce overdraw (blurs, blends) on mobile.
- Baseline: 130+ `!important` instances found, multiple color formats, duplicate styles across sections.

## 2) Key Metrics & Tooling

- Lab metrics: LCP, CLS, INP, TBT, Speed Index (Lighthouse/WebPageTest). Target LCP < 2.5s (3G Fast), CLS < 0.1, INP < 200ms.
- Runtime: Chrome DevTools Performance/Rendering (layers, paints, GPU), Coverage (unused CSS), Elements (layout shift debugging).
- Static: `cssnano` (minify), `postcss` (custom media, nesting, layers), `purgecss`-style safelist for critical classes.

## 3) HTML Optimization

- Critical CSS: Inline a very small critical block (above-the-fold hero shell: layout scaffold + essential typography). Keep below ~10–14KB to avoid inflating HTML too much.
  - **Must include**: Theme variables, brand gradients, unified canvas setup to prevent FOUC
  - Create `critical.css` with: `:root` tokens, hero shell, theme detection
- Defer non-critical CSS: Load the rest via `rel=preload` -> `rel=stylesheet` pattern if needed. Given single CSS bundle, keep a single render-blocking CSS for simplicity; prefer minified single file.
- Remove unused hints: Drop `preconnect` to `fonts.gstatic.com` (no external webfonts used).
- Set explicit image dimensions: Add `width`/`height` to `<img>` (e.g., `gibli-pfp.png`) to reduce CLS; include `decoding="async"` and `loading="lazy"` (non-hero).
- Anchor targets: Use IDs for carousel targets (done) and avoid hash changes causing layout jumps by reserving scroll-padding (already handled).
- Font loading strategy: If web fonts added later, use `font-display: swap` for body text, `font-display: optional` for decorative fonts.

## 4) CSS Optimization

- Adopt cascade layers: `@layer base, tokens, layout, components, sections, utilities, overrides`.
  - Place reset in `base`, tokens in `tokens`, layout grid/container in `layout`, shared buttons/cards/tags in `components`, each section in `sections`, utilities in `utilities`, and last-resort tweaks in `overrides`.
  - With layers, remove `!important` from utilities/sections.
- **Color System Standardization**:
  - Standardize on OKLCH color space throughout (better for gradients and animations)
  - Remove RGB/HSL/HEX variants to reduce confusion
  - Create color conversion utilities if needed
- **Z-index Management**:
  - Create z-index scale tokens: `--z-base: 0`, `--z-dropdown: 10`, `--z-sticky: 20`, `--z-modal: 30`, `--z-overlay: 50`
  - Document z-index hierarchy to prevent conflicts
  - Replace scattered values (1, 2, 6, 50, 1000) with tokens
- Consolidate mobile blocks: Ensure each section has a single `@media (max-width: 640px)` block at the end; remove duplicate/conflicting rules.
- Standardize breakpoints: Introduce `@custom-media --sm (max-width: 640px)`, `--md (max-width: 768px)`, etc. Replace raw px across files.
- Deduplicate backgrounds: Keep canvas/grid/noise/spotlight only in `00-unified-theme.css`; remove section-local duplicates in 08/09/10/11/12/13.
- Componentize shared UI: Centralize `.button` (primary/secondary), `.card` shell, `.tag` pills, focus rings, and metric chips in `05-components.css` using tokens. Sections only compose them.
- Class naming: Avoid generic names that collide (e.g., `.dot`); scope as `.services__dot` etc. Use BEM naming convention.
- Minification: Use `cssnano` or an equivalent to minify the final CSS bundle.
- Unused CSS: Run Coverage to identify dead rules; remove or gate with `@layer overrides` until deleted.

## 5) Rendering & Painting

- Reduce overdraw on mobile:
  - Lower `backdrop-filter`/`filter: blur()` and `mix-blend-mode` opacity (already partly done). Prefer subtler gradients.
  - **GPU optimization rule**: Max 2 backdrop-filters visible in viewport simultaneously to prevent jank
  - Avoid stacking many fixed-position backgrounds; keep one canvas on `body::before` with grid + noise.
  - Provide fallbacks: `@supports not (backdrop-filter: blur(10px)) { /* solid background */ }`
- Containment:
  - Use `content-visibility: auto;` on non-hero sections (`#about`, `#services`, `#contact`, `#contact-forms`, `.footer`) to skip rendering offscreen; add `contain-intrinsic-size` to avoid jumps.
- Compositing hints: Avoid `will-change` unless absolutely needed; it can cost memory and create extra layers.

## 6) Images & Media

- Compress hero/avatar assets: Convert `gibli-pfp.png` (~1.9MB) to AVIF/WEBP; add `<source type>` fallbacks using `<picture>`. Target <150KB.
- Use `image-set()` for decorative noise where raster is unavoidable and scale appropriately for DPR.
- Lazy-load all non-critical images (`loading="lazy"`).
- SVG icons: Inline fine; ensure no heavy filters.

## 7) Animations & Motion

- Respect reduced motion: Existing `@media (prefers-reduced-motion: reduce)` blocks should disable transitions/animations globally.
- Tame glow/orb animations on mobile; prefer lighter opacities and fewer keyframes.
- Carousel: CSS-only snap is efficient; avoid JS-driven transforms on scroll.
- **Performance targets**:
  - Maintain 60fps on hero scroll
  - Monitor paint frequency during orb animations
  - Use only CSS `transform` and `opacity` for animations (no `top/left/width/height`)

## 8) Accessibility & UX Performance

- Focus rings: Provide a single token-driven focus style applied consistently.
- Tap targets: Maintain ≥44x44; ensure spacing isn’t collapsed by minification.
- Dots indicator: CSS-only (no JS), mobile-only, static color change (no animation) to keep motion calm.

## 9) Build & Delivery Strategy

- Bundling: Concatenate and minify styles to a single `main.css` (postcss + cssnano). Maintain source maps for dev.
- **Enhanced PostCSS plugins**:
  - `postcss-merge-rules` - merge duplicate rules
  - `postcss-combine-duplicated-selectors` - combine identical selectors
  - `autoprefixer` with appropriate browserslist
  - `postcss-custom-media` - for breakpoint management
- **CSS splitting strategy**:
  - `critical.css` (inline, <14KB) - above-the-fold styles
  - `main.css` (deferred) - all other styles
  - `print.css` (media="print") - print-specific styles
- Purge/Prune: Use a conservative purge step with safelist for dynamic classes (if any). Since we're HTML-first, a static purge is safe.
- Cache:
  - Set long cache headers for `main.css` with a content hash in filename (e.g., `main.abcdef.css`).
  - HTML no-cache (so it can point to new hashed assets).
- Preload: If `main.css` grows, consider `<link rel="preload" as="style">` + `rel=stylesheet` swap; otherwise keep a single blocking CSS for simplicity.
- **Performance budget**: CSS < 50KB gzipped

## 10) Revised Prioritized Action Plan

### Immediate (Week 1) - Foundation Fixes
1) **Remove all `!important` declarations** (blocks everything else)
   - Audit and remove all 127 instances from `06-utilities.css`
   - Remove remaining instances from other files
   - Keep only for critical overrides like `.d-none` if absolutely necessary

2) **Implement cascade layers**
   - Add `@layer` scaffolding across all CSS files
   - Order: `base, tokens, layout, components, sections, utilities, overrides`
   - Migrate styles to appropriate layers

3) **Fix class naming collisions**
   - Rename generic `.dot` to `.services__dot`
   - Apply BEM naming convention throughout
   - Document naming patterns

### Critical (Week 2) - Consolidation
4) **Consolidate duplicate styles**
   - Remove duplicated section backgrounds
   - Keep all canvas work in `00-unified-theme.css`
   - Centralize button/card/tag/focus-ring in `05-components.css`

5) **Unify color system to OKLCH**
   - Convert all colors to OKLCH format
   - Remove RGB/HSL/HEX variants
   - Update tokens consistently

6) **Optimize mobile media queries**
   - Single `@media (max-width: 640px)` block per file
   - Standardize breakpoints via `@custom-media`
   - Remove conflicting rules

### Important (Week 3) - Performance
7) **Image optimization**
   - Convert heavy PNGs to AVIF/WEBP
   - Add explicit dimensions
   - Implement lazy loading

8) **Build pipeline setup**
   - Add PostCSS with plugins (merge-rules, autoprefixer, cssnano)
   - Implement CSS splitting (critical/main/print)
   - Add hashed filenames and cache headers

9) **Performance testing**
   - Run Lighthouse/WebPageTest
   - Visual regression testing
   - Cross-browser testing (especially Safari backdrop-filter)

### Nice-to-have (Week 4+) - Polish
10) **Advanced optimizations**
    - Add `content-visibility: auto` to sections
    - Implement performance budget enforcement
    - Reduce GPU-intensive effects further

11) **Monitoring & documentation**
    - Set up RUM tracking
    - Create design token documentation
    - Document new CSS architecture

## 11) Acceptance Criteria

- Lighthouse: LCP ≤ 2.5s (3G Fast), CLS ≤ 0.1, INP ≤ 200ms, no major accessibility or best practices flags.
- DevTools Coverage: ≤ 25% unused CSS on first view (static site target).
- Visual parity: No regressions in “premium” gradient/glow system; hero/About cadence preserved.
- Code health: Zero `!important` outside a minimal utility safelist; no duplicate backgrounds across sections; a single mobile media block per CSS file.

## 12) Testing Protocol

### Performance Testing
- **Baseline metrics**: Document current Lighthouse scores before changes
- **Device testing matrix**:
  - Low-end Android (2GB RAM) as baseline
  - iPhone SE (small viewport)
  - Desktop Chrome/Firefox/Safari
  - Edge cases: 3G network simulation
- **Visual regression testing**: Screenshot comparison for each major change
- **Cross-browser compatibility**:
  - Safari: backdrop-filter support and fallbacks
  - Firefox: CSS layers support
  - Mobile browsers: touch interactions and scroll performance
- **Performance budget enforcement**:
  - CSS < 50KB gzipped
  - No more than 3 repaints during scroll
  - 60fps maintained during animations

### Monitoring & Metrics
- Track Core Web Vitals in production
- Set up alerts for performance regressions
- Monitor real user metrics (RUM) if available
- Weekly performance audits during rollout

## 13) Risk Mitigation Strategy

### Rollback Plan
- **Version control**:
  - Keep current CSS as `legacy.css` during transition
  - Tag releases for each phase completion
  - Maintain ability to revert within 5 minutes
  
### Gradual Rollout
- **Feature flagging**:
  - Environment variable to toggle optimized CSS
  - A/B test on 10% of traffic initially
  - Monitor metrics for 48 hours before full rollout
  
### Fallback Strategies
- **Progressive enhancement**:
  - Core styles work without modern features
  - `@supports` queries for backdrop-filter, CSS layers
  - Graceful degradation for older browsers
  
### Communication
- Document all breaking changes
- Create migration guide for team
- Schedule changes during low-traffic periods

## 14) Enhanced Rollout Checklist

### Week 1 - Foundation
- [ ] Audit and remove all 127 `!important` declarations from utilities
- [ ] Remove remaining `!important` instances from other files
- [ ] Introduce `@layer` ordering in all CSS files
- [ ] Rename all generic class names to BEM-style scoped names
- [ ] Fix class naming collisions (`.dot` -> `.services__dot`)
- [ ] Create z-index token scale and apply throughout

### Week 2 - Consolidation  
- [ ] Migrate canvas/background effects into `00-unified-theme.css`; delete duplicates
- [ ] Componentize buttons/cards/tags in `05-components.css`; update sections to consume
- [ ] Convert all colors to OKLCH format
- [ ] Consolidate mobile queries; add `@custom-media` aliases
- [ ] Create design token documentation

### Week 3 - Performance
- [ ] Convert large images; add dimensions/decoding/lazy
- [ ] Add `content-visibility` and `contain-intrinsic-size` to sections
- [ ] Add postcss + cssnano; hashed CSS filename + cache headers
- [ ] Implement CSS splitting (critical/main/print)
- [ ] Set up performance budget in CI/CD

### Week 4 - Validation
- [ ] Run comprehensive cross-browser testing
- [ ] Perform visual regression testing
- [ ] Re-run Lighthouse/WebPageTest; document before/after metrics
- [ ] Create fallback styles for reduced-capability browsers
- [ ] Document the new CSS architecture for team
- [ ] Deploy to staging and test thoroughly
- [ ] Plan production rollout with feature flags


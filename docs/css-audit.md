# CSS Audit – Follow-up Status (Aug 2025)

This follow-up re-audit reflects the current state of `src/styles/` relative to the performance plan and the in-progress task list. Where possible, quantitative stats are included from the current codebase.

## Executive Summary

- Strong progress: cascade layers are implemented, `!important` usage is now zero, and many components align to tokens and shared patterns.
- Not yet complete: background/grid/noise consolidation, color system unification to OKLCH, and media-query consolidation. Section files still paint their own canvases and include multiple mobile blocks.
- Mobile carousel: CSS-only, one-card-at-a-time with scroll-snap is in place; a progressive scroll-driven progress bar is implemented via CSS where supported.

## Quick Metrics (current codebase)

- `!important` declarations: 0
- Color formats in styles: 104 `oklch()`, 8 `oklab()`, 14 `rgb()`, 1 `hsl()`, 96 hex literals
- Mobile query duplication: 25 occurrences of `@media (max-width: 640px)` across files
- GPU-costly effects still present in sections: multiple `backdrop-filter`, `filter: blur()`, and `mix-blend-mode` uses (reduced in some places for mobile, but still duplicated per-section)

## Status vs Plan

- Cascade layers: Implemented in `src/styles/main.css` with `@layer base, tokens, layout, typography, components, sections, utilities, overrides;` and imports mapped to layers. Status: Completed.
- Remove `!important`: A full sweep shows zero occurrences across `src/styles`. Status: Completed.
- Centralize background/canvas effects: Section files (Hero, About, Services, Contact, Footer) still define their own grid/noise/vignette layers in parallel to `00-unified-theme.css`. Status: Not completed.
- Color system unification (OKLCH): Mixed formats remain, particularly in `07-dark-theme.css` and some section files. Status: Not completed.
- Consolidate mobile media queries: Many files contain multiple `@media (max-width: 640px)` blocks. Status: Not completed.
- Naming collisions (`.dot`): Services uses `.services__dot`; hero scope is `.mouse .dot`. A defensive `animation: none` remains on `.services__dot` in mobile, which is acceptable but can be removed once confident scoping is sufficient. Status: Effectively addressed, minor clean-up possible.
- Mobile carousel progress: CSS-only progress bar added using scroll-linked animations as a progressive enhancement; falls back to dots where unsupported. Status: Completed.

## Section Highlights

- 00-unified-theme.css: Solid unified canvas and mobile performance reductions exist. Opportunity remains to relocate section-level grid/noise from other files into this single source of truth.
- 08-hero.css and 09-about.css: Continue to paint grid/noise/vignette locally; retain multiple filter/blur overlays. Consider trimming to only unique effects and rely on unified canvas for grid/noise.
- 10-services.css: Functionally correct mobile carousel; multiple overlapping mobile blocks can be consolidated. Redundant overrides exist; consider a single mobile block near file end. CSS-only progress bar uses `animation-timeline` where available.
- 11-contact.css and 12-contact-forms.css: Local background layers and repeated component styles can be centralized (buttons/borders to `05-components.css`; canvas to unified theme).
- 07-dark-theme.css: Many hex/rgb literals remain; map to tokens or OKLCH.

## Recommended Next Actions (high impact, low risk)

- Consolidate canvases: Remove section-local grid/noise/vignette where possible and rely on `00-unified-theme.css` variables for tint/spotlight.
- Color unification: Replace remaining hex/rgb/hsl occurrences with `oklch()` or token references, prioritizing `07-dark-theme.css` and section files.
- Media query consolidation: Collapse multiple mobile blocks into one per file; consider `@custom-media` for breakpoints to improve consistency.
- Simplify Services mobile CSS: Merge overlapping carousel rules; keep scroll-snap definitions in a single mobile block; remove the defensive `animation: none` once verified unnecessary.
- Performance trims: Where feasible, reduce duplicate `backdrop-filter` and `filter: blur()` on mobile in section files (some reductions already exist in the unified theme).

## Verification Checklist

- [x] Cascade layers configured in `main.css`
- [x] Zero `!important` usage
- [ ] Section backgrounds consolidated to unified canvas
- [ ] All colors standardized to OKLCH/tokens
- [ ] Single mobile block per stylesheet
- [x] Mobile carousel centered, one card visible
- [x] CSS-only progress bar (progressive enhancement)

## Notes

- The in-progress task list currently marks Week 2 consolidation items (canvas centralization, color unification, media-query consolidation) as completed; the codebase does not yet reflect those completions. This audit corrects status to provide accurate next steps.

---

Last updated after code review of `src/styles` and `src/index.html` on the active branch.


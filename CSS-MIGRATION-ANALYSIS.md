# CSS Migration Analysis: feature/css-design-system vs feature/typescript-build

## Key Differences Found

### 1. HTML Structure Differences

#### feature/css-design-system index.html:
- Has theme toggle script inline in `<head>` (lines 101-111)
- Uses `data-theme` attribute on `<html>` 
- Body has class `no-js` only
- Scripts loaded: `pe.js` and `theme-toggle.js` separately
- Different CSS class structure (e.g., `section--hero`, `section--about`)
- More complex hero section with testimonials
- Different button classes: `button--primary`, `button--secondary`

#### feature/typescript-build index.html (from main):
- Body has `dark-theme no-js` classes
- Script loaded: `pe-min-v3.js` (single file)
- Simpler class structure
- Different button classes: `btn btn-primary`, `btn btn-secondary`

### 2. CSS Architecture Differences

#### feature/css-design-system main.css:
```css
@layer settings, generic, elements, objects, components, utilities, sections, theme;

Imports:
- ./00-settings/tokens.css
- ./01-generic/reset.css  
- ./02-elements/typography.css
- ./03-objects/layout.css
- ./04-components/components.css
- ./05-utilities/utilities.css
- ./06-sections/sections-base.css
- ./06-sections/hero.css
- ./06-sections/about.css
- ./06-sections/services.css
- ./06-sections/contact.css
- ./06-sections/contact-forms.css
- ./06-sections/footer.css
- ./00-settings/unified-theme.css (theme layer)
- ./00-settings/dark-theme.css (theme layer)
```

Uses CSS custom properties like:
- `--color-background`
- `--color-text`
- `--color-brand-primary`
- `--space-3`
- `--radius-full`

#### Original main.css (what we had on typescript-build):
```css
@layer base, tokens, layout, typography, components, sections, utilities, overrides;

Imports (flat structure):
- ./00-unified-theme.css
- ./01-reset.css
- ./02-tokens.css
- ./03-layout.css
- ./04-typography.css
- ./05-components.css
- ./06-utilities.css
- ./07-dark-theme.css
- ./08-hero.css
- ./09-about.css
- ./10-services.css
- ./11-contact.css
- ./12-contact-forms.css
- ./13-footer.css
```

Uses different CSS custom properties like:
- `--color-neutral-100`
- `--color-neutral-400`
- `--color-primary-200`

### 3. Missing Components/Features

#### What's missing from typescript-build branch:
1. **Theme Toggle System**: No theme-toggle.ts script or theme switching logic
2. **Proper ITCSS Structure**: Needs the hierarchical folder structure
3. **CSS Variables**: Different variable naming conventions
4. **HTML Class Updates**: Index.html uses old class names that don't match new CSS
5. **Script Loading**: Still references pe-min-v3.js instead of pe.js + theme-toggle.js

### 4. Build Process Differences

#### feature/css-design-system:
- Scripts: pe.ts and theme-toggle.ts (TypeScript)
- Build outputs: pe.js and theme-toggle.js (separate files)
- Script replacement in build-replace-vars.ts: pe.js → pe-min.js

#### feature/typescript-build:
- Was trying to use pe.ts but HTML still referenced old pe-min-v3.js
- No theme-toggle.ts integration

## Action Items to Fix Styles

### 1. Update index.html on typescript-build branch:
- [ ] Add theme toggle inline script in `<head>`
- [ ] Update body classes from `dark-theme no-js` to just `no-js`
- [ ] Update all button classes from `btn btn-*` to `button button--*`
- [ ] Update section classes to include modifiers (e.g., `section--hero`)
- [ ] Update script references to load both pe.js and theme-toggle.js

### 2. Fix CSS variable mismatches:
- [ ] Ensure CSS files use consistent variable names
- [ ] Check if we have all required token definitions

### 3. Verify all CSS files are properly structured:
- [x] Already have proper ITCSS folder structure
- [x] Already have main.css with correct imports
- [ ] Need to ensure all CSS files have compatible variable references

### 4. Build process alignment:
- [x] TypeScript compilation working
- [ ] Need to update build-replace-vars.ts script replacement logic
- [ ] Need to ensure deploy.yml matches script names

## Summary

The main issue is that we copied over the CSS architecture but didn't update the HTML to use the new class names and structure. The index.html on typescript-build branch is still using the old class naming conventions and doesn't have the theme toggle system integrated.

To fix this, we need to:
1. Update index.html to match the CSS design system's class structure
2. Ensure theme toggle is properly integrated
3. Fix any CSS variable name mismatches
4. Update build scripts to handle the new file names correctly
# 0xjcf Astro Migration Task List

## Phase 0 Exit Gate

- [ ] All existing URLs load without redirects. (Local server returns 301 for `.html` → clean paths; verify on target host.)
- [ ] All form submissions work in staging. (Local Worker returns 303; contact redirects to error due to missing RESEND_API_KEY; staging not tested.)
- [ ] Status pages load directly by URL. (Local server redirects `.html` to clean paths; confirm on target host.)
- [x] Anchor links verified.

## Phase 1: Bootstrap Astro + Config

### Task 1.1: Initialize Astro baseline

- [x] Add Astro to the repo (minimal template).
- [x] Create `astro.config.mjs` with `output: "static"`, `build.format: "file"`, `trailingSlash: "ignore"`.
- [x] Wire `site` to environment (`staging.0xjcf.com` vs `0xjcf.com`).
- **Estimated Time**: 2-3 hours

### Task 1.2: Dev proxy for `/api/*`

- [x] Configure Astro dev server proxy to `http://localhost:8787` for `/api`.
- [x] Document local dev workflow (Astro + Wrangler).
- **Estimated Time**: 1-2 hours

## Phase 2: Port Pages 1:1

### Task 2.1: Base layout + global styles

- [x] Create `src/layouts/BaseLayout.astro` with shared HTML head and scripts.
- [x] Move or mirror CSS into `src/styles/` and import in layout.
- [x] Copy assets to `public/assets/` to keep `/assets/*` paths stable.
- [x] Verify CSS load order and asset paths before porting `index.astro`.
- **Estimated Time**: 3-5 hours

### Task 2.2: Home page

- [x] Port `src/index.html` to `src/pages/index.astro` with minimal markup changes.
- [x] Preserve anchor IDs and internal links.
- **Estimated Time**: 4-6 hours

### Task 2.3: Status pages (preserve `.html`)

- [x] Create literal `.html` files in `src/pages/` for all status routes.
- [x] Ensure `noindex,follow` is preserved.
- **Estimated Time**: 2-3 hours

### Task 2.4: About/Open Source/Writing scaffolds

- [x] Create placeholder pages with matching nav/structure.
- **Estimated Time**: 2-3 hours

## Phase 3: Blog System

### Task 3.1: Content collections

- [x] Define blog collection schema and frontmatter fields.
- [x] Add 2-3 sample posts for validation.
- **Estimated Time**: 3-4 hours

### Task 3.2: Blog routes

- [x] Implement `/writing` index.
- [x] Implement `/writing/[slug]` post pages.
- [ ] Optional: tags page(s).
- **Estimated Time**: 4-6 hours

### Task 3.3: RSS + sitemap

- [x] Add `@astrojs/sitemap` integration.
- [x] Add RSS endpoint using `@astrojs/rss` or endpoint helper.
- **Estimated Time**: 2-3 hours

## Phase 4: SEO + Metadata

### Task 4.1: Per-page metadata

- [x] Implement title/description, canonical, OG/Twitter tags in layout.
- [x] Verify canonical URLs use `site`.
- **Estimated Time**: 2-3 hours

### Task 4.2: JSON-LD

- [x] Person schema for home/about.
- [x] BlogPosting schema for posts (if feasible).
- **Estimated Time**: 2-3 hours

## Phase 5: Forms + Worker Alignment

### Task 5.1: Update form actions

- [x] Update form actions to `/api/contact` and `/api/newsletter`.
- [x] Ensure redirect targets remain `.html` status pages.
- **Estimated Time**: 1-2 hours

### Task 5.2: Worker env alignment

- [x] Add staging environment to `wrangler.toml`.
- [x] Update `SITE_URL` and related vars for staging/prod.
- [x] Document Worker route config for `/api/*`.
- **Estimated Time**: 2-3 hours

## Phase 6: QA + Docs

### Task 6.1: QA checklist

- [x] Validate routes, anchors, and status pages.
- [x] Verify RSS output.
- [x] Verify sitemap output.
- [x] Run Lighthouse baseline and note any regressions.
- [x] Lighthouse remediation: fix 404 for `/scripts/form-redirect` (bundle/emit correct path) and rerun.
- [x] Lighthouse remediation: address remaining a11y findings (mobile form toggle contrast/aria color fail).
- [x] Performance remediation: reduce render-blocking CSS (bundle/preload critical) and enable CSS minification in build; right-size gibli-pfp image and rerun (target mobile FCP).
- [x] Validate post-fix Lighthouse against `astro preview` build.
- **Estimated Time**: 2-3 hours

### Task 6.2: Documentation

- [x] Write `docs/deploy-workflow.md`.
- [x] Write `docs/worker-routing.md`.
- [x] Write `docs/how-to-publish.md`.
- **Estimated Time**: 2-3 hours

### Task 6.3: Jira-formatted implementation summary

- [ ] Create Jira-formatted summary with `{code:language}` and `{quote}` blocks for team sharing.
- **Estimated Time**: 1 hour

## Total Estimated Time: 26-38 hours

## Dependencies

- DNS for `staging.0xjcf.com` and `0xjcf.com` configured in Cloudflare.
- Cloudflare Pages project connected to repo with build settings.
- Cloudflare Worker routes set for `staging.0xjcf.com/api/*` and `0xjcf.com/api/*`.

## Risk Mitigation

- Preserve `.html` status pages explicitly to avoid redirect regressions.
- Keep anchors unchanged to prevent broken form error links.
- Use staging domain for `site` to avoid polluted RSS/sitemap URLs.
- Validate same-origin behavior with local proxy and staging tests before production cutover.

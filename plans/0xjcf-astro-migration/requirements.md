# 0xjcf Astro Migration Requirements

## Overview

Migrate the existing 0xjcf.com personal site from static HTML/CSS/TS to Astro on Cloudflare Pages, preserving current design and URLs while enabling a scalable blog (content collections, RSS, sitemap) and strengthening SEO. Cloudflare Worker form APIs must remain same-origin under `/api/*` with existing status page targets preserved.

## Acceptance Criteria

- Astro migration completed with current pages working and minimal JS.
- Cloudflare Pages hosts static output; Worker handles `/api/contact` and `/api/newsletter` under the same origin.
- Existing URLs are preserved where possible; any changes use 301 redirects and are documented.
- Status pages remain accessible at:
  - `/contact-thanks.html`
  - `/contact-error.html`
  - `/newsletter-thanks.html`
  - `/newsletter-error.html`
  - `/newsletter-check-email.html`
- Blog system implemented:
  - Content collections with Markdown posts
  - `/writing` index
  - `/writing/[slug]` post pages
  - Optional tags
  - `/rss.xml` and `/sitemap.xml`
- SEO baseline implemented:
  - Unique title and description per top-level page
  - Canonical URLs derived from `site`
  - OG/Twitter metadata
  - Person JSON-LD on home/about
  - BlogPosting JSON-LD on posts (if feasible)
- Environment workflow supported:
  - Local dev with Astro + Wrangler
  - Staging at `https://staging.0xjcf.com`
  - Production at `https://0xjcf.com`
- Documentation delivered:
  - `docs/deploy-workflow.md`
  - `docs/worker-routing.md`
  - `docs/how-to-publish.md`

## Affected Components/Files

- New Astro files: `astro.config.mjs`, `src/pages/`, `src/layouts/`, `src/components/`, `src/content/blog/`.
- Static assets: `public/assets/` (move or mirror existing `src/assets/`).
- Styles: `src/styles/` (reuse existing CSS modules).
- Worker config: `wrangler.toml` updates for staging/prod `SITE_URL` and `/api` routing alignment.
- Docs: `docs/astro-migration-plan.md`, `docs/deploy-workflow.md`, `docs/worker-routing.md`, `docs/how-to-publish.md`.
- Build/deploy config for Cloudflare Pages.

## Current State

- Site is static HTML/CSS/JS served from `src/` with a build pipeline that compiles to `dist/`.
- Forms are processed by a Cloudflare Worker, which enforces same-origin and redirects to `.html` status pages.
- No blog system exists; all content is in `src/index.html` and related status pages.

## Requirements

1. Astro runs in static output mode with `build.format = "file"` and `trailingSlash = "ignore"`.
2. `site` must be environment-aware (`https://staging.0xjcf.com` for staging, `https://0xjcf.com` for prod).
3. Preserve current HTML structure and CSS class names to maintain look/feel.
4. Preserve anchor IDs on `/` as stable public interfaces.
5. Preserve `.html` status routes via literal files in `src/pages/`.
6. Implement blog content collection and routes under `/writing`.
7. Generate RSS and sitemap via Astro integrations.
8. Implement per-page metadata and JSON-LD for SEO.
9. Update forms to post to relative `/api/contact` and `/api/newsletter`.
10. Maintain Worker same-origin enforcement and ensure redirects point to preserved `.html` pages.
11. Add docs for deployment workflow, worker routing, and post publishing.

## Non-Functional Requirements

- Performance: minimal JS, no SPA behavior, fast static output.
- SEO: preserve existing URLs, avoid broken links, correct canonical/OG/Twitter metadata.
- Maintainability: modular layouts/components and content collections.
- Security: same-origin enforcement for forms, no new exposed endpoints.
- Accessibility: keep semantic structure and heading hierarchy (one H1 per page).

## Explicit Non-Goals (Phase 1)

- No redesign or visual refresh.
- No copy overhaul.
- No analytics replacement.
- No authentication or user accounts.
- No CMS beyond Markdown content collections.

# Astro Migration Plan (Phase 0 - Inventory + Plan)

## Current stack and build/deploy

- Framework: static HTML/CSS/JS (no Astro/Next/etc).
- Content system: hand-authored HTML in `src/` (no MD/MDX or CMS).
- Routing: file-based static routes (each `src/*.html` becomes `/...html`), plus section anchors on `/`.
- Build pipeline:
  - HTML variable replacement from `wrangler.toml` via `scripts/build-replace-vars.ts` into `dist/`.
  - CSS bundle/minify via `lightningcss`.
  - JS bundle/minify via `esbuild` (plus some raw JS files).
  - HTML minify via `html-minifier-terser`.
- Forms backend: Cloudflare Worker (`worker.ts`) with env-driven redirect URLs (same-origin enforcement).
- Deployment assumptions: static `dist/` or `src/` served; production `SITE_URL` currently points at `https://0xjcf.github.io/port8080folio` in `wrangler.toml`.

## Phase 0 scope boundary

Out of scope for Phase 0:

- Copy changes
- Section reordering
- New CTAs
- SEO keyword rewrites
- Design system refactors

## Target deployment (Cloudflare Pages + Worker)

- Hosting:
  - Staging: `https://staging.0xjcf.com` (or Pages preview domain).
  - Production: `https://0xjcf.com`.
- Forms API:
  - Cloudflare Worker serves `/api/*` routes under the same origin.
  - Required endpoints:
    - `POST /api/contact`
    - `POST /api/newsletter`
- Site forms should post to relative paths (`/api/contact`, `/api/newsletter`) so staging/prod share the same code.

## Astro config invariants (compiler mode)

Goal: lock Astro to static output and avoid SSR drift.

Planned settings:

```ts
export default defineConfig({
  output: "static",
  build: { format: "file" },
  trailingSlash: "ignore",
  site: process.env.SITE_URL,
});
```

## Current routes -> source files

Note: production URLs are currently configured with a `/port8080folio/` base path (GitHub Pages style). Routes below are relative to site root.

| Route | Source file | Notes |
| --- | --- | --- |
| `/` | `src/index.html` | Single-page landing with section anchors (hero, proof, about, services, contact/forms). |
| `/contact-thanks.html` | `src/contact-thanks.html` | Status page (noindex). Links back to `/#services`. |
| `/contact-error.html` | `src/contact-error.html` | Status page (noindex). Links back to `/#contact-form`. |
| `/newsletter-thanks.html` | `src/newsletter-thanks.html` | Status page (noindex). Links back to `/#services`. |
| `/newsletter-error.html` | `src/newsletter-error.html` | Status page (noindex). Links back to `/#newsletter-form`. |
| `/newsletter-check-email.html` | `src/newsletter-check-email.html` | Status page (noindex). Links back to `/#services`. |
| `/styles/main.css` | `src/styles/main.css` | Bundled in build to `dist/styles/main.css`. |
| `/scripts/*` | `src/scripts/*` | Theme toggle, analytics, form redirect, etc. |
| `/assets/*` | `src/assets/*` | Images and other static assets. |

### Section anchors on `/`

- `#hero`, `#proof`, `#about`, `#services`, `#contact`, `#contact-forms`, `#contact-form-panel`, `#newsletter-form-panel`.

## Anchor contract

Anchor IDs on `/` are considered stable public interfaces. Any removal requires either:

- identical replacement IDs, or
- explicit same-page redirect via JS.

## Proposed Astro routes (target)

| Route | Astro source | Notes |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Home page, content-first. |
| `/writing` | `src/pages/writing/index.astro` | Blog index. |
| `/writing/[slug]` | `src/pages/writing/[slug].astro` | Post pages from content collection. |
| `/open-source` | `src/pages/open-source.astro` | OSS page. |
| `/about` | `src/pages/about.astro` | About page. |
| `/contact-thanks.html` | `src/pages/contact-thanks.html` or `src/pages/contact-thanks.astro` with file output | Preserve worker redirect target. |
| `/contact-error.html` | `src/pages/contact-error.html` or `src/pages/contact-error.astro` with file output | Preserve worker redirect target. |
| `/newsletter-thanks.html` | `src/pages/newsletter-thanks.html` or `src/pages/newsletter-thanks.astro` with file output | Preserve worker redirect target. |
| `/newsletter-error.html` | `src/pages/newsletter-error.html` or `src/pages/newsletter-error.astro` with file output | Preserve worker redirect target. |
| `/newsletter-check-email.html` | `src/pages/newsletter-check-email.html` or `src/pages/newsletter-check-email.astro` with file output | Preserve worker redirect target. |
| `/rss.xml` | `src/pages/rss.xml.js` (Astro endpoint) | RSS feed. |
| `/sitemap.xml` | Astro sitemap integration | Include posts and pages. |
| `/tags/[tag]` (optional) | `src/pages/tags/[tag].astro` | Tag index pages. |

## Proposed Astro folder layout

- `src/pages/` for route files.
- `src/layouts/` for base layout(s).
- `src/components/` for shared UI chunks (nav/footer/hero blocks).
- `src/content/blog/` for Markdown posts (content collections).
- `src/styles/` for existing CSS (ported with minimal edits).
- `public/` for static assets (images, icons, robots, etc.).

## Asset invariants

- All runtime assets must resolve from `/assets/*`.
- No hashed filenames during Phase 0.
- Avoid Astro asset pipeline rewrites until after content stabilizes.

## What stays the same visually

- Reuse existing CSS modules in `src/styles/` with minimal or no changes.
- Preserve current HTML structure and class names where possible.
- Keep existing typography, spacing, and section composition.
- Keep JS minimal; only use Astro islands if absolutely required.

## Risks and mitigations

- **.html status routes**: current worker redirects go to `*.html`. Mitigation: keep `.html` endpoints via `build.format = "file"` or `src/pages/*.html` so URLs remain unchanged.
- **Base path/domain**: current metadata and worker config point to `https://0xjcf.github.io/port8080folio`. Mitigation: switch to `0xjcf.com`/staging domains in Astro `site` and worker env vars; keep redirects stable during cutover.
- **Same-origin enforcement**: worker only accepts same-origin form posts. Mitigation: update `wrangler.toml` vars after route decisions; keep thank-you/error paths stable.
- **Asset paths**: existing HTML uses `assets/` and `styles/` relative paths. Mitigation: mirror these in Astro (`public/assets`, `src/styles`) and verify output structure.
- **SEO drift**: title/description/schema currently service-oriented. Mitigation: update metadata during SEO phase after route/content stabilization.

## Redirect plan (draft)

- Goal is zero redirects by preserving existing paths.
- If we change any existing `.html` or anchor links:
  - `GET /contact-thanks.html` -> new equivalent path (301)
  - `GET /contact-error.html` -> new equivalent path (301)
  - `GET /newsletter-thanks.html` -> new equivalent path (301)
  - `GET /newsletter-error.html` -> new equivalent path (301)
  - `GET /newsletter-check-email.html` -> new equivalent path (301)
- If we drop `/#services` anchors or rework sections, keep anchor IDs or add same-page redirects in content.

## Environment workflow (staging + prod)

- Local dev:
  - Astro dev server for site.
  - Worker runs via `wrangler dev`.
  - Forms should post to `/api/*` and be proxied to the worker in dev.
  - Recommended dev proxy:

    ```ts
    vite: {
      server: {
        proxy: {
          "/api": "http://localhost:8787"
        }
      }
    }
    ```

  - Local workflow:
    - `npm run dev:astro`
    - `npx wrangler dev`
- Staging (Cloudflare Pages):
  - Deploy from a staging branch or preview builds.
  - `site` set to `https://staging.0xjcf.com` (or preview URL).
  - `/api/*` routes to staging worker env.
- Production (Cloudflare Pages):
  - Deploy `main` to `https://0xjcf.com`.
  - `site` set to `https://0xjcf.com`.
  - `/api/*` routes to production worker env.

## Required docs to add in later phases

- `docs/deploy-workflow.md` with branch -> environment mapping and deployment steps.
- `docs/worker-routing.md` with `/api/*` route configuration and testing steps.

## Decisions needed in Phase 1

- **Staging URL:** use `https://staging.0xjcf.com` (avoid Pages preview URLs for canonical/RSS/sitemap accuracy).
- **Status pages:** preserve `.html` status routes using literal `.html` files in `src/pages/`; keep `build.format = "file"` only as a fallback.
- **Dev proxy:** use Astro dev proxy to Wrangler dev for `/api/*`:

  ```ts
  vite: {
    server: {
      proxy: {
        "/api": "http://localhost:8787"
      }
    }
  }
  ```

## Phase 1 invariants

- Astro runs in static output mode only.
- Workers remain the only backend.
- No form logic moves into Astro.
- No breaking URL or anchor changes.

## Phase 0 exit checklist

- [ ] All existing URLs resolve without redirects.
- [ ] All form submissions succeed in staging.
- [ ] All thank-you/error pages load directly.
- [ ] Anchor links work from external pages.
- [ ] No console errors on `/`.
- [ ] Lighthouse baseline captured (pre-SEO).

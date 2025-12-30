# 0xjcf Astro Migration Design

## Technical Approach

- Use Astro as a static site compiler only (no SSR), mirroring the existing HTML/CSS structure.
- Preserve routes and anchors; treat `.html` status pages and section IDs as public contracts.
- Implement a blog with Astro content collections for maintainable Markdown publishing.
- Deploy the site on Cloudflare Pages; keep Cloudflare Worker handling `/api/*` under the same origin.
- Keep client JS minimal; only reuse existing scripts where necessary (theme toggle, analytics).

## Implementation Options

1. **Direct HTML-to-Astro port (recommended)**
   - Convert existing HTML pages to `.astro` files with minimal markup changes.
   - Pros: low-risk, preserves design and URLs.
   - Cons: initial duplication until components are extracted.
2. **Component-first rewrite**
   - Break the page into components immediately.
   - Pros: cleaner structure early.
   - Cons: higher risk of design/SEO drift.

Status page routing options:

- **Literal `.html` files in `src/pages/` (recommended)**
  - Pros: explicit, predictable output; matches Worker redirects.
  - Cons: slightly less "Astro-native".
- `build.format = "file"` only
  - Pros: less manual HTML file handling.
  - Cons: risk of unexpected output paths.

## Available Libraries Analysis

- **Astro core**: static output and file-based routing align with current site.
- **@astrojs/sitemap**: generates sitemap automatically based on routes.
- **@astrojs/rss** (or `@astrojs/rss` endpoint helper): generates RSS from content collection.
- Existing tooling: `esbuild`, `lightningcss`, `html-minifier-terser` currently used but may become less central once Astro handles HTML output.

## Proposed Solution Architecture

- **Astro config**:
  - `output: "static"`
  - `build.format: "file"`
  - `trailingSlash: "ignore"`
  - `site: process.env.SITE_URL` (set by environment)
  - Note: `build.format = "file"` is set for consistency, but literal `.html` files remain the source of truth for status routes.
- **Pages**:
  - `src/pages/index.astro` (home)
  - `src/pages/writing/index.astro` (blog index)
  - `src/pages/writing/[slug].astro` (posts)
  - `src/pages/about.astro`, `src/pages/open-source.astro`
  - Status pages as literal `.html` in `src/pages/`
- **Layouts**:
  - `src/layouts/BaseLayout.astro` for shared HTML skeleton, metadata injection, and site-wide scripts.
- **Content Collections**:
  - `src/content/blog/*.md` with frontmatter:
    - `title`, `description`, `pubDate`, optional `updatedDate`, `tags`, `draft`.

## Integration Points

- **Worker APIs**: forms post to `/api/contact` and `/api/newsletter`.
- **Worker redirects**: must land on `.html` status pages.
- **Environment variables**:
  - `SITE_URL` for Astro `site`.
  - `wrangler.toml` staging/production `SITE_URL` alignment.
- **Cloudflare Pages**:
  - Build output is static; set build command and output dir accordingly.

## Error Handling Strategy

- Keep existing form success/error flow via Worker redirects.
- Ensure status pages are `noindex,follow` and load directly.
- Avoid client-side error handling unless necessary; server-side Worker response and redirect remains the source of truth.

## Performance Considerations

- Avoid Astro islands unless required (prefer static HTML and existing lightweight scripts).
- Reuse existing CSS without major refactor to prevent layout shifts.
- Keep asset URLs stable (`/assets/*`) to avoid cache misses and SEO crawler inconsistencies.
- Asset pipeline note:
  - No filename hashing during Phase 1.
  - Cache optimizations deferred until after SEO stabilization.

## Browser Compatibility

- Target modern evergreen browsers (same as current site).
- Preserve current semantic HTML and accessible patterns.
- Ensure no dependency on advanced JS features without transpilation.

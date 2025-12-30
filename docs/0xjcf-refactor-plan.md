# 0xjcf.com Refactor Plan (Phase 7 - Website Restructure & Positioning)

## Current stack, routing, content system, build (post-Astro migration)

- Framework: Astro (static output), file-based routes in `src/pages/`.
- Content system: Astro/MDX; blog posts live under `/writing` collection.
- Routing: clean paths (no `.html` except explicit status pages).
- Build pipeline: Astro + Vite (CSS/JS bundled and minified in prod). Lighthouse 100/100/100/100 baseline achieved.
- Forms backend: Cloudflare Worker (`worker.ts`) with env-driven redirect URLs (same-origin enforcement) and status pages.
- Deploy: static output (`dist/`) + Worker for forms; `SITE_URL` set per environment in `wrangler.toml`.

## Current routes table

| Route | Source file | Notes |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Authority-leaning homepage (currently still carries services content). |
| `/about` | `src/pages/about.astro` | About placeholder. |
| `/open-source` | `src/pages/open-source.astro` | OSS landing placeholder. |
| `/writing` | `src/pages/writing/index.astro` | Blog index. |
| `/writing/[slug]` | `src/pages/writing/[slug].astro` | Blog posts. |
| `/contact-thanks.html` | `src/pages/contact-thanks.html` | Status page (noindex). Links need updating away from `/#services`. |
| `/contact-error.html` | `src/pages/contact-error.html` | Status page (noindex). Links need updating away from anchors. |
| `/newsletter-thanks.html` | `src/pages/newsletter-thanks.html` | Status page (noindex). Links need updating away from anchors. |
| `/newsletter-error.html` | `src/pages/newsletter-error.html` | Status page (noindex). Links need updating away from anchors. |
| `/newsletter-check-email.html` | `src/pages/newsletter-check-email.html` | Status page (noindex). Links need updating away from anchors. |

### Section anchors on `/` (legacy IA still present)

- `#hero`, `#proof`, `#about`, `#services`, `#contact`, `#contact-forms`, `#contact-form-panel`, `#newsletter-form-panel`.

## Phase 7 goals (Website restructure & positioning)

- Clarify homepage role: content-first authority hub that routes to writing, services, open source, booking.
- Break single-page IA into real routes:
  - `/` (authority/credibility + routing)
  - `/about`
  - `/services` (routing page)
  - `/services/local-business`
  - `/services/product-teams`
  - `/open-source`
  - `/writing`
  - Optional later: `/speaking`, `/workshops`
- Rewrite nav/CTAs to match new IA:
  - Nav: Home | Writing | Services | Open Source | About | Book a Call
  - CTA rules: homepage → /services; services → Calendly; writing → newsletter; OSS → GitHub/Sponsor.
- Update status page backlinks:
  - Success → `/services`
  - Newsletter success → `/writing`
  - Error → retry on same page or `/contact` equivalent.
- Canonical + schema realignment:
  - `/` → `Person`
  - `/services` → `OfferCatalog`
  - Service detail pages → `Service`
  - `/writing/*` → `BlogPosting`
  - `/open-source` → `SoftwareSourceCode`/`Organization`

## Proposed routes table (updated)

| Route | Source / target | Status |
| --- | --- | --- |
| `/` | Authority homepage | To be refactored (remove embedded services section). |
| `/about` | About page | Exists; needs content/CTA alignment. |
| `/services` | Services routing page | To build. |
| `/services/local-business` | Service detail | To build (Local SEO/web). |
| `/services/product-teams` | Service detail | To build (XState/Actor workshops + contracting). |
| `/open-source` | OSS landing | Exists; tighten purpose/CTA. |
| `/writing` | Blog index | Exists. |
| `/writing/[slug]` | Blog posts | Exists. |
| `/speaking` (optional) | Credibility | Optional later. |

## Redirect mapping table (draft)

| Old route | New route | Redirect type | Notes |
| --- | --- | --- | --- |
| `/#services` | `/services` | 301 | Update status pages and any internal anchors. |
| `/#contact` | `/services` or `/services/*` | 301/302 | Decide CTA target per audience. |
| `/#newsletter-form` | `/writing` | 301 | Newsletter flow. |

## Notes on content changes and risks

- Status pages still link to legacy anchors; must be updated once new IA is live.
- Worker redirect URLs must match new routes; update env vars and validation rules when services routes ship.
- Schema needs realignment per route type; ensure canonical URLs match `site` config after restructuring.
- Copy/visual redesign is explicitly out of scope until structure is in place; focus on IA and CTAs.

## Suggested next sprint (1–2 weeks)

**Goal:** Restructure 0xjcf.com so each page has a single purpose and audience.

- [ ] Decide homepage role (authority router).
- [ ] Create `/services` routing page plus `/services/local-business` and `/services/product-teams`.
- [ ] Move service content out of `/` into the new `/services/*` pages.
- [ ] Update nav + CTAs to new IA.
- [ ] Update status page backlinks and Worker redirect targets.
- [ ] Verify canonicals + schema per route.

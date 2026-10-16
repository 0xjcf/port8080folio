# Deploy Workflow

## Overview

Astro is deployed to Cloudflare Pages. The Worker handles form APIs under `/api/*` on the same origin for staging and production.

## Branch -> environment mapping

- **Staging**: Deploy from a staging branch (e.g. `staging`) to `https://staging.0xjcf.com`.
- **Production**: Deploy `main` to `https://0xjcf.com`.

## Astro (Cloudflare Pages)

### Build settings

- **Build command**: `npm run build`
- **Build output directory**: `dist`

### Required environment variables

- `SITE_URL`
  - Staging: `https://staging.0xjcf.com`
  - Production: `https://0xjcf.com`

### Local preview

- `npm run preview`

## Worker (Cloudflare Workers)

### Environments

- Staging: `website-forms-staging`
- Production: `website-forms-production`

### Routes

- Staging: `staging.0xjcf.com/api/*`
- Production: `0xjcf.com/api/*`

### Deploy commands

- Staging: `wrangler deploy --env staging`
- Production: `wrangler deploy --env production`

### Required secrets

- `RESEND_API_KEY` (staging + prod)
- `RESEND_AUDIENCE_ID` (prod if newsletter should sync)

## Release checklist

- [ ] Staging Pages build succeeds with `SITE_URL=https://staging.0xjcf.com`.
- [ ] Existing article URLs, heading anchors, and draft visibility are preserved.
- [ ] No newsletter signup is rendered; RSS is linked from every page.
- [ ] RSS and sitemap are available on staging.
- [ ] Production Pages build succeeds with `SITE_URL=https://0xjcf.com`.
- [ ] User has approved the preview before a production release.

The journal is fully static and has no signup or contact form. The existing Worker and form-result routes are retained for compatibility; this redesign does not deploy or reconfigure them. Run `npm run render:diagrams` locally when published Mermaid content changes, then commit the SVG assets. Ordinary Pages builds do not need Chromium.

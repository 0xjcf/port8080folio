# Deploy Workflow

## Overview
Astro is deployed to Cloudflare Pages. The Worker handles form APIs under `/api/*` on the same origin for staging and production.

## Branch -> environment mapping
- **Staging**: Deploy from a staging branch (e.g. `staging`) to `https://staging.0xjcf.com`.
- **Production**: Deploy `main` to `https://0xjcf.com`.

## Astro (Cloudflare Pages)

### Build settings
- **Build command**: `npm run build:astro`
- **Build output directory**: `dist`

### Required environment variables
- `SITE_URL`
  - Staging: `https://staging.0xjcf.com`
  - Production: `https://0xjcf.com`

### Local preview
- `npm run preview:astro`

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
- [ ] Staging Worker deployed and `/api/*` routes configured.
- [ ] Forms redirect to `.html` status pages.
- [ ] RSS and sitemap are available on staging.
- [ ] Production Pages build succeeds with `SITE_URL=https://0xjcf.com`.
- [ ] Production Worker deployed and `/api/*` routes configured.

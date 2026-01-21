# Worker Routing (0xjcf.com)

## Goal

Serve form APIs from the same origin as the Astro site so same-origin checks pass without CORS complexity.

## Production routes

- Route: `0xjcf.com/api/*`
- Worker: `website-forms-production`
- Expected endpoints:
  - `POST https://0xjcf.com/api/contact`
  - `POST https://0xjcf.com/api/newsletter`

## Staging routes

- Route: `staging.0xjcf.com/api/*`
- Worker: `website-forms-staging`
- Expected endpoints:
  - `POST https://staging.0xjcf.com/api/contact`
  - `POST https://staging.0xjcf.com/api/newsletter`

## Local development

- Start Astro dev server: `npm run dev:astro`
- Start worker: `npx wrangler dev`
- Astro dev proxy forwards `/api/*` to `http://localhost:8787`

## Configuration sources

- `wrangler.toml`
  - `SITE_URL`, `CONTACT_FORM_URL`, `CONTACT_THANKS_URL`, `NEWSLETTER_FORM_URL`, `NEWSLETTER_THANKS_URL`
  - `CONTACT_API_URL`, `NEWSLETTER_API_URL`
- `src/pages/index.astro`
  - Form actions and `data-endpoint` use relative `/api/*` paths

## Validation checklist

- `POST /api/contact` returns a 303 redirect to `/contact-thanks.html` (or `/contact-error.html` on failure).
- `POST /api/newsletter` returns a 303 redirect to `/newsletter-thanks.html` (or `/newsletter-error.html` on failure).
- Same-origin validation passes (Origin/Referer matches `SITE_URL`).
- Status pages render directly by URL.

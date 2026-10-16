# 0xjcf.com

José Flores’s writing and open-source journal. Built as a static Astro site with Markdown articles, RSS, an editorial light/dark theme, and minimal progressive enhancement.

## Develop and preview

Use Node 22 LTS or newer (see `package.json`).

```sh
npm ci
npm run dev
```

Astro serves the development site at `http://localhost:4321`.

```sh
SITE_URL=https://0xjcf.com npm run build
npm run preview
```

The deployable static files are in `dist/`. No server runtime, database, email credentials, or newsletter form is needed for the journal.

## Content and structure

- `src/content/blog/`: published articles and drafts; filenames determine existing `/writing/<slug>/` URLs.
- `src/pages/writing/`: archive, articles, and the Behavior & Boundaries reading guide.
- `src/pages/`: About, Open Source, Lab, consulting, and preserved legacy form-result pages.
- `src/styles/editorial.css`: responsive light/dark design.
- `public/assets/diagrams/`: committed static SVG diagrams and their content-hash manifest.
- `worker.ts`: existing Cloudflare form Worker; retained separately, unused by the journal UI.

When a published Mermaid block changes, run `npm run render:diagrams` and commit the generated SVGs and manifest. The renderer uses a local Chromium installation (`npx playwright install chromium` if needed). Normal site builds use committed assets and never launch a browser. Article text, diagrams, the mobile contents list, and RSS work without client JavaScript.

## Verify

```sh
npm test
npm run typecheck
```

The suite checks article ordering, draft exclusion, RSS, routes, static diagrams, and the retained Worker and form utilities.

## Deployment

Cloudflare Pages builds with `npm run build` and serves `dist/`. Set `SITE_URL` explicitly for the target environment. Production follows `main`; review the redesign branch in a preview before merging. Deploying the static site does not require deploying the legacy Worker.

See [publishing articles](docs/how-to-publish.md), [deployment](docs/deploy-workflow.md), and [redesign intent and invariants](docs/editorial-redesign.md).

## License

MIT

# Editorial redesign

Branch: `redesign/editorial-journal`. Preview for review before deployment.

## Purpose and outcomes

This site exists so readers can decide which architecture ideas to explore and which open-source tools to try, with readable articles and direct access to evidence, examples, and documentation.

Readers can begin with a recent essay or follow Behavior & Boundaries in order. Developers can move between an explanation and its implementation. Prospective clients can understand the author's work and find a secondary consulting path.

## Decisions and scope

An in-place editorial redesign preserves the existing repository, content history, and static Astro publishing workflow. A small visual refresh would leave the reading and discovery problems intact; a new repository would require unnecessary content and deployment migration. The chosen approach changes the layouts and navigation on an isolated branch.

Invariants: all Markdown content remains byte-for-byte unchanged; drafts remain unpublished; existing public page URLs and heading anchors remain valid; no newsletter signup is rendered; RSS remains available; no production deployment or email-provider mutation is performed.

Reading-time estimates and visual treatments are approximate and reversible. Metadata dates remain the author's existing dates. When JavaScript is unavailable, article text, diagrams, series navigation, RSS links, and the mobile contents list remain available. Copy buttons, theme controls, and active-section tracking are progressive enhancements.

Excluded: new CMS, authentication, subscriber migration/deletion, backend form changes, new analytics, external service provisioning, and production deployment. Existing form-result URLs remain available as clearly identified legacy pages. The existing Worker is retained.

The homepage presents a lead essay, recent writing, a series entry point, projects, and author context. Writing has a chronological archive and a dedicated series guide. Open Source leads to projects and the existing Lab. About and the footer provide consulting access. The visual direction uses warm paper, charcoal, vermilion, serif typography, and a corresponding dark palette.

## Validation

Compare Markdown hashes and generated routes with the pre-redesign baseline. Check published/draft separation, feed entries and dates, internal links, existing heading anchors, diagram rendering, keyboard interaction, theme persistence, and desktop/mobile reading widths. Build and preview the static output. Release approval remains with the user.

## Preview verification

- All 21 original Markdown files retain their SHA-256 hashes (20 articles, including 15 drafts, plus one resource).
- All 18 original HTML routes remain; the reading guide adds one route. Existing article heading anchors remain, with the old signup-title anchors pointing to the RSS follow section.
- Five published posts appear in RSS; no draft article routes and no rendered forms.
- All local page links and anchors resolve. Four published diagrams are static SVGs.
- Desktop and 390px/320px mobile checks confirm readable columns without page overflow. Theme choice survives navigation; mobile contents expand, navigate, and collapse.
- `npm test`: 114 passing tests. `npm run typecheck`: passes. `SITE_URL=https://0xjcf.com npm run build`: passes.

Production has not been deployed. Review the local preview before release.

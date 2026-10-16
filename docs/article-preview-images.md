# Article preview images

## Intent and outcomes

This system exists so that readers can confidently distinguish the journal's essays in a feed or shared link while the website remains focused on reading.

Readers should recognize each essay by a distinct image, and recognize the five images as one editorial series. The illustration suggests the essay's subject; its title and description remain the source of meaning.

## Invariants and acceptable approximations

- Preserve all article Markdown, public routes, canonical URLs, the RSS address, item GUIDs, ordering, and dates.
- Preserve the current reading layout. Cover art belongs in preview metadata, without adding a large image before the article text.
- Keep drafts unpublished. Provide a distinct image for each of the five published essays.
- Use local static assets; no image-generation service runs at request time.
- Metaphorical illustrations can simplify the ideas. They are not authoritative architecture diagrams.
- Reader services control their own crawling, cropping, caching, and image selection. Existing entries can remain stale; do not change item identities or dates to force rediscovery.

## Reader workflow and degradation

A reader scans a feed or receives a shared link, recognizes a cover and title, then opens the existing article URL. If images are unavailable or a reader ignores preview metadata, the existing title, description, link, and article remain usable. A future essay without assigned art keeps the existing default preview until a cover is supplied.

## Tradeoff review

1. Retaining the profile portrait is reversible and maintenance-free, but makes different essays appear identical.
2. Unique typographic cards are easy to maintain, but repeat the title already shown next to each thumbnail.
3. A coordinated illustration set adds an initial asset-review cost and ongoing cover selection, but gives each essay a clear visual identity without duplicating title text.

Decision: use five text-free editorial illustrations in the existing ivory, charcoal, and vermilion palette. Preview them on a branch before publishing. Defer visible article heroes and draft covers.

The user then reported that Feedly showed only the summary and explicitly approved upgrading the same `/rss.xml` feed to include complete articles and covers. That approval supersedes the earlier instruction to keep the XML bytes unchanged. Add full HTML content and explicit cover metadata while preserving subscription and article identities.

## Scope and reversibility

No newsletter, provider changes, new article copy, Feedly account actions, publishing-date changes, reader-specific cache workarounds, or production deployment. Cover assets and preview metadata are reversible presentation decisions. User approval is required before merging the preview branch to production, as requested in the conversation.

## Implementation

Keep a slug-keyed cover registry separate from article Markdown. Use it for each article's Open Graph, Twitter, BlogPosting, and RSS image metadata. Serve versioned JPEGs from the site's static assets. Use Astro's rendered article HTML in `content:encoded`, sanitize it for reader use, resolve links and image sources against the canonical article URL, and retain semantic code blocks, tables, diagrams, and glossary definitions. No page scripts or site UI are included. Fail the build if a published article has no rendered body.

## Validation

Before sharing the preview, verify all five images and their thumbnail crops, unique absolute image URLs, image metadata and served assets, unchanged source content and RSS item identities/dates, complete reader bodies and glossary, safe absolute links, existing tests, type checking, and the static build. A local reader rendering is a preview, not proof that Feedly has refreshed cached entries; verify that distinction in the handoff.

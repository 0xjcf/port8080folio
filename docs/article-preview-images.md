# Article preview images

## Intent and outcomes

This system exists so that readers can confidently distinguish the journal's essays in a feed or shared link while the website remains focused on reading.

Readers should recognize each essay by a distinct image, and recognize the five images as one editorial series. The illustration suggests the essay's subject; its title and description remain the source of meaning.

## Invariants and acceptable approximations

- Preserve all article Markdown, public routes, canonical URLs, the RSS address, item GUIDs, ordering, and dates.
- Keep cover art within the reading column, below the title, summary, and article metadata. Preserve the existing text and navigation layout.
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

Decision: use five text-free editorial illustrations in the existing ivory, charcoal, and vermilion palette. Preview them on a branch before publishing. Draft covers remain deferred.

The user then reported that Feedly showed only the summary and explicitly approved upgrading the same `/rss.xml` feed to include complete articles and covers. That approval supersedes the earlier instruction to keep the XML bytes unchanged. Add full HTML content and explicit cover metadata while preserving subscription and article identities.

## Scope and reversibility

No newsletter, provider changes, new article copy, Feedly account actions, publishing-date changes, reader-specific cache workarounds, or production deployment before preview approval. Cover assets and preview metadata are reversible presentation decisions.

## Implementation

Keep a slug-keyed cover registry separate from article Markdown. Use it for each article's visible header, Open Graph, Twitter, BlogPosting, and RSS image metadata. Serve versioned JPEGs from the site's static assets. Header images retain their full aspect ratio, include alternative text and intrinsic dimensions, and load eagerly. Articles without a cover omit the figure. Use Astro's rendered article HTML in `content:encoded`, sanitize it for reader use, resolve links and image sources against the canonical article URL, and retain semantic code blocks, tables, diagrams, and glossary definitions. No page scripts or site UI are included. Fail the build if a published article has no rendered body.

## Validation

Before sharing the preview, verify all five images and their thumbnail crops, unique absolute image URLs, image metadata and served assets, unchanged source content and RSS item identities/dates, complete reader bodies and glossary, safe absolute links, existing tests, type checking, and the static build. A local reader rendering is a preview, not proof that Feedly has refreshed cached entries; verify that distinction in the handoff.

Verification: 119 tests, TypeScript checks, and the production static build pass. All 21 original content files match their baseline hashes. The hosted branch serves five distinct JPEG covers with matching Open Graph, Twitter, and RSS metadata, and five complete essays containing 17 code blocks and four diagrams. The five feed titles, summaries, links, GUIDs, dates, and order match the previous feed. Preview images use the preview deployment origin; production images use the permanent site origin.

Release approval: on October 16, 2026, the user reviewed the result and explicitly requested merging to `main`. This approval covers the full-text feed, editorial article covers, and the Follow page included in this branch.

## Article headers and Feedly follow-up

The user subsequently reported that Feedly still showed the old profile portrait and excerpt, and asked about using the existing covers as article headers. Prepare the header treatment for preview using the same cover registry; the earlier release approval applies to PR #40, not this follow-up.

The production feed was checked directly on October 16, 2026: all five entries include complete `content:encoded` bodies and unique cover metadata. Its response is `200` with `Cache-Control: public, max-age=0, must-revalidate`. Feedly's source settings point to the correct `https://0xjcf.com/rss.xml` URL, but its stored article still shows only the original summary, including after using its Refresh control and reopening the article. This is consistent with a stale reader copy; a successful site build alone does not establish that Feedly has reprocessed old entries. Keep the feed content, GUIDs, dates, and subscription URL intact. If the old entries remain stale after Feedly polls again, ask Feedly support to investigate reprocessing this feed; changing article identities would create duplicates.

Header verification: 119 tests, TypeScript checks, and the static build pass. All five generated headers have loaded covers with alternative text and intrinsic dimensions, matching their RSS and social images. The generated RSS is byte-for-byte identical to the live production feed. The header was checked in desktop light/dark layouts and at a 390px mobile viewport, with the cover's full composition visible and no horizontal overflow.

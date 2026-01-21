# How to Publish a Post

## Create a new post

1. Add a new Markdown file in `src/content/blog/`.
2. Use a short, URL-safe filename (this becomes the slug).

Example filename:

- `my-new-post.md` -> `/writing/my-new-post`

## Frontmatter fields

```yaml
title: "Post title"
description: "Short summary used for previews and metadata."
pubDate: 2025-03-15
updatedDate: 2025-03-20 # optional
tags: ["tag-one", "tag-two"] # optional
draft: false # optional
```

## Write content

Use standard Markdown. Keep the first paragraph concise; it often appears in previews.

## Local testing

- Start Astro: `npm run dev:astro`
- Visit:
  - `/writing`
  - `/writing/<slug>`
  - `/rss.xml`
  - `/sitemap.xml` (verify in build/preview if dev doesn’t serve it)

## Drafts

Set `draft: true` to exclude a post from the index and RSS.

## Deployment

Commit the new post and deploy via Cloudflare Pages. The new post will appear in:

- `/writing`
- `/writing/<slug>`
- `/rss.xml`
- `/sitemap.xml`

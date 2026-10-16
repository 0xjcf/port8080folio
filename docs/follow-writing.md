# Follow the writing

This page exists so readers can confidently choose how to follow new essays, even if they have never used RSS. Success means understanding the next step and having the correct feed address ready to add to a reader.

The user requested an explanatory page and copy button, with a preview before production release. The existing raw feed link remains a viable direct path for experienced readers; a dedicated explanatory page provides context for everyone else. Styling the feed document itself would couple the explanation to its machine-readable format. The chosen page keeps those responsibilities separate and is reversible.

Invariants: `/rss.xml`, its generator, feed identifiers, and published content remain unchanged. The HTML RSS autodiscovery link continues to point at `/rss.xml`. Visible follow links lead to `/follow/`. The copy action always uses `https://0xjcf.com/rss.xml`, including in branch previews.

Readers learn what a feed reader does, copy the address, then add it to their reader. Copy success is reported only after the clipboard write succeeds. If clipboard access is denied or unavailable, the address remains selectable and the page explains manual copying. With JavaScript disabled the feed address and direct feed link still work.

Scope excludes newsletter signup, accounts, email providers, reader integrations, and changes to feed generation. Production release is deferred until the user reviews the branch preview.

Validate the feed byte-for-byte against the production build baseline, existing tests/build checks, visible navigation, the actual clipboard result, keyboard/manual copying, and responsive light/dark layouts.

Verification: the existing 114 tests, TypeScript checks, and static build pass. The generated RSS feed matches the pre-change production-build file byte-for-byte. The copy action was verified by pasting its output into a browser text field: `https://0xjcf.com/rss.xml`.

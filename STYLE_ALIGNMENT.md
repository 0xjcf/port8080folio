# Status Page Style Alignment

Our goal is to keep the four status pages (`newsletter-thanks`, `newsletter-error`, `contact-thanks`, `contact-error`) visually consistent between light and dark themes. This workflow explains how to capture the _actual_ styles the browser renders, compare light vs. dark output, and feed those findings back into `src/styles/06-sections/status-pages.css` and `src/styles/00-settings/dark-theme.css`.

---

## 1. Serve the site

```bash
npm run dev
# tsc watches scripts and `serve src -l 8080` exposes the HTML/CSS
```

We inspect the raw `src/` HTML (not the built `dist/` bundle) so that any tweaks we make in the repo are reflected immediately.

---

## 2. Open the page in Chrome DevTools MCP

1. `chrome-devtools__navigate_page` → `http://localhost:8080/newsletter-thanks.html`
2. `chrome-devtools__take_snapshot` to confirm the DOM loaded.

Repeat the same process for the other status pages when you are ready to compare them.

---

## 3. Capture computed values

Use `chrome-devtools__evaluate_script` to grab the browser’s computed styles. The snippet below dumps the key tokens we care about for both themes:

```js
() => {
  const targets = {
    body: document.body,
    card: document.querySelector('.status-card'),
    list: document.querySelector('.status-card__list'),
    primaryBtn: document.querySelector('.status-page__btn--primary'),
    secondaryBtn: document.querySelector('.status-page__btn--secondary'),
  };

  const fields = [
    'background-image',
    'background-color',
    'box-shadow',
    'border',
    'color',
    'backdrop-filter',
  ];

  const dump = {};
  for (const [label, node] of Object.entries(targets)) {
    if (!node) continue;
    const computed = getComputedStyle(node);
    dump[label] = Object.fromEntries(fields.map((prop) => [prop, computed.getPropertyValue(prop)]));
  }

  dump.theme = document.documentElement.getAttribute('data-theme');
  return dump;
}
```

Tips:
- To record the dark theme, click the in-page toggle (`chrome-devtools__click` on the theme button), re-run the snippet, and stash the JSON response.
- Use `getComputedStyle(element, '::before')` or `'::after'` if you need gradient data coming from pseudo elements (body backdrops, glow halos).
- You can add extra selectors (e.g., `.status-card__icon`) to the `targets` map when a component looks off.

---

## 4. Compare light vs. dark outputs

1. Save the JSON from each run (light vs. dark) into `tmp/status-light.json` and `tmp/status-dark.json`.
2. Run a diff tool (`diff -u tmp/status-light.json tmp/status-dark.json`) to understand which CSS variables or fallback values diverge.
3. Use that list to adjust the relevant CSS layers:
   - Light theme overrides live in `src/styles/06-sections/status-pages.css`.
   - Dark theme overrides live in `src/styles/00-settings/dark-theme.css` under the “Status Pages – Dark Theme” section.

Re-run the extraction after each change to verify the values have converged on the desired palette.

---

## 5. Extend the audit to other pages

Swap the URL in step 2 for:
- `http://localhost:8080/newsletter-error.html`
- `http://localhost:8080/contact-thanks.html`
- `http://localhost:8080/contact-error.html`

Repeat steps 3 and 4 to confirm the shared styles still hold and to catch any button variants (ghost links, tertiary CTAs) that appear only on the error pages.

---

## 6. Ship the updates

1. Update the CSS files based on the diffs.
2. When everything looks right in the browser, run `npm run build:prod` to regenerate the distribution bundle.
3. Spot-check the minified HTML in `dist/` if you plan to deploy.

This process gives us a reproducible checklist anytime the dark-mode palette changes or we need to re-tune the light theme styling.***

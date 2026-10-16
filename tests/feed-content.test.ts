// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildFeedContent } from '../src/lib/content/feed-content';

const canonicalUrl = 'https://0xjcf.com/writing/an-essay/';

describe('full-text reader content', () => {
  it('resolves relative links, fragments, and diagram images against the article URL', () => {
    const html = buildFeedContent({ canonicalUrl, html: '<p><a href="../next/">Next</a> <a href="#decision">Jump</a> <a href="mailto:hello@example.com">Email</a></p><img src="/assets/diagrams/test.svg" alt="Decision boundary">' });
    expect(html).toContain('href="https://0xjcf.com/writing/next/"');
    expect(html).toContain('href="https://0xjcf.com/writing/an-essay/#decision"');
    expect(html).toContain('href="mailto:hello@example.com"');
    expect(html).toContain('src="https://0xjcf.com/assets/diagrams/test.svg"');
    expect(html).toContain('alt="Decision boundary"');
  });

  it('preserves code whitespace, heading anchors, tables, and escaped glossary text', () => {
    const code = 'const value = a &lt; b;\n  return value;';
    const html = buildFeedContent({ canonicalUrl, html: `<h2 id="decision">Decision</h2><pre><code>${code}</code></pre><table><tr><th scope="col">Input</th><td colspan="2">Result</td></tr></table>`, glossary: [{ term: 'A < B', definition: 'Pure & deterministic' }] });
    expect(html).toContain(`<pre><code>${code}</code></pre>`);
    expect(html).toContain('<h2 id="decision">Decision</h2>');
    expect(html).toContain('<th scope="col">Input</th>');
    expect(html).toContain('<td colspan="2">Result</td>');
    expect(html).toContain('<dt>A &lt; B</dt><dd>Pure &amp; deterministic</dd>');
  });

  it('includes a cover with safe alternative text and an original-article link', () => {
    const html = buildFeedContent({ canonicalUrl, html: '<p>Complete essay.</p>', cover: { src: '/assets/cover.jpg', alt: 'A "core" & its boundary', width: 1200, height: 630 } });
    expect(html).toContain('src="https://0xjcf.com/assets/cover.jpg"');
    expect(html).toContain('alt="A &quot;core&quot; &amp; its boundary"');
    expect(html).toContain('width="1200" height="630"');
    expect(html).toContain(`<a href="${canonicalUrl}">Read on 0xjcf.com</a>`);
  });

  it('can serve preview images while keeping article links on the permanent site', () => {
    const html = buildFeedContent({ canonicalUrl, assetBase: 'https://preview.pages.dev/', html: '<a href="../next/">Next</a><img src="/assets/diagram.svg" alt="Diagram">', cover: { src: '/assets/cover.jpg', alt: 'Cover', width: 1200, height: 630 } });
    expect(html).toContain('src="https://preview.pages.dev/assets/cover.jpg"');
    expect(html).toContain('src="https://preview.pages.dev/assets/diagram.svg"');
    expect(html).toContain('href="https://0xjcf.com/writing/next/"');
    expect(html).toContain(`href="${canonicalUrl}"`);
  });

  it('removes active content and unsafe URLs while retaining readable text', () => {
    const html = buildFeedContent({ canonicalUrl, html: '<script>alert(1)</script><style>body{display:none}</style><p onclick="alert(1)" style="color:white">Keep this</p><a href="javascript:alert(1)">Unsafe link</a><img src="data:image/svg+xml,bad" onerror="alert(1)"><iframe src="https://example.com"></iframe>' });
    expect(html).toContain('<p>Keep this</p>');
    expect(html).toContain('Unsafe link');
    expect(html).not.toMatch(/script|style|onclick|onerror|javascript:|data:image|iframe|alert\(1\)/);
  });
});

// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { execSync } from 'node:child_process';
import { Window } from 'happy-dom';
import { JSDOM } from 'jsdom';

import { loadVariables } from '../scripts/build-replace-vars';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(path.join(testDir, '..'));
const srcDir = path.join(projectRoot, 'src');

const removeDirIfExists = (dir: string) => {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors in tests
  }
};

describe('production configuration sanity checks', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    vi.restoreAllMocks();
    while (tempDirs.length) {
      const dir = tempDirs.pop();
      if (dir) removeDirIfExists(dir);
    }
  });

  it('keeps production site and form URLs on the same origin', () => {
    const vars = loadVariables('production');

    expect(vars.SITE_URL).toBeTruthy();
    expect(vars.CONTACT_FORM_URL).toBeTruthy();
    expect(vars.CONTACT_THANKS_URL).toBeTruthy();
    expect(vars.NEWSLETTER_FORM_URL).toBeTruthy();
    expect(vars.NEWSLETTER_THANKS_URL).toBeTruthy();

    const siteUrl = new URL(vars.SITE_URL);
    const assertSameOrigin = (value: string | undefined, field: string) => {
      expect(value, `${field} missing`).toBeTruthy();
      if (!value) return;
      const url = new URL(value);
      expect(url.origin, `${field} must share origin with SITE_URL`).toBe(siteUrl.origin);
    };

    assertSameOrigin(vars.CONTACT_FORM_URL, 'CONTACT_FORM_URL');
    assertSameOrigin(vars.CONTACT_THANKS_URL, 'CONTACT_THANKS_URL');
    assertSameOrigin(vars.NEWSLETTER_FORM_URL, 'NEWSLETTER_FORM_URL');
    assertSameOrigin(vars.NEWSLETTER_THANKS_URL, 'NEWSLETTER_THANKS_URL');

    expect(siteUrl.protocol).toBe('https:');

    const contactApi = new URL(vars.CONTACT_API_URL);
    const newsletterApi = new URL(vars.NEWSLETTER_API_URL);

    expect(contactApi.protocol).toBe('https:');
    expect(newsletterApi.protocol).toBe('https:');
    expect(contactApi.pathname).toBe('/api/contact');
    expect(newsletterApi.pathname).toBe('/api/newsletter');
  });

  it('builds an RSS-first journal with published articles and preserved routes', () => {
    // Build the Astro site so we validate the actual shipped HTML
    execSync('npm run build', { cwd: projectRoot, stdio: 'ignore' });

    const distDir = path.join(projectRoot, 'dist');
    const indexPath = path.join(distDir, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);

    const html = fs.readFileSync(indexPath, 'utf-8');
    expect(html).not.toContain('/api/newsletter');
    const homeWindow = new Window({
      url: 'https://0xjcf.com/',
      settings: {
        disableCSSFileLoading: true,
        disableJavaScriptFileLoading: true,
      },
    });
    homeWindow.document.write(html);
    const homepageLatestPost = homeWindow.document.querySelector(
      '.feature-story',
    );
    expect(
      homepageLatestPost
        ?.querySelector('h1')
        ?.textContent?.replace(/\s+/g, ' ')
        .trim(),
    ).toBe('Lifecycle Boundaries in Actor and State Machine Architecture');
    expect(
      homepageLatestPost?.querySelector('h1 a')?.getAttribute('href'),
    ).toBe('/writing/lifecycle-is-the-real-boundary/');
    expect(homeWindow.document.querySelector('form')).toBeNull();
    expect(homeWindow.document.querySelector('link[rel="alternate"]')?.getAttribute('href')).toBe('/rss.xml');
    homeWindow.close();

    const articlePath = path.join(
      distDir,
      'writing',
      'when-code-becomes-cheap',
      'index.html',
    );
    expect(fs.existsSync(articlePath)).toBe(true);

    const articleHtml = fs.readFileSync(articlePath, 'utf-8');
    const articleWindow = new Window({
      url: 'https://0xjcf.com/writing/when-code-becomes-cheap/',
      settings: {
        disableCSSFileLoading: true,
        disableJavaScriptFileLoading: true,
      },
    });
    articleWindow.document.write(articleHtml);
    const tocLabels = Array.from(
      articleWindow.document.querySelectorAll('#writing-toc-list [data-toc-link]'),
    ).map((link) => link.textContent?.trim());

    expect(tocLabels).toEqual([
      'The bottleneck moved',
      'A small command with a hidden decision',
      'The logic was correct. The boundary was not',
      'Architecture distributes authority',
      'Why state machines help, and where they stop',
      'How to recognize an ownership leak',
      'A responsibility check before implementation',
      'The first draft is cheap',
      'Next in the series',
    ]);
    expect(articleHtml).not.toContain('Series continuation');
    articleWindow.close();

    const writingIndexPath = path.join(
      distDir,
      'writing',
      'index.html',
    );
    const writingIndexHtml = fs.readFileSync(
      writingIndexPath,
      'utf-8',
    );
    const writingWindow = new Window({
      url: 'https://0xjcf.com/writing/',
      settings: {
        disableCSSFileLoading: true,
        disableJavaScriptFileLoading: true,
      },
    });
    writingWindow.document.write(writingIndexHtml);

    const publishedSeriesParts = Array.from(
      writingWindow.document.querySelectorAll(
        '.essay-row .eyebrow span',
      ),
    ).map((part) => part.textContent?.trim().replace(/^\/\s*/, ''));

    expect(publishedSeriesParts).toEqual([
      'Part 5',
      'Part 4',
      'Part 3',
      'Part 2',
      'Part 1',
    ]);
    expect(writingWindow.document.querySelector('a[href="/writing/behavior-and-boundaries/"]')).not.toBeNull();
    expect(writingIndexHtml).not.toContain('Edition 5');

    const publishedSlugs = [
      'when-code-becomes-cheap',
      'before-behavior-product-frame',
      'narrative-to-semantic-command',
      'functional-core',
      'lifecycle-is-the-real-boundary',
    ];
    const generatedArticleSlugs = fs
      .readdirSync(path.join(distDir, 'writing'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    expect(generatedArticleSlugs).toEqual([...publishedSlugs, 'behavior-and-boundaries'].sort());

    const guideWindow = new Window({ settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
    guideWindow.document.write(fs.readFileSync(path.join(distDir, 'writing/behavior-and-boundaries/index.html'), 'utf8'));
    expect(Array.from(guideWindow.document.querySelectorAll('.essay-row h3 a')).map(link => link.getAttribute('href')))
      .toEqual(publishedSlugs.map(slug => `/writing/${slug}/`));
    guideWindow.close();

    for (const route of ['about', 'open-source', 'reference-systems', 'services', 'services/local-business', 'services/product-teams', 'contact-error', 'newsletter-check-email', 'contact-thanks', 'newsletter-error', 'newsletter-thanks']) {
      expect(fs.existsSync(path.join(distDir, route, 'index.html')), `preserved route: /${route}/`).toBe(true);
    }

    let diagramCount = 0;
    const articleContents = new Map<string, { text: string; code: string[]; image: string }>();
    const normalizeText = (text: string | null) => text?.replace(/\s+/g, ' ').trim() ?? '';

    const expectedHandoffs = new Map([
      ['when-code-becomes-cheap', 'before-behavior-product-frame'],
      ['before-behavior-product-frame', 'narrative-to-semantic-command'],
      ['narrative-to-semantic-command', 'functional-core'],
      ['functional-core', 'lifecycle-is-the-real-boundary'],
    ]);

    for (const slug of publishedSlugs) {
      const publishedArticlePath = path.join(
        distDir,
        'writing',
        slug,
        'index.html',
      );
      const publishedArticleHtml = fs.readFileSync(
        publishedArticlePath,
        'utf-8',
      );
      const publishedArticleWindow = new Window({
        url: `https://0xjcf.com/writing/${slug}/`,
        settings: {
          disableCSSFileLoading: true,
          disableJavaScriptFileLoading: true,
        },
      });
      publishedArticleWindow.document.write(publishedArticleHtml);
      const previewImage = publishedArticleWindow.document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '';
      expect(new URL(previewImage).pathname).toBe(`/assets/images/articles/${slug}-v1.jpg`);
      expect(fs.existsSync(path.join(distDir, new URL(previewImage).pathname))).toBe(true);
      expect(publishedArticleWindow.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(previewImage);
      expect(publishedArticleWindow.document.querySelector('meta[property="og:image:alt"]')?.getAttribute('content')).toBeTruthy();
      expect(JSON.parse(publishedArticleWindow.document.querySelector('script[type="application/ld+json"]')?.textContent ?? '{}').image).toBe(previewImage);
      articleContents.set(slug, {
        text: normalizeText(publishedArticleWindow.document.querySelector('.writing-article__content')?.textContent ?? ''),
        code: Array.from(publishedArticleWindow.document.querySelectorAll('.writing-article__content pre code')).map(code => code.textContent ?? ''),
        image: previewImage,
      });
      expect(publishedArticleWindow.document.querySelector('form')).toBeNull();
      expect(publishedArticleWindow.document.querySelector('pre code.language-mermaid')).toBeNull();
      for (const image of publishedArticleWindow.document.querySelectorAll('.article-diagram img')) {
        diagramCount++;
        expect(image.getAttribute('alt')).toBeTruthy();
        expect(fs.existsSync(path.join(distDir, image.getAttribute('src') ?? 'missing'))).toBe(true);
      }

      const contentLinks = Array.from(
        publishedArticleWindow.document.querySelectorAll(
          '.writing-article__content a[href^="/writing/"]',
        ),
      ).map((link) => link.getAttribute('href'));
      const nextSlug = expectedHandoffs.get(slug);

      if (nextSlug) {
        expect(contentLinks).toContain(`/writing/${nextSlug}/`);
      }

      for (const href of contentLinks) {
        expect(href).toBeTruthy();
        if (!href) continue;

        const destination = new URL(href, 'https://0xjcf.com');
        expect(
          fs.existsSync(
            path.join(distDir, destination.pathname, 'index.html'),
          ),
          `${slug} links to an unpublished or missing article: ${href}`,
        ).toBe(true);
      }

      publishedArticleWindow.close();
    }
    expect(diagramCount).toBe(4);
    expect(new Set([...articleContents.values()].map(article => article.image)).size).toBe(5);

    const rssXml = fs.readFileSync(path.join(distDir, 'rss.xml'), 'utf-8');
    const rssItems = rssXml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    expect(rssItems).toHaveLength(5);
    expect(rssItems[0]).toContain(
      '<title>Lifecycle Boundaries in Actor and State Machine Architecture</title>',
    );
    expect(rssItems[0]).toContain(
      '/writing/lifecycle-is-the-real-boundary/</link>',
    );
    expect(rssItems[0]).toContain(
      '<guid isPermaLink="true">https://staging.0xjcf.com/writing/lifecycle-is-the-real-boundary/</guid>',
    );
    const rssDates = rssItems.map((item) => {
      const pubDate = item.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1];
      expect(pubDate).toBeTruthy();
      return new Date(pubDate ?? 0).valueOf();
    });
    expect(rssDates[0]).toBeGreaterThan(rssDates[1]);
    expect(rssDates).toEqual([4, 3, 2, 1, 0].map(seconds => Date.parse('2026-07-30T00:00:00Z') + seconds * 1000));

    const rssDocument = new JSDOM(rssXml, { contentType: 'application/xml' });
    for (const item of rssDocument.window.document.querySelectorAll('item')) {
      const url = new URL(item.querySelector('link')?.textContent ?? '');
      const slug = url.pathname.split('/').filter(Boolean).at(-1) ?? '';
      const article = articleContents.get(slug)!;
      expect(article, `RSS item must match a published article: ${slug}`).toBeTruthy();
      const encoded = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0];
      expect(encoded).toBeTruthy();
      const reader = new JSDOM(encoded.textContent ?? '');
      expect(normalizeText(reader.window.document.body.textContent)).toContain(article.text);
      expect([...reader.window.document.querySelectorAll('pre code')].map(code => code.textContent ?? '')).toEqual(article.code);
      expect(reader.window.document.images[0].src).toBe(article.image);
      expect(item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content')[0].getAttribute('url')).toBe(article.image);
      for (const element of reader.window.document.querySelectorAll('[src], [href]')) {
        expect(element.getAttribute('src') ?? element.getAttribute('href')).toMatch(/^(https?:|mailto:)/);
      }
      expect(reader.window.document.querySelector('script, style, button, form')).toBeNull();
      reader.window.close();
    }
    rssDocument.window.close();

    writingWindow.close();
  }, 30_000);
});

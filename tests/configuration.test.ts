// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { execSync } from 'node:child_process';
import { Window } from 'happy-dom';

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

  it('produces production HTML assets with worker endpoints baked in', () => {
    // Build the Astro site so we validate the actual shipped HTML
    execSync('npm run build', { cwd: projectRoot, stdio: 'ignore' });

    const distDir = path.join(projectRoot, 'dist');
    const indexPath = path.join(distDir, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);

    const html = fs.readFileSync(indexPath, 'utf-8');
    // Forms should point at worker endpoints (relative paths are fine)
    // Contact form is no longer rendered on the landing page; newsletter remains.
    expect(html.includes('/api/newsletter')).toBe(true);
    const homeWindow = new Window({
      url: 'https://0xjcf.com/',
      settings: {
        disableCSSFileLoading: true,
        disableJavaScriptFileLoading: true,
      },
    });
    homeWindow.document.write(html);
    const homepageLatestPost = homeWindow.document.querySelector(
      '.writing__item',
    );
    expect(
      homepageLatestPost
        ?.querySelector('.writing-list__part')
        ?.textContent?.replace(/\s+/g, ' ')
        .trim(),
    ).toBe('Part 5');
    expect(
      homepageLatestPost?.querySelector('.writing__link')?.getAttribute('href'),
    ).toBe('/writing/lifecycle-is-the-real-boundary/');
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
        '.writing-list__part',
      ),
    ).map((part) => part.textContent?.trim());

    expect(publishedSeriesParts).toEqual([
      'Part 1',
      'Part 2',
      'Part 3',
      'Part 4',
      'Part 5',
    ]);
    const latestSeriesPost = writingWindow.document.querySelector(
      '.writing-series__start',
    );
    expect(latestSeriesPost?.textContent).toContain('Part 5');
    expect(
      latestSeriesPost
        ?.querySelector('.writing-series__link')
        ?.getAttribute('href'),
    ).toBe('/writing/lifecycle-is-the-real-boundary/');
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
    expect(generatedArticleSlugs).toEqual([...publishedSlugs].sort());

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

      const contentLinks = Array.from(
        publishedArticleWindow.document.querySelectorAll(
          '.writing-article__content a[href^="/writing/"]',
        ),
      ).map((link) => link.getAttribute('href'));
      const nextSlug = expectedHandoffs.get(slug);

      if (nextSlug) {
        expect(contentLinks).toContain(`/writing/${nextSlug}/`);
      } else {
        expect(contentLinks).toEqual([]);
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

    const rssXml = fs.readFileSync(path.join(distDir, 'rss.xml'), 'utf-8');
    const rssItems = rssXml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    expect(rssItems).toHaveLength(5);
    expect(rssItems[0]).toContain(
      '<title>Lifecycle Boundaries in Actor and State Machine Architecture</title>',
    );
    expect(rssItems[0]).toContain(
      '/writing/lifecycle-is-the-real-boundary/</link>',
    );

    writingWindow.close();
  }, 30_000);
});

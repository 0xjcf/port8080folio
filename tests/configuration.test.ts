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
    expect(
      fs.existsSync(
        path.join(
          distDir,
          'writing',
          'before-behavior-product-frame',
          'index.html',
        ),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          distDir,
          'writing',
          'narrative-to-semantic-command',
          'index.html',
        ),
      ),
    ).toBe(true);

    writingWindow.close();
  }, 30_000);
});

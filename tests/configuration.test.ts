// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { loadVariables, processHtmlFiles } from '../scripts/build-replace-vars';

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
    const distDir = fs.mkdtempSync(path.join(tmpdir(), 'prod-dist-'));
    tempDirs.push(distDir);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    processHtmlFiles('production', false, { srcDir, distDir });

    const indexPath = path.join(distDir, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);

    const html = fs.readFileSync(indexPath, 'utf-8');
    expect(html).toContain('https://website-forms-production.bluejf-llc.workers.dev/api/contact');
    expect(html).toContain('https://website-forms-production.bluejf-llc.workers.dev/api/newsletter');

    logSpy.mockRestore();
  });
});

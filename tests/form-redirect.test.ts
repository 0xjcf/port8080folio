import { describe, expect, it } from 'vitest';

import { resolveFormRedirect } from '../src/scripts/form-redirect';

const safeFallback = '#contact-success';
const origin = 'https://0xjcf.github.io';

describe('resolveFormRedirect', () => {
  it('permits known success pages when the site is served from the origin root', () => {
    const result = resolveFormRedirect({
      redirectUrl: `${origin}/contact-thanks.html`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/',
    });

    expect(result).toBe(`${origin}/contact-thanks.html`);
  });

  it('permits known success pages when the site is hosted on a subdirectory (e.g. GitHub Pages)', () => {
    const result = resolveFormRedirect({
      redirectUrl: `${origin}/port8080folio/contact-thanks.html`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/',
    });

    expect(result).toBe(`${origin}/port8080folio/contact-thanks.html`);
  });

  it('falls back to a safe internal hash for cross-origin redirects', () => {
    const result = resolveFormRedirect({
      redirectUrl: 'https://example.com/contact-thanks.html',
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/',
    });

    expect(result).toBe(safeFallback);
  });

  it('rejects protocol-relative URLs (missing scheme)', () => {
    const result = resolveFormRedirect({
      redirectUrl: '//evil.example.com/contact-thanks.html',
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/',
    });

    expect(result).toBe(safeFallback);
  });

  it('rejects URLs with unsupported protocols', () => {
    const result = resolveFormRedirect({
      redirectUrl: 'javascript:alert(1)',
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/',
    });

    expect(result).toBe(safeFallback);
  });

  it('rejects URLs containing control characters that could be abused', () => {
    const OriginalURL = globalThis.URL;

    class FakeURL {
      href: string;
      protocol: string;
      origin: string;
      hostname: string;
      search: string;
      hash: string;
      pathname: string;

      constructor(url: string, base?: string) {
        this.href = url;
        this.protocol = 'https:';
        this.origin = origin;
        this.hostname = '0xjcf.github.io';
        this.search = '?valid=true';
        this.hash = '#\u0001bad';
        this.pathname = '/contact-thanks.html';

        // Ensure the arguments are exercised to mirror browser URL API behaviour
        void base;
      }
    }

    // @ts-expect-error: intentionally replace global URL for this test
    globalThis.URL = FakeURL;

    try {
      const result = resolveFormRedirect({
        redirectUrl: `${origin}/contact-thanks.html`,
        safeInternalHash: safeFallback,
        currentOrigin: origin,
        currentPathname: '/port8080folio/',
      });

      expect(result).toBe(safeFallback);
    } finally {
      globalThis.URL = OriginalURL;
    }
  });

  it('rejects URLs that cannot be safely decoded', () => {
    const result = resolveFormRedirect({
      redirectUrl: `${origin}/%E0%A/contact-thanks.html`, // Broken percent-encoding
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/',
    });

    expect(result).toBe(safeFallback);
  });

  it('rejects URLs with traversal or encoded separator attempts', () => {
    const traversal = resolveFormRedirect({
      redirectUrl: `${origin}/contact-thanks.html?next=/../admin`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/',
    });
    const encodedSeparator = resolveFormRedirect({
      redirectUrl: `${origin}/contact%2fthanks.html`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/',
    });

    expect(traversal).toBe(safeFallback);
    expect(encodedSeparator).toBe(safeFallback);
  });

  it('derives the correct base path when currentPathname includes a filename', () => {
    const result = resolveFormRedirect({
      redirectUrl: `${origin}/port8080folio/newsletter-thanks.html`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/index.html',
    });

    expect(result).toBe(`${origin}/port8080folio/newsletter-thanks.html`);
  });

  it('ignores base path derivation when the site is served from the origin root', () => {
    const result = resolveFormRedirect({
      redirectUrl: `${origin}/port8080folio/newsletter-thanks.html`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/',
    });

    expect(result).toBe(safeFallback);
  });

  it('trims query fragments from currentPathname when deriving prefixes', () => {
    const result = resolveFormRedirect({
      redirectUrl: `${origin}/port8080folio/newsletter-check-email.html`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/contact.html?utm=1#contact',
    });

    expect(result).toBe(`${origin}/port8080folio/newsletter-check-email.html`);
  });

  it('falls back when redirectUrl is missing', () => {
    const result = resolveFormRedirect({
      redirectUrl: undefined,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/',
    });

    expect(result).toBe(safeFallback);
  });

  it('falls back to the safe hash when URL parsing throws', () => {
    const result = resolveFormRedirect({
      redirectUrl: 'https://%zz',
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/',
    });

    expect(result).toBe(safeFallback);
  });

  it('falls back when currentPathname is undefined and redirect needs a base prefix', () => {
    const result = resolveFormRedirect({
      redirectUrl: `${origin}/port8080folio/contact-thanks.html`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: undefined,
    });

    expect(result).toBe(safeFallback);
  });

  it('falls back when currentPathname is empty string', () => {
    const result = resolveFormRedirect({
      redirectUrl: `${origin}/port8080folio/contact-thanks.html`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '',
    });

    expect(result).toBe(safeFallback);
  });

  it('falls back when currentPathname contains only query/hash fragments', () => {
    const result = resolveFormRedirect({
      redirectUrl: `${origin}/port8080folio/contact-thanks.html`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '?utm=1#section',
    });

    expect(result).toBe(safeFallback);
  });

  it('falls back when currentPathname resolves to a file at the origin root', () => {
    const result = resolveFormRedirect({
      redirectUrl: `${origin}/port8080folio/contact-thanks.html`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/index.html',
    });

    expect(result).toBe(safeFallback);
  });

  it('ignores currentPathname segments that represent current directory', () => {
    const result = resolveFormRedirect({
      redirectUrl: `${origin}/port8080folio/newsletter-thanks.html`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/./',
    });

    expect(result).toBe(`${origin}/port8080folio/newsletter-thanks.html`);
  });

  it('handles dot-dot segments in currentPathname by trimming the last segment', () => {
    const result = resolveFormRedirect({
      redirectUrl: `${origin}/port8080folio/foo/newsletter-thanks.html`,
      safeInternalHash: safeFallback,
      currentOrigin: origin,
      currentPathname: '/port8080folio/contact/../foo/',
    });

    expect(result).toBe(`${origin}/port8080folio/foo/newsletter-thanks.html`);
  });
});

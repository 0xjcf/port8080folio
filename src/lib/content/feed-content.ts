import sanitizeHtml from 'sanitize-html';
import type { ArticleCover } from './article-covers';

export const escapeMarkup = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]!);

interface FeedContentOptions {
  html: string;
  canonicalUrl: string;
  assetBase?: string;
  cover?: ArticleCover;
  glossary?: { term: string; definition: string }[];
}

export function buildFeedContent({ html, canonicalUrl, assetBase = canonicalUrl, cover, glossary = [] }: FeedContentOptions): string {
  const coverHtml = cover
    ? `<figure><img src="${escapeMarkup(new URL(cover.src, assetBase).href)}" alt="${escapeMarkup(cover.alt)}" width="${cover.width}" height="${cover.height}"></figure>`
    : '';
  const glossaryHtml = glossary.length
    ? `<section><h2>Glossary</h2><dl>${glossary.map(entry => `<dt>${escapeMarkup(entry.term)}</dt><dd>${escapeMarkup(entry.definition)}</dd>`).join('')}</dl></section>`
    : '';
  const footer = `<p><a href="${escapeMarkup(canonicalUrl)}">Read on 0xjcf.com</a></p>`;

  // Readers do not load the site's styles or scripts. Keep semantic content,
  // including code and diagram images, and make every destination self-contained.
  return sanitizeHtml(`${coverHtml}${html}${glossaryHtml}${footer}`, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      '*': ['id'],
      a: ['href', 'title'],
      img: ['src', 'alt', 'width', 'height'],
      th: ['colspan', 'rowspan', 'scope'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: resolveUrl(attribs, 'href', canonicalUrl) }),
      img: (tagName, attribs) => ({ tagName, attribs: resolveUrl(attribs, 'src', assetBase) }),
    },
  });
}

function resolveUrl(attributes: Record<string, string>, key: string, base: string): Record<string, string> {
  if (!attributes[key]) return attributes;
  try {
    return { ...attributes, [key]: new URL(attributes[key], base).href };
  } catch {
    const { [key]: _invalidUrl, ...rest } = attributes;
    return rest;
  }
}

export function GET({ site }) {
  const loc = site ? new URL('/sitemap-index.xml', site).toString() : '/sitemap-index.xml';
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    `<sitemap><loc>${loc}</loc></sitemap>` +
    `</sitemapindex>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
    },
  });
}

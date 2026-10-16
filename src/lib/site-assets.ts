// New preview images must be reachable before they exist on the live site.
// Article canonicals and RSS identities continue to use the permanent site URL.
export function siteAssetUrl(path: string, site: string | URL): string {
  const previewUrl = process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main'
    ? process.env.CF_PAGES_URL
    : undefined;
  return new URL(path, previewUrl || site).href;
}

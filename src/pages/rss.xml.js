import rss from '@astrojs/rss';
import { getArticleCover } from '../lib/content/article-covers';
import { buildFeedContent, escapeMarkup } from '../lib/content/feed-content';
import { siteAssetUrl } from '../lib/site-assets';
import {
  getBlogPostFeedDates,
  getPublishedBlogPosts,
  sortBlogPostsByRecency,
} from '../lib/content/blog';

export async function GET(context) {
  const posts = sortBlogPostsByRecency(await getPublishedBlogPosts());
  const feedDates = getBlogPostFeedDates(posts);
  const items = posts.map((post, index) => {
    const link = `/writing/${post.slug}/`;
    const stableGuid = new URL(link, context.site).toString();
    const cover = getArticleCover(post.slug);
    const coverUrl = cover ? siteAssetUrl(cover.src, context.site) : undefined;
    if (!post.rendered?.html) {
      throw new Error(`Published article ${post.slug} has no rendered HTML for its full-text feed.`);
    }

    return {
      title: post.data.title,
      description: post.data.description,
      pubDate: feedDates[index],
      link,
      content: buildFeedContent({
        html: post.rendered.html,
        canonicalUrl: stableGuid,
        assetBase: siteAssetUrl('/', context.site),
        cover,
        glossary: post.data.glossary,
      }),
      customData: `<guid isPermaLink="true">${escapeMarkup(stableGuid)}</guid>`
        + '<dc:creator>Jose Flores</dc:creator>'
        + (coverUrl ? `<media:content url="${escapeMarkup(coverUrl)}" medium="image" type="image/jpeg" width="${cover.width}" height="${cover.height}"/>` : ''),
    };
  });

  return rss({
    title: 'Jose Flores | Writing',
    description: 'Writing on frontend architecture, statecharts, and the actor model.',
    site: context.site,
    items,
    xmlns: {
      media: 'http://search.yahoo.com/mrss/',
      dc: 'http://purl.org/dc/elements/1.1/',
    },
    customData: '<language>en</language>',
  });
}

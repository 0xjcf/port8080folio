import rss from '@astrojs/rss';
import {
  getBlogPostFeedDate,
  getPublishedBlogPosts,
  sortBlogPostsByRecency,
} from '../lib/content/blog';

export async function GET(context) {
  const posts = sortBlogPostsByRecency(await getPublishedBlogPosts());
  const items = posts.map((post) => {
    const link = `/writing/${post.slug}/`;
    const stableGuid = new URL(link, context.site).toString();

    return {
      title: post.data.title,
      description: post.data.description,
      pubDate: getBlogPostFeedDate(post),
      link,
      customData: `<guid isPermaLink="true">${stableGuid}</guid>`,
    };
  });

  return rss({
    title: 'Jose Flores | Writing',
    description: 'Writing on frontend architecture, statecharts, and the actor model.',
    site: context.site,
    items,
  });
}

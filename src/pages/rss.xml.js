import rss from '@astrojs/rss';
import {
  getBlogPostActivityDate,
  getPublishedBlogPosts,
  sortBlogPostsByRecency,
} from '../lib/content/blog';

export async function GET(context) {
  const posts = sortBlogPostsByRecency(await getPublishedBlogPosts());
  const items = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    pubDate: getBlogPostActivityDate(post),
    link: `/writing/${post.slug}/`,
  }));

  return rss({
    title: 'Jose Flores | Writing',
    description: 'Writing on frontend architecture, statecharts, and the actor model.',
    site: context.site,
    items,
  });
}

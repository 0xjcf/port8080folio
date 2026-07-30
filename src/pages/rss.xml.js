import rss from '@astrojs/rss';
import { getPublishedBlogPosts } from '../lib/content/blog';

export async function GET(context) {
  const posts = await getPublishedBlogPosts();
  const items = posts
    .sort((firstPost, secondPost) => {
      const publicationDateDifference =
        secondPost.data.pubDate.valueOf() - firstPost.data.pubDate.valueOf();
      if (publicationDateDifference !== 0) {
        return publicationDateDifference;
      }

      const firstSeriesOrder = firstPost.data.seriesOrder ?? 0;
      const secondSeriesOrder = secondPost.data.seriesOrder ?? 0;
      return secondSeriesOrder - firstSeriesOrder;
    })
    .map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/writing/${post.slug}`,
    }));

  return rss({
    title: 'Jose Flores | Writing',
    description: 'Writing on frontend architecture, statecharts, and the actor model.',
    site: context.site,
    items,
  });
}

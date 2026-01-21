import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';

export async function GET(context) {
  const posts = await getCollection('blog');
  const items = posts
    .filter((post) => !post.data.draft)
    .sort((firstPost, secondPost) => {
      const publicationDateDifference =
        secondPost.data.pubDate.valueOf() - firstPost.data.pubDate.valueOf();
      if (publicationDateDifference !== 0) {
        return publicationDateDifference;
      }

      const firstEditionValue = firstPost.data.edition ?? 0;
      const secondEditionValue = secondPost.data.edition ?? 0;
      return secondEditionValue - firstEditionValue;
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

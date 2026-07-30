import { type CollectionEntry, getCollection } from 'astro:content';

type BlogEntry = CollectionEntry<'blog'>;

export type BlogPost = BlogEntry & {
  slug: string;
};

export const isPublished = (post: BlogPost) => !post.data.draft;

export const getBlogPostActivityDate = (post: BlogPost): Date =>
  post.data.updatedDate ?? post.data.pubDate;

export const sortBlogPostsByRecency = (posts: BlogPost[]): BlogPost[] =>
  [...posts].sort((firstPost, secondPost) => {
    const activityDateDifference =
      getBlogPostActivityDate(secondPost).valueOf() - getBlogPostActivityDate(firstPost).valueOf();
    if (activityDateDifference !== 0) {
      return activityDateDifference;
    }

    if (firstPost.data.series && firstPost.data.series === secondPost.data.series) {
      const firstSeriesOrder = firstPost.data.seriesOrder ?? 0;
      const secondSeriesOrder = secondPost.data.seriesOrder ?? 0;
      const seriesOrderDifference = secondSeriesOrder - firstSeriesOrder;
      if (seriesOrderDifference !== 0) {
        return seriesOrderDifference;
      }
    }

    const publicationDateDifference =
      secondPost.data.pubDate.valueOf() - firstPost.data.pubDate.valueOf();
    if (publicationDateDifference !== 0) {
      return publicationDateDifference;
    }

    return firstPost.data.title.localeCompare(secondPost.data.title);
  });

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts.map((post) => ({ ...post, slug: post.id })).filter(isPublished);
}

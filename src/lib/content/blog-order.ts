export type OrderableBlogPost = {
  data: {
    pubDate: Date;
    seriesOrder?: number;
    title: string;
    updatedDate?: Date;
  };
};

const RSS_DATE_ORDER_OFFSET_MS = 1_000;

export const getBlogPostActivityDate = (post: OrderableBlogPost): Date =>
  post.data.updatedDate ?? post.data.pubDate;

export const getBlogPostFeedDate = (post: OrderableBlogPost): Date =>
  new Date(
    getBlogPostActivityDate(post).valueOf() +
      (post.data.seriesOrder ?? 0) * RSS_DATE_ORDER_OFFSET_MS,
  );

export const sortBlogPostsByRecency = <Post extends OrderableBlogPost>(posts: Post[]): Post[] =>
  [...posts].sort((firstPost, secondPost) => {
    const activityDateDifference =
      getBlogPostActivityDate(secondPost).valueOf() - getBlogPostActivityDate(firstPost).valueOf();
    if (activityDateDifference !== 0) {
      return activityDateDifference;
    }

    const seriesOrderDifference =
      (secondPost.data.seriesOrder ?? 0) - (firstPost.data.seriesOrder ?? 0);
    if (seriesOrderDifference !== 0) {
      return seriesOrderDifference;
    }

    const publicationDateDifference =
      secondPost.data.pubDate.valueOf() - firstPost.data.pubDate.valueOf();
    if (publicationDateDifference !== 0) {
      return publicationDateDifference;
    }

    return firstPost.data.title.localeCompare(secondPost.data.title);
  });

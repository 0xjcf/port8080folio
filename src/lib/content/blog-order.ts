export type OrderableBlogPost = {
  data: {
    pubDate: Date;
    seriesOrder?: number;
    title: string;
    updatedDate?: Date;
  };
};

const RSS_DATE_RESOLUTION_MS = 1_000;

export const getBlogPostActivityDate = (post: OrderableBlogPost): Date =>
  post.data.updatedDate ?? post.data.pubDate;

const toRssTimestamp = (date: Date): number =>
  Math.floor(date.valueOf() / RSS_DATE_RESOLUTION_MS) * RSS_DATE_RESOLUTION_MS;

export const getBlogPostFeedDates = <Post extends OrderableBlogPost>(
  orderedPosts: Post[],
): Date[] => {
  const activityTimestamps = orderedPosts.map((post) =>
    toRssTimestamp(getBlogPostActivityDate(post)),
  );
  const feedDates: Date[] = [];

  let groupStart = 0;
  while (groupStart < activityTimestamps.length) {
    const activityTimestamp = activityTimestamps[groupStart];
    let groupEnd = groupStart + 1;

    while (
      groupEnd < activityTimestamps.length &&
      activityTimestamps[groupEnd] === activityTimestamp
    ) {
      groupEnd += 1;
    }

    const groupSize = groupEnd - groupStart;
    const newerTimestamp = groupStart === 0 ? undefined : activityTimestamps[groupStart - 1];
    const availableOffsetSteps =
      newerTimestamp === undefined
        ? groupSize - 1
        : Math.max(0, (newerTimestamp - activityTimestamp) / RSS_DATE_RESOLUTION_MS - 1);

    for (let index = groupStart; index < groupEnd; index += 1) {
      const preferredOffsetSteps = groupEnd - index - 1;
      const offsetSteps = Math.min(preferredOffsetSteps, availableOffsetSteps);
      feedDates.push(new Date(activityTimestamp + offsetSteps * RSS_DATE_RESOLUTION_MS));
    }

    groupStart = groupEnd;
  }

  return feedDates;
};

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

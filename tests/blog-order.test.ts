// @vitest-environment node

import { describe, expect, it } from 'vitest';

import {
  getBlogPostActivityDate,
  getBlogPostFeedDates,
  sortBlogPostsByRecency,
  type OrderableBlogPost,
} from '../src/lib/content/blog-order';

type TestPost = OrderableBlogPost & {
  slug: string;
};

const activityDate = new Date('2026-07-30T00:00:00.000Z');
const posts: TestPost[] = [
  {
    slug: 'part-2',
    data: {
      title: 'Part 2',
      pubDate: new Date('2025-01-01T00:00:00.000Z'),
      updatedDate: activityDate,
      seriesOrder: 2,
    },
  },
  {
    slug: 'part-1',
    data: {
      title: 'Part 1',
      pubDate: new Date('2025-01-03T00:00:00.000Z'),
      updatedDate: activityDate,
      seriesOrder: 1,
    },
  },
  {
    slug: 'standalone',
    data: {
      title: 'Standalone',
      pubDate: new Date('2025-01-02T00:00:00.000Z'),
      updatedDate: activityDate,
    },
  },
];

const permutations = <Value>(values: Value[]): Value[][] =>
  values.length === 0
    ? [[]]
    : values.flatMap((value, index) =>
        permutations(values.filter((_, candidateIndex) => candidateIndex !== index)).map(
          (permutation) => [value, ...permutation],
        ),
      );

describe('blog post ordering', () => {
  it('returns the same transitive order for every input permutation', () => {
    for (const permutation of permutations(posts)) {
      expect(
        sortBlogPostsByRecency(permutation).map((post) => post.slug),
      ).toEqual(['part-2', 'part-1', 'standalone']);
    }
  });

  it('gives same-day series parts distinct feed dates without changing activity dates', () => {
    expect(getBlogPostActivityDate(posts[0])).toEqual(activityDate);
    expect(getBlogPostActivityDate(posts[1])).toEqual(activityDate);
    const feedDates = getBlogPostFeedDates(
      sortBlogPostsByRecency(posts),
    ).map((date) => date.valueOf());

    expect(feedDates[0]).toBeGreaterThan(feedDates[1]);
    expect(feedDates[1]).toBeGreaterThan(feedDates[2]);
  });

  it('never offsets an older group past a genuinely newer activity timestamp', () => {
    const nearTiedPosts: TestPost[] = [
      {
        slug: 'newer',
        data: {
          title: 'Newer',
          pubDate: new Date('2026-07-30T00:00:02.000Z'),
        },
      },
      {
        slug: 'older-part-2',
        data: {
          title: 'Older Part 2',
          pubDate: new Date('2026-07-30T00:00:00.000Z'),
          seriesOrder: 2,
        },
      },
      {
        slug: 'older-part-1',
        data: {
          title: 'Older Part 1',
          pubDate: new Date('2026-07-30T00:00:00.000Z'),
          seriesOrder: 1,
        },
      },
    ];
    const orderedPosts = sortBlogPostsByRecency(nearTiedPosts);
    const feedDates = getBlogPostFeedDates(orderedPosts).map((date) =>
      date.valueOf(),
    );

    expect(orderedPosts.map((post) => post.slug)).toEqual([
      'newer',
      'older-part-2',
      'older-part-1',
    ]);
    expect(feedDates).toEqual([
      new Date('2026-07-30T00:00:02.000Z').valueOf(),
      new Date('2026-07-30T00:00:01.000Z').valueOf(),
      new Date('2026-07-30T00:00:00.000Z').valueOf(),
    ]);
  });
});

// @vitest-environment node

import { describe, expect, it } from 'vitest';

import {
  getBlogPostActivityDate,
  getBlogPostFeedDate,
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
    expect(getBlogPostFeedDate(posts[0]).valueOf()).toBeGreaterThan(
      getBlogPostFeedDate(posts[1]).valueOf(),
    );
  });
});

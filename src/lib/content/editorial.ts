import type { BlogPost } from './blog';

export const seriesName = 'Behavior & Boundaries';
export const seriesUrl = '/writing/behavior-and-boundaries/';

export const formatDate = (date: Date) => new Intl.DateTimeFormat('en', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
}).format(date);

export const readingMinutes = (post: BlogPost) => Math.max(
  1, Math.ceil((post.body ?? '').split(/\s+/).filter(Boolean).length / 210),
);

export const orderSeries = (posts: BlogPost[]) => posts
  .filter(post => post.data.series === seriesName)
  .sort((a, b) => (a.data.seriesOrder ?? Infinity) - (b.data.seriesOrder ?? Infinity));

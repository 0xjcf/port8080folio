export interface ArticleCover {
  src: string;
  alt: string;
  width: number;
  height: number;
}

// Preview artwork stays separate from the original article Markdown.
// Use a new filename when replacing art so preview caches can fetch the new asset.
const covers: Record<string, ArticleCover> = {
  'when-code-becomes-cheap': {
    src: '/assets/images/articles/when-code-becomes-cheap-v1.jpg',
    alt: 'Three architectural enclosures organize charcoal blocks, each anchored by one red keystone.',
    width: 1733,
    height: 907,
  },
  'before-behavior-product-frame': {
    src: '/assets/images/articles/before-behavior-product-frame-v1.jpg',
    alt: 'A red frame isolates a purposeful charcoal structure from scattered paper fragments.',
    width: 1733,
    height: 907,
  },
  'narrative-to-semantic-command': {
    src: '/assets/images/articles/narrative-to-semantic-command-v1.jpg',
    alt: 'Loose charcoal ribbons converge through a red gate into a single precisely folded token.',
    width: 1734,
    height: 907,
  },
  'functional-core': {
    src: '/assets/images/articles/functional-core-v1.jpg',
    alt: 'A precise red geometric core sits in a clear space, separated from a ring of irregular charcoal forms.',
    width: 1732,
    height: 908,
  },
  'lifecycle-is-the-real-boundary': {
    src: '/assets/images/articles/lifecycle-is-the-real-boundary-v1.jpg',
    alt: 'A charcoal enclosure surrounds a red architectural structure and a path that circulates through one opening.',
    width: 1734,
    height: 907,
  },
};

export const getArticleCover = (slug: string): ArticleCover | undefined => covers[slug];

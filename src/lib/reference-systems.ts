export type ReferenceSystem = {
  slug: string;
  title: string;
  summary: string;
  repoUrl: string;
  demoUrl?: string;
  writingLinks?: Array<{ title: string; url: string }>;
  demonstrates: string[];
  tags?: string[];
};

export const referenceSystems: ReferenceSystem[] = [
  {
    slug: 'editor-save-loop',
    title: 'Editor Save Loop',
    summary:
      'A minimal system that keeps save state, async effects, and UI feedback deterministic without leaking across layers.',
    repoUrl: 'https://github.com/0xjcf/editor-save-loop',
    demoUrl: 'https://stackblitz.com/~/github.com/0xjcf/editor-save-loop',
    writingLinks: [
      { title: 'Functional Core Architecture', url: '/writing/functional-core/' },
      { title: 'Lifecycle Boundaries', url: '/writing/lifecycle-is-the-real-boundary/' },
    ],
    demonstrates: [
      'Explicit lifecycle ownership',
      'Functional core vs imperative shell',
      'Side-effects containment (ports/adapters)',
      'Deterministic projections for UI',
    ],
  },
  {
    slug: 'spa-router',
    title: 'SPA Router',
    summary: 'The Ignite Element v3 beta router example discussed in the functional-core essay. Explore route policy, semantic navigation requests, and environment capabilities.',
    repoUrl: 'https://github.com/0xjcf/ignite-element/tree/beta/examples/apps/spa-router',
    writingLinks: [{ title: 'Functional Core Architecture', url: '/writing/functional-core/' }],
    demonstrates: ['Deterministic route resolution', 'Authentication redirects as application policy', 'Semantic navigation requests'],
  },
  {
    slug: 'nested-child-router',
    title: 'Nested Child Router',
    summary: 'The companion v3 beta example for parent and child navigation surfaces sharing one application-owned router source.',
    repoUrl: 'https://github.com/0xjcf/ignite-element/tree/beta/examples/apps/nested-child-router',
    writingLinks: [
      { title: 'Functional Core Architecture', url: '/writing/functional-core/' },
      { title: 'Lifecycle Boundaries', url: '/writing/lifecycle-is-the-real-boundary/' },
    ],
    demonstrates: ['One router actor shared across projections', 'Scoped navigation commands', 'Explicit lifecycle ownership'],
  },
];

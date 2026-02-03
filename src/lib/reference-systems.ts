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
    slug: "editor-save-loop",
    title: "Editor Save Loop",
    summary:
      "A minimal system that keeps save state, async effects, and UI feedback deterministic without leaking across layers.",
    repoUrl: "https://github.com/0xjcf/editor-save-loop",
    demoUrl: "https://stackblitz.com/~/github.com/0xjcf/editor-save-loop",
    demonstrates: [
      "Explicit lifecycle ownership",
      "Functional core vs imperative shell",
      "Side-effects containment (ports/adapters)",
      "Deterministic projections for UI",
    ],
  },
];

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    series: z.string().optional(),
    edition: z.number().int().positive().optional(),
    revision: z.number().int().positive().optional(),
    seriesOrder: z.number().int().positive().optional(),
    isSeriesFinal: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    glossary: z
      .array(
        z.object({
          term: z.string(),
          definition: z.string(),
        }),
      )
      .optional(),
  }),
});

const resources = defineCollection({
  loader: glob({
    base: './src/content/resources',
    pattern: '**/*.{md,mdx}',
  }),
});

export const collections = { blog, resources };

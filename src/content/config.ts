import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    series: z.string().optional(),
    edition: z.number().int().positive().optional(),
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

export const collections = { blog };

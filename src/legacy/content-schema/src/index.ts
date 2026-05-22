import { z } from 'zod';

export const localeSchema = z.enum(['zh', 'en']);

export const staticContentFrontmatterSchema = z.object({
  slug: z.string().min(1),
  locale: localeSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  heroImage: z.string().min(1),
  updatedAt: z.string().min(1),
  tags: z.array(z.string()).default([]),
  published: z.boolean(),
});

export const architectureCaseSchema = staticContentFrontmatterSchema.extend({
  challenge: z.string().min(1),
  stack: z.array(z.string()).min(1),
  outcomes: z.array(z.string()).min(1),
  body: z.string().min(1),
});

export const topicShowcaseSchema = staticContentFrontmatterSchema.extend({
  eyebrow: z.string().min(1),
  cta: z.string().min(1),
  sections: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .min(1),
  body: z.string().min(1),
});

export const postSchema = staticContentFrontmatterSchema.extend({
  id: z.string().min(1),
  body: z.string().min(1),
  status: z.enum(['draft', 'published']),
  series: z.string().optional(),
});

export function assertSchema<T>(schema: z.ZodType<T>, input: unknown): T {
  return schema.parse(input);
}

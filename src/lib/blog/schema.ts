import { z } from 'zod';
import { localeSchema } from '@devfolio-blog/content-schema';
import type { BlogPost } from './types';

export const blogPostSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  locale: localeSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  heroImage: z.string().min(1),
  updatedAt: z.string().min(1),
  tags: z.array(z.string()).default([]),
  published: z.boolean(),
  status: z.enum(['draft', 'published']),
  body: z.string().min(1),
  source: z.enum(['md', 'sqlite']),
  series: z.string().min(1).optional(),
}) satisfies z.ZodType<BlogPost>;

export const sqliteBlogPostRowSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  locale: localeSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  hero_image: z.string().min(1),
  updated_at: z.string().min(1),
  tags_json: z.string(),
  published: z.union([z.literal(0), z.literal(1), z.boolean()]),
  status: z.enum(['draft', 'published']),
  series: z.string().nullable().optional(),
  body: z.string().min(1),
});

export type SqliteBlogPostRow = z.infer<typeof sqliteBlogPostRowSchema>;

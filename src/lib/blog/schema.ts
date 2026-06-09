import { z } from 'zod';
import { localeSchema } from '@devfolio-blog/content-schema';
import type { BlogPost } from './types';

export const blogPostSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  locale: localeSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  category: z.string().min(1).default('uncategorized'),
  heroImage: z.string().min(1),
  updatedAt: z.string().min(1),
  tags: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  published: z.boolean(),
  status: z.enum(['draft', 'published']),
  body: z.string().min(1),
  source: z.enum(['md', 'sqlite']),
  series: z.string().min(1).optional(),
}) satisfies z.ZodType<BlogPost>;

export const sqliteBlogPostRowSchema = z.object({
  id: z.string().min(1),
  group_id: z.string().min(1),
  category: z.string().min(1),
  hero_image: z.string().min(1),
  updated_at: z.string().min(1),
  tag_ids_json: z.string(),
  published: z.union([z.literal(0), z.literal(1), z.boolean()]),
  status: z.enum(['draft', 'published']),
  series: z.string().nullable().optional(),
  slug_zh: z.string().nullable().optional(),
  title_zh: z.string().nullable().optional(),
  summary_zh: z.string().nullable().optional(),
  body_zh: z.string().nullable().optional(),
  slug_en: z.string().nullable().optional(),
  title_en: z.string().nullable().optional(),
  summary_en: z.string().nullable().optional(),
  body_en: z.string().nullable().optional(),
});

export type SqliteBlogPostRow = z.infer<typeof sqliteBlogPostRowSchema>;

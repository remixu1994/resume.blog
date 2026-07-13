import { z } from 'zod';

const slugSchema = z.string().trim().max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens.');
const tagIdSchema = z.string().trim().min(1).max(80).regex(/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u);

export const localizedDraftSchema = z.object({
  slug: z.string().trim().max(180).default(''),
  title: z.string().trim().max(240).default(''),
  summary: z.string().trim().max(600).default(''),
  body: z.string().max(200_000).default(''),
});

export const adminBlogPostInputSchema = z.object({
  category: z.string().trim().min(1).max(100).default('uncategorized'),
  heroImage: z.string().trim().min(1).max(2_000).default('/assets/blog/nx-monorepo.svg'),
  tagIds: z.array(tagIdSchema).max(20).default([]).transform((items) => [...new Set(items)]),
  series: z.string().trim().max(120).optional().default(''),
  zh: localizedDraftSchema,
  en: localizedDraftSchema,
});

export const publishBlogPostInputSchema = adminBlogPostInputSchema.superRefine((value, context) => {
  for (const locale of ['zh', 'en'] as const) {
    const content = value[locale];
    for (const [field, fieldValue] of [
      ['slug', content.slug], ['title', content.title], ['summary', content.summary], ['body', content.body.trim()],
    ] as const) {
      if (!fieldValue) context.addIssue({ code: 'custom', path: [locale, field], message: `${locale.toUpperCase()} ${field} is required to publish.` });
    }
    if (content.slug) {
      const result = slugSchema.safeParse(content.slug);
      if (!result.success) context.addIssue({ code: 'custom', path: [locale, 'slug'], message: result.error.issues[0]?.message || 'Invalid slug.' });
    }
  }
});

export const loginInputSchema = z.object({
  username: z.string().min(1).max(200),
  password: z.string().min(1).max(500),
});

export const assetUploadInputSchema = z.object({
  fileName: z.string().trim().min(1).max(240),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  sizeBytes: z.number().int().positive().max(10 * 1024 * 1024),
});

export type AdminBlogPostInput = z.infer<typeof adminBlogPostInputSchema>;

export interface AdminBlogPost extends AdminBlogPostInput {
  id: string;
  groupId: string;
  published: boolean;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

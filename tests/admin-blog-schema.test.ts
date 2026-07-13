import { describe, expect, it } from 'vitest';
import { adminBlogPostInputSchema, publishBlogPostInputSchema } from '@/lib/blog/admin-schema';

const completeInput = {
  category: 'architecture',
  heroImage: '/assets/blog/nx-monorepo.svg',
  tagIds: ['architecture', 'system-design'],
  series: 'delivery',
  zh: { slug: 'zh-post', title: '中文标题', summary: '中文摘要', body: '中文正文' },
  en: { slug: 'en-post', title: 'English title', summary: 'English summary', body: 'English body' },
};

describe('admin blog validation', () => {
  it('allows incomplete bilingual drafts', () => {
    const draft = adminBlogPostInputSchema.parse({
      category: 'uncategorized', heroImage: '/assets/blog/nx-monorepo.svg', tagIds: [], zh: {}, en: {},
    });
    expect(draft.zh.title).toBe('');
    expect(draft.en.body).toBe('');
  });

  it('requires complete zh and en content to publish', () => {
    const result = publishBlogPostInputSchema.safeParse({ ...completeInput, en: { ...completeInput.en, body: '' } });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path.join('.') === 'en.body')).toBe(true);
  });

  it('accepts a complete bilingual post and normalizes duplicate tags', () => {
    const result = publishBlogPostInputSchema.parse({ ...completeInput, tagIds: ['architecture', 'architecture'] });
    expect(result.tagIds).toEqual(['architecture']);
  });

  it('rejects non-canonical publish slugs', () => {
    const result = publishBlogPostInputSchema.safeParse({ ...completeInput, zh: { ...completeInput.zh, slug: 'Bad Slug' } });
    expect(result.success).toBe(false);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { buildRssFeed } from '@/lib/rss';
import type { BlogPostSummary } from '@/lib/blog/types';

vi.mock('@/lib/blog/repository', () => ({
  listBlogPosts: vi.fn((locale: string) => {
    const posts: Record<string, BlogPostSummary[]> = {
      zh: [
        {
          id: 'zh-1',
          slug: 'zh-post-one',
          locale: 'zh',
          title: '中文文章标题',
          summary: '这是中文文章摘要。',
          heroImage: '/assets/blog/test.svg',
          updatedAt: '2026-06-01',
          tags: ['Architecture'],
          published: true,
          status: 'published',
          source: 'sqlite',
          category: 'architecture',
        },
        {
          id: 'zh-2',
          slug: 'zh-post-two',
          locale: 'zh',
          title: '第二篇文章',
          summary: '第二篇摘要。',
          heroImage: '/assets/blog/test2.svg',
          updatedAt: '2026-05-15',
          tags: ['Blog'],
          published: true,
          status: 'published',
          source: 'sqlite',
          category: 'fundamentals',
        },
      ],
      en: [
        {
          id: 'en-1',
          slug: 'en-post-one',
          locale: 'en',
          title: 'English Post Title',
          summary: 'This is an English post summary.',
          heroImage: '/assets/blog/test.svg',
          updatedAt: '2026-06-02',
          tags: ['Engineering'],
          published: true,
          status: 'published',
          source: 'sqlite',
          category: 'extreme-programming',
        },
      ],
    };
    return posts[locale] ?? [];
  }),
}));

describe('rss feed generation', () => {
  it('generates a valid RSS 2.0 XML structure', async () => {
    const xml = await buildRssFeed('zh');

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('</channel>');
    expect(xml).toContain('</rss>');
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
  });

  it('includes feed metadata for a locale-specific feed', async () => {
    const xml = await buildRssFeed('zh');

    expect(xml).toContain('<title>Remi Resume Blog (ZH)</title>');
    expect(xml).toContain('<language>zh-cn</language>');
    expect(xml).toContain('<atom:link');
    expect(xml).toContain('/zh/feed.xml');
  });

  it('includes all published posts for the requested locale', async () => {
    const xml = await buildRssFeed('zh');

    expect(xml).toContain('中文文章标题');
    expect(xml).toContain('第二篇文章');
    expect(xml).not.toContain('English Post Title');
  });

  it('generates a combined feed with all locales when no locale is specified', async () => {
    const xml = await buildRssFeed();

    expect(xml).toContain('中文文章标题');
    expect(xml).toContain('第二篇文章');
    expect(xml).toContain('English Post Title');
    expect(xml).toContain('<title>Remi Resume Blog</title>');
    expect(xml).toContain('/feed.xml');
  });

  it('sorts posts by updatedAt descending', async () => {
    const xml = await buildRssFeed('zh');
    const firstItemIndex = xml.indexOf('<item>');
    const secondItemIndex = xml.indexOf('<item>', firstItemIndex + 1);

    const firstTitle = xml.slice(xml.indexOf('<title>', firstItemIndex), xml.indexOf('</title>', firstItemIndex));
    const secondTitle = xml.slice(xml.indexOf('<title>', secondItemIndex), xml.indexOf('</title>', secondItemIndex));

    // 2026-06-01 should come before 2026-05-15
    expect(firstTitle).toContain('中文文章标题');
    expect(secondTitle).toContain('第二篇文章');
  });

  it('includes post links with full absolute URLs', async () => {
    process.env.SITE_URL = 'https://resume.example.com';
    const xml = await buildRssFeed('zh');

    expect(xml).toContain('https://resume.example.com/zh/blog/zh-post-one');
    expect(xml).toContain('https://resume.example.com/zh/blog/zh-post-two');

    delete process.env.SITE_URL;
  });

  it('includes category in each item', async () => {
    const xml = await buildRssFeed('zh');

    expect(xml).toContain('<category>architecture</category>');
    expect(xml).toContain('<category>fundamentals</category>');
  });

  it('escapes XML special characters in post content', async () => {
    const xml = await buildRssFeed('en');

    // The summary & title should not have raw < > & characters
    expect(xml).not.toMatch(/<title>[^<]*&[^<]*<\/title>/);
    expect(xml).not.toMatch(/<description>[^<]*&[^<]*<\/description>/);
  });

  it('uses RFC 822 date format for pubDate', async () => {
    const xml = await buildRssFeed('en');

    // RFC 822 format: "Sat, 02 Jun 2026 00:00:00 GMT"
    expect(xml).toMatch(/<pubDate>\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT<\/pubDate>/);
  });

  it('includes guid as permalink for each item', async () => {
    const xml = await buildRssFeed('en');

    expect(xml).toContain('isPermaLink="true"');
    expect(xml).toContain('<guid');
  });
});

import { describe, expect, it } from 'vitest';
import { searchBlogPosts, highlightText, highlightSnippet } from '@/lib/blog/search';
import type { BlogContentSource, BlogPost } from '@/lib/blog/types';

function sourceWithPosts(posts: BlogPost[]): BlogContentSource {
  return {
    listPosts: () => posts,
  };
}

function blogPost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id: 'post',
    slug: 'post',
    locale: 'zh',
    title: 'Post',
    summary: 'Summary',
    category: 'uncategorized',
    heroImage: '/assets/blog/unraid-layout.svg',
    updatedAt: '2026-05-01',
    tags: ['Blog'],
    tagIds: ['blog'],
    published: true,
    status: 'published',
    body: '## Body content here',
    source: 'md',
    ...overrides,
  };
}

describe('searchBlogPosts', () => {
  it('returns empty results for empty query', async () => {
    const results = await searchBlogPosts('', 'zh', [sourceWithPosts([blogPost()])]);
    expect(results).toEqual([]);
  });

  it('returns empty results for whitespace-only query', async () => {
    const results = await searchBlogPosts('   ', 'zh', [sourceWithPosts([blogPost()])]);
    expect(results).toEqual([]);
  });

  it('finds posts matching title', async () => {
    const source = sourceWithPosts([
      blogPost({ title: 'SQLite 数据库入门', slug: 'sqlite-intro' }),
      blogPost({ title: 'React 组件设计', slug: 'react-design', id: 'post2' }),
    ]);

    const results = await searchBlogPosts('SQLite', 'zh', [source]);

    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe('sqlite-intro');
  });

  it('finds posts matching summary', async () => {
    const source = sourceWithPosts([
      blogPost({ summary: '深入理解微服务架构', slug: 'microservices' }),
      blogPost({ summary: '前端工程化实践', slug: 'frontend', id: 'post2' }),
    ]);

    const results = await searchBlogPosts('微服务', 'zh', [source]);

    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe('microservices');
  });

  it('finds posts matching body content', async () => {
    const source = sourceWithPosts([
      blogPost({ body: '## DDD 领域驱动设计\n\n领域驱动设计是一种...', slug: 'ddd' }),
      blogPost({ body: '## REST API 设计', slug: 'rest', id: 'post2' }),
    ]);

    const results = await searchBlogPosts('领域驱动', 'zh', [source]);

    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe('ddd');
  });

  it('supports case-insensitive search', async () => {
    const source = sourceWithPosts([
      blogPost({ title: 'SQLite Database Guide', slug: 'sqlite', locale: 'en' }),
    ]);

    const results = await searchBlogPosts('sqlite', 'en', [source]);

    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe('sqlite');
  });

  it('supports multi-term search (all terms must match)', async () => {
    const source = sourceWithPosts([
      blogPost({ title: 'SQLite 数据库性能优化', slug: 'sqlite-perf' }),
      blogPost({ title: 'SQLite 入门教程', slug: 'sqlite-intro', id: 'post2' }),
      blogPost({ title: 'Redis 缓存设计', slug: 'redis', id: 'post3' }),
    ]);

    const results = await searchBlogPosts('SQLite 性能', 'zh', [source]);

    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe('sqlite-perf');
  });

  it('filters by locale', async () => {
    const source = sourceWithPosts([
      blogPost({ title: '中文文章', slug: 'zh-post', locale: 'zh' }),
      blogPost({ title: 'English Post', slug: 'en-post', locale: 'en', id: 'post2' }),
    ]);

    const zhResults = await searchBlogPosts('文章', 'zh', [source]);
    const enResults = await searchBlogPosts('English', 'en', [source]);

    expect(zhResults).toHaveLength(1);
    expect(zhResults[0].slug).toBe('zh-post');
    expect(enResults).toHaveLength(1);
    expect(enResults[0].slug).toBe('en-post');
  });

  it('excludes unpublished and draft posts', async () => {
    const source = sourceWithPosts([
      blogPost({ title: 'Published SQLite Post', slug: 'published' }),
      blogPost({ title: 'Draft SQLite Post', slug: 'draft', published: false, id: 'post2' }),
      blogPost({ title: 'Hidden SQLite Post', slug: 'hidden', status: 'draft', id: 'post3' }),
    ]);

    const results = await searchBlogPosts('SQLite', 'zh', [source]);

    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe('published');
  });

  it('sorts results by relevance (title > summary > body)', async () => {
    const source = sourceWithPosts([
      blogPost({ title: '其他文章', summary: '包含 SQLite 的内容', body: '普通内容', slug: 'summary-match', id: 'post1' }),
      blogPost({ title: 'SQLite 完全指南', summary: '数据库教程', body: '普通内容', slug: 'title-match', id: 'post2' }),
      blogPost({ title: '其他文章', summary: '普通摘要', body: 'SQLite 相关内容', slug: 'body-match', id: 'post3' }),
    ]);

    const results = await searchBlogPosts('SQLite', 'zh', [source]);

    expect(results).toHaveLength(3);
    // Title match should rank first
    expect(results[0].slug).toBe('title-match');
  });

  it('includes highlighted text in results', async () => {
    const source = sourceWithPosts([
      blogPost({ title: 'SQLite 数据库入门', slug: 'sqlite' }),
    ]);

    const results = await searchBlogPosts('SQLite', 'zh', [source]);

    expect(results).toHaveLength(1);
    expect(results[0].highlightedTitle).toContain('<mark>');
    expect(results[0].highlightedTitle).toContain('SQLite');
    expect(results[0].highlightedTitle).toContain('</mark>');
  });

  it('returns correct result structure', async () => {
    const source = sourceWithPosts([
      blogPost({
        title: 'Test Post',
        slug: 'test',
        summary: 'Test summary',
        category: 'architecture',
        tags: ['Test'],
        updatedAt: '2026-06-01',
      }),
    ]);

    const results = await searchBlogPosts('Test', 'zh', [source]);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: 'post',
      slug: 'test',
      locale: 'zh',
      title: 'Test Post',
      summary: 'Test summary',
      category: 'architecture',
      tags: ['Test'],
      updatedAt: '2026-06-01',
    });
    expect(results[0].highlightedTitle).toBeDefined();
    expect(results[0].highlightedSummary).toBeDefined();
    expect(results[0].highlightedSnippet).toBeDefined();
  });
});

describe('highlightText', () => {
  it('wraps matching terms in <mark> tags', () => {
    const result = highlightText('SQLite is great', ['sqlite']);
    expect(result).toBe('<mark>SQLite</mark> is great');
  });

  it('handles multiple matches', () => {
    const result = highlightText('SQLite and sqlite are the same', ['sqlite']);
    expect(result).toContain('<mark>SQLite</mark>');
    expect(result).toContain('<mark>sqlite</mark>');
  });

  it('handles multiple terms', () => {
    const result = highlightText('SQLite database performance', ['sqlite', 'performance']);
    expect(result).toContain('<mark>SQLite</mark>');
    expect(result).toContain('<mark>performance</mark>');
  });

  it('escapes HTML in text', () => {
    const result = highlightText('Use <script> tags', ['script']);
    // The < and > around "script" are escaped, and "script" is highlighted
    expect(result).toBe('Use &lt;<mark>script</mark>&gt; tags');
    expect(result).toContain('<mark>script</mark>');
  });

  it('returns escaped text when no terms provided', () => {
    const result = highlightText('Hello <world>', []);
    expect(result).toBe('Hello &lt;world&gt;');
  });
});

describe('highlightSnippet', () => {
  it('returns highlighted snippet around first match', () => {
    const body = 'A'.repeat(100) + 'SQLite' + 'B'.repeat(100);
    const result = highlightSnippet(body, ['sqlite']);

    expect(result).toContain('<mark>SQLite</mark>');
    expect(result).toContain('...');
  });

  it('truncates long body text', () => {
    const body = 'word '.repeat(200);
    const result = highlightSnippet(body, ['nonexistent']);

    expect(result.length).toBeLessThan(body.length);
    expect(result).toContain('...');
  });

  it('returns beginning of text when no match found', () => {
    const body = 'This is a test body with some content';
    const result = highlightSnippet(body, ['nonexistent']);

    expect(result).not.toContain('<mark>');
    expect(result).toContain('This is a test');
  });

  it('handles empty body', () => {
    const result = highlightSnippet('', ['test']);
    expect(result).toBe('');
  });
});

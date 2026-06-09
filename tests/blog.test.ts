import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { afterEach, describe, expect, it } from 'vitest';
import { parseBlogMarkdown } from '@/lib/blog/markdown-source';
import { getBlogListViewModel } from '@/content/site-content';
import {
  getBlogPost,
  getBlogCategories,
  listBlogPosts,
  mergeBlogSources,
} from '@/lib/blog/repository';
import { readSqliteBlogPosts } from '@/lib/blog/sqlite-source';
import type { BlogContentSource, BlogPost } from '@/lib/blog/types';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('blog repository', () => {
  it('parses markdown frontmatter into a blog post', () => {
    const post = parseBlogMarkdown(`---
id: md-1
slug: md-post
locale: zh
title: Markdown Post
summary: Rendered from static markdown.
heroImage: /assets/blog/nx-monorepo.svg
updatedAt: 2026-05-20
tags: [Markdown, Blog]
published: true
status: published
series: static-notes
---

## Body

Markdown content.`);

    expect(post).toMatchObject({
      id: 'md-1',
      slug: 'md-post',
      locale: 'zh',
      title: 'Markdown Post',
      category: 'uncategorized',
      tags: ['Markdown', 'Blog'],
      source: 'md',
      series: 'static-notes',
    });
    expect(post.body).toContain('Markdown content.');
  });

  it('maps sqlite rows into unified blog posts', () => {
    const dbPath = createBlogDatabase();

    const posts = readSqliteBlogPosts(dbPath);

    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      id: 'sqlite-group:zh',
      slug: 'sqlite-post',
      locale: 'zh',
      title: 'SQLite Post',
      category: 'sqlite-notes',
      heroImage: '/assets/blog/unraid-layout.svg',
      updatedAt: '2026-05-21',
      tags: ['SQLite', 'Runtime'],
      tagIds: ['sqlite', 'runtime'],
      published: true,
      status: 'published',
      source: 'sqlite',
    });
  });

  it('does not validate hidden sqlite drafts during public reads', () => {
    const dbPath = createBlogDatabase({ includeMalformedDraft: true });

    const posts = readSqliteBlogPosts(dbPath);

    expect(posts.map((post) => post.slug)).toEqual(['sqlite-post']);
    expect(posts[0].category).toBe('sqlite-notes');
  });

  it('projects sqlite multilingual rows by available locale fields', () => {
    const dbPath = createBlogDatabase({ includeEnglish: true });

    expect(readSqliteBlogPosts(dbPath).map((post) => `${post.locale}:${post.slug}`)).toEqual([
      'zh:sqlite-post',
      'en:sqlite-post-en',
    ]);
  });

  it('lets sqlite override markdown for the same locale and slug', () => {
    const posts = mergeBlogSources([
      sourceWithPosts([
        blogPost({
          id: 'md-override',
          slug: 'same-slug',
          title: 'Markdown Version',
          source: 'md',
        }),
      ]),
      sourceWithPosts([
        blogPost({
          id: 'sqlite-override',
          slug: 'same-slug',
          title: 'SQLite Version',
          source: 'sqlite',
        }),
      ]),
    ]);

    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      id: 'sqlite-override',
      title: 'SQLite Version',
      source: 'sqlite',
    });
  });

  it('excludes unpublished and draft posts from the public list', () => {
    const posts = listBlogPosts('zh', [
      sourceWithPosts([
        blogPost({ id: 'published', slug: 'published' }),
        blogPost({ id: 'hidden', slug: 'hidden', published: false }),
        blogPost({ id: 'draft', slug: 'draft', status: 'draft' }),
      ]),
    ]);

    expect(posts.map((post) => post.slug)).toEqual(['published']);
  });

  it('sorts public posts by updatedAt descending', () => {
    const posts = listBlogPosts('zh', [
      sourceWithPosts([
        blogPost({ id: 'old', slug: 'old', updatedAt: '2026-05-01' }),
        blogPost({ id: 'new', slug: 'new', updatedAt: '2026-05-03' }),
        blogPost({ id: 'middle', slug: 'middle', updatedAt: '2026-05-02' }),
      ]),
    ]);

    expect(posts.map((post) => post.slug)).toEqual(['new', 'middle', 'old']);
  });

  it('returns null for a missing detail slug', () => {
    const detail = getBlogPost('zh', 'missing', [sourceWithPosts([blogPost()])]);

    expect(detail).toBeNull();
  });

  it('resolves legacy Chinese blog slugs to canonical English slugs', () => {
    const detail = getBlogPost('zh', '什么是架构-顶层设计-模块-组件与三大原则', [
      sourceWithPosts([
        blogPost({
          slug: 'what-is-architecture-top-level-design-modules-components-and-three-principles',
          title: 'Chinese slug redirect target',
        }),
      ]),
    ]);

    expect(detail?.item.slug).toBe('what-is-architecture-top-level-design-modules-components-and-three-principles');
    expect(detail?.item.title).toBe('Chinese slug redirect target');
  });

  it('resolves encoded detail slugs', () => {
    const slug = 'what-is-architecture-top-level-design-modules-components-and-three-principles';
    const detail = getBlogPost('zh', encodeURIComponent(slug), [
      sourceWithPosts([
        blogPost({
          slug,
          title: 'English slug post',
        }),
      ]),
    ]);

    expect(detail?.item.slug).toBe(slug);
    expect(detail?.item.title).toBe('English slug post');
  });

  it('derives blog categories from public posts', () => {
    const posts = [
      blogPost({ slug: 'one', category: 'architecture' }),
      blogPost({ slug: 'two', category: 'architecture' }),
      blogPost({ slug: 'three', category: 'extreme-programming' }),
    ];

    expect(getBlogCategories(posts).map((item) => item.name)).toEqual(['architecture', 'extreme-programming']);
  });

  it('imports the draft folders into sqlite with categories', async () => {
    // @ts-expect-error - the import script is a runtime-only helper.
    const { importBlogDraftsIntoSqlite } = await import('../scripts/import-blog-md-to-sqlite.mjs');
    const dir = createTempDatabasePath();
    tempDirs.push(dir);
    const dbPath = join(dir, 'blog.sqlite');

    const result = importBlogDraftsIntoSqlite({ dbPath });
    const posts = readSqliteBlogPosts(dbPath);

    expect(result.importedCount).toBe(15);
    expect(posts).toHaveLength(15);
    expect(posts.every((post) => post.locale === 'zh')).toBe(true);
    expect(new Set(posts.map((post) => post.category))).toEqual(
      new Set(['microservices-ddd', 'extreme-programming', 'architecture', 'fundamentals']),
    );
    expect(posts.every((post) => !post.body.includes('## 原始来源'))).toBe(true);
  });

  it('strips source reference sections from imported markdown bodies', async () => {
    // @ts-expect-error - the import script is a runtime-only helper.
    const { stripSourceReferences } = await import('../scripts/import-blog-md-to-sqlite.mjs');

    const body = stripSourceReferences(`# Title

Main content.

## 原始来源

- \`../note.md\`
- https://example.com

## Next section

Keep this section.`);

    expect(body).toContain('Main content.');
    expect(body).toContain('## Next section');
    expect(body).toContain('Keep this section.');
    expect(body).not.toContain('原始来源');
    expect(body).not.toContain('../note.md');
    expect(body).not.toContain('https://example.com');
  });

  it('filters the blog list by category', async () => {
    // @ts-expect-error - the import script is a runtime-only helper.
    const { importBlogDraftsIntoSqlite } = await import('../scripts/import-blog-md-to-sqlite.mjs');
    const dir = createTempDatabasePath();
    tempDirs.push(dir);
    const dbPath = join(dir, 'blog.sqlite');
    const previousDbPath = process.env.BLOG_DB_PATH;

    try {
      importBlogDraftsIntoSqlite({ dbPath });
      process.env.BLOG_DB_PATH = dbPath;

      const viewModel = getBlogListViewModel('zh', 'architecture');

      expect(viewModel.items.length).toBeGreaterThan(0);
      expect(viewModel.items.every((post) => post.category === 'architecture')).toBe(true);
      expect(viewModel.categories.some((item) => item.active && item.slug === 'architecture')).toBe(true);
    } finally {
      if (previousDbPath === undefined) {
        delete process.env.BLOG_DB_PATH;
      } else {
        process.env.BLOG_DB_PATH = previousDbPath;
      }
    }
  });
});

function createBlogDatabase(options: { includeMalformedDraft?: boolean; includeEnglish?: boolean } = {}) {
  const dir = createTempDatabasePath();
  tempDirs.push(dir);
  const dbPath = join(dir, 'blog.sqlite');
  const db = new Database(dbPath);

  db.exec(`
    create table blog_posts (
      id text primary key,
      group_id text not null unique,
      category text not null,
      hero_image text not null,
      updated_at text not null,
      tag_ids_json text not null,
      published integer not null,
      status text not null,
      series text,
      slug_zh text,
      title_zh text,
      summary_zh text,
      body_zh text,
      slug_en text,
      title_en text,
      summary_en text,
      body_en text
    );
    create unique index blog_posts_slug_zh_idx on blog_posts(slug_zh) where slug_zh is not null;
    create unique index blog_posts_slug_en_idx on blog_posts(slug_en) where slug_en is not null;
  `);

  const insert = db.prepare(`
    insert into blog_posts (
      id, group_id, category, hero_image, updated_at, tag_ids_json, published, status, series,
      slug_zh, title_zh, summary_zh, body_zh, slug_en, title_en, summary_en, body_en
    ) values (
      @id, @groupId, @category, @heroImage, @updatedAt, @tagIdsJson, @published, @status, @series,
      @slugZh, @titleZh, @summaryZh, @bodyZh, @slugEn, @titleEn, @summaryEn, @bodyEn
    )
  `);

  insert.run({
    id: 'sqlite-group',
    groupId: 'sqlite-group',
    category: 'sqlite-notes',
    heroImage: '/assets/blog/unraid-layout.svg',
    updatedAt: '2026-05-21',
    tagIdsJson: JSON.stringify(['sqlite', 'runtime']),
    published: 1,
    status: 'published',
    series: 'runtime-notes',
    slugZh: 'sqlite-post',
    titleZh: 'SQLite Post',
    summaryZh: 'Loaded at runtime.',
    bodyZh: '## SQLite body',
    slugEn: options.includeEnglish ? 'sqlite-post-en' : null,
    titleEn: options.includeEnglish ? 'SQLite Post EN' : null,
    summaryEn: options.includeEnglish ? 'Loaded in English.' : null,
    bodyEn: options.includeEnglish ? '## SQLite body EN' : null,
  });
  insert.run({
    id: 'sqlite-2',
    groupId: 'sqlite-draft',
    category: 'draft-notes',
    heroImage: '/assets/blog/unraid-layout.svg',
    updatedAt: '2026-05-22',
    tagIdsJson: JSON.stringify(['sqlite']),
    published: 0,
    status: 'draft',
    series: null,
    slugZh: 'sqlite-draft',
    titleZh: 'SQLite Draft',
    summaryZh: 'Draft row.',
    bodyZh: '## Draft body',
    slugEn: null,
    titleEn: null,
    summaryEn: null,
    bodyEn: null,
  });
  if (options.includeMalformedDraft) {
    insert.run({
      id: 'sqlite-bad-draft',
      groupId: 'sqlite-bad-draft',
      category: 'broken',
      heroImage: '/assets/blog/unraid-layout.svg',
      updatedAt: '2026-05-23',
      tagIdsJson: '{not-json',
      published: 0,
      status: 'draft',
      series: null,
      slugZh: 'sqlite-bad-draft',
      titleZh: 'Bad Draft',
      summaryZh: 'Hidden malformed row.',
      bodyZh: '',
      slugEn: null,
      titleEn: null,
      summaryEn: null,
      bodyEn: null,
    });
  }

  db.close();
  return dbPath;
}

function createTempDatabasePath() {
  return mkdtempSync(join(tmpdir(), 'resume-blog-'));
}

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
    body: '## Body',
    source: 'md',
    ...overrides,
  };
}

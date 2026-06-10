import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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
    const aliases = [
      [
        '什么是架构-顶层设计-模块-组件与三大原则',
        'what-is-architecture-top-level-design-modules-components-and-three-principles',
      ],
      [
        '计算机为什么能跑程序-组成原理-存储-链接与并发',
        'why-computers-can-run-programs-components-storage-linking-concurrency',
      ],
      [
        '数据结构与算法为什么重要-从数组-链表到排序与哈希',
        'why-data-structures-and-algorithms-matter-arrays-lists-sorting-hash',
      ],
      [
        '面向对象与设计原则-从封装-继承到代码坏味道',
        'object-orientation-and-design-principles-encapsulation-inheritance-code-smells',
      ],
      [
        '工程协作与交付-git-需求分析与估算',
        'engineering-collaboration-and-delivery-git-requirements-analysis-and-estimation',
      ],
    ] as const;
    const source = sourceWithPosts(
      aliases.map(([, canonicalSlug]) =>
        blogPost({
          slug: canonicalSlug,
          title: `Target for ${canonicalSlug}`,
        }),
      ),
    );

    for (const [legacySlug, canonicalSlug] of aliases) {
      const detail = getBlogPost('zh', legacySlug, [source]);

      expect(detail?.item.slug).toBe(canonicalSlug);
      expect(detail?.item.title).toBe(`Target for ${canonicalSlug}`);
    }
  });

  it('resolves old combined dotnet article slugs to split article slugs', () => {
    const aliases = [
      [
        'clr-and-csharp-type-system-objects-heap-and-garbage-collection',
        'csharp-value-types-reference-types-and-object-semantics',
      ],
      [
        'thread-concurrency-and-synchronization-thread-costs-to-deadlock-governance',
        'dotnet-thread-costs-threadpool-and-async-boundaries',
      ],
      [
        'dotnet-application-architecture-dependency-injection-mediatr-aop-and-resilience',
        'aspnet-core-dependency-injection-lifetimes',
      ],
      [
        'service-communication-and-authentication-from-tcp-wcf-to-grpc-and-jwt',
        'tcp-connection-lifecycle-handshake-and-teardown',
      ],
      [
        'dotnet-engineering-toolchain-cli-and-package-management-practices',
        'dotnet-cli-daily-development-workflow',
      ],
    ] as const;
    const source = sourceWithPosts(
      aliases.map(([, canonicalSlug]) =>
        blogPost({
          slug: canonicalSlug,
          title: `Target for ${canonicalSlug}`,
        }),
      ),
    );

    for (const [legacySlug, canonicalSlug] of aliases) {
      const detail = getBlogPost('zh', legacySlug, [source]);

      expect(detail?.item.slug).toBe(canonicalSlug);
      expect(detail?.item.title).toBe(`Target for ${canonicalSlug}`);
    }
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

    const sourceConfigs = createBlogDraftFixtureSources();

    const result = importBlogDraftsIntoSqlite({ dbPath, sourceConfigs });
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
      const sourceConfigs = createBlogDraftFixtureSources();
      importBlogDraftsIntoSqlite({ dbPath, sourceConfigs });
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

  it('migrates legacy sqlite posts without a category column', async () => {
    // @ts-expect-error - the import script is a runtime-only helper.
    const { importBlogDraftsIntoSqlite } = await import('../scripts/import-blog-md-to-sqlite.mjs');
    const dir = createTempDatabasePath();
    tempDirs.push(dir);
    const dbPath = join(dir, 'blog.sqlite');
    const db = new Database(dbPath);

    db.exec(`
      create table blog_posts (
        id text primary key,
        slug text not null,
        locale text not null,
        title text not null,
        summary text not null,
        hero_image text not null,
        updated_at text not null,
        tags_json text not null,
        published integer not null,
        status text not null,
        series text,
        body text not null
      );
      create unique index blog_posts_locale_slug_idx on blog_posts(locale, slug);
    `);
    db.prepare(`
      insert into blog_posts (
        id, slug, locale, title, summary, hero_image, updated_at, tags_json, published, status, series, body
      ) values (
        @id, @slug, @locale, @title, @summary, @heroImage, @updatedAt, @tagsJson, @published, @status, @series, @body
      )
    `).run({
      id: 'legacy-post',
      slug: 'legacy-post',
      locale: 'zh',
      title: 'Legacy Post',
      summary: 'Legacy row without category.',
      heroImage: '/assets/blog/unraid-layout.svg',
      updatedAt: '2026-05-24',
      tagsJson: JSON.stringify(['Blog']),
      published: 1,
      status: 'published',
      series: null,
      body: '## Legacy body',
    });
    db.close();

    importBlogDraftsIntoSqlite({ dbPath, sourceConfigs: [] });

    const posts = readSqliteBlogPosts(dbPath);
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      slug: 'legacy-post',
      category: 'uncategorized',
      title: 'Legacy Post',
    });
  });

  it('does not merge hidden legacy locales into published localized rows', async () => {
    // @ts-expect-error - the import script is a runtime-only helper.
    const { importBlogDraftsIntoSqlite } = await import('../scripts/import-blog-md-to-sqlite.mjs');
    const dir = createTempDatabasePath();
    tempDirs.push(dir);
    const dbPath = join(dir, 'blog.sqlite');
    const db = new Database(dbPath);

    db.exec(`
      create table blog_posts (
        id text primary key,
        slug text not null,
        locale text not null,
        title text not null,
        summary text not null,
        category text not null,
        hero_image text not null,
        updated_at text not null,
        tags_json text not null,
        published integer not null,
        status text not null,
        series text,
        body text not null
      );
      create unique index blog_posts_locale_slug_idx on blog_posts(locale, slug);
    `);
    const insert = db.prepare(`
      insert into blog_posts (
        id, slug, locale, title, summary, category, hero_image, updated_at, tags_json, published, status, series, body
      ) values (
        @id, @slug, @locale, @title, @summary, @category, @heroImage, @updatedAt, @tagsJson, @published, @status, @series, @body
      )
    `);
    insert.run({
      id: 'legacy-shared-zh',
      slug: 'legacy-shared',
      locale: 'zh',
      title: 'Legacy Shared ZH',
      summary: 'Published Chinese row.',
      category: 'legacy',
      heroImage: '/assets/blog/unraid-layout.svg',
      updatedAt: '2026-05-24',
      tagsJson: JSON.stringify(['Blog']),
      published: 1,
      status: 'published',
      series: null,
      body: '## Public zh body',
    });
    insert.run({
      id: 'legacy-shared-en',
      slug: 'legacy-shared',
      locale: 'en',
      title: 'Legacy Shared EN Draft',
      summary: 'Draft English row.',
      category: 'legacy',
      heroImage: '/assets/blog/unraid-layout.svg',
      updatedAt: '2026-05-24',
      tagsJson: JSON.stringify(['Blog']),
      published: 0,
      status: 'draft',
      series: null,
      body: '## Hidden en body',
    });
    db.close();

    importBlogDraftsIntoSqlite({ dbPath, sourceConfigs: [] });

    const posts = readSqliteBlogPosts(dbPath);
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      slug: 'legacy-shared',
      locale: 'zh',
      title: 'Legacy Shared ZH',
    });

    const migratedDb = new Database(dbPath);
    const rows = migratedDb
      .prepare('select group_id, published, status, slug_zh, slug_en from blog_posts order by group_id')
      .all();
    migratedDb.close();

    expect(rows).toEqual([
      {
        group_id: 'legacy-shared',
        published: 1,
        status: 'published',
        slug_zh: 'legacy-shared',
        slug_en: null,
      },
      {
        group_id: 'legacy-shared-en-hidden',
        published: 0,
        status: 'draft',
        slug_zh: null,
        slug_en: 'legacy-shared',
      },
    ]);
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

function createBlogDraftFixtureSources() {
  const root = createTempDatabasePath();
  tempDirs.push(root);
  const categories = [
    { category: 'microservices-ddd', count: 3, series: 'microservices-ddd', tags: ['Microservices', 'DDD'] },
    { category: 'extreme-programming', count: 4, series: 'extreme-programming', tags: ['TDD', 'Refactoring'] },
    { category: 'architecture', count: 4, series: 'architecture', tags: ['Architecture', 'System Design'] },
    { category: 'fundamentals', count: 4, series: 'fundamentals', tags: ['Algorithm', 'Programming'] },
  ];
  let index = 0;

  return categories.map((item) => {
    const dir = join(root, item.category);
    mkdirSync(dir, { recursive: true });

    for (let offset = 0; offset < item.count; offset += 1) {
      index += 1;
      writeFileSync(
        join(dir, `${String(index).padStart(2, '0')}-fixture-${item.category}-${offset + 1}.md`),
        `---
title: Fixture ${item.category} ${offset + 1}
summary: Fixture summary for ${item.category} ${offset + 1}.
---

# Fixture ${item.category} ${offset + 1}

This is a committed test fixture generated in a temp directory.

## 原始来源

- C:\\Users\\hp\\drafts\\fixture.md
- https://example.com/source
`,
        'utf8',
      );
    }

    return {
      dir,
      category: item.category,
      heroImage: '/assets/blog/nx-monorepo.svg',
      series: item.series,
      tags: item.tags,
    };
  });
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

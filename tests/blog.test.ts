import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { afterEach, describe, expect, it } from 'vitest';
import { parseBlogMarkdown } from '@/lib/blog/markdown-source';
import {
  getBlogPost,
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
      tags: ['Markdown', 'Blog'],
      source: 'md',
      series: 'static-notes',
    });
    expect(post.body).toContain('Markdown content.');
  });

  it('maps sqlite rows into unified blog posts', () => {
    const dbPath = createBlogDatabase();

    const posts = readSqliteBlogPosts(dbPath);

    expect(posts).toHaveLength(2);
    expect(posts[0]).toMatchObject({
      id: 'sqlite-1',
      slug: 'sqlite-post',
      locale: 'zh',
      title: 'SQLite Post',
      heroImage: '/assets/blog/unraid-layout.svg',
      updatedAt: '2026-05-21',
      tags: ['SQLite', 'Runtime'],
      published: true,
      status: 'published',
      source: 'sqlite',
    });
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
});

function createBlogDatabase() {
  const dir = mkdtempSync(join(tmpdir(), 'resume-blog-'));
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

  const insert = db.prepare(`
    insert into blog_posts (
      id, slug, locale, title, summary, hero_image, updated_at, tags_json, published, status, series, body
    ) values (
      @id, @slug, @locale, @title, @summary, @heroImage, @updatedAt, @tagsJson, @published, @status, @series, @body
    )
  `);

  insert.run({
    id: 'sqlite-1',
    slug: 'sqlite-post',
    locale: 'zh',
    title: 'SQLite Post',
    summary: 'Loaded at runtime.',
    heroImage: '/assets/blog/unraid-layout.svg',
    updatedAt: '2026-05-21',
    tagsJson: JSON.stringify(['SQLite', 'Runtime']),
    published: 1,
    status: 'published',
    series: 'runtime-notes',
    body: '## SQLite body',
  });
  insert.run({
    id: 'sqlite-2',
    slug: 'sqlite-draft',
    locale: 'zh',
    title: 'SQLite Draft',
    summary: 'Draft row.',
    heroImage: '/assets/blog/unraid-layout.svg',
    updatedAt: '2026-05-22',
    tagsJson: JSON.stringify(['SQLite']),
    published: 0,
    status: 'draft',
    series: null,
    body: '## Draft body',
  });

  db.close();
  return dbPath;
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
    heroImage: '/assets/blog/unraid-layout.svg',
    updatedAt: '2026-05-01',
    tags: ['Blog'],
    published: true,
    status: 'published',
    body: '## Body',
    source: 'md',
    ...overrides,
  };
}

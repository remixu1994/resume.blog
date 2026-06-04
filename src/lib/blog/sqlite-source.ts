import { existsSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { blogPostSchema, sqliteBlogPostRowSchema, type SqliteBlogPostRow } from './schema';
import type { BlogPost, BlogContentSource } from './types';

const DEFAULT_DB_PATH = 'data/blog.sqlite';

export function createSqliteBlogSource(dbPath = getBlogDatabasePath()): BlogContentSource {
  return {
    listPosts: () => readSqliteBlogPosts(dbPath),
  };
}

export function getBlogDatabasePath() {
  return process.env.BLOG_DB_PATH || join(process.cwd(), DEFAULT_DB_PATH);
}

export function readSqliteBlogPosts(dbPath = getBlogDatabasePath()): BlogPost[] {
  if (!existsSync(dbPath)) return [];

  const db = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    const rows = db
      .prepare(
        `select id,
                slug,
                locale,
                title,
                summary,
                hero_image,
                updated_at,
                tags_json,
                published,
                status,
                series,
                body
           from blog_posts`,
      )
      .all();

    return rows.map(mapSqliteBlogPostRow);
  } finally {
    db.close();
  }
}

export function mapSqliteBlogPostRow(row: unknown): BlogPost {
  const parsed = sqliteBlogPostRowSchema.parse(row);
  return blogPostSchema.parse({
    id: parsed.id,
    slug: parsed.slug,
    locale: parsed.locale,
    title: parsed.title,
    summary: parsed.summary,
    heroImage: parsed.hero_image,
    updatedAt: parsed.updated_at,
    tags: parseTags(parsed),
    published: Boolean(parsed.published),
    status: parsed.status,
    series: parsed.series || undefined,
    body: parsed.body,
    source: 'sqlite',
  });
}

function parseTags(row: SqliteBlogPostRow) {
  const value = JSON.parse(row.tags_json);
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid tags_json for blog post ${row.id}`);
  }

  return value;
}

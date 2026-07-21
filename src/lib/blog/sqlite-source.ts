import { existsSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { blogPostSchema, sqliteBlogPostRowSchema, type SqliteBlogPostRow } from './schema';
import { tagIdsToLabels } from './tags';
import type { BlogPost, BlogContentSource } from './types';
import type { Locale } from '@devfolio-blog/shared-types';

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
                group_id,
                category,
                hero_image,
                updated_at,
                tag_ids_json,
                published,
                status,
                series,
                slug_zh,
                title_zh,
                summary_zh,
                body_zh,
                slug_en,
                title_en,
                summary_en,
                body_en
           from blog_posts
          where published = 1
            and status = 'published'`,
      )
      .all();

    return rows.flatMap((row) => mapSqliteBlogPostRow(row));
  } finally {
    db.close();
  }
}

export function mapSqliteBlogPostRow(row: unknown, source: BlogPost['source'] = 'sqlite'): BlogPost[] {
  const parsed = sqliteBlogPostRowSchema.parse(row);
  return (['zh', 'en'] as const)
    .map((locale) => mapLocalizedSqliteBlogPostRow(parsed, locale, source))
    .filter((post): post is BlogPost => Boolean(post));
}

function mapLocalizedSqliteBlogPostRow(
  row: SqliteBlogPostRow,
  locale: Locale,
  source: BlogPost['source'],
): BlogPost | null {
  const slug = locale === 'zh' ? row.slug_zh : row.slug_en;
  const title = locale === 'zh' ? row.title_zh : row.title_en;
  const summary = locale === 'zh' ? row.summary_zh : row.summary_en;
  const body = locale === 'zh' ? row.body_zh : row.body_en;
  if (!slug || !title || !summary || !body) return null;

  const tagIds = parseTagIds(row);
  return blogPostSchema.parse({
    id: `${row.group_id}:${locale}`,
    slug,
    locale,
    title,
    summary,
    heroImage: row.hero_image,
    updatedAt: row.updated_at,
    category: row.category,
    tags: tagIdsToLabels(tagIds, locale),
    tagIds,
    published: Boolean(row.published),
    status: row.status,
    series: row.series || undefined,
    body,
    source,
  });
}

function parseTagIds(row: SqliteBlogPostRow) {
  const value = JSON.parse(row.tag_ids_json);
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid tag_ids_json for blog post ${row.id}`);
  }

  return value;
}

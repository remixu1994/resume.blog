import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import { getBlogDatabaseConfig } from './database-config';
import { mapSqliteBlogPostRow } from './sqlite-source';
import type { BlogContentSource, BlogPost } from './types';

const publicPostsQuery = `select id,
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
                            where published = true
                              and status = 'published'`;

declare global {
  var blogPostgresPool: Pool | undefined;
  var blogPostgresUrl: string | undefined;
  var blogMysqlPool: mysql.Pool | undefined;
  var blogMysqlUrl: string | undefined;
}

export function createRemoteBlogSource(config = getBlogDatabaseConfig()): BlogContentSource {
  if (config.provider === 'sqlite') {
    throw new Error('createRemoteBlogSource requires a postgres or mysql configuration.');
  }

  return {
    listPosts: () => readRemoteBlogPosts(config),
  };
}

export async function readRemoteBlogPosts(config = getBlogDatabaseConfig()): Promise<BlogPost[]> {
  if (config.provider === 'postgres') {
    const result = await getPostgresPool(config.url).query(publicPostsQuery);
    return result.rows.flatMap((row) => mapSqliteBlogPostRow(row, 'database'));
  }

  if (config.provider === 'mysql') {
    const [rows] = await getMysqlPool(config.url).query(publicPostsQuery);
    return (rows as unknown[]).flatMap((row) => mapSqliteBlogPostRow(row, 'database'));
  }

  throw new Error('readRemoteBlogPosts requires a postgres or mysql configuration.');
}

export function getPostgresPool(url: string | undefined) {
  if (!url) throw new Error('BLOG_DATABASE_URL is required for PostgreSQL.');
  if (globalThis.blogPostgresPool && globalThis.blogPostgresUrl === url) {
    return globalThis.blogPostgresPool;
  }

  globalThis.blogPostgresPool?.end().catch(() => undefined);
  globalThis.blogPostgresPool = new Pool({ connectionString: url, max: 5 });
  globalThis.blogPostgresUrl = url;
  return globalThis.blogPostgresPool;
}

function getMysqlPool(url: string | undefined) {
  if (!url) throw new Error('BLOG_DATABASE_URL is required for MySQL.');
  if (globalThis.blogMysqlPool && globalThis.blogMysqlUrl === url) {
    return globalThis.blogMysqlPool;
  }

  globalThis.blogMysqlPool?.end().catch(() => undefined);
  globalThis.blogMysqlPool = mysql.createPool({ uri: url, connectionLimit: 5 });
  globalThis.blogMysqlUrl = url;
  return globalThis.blogMysqlPool;
}

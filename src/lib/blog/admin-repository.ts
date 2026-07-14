import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { getBlogDatabaseConfig } from './database-config';
import { getPostgresPool } from './remote-source';
import type { AdminBlogPost, AdminBlogPostInput } from './admin-schema';

type DatabaseClient = Pool | PoolClient;

export async function listAdminBlogPosts(database: DatabaseClient = getAdminPool()): Promise<AdminBlogPost[]> {
  const result = await database.query(`${adminSelect} order by updated_at desc`);
  return result.rows.map(mapAdminRow);
}

export async function getAdminBlogPost(id: string, database: DatabaseClient = getAdminPool()): Promise<AdminBlogPost | null> {
  const result = await database.query(`${adminSelect} where id = $1`, [id]);
  return result.rows[0] ? mapAdminRow(result.rows[0]) : null;
}

export async function createAdminBlogPost(input: AdminBlogPostInput, database: DatabaseClient = getAdminPool()) {
  const id = randomUUID();
  const now = new Date().toISOString();
  await database.query(
    `insert into blog_posts (
       id, group_id, category, hero_image, updated_at, tag_ids_json, published, status, series,
       slug_zh, title_zh, summary_zh, body_zh, slug_en, title_en, summary_en, body_en, created_at
     ) values ($1, $2, $3, $4, $5, $6, false, 'draft', $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    valuesForInsert(id, input, now),
  );
  return getAdminBlogPost(id, database);
}

export async function updateAdminBlogPost(id: string, input: AdminBlogPostInput, database: DatabaseClient = getAdminPool()) {
  const result = await database.query(
    `update blog_posts set
       category = $2, hero_image = $3, updated_at = $4, tag_ids_json = $5, series = $6,
       slug_zh = $7, title_zh = $8, summary_zh = $9, body_zh = $10,
       slug_en = $11, title_en = $12, summary_en = $13, body_en = $14
     where id = $1`,
    valuesForUpdate(id, input, new Date().toISOString()),
  );
  return result.rowCount ? getAdminBlogPost(id, database) : null;
}

export async function publishAdminBlogPost(id: string, input: AdminBlogPostInput, pool = getAdminPool()) {
  return inTransaction(pool, async (client) => {
    const updated = await updateAdminBlogPost(id, input, client);
    if (!updated) return null;
    const now = new Date().toISOString();
    await client.query(
      `update blog_posts set published = true, status = 'published',
                             published_at = $2::timestamptz, updated_at = $2::text
       where id = $1`,
      [id, now],
    );
    return getAdminBlogPost(id, client);
  });
}

export async function unpublishAdminBlogPost(id: string, database: DatabaseClient = getAdminPool()) {
  const result = await database.query(
    `update blog_posts set published = false, status = 'draft', updated_at = $2 where id = $1`,
    [id, new Date().toISOString()],
  );
  return result.rowCount ? getAdminBlogPost(id, database) : null;
}

export async function markAdminBlogPostPublished(id: string, database: DatabaseClient = getAdminPool()) {
  const now = new Date().toISOString();
  const result = await database.query(
    `update blog_posts set published = true, status = 'published',
                           published_at = $2::timestamptz, updated_at = $2::text
     where id = $1`,
    [id, now],
  );
  return result.rowCount ? getAdminBlogPost(id, database) : null;
}

export function getAdminPool() {
  const config = getBlogDatabaseConfig();
  if (config.provider !== 'postgres') throw new Error('Admin publishing requires BLOG_DB_PROVIDER=postgres.');
  return getPostgresPool(config.url);
}

async function inTransaction<T>(pool: Pool, work: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const result = await work(client);
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

function valuesForInsert(id: string, input: AdminBlogPostInput, now: string) {
  return [
    id, id, input.category, input.heroImage, now, JSON.stringify(input.tagIds), nullable(input.series),
    nullable(input.zh.slug), nullable(input.zh.title), nullable(input.zh.summary), nullable(input.zh.body),
    nullable(input.en.slug), nullable(input.en.title), nullable(input.en.summary), nullable(input.en.body), now,
  ];
}

function valuesForUpdate(id: string, input: AdminBlogPostInput, now: string) {
  return [
    id, input.category, input.heroImage, now, JSON.stringify(input.tagIds), nullable(input.series),
    nullable(input.zh.slug), nullable(input.zh.title), nullable(input.zh.summary), nullable(input.zh.body),
    nullable(input.en.slug), nullable(input.en.title), nullable(input.en.summary), nullable(input.en.body),
  ];
}

function mapAdminRow(row: Record<string, unknown>): AdminBlogPost {
  return {
    id: String(row.id),
    groupId: String(row.group_id),
    category: String(row.category),
    heroImage: String(row.hero_image),
    tagIds: parseTagIds(row.tag_ids_json),
    series: row.series ? String(row.series) : '',
    published: Boolean(row.published),
    status: row.status === 'published' ? 'published' : 'draft',
    createdAt: toIso(row.created_at),
    updatedAt: String(row.updated_at),
    publishedAt: row.published_at ? toIso(row.published_at) : null,
    zh: localized(row, 'zh'),
    en: localized(row, 'en'),
  };
}

function localized(row: Record<string, unknown>, locale: 'zh' | 'en') {
  return {
    slug: String(row[`slug_${locale}`] || ''),
    title: String(row[`title_${locale}`] || ''),
    summary: String(row[`summary_${locale}`] || ''),
    body: String(row[`body_${locale}`] || ''),
  };
}

function parseTagIds(value: unknown) {
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function nullable(value: string) {
  const normalized = value.trim();
  return normalized || null;
}

function toIso(value: unknown) {
  return value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();
}

const adminSelect = `select id, group_id, category, hero_image, updated_at, tag_ids_json, published,
                            status, series, slug_zh, title_zh, summary_zh, body_zh,
                            slug_en, title_en, summary_en, body_en, created_at, published_at
                       from blog_posts`;

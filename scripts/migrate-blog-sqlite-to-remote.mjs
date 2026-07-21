import { existsSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';
import { Pool } from 'pg';

const sqlitePath = process.env.BLOG_DB_PATH || join(process.cwd(), 'data', 'blog.sqlite');
const url = process.env.BLOG_DATABASE_URL?.trim();

async function main() {
  const provider = getProvider();

  if (!url) throw new Error('BLOG_DATABASE_URL is required to migrate blog content.');
  if (!existsSync(sqlitePath)) throw new Error(`SQLite blog database was not found: ${sqlitePath}`);

  const rows = readSqliteRows(sqlitePath);
  if (provider === 'postgres') {
    await migrateToPostgres(rows, url);
  } else {
    await migrateToMysql(rows, url);
  }

  console.log(`Migrated ${rows.length} blog post groups from ${sqlitePath} to ${provider}.`);
}

function getProvider() {
  const configured = process.env.BLOG_DB_PROVIDER?.trim().toLowerCase();
  if (configured === 'postgres' || configured === 'postgresql') return 'postgres';
  if (configured === 'mysql') return 'mysql';
  if (url?.startsWith('postgres://') || url?.startsWith('postgresql://')) return 'postgres';
  if (url?.startsWith('mysql://') || url?.startsWith('mysqls://')) return 'mysql';
  throw new Error('Set BLOG_DB_PROVIDER to postgres or mysql.');
}

function readSqliteRows(dbPath) {
  const db = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    return db.prepare(`select id, group_id, category, hero_image, updated_at, tag_ids_json,
                              published, status, series, slug_zh, title_zh, summary_zh, body_zh,
                              slug_en, title_en, summary_en, body_en
                         from blog_posts`).all();
  } finally {
    db.close();
  }
}

async function migrateToPostgres(rows, connectionString) {
  const pool = new Pool({ connectionString, max: 1 });
  try {
    for (const row of rows) {
      await pool.query(postgresUpsert, toValues(row));
    }
  } finally {
    await pool.end();
  }
}

async function migrateToMysql(rows, uri) {
  const pool = mysql.createPool({ uri, connectionLimit: 1 });
  try {
    for (const row of rows) {
      await pool.query(mysqlUpsert, toValues(row));
    }
  } finally {
    await pool.end();
  }
}

function toValues(row) {
  return [
    row.id,
    row.group_id,
    row.category,
    row.hero_image,
    row.updated_at,
    row.tag_ids_json,
    Boolean(row.published),
    row.status,
    row.series,
    row.slug_zh,
    row.title_zh,
    row.summary_zh,
    row.body_zh,
    row.slug_en,
    row.title_en,
    row.summary_en,
    row.body_en,
  ];
}

const columns = `id, group_id, category, hero_image, updated_at, tag_ids_json, published, status, series,
                 slug_zh, title_zh, summary_zh, body_zh, slug_en, title_en, summary_en, body_en`;

const postgresUpsert = `insert into blog_posts (${columns})
  values (${Array.from({ length: 17 }, (_, index) => `$${index + 1}`).join(', ')})
  on conflict (group_id) do update set
    id = excluded.id, category = excluded.category, hero_image = excluded.hero_image,
    updated_at = excluded.updated_at, tag_ids_json = excluded.tag_ids_json,
    published = excluded.published, status = excluded.status, series = excluded.series,
    slug_zh = excluded.slug_zh, title_zh = excluded.title_zh, summary_zh = excluded.summary_zh,
    body_zh = excluded.body_zh, slug_en = excluded.slug_en, title_en = excluded.title_en,
    summary_en = excluded.summary_en, body_en = excluded.body_en`;

const mysqlUpsert = `insert into blog_posts (${columns})
  values (${Array.from({ length: 17 }, () => '?').join(', ')})
  on duplicate key update
    id = values(id), category = values(category), hero_image = values(hero_image),
    updated_at = values(updated_at), tag_ids_json = values(tag_ids_json),
    published = values(published), status = values(status), series = values(series),
    slug_zh = values(slug_zh), title_zh = values(title_zh), summary_zh = values(summary_zh),
    body_zh = values(body_zh), slug_en = values(slug_en), title_en = values(title_en),
    summary_en = values(summary_en), body_en = values(body_en)`;

await main();

import { Pool } from 'pg';

const url = process.env.BLOG_DATABASE_URL?.trim();
const provider = process.env.BLOG_DB_PROVIDER?.trim().toLowerCase();

if (!url) throw new Error('BLOG_DATABASE_URL is required to migrate the blog schema.');
if (provider && provider !== 'postgres' && provider !== 'postgresql') {
  throw new Error('Admin publishing schema migrations currently support PostgreSQL only.');
}
if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
  throw new Error('BLOG_DATABASE_URL must be a PostgreSQL connection URL.');
}

const migrations = [
  {
    id: '001_blog_posts',
    statements: [
      `create table if not exists blog_posts (
        id text primary key,
        group_id text not null unique,
        category text not null default 'uncategorized',
        hero_image text not null default '/assets/blog/nx-monorepo.svg',
        updated_at text not null,
        tag_ids_json text not null default '[]',
        published boolean not null default false,
        status text not null default 'draft',
        series text,
        slug_zh text,
        title_zh text,
        summary_zh text,
        body_zh text,
        slug_en text,
        title_en text,
        summary_en text,
        body_en text
      )`,
      'create unique index if not exists blog_posts_slug_zh_idx on blog_posts(slug_zh) where slug_zh is not null',
      'create unique index if not exists blog_posts_slug_en_idx on blog_posts(slug_en) where slug_en is not null',
    ],
  },
  {
    id: '002_admin_publishing',
    statements: [
      'alter table blog_posts add column if not exists created_at timestamptz not null default now()',
      'alter table blog_posts add column if not exists published_at timestamptz',
      `create table if not exists blog_assets (
        id text primary key,
        object_key text not null unique,
        public_url text not null unique,
        content_type text not null,
        size_bytes integer not null,
        status text not null default 'pending',
        created_at timestamptz not null default now(),
        ready_at timestamptz
      )`,
      'create index if not exists blog_assets_status_idx on blog_assets(status, created_at desc)',
    ],
  },
  {
    id: '003_external_blog_api',
    statements: [
      `create table if not exists blog_api_idempotency (
        idempotency_key varchar(128) primary key,
        request_hash char(64) not null,
        post_id text not null references blog_posts(id) on delete cascade,
        created_at timestamptz not null default now()
      )`,
      'create index if not exists blog_api_idempotency_created_at_idx on blog_api_idempotency(created_at desc)',
    ],
  },
];

const pool = new Pool({ connectionString: url, max: 1 });
try {
  await pool.query(`create table if not exists blog_schema_migrations (
    id text primary key,
    applied_at timestamptz not null default now()
  )`);

  for (const migration of migrations) {
    const existing = await pool.query('select 1 from blog_schema_migrations where id = $1', [migration.id]);
    if (existing.rowCount) continue;

    const client = await pool.connect();
    try {
      await client.query('begin');
      for (const statement of migration.statements) await client.query(statement);
      await client.query('insert into blog_schema_migrations (id) values ($1)', [migration.id]);
      await client.query('commit');
      console.log(`Applied ${migration.id}`);
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}

console.log('Blog PostgreSQL schema is ready.');

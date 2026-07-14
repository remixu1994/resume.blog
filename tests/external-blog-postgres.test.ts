import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { externalBlogPostInputSchema } from '@/lib/blog/admin-schema';
import { createExternalBlogPost, ExternalBlogApiError } from '@/lib/blog/external-create';

const databaseUrl = process.env.TEST_BLOG_DATABASE_URL;
const integration = describe.skipIf(!databaseUrl);
let pool: Pool;

integration('external blog PostgreSQL integration', () => {
  beforeAll(async () => {
    pool = new Pool({ connectionString: databaseUrl, max: 4 });
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await pool.end();
  });

  it('replays the same normalized request and rejects a changed payload', async () => {
    const suffix = uniqueSuffix();
    const key = `vitest-replay-${suffix}`;
    const input = draftInput(suffix);
    const first = await createExternalBlogPost(input, key, pool);
    const replay = await createExternalBlogPost(input, key, pool);

    expect(first.replayed).toBe(false);
    expect(replay.replayed).toBe(true);
    expect(replay.item.id).toBe(first.item.id);

    await expect(createExternalBlogPost({ ...input, category: 'changed' }, key, pool)).rejects.toMatchObject({
      code: 'IDEMPOTENCY_CONFLICT', status: 409,
    } satisfies Partial<ExternalBlogApiError>);
  });

  it('serializes concurrent requests into one blog post', async () => {
    const suffix = uniqueSuffix();
    const key = `vitest-concurrent-${suffix}`;
    const input = draftInput(suffix);
    const results = await Promise.all([
      createExternalBlogPost(input, key, pool),
      createExternalBlogPost(input, key, pool),
    ]);

    expect(new Set(results.map((result) => result.item.id)).size).toBe(1);
    expect(results.filter((result) => result.replayed).length).toBe(1);
    const count = await pool.query('select count(*)::int as count from blog_posts where id = $1', [results[0].item.id]);
    expect(count.rows[0].count).toBe(1);
  });

  it('creates a complete bilingual post as published atomically', async () => {
    const suffix = uniqueSuffix();
    const input = externalBlogPostInputSchema.parse({
      ...draftInput(suffix),
      status: 'published',
      zh: { slug: `zh-${suffix}`, title: '中文 API 测试', summary: '中文摘要', body: '# 中文正文' },
      en: { slug: `en-${suffix}`, title: 'External API test', summary: 'English summary', body: '# English body' },
    });
    const result = await createExternalBlogPost(input, `vitest-published-${suffix}`, pool);
    const row = await pool.query('select published, status, published_at from blog_posts where id = $1', [result.item.id]);

    expect(result.item.status).toBe('published');
    expect(row.rows[0].published).toBe(true);
    expect(row.rows[0].status).toBe('published');
    expect(row.rows[0].published_at).toBeTruthy();
  });

  it('rejects unregistered published assets without creating a post', async () => {
    const suffix = uniqueSuffix();
    const input = externalBlogPostInputSchema.parse({
      ...draftInput(suffix),
      status: 'published',
      heroImage: 'https://invalid.example/hero.png',
      zh: { slug: `asset-zh-${suffix}`, title: 'Asset test', summary: 'Summary', body: '# Body' },
      en: { slug: `asset-en-${suffix}`, title: 'Asset test', summary: 'Summary', body: '# Body' },
    });

    await expect(createExternalBlogPost(input, `vitest-asset-${suffix}`, pool)).rejects.toMatchObject({
      code: 'INVALID_ASSET', status: 400,
    });
    const count = await pool.query('select count(*)::int as count from blog_posts where slug_zh = $1', [input.zh.slug]);
    expect(count.rows[0].count).toBe(0);
  });

  it('preserves PostgreSQL slug uniqueness for separate requests', async () => {
    const suffix = uniqueSuffix();
    const first = draftInput(suffix);
    await createExternalBlogPost(first, `vitest-slug-first-${suffix}`, pool);
    await expect(createExternalBlogPost(
      { ...draftInput(`${suffix}b`), zh: { ...first.zh } },
      `vitest-slug-second-${suffix}`,
      pool,
    )).rejects.toMatchObject({ code: '23505' });
  });
});

function draftInput(suffix: string) {
  return externalBlogPostInputSchema.parse({
    status: 'draft',
    category: 'integration-test',
    heroImage: '/assets/blog/nx-monorepo.svg',
    tagIds: ['api'],
    series: 'vitest-external-api',
    zh: { slug: `draft-zh-${suffix}` },
    en: { slug: `draft-en-${suffix}` },
  });
}

function uniqueSuffix() {
  return randomUUID().replaceAll('-', '');
}

async function cleanup() {
  await pool.query("delete from blog_posts where series = 'vitest-external-api'");
}

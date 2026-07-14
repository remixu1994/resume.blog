import { createHash } from 'node:crypto';
import type { Pool } from 'pg';
import { createAdminBlogPost, getAdminBlogPost, getAdminPool, markAdminBlogPostPublished } from './admin-repository';
import type { ExternalBlogPostInput } from './admin-schema';
import { findInvalidBlogAssetUrl } from './assets';

export type ExternalBlogApiErrorCode = 'IDEMPOTENCY_CONFLICT' | 'INVALID_ASSET';

export class ExternalBlogApiError extends Error {
  constructor(
    public readonly code: ExternalBlogApiErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ExternalBlogApiError';
  }
}

export async function createExternalBlogPost(
  input: ExternalBlogPostInput,
  idempotencyKey: string,
  pool: Pool = getAdminPool(),
) {
  const requestHash = hashExternalBlogRequest(input);
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query('select pg_advisory_xact_lock(hashtextextended($1, 0))', [idempotencyKey]);

    const existing = await client.query(
      'select request_hash, post_id from blog_api_idempotency where idempotency_key = $1',
      [idempotencyKey],
    );
    if (existing.rows[0]) {
      if (existing.rows[0].request_hash !== requestHash) {
        throw new ExternalBlogApiError(
          'IDEMPOTENCY_CONFLICT',
          'The Idempotency-Key was already used with a different request.',
          409,
        );
      }
      const item = await getAdminBlogPost(String(existing.rows[0].post_id), client);
      if (!item) throw new Error('The idempotency record references a missing blog post.');
      await client.query('commit');
      return { item, replayed: true };
    }

    if (input.status === 'published') {
      const invalidAsset = await findInvalidBlogAssetUrl(input.heroImage, [input.zh.body, input.en.body], client);
      if (invalidAsset) {
        throw new ExternalBlogApiError(
          'INVALID_ASSET',
          `Image is not an existing asset or completed upload: ${invalidAsset}`,
          400,
        );
      }
    }

    const { status, ...postInput } = input;
    let item = await createAdminBlogPost(postInput, client);
    if (!item) throw new Error('The created blog post could not be loaded.');
    if (status === 'published') {
      item = await markAdminBlogPostPublished(item.id, client);
      if (!item) throw new Error('The created blog post could not be published.');
    }

    await client.query(
      `insert into blog_api_idempotency (idempotency_key, request_hash, post_id)
       values ($1, $2, $3)`,
      [idempotencyKey, requestHash, item.id],
    );
    await client.query('commit');
    return { item, replayed: false };
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export function hashExternalBlogRequest(input: ExternalBlogPostInput) {
  return createHash('sha256').update(stableStringify(input)).digest('hex');
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

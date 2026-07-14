import { afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/blog/posts/route';
import { handleExternalApiError } from '@/lib/blog/external-api-errors';
import { ExternalBlogApiError } from '@/lib/blog/external-create';

const originalEnv = { ...process.env };
const token = 'external-route-test-token-with-32-characters';

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('external blog route guards', () => {
  it('returns service unavailable when API tokens are not configured', async () => {
    delete process.env.ADMIN_API_TOKENS;
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe('SERVICE_UNAVAILABLE');
  });

  it('rejects invalid bearer credentials', async () => {
    process.env.ADMIN_API_TOKENS = token;
    const response = await POST(request({ authorization: 'Bearer invalid' }));
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe('UNAUTHORIZED');
  });

  it('requires a valid idempotency key before parsing the body', async () => {
    process.env.ADMIN_API_TOKENS = token;
    const response = await POST(request({ authorization: `Bearer ${token}` }));
    expect(response.status).toBe(400);
    expect((await response.json()).error.fields.idempotencyKey).toBeDefined();
  });

  it('returns INVALID_JSON for malformed JSON', async () => {
    process.env.ADMIN_API_TOKENS = token;
    const response = await POST(request({
      authorization: `Bearer ${token}`,
      'idempotency-key': 'route-test-001',
    }, '{'));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('INVALID_JSON');
  });

  it('maps stable conflict, asset, and database availability errors', async () => {
    const slugConflict = handleExternalApiError({ code: '23505' });
    expect(slugConflict.status).toBe(409);
    expect((await slugConflict.json()).error.code).toBe('SLUG_CONFLICT');

    const invalidAsset = handleExternalApiError(new ExternalBlogApiError('INVALID_ASSET', 'Invalid asset.', 400));
    expect(invalidAsset.status).toBe(400);
    expect((await invalidAsset.json()).error.code).toBe('INVALID_ASSET');

    const unavailable = handleExternalApiError(Object.assign(new Error('connection failed'), { code: 'ECONNREFUSED' }));
    expect(unavailable.status).toBe(503);
    expect((await unavailable.json()).error.code).toBe('SERVICE_UNAVAILABLE');
  });
});

function request(headers: Record<string, string> = {}, body = '{}') {
  return new NextRequest('http://localhost/api/v1/blog/posts', { method: 'POST', headers, body });
}

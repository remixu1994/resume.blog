import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/admin/api';
import { authenticateAdminApiToken } from '@/lib/admin/api-token';
import { externalBlogPostInputSchema, idempotencyKeySchema } from '@/lib/blog/admin-schema';
import { handleExternalApiError } from '@/lib/blog/external-api-errors';
import { createExternalBlogPost } from '@/lib/blog/external-create';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = authenticateAdminApiToken(request.headers.get('authorization'));
  if (auth === 'unavailable') {
    return apiError('SERVICE_UNAVAILABLE', 'The external blog API is not configured.', 503);
  }
  if (auth !== 'authenticated') {
    return apiError('UNAUTHORIZED', 'A valid Bearer token is required.', 401);
  }

  const idempotencyResult = idempotencyKeySchema.safeParse(request.headers.get('idempotency-key'));
  if (!idempotencyResult.success) {
    return apiError('VALIDATION_ERROR', 'A valid Idempotency-Key header is required.', 400, {
      idempotencyKey: idempotencyResult.error.issues.map((issue) => issue.message),
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return apiError('INVALID_JSON', 'The request body must contain valid JSON.', 400);
  }

  try {
    const input = externalBlogPostInputSchema.parse(payload);
    const result = await createExternalBlogPost(input, idempotencyResult.data);
    const response = NextResponse.json({ item: result.item }, { status: result.replayed ? 200 : 201 });
    if (result.replayed) response.headers.set('Idempotency-Replayed', 'true');
    return response;
  } catch (error) {
    return handleExternalApiError(error);
  }
}

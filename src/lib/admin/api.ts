import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getAdminSession, isSameOriginRequest } from './auth';

export function requireAdmin(request: NextRequest, options: { write?: boolean } = {}) {
  const session = getAdminSession(request);
  if (!session) return { response: apiError('UNAUTHORIZED', 'Admin authentication is required.', 401) };
  if (options.write && !isSameOriginRequest(request)) {
    return { response: apiError('INVALID_ORIGIN', 'The request origin is not allowed.', 403) };
  }
  return { session };
}

export function apiError(code: string, message: string, status: number, fields?: Record<string, string[] | undefined>) {
  return NextResponse.json({ error: { code, message, fields } }, { status });
}

export function handleAdminApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError('VALIDATION_ERROR', 'The submitted data is invalid.', 400, error.flatten().fieldErrors);
  }
  if (isDatabaseConflict(error)) return apiError('SLUG_CONFLICT', 'A post with this slug already exists.', 409);
  console.error('Admin blog API failed', error);
  return apiError('INTERNAL_ERROR', 'The request could not be completed.', 500);
}

function isDatabaseConflict(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}

import { ZodError } from 'zod';
import { apiError } from '@/lib/admin/api';
import { ExternalBlogApiError } from './external-create';

export function handleExternalApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError('VALIDATION_ERROR', 'The submitted data is invalid.', 400, error.flatten().fieldErrors);
  }
  if (error instanceof ExternalBlogApiError) return apiError(error.code, error.message, error.status);
  if (isDatabaseConflict(error)) return apiError('SLUG_CONFLICT', 'A post with this slug already exists.', 409);
  if (isDatabaseUnavailable(error)) {
    console.error('External blog API database unavailable', safeDatabaseError(error));
    return apiError('SERVICE_UNAVAILABLE', 'The blog database is temporarily unavailable.', 503);
  }
  console.error('External blog API failed', error);
  return apiError('INTERNAL_ERROR', 'The request could not be completed.', 500);
}

function isDatabaseConflict(error: unknown): error is { code: string } {
  return getErrorCode(error) === '23505';
}

function isDatabaseUnavailable(error: unknown) {
  const code = getErrorCode(error);
  return Boolean(code && (code.startsWith('08') || ['ECONNREFUSED', 'ETIMEDOUT', '57P01', '57P03', '53300'].includes(code)));
}

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
}

function safeDatabaseError(error: unknown) {
  return { code: getErrorCode(error), message: error instanceof Error ? error.message : 'Database error' };
}

import { NextRequest, NextResponse } from 'next/server';
import { apiError, handleAdminApiError } from '@/lib/admin/api';
import { createAdminSession, isSameOriginRequest, setAdminSessionCookie, validateAdminCredentials } from '@/lib/admin/auth';
import { loginInputSchema } from '@/lib/blog/admin-schema';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) return apiError('INVALID_ORIGIN', 'The request origin is not allowed.', 403);
    const input = loginInputSchema.parse(await request.json());
    if (!validateAdminCredentials(input.username, input.password)) {
      return apiError('INVALID_CREDENTIALS', 'The username or password is incorrect.', 401);
    }
    const response = NextResponse.json({ user: { username: input.username } });
    setAdminSessionCookie(response, createAdminSession(input.username));
    return response;
  } catch (error) {
    return handleAdminApiError(error);
  }
}

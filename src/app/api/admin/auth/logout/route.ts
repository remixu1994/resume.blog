import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/admin/api';
import { clearAdminSessionCookie, isSameOriginRequest } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return apiError('INVALID_ORIGIN', 'The request origin is not allowed.', 403);
  const response = NextResponse.json({ ok: true });
  clearAdminSessionCookie(response);
  return response;
}

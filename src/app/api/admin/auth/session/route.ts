import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/admin/api';
import { getAdminSession } from '@/lib/admin/auth';

export async function GET(request: NextRequest) {
  const session = getAdminSession(request);
  return session
    ? NextResponse.json({ user: { username: session.username }, expiresAt: session.expiresAt })
    : apiError('UNAUTHORIZED', 'Admin authentication is required.', 401);
}

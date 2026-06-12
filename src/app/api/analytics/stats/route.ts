import { type NextRequest, NextResponse } from 'next/server';
import { getAnalyticsStats } from '@/lib/analytics/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Protect with secret
  const secret = process.env.ANALYTICS_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Analytics not configured' }, { status: 503 });
  }

  const providedKey = request.headers.get('x-analytics-key');
  if (providedKey !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const daysParam = request.nextUrl.searchParams.get('days');
  const days = daysParam ? Math.min(Math.max(Number(daysParam), 1), 365) : 30;

  const stats = getAnalyticsStats(days);

  return NextResponse.json(stats);
}

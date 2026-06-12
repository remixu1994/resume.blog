import { createHash } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { trackPageView } from '@/lib/analytics/db';

export const runtime = 'nodejs';

function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, locale, referrer } = body as {
      path?: string;
      locale?: string;
      referrer?: string;
    };

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'path is required' }, { status: 400 });
    }

    // Extract country from CDN/proxy headers
    const country =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-country') ||
      '';

    // Hash IP and user-agent for privacy
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    trackPageView({
      path: path.slice(0, 500), // limit path length
      locale: locale?.slice(0, 10) || '',
      referrer: referrer?.slice(0, 500) || '',
      country: country.slice(0, 10),
      userAgentHash: hashValue(userAgent),
      ipHash: hashValue(ip),
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

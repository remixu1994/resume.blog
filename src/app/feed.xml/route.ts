import { buildRssFeed } from '@/lib/rss';

export const dynamic = 'force-dynamic';

export async function GET() {
  const xml = await buildRssFeed();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

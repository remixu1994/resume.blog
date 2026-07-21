import { buildRssFeed } from '@/lib/rss';
import { requireLocale } from '@/lib/locale';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const xml = await buildRssFeed(locale);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

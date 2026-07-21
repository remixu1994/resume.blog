import { NextRequest, NextResponse } from 'next/server';
import { normalizeLocale } from '@devfolio-blog/i18n';
import { searchBlogPosts } from '@/lib/blog/search';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q')?.trim() ?? '';
  const localeParam = searchParams.get('locale') ?? 'zh';
  const locale = normalizeLocale(localeParam);

  if (!q) {
    return NextResponse.json({ results: [], query: '', locale });
  }

  const results = await searchBlogPosts(q, locale);

  // Return results without body content (only search-relevant fields)
  const response = results.map(({ id, slug, locale: postLocale, title, summary, highlightedTitle, highlightedSummary, highlightedSnippet, category, heroImage, updatedAt, tags, series }) => ({
    id,
    slug,
    locale: postLocale,
    title,
    summary,
    highlightedTitle,
    highlightedSummary,
    highlightedSnippet,
    category,
    heroImage,
    updatedAt,
    tags,
    series,
  }));

  return NextResponse.json({
    results: response,
    query: q,
    locale,
    count: response.length,
  });
}

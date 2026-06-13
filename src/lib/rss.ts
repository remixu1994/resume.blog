import type { Locale } from '@devfolio-blog/shared-types';
import type { BlogPostSummary } from '@/lib/blog/types';
import { listBlogPosts } from '@/lib/blog/repository';
import { getSiteOrigin } from '@/lib/seo';
import { locales } from '@/lib/locale';

const FEED_TITLE = 'Remi Resume Blog';
const FEED_DESCRIPTION = 'Engineering practice, architecture thinking, and product exploration.';
const FEED_LANGUAGE_MAP: Record<Locale, string> = { zh: 'zh-cn', en: 'en' };

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822Date(isoDate: string): string {
  return new Date(isoDate).toUTCString();
}

function buildItemXml(post: BlogPostSummary, origin: string): string {
  const link = `${origin}/${post.locale}/blog/${post.slug}`;
  const pubDate = toRfc822Date(post.updatedAt);

  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(post.summary)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category)}</category>
    </item>`;
}

export function buildRssFeed(locale?: Locale): string {
  const origin = getSiteOrigin();
  const targetLocales = locale ? [locale] : locales;

  const allPosts = targetLocales
    .flatMap((loc) => listBlogPosts(loc))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const language = locale ? FEED_LANGUAGE_MAP[locale] : 'zh-cn';
  const feedLink = locale ? `${origin}/${locale}/feed.xml` : `${origin}/feed.xml`;
  const feedTitle = locale
    ? `${FEED_TITLE} (${locale.toUpperCase()})`
    : FEED_TITLE;

  const items = allPosts.map((post) => buildItemXml(post, origin)).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${escapeXml(origin)}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>${language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedLink)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

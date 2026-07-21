import { describe, expect, it } from 'vitest';
import { dynamic as globalFeedDynamic } from '@/app/feed.xml/route';
import { dynamic as localizedFeedDynamic } from '@/app/[locale]/feed.xml/route';
import { dynamic as sitemapDynamic, revalidate as sitemapRevalidate } from '@/app/sitemap';

describe('database-backed metadata routes', () => {
  it('generates feeds and the sitemap at request time', () => {
    expect(globalFeedDynamic).toBe('force-dynamic');
    expect(localizedFeedDynamic).toBe('force-dynamic');
    expect(sitemapDynamic).toBe('force-dynamic');
    expect(sitemapRevalidate).toBe(0);
  });
});

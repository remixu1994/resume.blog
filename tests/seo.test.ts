import { afterEach, describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import { generateMetadata as generateBlogListMetadata } from '@/app/[locale]/blog/page';
import { serializeJsonLd } from '@/components/json-ld';
import { getArchitectureCases, getTopicBySlug } from '@devfolio-blog/content-data';
import { listBlogPosts } from '@/lib/blog/repository';
import { listRecipes } from '@/lib/recipes';
import {
  buildMetadata,
  buildSitemapEntries,
  buildTopicJsonLd,
  buildTopicMetadata,
  getSiteOrigin,
  getSiteUrl,
} from '@/lib/seo';

const originalSiteUrl = process.env.SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.SITE_URL;
    return;
  }

  process.env.SITE_URL = originalSiteUrl;
});

describe('seo helpers', () => {
  it('builds localized metadata with canonical, alternates, and social cards', () => {
    process.env.SITE_URL = 'https://resume.example.com';

    const metadata = buildMetadata({
      locale: 'zh',
      title: '技术博客',
      description: '围绕工程效率与系统交付的技术文章。',
      path: '/zh/blog',
      alternatePaths: {
        en: '/en/blog',
      },
      imagePath: '/assets/blog/unraid-monitoring-dashboard.png',
    });

    expect(metadata.metadataBase?.toString()).toBe('https://resume.example.com/');
    expect(metadata.alternates?.canonical).toBe('/zh/blog');
    expect(metadata.alternates?.languages).toEqual({
      'zh-CN': '/zh/blog',
      en: '/en/blog',
      'x-default': '/zh/blog',
    });
    expect(metadata.openGraph?.images).toEqual([
      {
        alt: '技术博客',
        url: 'https://resume.example.com/assets/blog/unraid-monitoring-dashboard.png',
      },
    ]);
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: '技术博客',
      description: '围绕工程效率与系统交付的技术文章。',
    });
  });

  it('uses the production fallback site origin when SITE_URL is absent', () => {
    delete process.env.SITE_URL;

    expect(getSiteOrigin()).toBe('https://resume.blog');
  });

  it('normalizes the site origin when SITE_URL includes a trailing slash', () => {
    process.env.SITE_URL = 'https://resume.example.com/';

    expect(getSiteOrigin()).toBe('https://resume.example.com');
    expect(getSiteUrl('/zh/blog')).toBe('https://resume.example.com/zh/blog');
  });

  it('builds topic metadata with localized alternates and hero image', () => {
    process.env.SITE_URL = 'https://resume.example.com';

    const metadata = buildTopicMetadata('zh', 'unraid');

    expect(metadata).toBeTruthy();
    expect(metadata?.alternates?.canonical).toBe('/zh/unraid');
    expect(metadata?.alternates?.languages).toEqual({
      'zh-CN': '/zh/unraid',
      en: '/en/unraid',
      'x-default': '/zh/unraid',
    });
    expect(metadata?.openGraph).toHaveProperty('type', 'article');
    const ogImages = metadata?.openGraph?.images;
    const firstImage = Array.isArray(ogImages) ? ogImages[0] : ogImages;
    expect(firstImage).toMatchObject({
      url: 'https://resume.example.com/assets/topics/unraid.svg',
    });
  });

  it('builds topic JSON-LD with a canonical URL', () => {
    process.env.SITE_URL = 'https://resume.example.com';
    const topic = getTopicBySlug('zh', 'fitness-ai-agent');

    expect(topic).toBeTruthy();

    const jsonLd = buildTopicJsonLd('zh', 'fitness-ai-agent', topic!);

    expect(jsonLd).toMatchObject({
      '@type': 'TechArticle',
      headline: topic?.title,
      url: 'https://resume.example.com/zh/fitness',
      image: ['https://resume.example.com/assets/topics/fitness-agent.svg'],
    });
  });

  it('escapes unsafe characters in serialized JSON-LD payloads', () => {
    const serialized = serializeJsonLd({
      headline: '</script><script>alert(1)</script>',
      note: 'line\u2028break\u2029test',
    });

    expect(serialized).not.toContain('</script>');
    expect(serialized).toContain('\\u003c/script>\\u003cscript>alert(1)\\u003c/script>');
    expect(serialized).toContain('line\\u2028break\\u2029test');
  });

  it('marks filtered blog list pages as noindex to avoid duplicate category archives', async () => {
    const metadata = await generateBlogListMetadata({
      params: Promise.resolve({ locale: 'zh' }),
      searchParams: Promise.resolve({ category: 'architecture' }),
    });

    expect(metadata.alternates?.canonical).toBe('/zh/blog?category=architecture');
    expect(metadata.robots).toEqual({
      index: false,
      follow: true,
    });
  });

  it('builds sitemap entries for localized sections and content details', async () => {
    process.env.SITE_URL = 'https://resume.example.com';
    const entries = await buildSitemapEntries();

    const urls = new Set(entries.map((entry: (typeof entries)[number]) => entry.url));
    const zhArchitecture = getArchitectureCases('zh')[0];
    const zhTopic = getTopicBySlug('zh', 'unraid');
    const zhRecipe = listRecipes({ locale: 'zh' })[0];
    const zhPost = (await listBlogPosts('zh'))[0];

    expect(urls.has('https://resume.example.com/')).toBe(true);
    expect(urls.has('https://resume.example.com/zh')).toBe(true);
    expect(urls.has('https://resume.example.com/en')).toBe(true);
    expect(urls.has('https://resume.example.com/zh/blog')).toBe(true);
    expect(urls.has(`https://resume.example.com/zh/architecture/${zhArchitecture.slug}`)).toBe(true);
    expect(urls.has('https://resume.example.com/zh/unraid')).toBe(true);
    expect(urls.has(`https://resume.example.com/zh/recipes/${zhRecipe.slug}`)).toBe(true);
    expect(urls.has(`https://resume.example.com/zh/blog/${zhPost.slug}`)).toBe(true);
    expect(zhTopic).toBeTruthy();
  });

  it('builds robots metadata with the canonical sitemap and host', () => {
    process.env.SITE_URL = 'https://resume.example.com';

    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
      },
      sitemap: 'https://resume.example.com/sitemap.xml',
      host: 'https://resume.example.com/',
    });
  });
});

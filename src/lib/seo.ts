import type { Metadata, MetadataRoute } from 'next';
import { getArchitectureCases, getTopicBySlug } from '@devfolio-blog/content-data';
import type { Locale, RecipeDetail, TopicShowcase } from '@devfolio-blog/shared-types';
import { dictionaries } from '@devfolio-blog/i18n';
import { getBlogPost, listBlogPosts } from '@/lib/blog/repository';
import { locales } from '@/lib/locale';
import { getRecipeBySlug, getRecipeSlugs } from '@/lib/recipes';

const DEFAULT_SITE_ORIGIN = 'https://resume.blog';
const DEFAULT_SOCIAL_IMAGE_PATH = '/opengraph-image';
const TOPIC_ROUTE_MAP = {
  'fitness-ai-agent': 'fitness',
  unraid: 'unraid',
} as const;

export type MetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  alternatePaths?: Partial<Record<Locale, string>>;
  imagePath?: string;
  type?: 'website' | 'article' | 'profile';
  keywords?: string[];
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
};

export function getSiteOrigin() {
  const rawValue = process.env.SITE_URL?.trim();
  if (!rawValue) return DEFAULT_SITE_ORIGIN;

  return rawValue.replace(/\/$/, '');
}

export function getSiteUrl(path = '/') {
  return new URL(normalizePath(path), `${getSiteOrigin()}/`).toString();
}

export function buildMetadata({
  locale,
  title,
  description,
  path,
  alternatePaths,
  imagePath = DEFAULT_SOCIAL_IMAGE_PATH,
  type = 'website',
  keywords,
  noIndex = false,
  publishedTime,
  modifiedTime,
  section,
}: MetadataInput): Metadata {
  const canonicalPath = normalizePath(path);
  const languageAlternates = buildLanguageAlternates(locale, canonicalPath, alternatePaths);
  const imageUrl = getSiteUrl(imagePath);

  return {
    title,
    description,
    metadataBase: new URL(`${getSiteOrigin()}/`),
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates,
    },
    keywords,
    robots: noIndex
      ? {
          index: false,
          follow: true,
        }
      : undefined,
    openGraph: {
      type,
      url: canonicalPath,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      title,
      description,
      siteName: 'Remi Resume',
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
      publishedTime,
      modifiedTime,
      section,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = [
    '/',
    '/zh',
    '/en',
    '/zh/resume',
    '/en/resume',
    '/zh/books',
    '/en/books',
    '/zh/recipes',
    '/en/recipes',
    '/zh/blog',
    '/en/blog',
    '/zh/architecture',
    '/en/architecture',
    '/zh/fitness',
    '/en/fitness',
    '/zh/unraid',
    '/en/unraid',
  ].map((path) => ({ url: getSiteUrl(path) }));

  const architectureEntries = locales.flatMap((locale) =>
    getArchitectureCases(locale).map((item) => ({
      url: getSiteUrl(`/${locale}/architecture/${item.slug}`),
      lastModified: item.updatedAt,
    })),
  );

  const topicEntries = locales.flatMap((locale) =>
    Object.entries(TOPIC_ROUTE_MAP)
      .map(([slug, route]) => {
        const item = getTopicBySlug(locale, slug);
        if (!item) return null;

        return {
          url: getSiteUrl(`/${locale}/${route}`),
          lastModified: item.updatedAt,
        };
      })
      .filter((entry): entry is { url: string; lastModified: string } => Boolean(entry)),
  );

  const recipeEntries = getRecipeSlugs().map(({ locale, slug }) => {
    const recipe = getRecipeBySlug(slug, locale);
    return {
      url: getSiteUrl(`/${locale}/recipes/${slug}`),
      lastModified: recipe?.updatedAt,
    };
  });

  const blogEntries = (
    await Promise.all(
      locales.map(async (locale) =>
        (await listBlogPosts(locale)).map((post) => ({
          url: getSiteUrl(`/${locale}/blog/${post.slug}`),
          lastModified: post.updatedAt,
        })),
      ),
    )
  ).flat();

  return dedupeEntries([...staticEntries, ...architectureEntries, ...topicEntries, ...recipeEntries, ...blogEntries]);
}

export function buildPersonJsonLd(locale: Locale) {
  const dictionary = dictionaries[locale];

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Remi',
    url: getSiteUrl(`/${locale}`),
    jobTitle: locale === 'zh' ? '全栈工程师' : 'Full-stack Engineer',
    description: dictionary.tagline,
    sameAs: [getSiteUrl(`/${locale}/resume`), getSiteUrl(`/${locale}/blog`)],
  };
}

export function buildCollectionPageJsonLd({
  locale,
  title,
  description,
  path,
}: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    inLanguage: locale,
    name: title,
    description,
    url: getSiteUrl(path),
    isPartOf: {
      '@type': 'WebSite',
      name: 'Remi Resume',
      url: getSiteUrl(`/${locale}`),
    },
  };
}

export function buildArticleJsonLd({
  locale,
  title,
  description,
  path,
  imagePath,
  publishedTime,
  modifiedTime,
  keywords,
  type = 'Article',
}: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  imagePath?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  type?: 'Article' | 'BlogPosting' | 'TechArticle' | 'ProfilePage';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline: title,
    description,
    inLanguage: locale,
    url: getSiteUrl(path),
    image: imagePath ? [getSiteUrl(imagePath)] : undefined,
    datePublished: publishedTime,
    dateModified: modifiedTime,
    keywords,
    author: {
      '@type': 'Person',
      name: 'Remi',
    },
    publisher: {
      '@type': 'Person',
      name: 'Remi',
    },
    mainEntityOfPage: getSiteUrl(path),
  };
}

export function buildRecipeJsonLd(locale: Locale, path: string, recipe: RecipeDetail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.summary,
    inLanguage: locale,
    url: getSiteUrl(path),
    image: recipe.coverImage ? [getSiteUrl(recipe.coverImage)] : undefined,
    dateModified: recipe.updatedAt,
    totalTime: `PT${recipe.durationMinutes}M`,
    recipeYield: recipe.servings,
    recipeCategory: recipe.category,
    recipeCuisine: locale === 'zh' ? 'Chinese' : undefined,
    keywords: recipe.tags,
    recipeIngredient: [...recipe.ingredients, ...recipe.seasonings, ...recipe.sauce].map(
      (item) => `${item.name} ${item.amount}`,
    ),
    recipeInstructions: recipe.steps.map((step) => ({
      '@type': 'HowToStep',
      name: step.title,
      text: step.bullets.join(' '),
    })),
    nutrition: recipe.calories
      ? {
          '@type': 'NutritionInformation',
          calories: `${recipe.calories} kcal`,
        }
      : undefined,
    author: {
      '@type': 'Person',
      name: 'Remi',
    },
  };
}

export function getTopicRoutePath(slug: keyof typeof TOPIC_ROUTE_MAP) {
  return TOPIC_ROUTE_MAP[slug];
}

export function buildTopicMetadata(locale: Locale, slug: keyof typeof TOPIC_ROUTE_MAP) {
  const topic = getTopicBySlug(locale, slug);
  if (!topic) return null;

  const routePath = `/${locale}/${getTopicRoutePath(slug)}`;
  const alternatePaths = getTopicAlternatePaths(slug, routePath);

  return buildMetadata({
    locale,
    title: topic.title,
    description: topic.summary,
    path: routePath,
    alternatePaths,
    imagePath: topic.heroImage,
    type: 'article',
    publishedTime: topic.updatedAt,
    modifiedTime: topic.updatedAt,
    keywords: topic.tags,
    section: topic.eyebrow,
  });
}

export function buildTopicJsonLd(locale: Locale, slug: keyof typeof TOPIC_ROUTE_MAP, topic: TopicShowcase) {
  return buildArticleJsonLd({
    locale,
    title: topic.title,
    description: topic.summary,
    path: `/${locale}/${getTopicRoutePath(slug)}`,
    imagePath: topic.heroImage,
    publishedTime: topic.updatedAt,
    modifiedTime: topic.updatedAt,
    keywords: topic.tags,
    type: 'TechArticle',
  });
}

export async function getBlogAlternates(currentLocale: Locale, slug: string) {
  const alternatePaths: Partial<Record<Locale, string>> = {};

  for (const locale of locales) {
    if (await getBlogPost(locale, slug)) {
      alternatePaths[locale] = `/${locale}/blog/${slug}`;
    }
  }

  if (!alternatePaths[currentLocale]) {
    alternatePaths[currentLocale] = `/${currentLocale}/blog/${slug}`;
  }

  return alternatePaths;
}

function buildLanguageAlternates(
  locale: Locale,
  canonicalPath: string,
  alternatePaths?: Partial<Record<Locale, string>>,
): Record<string, string> {
  const currentPath = normalizePath(canonicalPath);
  const zhPath = normalizePath(alternatePaths?.zh ?? (locale === 'zh' ? currentPath : '/zh'));
  const enPath = normalizePath(alternatePaths?.en ?? (locale === 'en' ? currentPath : '/en'));

  return {
    'zh-CN': zhPath,
    en: enPath,
    'x-default': zhPath,
  };
}

function getTopicAlternatePaths(slug: keyof typeof TOPIC_ROUTE_MAP, currentPath: string) {
  const alternatePaths: Partial<Record<Locale, string>> = {};

  for (const locale of locales) {
    if (getTopicBySlug(locale, slug)) {
      alternatePaths[locale] = `/${locale}/${getTopicRoutePath(slug)}`;
    }
  }

  if (!Object.values(alternatePaths).includes(currentPath)) {
    alternatePaths.zh ??= '/zh';
  }

  return alternatePaths;
}

function dedupeEntries(entries: MetadataRoute.Sitemap) {
  const uniqueEntries = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const entry of entries) {
    uniqueEntries.set(entry.url, entry);
  }

  return [...uniqueEntries.values()];
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

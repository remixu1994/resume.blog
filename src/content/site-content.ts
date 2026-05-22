import {
  getArchitectureCase,
  getArchitectureCases,
  getBookRecommendations,
  getBooksModuleContent,
  getFeaturedPayload,
  getTopicBySlug,
  resumeProfiles,
  seedPosts,
} from '@devfolio-blog/content-data';
import { dictionaries, normalizeLocale, switchLocale, withLocalePath } from '@devfolio-blog/i18n';
import { renderMarkdown } from '@devfolio-blog/markdown';
import type { Locale, PublicPost, PublicPostSummary } from '@devfolio-blog/shared-types';

export function getDictionary(locale: string) {
  return dictionaries[normalizeLocale(locale)];
}

export function getLocale(value: string | null | undefined): Locale {
  return normalizeLocale(value);
}

export function getShellLinks(locale: Locale) {
  return [
    { label: dictionaries[locale].nav.home, href: withLocalePath(locale) },
    { label: dictionaries[locale].nav.resume, href: withLocalePath(locale, 'resume') },
    { label: dictionaries[locale].nav.books, href: withLocalePath(locale, 'books') },
    { label: dictionaries[locale].nav.fitness, href: withLocalePath(locale, 'fitness') },
    { label: dictionaries[locale].nav.recipes, href: withLocalePath(locale, 'recipes') },
    { label: dictionaries[locale].nav.blog, href: withLocalePath(locale, 'blog') },
  ];
}

export function getHomeViewModel(locale: Locale) {
  const posts = getPublishedPosts(locale);

  return {
    dictionary: dictionaries[locale],
    featured: {
      ...getFeaturedPayload(locale),
      recentPosts: posts.slice(0, 3),
    },
    books: getBooksHomeViewModel(locale),
    blogTopics: getBlogTopics(posts),
    blogSeries: getBlogSeries(posts),
  };
}

export function getResumeViewModel(locale: Locale) {
  return {
    dictionary: dictionaries[locale],
    resume: resumeProfiles[locale],
  };
}

export function getArchitectureListViewModel(locale: Locale) {
  return {
    dictionary: dictionaries[locale],
    items: getArchitectureCases(locale),
  };
}

export function getArchitectureDetailViewModel(locale: Locale, slug: string) {
  const item = getArchitectureCase(locale, slug);
  return item
    ? {
        dictionary: dictionaries[locale],
        item,
        html: renderMarkdown(item.body),
      }
    : null;
}

export function getTopicViewModel(locale: Locale, slug: string) {
  const item = getTopicBySlug(locale, slug);
  return item
    ? {
        dictionary: dictionaries[locale],
        item,
        html: renderMarkdown(item.body),
      }
    : null;
}

export function getBooksViewModel(locale: Locale) {
  const booksModule = getBooksModuleContent(locale);
  const books = getBookRecommendations(locale);

  return {
    dictionary: dictionaries[locale],
    module: booksModule,
    featuredBooks: books.filter((book) => book.featured),
    groupedBooks: booksModule.groups.map((group) => ({
      ...group,
      books: books.filter((book) => book.category === group.category),
    })),
  };
}

export function getBlogListViewModel(locale: Locale) {
  const items = getPublishedPosts(locale);

  return {
    dictionary: dictionaries[locale],
    items,
    highlightedPost: items[0],
    latestPosts: items.slice(1),
    topics: getBlogTopics(items),
    series: getBlogSeries(items),
  };
}

export function getBlogDetailViewModel(locale: Locale, slug: string) {
  const posts = getPublishedPosts(locale);
  const item = posts.find((post) => post.slug === slug);

  return item
    ? {
        dictionary: dictionaries[locale],
        item,
        html: renderMarkdown(item.body),
        relatedPosts: getRelatedPosts(item, posts),
      }
    : null;
}


function getPublishedPosts(locale: Locale): PublicPost[] {
  return seedPosts
    .filter((post) => post.locale === locale && post.published)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function getBlogTopics(posts: PublicPostSummary[]) {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

function getBlogSeries(posts: PublicPostSummary[]) {
  const counts = new Map<string, number>();

  for (const post of posts) {
    if (post.series) {
      counts.set(post.series, (counts.get(post.series) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

function getRelatedPosts(item: PublicPostSummary, posts: PublicPostSummary[]) {
  return posts
    .filter((post) => post.id !== item.id)
    .map((post) => ({
      post,
      score:
        (item.series && post.series === item.series ? 10 : 0) +
        post.tags.filter((tag) => item.tags.includes(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || right.post.updatedAt.localeCompare(left.post.updatedAt))
    .slice(0, 3)
    .map(({ post }) => post);
}

function getBooksHomeViewModel(locale: Locale) {
  const booksModule = getBooksModuleContent(locale);
  const books = getBookRecommendations(locale).filter((book) => book.featured);

  return {
    ...booksModule,
    featuredBooks: books,
    highlightedQuote: books.find((book) => !!book.quote)?.quote ?? null,
  };
}

export function getLocaleSwitch(locale: Locale, currentPath: string) {
  const nextLocale = switchLocale(locale);
  const localizedPrefix = `/${locale}`;
  const suffix = currentPath.startsWith(localizedPrefix) ? currentPath.slice(localizedPrefix.length) : '';

  return {
    label: nextLocale.toUpperCase(),
    href: withLocalePath(nextLocale, suffix || ''),
  };
}

import { renderMarkdown } from '@devfolio-blog/markdown';
import type { Locale } from '@devfolio-blog/shared-types';
import { createMarkdownBlogSource } from './markdown-source';
import { resolveBlogSlug } from './slug-aliases';
import { createSqliteBlogSource } from './sqlite-source';
import type { BlogContentSource, BlogPost, BlogPostSummary } from './types';

export function listBlogPosts(locale: Locale, sources = getDefaultBlogSources()): BlogPostSummary[] {
  return toPublicPosts(mergeBlogSources(sources))
    .filter((post) => post.locale === locale)
    .map(toSummary);
}

export function getBlogPost(locale: Locale, slug: string, sources = getDefaultBlogSources()) {
  const posts = toPublicPosts(mergeBlogSources(sources)).filter((post) => post.locale === locale);
  const normalizedSlug = resolveBlogSlug(normalizeRouteSlug(slug));
  const item = posts.find((post) => post.slug === normalizedSlug);

  return item
    ? {
        item,
        html: renderMarkdown(item.body),
        relatedPosts: getRelatedBlogPosts(item, posts),
      }
    : null;
}

export function getStaticMarkdownBlogParams(source = createMarkdownBlogSource()) {
  return toPublicPosts(source.listPosts()).map((post) => ({ locale: post.locale, slug: post.slug }));
}

export function getBlogTopics(posts: BlogPostSummary[]) {
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

export function getBlogSeries(posts: BlogPostSummary[]) {
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

export function getBlogCategories(posts: BlogPostSummary[]) {
  const counts = new Map<string, number>();

  for (const post of posts) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function getRelatedBlogPosts(item: BlogPostSummary, posts: BlogPostSummary[]) {
  return posts
    .filter((post) => post.id !== item.id)
    .map((post) => ({
      post,
      score:
        (post.category === item.category ? 3 : 0) +
        (item.series && post.series === item.series ? 10 : 0) +
        post.tags.filter((tag) => item.tags.includes(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || right.post.updatedAt.localeCompare(left.post.updatedAt))
    .slice(0, 3)
    .map(({ post }) => post);
}

export function mergeBlogSources(sources: BlogContentSource[]) {
  const posts = new Map<string, BlogPost>();

  for (const source of sources) {
    for (const post of source.listPosts()) {
      posts.set(`${post.locale}:${post.slug}`, post);
    }
  }

  return [...posts.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function getDefaultBlogSources(): BlogContentSource[] {
  return [createMarkdownBlogSource(), createSqliteBlogSource()];
}

function toPublicPosts(posts: BlogPost[]) {
  return posts
    .filter((post) => post.published && post.status === 'published')
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function toSummary(post: BlogPost): BlogPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    locale: post.locale,
    title: post.title,
    summary: post.summary,
    heroImage: post.heroImage,
    updatedAt: post.updatedAt,
    tags: post.tags,
    published: post.published,
    status: post.status,
    source: post.source,
    category: post.category,
    series: post.series,
  };
}

function normalizeRouteSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

import { renderMarkdown } from '@devfolio-blog/markdown';
import type { Locale } from '@devfolio-blog/shared-types';
import { resolveBlogSlug } from './slug-aliases';
import { getBlogDatabaseConfig } from './database-config';
import { createRemoteBlogSource } from './remote-source';
import { createSqliteBlogSource } from './sqlite-source';
import type { BlogContentSource, BlogPost, BlogPostSummary } from './types';

export async function listBlogPosts(locale: Locale, sources = getDefaultBlogSources()): Promise<BlogPostSummary[]> {
  return toPublicPosts(await mergeBlogSources(sources))
    .filter((post) => post.locale === locale)
    .map(toSummary);
}

export async function getBlogPost(locale: Locale, slug: string, sources = getDefaultBlogSources()) {
  const posts = toPublicPosts(await mergeBlogSources(sources)).filter((post) => post.locale === locale);
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
        getRelatedTagIds(post).filter((tagId) => getRelatedTagIds(item).includes(tagId)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || right.post.updatedAt.localeCompare(left.post.updatedAt))
    .slice(0, 3)
    .map(({ post }) => post);
}

function getRelatedTagIds(post: BlogPostSummary) {
  return post.tagIds?.length ? post.tagIds : post.tags;
}

export async function mergeBlogSources(sources: BlogContentSource[]) {
  const posts = new Map<string, BlogPost>();

  for (const source of sources) {
    for (const post of await source.listPosts()) {
      posts.set(`${post.locale}:${post.slug}`, post);
    }
  }

  return [...posts.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function getDefaultBlogSources(): BlogContentSource[] {
  const config = getBlogDatabaseConfig();
  return [config.provider === 'sqlite' ? createSqliteBlogSource() : createRemoteBlogSource(config)];
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
    tagIds: post.tagIds,
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

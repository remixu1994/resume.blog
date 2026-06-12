import type { Locale } from '@devfolio-blog/shared-types';
import type { BlogPost, BlogContentSource } from './types';
import { mergeBlogSources } from './repository';
import { createSqliteBlogSource } from './sqlite-source';

export interface SearchResult {
  id: string;
  slug: string;
  locale: Locale;
  title: string;
  summary: string;
  highlightedTitle: string;
  highlightedSummary: string;
  highlightedSnippet: string;
  category: string;
  heroImage: string;
  updatedAt: string;
  tags: string[];
  tagIds?: string[];
  series?: string;
}

/**
 * Search blog posts in-memory across title, summary, and body.
 * Returns results with highlighted matching text using <mark> tags.
 */
export function searchBlogPosts(
  query: string,
  locale: Locale,
  sources?: BlogContentSource[],
): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const allPosts = mergeBlogSources(sources ?? getDefaultBlogSources());
  const localePosts = allPosts.filter(
    (post) => post.published && post.status === 'published' && post.locale === locale,
  );

  const results: Array<{ post: BlogPost; score: number }> = [];

  for (const post of localePosts) {
    const titleLower = post.title.toLowerCase();
    const summaryLower = post.summary.toLowerCase();
    const bodyLower = post.body.toLowerCase();

    let score = 0;
    let allTermsFound = true;

    for (const term of terms) {
      const titleMatch = titleLower.includes(term);
      const summaryMatch = summaryLower.includes(term);
      const bodyMatch = bodyLower.includes(term);

      if (!titleMatch && !summaryMatch && !bodyMatch) {
        allTermsFound = false;
        break;
      }

      // Title matches weighted highest
      if (titleMatch) score += 10;
      // Summary matches weighted medium
      if (summaryMatch) score += 5;
      // Body matches weighted lowest
      if (bodyMatch) score += 1;
    }

    if (allTermsFound && score > 0) {
      results.push({ post, score });
    }
  }

  return results
    .sort((a, b) => b.score - a.score || b.post.updatedAt.localeCompare(a.post.updatedAt))
    .map(({ post }) => toSearchResult(post, terms));
}

function toSearchResult(post: BlogPost, terms: string[]): SearchResult {
  return {
    id: post.id,
    slug: post.slug,
    locale: post.locale,
    title: post.title,
    summary: post.summary,
    highlightedTitle: highlightText(post.title, terms),
    highlightedSummary: highlightText(post.summary, terms),
    highlightedSnippet: highlightSnippet(post.body, terms),
    category: post.category,
    heroImage: post.heroImage,
    updatedAt: post.updatedAt,
    tags: post.tags,
    tagIds: post.tagIds,
    series: post.series,
  };
}

/**
 * Wrap matching terms in <mark> tags for highlighting.
 * Case-insensitive matching.
 */
export function highlightText(text: string, terms: string[]): string {
  if (terms.length === 0) return escapeHtml(text);

  const escapedTerms = terms.map(escapeRegex);
  const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts
    .map((part) => {
      if (terms.some((term) => part.toLowerCase() === term.toLowerCase())) {
        return `<mark>${escapeHtml(part)}</mark>`;
      }
      return escapeHtml(part);
    })
    .join('');
}

/**
 * Extract a relevant snippet from body text with highlighted terms.
 * Returns ~200 chars around the first match.
 */
export function highlightSnippet(body: string, terms: string[], maxLength = 200): string {
  if (terms.length === 0) return escapeHtml(truncate(body, maxLength));

  const bodyLower = body.toLowerCase();
  let firstMatchIndex = -1;

  for (const term of terms) {
    const idx = bodyLower.indexOf(term);
    if (idx !== -1 && (firstMatchIndex === -1 || idx < firstMatchIndex)) {
      firstMatchIndex = idx;
    }
  }

  if (firstMatchIndex === -1) {
    return escapeHtml(truncate(body, maxLength));
  }

  // Extract context around the match
  const contextStart = Math.max(0, firstMatchIndex - 60);
  const contextEnd = Math.min(body.length, firstMatchIndex + maxLength - 60);
  let snippet = body.slice(contextStart, contextEnd);

  // Add ellipsis if truncated
  if (contextStart > 0) snippet = '...' + snippet;
  if (contextEnd < body.length) snippet = snippet + '...';

  // Normalize whitespace for display
  snippet = snippet.replace(/\s+/g, ' ').trim();

  return highlightText(snippet, terms);
}

function truncate(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return normalized.slice(0, maxLength) + '...';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getDefaultBlogSources(): BlogContentSource[] {
  return [createSqliteBlogSource()];
}

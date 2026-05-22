import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseRecipeMarkdown } from '@devfolio-blog/markdown';
import type { Locale, RecipeDetail, RecipeQuery, RecipeSummary } from '@devfolio-blog/shared-types';

type MdRecipeSource = {
  slug: string;
  locale: Locale;
  filePath: string;
};

const mdRecipes: MdRecipeSource[] = [{ slug: 'hairtail', locale: 'zh', filePath: 'public/recipes/hairtail.md' }];

export function listRecipes(query: RecipeQuery = {}): RecipeSummary[] {
  const locale = query.locale ?? 'zh';

  return mdRecipes
    .filter((item) => item.locale === locale)
    .map((item) => toSummary(readRecipe(item)))
    .filter((item) => matchesRecipeQuery(item, { ...query, locale }))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function getRecipeBySlug(slug: string, locale: Locale): RecipeDetail | null {
  const source = mdRecipes.find((item) => item.slug === slug && item.locale === locale);
  return source ? readRecipe(source) : null;
}

export function getRecipeSlugs() {
  return mdRecipes.map((item) => ({ locale: item.locale, slug: item.slug }));
}

function readRecipe(source: MdRecipeSource): RecipeDetail {
  const markdown = readFileSync(join(process.cwd(), source.filePath), 'utf8');
  return parseRecipeMarkdown(markdown);
}

function toSummary(item: RecipeDetail): RecipeSummary {
  return {
    slug: item.slug,
    locale: item.locale,
    title: item.title,
    summary: item.summary,
    category: item.category,
    tags: item.tags,
    durationMinutes: item.durationMinutes,
    difficulty: item.difficulty,
    calories: item.calories,
    coverImage: item.coverImage,
    updatedAt: item.updatedAt,
    source: item.source,
  };
}

function matchesRecipeQuery(item: RecipeSummary, query: RecipeQuery): boolean {
  if (query.category && item.category !== query.category) return false;
  if (query.tag && !item.tags.includes(query.tag)) return false;

  const search = query.search?.trim().toLowerCase();
  if (!search) return true;

  const haystack = [item.title, item.summary, item.category, ...item.tags].join(' ').toLowerCase();
  return haystack.includes(search);
}

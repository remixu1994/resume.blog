import { describe, expect, it } from 'vitest';
import { getRecipeBySlug, getRecipeSlugs, listRecipes } from '@/lib/recipes';

describe('recipe repository', () => {
  it('loads markdown recipes from data/recipes/', () => {
    const recipes = listRecipes({ locale: 'zh' });

    expect(recipes.length).toBeGreaterThan(0);
    expect(recipes[0].source).toBe('md');
  });

  it('returns recipe details by slug', () => {
    const recipe = getRecipeBySlug('hairtail', 'zh');

    expect(recipe?.slug).toBe('hairtail');
    expect(recipe?.ingredients.length).toBeGreaterThan(0);
    expect(recipe?.html).toContain('<h1>');
  });

  it('discovers recipes dynamically from data/recipes/', () => {
    const slugs = getRecipeSlugs();

    expect(slugs.length).toBeGreaterThan(0);
    expect(slugs.some((item) => item.slug === 'hairtail')).toBe(true);
  });

  it('returns empty list for non-existent locale', () => {
    const recipes = listRecipes({ locale: 'en' });

    expect(recipes.length).toBe(0);
  });

  it('returns null for non-existent slug', () => {
    const recipe = getRecipeBySlug('non-existent', 'zh');

    expect(recipe).toBeNull();
  });
});

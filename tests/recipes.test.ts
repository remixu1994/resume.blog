import { describe, expect, it } from 'vitest';
import { getRecipeBySlug, listRecipes } from '@/lib/recipes';

describe('recipe repository', () => {
  it('loads markdown recipes as static content', () => {
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
});

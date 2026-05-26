import { describe, expect, it } from 'vitest';
import { getBlogListViewModel, getHomeViewModel } from '@/content/site-content';

describe('content selectors', () => {
  it('returns localized home content with featured sections', () => {
    const zh = getHomeViewModel('zh');
    const en = getHomeViewModel('en');

    expect(zh.dictionary.brand).toBe('Remi Resume');
    expect(en.dictionary.brand).toBe('Remi Resume');
    expect(zh.featured.featuredCases.length).toBeGreaterThan(0);
    expect(en.featured.topicCards.length).toBeGreaterThan(0);
  });

  it('sorts published blog posts by update date', () => {
    const posts = getBlogListViewModel('zh').items;

    expect(posts.every((post) => post.published)).toBe(true);
    expect(posts.map((post) => post.updatedAt)).toEqual([...posts.map((post) => post.updatedAt)].sort().reverse());
  });
});

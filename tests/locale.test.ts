import { describe, expect, it } from 'vitest';
import { normalizeLocale, switchLocale, withLocalePath } from '@devfolio-blog/i18n';

describe('locale helpers', () => {
  it('normalizes unsupported locale values to zh', () => {
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('fr')).toBe('zh');
    expect(normalizeLocale(undefined)).toBe('zh');
  });

  it('switches locale and creates localized paths', () => {
    expect(switchLocale('zh')).toBe('en');
    expect(switchLocale('en')).toBe('zh');
    expect(withLocalePath('zh', 'resume')).toBe('/zh/resume');
    expect(withLocalePath('en')).toBe('/en');
  });
});

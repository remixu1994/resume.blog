import { notFound } from 'next/navigation';
import type { Locale } from '@devfolio-blog/shared-types';
import { isLocale, normalizeLocale, switchLocale, withLocalePath } from '@devfolio-blog/i18n';

export const locales: Locale[] = ['zh', 'en'];

export function requireLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}

export { normalizeLocale, switchLocale, withLocalePath };

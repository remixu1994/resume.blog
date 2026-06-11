'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { dictionaries, switchLocale, withLocalePath } from '@devfolio-blog/i18n';
import type { Locale } from '@devfolio-blog/shared-types';

export function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const dictionary = dictionaries[locale];
  const pathname = usePathname();
  const localeSwitch = getLocaleSwitch(locale, pathname || `/${locale}`);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href={`/${locale}`}>
            <strong>{dictionary.brand}</strong>
            <span>{dictionary.tagline}</span>
          </Link>
          <nav className="nav" aria-label="Primary navigation">
            {getShellLinks(locale).map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href={localeSwitch.href}>{localeSwitch.label}</Link>
          </nav>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">{dictionary.footer}</footer>
    </div>
  );
}

function getShellLinks(locale: Locale) {
  return [
    { label: dictionaries[locale].nav.home, href: withLocalePath(locale) },
    { label: dictionaries[locale].nav.resume, href: withLocalePath(locale, 'resume') },
    { label: dictionaries[locale].nav.books, href: withLocalePath(locale, 'books') },
    { label: dictionaries[locale].nav.recipes, href: withLocalePath(locale, 'recipes') },
    { label: dictionaries[locale].nav.blog, href: withLocalePath(locale, 'blog') },
  ];
}

function getLocaleSwitch(locale: Locale, currentPath: string) {
  const nextLocale = switchLocale(locale);
  const localizedPrefix = `/${locale}`;
  const suffix = currentPath.startsWith(localizedPrefix) ? currentPath.slice(localizedPrefix.length) : '';

  return {
    label: nextLocale.toUpperCase(),
    href: withLocalePath(nextLocale, suffix || ''),
  };
}

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
      <footer className="site-footer">
        <div className="footer-content">
          <span>{dictionary.footer}</span>
          <a
            href={`/${locale}/feed.xml`}
            className="rss-link"
            aria-label="RSS Feed"
            title="RSS Feed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="6.18" cy="17.82" r="2.18" />
              <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
            </svg>
            <span>RSS</span>
          </a>
        </div>
      </footer>
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

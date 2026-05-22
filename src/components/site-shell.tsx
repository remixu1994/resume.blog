import Link from 'next/link';
import { getDictionary, getLocaleSwitch, getShellLinks } from '@/content/site-content';
import type { Locale } from '@devfolio-blog/shared-types';

export function SiteShell({
  locale,
  currentPath,
  children,
}: {
  locale: Locale;
  currentPath: string;
  children: React.ReactNode;
}) {
  const dictionary = getDictionary(locale);
  const localeSwitch = getLocaleSwitch(locale, currentPath);

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

import { SiteShell } from '@/components/site-shell';
import { requireLocale } from '@/lib/locale';

export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);

  return (
    <SiteShell locale={locale} currentPath={`/${locale}`}>
      {children}
    </SiteShell>
  );
}

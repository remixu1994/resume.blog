import type { Metadata } from 'next';
import { ArchitectureCard } from '@/components/cards';
import { JsonLd } from '@/components/json-ld';
import { getArchitectureListViewModel } from '@/content/site-content';
import { requireLocale } from '@/lib/locale';
import { buildCollectionPageJsonLd, buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const viewModel = getArchitectureListViewModel(locale);

  return buildMetadata({
    locale,
    title: viewModel.dictionary.architecture.title,
    description: viewModel.dictionary.architecture.intro,
    path: `/${locale}/architecture`,
    alternatePaths: {
      zh: '/zh/architecture',
      en: '/en/architecture',
    },
    imagePath: viewModel.items[0]?.heroImage,
    keywords: ['architecture', 'system design', 'case study', 'delivery'],
  });
}

export default async function ArchitecturePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const viewModel = getArchitectureListViewModel(locale);

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          locale,
          title: viewModel.dictionary.architecture.title,
          description: viewModel.dictionary.architecture.intro,
          path: `/${locale}/architecture`,
        })}
      />
      <header className="article-hero">
        <p className="eyebrow">{viewModel.dictionary.nav.architecture}</p>
        <h1 className="page-title">{viewModel.dictionary.architecture.title}</h1>
        <p className="lede">{viewModel.dictionary.architecture.intro}</p>
      </header>
      <section className="grid-2">
        {viewModel.items.map((item) => (
          <ArchitectureCard key={item.slug} locale={locale} item={item} />
        ))}
      </section>
    </>
  );
}

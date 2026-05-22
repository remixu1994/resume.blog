import { ArchitectureCard } from '@/components/cards';
import { getArchitectureListViewModel } from '@/content/site-content';
import { requireLocale } from '@/lib/locale';

export default async function ArchitecturePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const viewModel = getArchitectureListViewModel(locale);

  return (
    <>
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

import Link from 'next/link';
import { ArchitectureCard, PostCard, TopicCard } from '@/components/cards';
import { getHomeViewModel } from '@/content/site-content';
import { requireLocale } from '@/lib/locale';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const viewModel = getHomeViewModel(locale);

  return (
    <>
      <section className="hero">
        <article className="hero-panel">
          <p className="eyebrow">{viewModel.dictionary.tagline}</p>
          <h1>{viewModel.dictionary.brand}</h1>
          <p>{viewModel.dictionary.home.heroBody}</p>
          <div className="hero-actions">
            <Link className="button" href={`/${locale}/resume`}>
              {viewModel.dictionary.nav.resume}
            </Link>
            <Link className="button-muted" href={`/${locale}/architecture`}>
              {viewModel.dictionary.nav.architecture}
            </Link>
          </div>
        </article>
        <aside className="hero-side">
          <div className="dark-panel">
            <p className="eyebrow">{viewModel.dictionary.home.featuredLabel}</p>
            <h2 className="section-title">{viewModel.dictionary.home.heroTitle}</h2>
            <div className="showcase">
              {viewModel.featured.metrics.map((metric) => (
                <div className="metric" key={metric.label}>
                  <span className="eyebrow">{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <p className="eyebrow">{viewModel.dictionary.home.contactLabel}</p>
            <p className="lede">GitHub / Email / LinkedIn / PDF resume are collected in the resume section.</p>
          </div>
        </aside>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">{viewModel.dictionary.home.featuredLabel}</p>
            <h2 className="section-title">{viewModel.dictionary.nav.architecture}</h2>
          </div>
          <Link className="text-link" href={`/${locale}/architecture`}>
            View all
          </Link>
        </div>
        <div className="grid-2">
          {viewModel.featured.featuredCases.map((item) => (
            <ArchitectureCard key={item.slug} locale={locale} item={item} />
          ))}
        </div>
      </section>

      <section className="section grid-2">
        <div className="panel">
          <p className="eyebrow">{viewModel.dictionary.home.recentLabel}</p>
          <h2 className="section-title">{viewModel.dictionary.nav.blog}</h2>
          <div className="list">
            {viewModel.featured.recentPosts.map((post) => (
              <PostCard key={post.id} locale={locale} post={post} />
            ))}
          </div>
        </div>
        <div className="panel">
          <p className="eyebrow">{viewModel.dictionary.nav.fitness}</p>
          <h2 className="section-title">{viewModel.dictionary.home.booksLabel}</h2>
          <div className="list">
            {viewModel.featured.topicCards.map((item) => (
              <TopicCard key={item.slug} locale={locale} item={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

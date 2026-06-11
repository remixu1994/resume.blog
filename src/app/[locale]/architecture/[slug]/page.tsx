import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArchitectureCase, getArchitectureCases } from '@devfolio-blog/content-data';
import { JsonLd } from '@/components/json-ld';
import { MarkdownBody } from '@/lib/markdown';
import { locales, requireLocale } from '@/lib/locale';
import { buildArticleJsonLd, buildMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return locales.flatMap((locale) => getArchitectureCases(locale).map((item) => ({ locale, slug: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = requireLocale(localeParam);
  const item = getArchitectureCase(locale, slug);
  if (!item) {
    return buildMetadata({
      locale,
      title: 'Architecture',
      description: 'Architecture case not found.',
      path: `/${locale}/architecture/${slug}`,
      noIndex: true,
    });
  }

  const alternatePaths: Partial<Record<'zh' | 'en', string>> = {};
  for (const candidate of locales) {
    if (getArchitectureCase(candidate, slug)) {
      alternatePaths[candidate] = `/${candidate}/architecture/${slug}`;
    }
  }

  return buildMetadata({
    locale,
    title: item.title,
    description: item.summary,
    path: `/${locale}/architecture/${slug}`,
    alternatePaths,
    imagePath: item.heroImage,
    type: 'article',
    publishedTime: item.updatedAt,
    modifiedTime: item.updatedAt,
    keywords: item.stack,
    section: 'Architecture',
  });
}

export default async function ArchitectureDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = requireLocale(localeParam);
  const item = getArchitectureCase(locale, slug);
  if (!item) notFound();

  return (
    <article>
      <JsonLd
        data={buildArticleJsonLd({
          locale,
          title: item.title,
          description: item.summary,
          path: `/${locale}/architecture/${slug}`,
          imagePath: item.heroImage,
          publishedTime: item.updatedAt,
          modifiedTime: item.updatedAt,
          keywords: item.stack,
          type: 'TechArticle',
        })}
      />
      <header className="article-hero">
        <p className="eyebrow">{item.updatedAt}</p>
        <h1 className="article-title">{item.title}</h1>
        <p className="lede">{item.summary}</p>
        <div className="tag-row">
          {item.stack.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </header>
      <div className="content-grid">
        <section className="article-panel">
          <MarkdownBody markdown={item.body} />
        </section>
        <aside className="panel">
          <p className="eyebrow">Challenge</p>
          <p>{item.challenge}</p>
          <p className="eyebrow">Outcomes</p>
          <ul>
            {item.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </aside>
      </div>
    </article>
  );
}

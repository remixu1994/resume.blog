import { notFound } from 'next/navigation';
import { getArchitectureCase, getArchitectureCases } from '@devfolio-blog/content-data';
import { MarkdownBody } from '@/lib/markdown';
import { locales, requireLocale } from '@/lib/locale';

export function generateStaticParams() {
  return locales.flatMap((locale) => getArchitectureCases(locale).map((item) => ({ locale, slug: item.slug })));
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

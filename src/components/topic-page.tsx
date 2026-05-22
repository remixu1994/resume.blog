import { notFound } from 'next/navigation';
import { getTopicViewModel } from '@/content/site-content';
import { MarkdownBody } from '@/lib/markdown';
import { requireLocale } from '@/lib/locale';

export function TopicPage(slug: string) {
  return async function TopicRoutePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: localeParam } = await params;
    const locale = requireLocale(localeParam);
    const viewModel = getTopicViewModel(locale, slug);
    if (!viewModel) notFound();

    return (
      <article>
        <header className="article-hero">
          <p className="eyebrow">{viewModel.item.eyebrow}</p>
          <h1 className="article-title">{viewModel.item.title}</h1>
          <p className="lede">{viewModel.item.summary}</p>
          <div className="tag-row">
            {viewModel.item.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </header>
        <div className="content-grid">
          <section className="article-panel">
            <MarkdownBody html={viewModel.html} />
          </section>
          <aside className="panel">
            <p className="eyebrow">{viewModel.dictionary.topic.sections}</p>
            <div className="list">
              {viewModel.item.sections.map((section) => (
                <section className="item" key={section.title}>
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                </section>
              ))}
            </div>
          </aside>
        </div>
      </article>
    );
  };
}

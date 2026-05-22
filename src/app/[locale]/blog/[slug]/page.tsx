import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogDetailViewModel, getBlogListViewModel } from '@/content/site-content';
import { MarkdownBody } from '@/lib/markdown';
import { locales, requireLocale } from '@/lib/locale';

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getBlogListViewModel(locale).items.map((item) => ({ locale, slug: item.slug })),
  );
}

export default async function BlogDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = requireLocale(localeParam);
  const viewModel = getBlogDetailViewModel(locale, slug);
  if (!viewModel) notFound();

  return (
    <article>
      <header className="article-hero">
        <p className="eyebrow">{viewModel.item.updatedAt}</p>
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
          <p className="eyebrow">Related</p>
          <div className="list">
            {viewModel.relatedPosts.map((post) => (
              <Link className="item" key={post.id} href={`/${locale}/blog/${post.slug}`}>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </article>
  );
}

import { PostCard } from '@/components/cards';
import { getBlogListViewModel } from '@/content/site-content';
import { requireLocale } from '@/lib/locale';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const viewModel = getBlogListViewModel(locale);

  return (
    <>
      <header className="article-hero">
        <p className="eyebrow">{viewModel.dictionary.nav.blog}</p>
        <h1 className="page-title">{viewModel.dictionary.blog.title}</h1>
        <p className="lede">{viewModel.dictionary.blog.intro}</p>
      </header>
      {viewModel.items.length ? (
        <section className="article-panel list">
          {viewModel.items.map((post) => (
            <PostCard key={post.id} locale={locale} post={post} />
          ))}
        </section>
      ) : (
        <p className="lede">{viewModel.dictionary.blog.empty}</p>
      )}
    </>
  );
}

import Link from 'next/link';
import { connection } from 'next/server';
import { PostCard } from '@/components/cards';
import { getBlogListViewModel } from '@/content/site-content';
import { requireLocale } from '@/lib/locale';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string | string[] }>;
}) {
  await connection();
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const categoryParam = resolvedSearchParams?.category;
  const category =
    typeof categoryParam === 'string'
      ? categoryParam
      : Array.isArray(categoryParam)
        ? categoryParam[0]
        : undefined;
  const viewModel = getBlogListViewModel(locale, category?.trim() || undefined);
  const isZh = locale === 'zh';
  const baseHref = `/${locale}/blog`;

  return (
    <>
      <header className="article-hero">
        <p className="eyebrow">{viewModel.dictionary.nav.blog}</p>
        <h1 className="page-title">{viewModel.dictionary.blog.title}</h1>
        <p className="lede">{viewModel.dictionary.blog.intro}</p>
      </header>
      <nav className="blog-filter-bar" aria-label={isZh ? '博客分类筛选' : 'Blog categories'}>
        <Link className={`blog-filter${viewModel.selectedCategory ? '' : ' is-active'}`} href={baseHref}>
          <span>{isZh ? '全部' : 'All'}</span>
          <strong>{viewModel.totalCount}</strong>
        </Link>
        {viewModel.categories.map((item) => (
          <Link
            key={item.slug}
            className={`blog-filter${item.active ? ' is-active' : ''}`}
            href={item.active ? baseHref : `${baseHref}?category=${encodeURIComponent(item.slug)}`}
          >
            <span>{item.label}</span>
            <strong>{item.count}</strong>
          </Link>
        ))}
      </nav>
      {viewModel.items.length ? (
        <section className="article-panel list blog-list">
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

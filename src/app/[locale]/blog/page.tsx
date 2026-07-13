import Link from 'next/link';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { JsonLd } from '@/components/json-ld';
import { getBlogListViewModel, getBlogSearchViewModel } from '@/content/site-content';
import { requireLocale } from '@/lib/locale';
import { buildCollectionPageJsonLd, buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string | string[]; q?: string | string[] }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const categoryParam = resolvedSearchParams?.category;
  const category = typeof categoryParam === 'string' ? categoryParam : Array.isArray(categoryParam) ? categoryParam[0] : undefined;
  const qParam = resolvedSearchParams?.q;
  const query = typeof qParam === 'string' ? qParam : Array.isArray(qParam) ? qParam[0] : undefined;
  const viewModel = await getBlogListViewModel(locale, category?.trim() || undefined);
  const title = query
    ? `${viewModel.dictionary.blog.searchResults}: ${query}`
    : category
      ? `${viewModel.dictionary.blog.title} · ${category}`
      : viewModel.dictionary.blog.title;

  return buildMetadata({
    locale,
    title,
    description: viewModel.dictionary.blog.intro,
    path: query
      ? `/${locale}/blog?q=${encodeURIComponent(query)}`
      : category
        ? `/${locale}/blog?category=${encodeURIComponent(category)}`
        : `/${locale}/blog`,
    alternatePaths: {
      zh: '/zh/blog',
      en: '/en/blog',
    },
    imagePath: viewModel.highlightedPost?.heroImage,
    keywords: ['blog', 'engineering', 'architecture', category, query].filter((value): value is string => Boolean(value)),
    noIndex: Boolean(query) || Boolean(category),
  });
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string | string[]; q?: string | string[] }>;
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
  const qParam = resolvedSearchParams?.q;
  const query =
    typeof qParam === 'string'
      ? qParam
      : Array.isArray(qParam)
        ? qParam[0]
        : undefined;
  const isZh = locale === 'zh';
  const baseHref = `/${locale}/blog`;

  // If there's a search query, use search view model
  if (query?.trim()) {
    const searchViewModel = await getBlogSearchViewModel(locale, query, category?.trim() || undefined);

    return (
      <>
        <JsonLd
          data={buildCollectionPageJsonLd({
            locale,
            title: `${searchViewModel.dictionary.blog.searchResults}: ${query}`,
            description: searchViewModel.dictionary.blog.intro,
            path: `/${locale}/blog?q=${encodeURIComponent(query)}`,
          })}
        />
        <header className="article-hero">
          <p className="eyebrow">{searchViewModel.dictionary.nav.blog}</p>
          <h1 className="page-title">{searchViewModel.dictionary.blog.searchResults}</h1>
          <p className="lede">
            {isZh ? `搜索 "${query}" 找到 ${searchViewModel.resultCount} 篇文章` : `Found ${searchViewModel.resultCount} posts for "${query}"`}
          </p>
        </header>
        <SearchForm
          locale={locale}
          query={query}
          category={category}
          placeholder={searchViewModel.dictionary.blog.searchPlaceholder}
          searchLabel={searchViewModel.dictionary.blog.searchLabel}
          clearLabel={searchViewModel.dictionary.blog.searchClear}
        />
        <nav className="blog-filter-bar" aria-label={isZh ? '博客分类筛选' : 'Blog categories'}>
          <Link
            className={`blog-filter${searchViewModel.selectedCategory ? '' : ' is-active'}`}
            href={query ? `${baseHref}?q=${encodeURIComponent(query)}` : baseHref}
          >
            <span>{isZh ? '全部' : 'All'}</span>
            <strong>{searchViewModel.resultCount}</strong>
          </Link>
          {searchViewModel.categories.map((item) => (
            <Link
              key={item.slug}
              className={`blog-filter${item.active ? ' is-active' : ''}`}
              href={
                item.active
                  ? `${baseHref}?q=${encodeURIComponent(query)}`
                  : `${baseHref}?q=${encodeURIComponent(query)}&category=${encodeURIComponent(item.slug)}`
              }
            >
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </Link>
          ))}
        </nav>
        {searchViewModel.results.length ? (
          <section className="article-panel list blog-list">
            {searchViewModel.results.map((result) => (
              <SearchResultCard key={result.id} locale={locale} result={result} />
            ))}
          </section>
        ) : (
          <p className="lede">{searchViewModel.dictionary.blog.searchNoResults}</p>
        )}
      </>
    );
  }

  // Default: show blog list with category filter
  const viewModel = await getBlogListViewModel(locale, category?.trim() || undefined);

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          locale,
          title: viewModel.dictionary.blog.title,
          description: viewModel.dictionary.blog.intro,
          path: `/${locale}/blog`,
        })}
      />
      <header className="article-hero">
        <p className="eyebrow">{viewModel.dictionary.nav.blog}</p>
        <h1 className="page-title">{viewModel.dictionary.blog.title}</h1>
        <p className="lede">{viewModel.dictionary.blog.intro}</p>
      </header>
      <SearchForm
        locale={locale}
        query=""
        category={category}
        placeholder={viewModel.dictionary.blog.searchPlaceholder}
        searchLabel={viewModel.dictionary.blog.searchLabel}
        clearLabel={viewModel.dictionary.blog.searchClear}
      />
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
            <Link key={post.id} className="item" href={`/${locale}/blog/${encodeURIComponent(post.slug)}`}>
              <p className="article-meta">
                {post.updatedAt} / {viewModel.categories.find((c) => c.slug === post.category)?.label ?? post.category}
                {post.series ? ` / ${post.series}` : ''}
              </p>
              <h2>{post.title}</h2>
              <p>{post.summary}</p>
              <div className="tag-row">
                {post.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <p className="lede">{viewModel.dictionary.blog.empty}</p>
      )}
    </>
  );
}

function SearchForm({
  locale,
  query,
  category,
  placeholder,
  searchLabel,
  clearLabel,
}: {
  locale: string;
  query: string;
  category?: string;
  placeholder: string;
  searchLabel: string;
  clearLabel: string;
}) {
  const baseHref = `/${locale}/blog`;

  return (
    <form className="blog-search-form" action={baseHref} method="get" role="search" aria-label={searchLabel}>
      {category && <input type="hidden" name="category" value={category} />}
      <input
        type="search"
        name="q"
        className="blog-search-input"
        placeholder={placeholder}
        defaultValue={query}
        aria-label={searchLabel}
      />
      <button type="submit" className="blog-search-button">
        {searchLabel}
      </button>
      {query && (
        <Link href={category ? `${baseHref}?category=${encodeURIComponent(category)}` : baseHref} className="blog-search-clear">
          {clearLabel}
        </Link>
      )}
    </form>
  );
}

function SearchResultCard({
  locale,
  result,
}: {
  locale: string;
  result: {
    slug: string;
    updatedAt: string;
    category: string;
    series?: string;
    highlightedTitle: string;
    highlightedSummary: string;
    highlightedSnippet: string;
    tags: string[];
  };
}) {
  return (
    <Link className="item search-result" href={`/${locale}/blog/${encodeURIComponent(result.slug)}`}>
      <p className="article-meta">
        {result.updatedAt} / {result.category}
        {result.series ? ` / ${result.series}` : ''}
      </p>
      <h2 dangerouslySetInnerHTML={{ __html: result.highlightedTitle }} />
      <p className="search-snippet" dangerouslySetInnerHTML={{ __html: result.highlightedSnippet }} />
      <div className="tag-row">
        {result.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

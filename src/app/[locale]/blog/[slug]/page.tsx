import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { JsonLd } from '@/components/json-ld';
import { getBlogCategoryLabel, getBlogDetailViewModel } from '@/content/site-content';
import { MarkdownBody } from '@/lib/markdown';
import { requireLocale } from '@/lib/locale';
import { hasBlogSlugAlias, resolveBlogSlug } from '@/lib/blog/slug-aliases';
import { buildArticleJsonLd, buildMetadata, getBlogAlternates } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = requireLocale(localeParam);
  const normalizedSlug = resolveBlogSlug(decodeRouteSlug(slug));
  const viewModel = getBlogDetailViewModel(locale, normalizedSlug);
  if (!viewModel) {
    return buildMetadata({
      locale,
      title: 'Blog post',
      description: 'Blog post not found.',
      path: `/${locale}/blog/${normalizedSlug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    locale,
    title: viewModel.item.title,
    description: viewModel.item.summary,
    path: `/${locale}/blog/${encodeURIComponent(normalizedSlug)}`,
    alternatePaths: getBlogAlternates(locale, normalizedSlug),
    imagePath: viewModel.item.heroImage,
    type: 'article',
    publishedTime: viewModel.item.updatedAt,
    modifiedTime: viewModel.item.updatedAt,
    keywords: viewModel.item.tags,
    section: getBlogCategoryLabel(locale, viewModel.item.category),
  });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  await connection();
  const { locale: localeParam, slug } = await params;
  const locale = requireLocale(localeParam);
  const normalizedSlug = resolveBlogSlug(decodeRouteSlug(slug));
  if (hasBlogSlugAlias(decodeRouteSlug(slug)) && normalizedSlug !== slug) {
    const canonicalPath = `/${locale}/blog/${encodeURIComponent(normalizedSlug)}`;
    redirect(canonicalPath);
  }

  const viewModel = getBlogDetailViewModel(locale, normalizedSlug);
  if (!viewModel) notFound();

  return (
    <article>
      <JsonLd
        data={buildArticleJsonLd({
          locale,
          title: viewModel.item.title,
          description: viewModel.item.summary,
          path: `/${locale}/blog/${encodeURIComponent(normalizedSlug)}`,
          imagePath: viewModel.item.heroImage,
          publishedTime: viewModel.item.updatedAt,
          modifiedTime: viewModel.item.updatedAt,
          keywords: viewModel.item.tags,
          type: 'BlogPosting',
        })}
      />
      <header className="article-hero">
        <p className="eyebrow">
          {viewModel.item.updatedAt} / {getBlogCategoryLabel(locale, viewModel.item.category)}
        </p>
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
              <Link className="item" key={post.id} href={`/${locale}/blog/${encodeURIComponent(post.slug)}`}>
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

function decodeRouteSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

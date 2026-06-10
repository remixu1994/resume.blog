import Link from 'next/link';
import type { ArchitectureCase, Locale, PublicPostSummary, TopicShowcase } from '@devfolio-blog/shared-types';
import { getBlogCategoryLabel } from '@/content/site-content';

export function ArchitectureCard({ locale, item }: { locale: Locale; item: ArchitectureCase }) {
  return (
    <Link className="panel item" href={`/${locale}/architecture/${item.slug}`}>
      <p className="eyebrow">{item.updatedAt}</p>
      <h2>{item.title}</h2>
      <p>{item.summary}</p>
      <div className="tag-row">
        {item.stack.slice(0, 4).map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

export function PostCard({ locale, post }: { locale: Locale; post: PublicPostSummary }) {
  return (
    <Link className="item" href={`/${locale}/blog/${encodeURIComponent(post.slug)}`}>
      <p className="article-meta">
        {post.updatedAt} / {getBlogCategoryLabel(locale, post.category)}
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
  );
}

export function TopicCard({ locale, item }: { locale: Locale; item: TopicShowcase }) {
  const path = item.slug === 'fitness-ai-agent' ? 'fitness' : item.slug.replace('-notes', '');

  return (
    <Link className="panel item" href={`/${locale}/${path}`}>
      <p className="eyebrow">{item.eyebrow}</p>
      <h2>{item.title}</h2>
      <p>{item.summary}</p>
    </Link>
  );
}

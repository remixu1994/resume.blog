import Link from 'next/link';
import type { ArchitectureCase, PublicPostSummary, TopicShowcase } from '@devfolio-blog/shared-types';

export function ArchitectureCard({ locale, item }: { locale: string; item: ArchitectureCase }) {
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

export function PostCard({ locale, post }: { locale: string; post: PublicPostSummary }) {
  return (
    <Link className="item" href={`/${locale}/blog/${post.slug}`}>
      <p className="article-meta">
        {post.updatedAt}
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

export function TopicCard({ locale, item }: { locale: string; item: TopicShowcase }) {
  const path = item.slug === 'fitness-ai-agent' ? 'fitness' : item.slug.replace('-notes', '');

  return (
    <Link className="panel item" href={`/${locale}/${path}`}>
      <p className="eyebrow">{item.eyebrow}</p>
      <h2>{item.title}</h2>
      <p>{item.summary}</p>
    </Link>
  );
}

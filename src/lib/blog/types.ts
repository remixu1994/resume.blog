import type { Locale, PostStatus } from '@devfolio-blog/shared-types';

export type BlogSource = 'md' | 'sqlite';

export interface BlogPost {
  id: string;
  slug: string;
  locale: Locale;
  title: string;
  summary: string;
  category: string;
  heroImage: string;
  updatedAt: string;
  tags: string[];
  published: boolean;
  status: PostStatus;
  body: string;
  source: BlogSource;
  series?: string;
}

export type BlogPostSummary = Omit<BlogPost, 'body'>;

export interface BlogPostQuery {
  locale: Locale;
  category?: string;
}

export interface BlogContentSource {
  listPosts(): BlogPost[];
}

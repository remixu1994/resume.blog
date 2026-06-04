# Blog Module Design Plan

## Summary
Build the Blog module as a public read-only Next.js server-side feature with two content sources:

- **Primary source:** sqlite at runtime via `better-sqlite3`
- **Secondary source:** markdown files at `content/blog/{locale}/{slug}.md`
- **Merge rule:** sqlite overrides markdown when `locale + slug` collide
- **Output:** unified post list/detail view models rendered through the existing Markdown-to-HTML pipeline

## Key Changes

- Add dependencies:
  - `better-sqlite3`
  - `@types/better-sqlite3`
- Introduce a focused blog data layer under `src/lib/blog/`:
  - `types.ts`: shared `BlogPost`, `BlogPostSummary`, `BlogSource`, query types
  - `schema.ts`: zod validation for unified posts and sqlite rows
  - `markdown-source.ts`: load `content/blog/{locale}/{slug}.md`, parse frontmatter, render body later
  - `sqlite-source.ts`: open sqlite from `BLOG_DB_PATH`, defaulting to `data/blog.sqlite`
  - `repository.ts`: merge sources, filter published posts, sort by `updatedAt desc`
- Move Blog view model logic out of `src/content/site-content.ts` into repository-backed selectors:
  - `listBlogPosts(locale)`
  - `getBlogPost(locale, slug)`
  - `getRelatedBlogPosts(post, posts)`
  - `getStaticMarkdownBlogParams()`

## Public Interfaces

- Markdown frontmatter fields:
  - `id`
  - `slug`
  - `locale`
  - `title`
  - `summary`
  - `heroImage`
  - `updatedAt`
  - `tags`
  - `published`
  - `status`
  - optional `series`
- sqlite table: `blog_posts`
  - `id text primary key`
  - `slug text not null`
  - `locale text not null`
  - `title text not null`
  - `summary text not null`
  - `hero_image text not null`
  - `updated_at text not null`
  - `tags_json text not null`
  - `published integer not null`
  - `status text not null`
  - `series text`
  - `body text not null`
  - unique index on `(locale, slug)`
- Blog pages:
  - `src/app/[locale]/blog/page.tsx` reads runtime repository data
  - `src/app/[locale]/blog/[slug]/page.tsx` supports markdown static params plus runtime sqlite slugs
  - Blog routes should be runtime-rendered, not fully static-exported

## Test Plan

- Add repository tests covering:
  - markdown frontmatter parsing
  - sqlite rows mapping into unified posts
  - sqlite overrides markdown for same `locale + slug`
  - unpublished/draft posts are excluded from public list
  - posts sort by `updatedAt` descending
  - detail lookup returns `null` for missing slug
- Keep existing markdown rendering test.
- Update content selector tests to use the new repository-backed Blog list.
- Run:
  - `npm test`
  - `npm run lint`
  - `npm run build`

## Assumptions

- This phase does **not** include admin UI, write APIs, authentication, or media upload.
- Blog content is public-only and only published posts render.
- sqlite updates should be visible at runtime without rebuilding.
- Markdown files are seed/fallback content, not the authoritative source once sqlite contains the same post.

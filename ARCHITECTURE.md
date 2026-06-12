# ARCHITECTURE.md — resume.blog

> Last updated: 2026-06-11

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 15.3+ | App Router, SSR/SSG, API routes |
| UI Library | React | 19.1+ | Component rendering |
| Language | TypeScript | 5.8+ | Type safety |
| Styling | Tailwind CSS | 3.4+ | Utility-first CSS |
| Database | better-sqlite3 | 12.10+ | Blog content storage |
| Validation | Zod | 4.4+ | Schema validation |
| Markdown | marked | 18.0+ | Markdown rendering |
| Diagrams | mermaid | 11.15+ | Architecture diagrams in blog |
| Testing | Vitest | 3.2+ | Unit testing |
| Linting | ESLint | 9.39+ | Code quality |
| Package Manager | npm | — | Dependency management |
| Runtime | Node.js | >= 20 | Server-side execution |
| Hosting | Vercel | — | Deployment platform |

---

## Directory Structure

```
resume.blog/
├── src/
│   ├── app/                    # Next.js App Router (pages & layouts)
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   ├── page.tsx            # Index → redirect to /zh
│   │   ├── not-found.tsx       # 404 page
│   │   ├── sitemap.ts          # Dynamic sitemap generation
│   │   ├── robots.ts           # Robots.txt
│   │   ├── opengraph-image.tsx # OG image generation
│   │   ├── twitter-image.tsx   # Twitter card image
│   │   └── [locale]/           # Locale-scoped routes
│   │       ├── layout.tsx      # Locale layout (i18n provider)
│   │       ├── page.tsx        # Home page
│   │       ├── resume/         # Resume page
│   │       ├── blog/           # Blog list + detail
│   │       ├── books/          # Book recommendations
│   │       ├── recipes/        # Recipe collection
│   │       ├── fitness/        # Fitness content
│   │       ├── unraid/         # Unraid NAS topics
│   │       └── architecture/   # Architecture case studies
│   ├── components/             # Shared React components
│   │   ├── site-shell.tsx      # Navigation shell
│   │   ├── cards.tsx           # Card components
│   │   ├── topic-page.tsx      # Topic page layout
│   │   ├── json-ld.tsx         # Structured data
│   │   ├── markdown-mermaid.tsx # Mermaid diagram renderer
│   │   ├── markdown-code-copy.tsx # Code block copy button
│   │   └── resume-project-showcase.tsx
│   ├── content/
│   │   └── site-content.ts     # View model factory functions
│   ├── lib/                    # Core business logic
│   │   ├── api.ts              # API utilities
│   │   ├── blog/               # Blog module
│   │   │   ├── types.ts        # BlogPost, BlogPostSummary types
│   │   │   ├── schema.ts       # Zod schemas (blogPostSchema, sqliteBlogPostRowSchema)
│   │   │   ├── repository.ts   # Blog data access (list, get, filter)
│   │   │   ├── sqlite-source.ts # SQLite content source
│   │   │   ├── markdown-source.ts # Markdown file content source
│   │   │   ├── tags.ts         # Tag processing
│   │   │   └── slug-aliases.ts # Legacy slug redirects
│   │   ├── locale.ts           # Locale utilities (zh/en)
│   │   ├── markdown.tsx        # Markdown rendering
│   │   ├── recipes.ts          # Recipe data access
│   │   └── seo.ts              # SEO metadata helpers
│   └── legacy/                 # Legacy content modules (gradual migration)
│       ├── content-data/       # Static content data
│       ├── content-schema/     # Content validation schemas
│       ├── i18n/               # Internationalization dictionaries
│       ├── markdown/           # Markdown rendering utilities
│       └── shared-types/       # Shared TypeScript types
├── data/
│   └── blog.sqlite             # SQLite database (blog content)
├── public/                     # Static assets (images, fonts)
├── tests/                      # Unit tests
│   ├── blog.test.ts            # Blog module tests
│   ├── content.test.ts         # Content tests
│   ├── locale.test.ts          # Locale tests
│   ├── markdown.test.ts        # Markdown tests
│   ├── recipes.test.ts         # Recipe tests
│   ├── resume.test.ts          # Resume tests
│   └── seo.test.ts             # SEO tests
├── scripts/                    # Utility scripts
│   ├── import-blog-md-to-sqlite.mjs  # Import markdown → SQLite
│   ├── seed-blog-refinements.mjs     # Seed blog refinements
│   └── seed-dotnet-split-posts.mjs   # Seed .NET split posts
├── docs/                       # Project documentation
│   ├── BRANCH-WORKFLOW.md      # Git branch & PR workflow
│   ├── deployment.md           # Deployment config
│   ├── plans/                  # Planning documents
├── company/                    # Company/project meta docs
│   ├── PROJECT.md              # Project vision & scope
│   ├── ARCHITECTURE.md         # This document
│   └── PLAYBOOK.md             # Operations playbook
└── .github/                    # GitHub Actions workflows
```

---

## Data Model

### Blog Post (SQLite)

```sql
CREATE TABLE blog_posts (
  id          TEXT PRIMARY KEY,
  group_id    TEXT NOT NULL,        -- Groups translations of same post
  category    TEXT NOT NULL DEFAULT 'uncategorized',
  hero_image  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  tag_ids_json TEXT NOT NULL DEFAULT '[]',
  published   INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'published'
  series      TEXT,
  -- Chinese content
  slug_zh     TEXT,
  title_zh    TEXT,
  summary_zh  TEXT,
  body_zh     TEXT,
  -- English content
  slug_en     TEXT,
  title_en    TEXT,
  summary_en  TEXT,
  body_en     TEXT
);
```

### Blog Categories

```
microservices-ddd    微服务 & DDD
extreme-programming  极限编程
architecture         架构
unraid-nas           Unraid NAS
fundamentals         基础知识技能
dotnet-core          C# / .NET Core
uncategorized        未分类
```

---

## Routes

| Route Pattern | Page Component | Data Source |
|---------------|----------------|-------------|
| `/` | redirect → `/zh` | — |
| `/[locale]` | Home | site-content.ts → getHomeViewModel() |
| `/[locale]/resume` | Resume | site-content.ts → getResumeViewModel() |
| `/[locale]/blog` | Blog List | site-content.ts → getBlogListViewModel() |
| `/[locale]/blog/[slug]` | Blog Detail | site-content.ts → getBlogDetailViewModel() |
| `/[locale]/books` | Books | site-content.ts → getBooksViewModel() |
| `/[locale]/recipes` | Recipe List | recipes.ts → getRecipeSlugs() |
| `/[locale]/recipes/[slug]` | Recipe Detail | recipes.ts → getRecipeBySlug() |
| `/[locale]/fitness` | Fitness | content-data module |
| `/[locale]/unraid` | Unraid | content-data module |
| `/[locale]/architecture` | Architecture List | site-content.ts → getArchitectureListViewModel() |
| `/[locale]/architecture/[slug]` | Architecture Detail | site-content.ts → getArchitectureDetailViewModel() |

---

## Module Dependencies

```
@devfolio-blog/shared-types  ← (no deps, base types)
         ↓
@devfolio-blog/i18n          ← (uses shared-types)
         ↓
@devfolio-blog/content-schema ← (uses shared-types)
         ↓
@devfolio-blog/content-data  ← (uses content-schema, i18n, shared-types)
         ↓
@devfolio-blog/markdown      ← (standalone)
         ↓
src/lib/blog/*               ← (uses @devfolio-blog/*)
src/lib/seo.ts               ← (uses blog/*, content-data, i18n)
src/content/site-content.ts  ← (uses everything above)
         ↓
src/app/[locale]/**          ← (uses site-content for view models)
```

---

## i18n Strategy

- **Locales**: `zh` (default), `en`
- **URL pattern**: `/zh/blog/...`, `/en/blog/...`
- **Content**: Each blog post has separate `slug_zh`/`slug_en`, `title_zh`/`title_en`, etc. columns in SQLite
- **UI strings**: Dictionary files in `src/legacy/i18n/`
- **Switching**: `switchLocale()` utility toggles between zh/en

---

## SEO Implementation

| Feature | Implementation |
|---------|---------------|
| Meta tags | `generateMetadata()` in each page |
| OpenGraph | `opengraph-image.tsx` (dynamic) |
| Twitter cards | `twitter-image.tsx` (dynamic) |
| Sitemap | `sitemap.ts` (dynamic, all locales) |
| Robots.txt | `robots.ts` |
| JSON-LD | `json-ld.tsx` component |
| Canonical URLs | `getSiteUrl()` helper |
| hreflang | Alternate links in metadata |

---

## Development Principles

1. **Keep it simple** — avoid over-engineering, prefer straightforward solutions
2. **Prefer readability** — code is read more than written
3. **Composition over complexity** — small modules, clear interfaces
4. **Backward compatibility** — don't break existing content or URLs
5. **Test important features** — unit tests for business logic, not boilerplate
6. **SEO-first** — every page has proper metadata
7. **Bilingual by default** — all content supports zh/en

---

## Build & Quality Gates

```bash
npm install          # Install dependencies
npm run lint         # ESLint (zero warnings policy)
npm test             # Vitest unit tests
npm run build        # Next.js production build
```

All four must pass before merge. CI runs these automatically via GitHub Actions.

---

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |
| `npm run blog:import` | Import markdown blog posts to SQLite |
| `npm run blog:refine` | Seed blog refinements |

---

## Deployment

- **Platform**: Vercel
- **Config**: `vercel.json` (headers, redirects)
- **Domain**: `resume.blog`
- **Environment**: `SITE_URL` env var for origin override

---

## Related Documents

- [PROJECT.md](./PROJECT.md) — Project vision, user personas, roadmap
- [BRANCH-WORKFLOW.md](./docs/BRANCH-WORKFLOW.md) — Git branch and PR workflow
- [deployment.md](./docs/deployment.md) — Deployment configuration

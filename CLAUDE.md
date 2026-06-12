# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint (zero warnings enforced)
npm test             # Run all Vitest tests (vitest run)
npm test -- tests/blog.test.ts   # Run a single test file
```

Blog data scripts:
```bash
npm run blog:import          # Import markdown blog posts into data/blog.sqlite
npm run blog:refine          # Seed blog refinements
```

## Architecture

**Stack**: Next.js 15 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 3 + better-sqlite3 + Vitest. Node >= 20, npm only.

### Data flow

`src/content/site-content.ts` is the central view-model factory. All page components call functions like `getHomeViewModel(locale)`, `getBlogListViewModel(locale, category)` etc. This decouples pages from data sources.

Blog data lives in `data/blog.sqlite` (read-only at runtime, opened with `readonly: true`). Content is imported via `scripts/import-blog-md-to-sqlite.mjs`, never written at runtime. The `BlogContentSource` interface (`src/lib/blog/types.ts`) abstracts the data layer — currently only SQLite source is active.

Recipes are markdown files in `data/recipes/`, parsed at server start by `scanRecipeFiles()` in `src/lib/recipes.ts`.

### i18n

Bilingual: `zh` (default) and `en`. URL pattern: `/zh/...`, `/en/...`. Root `/` redirects to `/zh`. Blog posts store both languages in the same SQLite row (e.g. `slug_zh`/`slug_en`, `title_zh`/`title_en`). UI strings in dictionary files under `src/legacy/i18n/`.

### Legacy modules

Five `@devfolio-blog/*` packages live under `src/legacy/` and are imported via TS path aliases. These are being gradually migrated into `src/lib/`:
- `@devfolio-blog/content-data` → `./src/legacy/content-data/src/index.ts`
- `@devfolio-blog/content-schema` → `./src/legacy/content-schema/src/index.ts`
- `@devfolio-blog/i18n` → `./src/legacy/i18n/src/index.ts`
- `@devfolio-blog/markdown` → `./src/legacy/markdown/src/index.ts`
- `@devfolio-blog/shared-types` → `./src/legacy/shared-types/src/index.ts`

`@/*` maps to `./src/*`.

### Key patterns

- **SEO-first**: Every page has proper metadata via `src/lib/seo.ts`. Dynamic OG images and sitemap at `src/app/`.
- **Content categories**: `microservices-ddd`, `extreme-programming`, `architecture`, `unraid-nas`, `fundamentals`, `dotnet-core`, `uncategorized`.

## Git workflow

- **All changes must go through PRs** — direct push to main is forbidden.
- Branch naming: `<type>/<task-id>-<short-description>` (e.g., `feat/t_b765cd23-fix-build-and-ci`).
- Types: `feat/`, `fix/`, `refactor/`, `docs/`, `ci/`, `test/`, `perf/`.
- Squash merge recommended.

## CI

GitHub Actions: `ci-baseline.yml` runs lint + test + build on push to main and all PRs. CI uses Node 20 and `npm ci`.

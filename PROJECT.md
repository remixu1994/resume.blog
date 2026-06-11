# PROJECT.md — resume.blog

> Last updated: 2026-06-11

---

## Vision

Build a modern personal website that combines **blog**, **resume**, **portfolio**, and **technical sharing** into a single, fast, SEO-friendly platform.

The site is bilingual (中文 / English) and covers:

- Full-stack engineering & architecture
- Self-hosting & infrastructure (Unraid NAS)
- Fitness & recipes
- AI product work
- Book recommendations

---

## User Personas

### 1. Recruiter / Hiring Manager

- **Goal**: Quickly assess technical skills, career history, and project experience.
- **Behavior**: Visits resume page first, scans for role/company/skill keywords, checks blog for depth.
- **Need**: Fast load, clean layout, printable resume.

### 2. Developer / Peer Engineer

- **Goal**: Learn from technical articles, evaluate architecture decisions, find useful patterns.
- **Behavior**: Browses blog by category/series, reads architecture case studies, checks book recommendations.
- **Need**: Good code rendering, mermaid diagrams, series navigation, dark mode.

### 3. Self-hosting Enthusiast

- **Goal**: Find Unraid/NAS setup tips, infrastructure recipes.
- **Behavior**: Searches for specific topics, follows step-by-step guides.
- **Need**: Clear headings, copyable code blocks, searchable content.

---

## Main Sections

| Route | Description |
|-------|-------------|
| `/[locale]` | Home — featured content, recent posts, highlights |
| `/[locale]/resume` | Career history, skills, experience |
| `/[locale]/blog` | Blog list with category/topic/series filters |
| `/[locale]/blog/[slug]` | Blog post detail |
| `/[locale]/books` | Book recommendations with reading path |
| `/[locale]/recipes` | Recipe collection |
| `/[locale]/recipes/[slug]` | Recipe detail |
| `/[locale]/fitness` | Fitness / AI agent content |
| `/[locale]/unraid` | Unraid NAS topics |
| `/[locale]/architecture` | Architecture case studies |
| `/[locale]/architecture/[slug]` | Architecture case detail |

---

## MVP Scope

### In Scope (MVP)

- [x] Personal homepage with featured content
- [x] Resume page with career history
- [x] Blog list with category filtering
- [x] Blog detail with markdown rendering (code blocks, mermaid diagrams)
- [x] Blog series navigation
- [x] Bilingual support (zh/en)
- [x] SEO metadata (OpenGraph, Twitter cards, sitemap, robots.txt)
- [x] Responsive design (mobile + desktop)
- [x] Book recommendations page
- [x] Recipe pages
- [x] SQLite-backed blog content
- [x] Markdown import scripts
- [x] Unit tests for core modules

### Out of Scope (Future)

- [ ] Full-text search
- [ ] Comments system
- [ ] Analytics integration
- [ ] RSS feed
- [ ] Newsletter subscription
- [ ] AI assistant / chatbot
- [ ] Automatic publishing pipeline
- [ ] User authentication

---

## Roadmap

### Phase 1 — Foundation (Done)

- Project setup (Next.js 15 + React 19 + TypeScript + Tailwind)
- Blog module with SQLite storage
- Resume page
- i18n (zh/en)
- SEO basics

### Phase 2 — Content & Polish (Current)

- Architecture case studies
- Book recommendations with reading path
- Recipe collection
- CI/CD pipeline (GitHub Actions)
- Branch & PR workflow documentation
- Baseline documentation (this document)

### Phase 3 — Growth (Planned)

- Full-text search (SQLite FTS or Algolia)
- RSS feed
- Comments (Giscus or similar)
- Analytics (Plausible or similar)
- Performance optimization (image CDN, edge caching)

### Phase 4 — Advanced (Future)

- AI-powered content recommendations
- Newsletter integration
- Automatic social media posting
- Multi-author support

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Page load (LCP) | < 2.5s | Lighthouse |
| Lighthouse score | > 90 | Lighthouse CI |
| Blog posts published | > 20 | Content count |
| Test coverage (core modules) | > 80% | Vitest coverage |
| SEO: indexed pages | > 30 | Google Search Console |
| Bounce rate | < 60% | Analytics (future) |

---

## Content Model

### Blog Post

- **Storage**: SQLite (`data/blog.sqlite`) + Markdown files
- **Fields**: id, slug, locale, title, summary, category, heroImage, tags, status, body, series
- **Categories**: microservices-ddd, extreme-programming, architecture, unraid-nas, fundamentals, dotnet-core

### Resume

- **Storage**: TypeScript data module (`@devfolio-blog/content-data`)
- **Fields**: profiles per locale, skills, experience, education

### Books

- **Storage**: TypeScript data module
- **Fields**: slug, title, author, summary, takeaway, recommendation, quote, featured flag

### Recipes

- **Storage**: Markdown files in `data/`
- **Fields**: slug, title, ingredients, steps, images

---

## Development Principles

1. **Keep it simple** — avoid over-engineering
2. **Prefer readability** — code is read more than written
3. **Composition over complexity** — small modules, clear interfaces
4. **Backward compatibility** — don't break existing content
5. **Test important features** — unit tests for business logic
6. **SEO-first** — every page has proper metadata
7. **Bilingual by default** — all content supports zh/en

---

## Constraints

- **Hosting**: Vercel (Next.js optimized)
- **Database**: SQLite (file-based, no external DB)
- **Node**: >= 20
- **Package manager**: npm
- **No server-side state**: static + ISR where possible

---

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical architecture and directory structure
- [BRANCH-WORKFLOW.md](./docs/BRANCH-WORKFLOW.md) — Git branch and PR workflow
- [deployment.md](./docs/deployment.md) — Deployment configuration

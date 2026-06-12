# Deployment Guide

## Target platform

The project is configured for Vercel via `vercel.json` and expects a standard Next.js 15 build:

- install: `npm ci`
- build: `npm run build`
- runtime: `npm run start` (for local production verification)

## Required environment variables

Copy `.env.example` and set these values in Vercel Project Settings or your deployment environment:

- `SITE_URL` — canonical production origin used by metadata, JSON-LD, `robots.txt`, and `sitemap.xml`

## Local production check

Run this before shipping:

```bash
npm ci
npm run lint
npm test
npm run build
npm run start
```

Then verify:

- `/robots.txt`
- `/sitemap.xml`
- `/zh`, `/en`
- representative detail pages such as `/zh/blog/<slug>` and `/zh/architecture/<slug>`
- a missing route like `/zh/does-not-exist`

## Vercel rollout steps

1. Import the repository into Vercel.
2. Set the environment variables from `.env.example`.
3. Confirm `SITE_URL` matches the production domain.
4. Trigger a preview deployment and smoke test metadata, sitemap, and 404 flows.


## Notes

- `next/font` is already used for Inter and Noto Sans SC to avoid render-blocking font fetches.
- `next/image` is used for recipe, books, and resume showcase media so Vercel can serve optimized formats.
- `next.config.ts` enables AVIF/WebP output and disables the `x-powered-by` header.

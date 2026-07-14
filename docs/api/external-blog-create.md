# External blog creation API

`POST /api/v1/blog/posts` creates a bilingual draft or publishes a complete post. It is intended for trusted server-side automation and does not accept the admin browser Cookie.

## Authentication and retries

Configure one or more opaque tokens, each at least 32 characters long:

```dotenv
ADMIN_API_TOKENS=first-long-random-token,second-long-random-token
```

Send one token with `Authorization: Bearer ...`. During rotation, add the new token, deploy, move callers to it, and then remove the old token. Never expose tokens to browser JavaScript or log the Authorization header.

Every request must include an `Idempotency-Key` containing 8-128 letters, numbers, dots, underscores, colons, or hyphens. A successful retry with the same normalized body returns the same post with HTTP 200 and `Idempotency-Replayed: true`. Reusing a key with different content returns HTTP 409.

## Create a draft

```bash
curl -X POST "https://example.com/api/v1/blog/posts" \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Idempotency-Key: article:2026-07-14:001" \
  -H "Content-Type: application/json" \
  --data '{
    "status": "draft",
    "category": "architecture",
    "heroImage": "/assets/blog/nx-monorepo.svg",
    "tagIds": ["dotnet", "architecture"],
    "series": "",
    "zh": { "slug": "example-zh", "title": "中文标题", "summary": "", "body": "" },
    "en": { "slug": "example-en", "title": "English title", "summary": "", "body": "" }
  }'
```

Omit `status` to create a draft. Draft localized fields may be empty. Publishing requires canonical slugs plus non-empty titles, summaries, and Markdown bodies in both languages.

Published posts may reference only `/assets/` URLs or object-storage URLs already marked ready through the admin upload workflow. This v1 API does not upload images and does not enable cross-origin browser access.

The complete machine-readable contract is in `docs/api/blog-v1.openapi.yaml`.

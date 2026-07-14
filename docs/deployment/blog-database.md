# Production blog database

Blog content must not be stored in the deployed repository or in an ephemeral container filesystem. The application uses SQLite locally when no remote configuration is present, and switches to PostgreSQL or MySQL when `BLOG_DATABASE_URL` is configured.

## Configure the application

Set these environment variables on the server or hosting platform:

```dotenv
BLOG_DB_PROVIDER=postgres
BLOG_DATABASE_URL=postgresql://blog_user:password@db.example.com:5432/resume_blog
```

For MySQL, use `BLOG_DB_PROVIDER=mysql` and a `mysql://` URL. The provider can be inferred from the URL, but setting it explicitly makes a misconfiguration easier to spot.

Do not set these values in source control. `.env.example` contains only placeholders.

## Initialize the database

Run this once in the deployment environment after setting the variables:

```bash
npm run blog:db:setup
```

The command creates the `blog_posts` table and its locale slug indexes. It is safe to run again when the schema is unchanged.

## Move existing SQLite content

After the remote schema is ready, copy the existing local content before deploying the remote configuration:

```bash
npm run blog:db:migrate
```

The migration reads `BLOG_DB_PATH` (or `data/blog.sqlite`) and upserts every blog group to the configured remote database. It is safe to repeat. Run it from a machine that has the source SQLite file and network access to the production database; do not commit the SQLite file as part of a deployment workflow.

## Runtime behavior

- No `BLOG_DATABASE_URL`: reads the existing SQLite file at `BLOG_DB_PATH` or `data/blog.sqlite`.
- PostgreSQL/MySQL configured: public blog routes read only rows where `published = true` and `status = 'published'`.
- Connections are pooled per Node.js process, so published content changes become visible on the next dynamic request without rebuilding or redeploying the site.

The existing Markdown-to-SQLite importer remains a local seed workflow. Before production publishing is enabled, add a corresponding remote import or use the planned admin publishing API to write directly to the configured database.

## Admin publishing

The admin workspace requires PostgreSQL and these server-only variables:

```dotenv
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_SESSION_SECRET=replace-with-at-least-32-random-characters
ADMIN_APP_URL=https://example.com
ADMIN_API_TOKENS=replace-with-a-random-api-token-at-least-32-characters
```

`ADMIN_API_TOKENS` enables the server-to-server `POST /api/v1/blog/posts` endpoint. Multiple comma-separated tokens support rotation without downtime. Each token must contain at least 32 characters. This API uses Bearer authentication rather than the admin Cookie, and every request requires an `Idempotency-Key`.

Run the schema migration after deploying a version that includes the external API. Migration `003_external_blog_api` creates the durable idempotency table:

```bash
npm run blog:db:migrate
```

See `docs/api/external-blog-create.md` and `docs/api/blog-v1.openapi.yaml` for the request contract and examples.

Run `npm run blog:db:migrate` after deployment to apply the versioned blog schema. To import the existing SQLite content, run `npm run blog:db:import-sqlite` from a trusted machine with access to both databases.

Image uploads use an S3-compatible object store:

```dotenv
BLOG_ASSET_S3_ENDPOINT=https://s3.example.com
BLOG_ASSET_S3_REGION=auto
BLOG_ASSET_S3_BUCKET=resume-blog-assets
BLOG_ASSET_S3_ACCESS_KEY_ID=replace-me
BLOG_ASSET_S3_SECRET_ACCESS_KEY=replace-me
BLOG_ASSET_PUBLIC_BASE_URL=https://assets.example.com
BLOG_ASSET_S3_FORCE_PATH_STYLE=false
```

Configure bucket CORS to allow `PUT` from `ADMIN_APP_URL` and public `GET` through `BLOG_ASSET_PUBLIC_BASE_URL`. Uploaded JPEG, PNG, WebP, and GIF files are limited to 10 MB and become usable only after the application confirms their object metadata.

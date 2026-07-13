import { randomUUID } from 'node:crypto';
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { marked } from 'marked';
import { getAdminPool } from './admin-repository';

const extensionByType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function createBlogAssetUpload(input: { fileName: string; contentType: string; sizeBytes: number }) {
  const config = getAssetConfig();
  const id = randomUUID();
  const date = new Date();
  const extension = extensionByType[input.contentType];
  if (!extension) throw new Error('Unsupported asset type.');
  const objectKey = `blog/${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${id}.${extension}`;
  const publicUrl = `${config.publicBaseUrl}/${objectKey}`;

  await getAdminPool().query(
    `insert into blog_assets (id, object_key, public_url, content_type, size_bytes, status)
     values ($1, $2, $3, $4, $5, 'pending')`,
    [id, objectKey, publicUrl, input.contentType, input.sizeBytes],
  );

  const uploadUrl = await getSignedUrl(
    getS3Client(config),
    new PutObjectCommand({ Bucket: config.bucket, Key: objectKey, ContentType: input.contentType, ContentLength: input.sizeBytes }),
    { expiresIn: 10 * 60 },
  );
  return { id, objectKey, publicUrl, uploadUrl, contentType: input.contentType };
}

export async function completeBlogAssetUpload(id: string) {
  const pool = getAdminPool();
  const result = await pool.query(
    `select id, object_key, public_url, content_type, size_bytes from blog_assets where id = $1 and status = 'pending'`,
    [id],
  );
  const asset = result.rows[0];
  if (!asset) return null;

  const config = getAssetConfig();
  const metadata = await getS3Client(config).send(new HeadObjectCommand({ Bucket: config.bucket, Key: asset.object_key }));
  if (metadata.ContentType !== asset.content_type || metadata.ContentLength !== asset.size_bytes) {
    throw new Error('Uploaded object metadata does not match the requested asset.');
  }

  await pool.query(`update blog_assets set status = 'ready', ready_at = now() where id = $1`, [id]);
  return { id: asset.id, publicUrl: asset.public_url, contentType: asset.content_type, sizeBytes: asset.size_bytes };
}

export async function isAllowedBlogAssetUrl(url: string) {
  if (url.startsWith('/assets/')) return true;
  const result = await getAdminPool().query(
    `select 1 from blog_assets where public_url = $1 and status = 'ready'`,
    [url],
  );
  return Boolean(result.rowCount);
}

export async function findInvalidBlogAssetUrl(heroImage: string, bodies: string[]) {
  const urls = new Set([heroImage]);
  for (const body of bodies) {
    const tokens = marked.lexer(body);
    marked.walkTokens(tokens, (token) => {
      if (token.type === 'image') urls.add(token.href);
    });
  }
  for (const url of urls) {
    if (!(await isAllowedBlogAssetUrl(url))) return url;
  }
  return null;
}

function getAssetConfig() {
  const endpoint = required('BLOG_ASSET_S3_ENDPOINT');
  const region = required('BLOG_ASSET_S3_REGION');
  const bucket = required('BLOG_ASSET_S3_BUCKET');
  const accessKeyId = required('BLOG_ASSET_S3_ACCESS_KEY_ID');
  const secretAccessKey = required('BLOG_ASSET_S3_SECRET_ACCESS_KEY');
  const publicBaseUrl = required('BLOG_ASSET_PUBLIC_BASE_URL').replace(/\/$/, '');
  return {
    endpoint, region, bucket, accessKeyId, secretAccessKey, publicBaseUrl,
    forcePathStyle: process.env.BLOG_ASSET_S3_FORCE_PATH_STYLE === 'true',
  };
}

function getS3Client(config: ReturnType<typeof getAssetConfig>) {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: config.forcePathStyle,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });
}

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for blog asset uploads.`);
  return value;
}

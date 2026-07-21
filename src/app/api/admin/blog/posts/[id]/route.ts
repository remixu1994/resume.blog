import { NextRequest, NextResponse } from 'next/server';
import { apiError, handleAdminApiError, requireAdmin } from '@/lib/admin/api';
import { adminBlogPostInputSchema, publishBlogPostInputSchema } from '@/lib/blog/admin-schema';
import { getAdminBlogPost, updateAdminBlogPost } from '@/lib/blog/admin-repository';
import { findInvalidBlogAssetUrl } from '@/lib/blog/assets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;
  try {
    const item = await getAdminBlogPost((await params).id);
    return item ? NextResponse.json({ item }) : apiError('NOT_FOUND', 'Blog post was not found.', 404);
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request, { write: true });
  if (auth.response) return auth.response;
  try {
    const { id } = await params;
    const current = await getAdminBlogPost(id);
    if (!current) return apiError('NOT_FOUND', 'Blog post was not found.', 404);

    const schema = current.published ? publishBlogPostInputSchema : adminBlogPostInputSchema;
    const input = schema.parse(await request.json());
    if (current.published) {
      const invalidAsset = await findInvalidBlogAssetUrl(input.heroImage, [input.zh.body, input.en.body]);
      if (invalidAsset) {
        return apiError('INVALID_ASSET', `Image is not an existing asset or completed upload: ${invalidAsset}`, 400);
      }
    }

    const item = await updateAdminBlogPost(id, input);
    return item ? NextResponse.json({ item }) : apiError('NOT_FOUND', 'Blog post was not found.', 404);
  } catch (error) {
    return handleAdminApiError(error);
  }
}

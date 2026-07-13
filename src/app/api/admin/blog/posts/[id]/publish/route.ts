import { NextRequest, NextResponse } from 'next/server';
import { apiError, handleAdminApiError, requireAdmin } from '@/lib/admin/api';
import { publishBlogPostInputSchema } from '@/lib/blog/admin-schema';
import { publishAdminBlogPost } from '@/lib/blog/admin-repository';
import { findInvalidBlogAssetUrl } from '@/lib/blog/assets';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request, { write: true });
  if (auth.response) return auth.response;
  try {
    const input = publishBlogPostInputSchema.parse(await request.json());
    const invalidAsset = await findInvalidBlogAssetUrl(input.heroImage, [input.zh.body, input.en.body]);
    if (invalidAsset) {
      return apiError('INVALID_ASSET', `Image is not an existing asset or completed upload: ${invalidAsset}`, 400);
    }
    const item = await publishAdminBlogPost((await params).id, input);
    return item ? NextResponse.json({ item }) : apiError('NOT_FOUND', 'Blog post was not found.', 404);
  } catch (error) {
    return handleAdminApiError(error);
  }
}

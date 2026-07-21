import { NextRequest, NextResponse } from 'next/server';
import { handleAdminApiError, requireAdmin } from '@/lib/admin/api';
import { assetUploadInputSchema } from '@/lib/blog/admin-schema';
import { createBlogAssetUpload } from '@/lib/blog/assets';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request, { write: true });
  if (auth.response) return auth.response;
  try {
    const input = assetUploadInputSchema.parse(await request.json());
    return NextResponse.json({ asset: await createBlogAssetUpload(input) }, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { apiError, handleAdminApiError, requireAdmin } from '@/lib/admin/api';
import { completeBlogAssetUpload } from '@/lib/blog/assets';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request, { write: true });
  if (auth.response) return auth.response;
  try {
    const asset = await completeBlogAssetUpload((await params).id);
    return asset ? NextResponse.json({ asset }) : apiError('NOT_FOUND', 'Pending asset was not found.', 404);
  } catch (error) {
    return handleAdminApiError(error);
  }
}

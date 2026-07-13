import { NextRequest, NextResponse } from 'next/server';
import { apiError, handleAdminApiError, requireAdmin } from '@/lib/admin/api';
import { adminBlogPostInputSchema } from '@/lib/blog/admin-schema';
import { getAdminBlogPost, updateAdminBlogPost } from '@/lib/blog/admin-repository';

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
    const input = adminBlogPostInputSchema.parse(await request.json());
    const item = await updateAdminBlogPost((await params).id, input);
    return item ? NextResponse.json({ item }) : apiError('NOT_FOUND', 'Blog post was not found.', 404);
  } catch (error) {
    return handleAdminApiError(error);
  }
}

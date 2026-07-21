import { NextRequest, NextResponse } from 'next/server';
import { apiError, handleAdminApiError, requireAdmin } from '@/lib/admin/api';
import { unpublishAdminBlogPost } from '@/lib/blog/admin-repository';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(request, { write: true });
  if (auth.response) return auth.response;
  try {
    const item = await unpublishAdminBlogPost((await params).id);
    return item ? NextResponse.json({ item }) : apiError('NOT_FOUND', 'Blog post was not found.', 404);
  } catch (error) {
    return handleAdminApiError(error);
  }
}

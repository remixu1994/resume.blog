import { NextRequest, NextResponse } from 'next/server';
import { handleAdminApiError, requireAdmin } from '@/lib/admin/api';
import { adminBlogPostInputSchema } from '@/lib/blog/admin-schema';
import { createAdminBlogPost, listAdminBlogPosts } from '@/lib/blog/admin-repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;
  try {
    return NextResponse.json({ items: await listAdminBlogPosts() });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request, { write: true });
  if (auth.response) return auth.response;
  try {
    const input = adminBlogPostInputSchema.parse(await request.json());
    return NextResponse.json({ item: await createAdminBlogPost(input) }, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

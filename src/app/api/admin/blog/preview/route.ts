import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { renderMarkdown } from '@devfolio-blog/markdown';
import { handleAdminApiError, requireAdmin } from '@/lib/admin/api';

const previewSchema = z.object({ body: z.string().max(200_000) });

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request, { write: true });
  if (auth.response) return auth.response;
  try {
    const { body } = previewSchema.parse(await request.json());
    return NextResponse.json({ html: renderMarkdown(body) });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

import { notFound } from 'next/navigation';
import { AdminPostEditor } from '@/components/admin/admin-post-editor';
import { AdminShell } from '@/components/admin/admin-shell';
import { requireAdminPage } from '@/lib/admin/server';
import { getAdminBlogPost } from '@/lib/blog/admin-repository';

export const dynamic = 'force-dynamic';

export default async function AdminBlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPage();
  const item = await getAdminBlogPost((await params).id);
  if (!item) notFound();
  return <AdminShell username={session.username}><AdminPostEditor initialPost={item} /></AdminShell>;
}

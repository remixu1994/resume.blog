import Link from 'next/link';
import { ArrowUpRight, CircleCheck, CircleDashed } from 'lucide-react';
import { AdminShell } from '@/components/admin/admin-shell';
import { CreatePostButton } from '@/components/admin/create-post-button';
import { requireAdminPage } from '@/lib/admin/server';
import { listAdminBlogPosts } from '@/lib/blog/admin-repository';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const session = await requireAdminPage();
  const posts = await listAdminBlogPosts();
  const published = posts.filter((post) => post.published).length;
  return (
    <AdminShell username={session.username}>
      <header className="admin-page-head"><div><p>文章</p><h1>内容库</h1><span>{posts.length} 篇内容，{published} 篇已发布</span></div><CreatePostButton /></header>
      <section className="admin-post-table" aria-label="博客文章">
        <div className="admin-post-row admin-post-row-head"><span>文章</span><span>状态</span><span>更新日期</span><span aria-hidden="true" /></div>
        {posts.map((post) => (
          <Link className="admin-post-row" href={`/admin/blog/${post.id}`} key={post.id}>
            <span className="admin-post-title"><strong>{post.zh.title || post.en.title || '未命名草稿'}</strong><small>{post.zh.slug || post.en.slug || post.id}</small></span>
            <span className={`admin-status ${post.published ? 'is-published' : ''}`}>{post.published ? <CircleCheck size={15} /> : <CircleDashed size={15} />}{post.published ? '已发布' : '草稿'}</span>
            <span>{post.updatedAt.slice(0, 10)}</span><ArrowUpRight size={17} />
          </Link>
        ))}
        {!posts.length ? <div className="admin-empty">还没有文章，从一篇双语草稿开始。</div> : null}
      </section>
    </AdminShell>
  );
}

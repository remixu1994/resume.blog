'use client';

import Link from 'next/link';
import { BookOpenText, ExternalLink, LogOut, PenLine } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function AdminShell({ username, children }: { username: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><BookOpenText size={22} /><div><strong>Remi Publish</strong><span>内容工作台</span></div></div>
        <nav className="admin-nav" aria-label="后台导航">
          <Link className={pathname === '/admin/blog' ? 'is-active' : ''} href="/admin/blog"><PenLine size={17} />文章</Link>
          <Link href="/zh/blog" target="_blank"><ExternalLink size={17} />查看站点</Link>
        </nav>
        <div className="admin-account"><span>{username}</span><button type="button" onClick={logout} title="退出登录"><LogOut size={17} /></button></div>
      </aside>
      <main className="admin-workspace">{children}</main>
    </div>
  );
}

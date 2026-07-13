import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { getOptionalAdminPageSession } from '@/lib/admin/server';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await getOptionalAdminPageSession()) redirect('/admin/blog');
  return (
    <main className="admin-login-page">
      <section className="admin-login-panel">
        <div className="admin-login-heading"><p>Remi Publish</p><h1>博客管理后台</h1><span>使用服务器配置的管理员账号登录。</span></div>
        <AdminLoginForm />
      </section>
    </main>
  );
}

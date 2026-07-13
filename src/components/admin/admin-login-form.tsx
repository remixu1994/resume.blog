'use client';

import { useState, type FormEvent } from 'react';
import { LockKeyhole, LogIn, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.get('username'), password: form.get('password') }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error?.message || '登录失败，请检查配置。');
      setSubmitting(false);
      return;
    }
    router.replace('/admin/blog');
    router.refresh();
  }

  return (
    <form className="admin-login-form" onSubmit={submit}>
      <label className="admin-field">
        <span>管理员账号</span>
        <span className="admin-input-wrap"><UserRound size={17} /><input name="username" autoComplete="username" required /></span>
      </label>
      <label className="admin-field">
        <span>密码</span>
        <span className="admin-input-wrap"><LockKeyhole size={17} /><input name="password" type="password" autoComplete="current-password" required /></span>
      </label>
      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      <button className="admin-primary-action" type="submit" disabled={submitting}>
        <LogIn size={17} /> {submitting ? '正在验证' : '进入后台'}
      </button>
    </form>
  );
}

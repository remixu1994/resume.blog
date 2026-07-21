'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreatePostButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    const response = await fetch('/api/admin/blog/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'uncategorized', heroImage: '/assets/blog/nx-monorepo.svg', tagIds: [], series: '', zh: {}, en: {} }),
    });
    const payload = await response.json();
    if (response.ok) router.push(`/admin/blog/${payload.item.id}`);
    else setBusy(false);
  }

  return <button className="admin-primary-action" type="button" onClick={create} disabled={busy}><Plus size={17} />{busy ? '正在创建' : '新建文章'}</button>;
}

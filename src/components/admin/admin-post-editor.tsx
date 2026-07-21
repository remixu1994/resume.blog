'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Archive, Check, CloudUpload, Eye, ImagePlus, Save, Send, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AdminBlogPost, AdminBlogPostInput } from '@/lib/blog/admin-schema';

type Locale = 'zh' | 'en';
type Notice = { tone: 'success' | 'error' | 'neutral'; message: string };

export function AdminPostEditor({ initialPost }: { initialPost: AdminBlogPost }) {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  const [locale, setLocale] = useState<Locale>('zh');
  const [previewHtml, setPreviewHtml] = useState('');
  const [notice, setNotice] = useState<Notice>({ tone: 'neutral', message: '所有更改均需手动保存' });
  const [busy, setBusy] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<'hero' | 'body'>('body');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const response = await fetch('/api/admin/blog/preview', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: post[locale].body }),
      });
      if (response.ok) setPreviewHtml((await response.json()).html);
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [locale, post]);

  const input = toInput(post);

  function updateBase<Key extends keyof Pick<AdminBlogPostInput, 'category' | 'heroImage' | 'series'>>(key: Key, value: AdminBlogPostInput[Key]) {
    setPost((current) => ({ ...current, [key]: value }));
    setNotice({ tone: 'neutral', message: '有尚未保存的更改' });
  }

  function updateLocalized<Key extends keyof AdminBlogPostInput[Locale]>(key: Key, value: string) {
    setPost((current) => ({ ...current, [locale]: { ...current[locale], [key]: value } }));
    setNotice({ tone: 'neutral', message: '有尚未保存的更改' });
  }

  async function requestAction(action: 'save' | 'publish' | 'unpublish') {
    setBusy(action);
    setNotice({ tone: 'neutral', message: action === 'save' ? '正在保存草稿' : action === 'publish' ? '正在发布' : '正在下线' });
    const endpoint = action === 'save' ? `/api/admin/blog/posts/${post.id}` : `/api/admin/blog/posts/${post.id}/${action}`;
    const response = await fetch(endpoint, {
      method: action === 'save' ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: action === 'unpublish' ? undefined : JSON.stringify(input),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setNotice({ tone: 'error', message: payload?.error?.message || '操作失败，请检查内容和服务器配置。' });
      setBusy(null);
      return;
    }
    setPost(payload.item);
    setNotice({ tone: 'success', message: action === 'save' ? '草稿已保存' : action === 'publish' ? '文章已发布' : '文章已下线' });
    setBusy(null);
    router.refresh();
  }

  function selectUpload(target: 'hero' | 'body') {
    setUploadTarget(target);
    fileInput.current?.click();
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const target = uploadTarget;
    const targetLocale = locale;
    setBusy('upload');
    setNotice({ tone: 'neutral', message: '正在上传图片' });
    try {
      const createResponse = await fetch('/api/admin/blog/assets/upload-url', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, sizeBytes: file.size }),
      });
      const created = await createResponse.json();
      if (!createResponse.ok) throw new Error(created?.error?.message || '无法创建上传任务。');
      const putResponse = await fetch(created.asset.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!putResponse.ok) throw new Error('对象存储上传失败。');
      const completeResponse = await fetch(`/api/admin/blog/assets/${created.asset.id}/complete`, { method: 'POST' });
      const completed = await completeResponse.json();
      if (!completeResponse.ok) throw new Error(completed?.error?.message || '无法确认上传结果。');
      if (target === 'hero') {
        updateBase('heroImage', completed.asset.publicUrl);
      } else {
        setPost((current) => {
          const body = current[targetLocale].body.trimEnd();
          const separator = body ? '\n\n' : '';
          return {
            ...current,
            [targetLocale]: {
              ...current[targetLocale],
              body: `${body}${separator}![${file.name}](${completed.asset.publicUrl})\n`,
            },
          };
        });
      }
      setNotice({ tone: 'success', message: '图片已上传，保存文章后生效' });
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : '图片上传失败。' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="admin-editor">
      <header className="admin-editor-head">
        <div><p>编辑文章</p><h1>{post.zh.title || post.en.title || '未命名草稿'}</h1><span className={`admin-editor-notice is-${notice.tone}`}>{notice.tone === 'success' ? <Check size={14} /> : null}{notice.message}</span></div>
        <div className="admin-editor-actions">
          <button type="button" onClick={() => requestAction('save')} disabled={Boolean(busy)}><Save size={17} />保存草稿</button>
          {post.published ? <button type="button" onClick={() => requestAction('unpublish')} disabled={Boolean(busy)}><Archive size={17} />下线</button> : null}
          <button className="is-primary" type="button" onClick={() => requestAction('publish')} disabled={Boolean(busy)}><Send size={17} />发布</button>
        </div>
      </header>

      <section className="admin-editor-meta">
        <label><span>分类</span><input value={post.category} onChange={(event) => updateBase('category', event.target.value)} /></label>
        <label><span>系列</span><input value={post.series} onChange={(event) => updateBase('series', event.target.value)} /></label>
        <label><span>标签 ID</span><input value={post.tagIds.join(', ')} onChange={(event) => setPost((current) => ({ ...current, tagIds: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) }))} /></label>
        <label className="admin-hero-field"><span>封面图片</span><span><input value={post.heroImage} onChange={(event) => updateBase('heroImage', event.target.value)} /><button type="button" onClick={() => selectUpload('hero')} title="上传封面"><ImagePlus size={17} /></button></span></label>
      </section>

      <div className="admin-language-tabs" role="tablist" aria-label="内容语言">
        {(['zh', 'en'] as const).map((item) => <button className={locale === item ? 'is-active' : ''} type="button" role="tab" aria-selected={locale === item} onClick={() => setLocale(item)} key={item}>{item === 'zh' ? '中文' : 'English'}<small>{isComplete(post[item]) ? '完整' : '待补充'}</small></button>)}
      </div>

      <section className="admin-content-fields">
        <div className="admin-copy-fields">
          <label><span>Slug</span><input value={post[locale].slug} onChange={(event) => updateLocalized('slug', event.target.value)} placeholder="lowercase-slug" /></label>
          <label><span>标题</span><input value={post[locale].title} onChange={(event) => updateLocalized('title', event.target.value)} /></label>
          <label><span>摘要</span><textarea rows={3} value={post[locale].summary} onChange={(event) => updateLocalized('summary', event.target.value)} /></label>
          <label className="admin-body-field"><span>Markdown 正文</span><textarea value={post[locale].body} onChange={(event) => updateLocalized('body', event.target.value)} /></label>
          <button className="admin-upload-action" type="button" onClick={() => selectUpload('body')} disabled={busy === 'upload'}><Upload size={17} />上传并插入图片</button>
        </div>
        <aside className="admin-preview-pane"><div className="admin-preview-head"><Eye size={16} /><span>{locale === 'zh' ? '中文预览' : 'English preview'}</span><CloudUpload size={15} /></div><div className="markdown-body" dangerouslySetInnerHTML={{ __html: previewHtml }} /></aside>
      </section>
      <input ref={fileInput} className="admin-file-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} />
    </div>
  );
}

function toInput(post: AdminBlogPost): AdminBlogPostInput {
  return { category: post.category, heroImage: post.heroImage, tagIds: post.tagIds, series: post.series, zh: post.zh, en: post.en };
}

function isComplete(content: AdminBlogPost['zh']) {
  return Boolean(content.slug && content.title && content.summary && content.body.trim());
}

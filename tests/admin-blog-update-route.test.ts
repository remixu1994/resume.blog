import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT } from '@/app/api/admin/blog/posts/[id]/route';

const repository = vi.hoisted(() => ({
  getAdminBlogPost: vi.fn(),
  updateAdminBlogPost: vi.fn(),
}));

const assets = vi.hoisted(() => ({
  findInvalidBlogAssetUrl: vi.fn(),
}));

vi.mock('@/lib/admin/auth', () => ({
  getAdminSession: vi.fn(() => ({ username: 'admin' })),
  isSameOriginRequest: vi.fn(() => true),
}));

vi.mock('@/lib/blog/admin-repository', () => repository);
vi.mock('@/lib/blog/assets', () => assets);

const completeInput = {
  category: 'architecture',
  heroImage: '/assets/blog/hero.webp',
  tagIds: ['architecture'],
  series: '',
  zh: { slug: 'zh-post', title: '中文标题', summary: '中文摘要', body: '# 中文正文' },
  en: { slug: 'en-post', title: 'English title', summary: 'English summary', body: '# English body' },
};

beforeEach(() => {
  vi.clearAllMocks();
  assets.findInvalidBlogAssetUrl.mockResolvedValue(null);
  repository.updateAdminBlogPost.mockResolvedValue({ id: 'post-1', ...completeInput });
});

describe('admin blog update route', () => {
  it('rejects incomplete content when the existing post is published', async () => {
    repository.getAdminBlogPost.mockResolvedValue(existingPost(true));

    const response = await PUT(request({ ...completeInput, en: { ...completeInput.en, body: '' } }), params());

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('VALIDATION_ERROR');
    expect(repository.updateAdminBlogPost).not.toHaveBeenCalled();
  });

  it('rejects unregistered assets when saving a published post', async () => {
    repository.getAdminBlogPost.mockResolvedValue(existingPost(true));
    assets.findInvalidBlogAssetUrl.mockResolvedValue('https://assets.example.com/unregistered.webp');

    const response = await PUT(request(completeInput), params());

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('INVALID_ASSET');
    expect(repository.updateAdminBlogPost).not.toHaveBeenCalled();
  });

  it('keeps incomplete content valid for an existing draft', async () => {
    repository.getAdminBlogPost.mockResolvedValue(existingPost(false));
    const draft = { ...completeInput, en: { ...completeInput.en, body: '' } };

    const response = await PUT(request(draft), params());

    expect(response.status).toBe(200);
    expect(repository.updateAdminBlogPost).toHaveBeenCalledWith('post-1', draft);
    expect(assets.findInvalidBlogAssetUrl).not.toHaveBeenCalled();
  });
});

function existingPost(published: boolean) {
  return {
    id: 'post-1',
    groupId: 'post-1',
    published,
    status: published ? 'published' : 'draft',
    createdAt: '2026-07-21T00:00:00.000Z',
    updatedAt: '2026-07-21T00:00:00.000Z',
    publishedAt: published ? '2026-07-21T00:00:00.000Z' : null,
    ...completeInput,
  };
}

function request(body: unknown) {
  return new NextRequest('http://localhost/api/admin/blog/posts/post-1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', origin: 'http://localhost' },
    body: JSON.stringify(body),
  });
}

function params() {
  return { params: Promise.resolve({ id: 'post-1' }) };
}

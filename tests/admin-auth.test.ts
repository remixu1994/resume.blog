import { afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { createAdminSession, isSameOriginRequest, readAdminSession, validateAdminCredentials } from '@/lib/admin/auth';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('admin authentication', () => {
  it('validates credentials from environment variables', () => {
    process.env.ADMIN_USERNAME = 'publisher';
    process.env.ADMIN_PASSWORD = 'correct-horse-battery-staple';
    expect(validateAdminCredentials('publisher', 'correct-horse-battery-staple')).toBe(true);
    expect(validateAdminCredentials('publisher', 'wrong')).toBe(false);
  });

  it('signs, verifies, and expires admin sessions', () => {
    process.env.ADMIN_SESSION_SECRET = 'a-secure-session-secret-with-more-than-32-characters';
    const now = Date.UTC(2026, 6, 13);
    const token = createAdminSession('publisher', now);
    expect(readAdminSession(token, now)?.username).toBe('publisher');
    expect(readAdminSession(`${token}tampered`, now)).toBeNull();
    expect(readAdminSession(token, now + 9 * 60 * 60 * 1000)).toBeNull();
  });

  it('requires a sufficiently long signing secret', () => {
    process.env.ADMIN_SESSION_SECRET = 'short';
    expect(() => createAdminSession('publisher')).toThrow('at least 32 characters');
  });

  it('checks same-origin requests against the forwarded request host', () => {
    const request = new NextRequest('http://localhost:3001/api/admin/auth/login', {
      headers: { host: '127.0.0.1:3001', origin: 'http://127.0.0.1:3001' },
    });
    expect(isSameOriginRequest(request)).toBe(true);
  });
});

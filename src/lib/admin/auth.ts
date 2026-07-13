import { createHmac, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import type { NextRequest, NextResponse } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'resume_blog_admin';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

export interface AdminSession {
  username: string;
  expiresAt: number;
}

export function validateAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;
  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export function createAdminSession(username: string, now = Date.now()) {
  const session: AdminSession = { username, expiresAt: Math.floor(now / 1000) + SESSION_TTL_SECONDS };
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readAdminSession(token: string | undefined, now = Date.now()): AdminSession | null {
  if (!token) return null;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra || !safeEqual(signature, sign(payload))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession;
    if (!parsed.username || !Number.isInteger(parsed.expiresAt)) return null;
    if (parsed.expiresAt <= Math.floor(now / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getAdminSession(request: NextRequest) {
  return readAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

export function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const configuredOrigin = process.env.ADMIN_APP_URL?.replace(/\/$/, '');
  if (configuredOrigin) return origin === configuredOrigin;

  try {
    const originUrl = new URL(origin);
    const requestHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const requestProtocol = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
    return originUrl.host === requestHost && originUrl.protocol === `${requestProtocol}:`;
  } catch {
    return false;
  }
}

function sign(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must contain at least 32 characters.');
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

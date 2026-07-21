import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, readAdminSession } from './auth';

export async function requireAdminPage() {
  const cookieStore = await cookies();
  const session = readAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) redirect('/admin/login');
  return session;
}

export async function getOptionalAdminPageSession() {
  const cookieStore = await cookies();
  return readAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

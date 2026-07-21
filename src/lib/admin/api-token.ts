import { createHash, timingSafeEqual } from 'node:crypto';

export type AdminApiTokenResult = 'authenticated' | 'unauthorized' | 'unavailable';

export function authenticateAdminApiToken(
  authorization: string | null,
  env: Readonly<Record<string, string | undefined>> = process.env,
): AdminApiTokenResult {
  const configured = env.ADMIN_API_TOKENS?.split(',').map((token) => token.trim()).filter(Boolean) ?? [];
  if (!configured.length || configured.some((token) => token.length < 32)) return 'unavailable';

  const match = authorization?.match(/^Bearer ([^\s]+)$/);
  if (!match) return 'unauthorized';

  const candidateHash = digest(match[1]);
  let authenticated = false;
  for (const token of configured) {
    authenticated = timingSafeEqual(candidateHash, digest(token)) || authenticated;
  }
  return authenticated ? 'authenticated' : 'unauthorized';
}

function digest(value: string) {
  return createHash('sha256').update(value).digest();
}

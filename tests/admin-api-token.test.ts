import { describe, expect, it } from 'vitest';
import { authenticateAdminApiToken } from '@/lib/admin/api-token';

const firstToken = 'first-api-token-with-at-least-32-characters';
const secondToken = 'second-api-token-with-at-least-32-characters';

describe('admin API token authentication', () => {
  it('reports unavailable when tokens are missing or weak', () => {
    expect(authenticateAdminApiToken(null, {})).toBe('unavailable');
    expect(authenticateAdminApiToken(null, { ADMIN_API_TOKENS: 'too-short' })).toBe('unavailable');
  });

  it('rejects missing, malformed, and invalid bearer credentials', () => {
    const env = { ADMIN_API_TOKENS: firstToken };
    expect(authenticateAdminApiToken(null, env)).toBe('unauthorized');
    expect(authenticateAdminApiToken(`Basic ${firstToken}`, env)).toBe('unauthorized');
    expect(authenticateAdminApiToken('Bearer wrong-token', env)).toBe('unauthorized');
  });

  it('accepts every configured rotation token', () => {
    const env = { ADMIN_API_TOKENS: `${firstToken}, ${secondToken}` };
    expect(authenticateAdminApiToken(`Bearer ${firstToken}`, env)).toBe('authenticated');
    expect(authenticateAdminApiToken(`Bearer ${secondToken}`, env)).toBe('authenticated');
  });
});

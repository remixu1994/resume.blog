export type BlogDatabaseProvider = 'sqlite' | 'postgres' | 'mysql';

export interface BlogDatabaseConfig {
  provider: BlogDatabaseProvider;
  url?: string;
}

export function getBlogDatabaseConfig(env = process.env): BlogDatabaseConfig {
  const configuredProvider = env.BLOG_DB_PROVIDER?.trim().toLowerCase();
  const url = env.BLOG_DATABASE_URL?.trim();

  if (configuredProvider) {
    if (configuredProvider === 'postgresql') {
      return requireRemoteDatabaseUrl('postgres', url);
    }
    if (configuredProvider === 'sqlite') return { provider: 'sqlite' };
    if (configuredProvider === 'postgres' || configuredProvider === 'mysql') {
      return requireRemoteDatabaseUrl(configuredProvider, url);
    }
    throw new Error('BLOG_DB_PROVIDER must be sqlite, postgres, or mysql.');
  }

  if (!url) return { provider: 'sqlite' };
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
    return { provider: 'postgres', url };
  }
  if (url.startsWith('mysql://') || url.startsWith('mysqls://')) {
    return { provider: 'mysql', url };
  }

  throw new Error(
    'Cannot infer BLOG_DB_PROVIDER from BLOG_DATABASE_URL. Set BLOG_DB_PROVIDER to postgres or mysql.',
  );
}

function requireRemoteDatabaseUrl(provider: 'postgres' | 'mysql', url: string | undefined): BlogDatabaseConfig {
  if (!url) {
    throw new Error(`BLOG_DATABASE_URL is required when BLOG_DB_PROVIDER=${provider}.`);
  }
  return { provider, url };
}

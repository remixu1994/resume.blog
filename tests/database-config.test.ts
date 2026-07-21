import { describe, expect, it } from 'vitest';
import { getBlogDatabaseConfig } from '@/lib/blog/database-config';

describe('blog database configuration', () => {
  it('uses SQLite locally without remote database settings', () => {
    expect(getBlogDatabaseConfig({})).toEqual({ provider: 'sqlite' });
  });

  it('infers PostgreSQL and MySQL from their URLs', () => {
    expect(getBlogDatabaseConfig({ BLOG_DATABASE_URL: 'postgresql://user:password@db/blog' })).toEqual({
      provider: 'postgres',
      url: 'postgresql://user:password@db/blog',
    });
    expect(getBlogDatabaseConfig({ BLOG_DATABASE_URL: 'mysql://user:password@db/blog' })).toEqual({
      provider: 'mysql',
      url: 'mysql://user:password@db/blog',
    });
  });

  it('requires a remote URL for an explicitly configured remote provider', () => {
    expect(() => getBlogDatabaseConfig({ BLOG_DB_PROVIDER: 'postgres' })).toThrow('BLOG_DATABASE_URL');
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const TEST_DB_PATH = join(process.cwd(), 'data', 'analytics-test.sqlite');

describe('analytics db', () => {
  beforeEach(() => {
    // Clean up test db
    if (existsSync(TEST_DB_PATH)) unlinkSync(TEST_DB_PATH);
    if (existsSync(TEST_DB_PATH + '-wal')) unlinkSync(TEST_DB_PATH + '-wal');
    if (existsSync(TEST_DB_PATH + '-shm')) unlinkSync(TEST_DB_PATH + '-shm');
    process.env.ANALYTICS_DB_PATH = TEST_DB_PATH;
  });

  afterEach(() => {
    // Re-import to reset singleton - we need dynamic import
    delete process.env.ANALYTICS_DB_PATH;
  });

  it('tracks page views and retrieves stats', async () => {
    // Dynamic import to pick up env var
    const { trackPageView, getAnalyticsStats, closeAnalyticsDb } = await import(
      '@/lib/analytics/db'
    );

    // Track some views
    trackPageView({
      path: '/zh/blog/test-post',
      locale: 'zh',
      referrer: 'https://google.com',
      country: 'CN',
      userAgentHash: 'abc123',
      ipHash: 'def456',
    });

    trackPageView({
      path: '/zh/blog/test-post',
      locale: 'zh',
      referrer: 'https://google.com',
      country: 'CN',
      userAgentHash: 'abc123',
      ipHash: 'def456',
    });

    trackPageView({
      path: '/en/resume',
      locale: 'en',
      referrer: '',
      country: 'US',
      userAgentHash: 'ghi789',
      ipHash: 'jkl012',
    });

    const stats = getAnalyticsStats(30);

    expect(stats.totalViews).toBe(3);
    expect(stats.topPages).toHaveLength(2);
    expect(stats.topPages[0].path).toBe('/zh/blog/test-post');
    expect(stats.topPages[0].views).toBe(2);
    expect(stats.topReferrers).toHaveLength(1);
    expect(stats.topReferrers[0].referrer).toBe('https://google.com');
    expect(stats.countryStats).toHaveLength(2);
    expect(stats.dailyViews).toHaveLength(1);
    expect(stats.dailyViews[0].views).toBe(3);

    closeAnalyticsDb();

    // Clean up
    if (existsSync(TEST_DB_PATH)) unlinkSync(TEST_DB_PATH);
    if (existsSync(TEST_DB_PATH + '-wal')) unlinkSync(TEST_DB_PATH + '-wal');
    if (existsSync(TEST_DB_PATH + '-shm')) unlinkSync(TEST_DB_PATH + '-shm');
  });
});

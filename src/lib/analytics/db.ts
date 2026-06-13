import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import Database from 'better-sqlite3';

const DEFAULT_DB_PATH = 'data/analytics.sqlite';

// --- Types ---

export interface TrackPageViewParams {
  path: string;
  locale: string;
  referrer: string;
  country: string;
  userAgentHash: string;
  ipHash: string;
}

export interface PageViewRow {
  id: number;
  path: string;
  locale: string;
  referrer: string;
  country: string;
  user_agent_hash: string;
  ip_hash: string;
  created_at: string;
}

export interface TopPage {
  path: string;
  views: number;
}

export interface TopReferrer {
  referrer: string;
  views: number;
}

export interface CountryStat {
  country: string;
  views: number;
}

export interface DailyView {
  date: string;
  views: number;
}

export interface AnalyticsStats {
  totalViews: number;
  topPages: TopPage[];
  topReferrers: TopReferrer[];
  countryStats: CountryStat[];
  dailyViews: DailyView[];
}

// --- Database singleton ---

let _db: Database.Database | null = null;

function getAnalyticsDatabasePath(): string {
  return process.env.ANALYTICS_DB_PATH || join(process.cwd(), DEFAULT_DB_PATH);
}

function getDb(): Database.Database {
  if (_db) return _db;

  const dbPath = getAnalyticsDatabasePath();

  // Ensure parent directory exists
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');

  // Create table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      locale TEXT NOT NULL DEFAULT '',
      referrer TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      user_agent_hash TEXT NOT NULL DEFAULT '',
      ip_hash TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create indexes for common queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path)
  `);

  _db = db;
  return db;
}

// --- Public API ---

export function trackPageView(params: TrackPageViewParams): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO page_views (path, locale, referrer, country, user_agent_hash, ip_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  stmt.run(params.path, params.locale, params.referrer, params.country, params.userAgentHash, params.ipHash);
}

export function getAnalyticsStats(days = 30): AnalyticsStats {
  const db = getDb();
  const cutoff = `datetime('now', '-${days} days')`;

  const totalViews = (
    db.prepare(`SELECT COUNT(*) as count FROM page_views WHERE created_at >= ${cutoff}`).get() as {
      count: number;
    }
  ).count;

  const topPages = db
    .prepare(
      `SELECT path, COUNT(*) as views FROM page_views WHERE created_at >= ${cutoff} GROUP BY path ORDER BY views DESC LIMIT 10`,
    )
    .all() as TopPage[];

  const topReferrers = db
    .prepare(
      `SELECT referrer, COUNT(*) as views FROM page_views WHERE created_at >= ${cutoff} AND referrer != '' GROUP BY referrer ORDER BY views DESC LIMIT 10`,
    )
    .all() as TopReferrer[];

  const countryStats = db
    .prepare(
      `SELECT country, COUNT(*) as views FROM page_views WHERE created_at >= ${cutoff} AND country != '' GROUP BY country ORDER BY views DESC LIMIT 20`,
    )
    .all() as CountryStat[];

  const dailyViews = db
    .prepare(
      `SELECT date(created_at) as date, COUNT(*) as views FROM page_views WHERE created_at >= ${cutoff} GROUP BY date(created_at) ORDER BY date ASC`,
    )
    .all() as DailyView[];

  return { totalViews, topPages, topReferrers, countryStats, dailyViews };
}

/** Close the database connection (for graceful shutdown). */
export function closeAnalyticsDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

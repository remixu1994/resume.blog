import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import Database from 'better-sqlite3';

const SOURCE_CONFIGS = [
  {
    dir: 'C:\\Users\\hp\\Documents\\YoudaoToMd\\output\\IT\\微服务&DDD\\_Blog草稿',
    category: 'microservices-ddd',
    heroImage: '/assets/architecture/content-platform.svg',
    series: 'microservices-ddd',
    tags: ['微服务', 'DDD', '领域建模'],
  },
  {
    dir: 'C:\\Users\\hp\\Documents\\YoudaoToMd\\output\\IT\\极限编程\\_Blog草稿',
    category: 'extreme-programming',
    heroImage: '/assets/blog/fitness-loop.svg',
    series: 'extreme-programming',
    tags: ['极限编程', 'TDD', '重构'],
  },
  {
    dir: 'C:\\Users\\hp\\Documents\\YoudaoToMd\\output\\IT\\架构\\_Blog草稿',
    category: 'architecture',
    heroImage: '/assets/architecture/observability.svg',
    series: 'architecture',
    tags: ['架构', '系统设计', '演进'],
  },
  {
    dir: 'C:\\Users\\hp\\Documents\\YoudaoToMd\\output\\IT\\基础知识技能\\_Blog草稿',
    category: 'fundamentals',
    heroImage: '/assets/blog/nx-monorepo.svg',
    series: 'fundamentals',
    tags: ['基础知识', '算法', '编程基础'],
  },
];

const SLUG_OVERRIDES = new Map([
  ['领域驱动设计为什么存在：从统一语言到知识提炼', 'domain-driven-design-why-it-exists-unified-language-to-knowledge-extraction'],
  ['领域模型如何落地：分层、聚合与上下文边界', 'domain-model-implementation-layers-aggregates-and-bounded-contexts'],
  ['微服务不是领域模型：先把 DDD 做对，再谈拆分', 'microservices-are-not-the-domain-model-get-ddd-right-before-splitting'],
  ['极限编程是什么：从敏捷宣言到工程纪律', 'what-is-extreme-programming-from-agile-manifesto-to-engineering-discipline'],
  ['TDD 与单元测试：用测试驱动设计与反馈', 'tdd-and-unit-tests-driving-design-and-feedback'],
  ['重构：把可修改性变成日常能力', 'refactoring-making-modifiability-a-daily-habit'],
  ['持续集成与质量门禁：让主干始终可交付', 'continuous-integration-and-quality-gates-keeping-main-shippable'],
  ['什么是架构：顶层设计、模块、组件与三大原则', 'what-is-architecture-top-level-design-modules-components-and-three-principles'],
  ['架构为什么会复杂：高性能、高可用与约束取舍', 'why-architecture-becomes-complex-high-performance-high-availability-and-tradeoffs'],
  ['架构风格如何演化：从 SOA 到 REST 与微服务', 'architecture-style-evolution-from-soa-to-rest-and-microservices'],
  ['架构落地的治理模式：分布式锁与边车模式', 'architecture-governance-patterns-distributed-locks-and-sidecars'],
  ['计算机为什么能跑程序：组成原理、存储、链接与并发', 'why-computers-can-run-programs-components-storage-linking-concurrency'],
  ['数据结构与算法为什么重要：从数组、链表到排序与哈希', 'why-data-structures-and-algorithms-matter-arrays-lists-sorting-hash'],
  ['面向对象与设计原则：从封装、继承到代码坏味道', 'object-orientation-and-design-principles-encapsulation-inheritance-code-smells'],
  ['工程协作与交付：Git、需求分析与估算', 'engineering-collaboration-and-delivery-git-requirements-analysis-and-estimation'],
]);

const DEFAULT_DB_PATH = join(process.cwd(), 'data', 'blog.sqlite');
const TAG_ALIASES = {
  'AI Agent': 'ai-agent',
  Algorithm: 'algorithm',
  Architecture: 'architecture',
  Automation: 'automation',
  Blog: 'blog',
  cAdvisor: 'c-advisor',
  DDD: 'ddd',
  '.NET': 'dotnet',
  'ASP.NET Core': 'aspnet-core',
  'C#': 'csharp',
  Fitness: 'fitness',
  Grafana: 'grafana',
  Hermes: 'hermes',
  'Home Assistant': 'home-assistant',
  Markdown: 'markdown',
  Microservices: 'microservices',
  Monitoring: 'monitoring',
  NAS: 'nas',
  Product: 'product',
  Prometheus: 'prometheus',
  Refactoring: 'refactoring',
  SQLite: 'sqlite',
  'Self-hosting': 'self-hosting',
  TDD: 'tdd',
  Unraid: 'unraid',
  '\u5185\u5bb9\u5e73\u53f0': 'content-platform',
  '\u57fa\u7840\u77e5\u8bc6': 'fundamentals',
  '\u5fae\u670d\u52a1': 'microservices',
  '\u670d\u52a1\u8fb9\u754c': 'service-boundaries',
  '\u6781\u9650\u7f16\u7a0b': 'extreme-programming',
  '\u67b6\u6784': 'architecture',
  '\u6a21\u5757\u5316\u67b6\u6784': 'modular-architecture',
  '\u6f14\u8fdb': 'evolution',
  '\u7cfb\u7edf\u8bbe\u8ba1': 'system-design',
  '\u7b97\u6cd5': 'algorithm',
  '\u7f16\u7a0b\u57fa\u7840': 'programming',
  '\u81ea\u6258\u7ba1': 'self-hosting',
  '\u91cd\u6784': 'refactoring',
  '\u9886\u57df\u5efa\u6a21': 'domain-modeling',
};

export function importBlogDraftsIntoSqlite({
  dbPath = DEFAULT_DB_PATH,
  sourceConfigs = SOURCE_CONFIGS,
} = {}) {
  const db = openDatabase(dbPath);
  try {
    const rows = [];
    for (const config of sourceConfigs) {
      for (const filePath of readMarkdownFiles(config.dir)) {
        const markdown = readFileSync(filePath, 'utf8');
        const parsed = parseDraftMarkdown(markdown);
        const slug = canonicalDraftSlug(filePath, parsed.frontmatter.title);
        const title = parsed.frontmatter.title || humanizeSlug(slug);
        const updatedAt = toDateString(statSync(filePath).mtime);
        const body = stripSourceReferences(parsed.body);

        rows.push(toLocalizedImportRow({
          groupId: slug,
          locale: 'zh',
          title,
          slug,
          summary: parsed.frontmatter.summary || buildSummary(body),
          category: config.category,
          heroImage: config.heroImage,
          updatedAt,
          tags: config.tags,
          published: 1,
          status: 'published',
          series: config.series,
          body,
        }));
      }
    }

    upsertLocalizedRows(db, rows);

    return { dbPath, importedCount: rows.length, sourceCount: sourceConfigs.length };
  } finally {
    db.close();
  }
}

function openDatabase(dbPath) {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);

  createBlogPostsTable(db);
  migrateLegacyBlogPosts(db);
  createBlogPostIndexes(db);
  return db;
}

function createBlogPostsTable(db) {
  db.exec(`
    create table if not exists blog_posts (
      id text primary key,
      group_id text not null unique,
      category text not null default 'uncategorized',
      hero_image text not null,
      updated_at text not null,
      tag_ids_json text not null,
      published integer not null,
      status text not null,
      series text,
      slug_zh text,
      title_zh text,
      summary_zh text,
      body_zh text,
      slug_en text,
      title_en text,
      summary_en text,
      body_en text
    );
  `);
}

function createBlogPostIndexes(db) {
  db.exec(`
    create unique index if not exists blog_posts_slug_zh_idx on blog_posts(slug_zh) where slug_zh is not null;
    create unique index if not exists blog_posts_slug_en_idx on blog_posts(slug_en) where slug_en is not null;
  `);
}

function migrateLegacyBlogPosts(db) {
  const columns = db.prepare('pragma table_info(blog_posts)').all();
  if (!columns.some((column) => column.name === 'locale')) return;
  const categorySelect = columns.some((column) => column.name === 'category')
    ? "coalesce(category, 'uncategorized') as category"
    : "'uncategorized' as category";

  const legacyRows = db.prepare(`
    select id,
           slug,
           locale,
           title,
           summary,
           ${categorySelect},
           hero_image,
           updated_at,
           tags_json,
           published,
           status,
           series,
           body
      from blog_posts
  `).all();

  db.exec(`
    drop index if exists blog_posts_locale_slug_idx;
    alter table blog_posts rename to blog_posts_legacy;
    create table blog_posts (
      id text primary key,
      group_id text not null unique,
      category text not null default 'uncategorized',
      hero_image text not null,
      updated_at text not null,
      tag_ids_json text not null,
      published integer not null,
      status text not null,
      series text,
      slug_zh text,
      title_zh text,
      summary_zh text,
      body_zh text,
      slug_en text,
      title_en text,
      summary_en text,
      body_en text
    );
    create unique index if not exists blog_posts_slug_zh_idx on blog_posts(slug_zh) where slug_zh is not null;
    create unique index if not exists blog_posts_slug_en_idx on blog_posts(slug_en) where slug_en is not null;
  `);

  upsertLocalizedRows(db, legacyRows.map((row) => toLocalizedImportRow({
    groupId: row.slug,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    category: row.category,
    heroImage: row.hero_image,
    updatedAt: row.updated_at,
    tags: parseJsonArray(row.tags_json),
    published: row.published,
    status: row.status,
    series: row.series,
    body: row.body,
  })));

  db.exec('drop table blog_posts_legacy;');
}

function readMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md') && entry.name !== 'README.md')
    .map((entry) => join(dir, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

function parseDraftMarkdown(markdown) {
  const normalized = normalizeMarkdown(markdown);
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(normalized);
  if (!match) {
    throw new Error('Markdown drafts must start with frontmatter');
  }

  const [, frontmatter, body] = match;
  return {
    frontmatter: parseFrontmatter(frontmatter),
    body,
  };
}

function parseFrontmatter(frontmatter) {
  const result = {};
  let currentKey = null;

  for (const line of frontmatter.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ')) {
      if (!currentKey) {
        throw new Error(`Invalid frontmatter line: ${line}`);
      }

      const item = parseValue(trimmed.slice(2).trim());
      const previous = result[currentKey];
      result[currentKey] = Array.isArray(previous) ? [...previous, item] : [previous, item].filter(Boolean);
      continue;
    }

    const separator = trimmed.indexOf(':');
    if (separator === -1) {
      throw new Error(`Invalid frontmatter line: ${line}`);
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    result[key] = parseValue(value);
    currentKey = key;
  }

  return result;
}

function parseValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    return inner ? inner.split(',').map((item) => stripQuotes(item.trim())) : [];
  }

  return stripQuotes(value);
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/g, '');
}

function normalizeMarkdown(markdown) {
  return markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

export function stripSourceReferences(markdown) {
  const sourceHeadings = new Set([
    '\u539f\u59cb\u6765\u6e90',
    '\u6765\u6e90',
    '\u539f\u6587\u6765\u6e90',
    '\u53c2\u8003\u6765\u6e90',
  ]);
  const lines = normalizeMarkdown(markdown).split('\n');
  const result = [];
  let skippingSourceBlock = false;

  for (const line of lines) {
    const heading = /^##\s+(.+?)\s*$/.exec(line.trim());
    if (heading) {
      const title = heading[1].trim();
      if (sourceHeadings.has(title)) {
        skippingSourceBlock = true;
        continue;
      }
      skippingSourceBlock = false;
    }

    if (!skippingSourceBlock) {
      result.push(line);
    }
  }

  return result.join('\n').trim();
}

function canonicalDraftSlug(filePath, title) {
  if (typeof title === 'string' && SLUG_OVERRIDES.has(title)) {
    return SLUG_OVERRIDES.get(title);
  }

  return createSlug(filePath);
}

function createSlug(filePath) {
  const stem = basename(filePath, '.md').replace(/^\d+[-_：:\s.]*/u, '');
  const normalized = stem
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return normalized || stem.normalize('NFKC').replace(/\s+/g, '-').toLowerCase();
}

function buildSummary(body) {
  const paragraph = body
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .find((item) => item && !item.startsWith('#') && !item.startsWith('```') && !item.startsWith('>') && !item.startsWith('|'));

  return truncate(markdownToPlainText(paragraph || body), 120);
}

function markdownToPlainText(value) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, limit) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1).trimEnd()}…`;
}

function toLocalizedImportRow({
  groupId,
  locale,
  slug,
  title,
  summary,
  category,
  heroImage,
  updatedAt,
  tags,
  published,
  status,
  series,
  body,
}) {
  if (locale !== 'zh' && locale !== 'en') {
    throw new Error(`Unsupported blog locale: ${locale}`);
  }

  const row = {
    id: `blog-${groupId}`,
    groupId,
    category,
    heroImage,
    updatedAt,
    tagIdsJson: JSON.stringify(toTagIds(tags)),
    published,
    status,
    series,
    slugZh: null,
    titleZh: null,
    summaryZh: null,
    bodyZh: null,
    slugEn: null,
    titleEn: null,
    summaryEn: null,
    bodyEn: null,
  };

  if (locale === 'zh') {
    row.slugZh = slug;
    row.titleZh = title;
    row.summaryZh = summary;
    row.bodyZh = body;
  } else {
    row.slugEn = slug;
    row.titleEn = title;
    row.summaryEn = summary;
    row.bodyEn = body;
  }

  return row;
}

function upsertLocalizedRows(db, rows) {
  const insert = db.prepare(`
    insert into blog_posts (
      id,
      group_id,
      category,
      hero_image,
      updated_at,
      tag_ids_json,
      published,
      status,
      series,
      slug_zh,
      title_zh,
      summary_zh,
      body_zh,
      slug_en,
      title_en,
      summary_en,
      body_en
    ) values (
      @id,
      @groupId,
      @category,
      @heroImage,
      @updatedAt,
      @tagIdsJson,
      @published,
      @status,
      @series,
      @slugZh,
      @titleZh,
      @summaryZh,
      @bodyZh,
      @slugEn,
      @titleEn,
      @summaryEn,
      @bodyEn
    )
    on conflict(group_id) do update set
      category = excluded.category,
      hero_image = excluded.hero_image,
      updated_at = max(blog_posts.updated_at, excluded.updated_at),
      tag_ids_json = excluded.tag_ids_json,
      published = excluded.published,
      status = excluded.status,
      series = excluded.series,
      slug_zh = coalesce(excluded.slug_zh, blog_posts.slug_zh),
      title_zh = coalesce(excluded.title_zh, blog_posts.title_zh),
      summary_zh = coalesce(excluded.summary_zh, blog_posts.summary_zh),
      body_zh = coalesce(excluded.body_zh, blog_posts.body_zh),
      slug_en = coalesce(excluded.slug_en, blog_posts.slug_en),
      title_en = coalesce(excluded.title_en, blog_posts.title_en),
      summary_en = coalesce(excluded.summary_en, blog_posts.summary_en),
      body_en = coalesce(excluded.body_en, blog_posts.body_en)
  `);

  const transaction = db.transaction((entries) => {
    for (const row of entries) {
      insert.run(row);
    }
  });
  transaction(rows);
}

function toTagIds(labels) {
  return [...new Set(labels.map(toTagId).filter(Boolean))];
}

function toTagId(label) {
  const trimmed = String(label).trim();
  return TAG_ALIASES[trimmed] ?? createStableId(trimmed);
}

function createStableId(value) {
  return value
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function humanizeSlug(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function main() {
  const { dbPath, sourceConfigs } = parseArgs(process.argv.slice(2));
  const result = importBlogDraftsIntoSqlite({ dbPath, sourceConfigs });
  console.log(`Imported ${result.importedCount} blog posts into ${result.dbPath}`);
}

function parseArgs(args) {
  const sourceConfigs = [];
  let dbPath = DEFAULT_DB_PATH;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--db' && args[index + 1]) {
      dbPath = args[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith('--db=')) {
      dbPath = arg.slice('--db='.length);
      continue;
    }

    const match = SOURCE_CONFIGS.find((item) => item.dir === arg);
    if (match) {
      sourceConfigs.push(match);
    }
  }

  return {
    dbPath,
    sourceConfigs: sourceConfigs.length ? sourceConfigs : SOURCE_CONFIGS,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

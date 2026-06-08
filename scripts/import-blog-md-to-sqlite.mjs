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

export function importBlogDraftsIntoSqlite({
  dbPath = DEFAULT_DB_PATH,
  sourceConfigs = SOURCE_CONFIGS,
} = {}) {
  const db = openDatabase(dbPath);
  try {
    const insert = db.prepare(`
      insert into blog_posts (
        id,
        slug,
        locale,
        title,
        summary,
        category,
        hero_image,
        updated_at,
        tags_json,
        published,
        status,
        series,
        body
      ) values (
        @id,
        @slug,
        @locale,
        @title,
        @summary,
        @category,
        @heroImage,
        @updatedAt,
        @tagsJson,
        @published,
        @status,
        @series,
        @body
      )
      on conflict(locale, slug) do update set
        title = excluded.title,
        summary = excluded.summary,
        category = excluded.category,
        hero_image = excluded.hero_image,
        updated_at = excluded.updated_at,
        tags_json = excluded.tags_json,
        published = excluded.published,
        status = excluded.status,
        series = excluded.series,
        body = excluded.body
    `);

    const rows = [];
    for (const config of sourceConfigs) {
      for (const filePath of readMarkdownFiles(config.dir)) {
        const markdown = readFileSync(filePath, 'utf8');
        const parsed = parseDraftMarkdown(markdown);
        const slug = canonicalDraftSlug(filePath, parsed.frontmatter.title);
        const title = parsed.frontmatter.title || humanizeSlug(slug);
        const updatedAt = toDateString(statSync(filePath).mtime);
        const body = normalizeMarkdown(parsed.body).trim();

        rows.push({
          id: `blog-${config.category}-${slug}`,
          slug,
          locale: 'zh',
          title,
          summary: buildSummary(body),
          category: config.category,
          heroImage: config.heroImage,
          updatedAt,
          tagsJson: JSON.stringify(config.tags),
          published: 1,
          status: 'published',
          series: config.series,
          body,
        });
      }
    }

    const transaction = db.transaction((entries) => {
      for (const row of entries) {
        insert.run(row);
      }
    });
    transaction(rows);

    return { dbPath, importedCount: rows.length, sourceCount: sourceConfigs.length };
  } finally {
    db.close();
  }
}

function openDatabase(dbPath) {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);

  db.exec(`
    create table if not exists blog_posts (
      id text primary key,
      slug text not null,
      locale text not null,
      title text not null,
      summary text not null,
      category text not null default 'uncategorized',
      hero_image text not null,
      updated_at text not null,
      tags_json text not null,
      published integer not null,
      status text not null,
      series text,
      body text not null
    );
    create unique index if not exists blog_posts_locale_slug_idx on blog_posts(locale, slug);
  `);

  ensureCategoryColumn(db);
  return db;
}

function ensureCategoryColumn(db) {
  const columns = db.prepare('pragma table_info(blog_posts)').all();
  if (!columns.some((column) => column.name === 'category')) {
    db.exec(`alter table blog_posts add column category text not null default 'uncategorized';`);
  }
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
  return markdown.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
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
  console.log(`Imported ${result.importedCount} blog drafts into ${result.dbPath}`);
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

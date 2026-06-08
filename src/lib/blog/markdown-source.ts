import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { blogPostSchema } from './schema';
import type { BlogPost, BlogContentSource } from './types';

const DEFAULT_BLOG_DIR = 'content/blog';

export function createMarkdownBlogSource(rootDir = join(process.cwd(), DEFAULT_BLOG_DIR)): BlogContentSource {
  return {
    listPosts: () => readMarkdownBlogPosts(rootDir),
  };
}

export function readMarkdownBlogPosts(rootDir = join(process.cwd(), DEFAULT_BLOG_DIR)): BlogPost[] {
  if (!existsSync(rootDir)) return [];

  return readdirSync(rootDir, { withFileTypes: true })
    .filter((localeDir) => localeDir.isDirectory())
    .flatMap((localeDir) => {
      const localePath = join(rootDir, localeDir.name);
      return readdirSync(localePath, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) => parseBlogMarkdown(readFileSync(join(localePath, entry.name), 'utf8')));
    });
}

export function parseBlogMarkdown(markdown: string): BlogPost {
  const normalized = normalizeMarkdown(markdown);
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(normalized);
  if (!match) {
    throw new Error('Blog markdown must start with frontmatter delimited by ---');
  }

  const [, frontmatter, body] = match;
  const raw = parseFrontmatter(frontmatter);
  return blogPostSchema.parse({ ...raw, body: body.trim(), source: 'md' });
}

function normalizeMarkdown(markdown: string) {
  return markdown.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
}

function parseFrontmatter(frontmatter: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentKey: string | null = null;

  for (const line of frontmatter.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ')) {
      if (!currentKey) {
        throw new Error(`Invalid blog frontmatter line: ${line}`);
      }

      const item = parseFrontmatterValue(trimmed.slice(2).trim());
      const previous = result[currentKey];
      result[currentKey] = Array.isArray(previous) ? [...previous, item] : [previous, item].filter(Boolean);
      continue;
    }

    const separator = trimmed.indexOf(':');
    if (separator === -1) {
      throw new Error(`Invalid blog frontmatter line: ${line}`);
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    const parsedValue = parseFrontmatterValue(value);
    result[key] = parsedValue;
    currentKey = key;
  }

  return result;
}

function parseFrontmatterValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    return inner ? inner.split(',').map((item) => stripQuotes(item.trim())) : [];
  }

  return stripQuotes(value);
}

function stripQuotes(value: string) {
  return value.replace(/^['"]|['"]$/g, '');
}

import { blogPostSchema } from './schema';
import { toTagIds } from './tags';
import type { BlogPost } from './types';

export function parseBlogMarkdown(markdown: string): BlogPost {
  const normalized = normalizeMarkdown(markdown);
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(normalized);
  if (!match) {
    throw new Error('Blog markdown must start with frontmatter delimited by ---');
  }

  const [, frontmatter, body] = match;
  const raw = parseFrontmatter(frontmatter);
  const tags = Array.isArray(raw.tags) ? raw.tags.filter((item): item is string => typeof item === 'string') : [];
  return blogPostSchema.parse({ ...raw, body: body.trim(), source: 'md', tagIds: toTagIds(tags) });
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

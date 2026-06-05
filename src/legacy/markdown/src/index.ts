import { Marked } from 'marked';
import type {
  Locale,
  RecipeCategory,
  RecipeDetail,
  RecipeDifficulty,
  RecipeIngredient,
  RecipeStep,
  RecipeTag,
} from '@devfolio-blog/shared-types';

const markdownParser = new Marked({
  breaks: false,
  gfm: true,
  renderer: {
    code({ text, lang }) {
      const language = normalizeCodeLanguage(lang);
      const escapedCode = escapeHtml(text);
      const escapedLanguage = escapeHtml(language);

      return `<figure class="code-block" data-code-block>
  <figcaption class="code-block-header">
    <span class="code-block-language">${escapedLanguage}</span>
    <button class="code-block-copy" type="button" data-copy-code aria-label="Copy ${escapedLanguage} code">Copy</button>
  </figcaption>
  <pre><code class="language-${escapedLanguage}" data-code>${escapedCode}</code></pre>
</figure>`;
    },
  },
});

export function renderMarkdown(markdown: string): string {
  return markdownParser.parse(normalizeMarkdown(markdown), { async: false });
}

function normalizeMarkdown(markdown: string): string {
  const normalized = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  return stripFrontmatter(normalized).trim();
}

function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

function normalizeCodeLanguage(language: string | undefined): string {
  const value = language?.trim().split(/\s+/)[0].toLowerCase();
  return value || 'text';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type RecipeSectionName =
  | '基础信息'
  | '食材'
  | '调料'
  | '红烧汁'
  | '步骤'
  | '关键提示'
  | '营养说明'
  | '做法图';

type SectionLine = { line: number; text: string };
type ParsedRecipeTemplate = {
  title: string;
  sections: Map<RecipeSectionName, SectionLine[]>;
};

const REQUIRED_SECTIONS: RecipeSectionName[] = ['基础信息', '食材', '调料', '步骤'];
const REQUIRED_BASIC_FIELDS = ['slug', 'locale', 'category', 'tags', 'servings', 'durationMinutes', 'difficulty', 'summary', 'updatedAt'];

export class RecipeMarkdownParseError extends Error {
  constructor(
    public readonly code:
      | 'MISSING_TITLE'
      | 'MISSING_SECTION'
      | 'INVALID_BASIC_FIELD'
      | 'MISSING_BASIC_FIELD'
      | 'INVALID_PIPE_ROW'
      | 'EMPTY_STEPS'
      | 'EMPTY_STEP_BULLETS'
      | 'INVALID_ENUM'
      | 'INVALID_NUMBER'
      | 'MISSING_METHOD_IMAGE',
    message: string,
    public readonly section?: string,
    public readonly line?: number,
    public readonly hint?: string,
  ) {
    super(message);
    this.name = 'RecipeMarkdownParseError';
  }
}

export function parseRecipeMarkdown(markdown: string): RecipeDetail {
  const parsed = splitRecipeSections(markdown);
  const basicLines = requireSection(parsed.sections, '基础信息');
  const basic = parseKeyValueLines(basicLines, '基础信息');
  for (const field of REQUIRED_BASIC_FIELDS) {
    if (!basic.values[field]?.trim()) {
      throw new RecipeMarkdownParseError('MISSING_BASIC_FIELD', `基础信息缺少字段：${field}`, '基础信息', basic.firstLine, `请补充 "- ${field}: 值"`);
    }
  }

  const slug = requireField(basic, 'slug');
  const locale = toLocale(requireField(basic, 'locale'));
  const title = parsed.title.trim();
  const summary = requireField(basic, 'summary');
  const category = toCategory(requireField(basic, 'category'));
  const tags = toTags(requireField(basic, 'tags'));
  const durationMinutes = toNumber(requireField(basic, 'durationMinutes'), 'durationMinutes');
  const difficulty = toDifficulty(requireField(basic, 'difficulty'));
  const calories = optionalNumber(basic.values['calories']);
  const servings = requireField(basic, 'servings');
  const coverImage = basic.values['coverImage']?.trim() || undefined;
  const updatedAt = requireField(basic, 'updatedAt');

  const ingredients = parsePipeList(requireSection(parsed.sections, '食材'), '食材');
  const seasonings = parsePipeList(requireSection(parsed.sections, '调料'), '调料');
  const sauce = parsePipeList(parsed.sections.get('红烧汁') ?? [], '红烧汁');
  const steps = parseSteps(requireSection(parsed.sections, '步骤'));
  if (steps.length === 0) {
    throw new RecipeMarkdownParseError('EMPTY_STEPS', '步骤为空：请至少提供一个 ### n. 标题。', '步骤', requireSection(parsed.sections, '步骤')[0]?.line);
  }
  for (const step of steps) {
    if (step.bullets.length === 0) {
      throw new RecipeMarkdownParseError('EMPTY_STEP_BULLETS', `步骤 "${step.title}" 缺少要点。`, '步骤');
    }
  }

  const tips = parseBullets(parsed.sections.get('关键提示') ?? []);
  const nutritionNotes = parseBullets(parsed.sections.get('营养说明') ?? []);
  const methodImageSection = parseKeyValueLines(parsed.sections.get('做法图') ?? [], '做法图');
  const methodImage = methodImageSection.values['image']?.trim() || undefined;
  const downloadFileName = methodImage ? methodImageSection.values['downloadFileName']?.trim() || `${slug}-steps.png` : undefined;

  return {
    slug,
    locale,
    title,
    summary,
    category,
    tags,
    durationMinutes,
    difficulty,
    calories,
    coverImage,
    updatedAt,
    source: 'md',
    servings,
    ingredients,
    seasonings,
    sauce,
    steps,
    tips,
    nutritionNotes,
    methodImage,
    downloadFileName,
    html: renderMarkdown(markdown),
  };
}

function splitRecipeSections(markdown: string): ParsedRecipeTemplate {
  const lines = markdown.split(/\r?\n/);
  let title = '';
  const sections = new Map<RecipeSectionName, SectionLine[]>();
  let current: RecipeSectionName | null = null;

  for (let index = 0; index < lines.length; index++) {
    const raw = lines[index] ?? '';
    const line = normalizeText(raw).trimEnd();
    if (line.startsWith('# ')) {
      title = line.slice(2).trim();
      continue;
    }
    if (line.startsWith('## ')) {
      const name = line.slice(3).trim() as RecipeSectionName;
      current = name;
      if (!sections.has(name)) sections.set(name, []);
      continue;
    }
    if (current) {
      sections.get(current)?.push({ line: index + 1, text: line });
    }
  }

  if (!title) {
    throw new RecipeMarkdownParseError('MISSING_TITLE', '缺少一级标题：请使用 "# 菜名"。', undefined, 1);
  }
  for (const sectionName of REQUIRED_SECTIONS) {
    if (!sections.has(sectionName)) {
      throw new RecipeMarkdownParseError('MISSING_SECTION', `缺少必填章节：${sectionName}`, sectionName);
    }
  }

  return { title, sections };
}

function requireSection(map: Map<RecipeSectionName, SectionLine[]>, name: RecipeSectionName): SectionLine[] {
  const section = map.get(name);
  if (!section || section.length === 0) {
    throw new RecipeMarkdownParseError('MISSING_SECTION', `缺少必填章节：${name}`, name);
  }
  return section;
}

function parseKeyValueLines(lines: SectionLine[], section: string) {
  const result: Record<string, string> = {};
  const firstLine = lines[0]?.line;
  for (const line of lines) {
    const trimmed = line.text.trim();
    if (!trimmed.startsWith('- ')) continue;
    const content = normalizeText(trimmed.slice(2));
    const pivot = content.indexOf(':');
    if (pivot <= 0) continue;
    const key = content.slice(0, pivot).trim();
    const value = content.slice(pivot + 1).trim();
    result[key] = value;
  }
  return { values: result, firstLine, section };
}

function parsePipeList(lines: SectionLine[], section: string): RecipeIngredient[] {
  const result: RecipeIngredient[] = [];
  for (const line of lines) {
    const trimmed = line.text.trim();
    if (!trimmed.startsWith('- ')) continue;
    const content = trimmed.slice(2);
    const parts = content.split('|').map((item) => item.trim());
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      throw new RecipeMarkdownParseError('INVALID_PIPE_ROW', `${section} 存在格式错误行：${trimmed}`, section, line.line, '请使用 "- 名称 | 用量 | 备注"');
    }
    result.push({
      name: parts[0],
      amount: parts[1],
      note: parts[2] || undefined,
    });
  }
  return result;
}

function parseSteps(lines: SectionLine[]): RecipeStep[] {
  const result: RecipeStep[] = [];
  let current: RecipeStep | null = null;
  for (const line of lines) {
    const trimmed = line.text.trim();
    if (trimmed.startsWith('### ')) {
      const rawTitle = trimmed.slice(4).trim();
      const normalizedTitle = rawTitle.replace(/^\d+\.\s*/, '').trim();
      current = { title: normalizedTitle || rawTitle, bullets: [] };
      result.push(current);
      continue;
    }
    if (trimmed.startsWith('- ') && current) {
      current.bullets.push(trimmed.slice(2).trim());
    }
  }
  return result;
}

function parseBullets(lines: SectionLine[]): string[] {
  return lines
    .map((line) => line.text.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim());
}

function requireField(source: { values: Record<string, string>; section: string }, key: string): string {
  const value = source.values[key]?.trim();
  if (!value) {
    throw new RecipeMarkdownParseError('MISSING_BASIC_FIELD', `基础信息缺少字段：${key}`, source.section);
  }
  return value;
}

function toLocale(value: string): Locale {
  if (value === 'zh' || value === 'en') return value;
  throw new RecipeMarkdownParseError('INVALID_ENUM', `locale 非法：${value}`, '基础信息');
}

function toCategory(value: string): RecipeCategory {
  if (value === 'muscle' || value === 'fat-loss' || value === 'balanced') return value;
  throw new RecipeMarkdownParseError('INVALID_ENUM', `category 非法：${value}`, '基础信息');
}

function toTags(value: string): RecipeTag[] {
  const tags = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  for (const tag of tags) {
    if (tag !== 'high-protein' && tag !== 'low-fat' && tag !== 'quick') {
      throw new RecipeMarkdownParseError('INVALID_ENUM', `tags 包含非法值：${tag}`, '基础信息');
    }
  }
  return tags as RecipeTag[];
}

function toDifficulty(value: string): RecipeDifficulty {
  if (value === 'easy' || value === 'medium' || value === 'hard') return value;
  throw new RecipeMarkdownParseError('INVALID_ENUM', `difficulty 非法：${value}`, '基础信息');
}

function toNumber(value: string, field: string): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new RecipeMarkdownParseError('INVALID_NUMBER', `${field} 必须为数字：${value}`, '基础信息');
  }
  return parsed;
}

function optionalNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number(value.trim());
  return Number.isNaN(parsed) ? undefined : parsed;
}

function normalizeText(input: string): string {
  return input
    .replace(/：/g, ':')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/\u3000/g, ' ')
    .trimEnd();
}

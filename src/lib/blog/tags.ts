import type { Locale } from '@devfolio-blog/shared-types';

type TagLabels = Record<Locale, string>;

const TAG_LABELS: Record<string, TagLabels> = {
  'ai-agent': { zh: 'AI Agent', en: 'AI Agent' },
  algorithm: { zh: '算法', en: 'Algorithm' },
  architecture: { zh: '架构', en: 'Architecture' },
  automation: { zh: '自动化', en: 'Automation' },
  blog: { zh: '博客', en: 'Blog' },
  'c-advisor': { zh: 'cAdvisor', en: 'cAdvisor' },
  csharp: { zh: 'C#', en: 'C#' },
  ddd: { zh: 'DDD', en: 'DDD' },
  dotnet: { zh: '.NET', en: '.NET' },
  'aspnet-core': { zh: 'ASP.NET Core', en: 'ASP.NET Core' },
  fitness: { zh: '健身', en: 'Fitness' },
  grafana: { zh: 'Grafana', en: 'Grafana' },
  hermes: { zh: 'Hermes', en: 'Hermes' },
  'home-assistant': { zh: 'Home Assistant', en: 'Home Assistant' },
  markdown: { zh: 'Markdown', en: 'Markdown' },
  microservices: { zh: '微服务', en: 'Microservices' },
  monitoring: { zh: '监控', en: 'Monitoring' },
  'modular-architecture': { zh: '模块化架构', en: 'Modular Architecture' },
  'nas': { zh: 'NAS', en: 'NAS' },
  product: { zh: '产品', en: 'Product' },
  prometheus: { zh: 'Prometheus', en: 'Prometheus' },
  refactoring: { zh: '重构', en: 'Refactoring' },
  'self-hosting': { zh: '自托管', en: 'Self-hosting' },
  'service-boundaries': { zh: '服务边界', en: 'Service Boundaries' },
  sqlite: { zh: 'SQLite', en: 'SQLite' },
  'system-design': { zh: '系统设计', en: 'System Design' },
  tdd: { zh: 'TDD', en: 'TDD' },
  unraid: { zh: 'Unraid', en: 'Unraid' },
  evolution: { zh: '演进', en: 'Evolution' },
  fundamentals: { zh: '基础知识', en: 'Fundamentals' },
  programming: { zh: '编程基础', en: 'Programming' },
  'domain-modeling': { zh: '领域建模', en: 'Domain Modeling' },
  'extreme-programming': { zh: '极限编程', en: 'Extreme Programming' },
};

const TAG_ALIASES: Record<string, string> = {
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
  '内容平台': 'content-platform',
  '基础知识': 'fundamentals',
  '微服务': 'microservices',
  '服务边界': 'service-boundaries',
  '极限编程': 'extreme-programming',
  '架构': 'architecture',
  '模块化架构': 'modular-architecture',
  '演进': 'evolution',
  '系统设计': 'system-design',
  '算法': 'algorithm',
  '编程基础': 'programming',
  '自托管': 'self-hosting',
  '重构': 'refactoring',
  '领域建模': 'domain-modeling',
};

export function toTagId(label: string) {
  const trimmed = label.trim();
  return TAG_ALIASES[trimmed] ?? slugifyTag(trimmed);
}

export function getTagLabel(tagId: string, locale: Locale) {
  return TAG_LABELS[tagId]?.[locale] ?? humanizeTag(tagId);
}

export function toTagIds(labels: string[]) {
  return [...new Set(labels.map(toTagId).filter(Boolean))];
}

export function tagIdsToLabels(tagIds: string[], locale: Locale) {
  return tagIds.map((tagId) => getTagLabel(tagId, locale));
}

function slugifyTag(value: string) {
  return value
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function humanizeTag(tagId: string) {
  return tagId
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

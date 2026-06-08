const BLOG_SLUG_ALIASES: Record<string, string> = {
  '领域驱动设计为什么存在-从统一语言到知识提炼':
    'domain-driven-design-why-it-exists-unified-language-to-knowledge-extraction',
  '领域模型如何落地-分层-聚合与上下文边界':
    'domain-model-implementation-layers-aggregates-and-bounded-contexts',
  '微服务不是领域模型-先把-ddd-做对-再谈拆分':
    'microservices-are-not-the-domain-model-get-ddd-right-before-splitting',
  '极限编程是什么-从敏捷宣言到工程纪律':
    'what-is-extreme-programming-from-agile-manifesto-to-engineering-discipline',
  'tdd-与单元测试-用测试驱动设计与反馈':
    'tdd-and-unit-tests-driving-design-and-feedback',
  '重构-把可修改性变成日常能力': 'refactoring-making-modifiability-a-daily-habit',
  '持续集成与质量门禁-让主干始终可交付':
    'continuous-integration-and-quality-gates-keeping-main-shippable',
  '什么是架构-顶层设计-模块-组件与三大原则':
    'what-is-architecture-top-level-design-modules-components-and-three-principles',
  '架构为什么会复杂-高性能-高可用与约束取舍':
    'why-architecture-becomes-complex-high-performance-high-availability-and-tradeoffs',
  '架构风格如何演化-从-soa-到-rest-与微服务':
    'architecture-style-evolution-from-soa-to-rest-and-microservices',
  '架构落地的治理模式-分布式锁与边车模式':
    'architecture-governance-patterns-distributed-locks-and-sidecars',
};

export function resolveBlogSlug(slug: string) {
  return BLOG_SLUG_ALIASES[slug] ?? slug;
}

export function hasBlogSlugAlias(slug: string) {
  return Object.prototype.hasOwnProperty.call(BLOG_SLUG_ALIASES, slug);
}

export const blogSlugAliases = BLOG_SLUG_ALIASES;

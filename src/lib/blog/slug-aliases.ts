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
  '\u8ba1\u7b97\u673a\u4e3a\u4ec0\u4e48\u80fd\u8dd1\u7a0b\u5e8f-\u7ec4\u6210\u539f\u7406-\u5b58\u50a8-\u94fe\u63a5\u4e0e\u5e76\u53d1':
    'why-computers-can-run-programs-components-storage-linking-concurrency',
  '\u6570\u636e\u7ed3\u6784\u4e0e\u7b97\u6cd5\u4e3a\u4ec0\u4e48\u91cd\u8981-\u4ece\u6570\u7ec4-\u94fe\u8868\u5230\u6392\u5e8f\u4e0e\u54c8\u5e0c':
    'why-data-structures-and-algorithms-matter-arrays-lists-sorting-hash',
  '\u9762\u5411\u5bf9\u8c61\u4e0e\u8bbe\u8ba1\u539f\u5219-\u4ece\u5c01\u88c5-\u7ee7\u627f\u5230\u4ee3\u7801\u574f\u5473\u9053':
    'object-orientation-and-design-principles-encapsulation-inheritance-code-smells',
  '\u5de5\u7a0b\u534f\u4f5c\u4e0e\u4ea4\u4ed8-git-\u9700\u6c42\u5206\u6790\u4e0e\u4f30\u7b97':
    'engineering-collaboration-and-delivery-git-requirements-analysis-and-estimation',
  'clr-and-csharp-type-system-objects-heap-and-garbage-collection':
    'csharp-value-types-reference-types-and-object-semantics',
  'thread-concurrency-and-synchronization-thread-costs-to-deadlock-governance':
    'dotnet-thread-costs-threadpool-and-async-boundaries',
  'dotnet-application-architecture-dependency-injection-mediatr-aop-and-resilience':
    'aspnet-core-dependency-injection-lifetimes',
  'service-communication-and-authentication-from-tcp-wcf-to-grpc-and-jwt':
    'tcp-connection-lifecycle-handshake-and-teardown',
  'dotnet-engineering-toolchain-cli-and-package-management-practices':
    'dotnet-cli-daily-development-workflow',
};

export function resolveBlogSlug(slug: string) {
  return BLOG_SLUG_ALIASES[slug] ?? slug;
}

export function hasBlogSlugAlias(slug: string) {
  return Object.prototype.hasOwnProperty.call(BLOG_SLUG_ALIASES, slug);
}

export const blogSlugAliases = BLOG_SLUG_ALIASES;

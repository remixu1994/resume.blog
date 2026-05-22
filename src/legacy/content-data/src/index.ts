import {
  architectureCaseSchema,
  assertSchema,
  postSchema,
  topicShowcaseSchema,
} from '@devfolio-blog/content-schema';
import type {
  ArchitectureCase,
  BookRecommendation,
  FeaturedPayload,
  Locale,
  PublicPost,
  ResumeProjectShowcase,
  ResumeProfile,
  TopicShowcase,
} from '@devfolio-blog/shared-types';

const afryShowcaseZh: ResumeProjectShowcase = {
  id: 'afry-tcaweb',
  slug: 'afry-tcaweb',
  entryLabel: '查看作品展示',
  collapseLabel: '收起作品展示',
  defaultSectionKey: 'architecture',
  sections: [
    {
      key: 'architecture',
      title: 'TCAWeb System',
      status: 'ready',
      summary: '围绕遗留 PC GUI 向 Web 架构系统升级的过程，系统化展示整体架构拆分、核心调用链路、领域模型抽象与跨平台部署设计，说明该方案如何支撑多环境共存和持续演进。',
      blocks: [
        {
          type: 'text',
          title: '设计目标',
          body:
            '背景：原有能力长期运行在 Windows PC GUI 与 WCF 链路中，交互方式、部署方式和扩展边界都偏向桌面形态。\n目标：将核心能力升级为面向嵌入式场景的 Web 架构，同时兼容 Linux ARM、Linux x64 与 Windows 环境。\n职责：负责核心架构设计、接口拆分、交互链路梳理，以及开发、测试、发布的全生命周期推进。',
        },
        {
          type: 'image',
          title: '系统架构图',
          body:
            '展示从 Windows PC GUI 与 WCF 旧链路，向 Web API / Web GUI 跨平台方案演进的双轨架构。重点说明 Web 层、通信层、运行时进程与 RT Process 之间的边界划分，以及迁移期新旧链路如何并存。',
          imageSrc: '/assets/resume/afry/pc_web_architecture.png',
          imageAlt: 'TCAWeb system architecture overview',
          caption: 'Legacy PC GUI and new web stack coexist during the transition.',
        },
        {
          type: 'image',
          title: '时序图',
          body:
            '整理 CpriConfigGetStatus 的典型交互流程，覆盖用户触发、平台逻辑查询、通信层转发、WCF/Linkx 下发以及事件回调注册。',
          imageSrc: '/assets/resume/afry/pc-sequence.png',
          imageAlt: 'TCAWeb sequence diagram',
          caption: 'User request, status lookup, signal dispatch, and event registration flow.',
        },
        {
          type: 'image',
          title: '系统领域模型对象',
          body: '梳理 WCF Cpri Helper、Config、Port 与 Alarm 之间的核心领域对象与依赖关系，说明迁移过程中哪些能力被保留、抽象和重新组织。',
          imageSrc: '/assets/resume/afry/ClassDiagram.png',
          imageAlt: 'TCAWeb 系统领域模型对象',
        },
        {
          type: 'image',
          title: '部署架构图',
          body: '展示 Windows、Linux ARM、Linux x64 等多环境下的部署节点与网络拓扑，体现同一套系统在不同硬件与运行环境中的部署差异和连接方式。',
          imageSrc: '/assets/resume/afry/Deployment_Architecture.png',
          imageAlt: 'TCAWeb 部署架构图',
        },
        {
          type: 'text',
          title: '关键收益',
          body:
            '收益：把原本偏桌面形态的系统能力沉淀为可扩展的 Web 架构，降低后续功能扩展与跨平台适配成本。\n取舍：保留迁移期必要的兼容链路，换取新旧系统平滑共存，而不是一次性替换全部运行链路。\n结果：为后续接口标准化、测试复用、组件抽象和发布协作打下统一架构基础。',
        },
      ],
    },
    {
      key: 'testing',
      title: '测试流程',
      status: 'ready',
      summary: '围绕迁移期测试复用问题，说明遗留 WCF 与新 Web API 在模型、接口和运行时依赖上的冲突，以及如何通过公共模型、共享接口与动态程序集加载建立统一测试体系。',
      blocks: [
        {
          type: 'text',
          title: '核心难点',
          body:
            '问题：迁移期同时维护遗留 WCF 服务和新 Web API，如果测试代码完全分离，会带来重复建模、重复断言和双倍维护成本。\n挑战：两套实现的模型定义、接口入口和运行时依赖不同，直接复用测试代码会产生冲突。\n目标：在不牺牲兼容性的前提下，建立可复用、可扩展、可维护的统一测试抽象。',
        },
        {
          type: 'image',
          title: '测试复用冲突问题',
          body: '展示遗留 WCF 与新 Web API 在测试代码复用上的冲突点，重点说明模型定义、接口契约与运行时依赖差异如何导致用例重复、断言分叉和维护成本上升。',
          imageSrc: '/assets/resume/afry/TestConflict.png',
          imageAlt: '测试复用冲突问题',
        },
        {
          type: 'image',
          title: '公共模型与动态加载方案',
          body: '展示通过抽取公共模型与接口、统一测试抽象，并结合运行时动态程序集加载，让 Web 与 WCF 共用同一套测试代码的设计方案，减少重复实现并保持接口对齐。',
          imageSrc: '/assets/resume/afry/test-2.png',
          imageAlt: '公共模型与动态加载方案',
        },
        {
          type: 'text',
          title: '复用收益',
          body:
            '收益：同一套测试逻辑可以覆盖新旧接口实现，显著降低迁移阶段的重复开发成本。\n工程价值：共享模型与接口让断言标准更统一，动态加载机制让测试运行时更灵活。\n结果：后续接口升级和回归验证可以围绕统一测试资产持续迭代，而不是维护两套分叉体系。',
        },
      ],
    },
    {
      key: 'workflow',
      title: '协作',
      status: 'ready',
      summary: '展示团队协作中的 Git 分支策略、配置管理、持续集成与交付链路，说明多人并行开发如何通过流程约束、制品管理和发布规范降低集成与交付风险。',
      blocks: [
        {
          type: 'text',
          title: '协作目标',
          body:
            '目标：让架构升级、功能开发、缺陷修复和版本发布能够在多人并行场景下稳定推进。\n核心关注：分支职责清晰、构建链路可追踪、制品版本可管理、交付过程可复盘。\n价值：把工程协作从“依赖经验”转成“依赖流程和工具”来保证稳定性。',
        },
        {
          type: 'image',
          title: 'Git 工作流',
          body: '展示团队协作中的 Git 分支策略、分支职责与日常开发协同流程，说明需求开发、问题修复、版本准备和主干合并如何各自归位。',
          imageSrc: '/assets/resume/afry/GitWorkflow.png',
          imageAlt: 'Git 工作流',
        },
        {
          type: 'image',
          title: 'CI&CM 流程',
          body: '展示构建触发、制品发布、版本命名与交付包输出流程，说明 Gerrit、Jenkins、Artifactory 等工具如何串起配置管理和交付控制。',
          imageSrc: '/assets/resume/afry/CI&CM.png',
          imageAlt: 'CI&CM 流程图',
        },
        {
          type: 'text',
          title: '交付收益',
          body:
            '收益：多人协作时，分支边界和制品链路更清晰，减少代码集成冲突和版本错发风险。\n工程价值：构建、制品、版本和交付信息能被统一追踪，便于问题回溯和发布复盘。\n结果：架构升级类项目也能在持续开发中保持稳定的发布节奏。',
        },
      ],
    },
    {
      key: 'components',
      title: '方案设计',
      status: 'ready',
      summary: '从组件职责、缓存策略和安全升级三个角度，展示关键方案设计及其背后的边界划分、性能考虑和安全约束，说明系统能力是如何被逐层组织和落地的。',
      blocks: [
        {
          type: 'text',
          title: '方案总览',
          body:
            '这一部分聚焦系统从“可运行”走向“可维护、可扩展、可交付”过程中沉淀出来的核心方案。\n关注点不是单个功能点，而是组件边界、数据流、缓存策略和安全控制点如何协同工作。\n每张图都对应一个关键设计决策，而不是简单的实现截图。',
        },
        {
          type: 'text',
          title: 'Linx 设计目标',
          groupKey: 'linx',
          body:
            '定位：承接核心通信与运行时交互的中间层组件。\n关注：线程模型、消息订阅分发、组件职责边界，以及与 Gateway 的接口协作关系。\n价值：把复杂交互沉淀为稳定的中枢组件，降低外围模块直接耦合底层通信细节。',
        },
        {
          type: 'image',
          title: 'Linx 架构图',
          groupKey: 'linx',
          body: '展示 Linx 组件职责、线程模型、消息订阅关系与 Gateway 交互细节，重点说明核心消息如何被组织、转发和消费。',
          imageSrc: '/assets/resume/afry/linx_architechure.png',
          imageAlt: 'Linx 架构图',
        },
        {
          type: 'text',
          title: 'Web Cache 设计目标',
          groupKey: 'web-cache',
          body:
            '定位：为 Web 层提供更稳定、更高效的数据读取体验。\n关注：缓存命中策略、数据更新路径、失效机制和访问热点的处理方式。\n价值：在保证一致性边界可控的前提下，减少重复读取和链路压力，提升前端交互响应。',
        },
        {
          type: 'image',
          title: 'Web Cache 设计',
          groupKey: 'web-cache',
          body: '展示 Web Cache 的缓存策略与数据流设计，说明数据如何进入缓存、如何被读取，以及何时需要回源和更新。',
          imageSrc: '/assets/resume/afry/CacheDesign.png',
          imageAlt: 'Web Cache 设计',
        },
        {
          type: 'text',
          title: 'Secure Upgrade 设计目标',
          groupKey: 'secure-upgrade',
          body:
            '定位：在内部环境下建立可信、安全、可控的升级链路。\n关注：证书信任关系、升级包校验、关键安全控制点，以及升级过程中的环境约束。\n价值：把升级过程从“可执行”提升为“可验证、可追踪、可审计”的安全方案。',
        },
        {
          type: 'image',
          title: 'Secure Upgrade 方案',
          groupKey: 'secure-upgrade',
          body: '展示内部安全升级方案的流程设计、证书信任链路与关键安全控制点，说明内部环境下如何建立可信升级通道。',
          imageSrc: '/assets/resume/afry/secure.png',
          imageAlt: 'Secure Upgrade 方案',
        },
        {
          type: 'text',
          title: '关键取舍与收益',
          body:
            '取舍：通过更清晰的组件边界和更明确的安全控制点，换取系统复杂度可控和长期维护成本下降。\n收益：核心能力不再只依赖单点实现，而是形成可复用、可演进、可解释的方案沉淀。\n结果：这部分设计既服务当前交付，也为后续扩展和团队协作提供了统一基础。',
        },
      ],
    },
  ],
};

const afryShowcaseEn: ResumeProjectShowcase = {
  id: 'afry-tcaweb',
  slug: 'afry-tcaweb',
  entryLabel: 'View showcase',
  collapseLabel: 'Hide showcase',
  defaultSectionKey: 'architecture',
  sections: [
    {
      key: 'architecture',
      title: 'TCAWeb System',
      status: 'ready',
      summary: 'Captures the evolution from a legacy PC GUI into a web architecture system through architecture boundaries, sequence flow, domain modeling, and deployment topology, showing how the solution supports cross-platform coexistence and long-term evolution.',
      blocks: [
        {
          type: 'text',
          title: 'Goals',
          body:
            'Background: the original capabilities lived inside a Windows PC GUI and WCF-oriented delivery model.\nGoal: move the system toward a web architecture that can run across Linux ARM, Linux x64, and Windows environments.\nOwnership: responsible for core architecture design, interface decomposition, delivery implementation, testing, and release coordination.',
        },
        {
          type: 'image',
          title: 'System architecture',
          body:
            'Shows the transition from the legacy Windows PC GUI and WCF chain to the cross-platform Web API and Web GUI solution across Windows, Linux, and RT process boundaries, including how old and new paths coexist during migration.',
          imageSrc: '/assets/resume/afry/pc_web_architecture.png',
          imageAlt: 'TCAWeb system architecture overview',
          caption: 'Legacy PC GUI and new web stack coexist during the transition.',
        },
        {
          type: 'image',
          title: 'Sequence diagram',
          body:
            'Summarizes a representative CpriConfigGetStatus flow covering user entry, platform lookup, communication forwarding, WCF/Linkx dispatch, and event registration.',
          imageSrc: '/assets/resume/afry/pc-sequence.png',
          imageAlt: 'TCAWeb sequence diagram',
          caption: 'User request, status lookup, signal dispatch, and event registration flow.',
        },
        {
          type: 'image',
          title: 'System Domain Model',
          body: 'Captures the core domain objects and dependencies across WCF Cpri Helper, Config, Port, and Alarm components, showing what was preserved, abstracted, and reorganized during migration.',
          imageSrc: '/assets/resume/afry/ClassDiagram.png',
          imageAlt: 'TCAWeb system domain model',
        },
        {
          type: 'image',
          title: 'Deployment architecture',
          body: 'Shows deployment nodes and network topology across Windows, Linux ARM, and Linux x64 environments, highlighting how the same system is adapted to different runtime targets.',
          imageSrc: '/assets/resume/afry/Deployment_Architecture.png',
          imageAlt: 'TCAWeb deployment architecture',
        },
        {
          type: 'text',
          title: 'Tradeoffs and Outcomes',
          body:
            'Tradeoff: keep necessary compatibility paths during migration instead of forcing a one-shot replacement.\nOutcome: architecture capabilities become reusable and extensible rather than staying locked inside a desktop delivery model.\nResult: this foundation supports later testing reuse, component abstraction, and more stable release coordination.',
        },
      ],
    },
    {
      key: 'testing',
      title: 'Testing',
      status: 'ready',
      summary: 'Explains the test reuse conflict between legacy WCF and new Web APIs, then shows how common models, shared interfaces, and runtime dynamic assembly loading create a unified regression testing approach.',
      blocks: [
        {
          type: 'text',
          title: 'Core Challenge',
          body:
            'Problem: both legacy WCF services and new Web APIs needed regression coverage during migration.\nChallenge: their models, entry contracts, and runtime dependencies were different enough to block direct test reuse.\nGoal: create a shared testing abstraction without sacrificing compatibility with either implementation.',
        },
        {
          type: 'image',
          title: 'Test Reuse Conflict',
          body: 'Shows the reuse conflicts between legacy WCF and new Web API tests, especially around duplicated models, contract mismatches, and runtime dependency differences that drive repeated test implementation.',
          imageSrc: '/assets/resume/afry/TestConflict.png',
          imageAlt: 'Test reuse conflict',
        },
        {
          type: 'image',
          title: 'Shared Model and Dynamic Loading Solution',
          body: 'Shows the solution that extracts common models and interfaces, then uses runtime dynamic assembly loading so Web and WCF can share the same testing code while keeping implementation-specific bindings flexible.',
          imageSrc: '/assets/resume/afry/test-2.png',
          imageAlt: 'Shared model and dynamic loading solution',
        },
        {
          type: 'text',
          title: 'Outcomes',
          body:
            'Outcome: one set of testing assets can validate both old and new implementations.\nEngineering value: assertions stay aligned through shared contracts while runtime flexibility is preserved.\nResult: regression coverage can evolve around one reusable testing foundation instead of two diverging suites.',
        },
      ],
    },
    {
      key: 'workflow',
      title: 'Collaboration',
      status: 'ready',
      summary: 'Shows the Git collaboration model together with configuration management, CI, and delivery flow, explaining how branch policy, build automation, and artifact control reduce coordination and release risk.',
      blocks: [
        {
          type: 'text',
          title: 'Collaboration Goals',
          body:
            'Goal: keep architecture work, feature delivery, fixes, and releases moving in parallel without losing control.\nFocus: branch responsibilities, traceable builds, manageable artifacts, and repeatable release steps.\nValue: stability comes from workflow and tooling, not only from individual experience.',
        },
        {
          type: 'image',
          title: 'Git Workflow',
          body: 'Shows the branching strategy, branch responsibilities, and day-to-day collaboration workflow used by the team, including how feature work, fixes, and release preparation are separated.',
          imageSrc: '/assets/resume/afry/GitWorkflow.png',
          imageAlt: 'Git workflow',
        },
        {
          type: 'image',
          title: 'CI&CM Workflow',
          body: 'Shows build triggers, artifact publishing, versioning, and package output flow, connecting Gerrit, Jenkins, Artifactory, and release packaging into one managed delivery chain.',
          imageSrc: '/assets/resume/afry/CI&CM.png',
          imageAlt: 'CI&CM workflow diagram',
        },
        {
          type: 'text',
          title: 'Delivery Outcomes',
          body:
            'Outcome: parallel work becomes easier to coordinate and safer to release.\nEngineering value: branches, builds, artifacts, and versions can all be tracked and reviewed consistently.\nResult: even migration-heavy work can keep a stable release cadence with fewer integration surprises.',
        },
      ],
    },
    {
      key: 'components',
      title: 'Solution Design',
      status: 'ready',
      summary: 'Explains the system through component boundaries, caching strategy, and secure upgrade design, showing how runtime responsibility, performance considerations, and security constraints are translated into concrete implementation decisions.',
      blocks: [
        {
          type: 'text',
          title: 'Overview',
          body:
            'This section focuses on the core solutions that made the system maintainable, extensible, and releasable.\nThe emphasis is not on isolated features, but on component boundaries, data flow, caching choices, and security control points.\nEach diagram represents a design decision, not just an implementation snapshot.',
        },
        {
          type: 'text',
          title: 'Linx Responsibilities',
          groupKey: 'linx',
          body:
            'Role: the middle layer that coordinates communication and runtime interaction.\nFocus: thread model, message subscription and dispatch, and the boundary between Linx and Gateway.\nValue: complex interactions are centralized into a stable component instead of leaking low-level communication concerns into every module.',
        },
        {
          type: 'image',
          title: 'Linx Architecture',
          groupKey: 'linx',
          body: 'Shows component responsibilities, thread model, message subscriptions, and gateway interactions, with emphasis on how messages are organized, routed, and consumed.',
          imageSrc: '/assets/resume/afry/linx_architechure.png',
          imageAlt: 'Linx architecture diagram',
        },
        {
          type: 'text',
          title: 'Web Cache Responsibilities',
          groupKey: 'web-cache',
          body:
            'Role: provide more stable and efficient data access for the Web layer.\nFocus: cache hit strategy, update path, invalidation rules, and hotspot access patterns.\nValue: reduce repeated reads and downstream pressure while keeping consistency boundaries understandable.',
        },
        {
          type: 'image',
          title: 'Web Cache Design',
          groupKey: 'web-cache',
          body: 'Shows the caching strategy and data flow design for Web Cache, including how data enters cache, how it is read, and when it needs to be refreshed from the source.',
          imageSrc: '/assets/resume/afry/CacheDesign.png',
          imageAlt: 'Web cache design',
        },
        {
          type: 'text',
          title: 'Secure Upgrade Responsibilities',
          groupKey: 'secure-upgrade',
          body:
            'Role: build a trusted and controlled upgrade path in internal environments.\nFocus: certificate trust chain, package verification, security control points, and operational constraints during upgrade.\nValue: move the upgrade process from merely executable to verifiable, traceable, and auditable.',
        },
        {
          type: 'image',
          title: 'Secure Upgrade Solution',
          groupKey: 'secure-upgrade',
          body: 'Shows the secure upgrade flow, trust chain handling, and key control points in the solution, explaining how a trusted upgrade channel is established in internal environments.',
          imageSrc: '/assets/resume/afry/secure.png',
          imageAlt: 'Secure upgrade solution',
        },
        {
          type: 'text',
          title: 'Tradeoffs and Outcomes',
          body:
            'Tradeoff: invest in clearer boundaries and stronger control points to keep long-term complexity under control.\nOutcome: core capabilities become reusable solutions instead of one-off implementation details.\nResult: the same design foundation supports delivery today and extension tomorrow.',
        },
      ],
    },
  ],
};

const beisenInspectionShowcaseZh: ResumeProjectShowcase = {
  id: 'beisen-inspection',
  slug: 'beisen-inspection',
  entryLabel: '查看作品展示',
  collapseLabel: '收起作品展示',
  defaultSectionKey: 'log-observability',
  sections: [
    {
      key: 'log-observability',
      title: '日志巡检',
      status: 'ready',
      summary: '展示日志采集、监控与告警处理的整体设计，串联日志接入、指标观测、告警发现、异常处理与结果回溯，说明该流程如何支撑大规模服务巡检和风险定位。',
      blocks: [
        {
          type: 'text',
          title: '巡检目标',
          body:
            '目标：围绕 100+ 服务建立一套可持续执行的日志巡检与风险发现机制。\n关注：日志是否可采、监控是否可观测、告警是否能触发、问题是否能闭环处理。\n价值：让稳定性巡检从一次性排查动作，变成可重复、可追踪、可协同的工程流程。',
        },
        {
          type: 'image',
          title: '日志采集、监控与告警处理流程',
          body: '展示从日志接入、监控观测、告警触发到问题处理的端到端流程，强调巡检视角下的异常发现、问题定位、告警响应和处理协同。',
          imageSrc: '/assets/resume/beisen/zh/isv_log_zh.png',
          imageAlt: '日志采集、监控与告警处理流程',
        },
        {
          type: 'text',
          title: '巡检收益',
          body:
            '收益：日志、监控和告警不再是割裂的工具链，而是统一服务于稳定性巡检。\n工程价值：问题发现、责任定位和处理协同都有更清晰的路径，降低大规模服务排障成本。\n结果：巡检工作可以覆盖更多服务，同时保持更高的可执行性和复盘价值。',
        },
      ],
    },
  ],
};

const beisenInspectionShowcaseEn: ResumeProjectShowcase = {
  id: 'beisen-inspection',
  slug: 'beisen-inspection',
  entryLabel: 'View showcase',
  collapseLabel: 'Hide showcase',
  defaultSectionKey: 'log-observability',
  sections: [
    {
      key: 'log-observability',
      title: 'Log Observability',
      status: 'ready',
      summary: 'Shows the end-to-end design for log collection, monitoring, and alert handling, connecting ingestion, observation, alert discovery, issue response, and retrospective analysis to support large-scale stability inspection and risk investigation.',
      blocks: [
        {
          type: 'text',
          title: 'Inspection Goals',
          body:
            'Goal: establish a repeatable inspection mechanism for 100+ services.\nFocus: whether logs are collectable, metrics are observable, alerts are actionable, and incidents can be closed through a clear workflow.\nValue: turn stability inspection from an ad hoc activity into a repeatable engineering process.',
        },
        {
          type: 'image',
          title: 'Log Collection, Monitoring, and Alert Handling Flow',
          body: 'Shows the end-to-end flow from log ingestion and monitoring observation to alert triggering and issue handling, with a focus on anomaly discovery, diagnosis, alert response, and cross-team collaboration during stability inspection.',
          imageSrc: '/assets/resume/beisen/en/isv_log_en.png',
          imageAlt: 'Log collection, monitoring, and alert handling flow',
        },
        {
          type: 'text',
          title: 'Inspection Outcomes',
          body:
            'Outcome: logs, monitoring, and alerts work as one inspection system instead of disconnected tools.\nEngineering value: issue discovery, ownership tracking, and response coordination become easier across a large service estate.\nResult: inspection work scales to more services while remaining practical to execute and useful for retrospective review.',
        },
      ],
    },
  ],
};

const beisenMessageRefactorShowcaseZh: ResumeProjectShowcase = {
  id: 'beisen-message-refactor',
  slug: 'beisen-message-refactor',
  entryLabel: '查看作品展示',
  collapseLabel: '收起作品展示',
  defaultSectionKey: 'message-refactor',
  sections: [
    {
      key: 'message-refactor',
      title: '消息代办重构',
      status: 'ready',
      summary: '展示消息代办服务在高峰业务场景下从旧设计暴露线程阻塞问题，到通过自定义 Kafka 队列、租户串行消费和灰度升级完成优化落地的完整链路。',
      blocks: [
        {
          type: 'text',
          title: '案例背景',
          groupKey: 'legacy-design',
          body:
            '该案例聚焦消息代办服务重构前的旧设计。服务一侧通过大量线程消费 Kafka 消息，另一侧同步调用下游服务完成业务处理与结果流转。\n异常主要出现在每个月月初和月末，HR 会集中发起目标制定与目标考核场景。由于公司有上万个员工，这类业务高峰会带来瞬时流量激增，在客户服务响应越来越慢、上下游生产消费能力不对等的情况下，原有设计逐渐暴露出线程阻塞、请求超时和资源堆积问题。',
        },
        {
          type: 'image',
          title: '旧版消息代办服务设计',
          groupKey: 'legacy-design',
          body: '展示旧版消息代办服务的消息消费和同步调用链路，说明多线程消费、同步下游依赖和上下游能力不匹配是如何叠加成系统风险的。',
          imageSrc: '/assets/resume/beisen/zh/Message_zh.png',
          imageAlt: '旧版消息代办服务设计',
        },
        {
          type: 'text',
          title: '核心问题',
          groupKey: 'legacy-design',
          body:
            '1. 服务使用约 500 个线程消费并处理 Kafka 中的消息，同时同步调用下游服务完成对接。\n2. 在每月月初和月末的目标制定、目标考核业务高峰期，上万个员工带来的瞬时流量激增会快速放大链路压力。\n3. 由于上下游服务的生产与消费能力不对等，部分线程长期阻塞在同步调用阶段，进一步触发请求超时。\n4. 随着客户服务响应持续变慢，我们的消息处理线程不断堆积，等待返回的线程数量快速增长。\n5. 同步服务侧最终出现线程激增和内存飙升告警，系统稳定性持续恶化，也为后续重构提供了明确方向。',
        },
        {
          type: 'text',
          title: '升级方案',
          groupKey: 'upgrade-design',
          body:
            '为了解决高峰流量下的线程阻塞问题，方案从消息队列切分、消费模型和流量治理三方面同时调整。\n1. 申请 100 个 partition 的 custom Kafka queue，用更细粒度的分区承接高峰消息。\n2. Consumer group 启动 100 个线程，每个 queue 对应一个租户并采用串行同步处理，避免同一租户在并发链路中相互放大阻塞。\n3. 优化入队策略，为高流量租户指定固定 partition，把热点流量隔离到可控队列中，降低对其他租户的连带影响。',
        },
        {
          type: 'image',
          title: '消息代办升级方案',
          groupKey: 'upgrade-design',
          body: '展示基于 custom Kafka queue、租户分配和串行消费策略的升级方案，说明如何用分区隔离和租户定向入队来削峰、控并发并改善同步调用链路的稳定性。',
          imageSrc: '/assets/resume/beisen/zh/message_upgrade_zh.png',
          imageAlt: '消息代办升级方案',
        },
        {
          type: 'text',
          title: '灰度落地策略',
          groupKey: 'upgrade-design',
          body:
            '落地方式采用灰度模式逐步升级，而不是一次性全量切换。\n这样可以先在部分租户或部分流量上验证 queue 分配、线程模型和固定 partition 策略的效果，再逐步扩大覆盖范围，降低改造过程中的业务风险。',
        },
      ],
    },
  ],
};

const beisenMessageRefactorShowcaseEn: ResumeProjectShowcase = {
  id: 'beisen-message-refactor',
  slug: 'beisen-message-refactor',
  entryLabel: 'View showcase',
  collapseLabel: 'Hide showcase',
  defaultSectionKey: 'message-refactor',
  sections: [
    {
      key: 'message-refactor',
      title: 'Message Task Refactoring',
      status: 'ready',
      summary: 'Shows the end-to-end refactoring story for the message task service, from the legacy design that broke under peak business traffic to the upgraded Kafka partitioning, tenant-serial consumption, and gradual rollout strategy.',
      blocks: [
        {
          type: 'text',
          title: 'Background',
          groupKey: 'legacy-design',
          body:
            'This case focuses on the legacy design before the message task service was refactored. The service consumed Kafka messages with a large worker pool and synchronously called downstream services to complete business processing.\nThe failures mainly appeared at the beginning and end of each month, when HR launched goal planning and goal evaluation workflows. With tens of thousands of employees in the company, those business peaks created sudden traffic surges. As downstream response time kept getting worse and upstream-downstream capacity became increasingly unbalanced, the original design exposed clear risks around blocking threads, timeouts, and resource buildup.',
        },
        {
          type: 'image',
          title: 'Legacy Message Task Service Design',
          groupKey: 'legacy-design',
          body: 'Shows the legacy message task service flow and explains how heavy multi-threaded Kafka consumption, synchronous downstream dependencies, and capacity mismatch combined into a system-level stability risk.',
          imageSrc: '/assets/resume/beisen/en/Message_en.png',
          imageAlt: 'Legacy message task service design',
        },
        {
          type: 'text',
          title: 'Key Problems',
          groupKey: 'legacy-design',
          body:
            '1. The service used roughly 500 threads to consume and process Kafka messages while synchronously calling downstream services.\n2. During month-start and month-end goal planning and performance evaluation peaks, traffic surged instantly because the workflows were triggered across a workforce of tens of thousands of employees.\n3. Because production and consumption capacity between upstream and downstream services was mismatched, some threads stayed blocked for long periods and eventually triggered request timeouts.\n4. As downstream services became slower, our service accumulated more and more waiting threads for returned responses.\n5. The synchronous service then hit rapid thread growth and memory surge alerts, making the stability problem visible and urgent enough to justify refactoring.',
        },
        {
          type: 'text',
          title: 'Upgrade Strategy',
          groupKey: 'upgrade-design',
          body:
            'To address blocking under peak traffic, the redesign changed queue partitioning, consumption behavior, and traffic routing together.\n1. A custom Kafka queue with 100 partitions was introduced to spread peak load more deliberately.\n2. The consumer group started 100 worker threads, with each queue assigned to one tenant and processed serially to avoid amplifying contention within the same tenant flow.\n3. The enqueue strategy was optimized so that high-traffic tenants were mapped to fixed partitions, isolating hotspots and protecting other tenant traffic.',
        },
        {
          type: 'image',
          title: 'Message Task Upgrade Design',
          groupKey: 'upgrade-design',
          body: 'Shows the upgraded design based on a custom Kafka queue, tenant assignment, and serial consumption strategy, explaining how partition isolation and targeted enqueue routing reduce burst pressure and improve synchronous processing stability.',
          imageSrc: '/assets/resume/beisen/en/message_upgrade_en.png',
          imageAlt: 'Message task upgrade design',
        },
        {
          type: 'text',
          title: 'Gradual Rollout',
          groupKey: 'upgrade-design',
          body:
            'The rollout used a gray-release approach rather than a one-shot migration.\nThat made it possible to validate queue allocation, worker behavior, and fixed-partition routing on partial tenant traffic first, then expand coverage gradually while controlling business risk.',
        },
      ],
    },
  ],
};

export const resumeProfiles: Record<Locale, ResumeProfile> = {
  zh: {
    locale: 'zh',
    name: 'Yueming Xu',
    title: '全栈工程师',
    headline: '10 年软件开发经验 / 5 年系统架构设计经验的全栈工程师',
    location: '成都',
    gender: '男',
    age: '32 岁',
    contactEmail: 'yueming.xu@afry.com',
    intro:
      '专注企业级应用、分布式系统与跨平台 Web 解决方案，擅长用清晰架构、持续重构、自动化交付和 AI 辅助工程实践构建可维护、可扩展、安全的软件系统。',
    heroMetrics: [
      { label: '软件开发经验', value: '10 年' },
      { label: '架构设计经验', value: '5 年' },
      { label: '核心技术栈', value: 'C# / .NET' },
    ],
    summaryPoints: [
      '具备 C#、.NET、RESTful API 设计与 SQL 数据方案的扎实工程经验。',
      '覆盖 Blazor、React、Next.js、Vue、JavaScript 等多种前端与跨平台 Web 技术。',
      '熟悉微服务、回归测试、云原生开发、CI/CD 自动化与工程最佳实践。',
      '持续使用 Codex、Claude Code 等 AI 辅助工具提升研发效率、代码质量和重构节奏。',
    ],
    projects: [
      {
        title: 'Afry - TCAWeb System',
        role: '全栈开发工程师',
        period: '2023-10 - 至今',
        summary: '将遗留 PC GUI 系统升级为面向嵌入式场景的跨平台 Web 架构，负责核心架构设计、开发、测试与发布的全生命周期交付。',
        stack: ['.NET', 'REST API', 'Blazor', 'WCF'],
        showcase: afryShowcaseZh,
        highlights: [
          '设计面向 Linux ARM、Linux x64 与 Windows 的跨平台 Web 服务架构，推动遗留 PC GUI 向 Web 系统演进。',
          '开发 .NET RESTful API 与基于 Blazor 的 Web GUI，并沉淀可复用前端组件能力。',
          '设计内部 HTTPS/SSL 证书签发与安全通信方案，支撑内部环境下的可信交互。',
          '通过标准化共享接口和可复用测试流程，为遗留 WCF 服务与新 Web API 构建回归测试体系。',
        ],
      },
      {
        title: '北森云 - 客开服务稳定性巡检',
        role: '稳定性改进负责人',
        period: '2022-03 - 2023-03',
        summary: '围绕客开效能组与开放平台相关服务开展稳定性巡检，覆盖 100+ 服务的指标监控、风险分析、异常定位与事故复盘。',
        stack: ['Elasticsearch', 'Kafka', 'Docker', 'Redis', 'Cassandra', 'ASP.NET C#', 'SQL', 'Grafana', 'Kibana'],
        showcase: beisenInspectionShowcaseZh,
        highlights: [
          '基于服务监控报警、Grafana 服务指标与 Kibana 查询服务链路 Trace 日志，分析服务潜在风险。',
          '在服务异常时进行 Dump 分析、异常定位和事故复盘，形成稳定性改进闭环。',
          '参与开放平台接口升级，集成 Kong 网关统一的鉴权、限频和限流策略。',
          '升级共享框架与基础组件，提升平台可靠性、可维护性和分布式服务协同能力。',
        ],
      },
      {
        title: '北森云 - 框架搭建和 Infrastructure 设计',
        role: '基础框架设计与开发',
        period: '2020-03 - 2022-03',
        summary: '面向客开定制化交付场景搭建基础层框架，封装通用 Infrastructure 能力，提升多租户场景下的开发一致性、运行可靠性和问题定位效率。',
        stack: ['.NET', 'Microservices', 'Infrastructure', 'Tenant Isolation', 'Logging', 'Distributed Lock'],
        highlights: [
          '负责框架搭建、租户隔离、上下文管理和日志跟踪，支撑客开场景下的工程一致性。',
          '封装 Infrastructure 层，沉淀弹性策略、分布式锁和通用基础设施能力。',
          '统一请求上下文、租户上下文和日志链路，降低跨模块开发和排障成本。',
          '为后续定制开发、服务重构和任务编排提供可复用的基础能力。',
        ],
      },
      {
        title: '北森云 - 客开定制化开发与重构',
        role: '高级软件工程师',
        period: '2020-03 - 2022-03',
        summary: '参与客户定制 HR SaaS 项目的评估、架构设计、开发与交付，覆盖组织、绩效、目标管理、数据集成和财务凭证等业务场景。',
        stack: ['Unit Testing', 'ORM', 'Microservices', 'Kafka', 'Redis', 'CI/CD'],
        highlights: [
          '设计 Kafka 数据变化 Trigger 封装，解决业务触发口场景缺失问题。',
          '标准化产品财务凭证开发，设计任务调度组件与 Kafka、Redis 协同的任务阶段编排和分发机制。',
          '重构服务架构和基础设施组件，应对业务复杂度并提升服务稳定性。',
          '标准化单元测试、开发、测试、发布和 CI/CD 流程，提升交付质量与工程效率。',
        ],
      },
      {
        title: '北森云 - 集成服务重构',
        role: '后端工程师',
        period: '2019-03 - 2021-03',
        summary: '重构主数据同步、消息集成和任务调度链路，提升跨系统数据一致性、异步处理能力和服务稳定性。',
        stack: ['Kafka', 'Redis', 'OAuth 2.0', 'OIDC', 'SSO', 'DataCenter'],
        showcase: beisenMessageRefactorShowcaseZh,
        highlights: [
          '优化主数据同步流程，降低跨服务数据不一致风险。',
          '重构 Kafka 消息集成系统和租户级路由策略，解决上下游服务生产消费不对等导致的超时无响应问题。',
          '参与外部系统单点到北森技术方案设计，熟悉 OAuth 2.0、OIDC 授权协议，并参与非标准厂商客户自研服务的单点场景设计。',
          '参与 DataCenter 数据集成连接项目的任务调度组件设计，使客户或开发人员可以基于页面配置完成定时任务设置，解决数据孤岛问题。',
          '设计 SSO 云迁移方案，并封装北森 SSO SDK 以标准化认证集成。',
        ],
      },
      {
        title: '北森云 - 目标管理系统开发与重构',
        role: '后端工程师',
        period: '2019-03 - 2020-03',
        summary: '负责北森 HR SaaS 平台中目标管理系统的开发迭代与遗留模块重构。',
        stack: ['C#', '.NET', 'IoC', 'Unit Testing', 'Refactoring'],
        highlights: [
          '引入 IoC 框架和单元测试保护，支持遗留代码更安全地重构。',
          '重构业务模块，提升系统可维护性、可扩展性和交付质量。',
          '围绕目标管理业务持续迭代后端能力与服务接口。',
        ],
      },
      {
        title: 'Renwoxing - 签到通外勤考勤系统',
        role: '全栈开发工程师',
        period: '2016-08 - 2019-02',
        summary: '开发外勤人员管理系统，支持户外考勤签到、位置轨迹和外勤活动记录。',
        stack: ['Vue.js', 'ASP.NET MVC', 'ORM', 'WCF', 'MySQL', 'HTML/CSS'],
        highlights: [
          '构建 Vue/HTML 前端页面、ASP.NET MVC 后端功能和 WCF 服务接口。',
          '使用 Dapper ORM 完成 MySQL 数据访问与业务数据持久化。',
          '覆盖从前端交互、后端服务到数据库访问的完整全栈交付。',
        ],
      },
    ],
    experiences: [
      {
        company: '企业级应用交付',
        role: '全栈工程师 / 架构设计参与者',
        period: '2023 - 至今',
        summary: '围绕企业应用、分布式系统和跨平台 Web 产品进行全栈交付，并持续强化系统可维护性与工程自动化。',
        highlights: [
          '使用 C#、.NET 与 RESTful API 支撑核心业务服务。',
          '结合 Blazor、React、Next.js、Vue 等技术完成多形态 Web 前端交付。',
          '引入 Codex、Claude Code 等 AI 辅助工程实践，加速重构、测试和文档沉淀。',
        ],
      },
      {
        company: '北森云',
        role: '客开效能组 效能工程师',
        period: '2019 - 2023',
        summary: '负责客开服务稳定性巡检、定制化交付工程化、开放平台能力升级、消息集成重构和任务调度组件设计。',
        highlights: [
          '参与开放平台接口升级，集成 Kong 网关统一的鉴权、限频和限流策略。',
          '参与外部系统单点登录方案设计，覆盖 OAuth 2.0、OIDC 授权协议和客户自研服务单点场景。',
          '重构 Kafka 消息集成、租户级路由和主数据同步链路，提升异步处理稳定性和数据一致性。',
          '设计 DataCenter 数据集成任务调度组件、延迟队列和财务凭证任务编排能力。',
          '负责 100+ 服务稳定性巡检，通过 Grafana 指标、Kibana Trace 日志、Dump 分析和事故复盘定位风险。',
        ],
      },
      {
        company: '软件工程基础',
        role: '软件工程师',
        period: '2016 - 2019',
        summary: '建立企业软件开发基础能力，覆盖后端服务、数据库、Web 交互与交付质量。',
        highlights: [
          '使用 .NET Framework、C#、SQL 等技术完成业务系统开发。',
          '积累从需求理解、功能实现、缺陷修复到上线维护的完整交付经验。',
          '形成对可读代码、可测试设计和持续重构的长期工程偏好。',
        ],
      },
    ],
    skillGroups: [
      {
        title: '后端与架构',
        items: ['C#', '.NET Framework', '.NET', 'RESTful API', '清晰架构', '微服务'],
      },
      {
        title: '前端与 Web',
        items: ['Blazor', 'React', 'Next.js', 'Vue', 'JavaScript', 'Angular'],
      },
      {
        title: '平台与数据',
        items: ['SQL', 'Docker', 'Kubernetes', 'Redis', 'Elasticsearch', 'CI/CD'],
      },
      {
        title: 'AI 辅助工程',
        items: ['Codex', 'Claude Code', '回归测试', '持续重构', '工程文档'],
      },
    ],
    education: [
      {
        school: '成都信息工程大学',
        degree: '软件工程，本科',
        period: '2012 - 2016',
      },
    ],
    languages: [
      { name: '普通话', proficiency: '母语或双语水平' },
      { name: '英语', proficiency: '有限工作能力' },
    ],
    labels: {
      profile: '个人资料',
      location: '所在地',
      gender: '性别',
      age: '年龄',
      drivingLicense: '驾照',
      professionalSummary: '专业摘要',
      projectExperience: '项目经历',
      employmentHistory: '工作经历',
      competences: '能力矩阵',
      education: '教育经历',
      languages: '语言能力',
      focus: '聚焦方向',
      showcaseReady: '已整理',
      showcaseComingSoon: '待补充',
      openImage: '查看原图',
    },
    focus: '企业级系统、架构设计、全栈交付与 AI 辅助工程。',
    drivingLicense: 'C',
  },
  en: {
    locale: 'en',
    name: 'Yueming Xu',
    title: 'Full-Stack Engineer',
    headline: 'Full-stack engineer with 10 years in software development and 5 years in architecture design',
    location: 'Chengdu',
    gender: 'Male',
    age: '32',
    contactEmail: 'yueming.xu@afry.com',
    intro:
      'Specialized in enterprise applications, distributed systems, and cross-platform web solutions, with a strong focus on maintainable, scalable, and secure software through clean architecture and engineering best practices.',
    heroMetrics: [
      { label: 'Software Development', value: '10 Years' },
      { label: 'Architecture Design', value: '5 Years' },
      { label: 'Primary Stack', value: 'C# / .NET' },
    ],
    summaryPoints: [
      'Strong expertise in C#, .NET, RESTful API design, and SQL-based data solutions.',
      'Full-stack web development across Blazor, React, Next.js, Vue, JavaScript, and Angular.',
      'Experienced in microservices, regression testing, cloud-native development, CI/CD automation, and continuous refactoring.',
      'Uses Codex and Claude Code to improve delivery speed, code quality, documentation, and refactoring workflows.',
    ],
    projects: [
      {
        title: 'Afry - TCAWeb System',
        role: 'Full-Stack Developer',
        period: '2023-10 - Present',
        summary: 'Upgraded a legacy PC GUI system into a cross-platform web architecture for embedded environments, owning the core architecture, development, testing, and release lifecycle.',
        stack: ['.NET', 'REST API', 'Blazor', 'WCF'],
        showcase: afryShowcaseEn,
        highlights: [
          'Designed a cross-platform web service architecture for Linux ARM, Linux x64, and Windows, driving the migration from a legacy PC GUI to a web-based system.',
          'Developed .NET RESTful APIs and a Blazor-based web GUI with reusable frontend components.',
          'Designed an internal HTTPS/SSL certificate issuance solution to secure communication in internal environments.',
          'Built a regression testing system for legacy WCF services and new Web APIs through standardized shared contracts and reusable test workflows.',
        ],
      },
      {
        title: 'Beisen Cloud - Custom Service Stability Inspection',
        role: 'Stability Inspection Lead',
        period: '2022-03 - 2023-03',
        summary: 'Led stability inspection for custom development services by analyzing potential risks from service metrics, dump analysis, and incident reviews.',
        stack: ['Elasticsearch', 'Kafka', 'Docker', 'Redis', 'Cassandra', 'ASP.NET C#', 'SQL'],
        showcase: beisenInspectionShowcaseEn,
        highlights: [
          'Analyzed service metrics to identify potential risks and drive early issue tracking.',
          'Performed dump analysis, exception investigation, and incident reviews when service issues occurred.',
          'Upgraded shared frameworks and components to improve reliability, maintainability, and distributed service coordination.',
        ],
      },
      {
        title: 'Beisen Cloud - Framework and Infrastructure Design',
        role: 'Foundation Framework Design and Development',
        period: '2020-03 - 2022-03',
        summary: 'Built foundational framework capabilities for customer-specific delivery scenarios and encapsulated reusable Infrastructure patterns for multi-tenant consistency, runtime reliability, and easier troubleshooting.',
        stack: ['.NET', 'Microservices', 'Infrastructure', 'Tenant Isolation', 'Logging', 'Distributed Lock'],
        highlights: [
          'Built framework foundations for tenant isolation, context management, and log tracing in custom development scenarios.',
          'Encapsulated the Infrastructure layer to provide resilience policies, distributed locks, and reusable platform capabilities.',
          'Standardized request context, tenant context, and log tracing to reduce cross-module development and troubleshooting cost.',
          'Provided reusable foundations for later custom development, service refactoring, and task orchestration work.',
        ],
      },
      {
        title: 'Beisen Cloud - Custom Development and Refactoring',
        role: 'Senior Software Engineer',
        period: '2020-03 - 2022-03',
        summary: 'Participated in the assessment, development, and delivery of customer-specific HR SaaS projects covering organization, performance, and goal management modules.',
        stack: ['Unit Testing', 'Object-relational mapping (ORM)', 'Microservices', 'Kafka', 'CI/CD'],
        highlights: [
          'Designed Kafka data-change trigger abstractions to cover missing business trigger scenarios.',
          'Refactored service architecture and infrastructure components to address business complexity and improve service stability.',
          'Standardized unit testing, development, testing, release, and CI/CD workflows to improve delivery quality and engineering efficiency.',
        ],
      },
      {
        title: 'Beisen Cloud - Integration Services Refactoring',
        role: 'Backend Engineer',
        period: '2019-03 - 2021-03',
        summary: 'Refactored master data synchronization and Kafka-based messaging to improve data consistency, asynchronous processing, and service stability.',
        stack: ['Kafka', 'Redis'],
        showcase: beisenMessageRefactorShowcaseEn,
        highlights: [
          'Optimized master data synchronization to reduce cross-service consistency risks.',
          'Improved Kafka-based messaging workflows for asynchronous processing and task scheduling.',
          'Designed SSO cloud migration solutions and encapsulated the Beisen SSO SDK to standardize authentication integration.',
        ],
      },
      {
        title: 'Beisen Cloud - Goal Management System Development and Refactoring',
        role: 'Backend Engineer',
        period: '2019-03 - 2020-03',
        summary: 'Developed and iterated the goal management system within Beisen’s HR SaaS platform.',
        stack: ['C#', '.NET', 'IoC', 'Unit Testing', 'Refactoring'],
        highlights: [
          'Introduced an IoC framework and unit test protection to support safer legacy code refactoring.',
          'Refactored business modules to improve maintainability, extensibility, and delivery quality.',
          'Continued backend capability and service API iteration around goal management workflows.',
        ],
      },
      {
        title: 'Renwoxing - Qiandaotong Field Attendance System',
        role: 'Full-Stack Developer',
        period: '2016-08 - 2019-02',
        summary: 'Developed a full-stack field workforce management system supporting outdoor attendance check-in, location tracking, and field activity records.',
        stack: ['Vue.js', 'ASP.NET MVC', 'Object-relational mapping (ORM)', 'WCF', 'MySQL', 'HTML/CSS'],
        highlights: [
          'Built Vue/HTML frontend pages, ASP.NET MVC backend features, and WCF service interfaces.',
          'Implemented MySQL data access with Dapper ORM.',
          'Covered full-stack delivery across frontend interactions, backend services, and database access.',
        ],
      },
    ],
    experiences: [
      {
        company: 'Enterprise Application Delivery',
        role: 'Full-Stack Engineer / Architecture Contributor',
        period: '2023 - Present',
        summary: 'Delivering enterprise applications, distributed systems, and cross-platform web products with a focus on maintainability and automation.',
        highlights: [
          'Builds business services with C#, .NET, and RESTful API patterns.',
          'Ships web experiences using Blazor, React, Next.js, Vue, and related frontend stacks.',
          'Applies Codex and Claude Code to accelerate refactoring, testing, and engineering documentation.',
        ],
      },
      {
        company: 'Distributed Systems & Platform Engineering',
        role: 'Senior Software Engineer',
        period: '2019 - 2023',
        summary: 'Contributed to architecture design, service boundaries, regression testing, and cloud-native engineering workflows.',
        highlights: [
          'Designed scalable runtime patterns with microservices, Docker, Kubernetes, Redis, and Elasticsearch.',
          'Improved clean architecture boundaries, modular contracts, and API governance.',
          'Reduced release risk through CI/CD automation and regression testing practices.',
        ],
      },
      {
        company: 'Software Engineering Foundation',
        role: 'Software Engineer',
        period: '2016 - 2019',
        summary: 'Built a foundation in enterprise software delivery across backend services, databases, web interactions, and production support.',
        highlights: [
          'Developed business systems with .NET Framework, C#, and SQL.',
          'Covered the full delivery loop from requirements and implementation to bug fixing and maintenance.',
          'Built long-term habits around readable code, testable design, and continuous refactoring.',
        ],
      },
    ],
    skillGroups: [
      {
        title: 'Backend & Architecture',
        items: ['C#', '.NET Framework', '.NET', 'RESTful API', 'Clean Architecture', 'Microservices'],
      },
      {
        title: 'Frontend & Web',
        items: ['Blazor', 'React', 'Next.js', 'Vue', 'JavaScript', 'Angular'],
      },
      {
        title: 'Platform & Data',
        items: ['SQL', 'Docker', 'Kubernetes', 'Redis', 'Elasticsearch', 'CI/CD'],
      },
      {
        title: 'AI-Assisted Engineering',
        items: ['Codex', 'Claude Code', 'Regression Testing', 'Continuous Refactoring', 'Engineering Documentation'],
      },
    ],
    education: [
      {
        school: 'Chengdu University of Information Technology',
        degree: 'Software Engineering, Bachelor',
        period: '2012 - 2016',
      },
    ],
    languages: [
      { name: 'Mandarin', proficiency: 'Native or bilingual proficiency' },
      { name: 'English', proficiency: 'Limited working proficiency' },
    ],
    labels: {
      profile: 'Profile',
      location: 'Location',
      gender: 'Gender',
      age: 'Age',
      drivingLicense: 'Driving license',
      professionalSummary: 'Professional summary',
      projectExperience: 'Project experience',
      employmentHistory: 'Employment history',
      competences: 'Competences',
      education: 'Education',
      languages: 'Languages',
      focus: 'Focus',
      showcaseReady: 'Ready',
      showcaseComingSoon: 'Coming soon',
      openImage: 'Open image',
    },
    focus: 'Enterprise systems, architecture, full-stack delivery, and AI-assisted engineering.',
    drivingLicense: 'C',
  },
};

export const architectureCases: Record<Locale, ArchitectureCase[]> = {
  zh: [
    {
      slug: 'content-platform-evolution',
      locale: 'zh',
      title: '内容平台从单体到模块化服务的演进',
      summary: '拆分编辑、发布、鉴权和媒体处理边界，让团队能并行交付。',
      heroImage: '/assets/architecture/content-platform.svg',
      updatedAt: '2026-05-14',
      tags: ['模块化架构', 'API 契约', '微服务'],
      published: true,
      challenge: '旧系统耦合严重，发布链路和权限逻辑互相缠绕。',
      stack: ['模块化服务', '内容发布', '权限边界', '媒体处理'],
      outcomes: ['发布效率提升', '模块依赖收敛', 'API 契约更稳定'],
      body: `## 设计目标

- 将内容编辑、发布和媒体管理拆成清晰模块
- 统一共享 DTO，减少前后端错配
- 为后续独立服务拆分保留边界

## 关键判断

通过模块化单体先收敛边界，再把高变更频模块预留为独立服务候选。`,
    },
    {
      slug: 'observability-dashboard',
      locale: 'zh',
      title: '运营监控大盘的聚合接口设计',
      summary: '通过聚合层把离散服务指标编排成单一业务视图。',
      heroImage: '/assets/architecture/observability.svg',
      updatedAt: '2026-05-10',
      tags: ['聚合接口', '业务视图', '可观测性'],
      published: true,
      challenge: '多个服务各自暴露指标，前端拼装成本高且不稳定。',
      stack: ['指标聚合', '缓存策略', '业务告警', '运营看板'],
      outcomes: ['首屏响应更稳定', '前端查询数下降', '指标语义统一'],
      body: `## 聚合策略

围绕业务动作而不是数据库表组织接口，让首页卡片、趋势图和告警列表都能稳定复用。`,
    },
  ].map((item) => assertSchema(architectureCaseSchema, item)),
  en: [
    {
      slug: 'content-platform-evolution',
      locale: 'en',
      title: 'Evolving a content platform from monolith to modular services',
      summary: 'Separated editing, publishing, auth, and media concerns so teams could ship in parallel.',
      heroImage: '/assets/architecture/content-platform.svg',
      updatedAt: '2026-05-14',
      tags: ['Modular Architecture', 'API Contracts', 'Microservices'],
      published: true,
      challenge: 'The legacy stack mixed publishing, permissions, and media behavior in one place.',
      stack: ['Modular services', 'Publishing workflow', 'Permission boundaries', 'Media processing'],
      outcomes: ['Faster releases', 'Clearer boundaries', 'More reliable API contracts'],
      body: `## Goals

- Separate editing, publishing, and media responsibilities
- Share DTOs between frontend and backend
- Preserve boundaries for future service extraction`,
    },
    {
      slug: 'observability-dashboard',
      locale: 'en',
      title: 'Designing an aggregated operations dashboard API',
      summary: 'Introduced an aggregation layer that turned fragmented metrics into one business-facing view.',
      heroImage: '/assets/architecture/observability.svg',
      updatedAt: '2026-05-10',
      tags: ['API Aggregation', 'Business View', 'Observability'],
      published: true,
      challenge: 'Metrics lived in separate services and forced the frontend to stitch everything together.',
      stack: ['Metric aggregation', 'Caching strategy', 'Business alerts', 'Operations dashboard'],
      outcomes: ['Steadier first paint', 'Fewer frontend requests', 'Clearer metric semantics'],
      body: `## Aggregation strategy

Organize APIs around user decisions instead of tables so cards, charts, and alerts can evolve without breaking the UI.`,
    },
  ].map((item) => assertSchema(architectureCaseSchema, item)),
};

export const topicShowcases: Record<Locale, TopicShowcase[]> = {
  zh: [
    {
      slug: 'unraid',
      locale: 'zh',
      title: 'Unraid NAS 分享',
      summary: '围绕个人基础设施、自托管服务编排、备份与家庭实验室实践展开。',
      heroImage: '/assets/topics/unraid.svg',
      updatedAt: '2026-05-14',
      tags: ['Unraid', 'NAS', 'Self-hosting'],
      published: true,
      eyebrow: 'Self-hosted Lab',
      cta: '查看 Unraid 专题',
      sections: [
        {
          title: '容器编排',
          description: '整理博客、数据库、监控与工具链在 Unraid 上的运行方式。',
        },
        {
          title: '备份策略',
          description: '记录关键数据、媒体目录与配置文件的分层备份思路。',
        },
      ],
      body: `## 为什么选择 Unraid

它非常适合作为个人产品、内容站和实验服务的统一宿主环境。`,
    },
    {
      slug: 'fitness-ai-agent',
      locale: 'zh',
      title: '健身 AI Agent',
      summary: '展示一个围绕训练计划、动作记录和反馈建议设计的 AI 产品案例。',
      heroImage: '/assets/topics/fitness-agent.svg',
      updatedAt: '2026-05-14',
      tags: ['AI Agent', 'Fitness', 'Product Design'],
      published: true,
      eyebrow: 'AI Product Case',
      cta: '查看 AI Agent 案例',
      sections: [
        {
          title: '问题定义',
          description: '从训练记录碎片化和反馈滞后切入，定义智能教练角色。',
        },
        {
          title: '系统流程',
          description: '覆盖输入采集、计划生成、执行追踪和复盘建议的端到端链路。',
        },
      ],
      body: `## 价值主张

把训练记录、恢复节奏和反馈建议做成可持续使用的智能产品，而不是一次性 demo。`,
    },
  ].map((item) => assertSchema(topicShowcaseSchema, item)),
  en: [
    {
      slug: 'unraid',
      locale: 'en',
      title: 'Unraid NAS Notes',
      summary: 'A home for self-hosted infrastructure, service orchestration, backups, and homelab patterns.',
      heroImage: '/assets/topics/unraid.svg',
      updatedAt: '2026-05-14',
      tags: ['Unraid', 'NAS', 'Self-hosting'],
      published: true,
      eyebrow: 'Self-hosted Lab',
      cta: 'Explore the Unraid topic',
      sections: [
        {
          title: 'Container orchestration',
          description: 'How the blog, database, monitoring, and tooling run together on Unraid.',
        },
        {
          title: 'Backup strategy',
          description: 'A layered backup model for content, media, and configuration files.',
        },
      ],
      body: `## Why Unraid

It is a practical host for personal products, content systems, and experiments that still need reliability.`,
    },
    {
      slug: 'fitness-ai-agent',
      locale: 'en',
      title: 'Fitness AI Agent',
      summary: 'A case study for an AI product shaped around workout planning, tracking, and feedback loops.',
      heroImage: '/assets/topics/fitness-agent.svg',
      updatedAt: '2026-05-14',
      tags: ['AI Agent', 'Fitness', 'Product Design'],
      published: true,
      eyebrow: 'AI Product Case',
      cta: 'Explore the AI agent case',
      sections: [
        {
          title: 'Problem framing',
          description: 'Start from fragmented workout logs and delayed coaching feedback.',
        },
        {
          title: 'System flow',
          description: 'Cover data intake, plan generation, execution tracking, and retrospectives.',
        },
      ],
      body: `## Product direction

The goal is a durable coaching experience, not a throwaway AI demo.`,
    },
  ].map((item) => assertSchema(topicShowcaseSchema, item)),
};

export const booksModuleContent: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    summary: string;
    cta: string;
    heroImages: string[];
    philosophy: string;
    groups: { title: string; description: string; category: string }[];
  }
> = {
  zh: {
    eyebrow: 'Reading Spine',
    title: '书籍推荐',
    summary: '一组塑造我工程判断力的技术书：从重构、架构、代码质量，到系统设计、UNIX 网络与工程交付。',
    cta: '查看完整书单',
    heroImages: [
      '/assets/books/bookshelf-1.jpg',
      '/assets/books/bookshelf-2.jpg',
      '/assets/books/bookshelf-3.jpg',
    ],
    philosophy:
      '这些书不是“读过就结束”的清单，而是我在做架构、重构、性能优化和工程治理时会反复回看的知识基线。',
    groups: [
      {
        title: '代码质量与重构',
        description: '关注坏味道、可维护性、编码习惯和长期演进成本。',
        category: '代码质量与重构',
      },
      {
        title: '架构与领域建模',
        description: '围绕系统边界、架构职责、设计模式和领域建模建立判断框架。',
        category: '架构与领域建模',
      },
      {
        title: '系统与底层工程',
        description: '覆盖网络、通信、并发、平台运行方式和更底层的工程能力。',
        category: '系统与底层工程',
      },
      {
        title: '工程方法与交付',
        description: '帮助我把个人编码能力扩展到团队协作、项目交付和复杂系统落地。',
        category: '工程方法与交付',
      },
    ],
  },
  en: {
    eyebrow: 'Reading Spine',
    title: 'Book Recommendations',
    summary: 'A bookshelf that shaped how I think about refactoring, architecture, code quality, systems, networking, and delivery practice.',
    cta: 'Explore the full shelf',
    heroImages: [
      '/assets/books/bookshelf-1.jpg',
      '/assets/books/bookshelf-2.jpg',
      '/assets/books/bookshelf-3.jpg',
    ],
    philosophy:
      'This is not a one-time reading list. These are books I revisit when I need sharper judgment around architecture, refactoring, performance, and engineering workflow design.',
    groups: [
      {
        title: 'Code Quality and Refactoring',
        description: 'Books that sharpen maintainability, code smell awareness, and long-term design judgment.',
        category: 'Code Quality and Refactoring',
      },
      {
        title: 'Architecture and Domain Modeling',
        description: 'Books that shape how I think about system boundaries, design patterns, and domain models.',
        category: 'Architecture and Domain Modeling',
      },
      {
        title: 'Systems and Low-level Engineering',
        description: 'Books that build stronger intuition for networking, communication, runtime behavior, and systems engineering.',
        category: 'Systems and Low-level Engineering',
      },
      {
        title: 'Engineering Method and Delivery',
        description: 'Books that helped me connect coding skill to collaboration, delivery, and sustained engineering practice.',
        category: 'Engineering Method and Delivery',
      },
    ],
  },
};

export const bookRecommendations: Record<Locale, BookRecommendation[]> = {
  zh: [
    {
      slug: 'refactoring',
      locale: 'zh',
      title: '重构：改善既有代码的设计',
      originalTitle: 'Refactoring',
      author: 'Martin Fowler',
      category: '代码质量与重构',
      coverImage: '/assets/books/covers/refactoring.png',
      summary: '我反复回看的重构基础书，帮助我把“改代码”从直觉动作变成可描述的方法。',
      takeaway: '坏味道、测试保护和小步重构节奏，是我处理遗留系统和高风险改造时最常用的思考框架。',
      recommendation: '如果你经常接手历史系统，这本书几乎会持续影响你的日常判断。',
      quote: '我不是伟大的程序员，我只是个有着好习惯的好程序员。',
      featured: true,
    },
    {
      slug: 'the-mythical-man-month',
      locale: 'zh',
      title: '人月神话',
      originalTitle: 'The Mythical Man-Month',
      author: 'Frederick P. Brooks Jr.',
      category: '工程方法与交付',
      coverImage: '/assets/books/covers/renyueshenhua.png',
      summary: '让我更早接受软件工程没有“管理捷径”，很多问题本质上来自复杂度而不是人不努力。',
      takeaway: '复杂项目里，沟通成本、认知负担和系统本质复杂性，常常比单点性能或开发速度更致命。',
      recommendation: '它改变的不是代码细节，而是你看待团队、进度和系统复杂度的方式。',
      quote: '没有银弹。',
      featured: true,
    },
    {
      slug: 'clean-code',
      locale: 'zh',
      title: '代码整洁之道',
      originalTitle: 'Clean Code',
      author: 'Robert C. Martin',
      category: '代码质量与重构',
      coverImage: '/assets/books/covers/cleancode.png',
      summary: '帮助我持续校正编码习惯，让“能跑”升级成“可读、可改、可维护”。',
      takeaway: '命名、函数职责、边界控制和测试意识，会长期决定代码的寿命和团队协作成本。',
      recommendation: '当你开始带团队或维护中大型代码库时，它会比入门阶段更有价值。',
      quote: '真正的问题，不是代码能不能运行，而是半年后还能不能修改。',
      featured: true,
    },
    {
      slug: 'clean-architecture',
      locale: 'zh',
      title: '架构整洁之道',
      originalTitle: 'Clean Architecture',
      author: 'Robert C. Martin',
      category: '架构与领域建模',
      coverImage: '/assets/books/covers/cleanArchitechture.png',
      summary: '帮助我把架构讨论从“框架选型”拉回到边界、依赖方向和业务可演进性。',
      takeaway: '真正稳定的架构不是图画得漂亮，而是边界清晰、依赖可控、业务规则不被基础设施绑死。',
      recommendation: '如果你经常做服务拆分、模块化设计或重构系统边界，这本书会很实用。',
      quote: '架构的目标，是降低系统长期演进成本。',
      featured: true,
    },
    {
      slug: 'pragmatic-programmer',
      locale: 'zh',
      title: '程序员修炼之道',
      author: 'Andrew Hunt / David Thomas',
      category: '工程方法与交付',
      coverImage: '/assets/books/covers/pragmatic-programmer.jpg',
      summary: '一本长期有效的工程思维书，提醒我持续对工具、抽象和反馈机制保持敏感。',
      takeaway: '自动化、反馈闭环、渐进改进和对细节负责，是工程成熟度的底层能力。',
      recommendation: '适合在职业每个阶段反复读，每次都会读出新的重点。',
      quote: '知识上的投资，总能得到最好的利息。',
      featured: false,
    },
    {
      slug: 'continuous-delivery-2',
      locale: 'zh',
      title: '持续交付 2.0',
      category: '工程方法与交付',
      coverImage: '/assets/books/covers/continuous-delivery-2.jpg',
      summary: '帮助我把交付理解成完整系统，而不是单纯的构建和发版步骤。',
      takeaway: '持续交付真正解决的是稳定节奏、风险隔离、回滚能力和工程协同。',
      recommendation: '做平台、流程治理或 CI/CD 建设时非常有参考价值。',
      quote: '如果它让你痛苦，就更频繁地去做，并把痛苦前移。',
      featured: false,
    },
    {
      slug: 'javascript-design-patterns',
      locale: 'zh',
      title: 'JavaScript 设计模式',
      category: '架构与领域建模',
      coverImage: '/assets/books/covers/javascript-design-patterns.jpg',
      summary: '帮助我在前端代码里更清楚地识别职责、状态和对象协作关系。',
      takeaway: '模式不是炫技，而是在复杂交互里组织代码、降低偶然复杂度的工具。',
      recommendation: '如果你写前端架构或组件系统，这类书会让你更容易形成抽象意识。',
      quote: '构建更好的应用，依靠的是代码模式与设计模式。',
      featured: false,
    },
    {
      slug: 'unix-network-programming',
      locale: 'zh',
      title: 'UNIX 网络编程',
      category: '系统与底层工程',
      coverImage: '/assets/books/covers/unix-network-programming.jpg',
      summary: '帮助我更扎实地理解网络通信、套接字和服务端运行模型。',
      takeaway: '很多分布式系统问题，追根到底仍然绕不开底层网络语义和 IO 行为。',
      recommendation: '做网络服务、协议适配或高并发系统时值得反复翻。',
      quote: '网络编程真正的起点，是把 socket 这套基础能力吃透。',
      featured: false,
    },
    {
      slug: 'unix-network-programming-vol2',
      locale: 'zh',
      title: 'UNIX 网络编程 卷 2：进程间通信',
      category: '系统与底层工程',
      coverImage: '/assets/books/covers/unix-network-programming-vol2.jpg',
      summary: '把我对 IPC、进程协作和系统边界的理解拉得更深。',
      takeaway: '进程间协作模型会直接影响系统吞吐、稳定性和调试复杂度。',
      recommendation: '如果你对运行时行为、系统边界和中间层设计感兴趣，这本书非常值得读。',
      quote: '通信、并发与线程，是系统级编程里最容易低估的复杂度来源。',
      featured: false,
    },
    {
      slug: 'implementing-domain-driven-design',
      locale: 'zh',
      title: '实现领域驱动设计',
      originalTitle: 'Implementing Domain-Driven Design',
      author: 'Vaughn Vernon',
      category: '架构与领域建模',
      coverImage: '/assets/books/covers/implementing-domain-driven-design.jpg',
      summary: '帮助我把 DDD 从概念口号变成更可操作的建模和边界设计实践。',
      takeaway: '限界上下文、聚合、一致性边界和领域语言，是复杂业务系统拆解时非常重要的抓手。',
      recommendation: '当系统开始复杂到“不是拆库拆表就能解决”时，这本书很有用。',
      quote: 'DDD 首先不是关于技术，而是关于讨论、理解、发现与业务价值。',
      featured: false,
    },
    {
      slug: 'head-first-design-patterns',
      locale: 'zh',
      title: 'Head First 设计模式',
      category: '架构与领域建模',
      coverImage: '/assets/books/covers/head-first-design-patterns.jpg',
      summary: '它不是最学术的模式书，但非常适合建立模式直觉。',
      takeaway: '设计模式最重要的价值是识别变化点，而不是生搬硬套某个模式名。',
      recommendation: '如果你想更轻松地建立模式感觉，它比纯理论材料更友好。',
      quote: '把变化的部分封装起来，别让它影响代码的其他地方。',
      featured: false,
    },
    {
      slug: 'kubernetes-in-action',
      locale: 'zh',
      title: 'Kubernetes 权威指南',
      category: '系统与底层工程',
      coverImage: '/assets/books/covers/kubernetes-in-action.jpg',
      summary: '帮助我理解容器编排、服务治理和现代基础设施运行方式。',
      takeaway: '真正重要的不只是 Kubernetes 命令，而是它背后的资源模型和运行哲学。',
      recommendation: '做云原生、平台工程或自托管实验时非常值得系统阅读。',
      quote: '如果你声明需要 3 个副本，Kubernetes 就会确保始终有 3 个副本在运行。',
      featured: false,
    },
    {
      slug: 'google-system-design',
      locale: 'zh',
      title: 'Google 系统架构解密',
      category: '架构与领域建模',
      coverImage: '/assets/books/covers/google-system-design.jpg',
      summary: '适合站在大规模系统视角重新看系统设计、扩展性和演进策略。',
      takeaway: '规模一旦上来，架构设计就不再只是代码结构，而是全链路协同问题。',
      recommendation: '适合把个人编码经验向系统级思考升级。',
      quote: '系统一旦走向规模化，真正的难点就变成协同与演进。',
      featured: false,
    },
    {
      slug: 'sharp-jquery',
      locale: 'zh',
      title: '锋利的 jQuery',
      category: '架构与领域建模',
      coverImage: '/assets/books/covers/sharp-jquery.jpg',
      summary: '这是我更早期前端阶段的重要书，帮助我建立交互、DOM 和前端组织方式的基础感觉。',
      takeaway: '即使技术栈变了，前端抽象、事件处理和体验组织的思路仍然有价值。',
      recommendation: '对理解前端演进路径和早期交互模式很有纪念意义。',
      quote: '真正锋利的，不是 API 本身，而是你组织交互与页面行为的方式。',
      featured: false,
    },
  ],
  en: [
    {
      slug: 'refactoring',
      locale: 'en',
      title: 'Refactoring',
      originalTitle: 'Refactoring: Improving the Design of Existing Code',
      author: 'Martin Fowler',
      category: 'Code Quality and Refactoring',
      coverImage: '/assets/books/covers/refactoring.png',
      summary: 'The book I return to most often when legacy code needs to become safer to change.',
      takeaway: 'Code smells, test protection, and small-step refactoring are still my default framework for risky change.',
      recommendation: 'If you work with real systems instead of greenfield demos, this book keeps paying back.',
      quote: 'I’m not a great programmer; I’m just a good programmer with great habits.',
      featured: true,
    },
    {
      slug: 'the-mythical-man-month',
      locale: 'en',
      title: 'The Mythical Man-Month',
      author: 'Frederick P. Brooks Jr.',
      category: 'Engineering Method and Delivery',
      coverImage: '/assets/books/covers/renyueshenhua.png',
      summary: 'A foundational reminder that software difficulty rarely disappears just because a team works harder.',
      takeaway: 'Communication cost, coordination load, and essential complexity often dominate delivery outcomes.',
      recommendation: 'It changes how you think about planning, teams, and engineering reality.',
      quote: 'There is no silver bullet.',
      featured: true,
    },
    {
      slug: 'clean-code',
      locale: 'en',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Code Quality and Refactoring',
      coverImage: '/assets/books/covers/cleancode.png',
      summary: 'A long-term calibration book for naming, function boundaries, and code readability.',
      takeaway: 'The lifespan of a codebase is shaped by small decisions around clarity, intent, and responsibility.',
      recommendation: 'It becomes more useful the more teammates and legacy code you have.',
      quote: 'Truth can only be found in one place: the code.',
      featured: true,
    },
    {
      slug: 'clean-architecture',
      locale: 'en',
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
      category: 'Architecture and Domain Modeling',
      coverImage: '/assets/books/covers/cleanArchitechture.png',
      summary: 'A strong reset for architecture discussions that drift too far toward frameworks instead of boundaries.',
      takeaway: 'Stable architecture comes from dependency direction and boundary discipline, not from fashionable stacks.',
      recommendation: 'Useful whenever you are redesigning modules, services, or long-lived system boundaries.',
      quote: 'The only way to go fast, is to go well.',
      featured: true,
    },
    {
      slug: 'pragmatic-programmer',
      locale: 'en',
      title: 'The Pragmatic Programmer',
      category: 'Engineering Method and Delivery',
      coverImage: '/assets/books/covers/pragmatic-programmer.jpg',
      summary: 'A durable engineering mindset book that keeps sharpening judgment over time.',
      takeaway: 'Automation, feedback loops, and incremental improvement are not extras; they are core engineering habits.',
      recommendation: 'Worth rereading at different career stages because different lessons surface each time.',
      quote: 'An investment in knowledge always pays the best interest.',
      featured: false,
    },
    {
      slug: 'continuous-delivery-2',
      locale: 'en',
      title: 'Continuous Delivery 2.0',
      category: 'Engineering Method and Delivery',
      coverImage: '/assets/books/covers/continuous-delivery-2.jpg',
      summary: 'A useful lens for seeing delivery as a whole system instead of just a release pipeline.',
      takeaway: 'Reliable delivery depends on rhythm, rollback safety, risk isolation, and team coordination.',
      recommendation: 'Very relevant for platform work, release engineering, and quality governance.',
      quote: 'If it hurts, do it more frequently, and bring the pain forward.',
      featured: false,
    },
    {
      slug: 'javascript-design-patterns',
      locale: 'en',
      title: 'JavaScript Design Patterns',
      category: 'Architecture and Domain Modeling',
      coverImage: '/assets/books/covers/javascript-design-patterns.jpg',
      summary: 'Helped me reason about frontend boundaries, collaboration, and changing state with more structure.',
      takeaway: 'Patterns matter most as a way to recognize variation points, not as labels to show off.',
      recommendation: 'Useful when building frontend systems or shared component abstractions.',
      quote: 'Build better applications with coding and design patterns.',
      featured: false,
    },
    {
      slug: 'unix-network-programming',
      locale: 'en',
      title: 'UNIX Network Programming',
      category: 'Systems and Low-level Engineering',
      coverImage: '/assets/books/covers/unix-network-programming.jpg',
      summary: 'One of the books that deepened my intuition about sockets, network behavior, and service runtime models.',
      takeaway: 'Many distributed system problems still collapse back to IO semantics and network fundamentals.',
      recommendation: 'Worth reading if you design or troubleshoot network-heavy backend systems.',
      quote: 'Socket programming is where network behavior becomes concrete engineering.',
      featured: false,
    },
    {
      slug: 'unix-network-programming-vol2',
      locale: 'en',
      title: 'UNIX Network Programming Vol. 2: Interprocess Communications',
      category: 'Systems and Low-level Engineering',
      coverImage: '/assets/books/covers/unix-network-programming-vol2.jpg',
      summary: 'Extended my understanding of process collaboration and communication boundaries.',
      takeaway: 'IPC models affect throughput, reliability, and debugging complexity more than they appear to at first.',
      recommendation: 'Very valuable for anyone interested in runtime architecture and systems behavior.',
      quote: 'Communication, concurrency, and threads are never just implementation details.',
      featured: false,
    },
    {
      slug: 'implementing-domain-driven-design',
      locale: 'en',
      title: 'Implementing Domain-Driven Design',
      author: 'Vaughn Vernon',
      category: 'Architecture and Domain Modeling',
      coverImage: '/assets/books/covers/implementing-domain-driven-design.jpg',
      summary: 'A practical bridge from DDD vocabulary to usable modeling and boundary decisions.',
      takeaway: 'Bounded contexts, aggregates, and ubiquitous language become very useful once business complexity grows.',
      recommendation: 'A strong book for teams that need to move from CRUD thinking to deeper domain structure.',
      quote: 'DDD isn’t first and foremost about technology.',
      featured: false,
    },
    {
      slug: 'head-first-design-patterns',
      locale: 'en',
      title: 'Head First Design Patterns',
      category: 'Architecture and Domain Modeling',
      coverImage: '/assets/books/covers/head-first-design-patterns.jpg',
      summary: 'Not the most formal patterns book, but one of the easiest ways to build pattern intuition.',
      takeaway: 'Patterns help most when they reveal where change lives and how responsibilities shift.',
      recommendation: 'A friendly but still useful entry point into design pattern thinking.',
      quote: 'Take what varies and encapsulate it so it won’t affect the rest of your code.',
      featured: false,
    },
    {
      slug: 'kubernetes-in-action',
      locale: 'en',
      title: 'Kubernetes Guide',
      category: 'Systems and Low-level Engineering',
      coverImage: '/assets/books/covers/kubernetes-in-action.jpg',
      summary: 'Helped me connect container orchestration to the larger operational model behind modern platforms.',
      takeaway: 'The deeper value is not commands, but the resource model and operational philosophy.',
      recommendation: 'Very useful if you work on cloud-native systems or self-hosted infrastructure.',
      quote: 'If you declare that you need three copies of a container, Kubernetes will ensure that there are always three copies running.',
      featured: false,
    },
    {
      slug: 'google-system-design',
      locale: 'en',
      title: 'Google System Design Notes',
      category: 'Architecture and Domain Modeling',
      coverImage: '/assets/books/covers/google-system-design.jpg',
      summary: 'A useful way to reframe system design around scale, coordination, and evolution.',
      takeaway: 'Once systems grow, architecture becomes an end-to-end coordination problem rather than a code layout problem.',
      recommendation: 'Helpful for moving from implementation thinking into larger system judgment.',
      quote: 'At scale, system design is as much about coordination as it is about code.',
      featured: false,
    },
    {
      slug: 'sharp-jquery',
      locale: 'en',
      title: 'Sharp jQuery',
      category: 'Architecture and Domain Modeling',
      coverImage: '/assets/books/covers/sharp-jquery.jpg',
      summary: 'An earlier frontend book for me, but still meaningful as part of how my UI intuition was formed.',
      takeaway: 'Even though the stack changed, interaction design and event organization ideas still transfer.',
      recommendation: 'A nice historical anchor for understanding how frontend thinking evolved.',
      quote: 'Sharp frontend work comes from how you organize behavior, not just from how you call the API.',
      featured: false,
    },
  ],
};

export const seedPosts: PublicPost[] = [
  {
    id: 'post-1',
    slug: 'modular-boundaries-for-content-platforms',
    locale: 'zh',
    title: '内容平台的模块化边界设计',
    summary: '从编辑、发布、权限和媒体处理的职责拆分，梳理内容平台演进中的关键边界。',
    heroImage: '/assets/architecture/content-platform.svg',
    updatedAt: '2026-05-13',
    tags: ['模块化架构', '内容平台', '服务边界'],
    published: true,
    body: `## 核心原因

当编辑、发布、权限和媒体处理同时演进时，先把职责边界梳理清楚，能显著降低后续协作与交付成本。`,
    status: 'published',
    series: 'engineering-foundations',
  },
  {
    id: 'post-2',
    slug: 'designing-a-fitness-agent-loop',
    locale: 'en',
    title: 'Designing a feedback loop for a fitness AI agent',
    summary: 'A walkthrough of logging, recovery signals, and guidance generation.',
    heroImage: '/assets/blog/fitness-loop.svg',
    updatedAt: '2026-05-12',
    tags: ['AI Agent', 'Fitness', 'Product'],
    published: true,
    body: `## Loop design

Reliable coaching depends on the quality of the loop: data intake, context building, recommendation, and reflection.`,
    status: 'published',
    series: 'fitness-agent',
  },
  {
    id: 'post-3',
    slug: 'unraid-service-layout',
    locale: 'zh',
    title: '我的 Unraid 服务布局与目录规范',
    summary: '记录博客、数据库、监控和媒体目录如何在 NAS 上协同运作。',
    heroImage: '/assets/blog/unraid-layout.svg',
    updatedAt: '2026-05-11',
    tags: ['Unraid', 'Self-hosting'],
    published: true,
    body: `## 目录思路

把运行时、持久化数据和备份目录分开，能显著降低迁移成本。`,
    status: 'published',
    series: 'unraid-notes',
  },
].map((item) => assertSchema(postSchema, item));

export function getArchitectureCases(locale: Locale): ArchitectureCase[] {
  return architectureCases[locale];
}

export function getArchitectureCase(locale: Locale, slug: string): ArchitectureCase | undefined {
  return architectureCases[locale].find((item) => item.slug === slug);
}

export function getTopicBySlug(locale: Locale, slug: string): TopicShowcase | undefined {
  return topicShowcases[locale].find((item) => item.slug === slug);
}

export function getBooksModuleContent(locale: Locale) {
  return booksModuleContent[locale];
}

export function getBookRecommendations(locale: Locale): BookRecommendation[] {
  return bookRecommendations[locale];
}

export function getFeaturedPayload(locale: Locale): FeaturedPayload {
  return {
    metrics: resumeProfiles[locale].heroMetrics,
    featuredCases: architectureCases[locale].slice(0, 2),
    recentPosts: seedPosts.filter((post) => post.locale === locale).slice(0, 3),
    topicCards: topicShowcases[locale],
  };
}

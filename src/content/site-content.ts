import {
  getArchitectureCase,
  getArchitectureCases,
  getBookRecommendations,
  getBooksModuleContent,
  getFeaturedPayload,
  getTopicBySlug,
  resumeProfiles,
} from '@devfolio-blog/content-data';
import { dictionaries, normalizeLocale, switchLocale, withLocalePath } from '@devfolio-blog/i18n';
import { renderMarkdown } from '@devfolio-blog/markdown';
import type { BookRecommendation, Locale } from '@devfolio-blog/shared-types';
import {
  getBlogPost,
  getBlogSeries,
  getBlogTopics,
  listBlogPosts,
} from '@/lib/blog/repository';

const selectedBookSlugs = [
  'refactoring',
  'clean-code',
  'pragmatic-programmer',
  'head-first-design-patterns',
  'clean-architecture',
  'implementing-domain-driven-design',
  'the-mythical-man-month',
] as const;

const bookPageNarrative: Record<
  Locale,
  {
    heroTitle: string;
    heroIntro: string;
    noteTitle: string;
    noteBody: string;
    metricLabel: string;
    metricValue: string;
    sectionEyebrow: string;
    labels: {
      judgment: string;
      scene: string;
      proof: string;
    };
    sections: {
      key: string;
      title: string;
      description: string;
      slugs: (typeof selectedBookSlugs)[number][];
    }[];
    books: Partial<Record<(typeof selectedBookSlugs)[number], Partial<BookRecommendation>>>;
  }
> = {
  zh: {
    heroTitle: '塑造我工程判断的 7 本书',
    heroIntro:
      '这不是收藏清单，而是我在处理遗留系统、抽象边界、代码质量和团队协作时反复回到的判断框架。',
    noteTitle: '阅读如何转化为工程能力',
    noteBody:
      '我更在意一本书是否改变了真实工作里的选择：什么时候重构、如何命名边界、怎样降低复杂度、以及如何把个人编码习惯变成团队可持续交付。',
    metricLabel: '精选书目',
    metricValue: '7 本',
    sectionEyebrow: 'Reading Path',
    labels: {
      judgment: '我从这本书带走的判断',
      scene: '它对应的工程场景',
      proof: '为什么它能代表我的工作方式',
    },
    sections: [
      {
        key: 'core-judgment',
        title: '核心判断',
        description: '先解决代码是否清楚、是否安全可改、是否能被团队长期维护。',
        slugs: ['refactoring', 'clean-code', 'pragmatic-programmer'],
      },
      {
        key: 'design-boundaries',
        title: '设计与边界',
        description: '再把局部代码能力扩展到抽象、模块、领域语言和系统边界。',
        slugs: ['head-first-design-patterns', 'clean-architecture', 'implementing-domain-driven-design'],
      },
      {
        key: 'engineering-reality',
        title: '工程现实',
        description: '最后回到软件交付的现实：复杂度、沟通成本和团队节奏。',
        slugs: ['the-mythical-man-month'],
      },
    ],
    books: {
      refactoring: {
        summary: '它让我把“改代码”从凭感觉的动作，变成可拆解、可保护、可回退的工程过程。',
        takeaway: '坏味道不是审美问题，而是未来变更成本和风险的早期信号。',
        recommendation: '面对遗留系统时，我会优先寻找可测试的小切口，而不是一次性重写。',
      },
      'clean-code': {
        summary: '它持续提醒我，真正影响协作效率的，往往是命名、函数职责和边界表达这些小决策。',
        takeaway: '代码首先是给人读的，然后才是给机器执行的。',
        recommendation: '我会把可读性当作交付质量的一部分，而不是上线后的额外优化。',
      },
      'pragmatic-programmer': {
        summary: '它把工程师的成长从技术点清单，拉回到反馈、自动化、工具意识和长期责任感。',
        takeaway: '成熟不是知道更多技巧，而是持续建立更短、更可靠的反馈闭环。',
        recommendation: '我倾向于把问题做成流程、工具或约定，让团队下次更容易做对。',
      },
      'head-first-design-patterns': {
        summary: '它不是最严肃的模式书，却很适合建立“变化点在哪里”的设计直觉。',
        takeaway: '模式的价值不是套名字，而是把变化封装在合适的位置。',
        recommendation: '我在设计组件、策略和扩展点时，会先问哪些变化应该被隔离。',
      },
      'clean-architecture': {
        summary: '它把架构讨论从框架选择拉回到依赖方向、边界纪律和业务规则的独立性。',
        takeaway: '架构的核心目标，是降低系统长期演进成本。',
        recommendation: '我会优先保护业务规则和核心模型，避免它们被 UI、数据库或框架牵着走。',
      },
      'implementing-domain-driven-design': {
        summary: '它让我更重视领域语言、限界上下文和聚合边界，而不是只用表结构解释业务。',
        takeaway: '复杂业务需要被讨论、命名和建模，不能只靠 CRUD 承载。',
        recommendation: '当系统复杂到团队开始“各说各话”时，我会先回到领域语言和边界划分。',
      },
      'the-mythical-man-month': {
        summary: '它让我更早接受：很多软件问题不是努力不够，而是复杂度、沟通和认知负担没有被正视。',
        takeaway: '增加人手不一定加速，复杂系统首先需要降低协调成本。',
        recommendation: '我在评估计划时会同时看技术方案、沟通路径和交付节奏。',
      },
    },
  },
  en: {
    heroTitle: 'Seven Books That Shaped My Engineering Judgment',
    heroIntro:
      'This is not a collector shelf. These are the books I return to when legacy systems, abstraction boundaries, code quality, and team delivery need clearer judgment.',
    noteTitle: 'How Reading Becomes Engineering Ability',
    noteBody:
      'I care less about finishing a book and more about whether it changes real decisions: when to refactor, how to name boundaries, how to reduce complexity, and how personal habits become sustainable team delivery.',
    metricLabel: 'Selected Books',
    metricValue: '7',
    sectionEyebrow: 'Reading Path',
    labels: {
      judgment: 'Judgment I took from it',
      scene: 'Where it shows up at work',
      proof: 'Why it represents my working style',
    },
    sections: [
      {
        key: 'core-judgment',
        title: 'Core Judgment',
        description: 'Start with whether code is clear, safe to change, and maintainable by a team.',
        slugs: ['refactoring', 'clean-code', 'pragmatic-programmer'],
      },
      {
        key: 'design-boundaries',
        title: 'Design and Boundaries',
        description: 'Extend local coding discipline into abstraction, modules, domain language, and system boundaries.',
        slugs: ['head-first-design-patterns', 'clean-architecture', 'implementing-domain-driven-design'],
      },
      {
        key: 'engineering-reality',
        title: 'Engineering Reality',
        description: 'Return to the reality of software delivery: complexity, communication cost, and team rhythm.',
        slugs: ['the-mythical-man-month'],
      },
    ],
    books: {
      refactoring: {
        summary: 'It turned changing code from an instinctive act into a process that can be sliced, protected, and rolled back.',
        takeaway: 'Code smells are not aesthetic complaints; they are early signals of future change cost and risk.',
        recommendation: 'When I face legacy systems, I look for small testable seams before I consider a rewrite.',
      },
      'clean-code': {
        summary: 'It keeps reminding me that naming, function responsibility, and boundary expression shape collaboration speed.',
        takeaway: 'Code is read by people first and executed by machines second.',
        recommendation: 'I treat readability as part of delivery quality, not a cleanup task after shipping.',
      },
      'pragmatic-programmer': {
        summary: 'It frames engineering growth around feedback, automation, tool awareness, and long-term ownership.',
        takeaway: 'Maturity is not knowing more tricks; it is building shorter and more reliable feedback loops.',
        recommendation: 'I prefer turning repeated pain into process, tools, or team conventions.',
      },
      'head-first-design-patterns': {
        summary: 'It is not the most formal patterns book, but it builds a strong intuition for where variation lives.',
        takeaway: 'Patterns matter when they encapsulate change in the right place, not when they add labels.',
        recommendation: 'When designing components, strategies, or extension points, I first ask which changes should be isolated.',
      },
      'clean-architecture': {
        summary: 'It pulls architecture discussions back from framework choice to dependency direction and boundary discipline.',
        takeaway: 'The point of architecture is to reduce the long-term cost of system evolution.',
        recommendation: 'I protect business rules and core models from being dragged around by UI, databases, or frameworks.',
      },
      'implementing-domain-driven-design': {
        summary: 'It made domain language, bounded contexts, and aggregate boundaries more concrete than table-first design.',
        takeaway: 'Complex business systems need discussion, naming, and modeling; CRUD alone is not enough.',
        recommendation: 'When teams start using the same words differently, I go back to language and boundary design.',
      },
      'the-mythical-man-month': {
        summary: 'It helped me accept that many software problems are not effort problems, but complexity and coordination problems.',
        takeaway: 'Adding people does not automatically add speed; complex systems need lower coordination cost first.',
        recommendation: 'When estimating delivery, I look at the technical plan, communication path, and team rhythm together.',
      },
    },
  },
};

export function getDictionary(locale: string) {
  return dictionaries[normalizeLocale(locale)];
}

export function getLocale(value: string | null | undefined): Locale {
  return normalizeLocale(value);
}

export function getShellLinks(locale: Locale) {
  return [
    { label: dictionaries[locale].nav.home, href: withLocalePath(locale) },
    { label: dictionaries[locale].nav.resume, href: withLocalePath(locale, 'resume') },
    { label: dictionaries[locale].nav.books, href: withLocalePath(locale, 'books') },
    { label: dictionaries[locale].nav.recipes, href: withLocalePath(locale, 'recipes') },
    { label: dictionaries[locale].nav.blog, href: withLocalePath(locale, 'blog') },
  ];
}

export function getHomeViewModel(locale: Locale) {
  const posts = listBlogPosts(locale);

  return {
    dictionary: dictionaries[locale],
    featured: {
      ...getFeaturedPayload(locale),
      recentPosts: posts.slice(0, 3),
    },
    books: getBooksHomeViewModel(locale),
    blogTopics: getBlogTopics(posts),
    blogSeries: getBlogSeries(posts),
  };
}

export function getResumeViewModel(locale: Locale) {
  return {
    dictionary: dictionaries[locale],
    resume: resumeProfiles[locale],
  };
}

export function getArchitectureListViewModel(locale: Locale) {
  return {
    dictionary: dictionaries[locale],
    items: getArchitectureCases(locale),
  };
}

export function getArchitectureDetailViewModel(locale: Locale, slug: string) {
  const item = getArchitectureCase(locale, slug);
  return item
    ? {
        dictionary: dictionaries[locale],
        item,
        html: renderMarkdown(item.body),
      }
    : null;
}

export function getTopicViewModel(locale: Locale, slug: string) {
  const item = getTopicBySlug(locale, slug);
  return item
    ? {
        dictionary: dictionaries[locale],
        item,
        html: renderMarkdown(item.body),
      }
    : null;
}

export function getBooksViewModel(locale: Locale) {
  const booksModule = getBooksModuleContent(locale);
  const books = getBookRecommendations(locale);
  const narrative = bookPageNarrative[locale];
  const booksBySlug = new Map(books.map((book) => [book.slug, book]));
  const selectedBooks = selectedBookSlugs
    .map((slug) => {
      const book = booksBySlug.get(slug);
      return book ? { ...book, ...narrative.books[slug] } : null;
    })
    .filter((book): book is BookRecommendation => Boolean(book));

  return {
    dictionary: dictionaries[locale],
    module: booksModule,
    narrative,
    selectedBooks,
    omittedBookCount: books.length - selectedBooks.length,
    readingSections: narrative.sections.map((section) => ({
      ...section,
      books: section.slugs
        .map((slug) => selectedBooks.find((book) => book.slug === slug))
        .filter((book): book is BookRecommendation => Boolean(book)),
    })),
  };
}

export function getBlogListViewModel(locale: Locale) {
  const items = listBlogPosts(locale);

  return {
    dictionary: dictionaries[locale],
    items,
    highlightedPost: items[0],
    latestPosts: items.slice(1),
    topics: getBlogTopics(items),
    series: getBlogSeries(items),
  };
}

export function getBlogDetailViewModel(locale: Locale, slug: string) {
  const post = getBlogPost(locale, slug);

  return post
    ? {
        dictionary: dictionaries[locale],
        ...post,
      }
    : null;
}

function getBooksHomeViewModel(locale: Locale) {
  const booksModule = getBooksModuleContent(locale);
  const books = getBookRecommendations(locale).filter((book) => book.featured);

  return {
    ...booksModule,
    featuredBooks: books,
    highlightedQuote: books.find((book) => !!book.quote)?.quote ?? null,
  };
}

export function getLocaleSwitch(locale: Locale, currentPath: string) {
  const nextLocale = switchLocale(locale);
  const localizedPrefix = `/${locale}`;
  const suffix = currentPath.startsWith(localizedPrefix) ? currentPath.slice(localizedPrefix.length) : '';

  return {
    label: nextLocale.toUpperCase(),
    href: withLocalePath(nextLocale, suffix || ''),
  };
}

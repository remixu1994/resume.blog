import type { Locale } from '@devfolio-blog/shared-types';

export interface SiteDictionary {
  brand: string;
  tagline: string;
  nav: {
    home: string;
    resume: string;
    architecture: string;
    books: string;
    unraid: string;
    fitness: string;
    recipes: string;
    blog: string;
    admin: string;
  };
  home: {
    heroTitle: string;
    heroBody: string;
    featuredLabel: string;
    booksLabel: string;
    recentLabel: string;
    contactLabel: string;
  };
  resume: {
    title: string;
    download: string;
  };
  architecture: {
    title: string;
    intro: string;
  };
  blog: {
    title: string;
    intro: string;
    empty: string;
  };
  topic: {
    sections: string;
    stack: string;
  };
  books: {
    title: string;
    intro: string;
    featured: string;
    featuredTitle: string;
    groups: string;
    groupsTitle: string;
    notes: string;
    quoteLabel: string;
    takeawayLabel: string;
    recommendationLabel: string;
  };
  footer: string;
}

export const dictionaries: Record<Locale, SiteDictionary> = {
  zh: {
    brand: 'Remi Resume',
    tagline: '复杂业务系统、工程交付与产品化实践',
    nav: {
      home: '首页',
      resume: '简历',
      architecture: '架构设计',
      books: '书籍推荐',
      unraid: 'Unraid NAS',
      fitness: '健身',
      recipes: '食谱分享',
      blog: '技术博客',
      admin: '后台',
    },
    home: {
      heroTitle: '把复杂系统做成可靠产品的全栈工程师',
      heroBody:
        '关注复杂业务拆解、服务边界设计、稳定性交付与产品化落地，把长期工程经验沉淀为可复用的方法和案例。',
      featuredLabel: '代表架构',
      booksLabel: '书籍推荐',
      recentLabel: '最新写作',
      contactLabel: '联系与协作',
    },
    resume: {
      title: '在线简历',
      download: '下载 PDF 简历',
    },
    architecture: {
      title: '过往架构设计',
      intro: '从业务拆解、服务边界到可观测性与交付流程，记录关键设计判断。',
    },
    blog: {
      title: '技术博客',
      intro: '围绕工程效率、系统交付、健身实践与 AI 工程化进行沉淀。',
      empty: '暂时还没有符合条件的文章。',
    },
    topic: {
      sections: '专题章节',
      stack: '技术栈',
    },
    books: {
      title: '书籍推荐',
      intro: '这些书构成了我的长期技术阅读主线：重构、架构、代码质量、设计模式、系统工程与工程方法。',
      featured: '主推书单',
      featuredTitle: '精选书单',
      groups: '书架分组',
      groupsTitle: '分类书架',
      notes: '阅读观点',
      quoteLabel: '经典语录',
      takeawayLabel: '阅读收获',
      recommendationLabel: '推荐理由',
    },
    footer: 'Remi Resume 记录工程实践、架构思考与产品化探索。',
  },
  en: {
    brand: 'Remi Resume',
    tagline: 'Full-stack engineering, architecture, self-hosting, and AI product work',
    nav: {
      home: 'Home',
      resume: 'Resume',
      architecture: 'Architecture',
      books: 'Books',
      unraid: 'Unraid NAS',
      fitness: 'Fitness',
      recipes: 'Recipes',
      blog: 'Blog',
      admin: 'Admin',
    },
    home: {
      heroTitle: 'A full-stack engineer who turns complex systems into reliable products',
      heroBody:
        'Focused on business decomposition, service boundaries, reliable delivery, and product-minded engineering practice.',
      featuredLabel: 'Featured architecture',
      booksLabel: 'Bookshelf',
      recentLabel: 'Recent writing',
      contactLabel: 'Contact',
    },
    resume: {
      title: 'Resume',
      download: 'Download PDF resume',
    },
    architecture: {
      title: 'Architecture Cases',
      intro: 'A record of system design choices across domain boundaries, observability, and delivery workflows.',
    },
    blog: {
      title: 'Technical Blog',
      intro: 'Notes on engineering efficiency, delivery quality, fitness practice, and AI engineering experiments.',
      empty: 'No published posts yet.',
    },
    topic: {
      sections: 'Topic sections',
      stack: 'Tech stack',
    },
    books: {
      title: 'Book Recommendations',
      intro: 'These books form my long-running technical reading spine across refactoring, architecture, code quality, design patterns, systems engineering, and delivery practice.',
      featured: 'Featured shelf',
      featuredTitle: 'Featured Books',
      groups: 'Bookshelf groups',
      groupsTitle: 'Categorized Shelf',
      notes: 'Reading notes',
      quoteLabel: 'Quote',
      takeawayLabel: 'Reading Takeaways',
      recommendationLabel: 'Why I Recommend It',
    },
    footer: 'Remi Resume documents engineering practice, architecture thinking, and product exploration.',
  },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'zh' || value === 'en';
}

export function normalizeLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : 'zh';
}

export function switchLocale(locale: Locale): Locale {
  return locale === 'zh' ? 'en' : 'zh';
}

export function withLocalePath(locale: Locale, path = ''): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalizedPath === '/' ? '' : normalizedPath}`;
}

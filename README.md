# resume.blog

个人数字花园 — 简历、技术博客、架构案例与作品集。

## 简介

一个现代化的个人站点，整合了简历展示、技术博客、架构案例分析、图书推荐等内容模块。支持中英双语，面向招聘方、技术同行和潜在合作方。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS
- **语言**: TypeScript
- **数据库**: SQLite (better-sqlite3)
- **测试**: Vitest
- **部署**: Vercel

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 首页 | `/[locale]` | Hero + 精选案例 + 最新文章 |
| 简历 | `/[locale]/resume` | 项目经历、工作经历、技能、教育背景 |
| 博客 | `/[locale]/blog` | 技术文章，支持分类筛选，SQLite 存储 |
| 架构案例 | `/[locale]/architecture` | 架构设计与重构案例 |
| 图书推荐 | `/[locale]/books` | 塑造工程判断的精选书籍 |
| 食谱 | `/[locale]/recipes` | Markdown 模板的食谱笔记 |
| 健身 | `/[locale]/fitness` | 健身记录 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建生产版本
npm run build
```

访问 http://localhost:3000 自动跳转到 `/zh`。

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── [locale]/           # 国际化路由
│   │   ├── blog/           # 博客列表 + 详情
│   │   ├── resume/         # 简历页
│   │   ├── books/          # 图书推荐
│   │   ├── architecture/   # 架构案例
│   │   ├── recipes/        # 食谱
│   │   └── fitness/        # 健身
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页重定向
│   ├── sitemap.ts          # 站点地图
│   └── robots.ts           # 爬虫规则
├── components/             # 共享组件
├── content/                # 内容数据
├── lib/                    # 工具库
│   ├── blog/               # 博客模块（SQLite + Markdown）
│   ├── locale.ts           # 国际化
│   └── seo.ts              # SEO 工具
├── legacy/                 # 遗留模块（逐步迁移中）
└── public/                 # 静态资源
tests/                      # 测试文件
docs/                       # 项目文档
scripts/                    # 构建脚本
```

## 国际化

支持中文 (`zh`) 和英文 (`en`)，通过 URL 路径前缀切换：

- 中文: `/zh/blog`
- 英文: `/en/blog`

## 开发命令

```bash
npm run dev              # 开发服务器
npm run build            # 生产构建
npm run lint             # ESLint 检查
npm test                 # 运行测试
npm run blog:import      # 导入博客到 SQLite
npm run blog:refine      # 精炼博客数据
npm run releaseops:gate  # ReleaseOps 门禁检查
```

## 文档

- [项目愿景](PROJECT.md)
- [架构设计](ARCHITECTURE.md)
- [分支工作流](docs/BRANCH-WORKFLOW.md)
- [部署指南](docs/deployment.md)
- [ReleaseOps](docs/releaseops.md)

## License

Private

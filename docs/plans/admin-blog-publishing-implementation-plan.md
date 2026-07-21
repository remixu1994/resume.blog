# 后台发布博客实施计划

## 摘要

实现 PostgreSQL 驱动的博客管理后台。管理员通过环境变量配置的账号和密码登录后，可以创建和编辑双语草稿、预览 Markdown、上传图片、发布和下线文章。公开页面继续从 PostgreSQL 动态读取，发布结果在下一次请求生效。

## 核心改造

- 将 PostgreSQL 作为后台写入的唯一生产目标；将现有建表脚本升级为版本化 schema migration，并保留 SQLite 内容的一次性迁移能力。
- 扩展 `blog_posts`：增加 `created_at`、`published_at`，保留双语内容、标签、分类、系列和封面字段；迁移现有 SQLite 文章后维持已发布状态。
- 新增 PostgreSQL 管理仓储：支持草稿列表、创建、读取、更新、发布和下线；写入使用事务，发布前校验中英文标题、slug、摘要、正文完整，且同语言 slug 全局唯一。
- 新增账号密码认证：
  - `POST /api/admin/auth/login` 使用恒定时间比较验证账号和密码；成功后签发带过期时间与 HMAC 签名的 HttpOnly、Secure、SameSite=Strict Cookie。
  - 提供登出和会话检查；所有管理写接口校验会话及同源 `Origin`。
  - 不保存密码、不回传密码、不在日志中记录登录凭据。
- 新增管理 API：文章列表、创建、详情、保存草稿、Markdown 预览、发布、下线；统一使用 Zod 校验和结构化错误响应。
- 新增 `/admin/login`、`/admin/blog`、`/admin/blog/new`、`/admin/blog/[id]`：文章列表、状态筛选、双语编辑表单、Markdown 实时预览、保存草稿、发布/下线。后台入口不加入公开导航。
- 新增对象存储媒体模块和上传接口。默认使用 S3 兼容对象存储，采用预签名 URL 直传；仅允许 JPEG、PNG、WebP、GIF，单文件上限 10 MB，拒绝 SVG。
- 禁用 Markdown 原始 HTML，并对渲染结果按白名单净化；预览与公开页面共用同一渲染策略。

## 配置与部署

新增并写入 `.env.example`、部署文档的环境变量：

```dotenv
BLOG_DB_PROVIDER=postgres
BLOG_DATABASE_URL=postgresql://resume_blog:password@127.0.0.1:5432/resume_blog

ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_SESSION_SECRET=replace-with-a-random-secret-at-least-32-characters
ADMIN_APP_URL=https://example.com

BLOG_ASSET_S3_ENDPOINT=https://s3.example.com
BLOG_ASSET_S3_REGION=auto
BLOG_ASSET_S3_BUCKET=resume-blog-assets
BLOG_ASSET_S3_ACCESS_KEY_ID=replace-me
BLOG_ASSET_S3_SECRET_ACCESS_KEY=replace-me
BLOG_ASSET_PUBLIC_BASE_URL=https://assets.example.com
```

- 托管 PostgreSQL 连接串需要 SSL 时，在 `BLOG_DATABASE_URL` 添加 `?sslmode=require`。
- 提供 schema migration 命令和 SQLite 数据导入命令；部署顺序为：配置环境变量、执行 schema migration、迁移现有 SQLite 内容、启动站点。
- 所有真实密码、数据库连接串和对象存储密钥只配置在服务器或 CI 密钥管理中，不提交到 Git。

## 测试与验收

- 认证：错误账号/密码、过期或篡改 Cookie、跨域写请求均被拒绝；密码不会出现在响应或日志。
- 文章：可保存不完整草稿；发布必须具备完整中英文内容；重复 slug、无效标签、非法封面和未上传图片返回字段错误。
- 状态：发布文章出现在中英文公开列表和详情页；下线后立即不再公开；草稿永不公开。
- 媒体：不支持类型、超限文件、未完成上传不能被引用；成功上传可用于封面与正文。
- 数据：schema migration 和 SQLite 导入可重复执行，不重复文章。
- 验证：补充单元/API 测试，执行 `npm test`、`npm run build`；CI 使用 PostgreSQL service 覆盖写入、唯一约束与事务路径。

## 默认假设

- 首版不包含修订历史、回滚、自动保存、标签管理、RSS 或导出备份。
- 每次发布必须同时包含完整中文和英文版本。
- 图片使用 S3 兼容对象存储；改用服务器磁盘或已有云存储时，仅替换媒体适配器与环境变量。

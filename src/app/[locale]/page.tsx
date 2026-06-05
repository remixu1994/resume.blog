import Link from 'next/link';
import { ArchitectureCard, PostCard, TopicCard } from '@/components/cards';
import { getHomeViewModel } from '@/content/site-content';
import { requireLocale } from '@/lib/locale';
export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const viewModel = getHomeViewModel(locale);
  const isZh = locale === 'zh';
  const heroTitle = isZh ? '让业务系统稳定交付、持续演进' : viewModel.dictionary.home.heroTitle;
  const heroBody = isZh
    ? '全栈工程、架构设计、稳定性交付与 AI 辅助工程实践'
    : viewModel.dictionary.home.heroBody;
  const resumeCta = isZh ? '查看简历' : viewModel.dictionary.nav.resume;
  const blogCta = isZh ? '阅读技术博客' : viewModel.dictionary.nav.blog;
  const viewAll = isZh ? '查看全部' : 'View all';
  const roleLabel = 'Full-stack Engineer / Architecture Notes';
  const profileLabel = 'Resume + Blog';
  const focusTitle = isZh
    ? '这里整理我的项目经历、架构实践，以及一些从真实问题里写出来的技术文章。'
    : 'I write down engineering judgment from real projects and keep the delivery evidence close to the resume.';
  const focusItems = isZh
    ? ['复杂业务系统', '架构与稳定性', 'AI 辅助工程', '技术写作']
    : ['Complex business systems', 'Architecture and reliability', 'AI-assisted engineering', 'Technical writing'];
  const latestPost = viewModel.featured.recentPosts[0];
  const contactCopy = isZh
    ? '项目案例、技术写作、PDF 简历与联系方式都集中在简历页，方便快速了解合作匹配度。'
    : 'Project cases, technical writing, PDF resume, and contact links are collected in the resume section.';

  return (
    <>
      <section className="hero">
        <article className="hero-panel">
          <div>
            <p className="eyebrow">{roleLabel}</p>
            <h1>{heroTitle}</h1>
            <p>{heroBody}</p>
          </div>
          <div className="hero-actions">
            <Link className="button" href={`/${locale}/resume`}>
              {resumeCta}
            </Link>
            <Link className="button-muted" href={`/${locale}/blog`}>
              {blogCta}
            </Link>
          </div>
          <div className="hero-metrics" aria-label={viewModel.dictionary.resume.title}>
            {viewModel.featured.metrics.map((metric) => (
              <div className="metric" key={metric.label}>
                <span className="eyebrow">{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        </article>
        <aside className="hero-side">
          <div className="profile-card" aria-label={profileLabel}>
            <div>
              <p className="eyebrow">{profileLabel}</p>
              <h2>{focusTitle}</h2>
            </div>
            <div className="focus-list">
              {focusItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            {latestPost ? (
              <Link className="latest-note" href={`/${locale}/blog/${latestPost.slug}`}>
                <span className="eyebrow">{isZh ? '最新文章' : 'Latest Post'}</span>
                <strong>{latestPost.title}</strong>
              </Link>
            ) : null}
          </div>
          <div className="panel">
            <p className="eyebrow">{viewModel.dictionary.home.contactLabel}</p>
            <p className="lede">{contactCopy}</p>
          </div>
        </aside>
      </section>

      <section className="section section-band">
        <div className="section-head home-section-head">
          <div>
            <p className="eyebrow">{viewModel.dictionary.home.featuredLabel}</p>
            <h2 className="section-title">
              {isZh ? '将复杂系统拆解、重构并交付价值' : viewModel.dictionary.nav.architecture}
            </h2>
          </div>
          <Link className="text-link" href={`/${locale}/architecture`}>
            {viewAll}
          </Link>
        </div>
        <div className="grid-2 compact-grid">
          {viewModel.featured.featuredCases.map((item) => (
            <ArchitectureCard key={item.slug} locale={locale} item={item} />
          ))}
        </div>
      </section>

      <section className="section home-content-grid">
        <div className="content-column">
          <div className="section-head">
            <div>
              <p className="eyebrow">{viewModel.dictionary.home.recentLabel}</p>
              <h2 className="section-title">{viewModel.dictionary.nav.blog}</h2>
            </div>
            <Link className="text-link" href={`/${locale}/blog`}>
              {viewAll}
            </Link>
          </div>
          <div className="list">
            {viewModel.featured.recentPosts.map((post) => (
              <PostCard key={post.id} locale={locale} post={post} />
            ))}
          </div>
        </div>
        <aside className="topic-rail">
          <p className="eyebrow">{isZh ? '专题' : 'Topics'}</p>
          <div className="list">
            {viewModel.featured.topicCards.map((item) => (
              <TopicCard key={item.slug} locale={locale} item={item} />
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}

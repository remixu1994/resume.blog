import type { Metadata } from 'next';
import type { ResumeExperience, ResumeProject } from '@devfolio-blog/shared-types';
import { JsonLd } from '@/components/json-ld';
import { ResumeProjectShowcase } from '@/components/resume-project-showcase';
import { getResumeViewModel } from '@/content/site-content';
import { requireLocale } from '@/lib/locale';
import { buildArticleJsonLd, buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const { dictionary, resume } = getResumeViewModel(locale);

  return buildMetadata({
    locale,
    title: dictionary.nav.resume,
    description: resume.headline,
    path: `/${locale}/resume`,
    alternatePaths: {
      zh: '/zh/resume',
      en: '/en/resume',
    },
    type: 'profile',
    keywords: ['resume', 'full-stack engineer', 'architecture', 'experience'],
  });
}

export default async function ResumePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const { dictionary, resume } = getResumeViewModel(locale);
  const contactEmail = resume.contactEmail.trim();
  const isZh = locale === 'zh';
  const contactLabel = isZh ? '联系我' : 'Email Me';
  const projectLabel = isZh ? '代表项目' : resume.labels.projectExperience;
  const contributionLabel = isZh ? '关键贡献' : 'Key contributions';
  const stackLabel = isZh ? '技术栈' : 'Stack';

  return (
    <>
      <JsonLd
        data={buildArticleJsonLd({
          locale,
          title: dictionary.nav.resume,
          description: resume.headline,
          path: `/${locale}/resume`,
          type: 'ProfilePage',
        })}
      />
      <header className="resume-hero">
        <div className="resume-hero-copy">
          <p className="eyebrow">{dictionary.resume.title}</p>
          <h1 className="resume-title">{resume.name}</h1>
          <p className="resume-headline">{resume.headline}</p>
          <p className="lede">{resume.intro}</p>
          <div className="button-row">
            <a className="button" href="/resume/moon-devfolio-resume.pdf">
              {dictionary.resume.download}
            </a>
            {contactEmail ? (
              <a className="button-muted" href={`mailto:${contactEmail}`} aria-label={`${contactLabel}: ${contactEmail}`}>
                {contactLabel}
              </a>
            ) : null}
          </div>
        </div>
        <aside className="resume-hero-metrics" aria-label={dictionary.resume.title}>
          {resume.heroMetrics.map((metric) => (
            <div className="metric" key={metric.label}>
              <span className="eyebrow">{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </aside>
      </header>

      <section className="resume-overview">
        <article className="summary-panel">
          <p className="eyebrow">{resume.labels.professionalSummary}</p>
          <ul className="check-list">
            {resume.summaryPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
        <article className="skill-panel">
          <p className="eyebrow">{resume.labels.competences}</p>
          <div className="skill-grid">
            {resume.skillGroups.map((group) => (
              <section className="skill-row" key={group.title}>
                <h2>{group.title}</h2>
                <div className="tag-row">
                  {group.items.map((item) => (
                    <span className="tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </section>

      <section className="section resume-section">
        <div className="resume-section-head">
          <p className="eyebrow">{resume.labels.projectExperience}</p>
          <h2 className="section-title">{projectLabel}</h2>
        </div>
        <div className="resume-project-list">
          {resume.projects.map((project) => (
            <ProjectBlock
              key={project.title}
              project={project}
              labels={resume.labels}
              contributionLabel={contributionLabel}
              stackLabel={stackLabel}
            />
          ))}
        </div>
      </section>

      <section className="section resume-section">
        <div className="resume-section-head">
          <p className="eyebrow">{resume.labels.employmentHistory}</p>
          <h2 className="section-title">{resume.labels.employmentHistory}</h2>
        </div>
        <div className="experience-timeline">
          {resume.experiences.map((item) => (
            <ExperienceBlock key={`${item.period}-${item.role}`} item={item} />
          ))}
        </div>
      </section>

      <section className="section resume-info-grid" aria-label={isZh ? '补充信息' : 'Additional information'}>
        <article className="panel profile-panel">
          <p className="eyebrow">{resume.labels.profile}</p>
          <p>{resume.location}</p>
          <p>{resume.gender}</p>
          <p>{resume.age}</p>
          {resume.drivingLicense ? <p>{resume.drivingLicense}</p> : null}
        </article>
        <article className="panel">
          <p className="eyebrow">{resume.labels.education}</p>
          {resume.education.map((item) => (
            <div className="resume-info-item" key={item.school}>
              <p className="article-meta">{item.period}</p>
              <h2>{item.school}</h2>
              <p>{item.degree}</p>
            </div>
          ))}
        </article>
        <article className="panel">
          <p className="eyebrow">{resume.labels.languages}</p>
          {resume.languages.map((item) => (
            <p key={item.name}>
              <strong>{item.name}</strong> / {item.proficiency}
            </p>
          ))}
        </article>
      </section>
    </>
  );
}

function ProjectBlock({
  project,
  labels,
  contributionLabel,
  stackLabel,
}: {
  project: ResumeProject;
  labels: ReturnType<typeof getResumeViewModel>['resume']['labels'];
  contributionLabel: string;
  stackLabel: string;
}) {
  return (
    <article className="resume-project-card">
      <div className="resume-project-head">
        <div>
          <p className="article-meta">
            {project.period} / {project.role}
          </p>
          <h3>{project.title}</h3>
        </div>
        {project.showcase ? <ResumeProjectShowcase project={project} labels={labels} /> : null}
      </div>
      <p className="resume-project-summary">{project.summary}</p>
      <div className="resume-project-stack" aria-label={stackLabel}>
        {project.stack.map((item) => (
          <span className="tag" key={item}>
            {item}
          </span>
        ))}
      </div>
      <p className="eyebrow resume-contribution-label">{contributionLabel}</p>
      <ul className="resume-contribution-list">
        {project.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
    </article>
  );
}

function ExperienceBlock({ item }: { item: ResumeExperience }) {
  return (
    <article className="experience-item">
      <div className="experience-marker" aria-hidden="true" />
      <div>
        <p className="article-meta">{item.period}</p>
        <h3>{item.role}</h3>
        <p className="experience-company">{item.company}</p>
        <p>{item.summary}</p>
        <ul>
          {item.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

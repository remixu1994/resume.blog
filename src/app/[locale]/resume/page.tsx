import type { ResumeProject } from '@devfolio-blog/shared-types';
import { ResumeProjectShowcase } from '@/components/resume-project-showcase';
import { getResumeViewModel } from '@/content/site-content';
import { requireLocale } from '@/lib/locale';

export default async function ResumePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const { dictionary, resume } = getResumeViewModel(locale);
  const contactEmail = resume.contactEmail.trim();
  const contactLabel = locale === 'zh' ? '联系我' : 'Email Me';

  return (
    <>
      <header className="article-hero resume-hero">
        <div className="resume-hero-copy">
          <p className="eyebrow">{dictionary.resume.title}</p>
          <h1 className="page-title">{resume.name}</h1>
          <p className="lede">{resume.headline}</p>
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

      <section className="resume-scan-grid">
        <article className="article-panel summary-panel">
          <p className="eyebrow">{resume.labels.professionalSummary}</p>
          <ul className="check-list">
            {resume.summaryPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
        <aside className="panel skill-panel">
          <p className="eyebrow">{resume.labels.competences}</p>
          <div className="skill-grid">
            {resume.skillGroups.map((group) => (
              <div className="skill-row" key={group.title}>
                <h3>{group.title}</h3>
                <div className="tag-row">
                  {group.items.map((item) => (
                    <span className="tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="section content-grid resume-content-grid">
        <div className="list">
          <article className="article-panel">
            <p className="eyebrow">{resume.labels.projectExperience}</p>
            <div className="list">
              {resume.projects.map((project) => (
                <ProjectBlock key={project.title} project={project} labels={resume.labels} />
              ))}
            </div>
          </article>

          <article className="article-panel">
            <p className="eyebrow">{resume.labels.employmentHistory}</p>
            <div className="list">
              {resume.experiences.map((item) => (
                <section className="item" key={`${item.period}-${item.role}`}>
                  <p className="article-meta">{item.period}</p>
                  <h2>{item.role}</h2>
                  <p className="lede">{item.company}</p>
                  <p>{item.summary}</p>
                  <ul>
                    {item.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </article>
        </div>

        <aside className="list">
          <section className="panel profile-panel">
            <p className="eyebrow">{resume.labels.profile}</p>
            <p>{resume.location}</p>
            <p>{resume.gender}</p>
            <p>{resume.age}</p>
            {resume.drivingLicense ? <p>{resume.drivingLicense}</p> : null}
          </section>
          <section className="panel">
            <p className="eyebrow">{resume.labels.education}</p>
            {resume.education.map((item) => (
              <div className="item" key={item.school}>
                <p className="article-meta">{item.period}</p>
                <h3>{item.school}</h3>
                <p>{item.degree}</p>
              </div>
            ))}
          </section>
          <section className="panel">
            <p className="eyebrow">{resume.labels.languages}</p>
            {resume.languages.map((item) => (
              <p key={item.name}>
                <strong>{item.name}</strong> / {item.proficiency}
              </p>
            ))}
          </section>
        </aside>
      </section>
    </>
  );
}

function ProjectBlock({ project, labels }: { project: ResumeProject; labels: ReturnType<typeof getResumeViewModel>['resume']['labels'] }) {
  return (
    <section className="item project-item">
      <div className="project-item-head">
        <div>
          <p className="article-meta">
            {project.period} / {project.role}
          </p>
          <h2>{project.title}</h2>
        </div>
        {project.showcase ? <ResumeProjectShowcase project={project} labels={labels} /> : null}
      </div>
      <p>{project.summary}</p>
      <div className="tag-row">
        {project.stack.map((item) => (
          <span className="tag" key={item}>
            {item}
          </span>
        ))}
      </div>
      <ul>
        {project.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
    </section>
  );
}

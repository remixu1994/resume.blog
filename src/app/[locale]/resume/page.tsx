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
      <header className="article-hero">
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
      </header>

      <section className="grid-3">
        {resume.heroMetrics.map((metric) => (
          <div className="panel" key={metric.label}>
            <p className="eyebrow">{metric.label}</p>
            <h2 className="section-title">{metric.value}</h2>
          </div>
        ))}
      </section>

      <section className="section content-grid">
        <div className="list">
          <article className="article-panel">
            <p className="eyebrow">{resume.labels.professionalSummary}</p>
            {resume.summaryPoints.map((point) => (
              <p className="lede" key={point}>
                {point}
              </p>
            ))}
          </article>

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
          <section className="dark-panel">
            <p className="eyebrow">{resume.labels.profile}</p>
            <p>{resume.location}</p>
            <p>{resume.gender}</p>
            <p>{resume.age}</p>
            {resume.drivingLicense ? <p>{resume.drivingLicense}</p> : null}
          </section>
          <section className="panel">
            <p className="eyebrow">{resume.labels.competences}</p>
            <div className="list">
              {resume.skillGroups.map((group) => (
                <div className="item" key={group.title}>
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
    <section className="item">
      <p className="article-meta">
        {project.period} / {project.role}
      </p>
      <h2>{project.title}</h2>
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
      {project.showcase ? (
        <ResumeProjectShowcase project={project} labels={labels} />
      ) : null}
    </section>
  );
}

import { getBooksViewModel } from '@/content/site-content';
import { requireLocale } from '@/lib/locale';

export default async function BooksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const viewModel = getBooksViewModel(locale);

  return (
    <>
      <header className="article-hero shelf-hero books-proof-hero">
        <div>
          <h1 className="page-title">{viewModel.narrative.heroTitle}</h1>
          <p className="lede">{viewModel.narrative.heroIntro}</p>
        </div>
        <aside className="shelf-note books-proof-note">
          <div className="metric">
            <span className="eyebrow">{viewModel.narrative.metricLabel}</span>
            <strong>{viewModel.narrative.metricValue}</strong>
          </div>
          <div>
            <p className="eyebrow">{viewModel.narrative.noteTitle}</p>
            <p>{viewModel.narrative.noteBody}</p>
          </div>
        </aside>
      </header>

      <section className="section books-path">
        {viewModel.readingSections.map((section, sectionIndex) => (
          <article className="books-path-section" key={section.key}>
            <div className="books-path-heading">
              <span>{String(sectionIndex + 1).padStart(2, '0')}</span>
              <div>
                <p className="eyebrow">{viewModel.narrative.sectionEyebrow}</p>
                <h2 className="section-title">{section.title}</h2>
                <p className="lede">{section.description}</p>
              </div>
            </div>

            <div className="proof-book-list">
              {section.books.map((book) => (
                <article className="proof-book-card" key={book.slug}>
                  {book.coverImage ? (
                    <div className="proof-book-cover">
                      <img src={book.coverImage} alt={book.title} />
                    </div>
                  ) : null}
                  <div className="proof-book-copy">
                    <div>
                      <p className="eyebrow">{book.category}</p>
                      <h3>{book.title}</h3>
                      {book.author ? <p className="book-author">{book.author}</p> : null}
                    </div>
                    <div className="proof-points">
                      <section>
                        <strong>{viewModel.narrative.labels.judgment}</strong>
                        <p>{book.takeaway}</p>
                      </section>
                      <section>
                        <strong>{viewModel.narrative.labels.scene}</strong>
                        <p>{book.summary}</p>
                      </section>
                      <section>
                        <strong>{viewModel.narrative.labels.proof}</strong>
                        <p>{book.recommendation}</p>
                      </section>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

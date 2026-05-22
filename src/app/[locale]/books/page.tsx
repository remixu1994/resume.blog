import { getBooksViewModel } from '@/content/site-content';
import { requireLocale } from '@/lib/locale';

export default async function BooksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const viewModel = getBooksViewModel(locale);

  return (
    <>
      <header className="article-hero">
        <p className="eyebrow">{viewModel.dictionary.nav.books}</p>
        <h1 className="page-title">{viewModel.dictionary.books.title}</h1>
        <p className="lede">{viewModel.dictionary.books.intro}</p>
      </header>

      <section className="grid-3">
        {viewModel.featuredBooks.map((book) => (
          <article className="panel item" key={book.slug}>
            {book.coverImage ? <img className="recipe-hero" src={book.coverImage} alt={book.title} /> : null}
            <p className="eyebrow">{book.category}</p>
            <h2>{book.title}</h2>
            <p>{book.summary}</p>
            <p>
              <strong>{viewModel.dictionary.books.takeawayLabel}:</strong> {book.takeaway}
            </p>
          </article>
        ))}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">{viewModel.dictionary.books.groups}</p>
            <h2 className="section-title">{viewModel.dictionary.books.groupsTitle}</h2>
          </div>
        </div>
        <div className="grid-2">
          {viewModel.groupedBooks.map((group) => (
            <article className="panel" key={group.category}>
              <p className="eyebrow">{group.category}</p>
              <h2>{group.title}</h2>
              <p className="lede">{group.description}</p>
              <div className="list">
                {group.books.map((book) => (
                  <section className="item" key={book.slug}>
                    <h3>{book.title}</h3>
                    <p>{book.recommendation}</p>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

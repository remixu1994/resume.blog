import { notFound } from 'next/navigation';
import { getDictionary } from '@/content/site-content';
import { MarkdownBody } from '@/lib/markdown';
import { getRecipeBySlug, getRecipeSlugs } from '@/lib/recipes';
import { requireLocale } from '@/lib/locale';

export function generateStaticParams() {
  return getRecipeSlugs();
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = requireLocale(localeParam);
  const dictionary = getDictionary(locale);
  const recipe = getRecipeBySlug(slug, locale);
  if (!recipe) notFound();

  return (
    <article>
      <header className="article-hero">
        <p className="eyebrow">{dictionary.nav.recipes}</p>
        <h1 className="article-title">{recipe.title}</h1>
        <p className="lede">{recipe.summary}</p>
        <div className="tag-row">
          <span className="tag">{recipe.category}</span>
          <span className="tag">{recipe.difficulty}</span>
          <span className="tag">{recipe.durationMinutes} min</span>
          {recipe.calories ? <span className="tag">{recipe.calories} kcal</span> : null}
        </div>
      </header>
      {recipe.coverImage ? <img className="recipe-hero" src={recipe.coverImage} alt={recipe.title} /> : null}
      <section className="section content-grid">
        <div className="article-panel">
          <MarkdownBody html={recipe.html} />
        </div>
        <aside className="panel">
          <p className="eyebrow">Ingredients</p>
          <ul>
            {recipe.ingredients.map((item) => (
              <li key={`${item.name}-${item.amount}`}>
                {item.name} / {item.amount}
              </li>
            ))}
          </ul>
          {recipe.methodImage ? (
            <a className="button-muted" href={recipe.methodImage} target="_blank" rel="noreferrer">
              Open method image
            </a>
          ) : null}
        </aside>
      </section>
    </article>
  );
}

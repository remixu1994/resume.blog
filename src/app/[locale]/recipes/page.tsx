import Link from 'next/link';
import { getDictionary } from '@/content/site-content';
import { listRecipes } from '@/lib/recipes';
import { requireLocale } from '@/lib/locale';

export default async function RecipesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const dictionary = getDictionary(locale);
  const recipes = listRecipes({ locale });

  return (
    <>
      <header className="article-hero">
        <p className="eyebrow">{dictionary.nav.recipes}</p>
        <h1 className="page-title">{dictionary.nav.recipes}</h1>
        <p className="lede">Static recipe notes migrated from Markdown, ready for later API expansion.</p>
      </header>
      <section className="grid-2">
        {recipes.map((recipe) => (
          <Link className="panel item" href={`/${locale}/recipes/${recipe.slug}`} key={recipe.slug}>
            {recipe.coverImage ? <img className="recipe-hero" src={recipe.coverImage} alt={recipe.title} /> : null}
            <p className="eyebrow">
              {recipe.category} / {recipe.durationMinutes} min / {recipe.difficulty}
            </p>
            <h2>{recipe.title}</h2>
            <p>{recipe.summary}</p>
            <div className="tag-row">
              {recipe.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}

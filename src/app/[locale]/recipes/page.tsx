import Link from 'next/link';
import { getDictionary } from '@/content/site-content';
import { listRecipes } from '@/lib/recipes';
import { requireLocale } from '@/lib/locale';

export default async function RecipesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const dictionary = getDictionary(locale);
  const recipes = listRecipes({ locale });
  const isZh = locale === 'zh';

  return (
    <>
      <header className="article-hero recipe-index-hero">
        <div>
          <p className="eyebrow">{dictionary.nav.recipes}</p>
          <h1 className="page-title">{dictionary.nav.recipes}</h1>
          <p className="lede">
            {isZh
              ? '把日常做饭记录成可复用的克重、步骤和营养笔记，方便之后继续扩展成结构化食谱库。'
              : 'Structured cooking notes with reusable measurements, steps, and nutrition context.'}
          </p>
        </div>
        <aside className="recipe-stats">
          <div className="metric">
            <span className="eyebrow">{isZh ? '已整理' : 'Recipes'}</span>
            <strong>{recipes.length}</strong>
          </div>
          <div className="metric">
            <span className="eyebrow">{isZh ? '记录方式' : 'Format'}</span>
            <strong>Markdown</strong>
          </div>
        </aside>
      </header>
      <section className="recipe-card-grid">
        {recipes.map((recipe) => (
          <Link className="recipe-card" href={`/${locale}/recipes/${recipe.slug}`} key={recipe.slug}>
            {recipe.coverImage ? (
              <div className="recipe-card-media">
                <img src={recipe.coverImage} alt={recipe.title} />
              </div>
            ) : null}
            <div className="recipe-card-copy">
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
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}

import { notFound } from 'next/navigation';
import { getDictionary } from '@/content/site-content';
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
  const isZh = locale === 'zh';

  return (
    <article className="recipe-detail">
      <header className="article-hero recipe-detail-hero">
        <div className="recipe-detail-copy">
          <p className="eyebrow">{dictionary.nav.recipes}</p>
          <h1 className="article-title">{recipe.title}</h1>
          <p className="lede">{recipe.summary}</p>
          <div className="tag-row">
            <span className="tag">{recipe.category}</span>
            <span className="tag">{recipe.difficulty}</span>
            <span className="tag">{recipe.durationMinutes} min</span>
            {recipe.calories ? <span className="tag">{recipe.calories} kcal</span> : null}
          </div>
        </div>
        {recipe.coverImage ? (
          <div className="recipe-detail-media">
            <img src={recipe.coverImage} alt={recipe.title} />
          </div>
        ) : null}
      </header>
      <section className="section content-grid recipe-detail-grid">
        <div className="article-panel recipe-method">
          <section>
            <p className="eyebrow">{isZh ? '做法步骤' : 'Method'}</p>
            <div className="recipe-step-list">
              {recipe.steps.map((step, index) => (
                <section className="recipe-step" key={step.title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h2>{step.title}</h2>
                    <ul>
                      {step.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              ))}
            </div>
          </section>
          {recipe.tips.length > 0 ? (
            <section className="recipe-note-block">
              <p className="eyebrow">{isZh ? '关键提示' : 'Key Tips'}</p>
              <ul>
                {recipe.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {recipe.nutritionNotes.length > 0 ? (
            <section className="recipe-note-block">
              <p className="eyebrow">{isZh ? '营养说明' : 'Nutrition Notes'}</p>
              <ul>
                {recipe.nutritionNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <aside className="panel recipe-ingredients">
          <RecipeIngredientGroup title={isZh ? '食材清单' : 'Ingredients'} items={recipe.ingredients} />
          {recipe.seasonings.length > 0 ? (
            <RecipeIngredientGroup title={isZh ? '调料' : 'Seasonings'} items={recipe.seasonings} />
          ) : null}
          {recipe.sauce.length > 0 ? <RecipeIngredientGroup title={isZh ? '红烧汁' : 'Sauce'} items={recipe.sauce} /> : null}
          {recipe.methodImage ? (
            <a className="button-muted" href={recipe.methodImage} target="_blank" rel="noreferrer">
              {isZh ? '打开步骤图' : 'Open method image'}
            </a>
          ) : null}
        </aside>
      </section>
    </article>
  );
}

function RecipeIngredientGroup({
  title,
  items,
}: {
  title: string;
  items: Array<{ name: string; amount: string; note?: string }>;
}) {
  return (
    <section className="ingredient-group">
      <p className="eyebrow">{title}</p>
      <ul className="ingredient-list">
        {items.map((item) => (
          <li key={`${title}-${item.name}-${item.amount}`}>
            <span>{item.name}</span>
            <strong>{item.amount}</strong>
            {item.note ? <small>{item.note}</small> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

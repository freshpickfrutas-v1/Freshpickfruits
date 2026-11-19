import React from 'react';
import { Clock, Users, ChefHat, Lightbulb, Utensils, ListOrdered, Timer } from 'lucide-react';
import { SiteShell } from '../components/SiteShell';
import { ContentImage, ImageCredit } from '../components/ContentImage';
import { BlueberryIcon } from '../components/BlueberryIcon';
import { OrderCta } from '../components/OrderCta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { RecipeCard } from '../components/RecipeCard';
import { NotFoundContent } from './NotFoundContent';
import { difficultyLabel, formatMinutes, getRecipeCategory, recipeCategories, recipeTotalMinutes } from '../data/recipes';
import { useLang, useT, withLang } from '../lib/i18n';
import { getRecipe, recipeIndex } from '../data/content';
import { JsonLd, SITE_URL, usePageMeta } from '../lib/seo';

export default function RecipeDetailPage({ slug }: { slug: string }) {
  const t = useT();
  const lang = useLang();
  const recipe = getRecipe(slug);

  usePageMeta({
    title: recipe ? `${recipe.title} | ${t('Recetas Fresh Pick', 'Fresh Pick Recipes')}` : t('Receta no encontrada | Fresh Pick', 'Recipe not found | Fresh Pick'),
    description: recipe?.excerpt ?? t('Esta receta no existe o fue movida. Explora todas nuestras recetas con arándanos frescos.', 'This recipe does not exist or was moved. Explore all our fresh blueberry recipes.'),
    path: `/recetas/${slug}`,
    image: recipe?.image,
    type: 'article'
  });

  if (!recipe) {
    return (
      <SiteShell>
        <NotFoundContent
          title={t('No encontramos esta receta', 'We could not find this recipe')}
          text={t('Puede que haya cambiado de nombre. Mira todas nuestras recetas con arándanos.', 'It may have been renamed. See all our blueberry recipes.')}
          href="/recetas"
          linkLabel={t('Ver todas las recetas', 'See all recipes')}
        />
      </SiteShell>
    );
  }

  const category = getRecipeCategory(recipe.category, lang);
  const total = recipeTotalMinutes(recipe);
  const related = recipeIndex().filter(r => r.slug !== recipe.slug && recipeCategories(r).some(c => recipeCategories(recipe).includes(c))).slice(0, 3);

  return (
    <SiteShell>
      <article>
        <header className="fp-gradient-hero border-b border-stone-200/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pb-14">
            <Breadcrumbs
              items={[
                { label: t('Inicio', 'Home'), href: '/' },
                { label: t('Recetas', 'Recipes'), href: '/recetas' },
                { label: category.name, href: `/recetas/categoria/${category.id}` },
                { label: recipe.title }
              ]}
            />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <a
                  href={`/recetas/categoria/${category.id}`}
                  className="text-xs font-bold uppercase tracking-wider text-[#7B4382] hover:text-[#2F183C]"
                >
                  {category.emoji} {category.name}
                </a>
                <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight font-display leading-tight">
                  {recipe.title}
                </h1>
                <p className="mt-3 text-base text-stone-700 leading-relaxed">{recipe.excerpt}</p>

                <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat icon={<Clock className="w-4 h-4" />} label={t('Preparación', 'Prep time')} value={formatMinutes(recipe.prepMinutes)} />
                  <Stat icon={<Timer className="w-4 h-4" />} label={t('Tiempo total', 'Total time')} value={formatMinutes(total)} />
                  <Stat icon={<ChefHat className="w-4 h-4" />} label={t('Dificultad', 'Difficulty')} value={difficultyLabel(recipe.difficulty, lang)} />
                  <Stat icon={<Users className="w-4 h-4" />} label={t('Porciones', 'Servings')} value={String(recipe.servings)} />
                </dl>
              </div>

              <figure>
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[#2F183C]/20 border-4 border-white aspect-[4/3]">
                  <ContentImage src={recipe.image} alt={recipe.imageAlt} label={category.name} emoji={category.emoji} eager />
                </div>
                {recipe.image && recipe.imagenCredit && <ImageCredit text={recipe.imagenCredit} />}
              </figure>
            </div>
          </div>
        </header>

        <div className="bg-[#F7F5F0]/90">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Ingredients */}
            <aside className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-[#EADBEE] p-5 sm:p-6 shadow-sm lg:sticky lg:top-28">
                <h2 className="flex items-center gap-2 text-lg font-bold font-display">
                  <Utensils className="w-5 h-5 text-[#7B4382]" />
                  {t('Ingredientes', 'Ingredients')}
                </h2>
                <p className="text-xs text-stone-500 mt-1">{t(`Para ${recipe.servings} ${recipe.servings === 1 ? 'porción' : 'porciones'}`, `Serves ${recipe.servings}`)}</p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {recipe.ingredients.map((ing, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2.5 ${ing.freshPick ? 'rounded-lg bg-[#F5ECF9] border border-[#DFCEE6] px-3 py-2 -mx-1 font-semibold text-[#2F183C]' : 'text-stone-700'}`}
                    >
                      {ing.freshPick ? (
                        <BlueberryIcon className="w-5 h-5 shrink-0" />
                      ) : (
                        <span className="mt-0.5 shrink-0 text-[#7B4382]" aria-hidden="true">•</span>
                      )}
                      <span>
                        {ing.text}
                        {ing.freshPick && (
                          <a href="/#pedidos-personalizados" className="block text-xs font-bold text-[#7B4382] hover:text-[#2F183C] mt-0.5">
                            {t('Pedir arándanos Fresh Pick →', 'Order Fresh Pick blueberries →')}
                          </a>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <OrderCta
                    compact
                    title={t('¿Te faltan arándanos?', 'Out of blueberries?')}
                    text={t('Recíbelos frescos en tu casa los martes y miércoles.', 'Get them fresh at your door on Tuesdays and Wednesdays.')}
                    whatsappMessage={t(`Hola Fresh Pick, quiero pedir arándanos para preparar: ${recipe.title}`, `Hello Fresh Pick, I would like to order blueberries to make: ${recipe.title}`)}
                  />
                </div>
              </div>
            </aside>

            {/* Steps & tips */}
            <div className="lg:col-span-8 space-y-10">
              <section>
                <h2 className="flex items-center gap-2 text-xl font-bold font-display">
                  <ListOrdered className="w-5 h-5 text-[#7B4382]" />
                  {t('Paso a paso', 'Step by step')}
                </h2>
                <ol className="mt-5 space-y-4">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="shrink-0 w-8 h-8 rounded-full bg-[#2F183C] text-[#DDA83A] text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-sm sm:text-base text-stone-700 leading-relaxed pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>

              {recipe.tips.length > 0 && (
                <section className="rounded-2xl bg-[#FAF2DF] border border-[#EED7A1] p-5 sm:p-6">
                  <h2 className="flex items-center gap-2 text-lg font-bold font-display">
                    <Lightbulb className="w-5 h-5 text-[#C59328]" />
                    {t('Tips Fresh Pick', 'Fresh Pick Tips')}
                  </h2>
                  <ul className="mt-3 space-y-2.5">
                    {recipe.tips.map((tip, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-stone-700 leading-relaxed">
                        <span className="text-[#C59328] font-bold shrink-0">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <OrderCta
                title={t('Prepara esta receta con arándanos de alta montaña', 'Make this recipe with high-mountain blueberries')}
                whatsappMessage={t(`Hola Fresh Pick, quiero pedir arándanos para preparar: ${recipe.title}`, `Hello Fresh Pick, I would like to order blueberries to make: ${recipe.title}`)}
              />
            </div>
          </div>

          {related.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
              <h2 className="text-xl sm:text-2xl font-bold font-display mb-6">{t('También te puede gustar', 'You may also like')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map(r => <RecipeCard key={r.slug} recipe={r} />)}
              </div>
            </section>
          )}
        </div>
      </article>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Recipe',
          name: recipe.title,
          description: recipe.excerpt,
          ...(recipe.image ? { image: [recipe.image.startsWith('http') ? recipe.image : `${SITE_URL}${recipe.image}`] } : {}),
          author: { '@type': 'Organization', name: 'Fresh Pick' },
          recipeCategory: category.name,
          recipeCuisine: t('Colombiana', 'Colombian'),
          keywords: t(`arándanos, receta con arándanos, ${category.name.toLowerCase()}`, `blueberries, blueberry recipe, ${category.name.toLowerCase()}`),
          prepTime: `PT${recipe.prepMinutes}M`,
          cookTime: `PT${recipe.cookMinutes}M`,
          totalTime: `PT${total}M`,
          recipeYield: t(`${recipe.servings} porciones`, `${recipe.servings} servings`),
          recipeIngredient: recipe.ingredients.map(i => i.text),
          recipeInstructions: recipe.steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
          url: `${SITE_URL}${withLang(`/recetas/${recipe.slug}`, lang)}`
        }}
      />
    </SiteShell>
  );
}

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="rounded-xl bg-white border border-[#EADBEE] px-3 py-2.5">
    <dt className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold uppercase tracking-wide">
      <span className="text-[#7B4382]">{icon}</span>
      {label}
    </dt>
    <dd className="text-sm font-bold text-[#2F183C] mt-0.5">{value}</dd>
  </div>
);

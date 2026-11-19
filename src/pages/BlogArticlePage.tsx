import React from 'react';
import { Clock, CalendarDays, BookMarked } from 'lucide-react';
import { SiteShell } from '../components/SiteShell';
import { ContentImage, ImageCredit } from '../components/ContentImage';
import { OrderCta } from '../components/OrderCta';
import { FloatingBuyButton } from '../components/FloatingBuyButton';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { RecipeCard } from '../components/RecipeCard';
import { ArticleCard } from '../components/ArticleCard';
import { NotFoundContent } from './NotFoundContent';
import { formatArticleDate, blogCategoriesFor } from '../data/blog';
import { useLang, useT, withLang } from '../lib/i18n';
import { articleIndex, getArticle, getRecipeSummary } from '../data/content';
import { BlogBlock, ContentSource, RecipeSummary } from '../types';
import { JsonLd, SITE_URL, usePageMeta } from '../lib/seo';
import { ShareButtons } from '../components/ShareButtons';

export default function BlogArticlePage({ slug }: { slug: string }) {
  const t = useT();
  const lang = useLang();
  const article = getArticle(slug);

  usePageMeta({
    title: article ? `${article.title} | ${t('Noticias de Arándanos Fresh Pick', 'Fresh Pick Blueberry News')}` : t('Artículo no encontrado | Fresh Pick', 'Article not found | Fresh Pick'),
    description: article?.metaDescription ?? t('Este artículo no existe o fue movido. Explora las noticias de arándanos de Fresh Pick.', 'This article does not exist or was moved. Explore Fresh Pick blueberry news.'),
    path: `/noticias/${slug}`,
    image: article?.image,
    type: 'article'
  });

  if (!article) {
    return (
      <SiteShell>
        <NotFoundContent
          title={t('No encontramos este artículo', 'We could not find this article')}
          text={t('Puede que haya cambiado de nombre. Explora todas las noticias de arándanos.', 'It may have been renamed. Explore all blueberry news.')}
          href="/noticias"
          linkLabel={t('Ver noticias de arándanos', 'See blueberry news')}
        />
      </SiteShell>
    );
  }

  const category = blogCategoriesFor(lang).find(c => c.id === article.category)!;
  const relatedRecipes = (article.relatedRecipes ?? [])
    .map(getRecipeSummary)
    .filter((r): r is RecipeSummary => Boolean(r));
  const moreArticles = articleIndex().filter(a => a.slug !== article.slug).slice(0, 3);

  return (
    <SiteShell>
      <FloatingBuyButton />
      <article>
        <header className="fp-gradient-hero border-b border-stone-200/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
            <Breadcrumbs
              items={[
                { label: t('Inicio', 'Home'), href: '/' },
                { label: t('Noticias de Arándanos', 'Blueberry News'), href: '/noticias' },
                { label: category.name, href: `/noticias/categoria/${category.id}` },
                { label: article.title }
              ]}
            />
            <a
              href={`/noticias/categoria/${category.id}`}
              className="mt-6 inline-block text-xs font-bold uppercase tracking-wider text-[#7B4382] hover:text-[#2F183C]"
            >
              {category.name}
            </a>
            <h1 className="mt-2 text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight font-display leading-tight">
              {article.title}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-stone-700 leading-relaxed">{article.excerpt}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-stone-600">
              <span className="font-semibold text-[#2F183C]">{article.author}</span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-[#7B4382]" />
                <time dateTime={article.date}>{formatArticleDate(article.date, lang)}</time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#7B4382]" />
                {t(`${article.readMinutes} min de lectura`, `${article.readMinutes} min read`)}
              </span>
            </div>

            <ShareButtons
              className="mt-5"
              url={`/noticias/${article.slug}`}
              title={article.title}
              text={article.excerpt}
            />
          </div>
        </header>

        <div className="bg-[#F7F5F0]/90">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <figure>
              <div className="rounded-2xl overflow-hidden shadow-xl shadow-[#2F183C]/15 border-4 border-white aspect-[16/9]">
                <ContentImage src={article.image} alt={article.imageAlt} label={category.name} eager />
              </div>
              {article.image && article.imagenCredit && <ImageCredit text={article.imagenCredit} />}
            </figure>

            <div className="mt-10 bg-white rounded-2xl border border-[#EADBEE] p-5 sm:p-10 shadow-sm">
              <div className="max-w-2xl mx-auto">
                {article.blocks.map((block, i) => (
                  <React.Fragment key={i}>
                    <Block block={block} />
                    {i === Math.min(3, article.blocks.length - 2) && article.blocks.length > 6 && (
                      <div className="mt-8">
                        <OrderCta compact title={t('Pruébalos tú mismo', 'Try them yourself')} text={t('Arándanos de alta montaña cosechados a mano. Entregas martes y miércoles.', 'Hand-picked high-mountain blueberries. Deliveries on Tuesdays and Wednesdays.')} whatsappMessage={t(`Hola Fresh Pick, leí "${article.title}" y quiero pedir arándanos frescos`, `Hello Fresh Pick, I read "${article.title}" and would like to order fresh blueberries`)} />
                      </div>
                    )}
                  </React.Fragment>
                ))}

                {article.fuentes && article.fuentes.length > 0 && <Sources sources={article.fuentes} />}

                <p className="mt-10 pt-5 border-t border-[#EADBEE] text-xs text-stone-500 leading-relaxed">
                  {t('Este contenido es informativo y no reemplaza la consulta con un profesional de la salud.', 'This content is for information only and does not replace consultation with a health professional.')}
                </p>
              </div>
            </div>

            <div className="mt-10" id="cta-final">
              <OrderCta
                title={t('Disfruta los beneficios con arándanos Fresh Pick', 'Enjoy the benefits with Fresh Pick blueberries')}
                text={t('Cosechados a mano en su punto exacto de madurez, sin ceras artificiales y con su pruina natural intacta. Entregas martes y miércoles.', 'Hand-picked at exactly the right ripeness, with no artificial waxes and their natural bloom intact. Deliveries on Tuesdays and Wednesdays.')}
                whatsappMessage={t(`Hola Fresh Pick, leí "${article.title}" y quiero pedir arándanos frescos`, `Hello Fresh Pick, I read "${article.title}" and would like to order fresh blueberries`)}
              />
            </div>
          </div>

          {relatedRecipes.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <h2 className="text-xl sm:text-2xl font-bold font-display mb-6">{t('Recetas para ponerlo en práctica', 'Recipes to put it into practice')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedRecipes.map(r => <RecipeCard key={r.slug} recipe={r} />)}
              </div>
            </section>
          )}

          {moreArticles.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
              <h2 className="text-xl sm:text-2xl font-bold font-display mb-6">{t('Sigue leyendo', 'Keep reading')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {moreArticles.map(a => <ArticleCard key={a.slug} article={a} />)}
              </div>
            </section>
          )}
        </div>
      </article>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: article.title,
          description: article.metaDescription,
          ...(article.image ? { image: [article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`] } : {}),
          datePublished: article.date,
          dateModified: article.date,
          articleSection: category.name,
          author: { '@type': 'Organization', name: article.author },
          publisher: {
            '@type': 'Organization',
            name: 'Fresh Pick',
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.jpg` }
          },
          mainEntityOfPage: `${SITE_URL}${withLang(`/noticias/${article.slug}`, lang)}`
        }}
      />
    </SiteShell>
  );
}

const Sources: React.FC<{ sources: ContentSource[] }> = ({ sources }) => {
  const t = useT();
  const lang = useLang();
  return (
  <section className="mt-10 pt-6 border-t border-[#EADBEE]" aria-labelledby="fuentes-titulo">
    <h2 id="fuentes-titulo" className="flex items-center gap-2 text-lg font-bold font-display">
      <BookMarked className="w-5 h-5 text-[#7B4382]" />
      {t('Fuentes', 'Sources')}
    </h2>
    <ol className="mt-3 space-y-2.5 text-sm text-stone-700">
      {sources.map((s, i) => (
        <li key={i} className="flex gap-2.5 leading-relaxed">
          <span className="shrink-0 font-bold text-[#7B4382]">{i + 1}.</span>
          <span className="min-w-0">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-semibold text-[#2F183C] hover:text-[#7B4382] underline decoration-[#DFCEE6] underline-offset-2 break-words"
            >
              {s.titulo}
            </a>
            <span className="text-stone-500">
              {' '}· {s.medio}
              {s.fecha && <> · <time dateTime={s.fecha}>{formatArticleDate(s.fecha, lang)}</time></>}
              {s.idioma === 'en' && lang === 'es' && ' · (en inglés)'}
            </span>
          </span>
        </li>
      ))}
    </ol>
  </section>
  );
};

const Block: React.FC<{ block: BlogBlock }> = ({ block }) => {
  switch (block.type) {
    case 'h2':
      return <h2 className="mt-9 first:mt-0 text-xl sm:text-2xl font-bold font-display leading-snug">{block.text}</h2>;
    case 'h3':
      return <h3 className="mt-6 text-lg font-bold font-display">{block.text}</h3>;
    case 'p':
      return <p className="mt-4 first:mt-0 text-[15px] sm:text-base text-stone-700 leading-relaxed">{block.text}</p>;
    case 'ul':
      return (
        <ul className="mt-4 space-y-2 text-[15px] sm:text-base text-stone-700">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 leading-relaxed">
              <span className="text-[#7B4382] shrink-0" aria-hidden="true">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="mt-4 space-y-2 text-[15px] sm:text-base text-stone-700">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 leading-relaxed">
              <span className="shrink-0 font-bold text-[#7B4382]">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
    case 'quote':
      return (
        <blockquote className="mt-6 border-l-4 border-[#DDA83A] bg-[#FAF7F0] rounded-r-xl px-5 py-4 text-base sm:text-lg font-semibold italic text-[#2F183C]">
          {block.text}
        </blockquote>
      );
    case 'table':
      return (
        <div className="mt-5 overflow-x-auto rounded-xl border border-[#EADBEE]">
          <table className="w-full text-sm">
            {block.caption && <caption className="caption-bottom text-left text-xs text-stone-500 px-4 py-2">{block.caption}</caption>}
            <thead className="bg-[#2F183C] text-white">
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} scope="col" className="text-left font-semibold px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className={r % 2 ? 'bg-[#FAF7F0]' : 'bg-white'}>
                  {row.map((cell, c) => (
                    <td key={c} className={`px-4 py-2 ${c === 0 ? 'font-medium text-[#2F183C]' : 'text-stone-700'}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
};

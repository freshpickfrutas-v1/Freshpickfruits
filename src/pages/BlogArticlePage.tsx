import React from 'react';
import { Clock, CalendarDays } from 'lucide-react';
import { SiteShell } from '../components/SiteShell';
import { ContentImage } from '../components/ContentImage';
import { OrderCta } from '../components/OrderCta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { RecipeCard } from '../components/RecipeCard';
import { ArticleCard } from '../components/ArticleCard';
import { NotFoundContent } from './NotFoundContent';
import { formatArticleDate, getArticleBySlug, getBlogCategory, sortedArticles } from '../data/blog';
import { getRecipeBySlug } from '../data/recipes';
import { BlogBlock, Recipe } from '../types';
import { JsonLd, SITE_URL, usePageMeta } from '../lib/seo';

export default function BlogArticlePage({ slug }: { slug: string }) {
  const article = getArticleBySlug(slug);

  usePageMeta({
    title: article ? `${article.title} | Blog Fresh Pick` : 'Artículo no encontrado | Fresh Pick',
    description: article?.metaDescription ?? 'Este artículo no existe o fue movido. Explora el blog de Fresh Pick.',
    path: `/blog/${slug}`,
    image: article?.image,
    type: 'article'
  });

  if (!article) {
    return (
      <SiteShell>
        <NotFoundContent
          title="No encontramos este artículo"
          text="Puede que haya cambiado de nombre. Explora todos los artículos del blog."
          href="/blog"
          linkLabel="Ir al blog"
        />
      </SiteShell>
    );
  }

  const category = getBlogCategory(article.category);
  const relatedRecipes = (article.relatedRecipes ?? [])
    .map(getRecipeBySlug)
    .filter((r): r is Recipe => Boolean(r));
  const moreArticles = sortedArticles().filter(a => a.slug !== article.slug).slice(0, 3);

  return (
    <SiteShell>
      <article>
        <header className="fp-gradient-hero border-b border-stone-200/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
            <Breadcrumbs
              items={[
                { label: 'Inicio', href: '/' },
                { label: 'Blog', href: '/blog' },
                { label: category.name, href: `/blog?categoria=${category.id}` },
                { label: article.title }
              ]}
            />
            <a
              href={`/blog?categoria=${category.id}`}
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
                <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#7B4382]" />
                {article.readMinutes} min de lectura
              </span>
            </div>
          </div>
        </header>

        <div className="bg-[#F7F5F0]/90">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div className="rounded-2xl overflow-hidden shadow-xl shadow-[#2F183C]/15 border-4 border-white aspect-[16/9]">
              <ContentImage src={article.image} alt={article.imageAlt} label={category.name} eager />
            </div>

            <div className="mt-10 bg-white rounded-2xl border border-[#EADBEE] p-5 sm:p-10 shadow-sm">
              <div className="max-w-2xl mx-auto">
                {article.blocks.map((block, i) => <Block key={i} block={block} />)}

                <p className="mt-10 pt-5 border-t border-[#EADBEE] text-xs text-stone-500 leading-relaxed">
                  Este contenido es informativo y no reemplaza la consulta con un profesional de la salud.
                </p>
              </div>
            </div>

            <div className="mt-10">
              <OrderCta
                title="Disfruta los beneficios con arándanos Fresh Pick"
                text="Cosechados a mano en su punto exacto de madurez, sin ceras artificiales y con su pruina natural intacta. Entregas martes y miércoles."
                whatsappMessage={`Hola Fresh Pick, leí "${article.title}" y quiero pedir arándanos frescos`}
              />
            </div>
          </div>

          {relatedRecipes.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <h2 className="text-xl sm:text-2xl font-bold font-display mb-6">Recetas para ponerlo en práctica</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedRecipes.map(r => <RecipeCard key={r.slug} recipe={r} />)}
              </div>
            </section>
          )}

          {moreArticles.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
              <h2 className="text-xl sm:text-2xl font-bold font-display mb-6">Sigue leyendo</h2>
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
          mainEntityOfPage: `${SITE_URL}/blog/${article.slug}`
        }}
      />
    </SiteShell>
  );
}

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

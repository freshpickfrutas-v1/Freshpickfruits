import React from 'react';
import { FlaskConical, ArrowRight } from 'lucide-react';
import { sortedArticles } from '../data/blog';
import { ArticleCard } from './ArticleCard';

/** Home page teaser: the three newest articles on healthy living and research. */
export const LatestNews: React.FC = () => {
  const latest = sortedArticles().slice(0, 3);
  if (!latest.length) return null;

  return (
    <section id="noticias-home" className="py-12 sm:py-16 bg-[#F5ECF9]/90 backdrop-blur-[2px] border-b border-[#DFCEE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#2F183C] border border-[#DFCEE6] text-xs font-bold uppercase tracking-wider mb-3">
            <FlaskConical className="w-3.5 h-3.5 text-[#7B4382]" />
            <span>Vida saludable e investigación</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2F183C] tracking-tight font-display">
            Lo último sobre arándanos y bienestar
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-700">
            Artículos sobre estudios, hábitos y alimentación saludable, explicados en palabras sencillas.
          </p>
        </div>

        {/* Phones: horizontal swipe. Tablets and desktop: three columns. */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 -mx-4 px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible">
          {latest.map(article => (
            <div key={article.slug} className="flex snap-start shrink-0 w-[82%] sm:w-[55%] md:w-auto [&>*]:flex-1">
              <ArticleCard article={article} />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a href="/noticias" className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 fp-btn-primary text-sm">
            <span>Ver todos los artículos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
    </section>
  );
};

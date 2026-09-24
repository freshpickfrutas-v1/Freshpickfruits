import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import { BlogArticle } from '../types';
import { formatArticleDate, getBlogCategory } from '../data/blog';
import { ContentImage } from './ContentImage';

export const ArticleCard: React.FC<{ article: BlogArticle; large?: boolean }> = ({ article, large = false }) => {
  const category = getBlogCategory(article.category);

  return (
    <a
      href={`/blog/${article.slug}`}
      className={`bg-white rounded-2xl border border-[#EADBEE] shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col group ${large ? 'md:flex-row' : ''}`}
    >
      <div className={`relative overflow-hidden bg-stone-100 aspect-[16/9] ${large ? 'md:aspect-auto md:w-1/2 md:min-h-[18rem]' : ''}`}>
        <ContentImage
          src={article.image}
          alt={article.imageAlt}
          label={category.name}
          className="group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className={`p-5 flex-1 flex flex-col justify-between gap-4 ${large ? 'md:p-8' : ''}`}>
        <div>
          <span className="text-[11px] font-bold text-[#7B4382] uppercase tracking-wider">{category.name}</span>
          <h3 className={`font-bold text-[#2F183C] font-display mt-1 leading-snug ${large ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
            {article.title}
          </h3>
          <p className={`text-stone-600 mt-2 leading-relaxed ${large ? 'text-sm' : 'text-xs line-clamp-3'}`}>
            {article.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-[#EADBEE] flex items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-3 min-w-0">
            <time dateTime={article.date} className="truncate">{formatArticleDate(article.date)}</time>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              {article.readMinutes} min
            </span>
          </div>
          <span className="font-bold text-[#7B4382] group-hover:text-[#2F183C] flex items-center gap-0.5 shrink-0">
            Leer
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
};

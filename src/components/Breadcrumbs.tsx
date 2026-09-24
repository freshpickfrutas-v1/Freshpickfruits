import React from 'react';
import { ChevronRight } from 'lucide-react';
import { JsonLd, SITE_URL } from '../lib/seo';

export interface Crumb {
  label: string;
  href?: string;
}

/** Visible breadcrumb trail plus BreadcrumbList structured data. */
export const Breadcrumbs: React.FC<{ items: Crumb[] }> = ({ items }) => (
  <nav aria-label="Ruta de navegación" className="text-xs text-stone-500">
    <ol className="flex flex-wrap items-center gap-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-1 min-w-0">
          {i > 0 && <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />}
          {item.href ? (
            <a href={item.href} className="hover:text-[#7B4382] transition-colors">{item.label}</a>
          ) : (
            <span className="text-[#2F183C] font-semibold truncate max-w-[16rem]" aria-current="page">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.label,
          ...(item.href ? { item: `${SITE_URL}${item.href}` } : {})
        }))
      }}
    />
  </nav>
);

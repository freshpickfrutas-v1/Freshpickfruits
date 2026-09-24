import { BlogArticle, BlogCategory, BlogCategoryId } from '../types';

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 'beneficios-arandanos',
    name: 'Beneficios de los Arándanos',
    description: 'Qué aportan los arándanos a tu alimentación y por qué vale la pena incluirlos.'
  },
  {
    id: 'nutricion-ciencia',
    name: 'Nutrición y Ciencia',
    description: 'Datos nutricionales, antioxidantes y lo que dice la investigación.'
  },
  {
    id: 'salud-digestiva-bienestar',
    name: 'Salud Digestiva y Bienestar',
    description: 'Fibra, digestión y hábitos que te hacen sentir bien.'
  },
  {
    id: 'estilo-vida-saludable',
    name: 'Estilo de Vida Saludable',
    description: 'Ideas prácticas para comer mejor todos los días.'
  },
  {
    id: 'cultivo-origen',
    name: 'Cultivo y Origen',
    description: 'Cómo cultivamos en Guasca a más de 2.800 m.s.n.m. y lo que pasa en el mundo del arándano: cosechas, mercado y exportación.'
  }
];

// One JSON file per article in src/content/noticias/. New files are picked up automatically at build time.
const articleFiles = import.meta.glob<BlogArticle>('../content/noticias/*.json', { eager: true, import: 'default' });

/** Published articles (drafts are never shown). */
export const BLOG_ARTICLES: BlogArticle[] = Object.values(articleFiles).filter(a => a.estado !== 'borrador');

export function getBlogCategory(id: BlogCategoryId) {
  return BLOG_CATEGORIES.find(c => c.id === id)!;
}

export function getArticleBySlug(slug: string) {
  return BLOG_ARTICLES.find(a => a.slug === slug);
}

/** Articles sorted newest first. */
export function sortedArticles() {
  return [...BLOG_ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
}

export function formatArticleDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

import { BlogCategory, BlogCategoryId } from '../types';
import type { Lang } from '../lib/i18n';

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
    description: 'Cómo cultivamos en Guasca a más de 2.800 m.s.n.m. y el origen de los arándanos Fresh Pick.'
  }
];

const BLOG_CATEGORIES_EN: Record<string, { name: string; description: string }> = {
  'beneficios-arandanos': { name: 'Blueberry Benefits', description: 'What blueberries add to your diet and why they are worth including.' },
  'nutricion-ciencia': { name: 'Nutrition and Science', description: 'Nutrition facts, antioxidants and what the research says.' },
  'salud-digestiva-bienestar': { name: 'Digestive Health and Wellness', description: 'Fiber, digestion and habits that make you feel good.' },
  'estilo-vida-saludable': { name: 'Healthy Lifestyle', description: 'Practical ideas to eat better every day.' },
  'cultivo-origen': { name: 'Growing and Origin', description: 'How we farm in Guasca above 2,800 m and where Fresh Pick blueberries come from.' }
};

export const blogCategoriesFor = (lang: Lang): BlogCategory[] =>
  BLOG_CATEGORIES.map(c => (lang === 'en' && BLOG_CATEGORIES_EN[c.id] ? { ...c, ...BLOG_CATEGORIES_EN[c.id] } : c));

export function getBlogCategory(id: BlogCategoryId) {
  return BLOG_CATEGORIES.find(c => c.id === id)!;
}

export function formatArticleDate(iso: string, lang: Lang = 'es') {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

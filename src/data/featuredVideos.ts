// Videos destacados, revisados a mano con las mismas reglas que el filtro de Gemini
// (canal independiente, en español, sin marcas competidoras). Solo se incrustan: no se alojan aquí.
export interface FeaturedVideo {
  id: string;
  title: string;
  channel: string;
}

const FIJOS: Record<'recetas' | 'noticias', FeaturedVideo[]> = {
  recetas: [
    { id: '4R2TAOFsGhE', title: 'Smoothie de arándanos con solo 4 ingredientes', channel: 'Tu Amiga Gourmet' },
    { id: 'hZcASXmVCGI', title: 'Desayuno saludable: yogurt de avena con frutos rojos', channel: 'Pimienta TV' },
    { id: 'b61GIRRfq2o', title: 'Batido antioxidante de arándanos y plátano', channel: 'Postres Originales' }
  ],
  noticias: [
    { id: '6ZVpQEQKy1Q', title: 'Los arándanos, un súper alimento lleno de beneficios', channel: 'Dr. Carlos Jaramillo' },
    { id: 'UmBfo4GKdfg', title: 'Los beneficios reales de los arándanos', channel: 'Dr. Carlos Jaramillo' },
    { id: 'Jr1DFMijGG4', title: 'Por qué deberías comer arándanos', channel: 'Webmedy Español' },
    { id: 'EAr8IPnDqJw', title: 'Los beneficios de tomar arándanos por las mañanas', channel: 'Escuela Online de Salud' }
  ]
};

// Videos que la automatización diaria publica cuando no sale una receta o una noticia (src/content/videos/*.json).
interface VideoDelDia extends FeaturedVideo {
  seccion: 'recetas' | 'noticias';
  date: string;
}
const delDia = Object.values(import.meta.glob<VideoDelDia>('../content/videos/*.json', { eager: true, import: 'default' }))
  .sort((a, b) => b.date.localeCompare(a.date));

/** Los más recientes de relleno primero, luego los destacados fijos. */
export const FEATURED_VIDEOS: Record<'recetas' | 'noticias', FeaturedVideo[]> = {
  recetas: [...delDia.filter(v => v.seccion === 'recetas'), ...FIJOS.recetas],
  noticias: [...delDia.filter(v => v.seccion === 'noticias'), ...FIJOS.noticias]
};

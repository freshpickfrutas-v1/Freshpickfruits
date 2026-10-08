// Videos destacados, revisados a mano con las mismas reglas que el filtro de Gemini
// (canal independiente, en español, sin marcas competidoras). Solo se incrustan: no se alojan aquí.
export interface FeaturedVideo {
  id: string;
  title: string;
  channel: string;
}

export const FEATURED_VIDEOS: Record<'recetas' | 'noticias', FeaturedVideo[]> = {
  recetas: [
    { id: '4R2TAOFsGhE', title: 'Smoothie de arándanos con solo 4 ingredientes', channel: 'Tu Amiga Gourmet' },
    { id: 'hZcASXmVCGI', title: 'Desayuno saludable: yogurt de avena con frutos rojos', channel: 'Pimienta TV' },
    { id: 'b61GIRRfq2o', title: 'Batido antioxidante de arándanos y plátano', channel: 'Postres Originales' }
  ],
  noticias: [
    { id: 'UmBfo4GKdfg', title: 'Los beneficios reales de los arándanos', channel: 'Dr. Carlos Jaramillo' },
    { id: 'Jr1DFMijGG4', title: 'Por qué deberías comer arándanos', channel: 'Webmedy Español' },
    { id: 'EAr8IPnDqJw', title: 'Los beneficios de tomar arándanos por las mañanas', channel: 'Escuela Online de Salud' }
  ]
};

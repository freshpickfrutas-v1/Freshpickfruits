// Pasarela de pago en línea activa en el navegador. Bold tiene prioridad: si VITE_BOLD_API_KEY está cargada se usa Bold;
// si no, Wompi (VITE_WOMPI_PUBLIC_KEY); sin ninguna solo hay transferencia o Bre-B por WhatsApp.
export type Gateway = 'bold' | 'wompi';

const has = (v: unknown) => typeof v === 'string' && v.trim() !== '';

export const ONLINE_GATEWAY: Gateway | null = has(import.meta.env.VITE_BOLD_API_KEY)
  ? 'bold'
  : has(import.meta.env.VITE_WOMPI_PUBLIC_KEY)
    ? 'wompi'
    : null;

export const GATEWAY_NAME: Record<Gateway, string> = { bold: 'Bold', wompi: 'Wompi' };

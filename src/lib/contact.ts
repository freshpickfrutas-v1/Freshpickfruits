/** WhatsApp de Fresh Pick y enlace con mensaje prellenado. */
export const WHATSAPP_NUMBER = '573178931026';
export const WHATSAPP_DISPLAY = '+57 317 893 1026';
export const CONTACT_EMAIL = 'info@freshpickfruits.com';

export const waLink = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/** Ventas al por mayor: los pedidos se hacen solo por correo y deben llegar a ambos buzones. */
export const WHOLESALE_EMAILS = ['gerenciaandean@gmail.com', 'gerencia@naugroupsas.com'];

export const WHOLESALE_CONTACTS = {
  colombia: [
    { phone: '+573015256929', display: '+57 301 525 6929', email: 'comercialzona2@naugroupsas.com' },
    { phone: '+573002135078', display: '+57 300 213 5078', email: 'gerencia@naugroupsas.com' }
  ],
  world: [
    { phone: '+573002135078', display: '+57 300 213 5078', email: 'gerencia@naugroupsas.com' },
    { phone: '+573002135078', display: '+57 300 213 5078', email: 'gerenciaandean@gmail.com' }
  ]
};

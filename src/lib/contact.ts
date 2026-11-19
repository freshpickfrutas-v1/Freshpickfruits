/** WhatsApp de Fresh Pick y enlace con mensaje prellenado. */
export const WHATSAPP_NUMBER = '573178931026';
export const WHATSAPP_DISPLAY = '+57 317 893 1026';
export const CONTACT_EMAIL = 'info@freshpickfruits.com';

export const waLink = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/**
 * Ventas al por mayor: los pedidos se hacen solo por correo y el mensaje llega a los dos correos del mercado.
 * En español (ventas nacionales) y en inglés (International Wholesale) los destinatarios y WhatsApp son distintos.
 */
export const WHOLESALE_CONTACTS = {
  colombia: {
    emails: ['gerencia@naugroupsas.com', 'comercialzona2@naugroupsas.com'],
    whatsapps: [
      { phone: '573002135078', display: '+57 300 213 5078' },
      { phone: '573015256929', display: '+57 301 525 6929' }
    ]
  },
  world: {
    emails: ['gerencia@naugroupsas.com', 'gerenciaandean@gmail.com'],
    whatsapps: [
      { phone: '573002135078', display: '+57 300 213 5078' },
      { phone: '573143305110', display: '+57 314 330 5110' }
    ]
  }
};

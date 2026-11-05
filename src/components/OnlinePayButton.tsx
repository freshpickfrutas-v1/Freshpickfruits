import React from 'react';
import { ONLINE_GATEWAY } from '../lib/gateway';
import { BoldPayButton } from './BoldPayButton';
import { WompiPayButton } from './WompiPayButton';

interface Props {
  orderId: string;
  customer: { name: string; email: string; phone: string };
}

/** Botón de pago de la pasarela activa en el despliegue (Bold o Wompi). */
export const OnlinePayButton: React.FC<Props> = props =>
  ONLINE_GATEWAY === 'bold' ? <BoldPayButton {...props} /> : ONLINE_GATEWAY === 'wompi' ? <WompiPayButton {...props} /> : null;

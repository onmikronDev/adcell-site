import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/data/brand';
import { CartFloat } from '@/components/cart-float';

const WHATSAPP_NUMBER = '5511999999999';

export function WhatsappFloat() {
  return (
    <div className="float-actions">
      <CartFloat />
      <a
        className="wa-float"
        href={whatsappLink(WHATSAPP_NUMBER, 'Olá, ADCELL CASE! Quero falar com a loja.')}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={22} /> WhatsApp
      </a>
    </div>
  );
}

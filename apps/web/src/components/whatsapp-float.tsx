import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/data/brand';
import pb from '@/lib/pocketbase-client';
import { CartFloat } from '@/components/cart-float';

export function WhatsappFloat() {
  const [phone, setPhone] = useState('');
  useEffect(() => { pb.collection('store_settings').getList(1, 1).then(data => setPhone(String(data.items[0]?.whatsapp || ''))).catch(() => setPhone('')); }, []);
  return <div className="float-actions"><CartFloat />{phone && <a className="wa-float" href={whatsappLink(phone, 'Olá, ADCELL CASE! Quero falar com a loja.')} target="_blank" rel="noreferrer"><MessageCircle size={22} /> WhatsApp</a>}</div>;
}

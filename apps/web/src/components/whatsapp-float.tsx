import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/data/brand';
import pb from '@/lib/pocketbase-client';
export function WhatsappFloat() {
  const [phone, setPhone] = useState('');
  useEffect(() => { pb.collection('store_settings').getList(1, 1).then(data => setPhone(String(data.items[0]?.whatsapp || ''))).catch(() => setPhone('')); }, []);
  if (!phone) return null;
  return <a className="wa-float" href={whatsappLink(phone, 'Olá, ADCELL CASE! Quero falar com a loja.')} target="_blank" rel="noreferrer"><MessageCircle size={22} /> WhatsApp</a>;
}

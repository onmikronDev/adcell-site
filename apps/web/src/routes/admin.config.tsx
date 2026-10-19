import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase-client';
type Settings = { id: string; whatsapp: string; instagram: string; facebook: string; address: string; maps_url: string; hours: string };
type Review = { id: string; name: string; text: string; rating: number; published: boolean };
export default function ConfigPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState('');
  useEffect(() => {
    pb.collection('store_settings').getList<Settings>(1, 1).then(data => setSettings(data.items[0] || null));
    pb.collection('testimonials').getFullList<Review>({ sort: '-created' }).then(setReviews).catch(() => setMessage('Não foi possível carregar avaliações.'));
  }, []);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    const data = new FormData(event.currentTarget);
    await pb.collection('store_settings').update(settings.id, Object.fromEntries(data.entries()));
    setMessage('Dados da loja atualizados.');
  }
  async function addReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await pb.collection('testimonials').create({ name: data.get('name'), text: data.get('text'), rating: Number(data.get('rating')), published: true });
    event.currentTarget.reset();
    setReviews(await pb.collection('testimonials').getFullList<Review>({ sort: '-created' }));
  }
  if (!settings) return <p>Carregando configurações…</p>;
  return <><h1>Loja e avaliações</h1><form onSubmit={save} className="admin-form"><label className="field">WhatsApp (DDI+DDD+número)<input name="whatsapp" defaultValue={settings.whatsapp} required /></label><label className="field">Endereço<textarea name="address" defaultValue={settings.address} rows={2} /></label><label className="field">Link do mapa<input name="maps_url" defaultValue={settings.maps_url} /></label><label className="field">Horário<input name="hours" defaultValue={settings.hours} /></label><label className="field">Instagram<input name="instagram" defaultValue={settings.instagram} /></label><label className="field">Facebook<input name="facebook" defaultValue={settings.facebook} /></label><button className="button button-red" type="submit">Salvar</button><p className="form-message success">{message}</p></form><h2>Depoimentos</h2><form onSubmit={addReview} className="admin-form"><label className="field">Nome<input name="name" required /></label><label className="field">Avaliação<textarea name="text" required /></label><label className="field">Nota<select name="rating"><option>5</option><option>4</option><option>3</option></select></label><button className="button" type="submit">Publicar</button></form><ul className="admin-list">{reviews.map(item => <li key={item.id}><span>{item.name} · {item.rating}</span><p>{item.text}</p></li>)}</ul></>;
}

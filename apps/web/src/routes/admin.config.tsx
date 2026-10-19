import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import { query, execute, queryOne } from '@/db.server';

type Settings = { id: number; whatsapp: string; instagram: string; facebook: string; address: string; maps_url: string; hours: string };
type Review = { id: number; name: string; text: string; rating: number };

export async function loader() {
  const settings = (await queryOne<any>('SELECT * FROM store_settings ORDER BY id ASC LIMIT 1')) || null;
  const reviews = await query<any>('SELECT id, name, text, rating FROM testimonials ORDER BY created DESC LIMIT 50');
  return {
    settings: settings
      ? { ...settings, id: Number(settings.id) }
      : null,
    reviews: reviews.map((r) => ({ id: r.id, name: r.name, text: r.text, rating: r.rating })),
  };
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const intent = String(form.get('intent') || '');

  if (intent === 'save_settings') {
    const existing = await queryOne<any>('SELECT id FROM store_settings ORDER BY id ASC LIMIT 1');
    const values = [
      String(form.get('whatsapp') || ''),
      String(form.get('instagram') || ''),
      String(form.get('facebook') || ''),
      String(form.get('address') || ''),
      String(form.get('maps_url') || ''),
      String(form.get('hours') || ''),
    ];
    if (existing) {
      await execute(
        'UPDATE store_settings SET whatsapp=?, instagram=?, facebook=?, address=?, maps_url=?, hours=? WHERE id=?',
        [...values, existing.id],
      );
    } else {
      await execute(
        'INSERT INTO store_settings (whatsapp, instagram, facebook, address, maps_url, hours) VALUES (?, ?, ?, ?, ?, ?)',
        values,
      );
    }
    return { ok: true, message: 'Dados da loja atualizados.' };
  }

  if (intent === 'add_review') {
    await execute(
      'INSERT INTO testimonials (name, text, rating, published) VALUES (?, ?, ?, 1)',
      [String(form.get('name') || ''), String(form.get('text') || ''), Number(form.get('rating') || 5)],
    );
    return { ok: true, message: 'Depoimento publicado.' };
  }

  return { error: 'Ação desconhecida.' };
}

export default function ConfigPage() {
  const fetcher = useFetcher<typeof action>();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const res = await fetch('/admin/config').then((r) => r.json());
    setSettings(res.settings);
    setReviews(res.reviews ?? []);
  }

  useEffect(() => {
    load().catch(() => setMessage('Não foi possível carregar as configurações.'));
  }, []);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const data = fetcher.data as { message?: string; error?: string };
      setMessage(data.message || data.error || '');
      if (!data.error) load();
    }
  }, [fetcher.state, fetcher.data]);

  if (!settings) return <p>Carregando configurações…</p>;

  return (
    <>
      <h1>Loja e avaliações</h1>
      <fetcher.Form method="post" className="admin-form">
        <input type="hidden" name="intent" value="save_settings" />
        <label className="field">WhatsApp (DDI+DDD+número)<input name="whatsapp" defaultValue={settings.whatsapp} required /></label>
        <label className="field">Endereço<textarea name="address" defaultValue={settings.address} rows={2} /></label>
        <label className="field">Link do mapa<input name="maps_url" defaultValue={settings.maps_url} /></label>
        <label className="field">Horário<input name="hours" defaultValue={settings.hours} /></label>
        <label className="field">Instagram<input name="instagram" defaultValue={settings.instagram} /></label>
        <label className="field">Facebook<input name="facebook" defaultValue={settings.facebook} /></label>
        <button className="button button-red" type="submit">Salvar</button>
        <p className="form-message success">{message}</p>
      </fetcher.Form>
      <h2>Depoimentos</h2>
      <fetcher.Form method="post" className="admin-form">
        <input type="hidden" name="intent" value="add_review" />
        <label className="field">Nome<input name="name" required /></label>
        <label className="field">Avaliação<textarea name="text" required /></label>
        <label className="field">Nota<select name="rating"><option>5</option><option>4</option><option>3</option></select></label>
        <button className="button" type="submit">Publicar</button>
      </fetcher.Form>
      <ul className="admin-list">
        {reviews.map((item) => (
          <li key={item.id}><span>{item.name} · {item.rating}</span><p>{item.text}</p></li>
        ))}
      </ul>
    </>
  );
}

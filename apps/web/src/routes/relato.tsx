import { useState } from 'react';
import type { Route } from './+types/relato';
import { seo } from '@/lib/seo';
import { LOGO, PHONE_BRANDS, PHONE_MODELS, whatsappLink } from '@/data/brand';
import { pocketbaseClient } from '@/lib/pocketbase-client';
import { loadSettings } from '@/lib/inventory.server';
export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, { title: 'Relatar problema do celular — ADCELL CASE', description: 'Abra um chamado de assistência técnica com nome, WhatsApp, e-mail e o problema do aparelho.', image: LOGO });
}
export async function loader() { return { settings: await loadSettings() }; }
export default function Report({ loaderData }: Route.ComponentProps) {
  const [brand, setBrand] = useState('Samsung');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = { name: String(data.get('name')), whatsapp: String(data.get('whatsapp')), email: String(data.get('email')), brand: String(data.get('brand')), model: String(data.get('model')), problem: String(data.get('problem')), status: 'novo' };
    setBusy(true);
    try {
      await pocketbaseClient.collection('problem_reports').create(payload);
      const text = `Chamado ADCELL CASE\nNome: ${payload.name}\nWhatsApp: ${payload.whatsapp}\nE-mail: ${payload.email}\nAparelho: ${payload.brand} ${payload.model}\nProblema: ${payload.problem}`;
      window.open(whatsappLink(loaderData.settings.whatsapp, text), '_blank', 'noopener');
      setStatus('Chamado registrado. O WhatsApp da loja foi aberto com os dados.');
      form.reset();
    } catch {
      setStatus('Não foi possível registrar o chamado. Tente novamente.');
    } finally { setBusy(false); }
  }
  return <main className="section"><span className="eyebrow">ASSISTÊNCIA</span><h1>Relate o problema do seu aparelho</h1><p className="page-intro">O chamado fica no painel da loja e também pode ser enviado formatado no WhatsApp.</p><form onSubmit={submit} className="report-form"><label className="field">Nome completo<input name="name" required minLength={3} maxLength={120} /></label><div className="form-row"><label className="field">WhatsApp<input name="whatsapp" required placeholder="11999999999" /></label><label className="field">E-mail<input name="email" type="email" required /></label></div><div className="form-row"><label className="field">Marca<select name="brand" value={brand} onChange={event => setBrand(event.target.value)}>{PHONE_BRANDS.map(item => <option key={item}>{item}</option>)}</select></label><label className="field">Modelo<select name="model" required>{(PHONE_MODELS[brand] || ['Outro modelo']).map(item => <option key={item}>{item}</option>)}</select></label></div><label className="field">Relate o problema do seu aparelho<textarea name="problem" required minLength={10} rows={5} /></label><button className="button button-red" disabled={busy}>{busy ? 'Enviando…' : 'Enviar chamado'}</button><p className="form-message" role="status">{status}</p></form></main>;
}

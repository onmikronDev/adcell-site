import { useState } from 'react';
import { useFetcher } from 'react-router';
import type { Route } from './+types/relato';
import { seo } from '@/lib/seo';
import { LOGO, PHONE_BRANDS, PHONE_MODELS, whatsappLink } from '@/data/brand';
import { loadSettings } from '@/lib/inventory.server';
import { execute } from '@/db.server';

export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, { title: 'Relatar problema do celular — ADCELL CASE', description: 'Abra um chamado de assistência técnica com nome, WhatsApp, e-mail e o problema do aparelho.', image: LOGO });
}

export async function loader() {
  return { settings: await loadSettings() };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const payload = {
    name: String(form.get('name') || '').trim(),
    whatsapp: String(form.get('whatsapp') || '').trim(),
    email: String(form.get('email') || '').trim(),
    brand: String(form.get('brand') || ''),
    model: String(form.get('model') || ''),
    problem: String(form.get('problem') || '').trim(),
  };
  if (!payload.name || !payload.whatsapp || !payload.problem) {
    return { error: 'Preencha os campos obrigatórios.' };
  }
  try {
    await execute(
      'INSERT INTO problem_reports (name, whatsapp, email, brand, model, problem, status) VALUES (?, ?, ?, ?, ?, ?, ?novo)',
      [payload.name, payload.whatsapp, payload.email, payload.brand, payload.model, payload.problem],
    );
    return { ok: true, payload };
  } catch {
    return { error: 'Não foi possível registrar o chamado. Tente novamente.' };
  }
}

export default function Report({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>();
  const [brand, setBrand] = useState('Samsung');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const data = fetcher.data as { ok?: boolean; error?: string; payload?: any };
      if (data.error) {
        setStatus(data.error);
      } else if (data.ok && data.payload) {
        const p = data.payload;
        const text = `Chamado ADCELL CASE\nNome: ${p.name}\nWhatsApp: ${p.whatsapp}\nE-mail: ${p.email}\nAparelho: ${p.brand} ${p.model}\nProblema: ${p.problem}`;
        window.open(whatsappLink(loaderData.settings.whatsapp || '5511999999999', text), '_blank', 'noopener');
        setStatus('Chamado registrado. O WhatsApp da loja foi aberto com os dados.');
      }
    }
  }, [fetcher.state, fetcher.data, loaderData.settings.whatsapp]);

  return <main className="section"><span className="eyebrow">ASSISTÊNCIA</span><h1>Relate o problema do seu aparelho</h1><p className="page-intro">O chamado fica no painel da loja e também pode ser enviado formatado no WhatsApp.</p><fetcher.Form method="post" className="report-form"><label className="field">Nome completo<input name="name" required minLength={3} maxLength={120} /></label><div className="form-row"><label className="field">WhatsApp<input name="whatsapp" required placeholder="11999999999" /></label><label className="field">E-mail<input name="email" type="email" required /></label></div><div className="form-row"><label className="field">Marca<select name="brand" value={brand} onChange={event => setBrand(event.target.value)}>{PHONE_BRANDS.map(item => <option key={item}>{item}</option>)}</select></label><label className="field">Modelo<select name="model" required>{(PHONE_MODELS[brand] || ['Outro modelo']).map(item => <option key={item}>{item}</option>)}</select></label></div><label className="field">Relate o problema do seu aparelho<textarea name="problem" required minLength={10} rows={5} /></label><button className="button button-red" disabled={fetcher.state !== 'idle'}>{fetcher.state !== 'idle' ? 'Enviando…' : 'Enviar chamado'}</button><p className="form-message" role="status">{status}</p></fetcher.Form></main>;
}

import { useEffect } from 'react';

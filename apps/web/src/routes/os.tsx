import { useFetcher } from 'react-router';
import type { Route } from './+types/os';
import { seo } from '@/lib/seo';
import { OS_STATUS, LOGO } from '@/data/brand';
import { query } from '@/db.server';

export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, { title: 'Consulta de ordem de serviço — ADCELL CASE', description: 'Consulte o status do conserto pelo número da O.S. ou pelo CPF.', image: LOGO, jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Consulta de O.S. ADCELL CASE' } });
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const raw = String(form.get('q') || '').trim().slice(0, 40);
  const digits = raw.replace(/\D/g, '');
  if (raw.length < 3) return { found: false, message: 'Informe o número da O.S. ou o CPF.' };
  try {
    const rows = await query<any>(
      digits.length >= 11
        ? 'SELECT os_number, status, brand, model, public_note, updated FROM service_orders WHERE cpf = ? OR os_number = ? ORDER BY updated DESC LIMIT 5'
        : 'SELECT os_number, status, brand, model, public_note, updated FROM service_orders WHERE os_number = ? ORDER BY updated DESC LIMIT 5',
      digits.length >= 11 ? [digits, raw] : [raw],
    );
    return {
      found: rows.length > 0,
      items: rows.map((item) => ({
        os: item.os_number,
        status: OS_STATUS[item.status as keyof typeof OS_STATUS] || item.status,
        device: `${item.brand ?? ''} ${item.model ?? ''}`.trim(),
        note: item.public_note || '',
      })),
    };
  } catch {
    return { found: false, message: 'Não foi possível consultar agora. Tente de novo.' };
  }
}

export default function OsLookup() {
  const fetcher = useFetcher<typeof action>();
  const result = fetcher.data;
  return <main className="section"><span className="eyebrow">ASSISTÊNCIA TÉCNICA</span><h1>Consulta de O.S.</h1><p className="page-intro">Digite o número da ordem de serviço ou o CPF informado no balcão.</p><fetcher.Form method="post" className="os-lookup"><label className="field">Número da O.S. ou CPF<input name="q" required placeholder="OS-0001 ou CPF" /></label><button className="button button-red" type="submit">{fetcher.state !== 'idle' ? 'Consultando…' : 'Consultar status'}</button></fetcher.Form>{result && !result.found && <p className="form-message" role="status">{result.message || 'Nenhuma ordem encontrada com esses dados.'}</p>}{result?.found && <ul className="os-results">{result.items?.map(item => <li key={item.os}><strong>{item.os}</strong><span className="status-pill">{item.status}</span><p>{item.device}</p>{item.note && <p>{item.note}</p>}</li>)}</ul>}</main>;
}

import { useState } from 'react';
import type { Route } from './+types/os';
import { seo } from '@/lib/seo';
import { OS_STATUS, LOGO } from '@/data/brand';

type OsResult = { found: boolean; message?: string; items?: { os: string; status: string; device: string; note: string }[] };

export function meta({ matches, location }: Route.MetaArgs) {
	return seo({ matches, location }, { title: 'Consulta de ordem de serviço — ADCELL CASE', description: 'Consulte o status do conserto pelo número da O.S. ou pelo CPF.', image: LOGO, jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Consulta de O.S. ADCELL CASE' } });
}

export default function OsLookup() {
	const [result, setResult] = useState<OsResult | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const q = String(new FormData(event.currentTarget).get('q') || '').trim();
		setLoading(true);
		setResult(null);
		try {
			const res = await fetch(`/api/os?q=${encodeURIComponent(q)}`);
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.message || 'Não foi possível consultar agora. Tente de novo.');
			setResult(data);
		} catch (e) {
			setResult({ found: false, message: e instanceof Error ? e.message : 'Não foi possível consultar agora. Tente de novo.' });
		} finally {
			setLoading(false);
		}
	}

	return <main className="section"><span className="eyebrow">ASSISTÊNCIA TÉCNICA</span><h1>Consulta de O.S.</h1><p className="page-intro">Digite o número da ordem de serviço ou o CPF informado no balcão.</p><form onSubmit={handleSubmit} className="os-lookup"><label className="field">Número da O.S. ou CPF<input name="q" required placeholder="OS-0001 ou CPF" /></label><button className="button button-red" type="submit" disabled={loading}>{loading ? 'Consultando…' : 'Consultar status'}</button></form>{result && !result.found && <p className="form-message" role="status">{result.message || 'Nenhuma ordem encontrada com esses dados.'}</p>}{result?.found && <ul className="os-results">{result.items?.map(item => <li key={item.os}><strong>{item.os}</strong><span className="status-pill">{item.status}</span><p>{item.device}</p>{item.note && <p>{item.note}</p>}</li>)}</ul>}</main>;
}

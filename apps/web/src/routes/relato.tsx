import { useEffect, useState } from 'react';
import type { Route } from './+types/relato';
import { seo } from '@/lib/seo';
import { LOGO, PHONE_BRANDS, PHONE_MODELS, whatsappLink } from '@/data/brand';

export function meta({ matches, location }: Route.MetaArgs) {
	return seo({ matches, location }, { title: 'Relatar problema do celular — ADCELL CASE', description: 'Abra um chamado de assistência técnica com nome, WhatsApp, e-mail e o problema do aparelho.', image: LOGO });
}

type Settings = { whatsapp?: string };

export default function Report() {
	const [settings, setSettings] = useState<Settings>({});
	const [brand, setBrand] = useState('Samsung');
	const [status, setStatus] = useState('');
	const [sending, setSending] = useState(false);

	useEffect(() => {
		fetch('/api/relato')
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (data?.settings) setSettings(data.settings);
			})
			.catch(() => {});
	}, []);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSending(true);
		setStatus('');
		const form = new FormData(event.currentTarget);
		const payload = {
			name: String(form.get('name') || '').trim(),
			whatsapp: String(form.get('whatsapp') || '').trim(),
			email: String(form.get('email') || '').trim(),
			brand: String(form.get('brand') || ''),
			model: String(form.get('model') || ''),
			problem: String(form.get('problem') || '').trim(),
		};
		try {
			const res = await fetch('/api/relato', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok || data.error) throw new Error(data.error || 'Não foi possível registrar o chamado. Tente novamente.');
			const text = `Chamado ADCELL CASE\nNome: ${payload.name}\nWhatsApp: ${payload.whatsapp}\nE-mail: ${payload.email}\nAparelho: ${payload.brand} ${payload.model}\nProblema: ${payload.problem}`;
			window.open(whatsappLink(settings.whatsapp || '5511999999999', text), '_blank', 'noopener');
			setStatus('Chamado registrado. O WhatsApp da loja foi aberto com os dados.');
		} catch (e) {
			setStatus(e instanceof Error ? e.message : 'Não foi possível registrar o chamado. Tente novamente.');
		} finally {
			setSending(false);
		}
	}

	return <main className="section"><span className="eyebrow">ASSISTÊNCIA</span><h1>Relate o problema do seu aparelho</h1><p className="page-intro">O chamado fica no painel da loja e também pode ser enviado formatado no WhatsApp.</p><form onSubmit={handleSubmit} className="report-form"><label className="field">Nome completo<input name="name" required minLength={3} maxLength={120} /></label><div className="form-row"><label className="field">WhatsApp<input name="whatsapp" required placeholder="11999999999" /></label><label className="field">E-mail<input name="email" type="email" required /></label></div><div className="form-row"><label className="field">Marca<select name="brand" value={brand} onChange={event => setBrand(event.target.value)}>{PHONE_BRANDS.map(item => <option key={item}>{item}</option>)}</select></label><label className="field">Modelo<select name="model" required>{(PHONE_MODELS[brand] || ['Outro modelo']).map(item => <option key={item}>{item}</option>)}</select></label></div><label className="field">Relate o problema do seu aparelho<textarea name="problem" required minLength={10} rows={5} /></label><button className="button button-red" disabled={sending}>{sending ? 'Enviando…' : 'Enviar chamado'}</button><p className="form-message" role="status">{status}</p></form></main>;
}

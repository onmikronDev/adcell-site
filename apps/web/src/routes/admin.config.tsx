import { useEffect, useState } from 'react';

type Settings = { id: number; whatsapp: string; instagram: string; facebook: string; address: string; maps_url: string; hours: string };
type Review = { id: number; name: string; text: string; rating: number };

const emptySettings = { whatsapp: '', instagram: '', facebook: '', address: '', maps_url: '', hours: '' };

export default function ConfigPage() {
	const [settings, setSettings] = useState<Settings | null>(null);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [message, setMessage] = useState('');
	const [saving, setSaving] = useState(false);
	const [review, setReview] = useState({ name: '', text: '', rating: '5' });

	async function load() {
		const res = await fetch('/api/admin/config');
		if (!res.ok) throw new Error('fetch failed');
		const data = await res.json();
		setSettings(data.settings ? { ...emptySettings, ...data.settings } : { ...emptySettings, id: 0 });
		setReviews(data.reviews ?? []);
	}

	useEffect(() => {
		load().catch(() => setMessage('Não foi possível carregar as configurações.'));
	}, []);

	async function save(payload: Record<string, unknown>) {
		setSaving(true);
		setMessage('');
		try {
			const res = await fetch('/api/admin/config', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok || data.error) throw new Error(data.error || 'Erro ao salvar.');
			setMessage(data.message || 'Salvo com sucesso.');
			await load();
		} catch (e) {
			setMessage(e instanceof Error ? e.message : 'Erro ao salvar.');
		} finally {
			setSaving(false);
		}
	}

	if (!settings) return <p>Carregando configurações…</p>;

	return (
		<>
			<h1>Loja e avaliações</h1>
			<form
				className="admin-form"
				onSubmit={(event) => {
					event.preventDefault();
					const form = new FormData(event.currentTarget);
					save({
						intent: 'save_settings',
						whatsapp: form.get('whatsapp'),
						instagram: form.get('instagram'),
						facebook: form.get('facebook'),
						address: form.get('address'),
						maps_url: form.get('maps_url'),
						hours: form.get('hours'),
					});
				}}
			>
				<label className="field">WhatsApp (DDI+DDD+número)<input name="whatsapp" defaultValue={settings.whatsapp} required /></label>
				<label className="field">Endereço<textarea name="address" defaultValue={settings.address} rows={2} /></label>
				<label className="field">Link do mapa<input name="maps_url" defaultValue={settings.maps_url} /></label>
				<label className="field">Horário<input name="hours" defaultValue={settings.hours} /></label>
				<label className="field">Instagram<input name="instagram" defaultValue={settings.instagram} /></label>
				<label className="field">Facebook<input name="facebook" defaultValue={settings.facebook} /></label>
				<button className="button button-red" type="submit" disabled={saving}>Salvar</button>
				<p className="form-message success">{message}</p>
			</form>
			<h2>Depoimentos</h2>
			<form
				className="admin-form"
				onSubmit={(event) => {
					event.preventDefault();
					save({ intent: 'add_review', ...review });
				}}
			>
				<label className="field">Nome<input value={review.name} onChange={(e) => setReview({ ...review, name: e.currentTarget.value })} required /></label>
				<label className="field">Avaliação<textarea value={review.text} onChange={(e) => setReview({ ...review, text: e.currentTarget.value })} required /></label>
				<label className="field">Nota
					<select value={review.rating} onChange={(e) => setReview({ ...review, rating: e.currentTarget.value })}>
						<option>5</option><option>4</option><option>3</option>
					</select>
				</label>
				<button className="button" type="submit" disabled={saving}>Publicar</button>
			</form>
			<ul className="admin-list">
				{reviews.map((item) => (
					<li key={item.id}><span>{item.name} · {item.rating}</span><p>{item.text}</p></li>
				))}
			</ul>
		</>
	);
}

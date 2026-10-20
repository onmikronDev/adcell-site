import { useEffect, useState } from 'react';
import { CHECKLIST, OS_STATUS, PHONE_BRANDS, PHONE_MODELS } from '@/data/brand';

type Tech = { id: number; name: string };
type Order = { id: number; os_number: string; customer_name: string; status: string; brand: string; model: string; whatsapp: string };
type Event = { id: number; note: string; parts: string; status: string; author: string; created: string };

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [techs, setTechs] = useState<Tech[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [openId, setOpenId] = useState<number | null>(null);
	const [brand, setBrand] = useState('Samsung');
	const [error, setError] = useState('');
	const [techName, setTechName] = useState('');
	const open = orders.find((o) => o.id === openId) || null;

	async function load(osId?: number | null) {
		const query = osId ? `?os=${osId}` : '';
		const res = await fetch(`/api/admin/ordens${query}`);
		if (!res.ok) throw new Error('fetch failed');
		const data = await res.json();
		setOrders((data.orders ?? []).map((o: any) => ({ ...o, id: Number(o.id) })));
		setTechs((data.techs ?? []).map((t: any) => ({ ...t, id: Number(t.id) })));
		setEvents((data.events ?? []).map((e: any) => ({ ...e, id: Number(e.id) })));
	}

	useEffect(() => {
		load(openId).catch(() => setError('Falha ao carregar ordens.'));
	}, [openId]);

	async function save(payload: Record<string, unknown>) {
		setError('');
		try {
			const res = await fetch('/api/admin/ordens', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok || data.error) throw new Error(data.error || 'Erro ao salvar.');
			await load(openId);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Erro ao salvar.');
		}
	}

	return (
		<>
			<h1>Ordens de serviço</h1>
			<form
				className="inline-form"
				onSubmit={(event) => {
					event.preventDefault();
					save({ intent: 'add_tech', name: techName });
					setTechName('');
				}}
			>
				<input value={techName} onChange={(e) => setTechName(e.currentTarget.value)} required placeholder="Nome do técnico" aria-label="Nome do técnico" />
				<button className="button" type="submit">Adicionar técnico</button>
			</form>
			<form
				className="admin-form"
				onSubmit={(event) => {
					event.preventDefault();
					const form = new FormData(event.currentTarget);
					const checklist: Record<string, boolean> = {};
					CHECKLIST.forEach((item) => { checklist[item.key] = form.get(item.key) === 'on'; });
					save({
						intent: 'create_os',
						customer_name: form.get('customer_name'),
						cpf: form.get('cpf'),
						whatsapp: form.get('whatsapp'),
						email: form.get('email'),
						brand: form.get('brand'),
						model: form.get('model'),
						imei: form.get('imei'),
						problem: form.get('problem'),
						checklist,
						technician: form.get('technician'),
					});
				}}
			>
				<h2>Nova O.S.</h2>
				<div className="form-row">
					<label className="field">Cliente<input name="customer_name" required /></label>
					<label className="field">CPF<input name="cpf" /></label>
					<label className="field">WhatsApp<input name="whatsapp" required /></label>
				</div>
				<label className="field">E-mail<input name="email" type="email" /></label>
				<div className="form-row">
					<label className="field">Marca<select name="brand" value={brand} onChange={(e) => setBrand(e.target.value)}>{PHONE_BRANDS.map((item) => <option key={item}>{item}</option>)}</select></label>
					<label className="field">Modelo<select name="model">{(PHONE_MODELS[brand] || []).map((item) => <option key={item}>{item}</option>)}</select></label>
					<label className="field">IMEI / série<input name="imei" /></label>
				</div>
				<label className="field">Problema<textarea name="problem" required rows={3} /></label>
				<fieldset className="checklist">
					<legend>Checklist de entrada</legend>
					{CHECKLIST.map((item) => (
						<label key={item.key}><input type="checkbox" name={item.key} /> {item.label}</label>
					))}
				</fieldset>
				<label className="field">Técnico<select name="technician"><option value="">Não atribuído</option>{techs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
				<button className="button button-red" type="submit">Abrir O.S.</button>
			</form>
			{error && <p className="form-message">{error}</p>}
			<ul className="admin-list">
				{orders.map((order) => (
					<li key={order.id}>
						<button type="button" onClick={() => setOpenId(order.id)}>
							<strong>{order.os_number}</strong> {order.customer_name} · {OS_STATUS[order.status as keyof typeof OS_STATUS] || order.status}
						</button>
					</li>
				))}
			</ul>
			{open && (
				<form
					className="admin-form"
					onSubmit={(event) => {
						event.preventDefault();
						const form = new FormData(event.currentTarget);
						save({
							intent: 'update_os',
							id: open.id,
							status: form.get('status'),
							technician: form.get('technician'),
							public_note: form.get('public_note'),
							note: form.get('note'),
							parts: form.get('parts'),
						});
					}}
				>
					<h2>{open.os_number}</h2>
					<label className="field">Status<select name="status" defaultValue={open.status}>{Object.entries(OS_STATUS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
					<label className="field">Técnico<select name="technician"><option value="">Não atribuído</option>{techs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
					<label className="field">Nota visível ao cliente<input name="public_note" /></label>
					<label className="field">Observação interna<textarea name="note" rows={3} /></label>
					<label className="field">Peças utilizadas<input name="parts" /></label>
					<button className="button" type="submit">Registrar tramitação</button>
					<ul className="admin-list">
						{events.map((item) => (
							<li key={item.id}>
								<span>{OS_STATUS[item.status as keyof typeof OS_STATUS] || item.status} · {item.author}</span>
								<p>{item.note} {item.parts}</p>
							</li>
						))}
					</ul>
				</form>
			)}
		</>
	);
}

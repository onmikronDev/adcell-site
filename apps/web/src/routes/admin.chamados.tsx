import { useEffect, useState } from 'react';

type Ticket = { id: number; name: string; whatsapp: string; email: string; brand: string; model: string; problem: string; status: string };

export default function TicketsPage() {
	const [rows, setRows] = useState<Ticket[]>([]);
	const [error, setError] = useState('');

	async function load() {
		const res = await fetch('/api/admin/chamados');
		if (!res.ok) throw new Error('fetch failed');
		const data = await res.json();
		setRows(data.tickets ?? []);
	}

	async function updateTicket(id: number, status: string) {
		const res = await fetch('/api/admin/chamados', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, status }),
		});
		if (!res.ok) {
			setError('Não foi possível atualizar o chamado.');
			return;
		}
		setError('');
		await load();
	}

	useEffect(() => {
		load().catch(() => setError('Chamados indisponíveis.'));
	}, []);

	return (
		<>
			<h1>Chamados</h1>
			{error && <p className="form-message">{error}</p>}
			<ul className="admin-list">
				{rows.map((row) => (
					<li key={row.id}>
						<div>
							<strong>{row.name}</strong>
							<span>{row.brand} {row.model} · {row.whatsapp} · {row.email}</span>
							<p>{row.problem}</p>
						</div>
						<select
							aria-label="Status do chamado"
							value={row.status || 'novo'}
							onChange={(event) => updateTicket(row.id, event.currentTarget.value)}
						>
							<option value="novo">Novo</option>
							<option value="em_atendimento">Em atendimento</option>
							<option value="encerrado">Encerrado</option>
						</select>
					</li>
				))}
				{!rows.length && <li>Nenhum chamado ainda.</li>}
			</ul>
		</>
	);
}

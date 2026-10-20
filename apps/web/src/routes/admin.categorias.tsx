import { useEffect, useState } from 'react';

type Category = { id: number; name: string; kind: string };

const KINDS = [
	{ id: 'capinha', label: 'Capinha' },
	{ id: 'pelicula', label: 'Película' },
	{ id: 'outro', label: 'Outro' },
];

export default function CategoriesPage() {
	const [rows, setRows] = useState<Category[]>([]);
	const [editing, setEditing] = useState<Category | null>(null);
	const [name, setName] = useState('');
	const [kind, setKind] = useState('outro');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	async function load() {
		const res = await fetch('/api/admin/categorias');
		if (!res.ok) throw new Error('fetch failed');
		const data = await res.json();
		setRows(data.categories ?? []);
	}

	useEffect(() => {
		load().catch(() => setError('Falha ao carregar categorias.'));
	}, []);

	useEffect(() => {
		setName(editing?.name || '');
		setKind(editing?.kind || 'outro');
	}, [editing]);

	async function save(intent: 'create' | 'update' | 'delete', id?: number) {
		setSaving(true);
		setError('');
		try {
			const res = await fetch('/api/admin/categorias', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ intent, id, name, kind }),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok || data.error) throw new Error(data.error || 'Erro ao salvar categoria.');
			setEditing(null);
			setName('');
			setKind('outro');
			await load();
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Erro ao salvar categoria.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<>
			<h1>Categorias</h1>
			<form
				className="admin-form"
				onSubmit={(event) => {
					event.preventDefault();
					save(editing ? 'update' : 'create', editing?.id);
				}}
			>
				<div className="form-row">
					<label className="field">Nome<input value={name} onChange={(e) => setName(e.currentTarget.value)} required placeholder="Ex.: Capinhas Samsung" /></label>
					<label className="field">Tipo
						<select value={kind} onChange={(e) => setKind(e.currentTarget.value)}>
							{KINDS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
						</select>
					</label>
				</div>
				<button className="button" type="submit" disabled={saving}>
					{saving ? 'Salvando…' : editing ? 'Salvar alterações' : 'Criar categoria'}
				</button>
				{editing && <button type="button" className="text-link" onClick={() => setEditing(null)}>Cancelar edição</button>}
			</form>
			{error && <p className="form-message">{error}</p>}
			<ul className="admin-list">
				{rows.map((row) => (
					<li key={row.id}>
						<div>
							<strong>{row.name}</strong>
							<span>{KINDS.find((k) => k.id === row.kind)?.label || row.kind}</span>
						</div>
						<div>
							<button type="button" onClick={() => setEditing(row)}>Editar</button>
							<button type="button" onClick={() => save('delete', row.id)}>Excluir</button>
						</div>
					</li>
				))}
				{!rows.length && <li>Nenhuma categoria criada ainda.</li>}
			</ul>
		</>
	);
}

import { useEffect, useState } from 'react';
import { FILM_TYPES, money } from '@/data/brand';

type Category = { id: number; name: string; kind: string };
type Product = {
	id: number;
	title: string;
	brand: string;
	model: string;
	color: string;
	sku: string;
	stock: number;
	min_stock: number;
	sale_price: number;
	cost_price: number;
	film_type: string;
	description: string;
	photo: string;
	photo_file: string;
	category_id: number | null;
	active: boolean;
};

export default function ProductsPage() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [rows, setRows] = useState<Product[]>([]);
	const [editing, setEditing] = useState<Product | null>(null);
	const [kind, setKind] = useState('outro');
	const [error, setError] = useState('');
	const [saving, setSaving] = useState(false);
	const [photoPreview, setPhotoPreview] = useState('');

	async function load() {
		const res = await fetch('/api/admin/produtos');
		if (!res.ok) throw new Error('fetch failed');
		const data = await res.json();
		setCategories(data.categories ?? []);
		setRows(data.products ?? []);
	}

	useEffect(() => {
		load().catch(() => setError('Falha ao carregar produtos.'));
	}, []);

	function onCategory(id: string) {
		setKind(categories.find((item) => String(item.id) === id)?.kind || 'outro');
	}

	function onPhoto(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0] || null;
		setPhotoPreview(file ? URL.createObjectURL(file) : '');
		if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			setError('Use uma foto JPG, PNG ou WebP.');
		} else if (file && file.size > 5 * 1024 * 1024) {
			setError('A foto deve ter no máximo 5 MB.');
		} else {
			setError('');
		}
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaving(true);
		setError('');
		try {
			const form = new FormData(event.currentTarget);
			form.set('intent', editing ? 'update' : 'create');
			form.set('id', String(editing?.id || ''));
			const res = await fetch('/api/admin/produtos', { method: 'POST', body: form });
			const data = await res.json().catch(() => ({}));
			if (!res.ok || data.error) throw new Error(data.error || 'Erro ao salvar produto.');
			setEditing(null);
			setPhotoPreview('');
			await load();
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Erro ao salvar produto.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<>
			<h1>Produtos e estoque</h1>
			<form onSubmit={handleSubmit} className="admin-form" key={editing?.id || 'new'} encType="multipart/form-data">
				<label className="field">
					Categoria
					<select name="category_id" required defaultValue={editing?.category_id ?? ''} onChange={(e) => onCategory(e.target.value)}>
						<option value="">Selecione…</option>
						{categories.map((item) => (
							<option key={item.id} value={item.id}>{item.name}</option>
						))}
					</select>
				</label>
				<label className="field">Nome<input name="title" required defaultValue={editing?.title} /></label>
				<div className="form-row">
					<label className="field">Marca (opcional)<input name="brand" defaultValue={editing?.brand} placeholder="Ex.: Samsung" /></label>
					<label className="field">Modelo (opcional)<input name="model" defaultValue={editing?.model} placeholder="Ex.: Galaxy A15" /></label>
				</div>
				{kind === 'capinha' && <label className="field">Cor<input name="color" defaultValue={editing?.color} /></label>}
				{kind === 'pelicula' && (
					<label className="field">
						Tipo de película
						<select name="film_type" defaultValue={editing?.film_type}>
							{FILM_TYPES.map((item) => <option key={item}>{item}</option>)}
						</select>
					</label>
				)}
				<label className="field">
					Foto do produto (do PC)
					<input type="file" name="photo_file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} />
				</label>
				{photoPreview && <img src={photoPreview} alt="Prévia da foto" style={{ maxWidth: 160, borderRadius: 8, marginBottom: 12 }} />}
				<label className="field">Ou cole uma URL segura (https)<input name="photo" defaultValue={editing?.photo} placeholder="https://exemplo.com/foto.jpg" /></label>
				<div className="form-row">
					<label className="field">Preço de venda (R$)<input name="sale_price" type="number" min="0" step="0.01" required defaultValue={editing ? editing.sale_price / 100 : ''} /></label>
					<label className="field">SKU (opcional)<input name="sku" defaultValue={editing?.sku} placeholder="Ex.: CAP-SAM-A15-PT" /></label>
				</div>
				<div className="form-row">
					<label className="field">Estoque<input name="stock" type="number" min="0" required defaultValue={editing?.stock ?? 0} /></label>
					<label className="field">Mínimo de segurança<input name="min_stock" type="number" min="0" defaultValue={editing?.min_stock ?? 1} /></label>
				</div>
				<label className="field">Descrição<textarea name="description" rows={3} defaultValue={editing?.description} /></label>
				<button className="button" type="submit" disabled={saving}>
					{saving ? 'Salvando…' : editing ? 'Salvar alterações' : 'Cadastrar produto'}
				</button>
			</form>
			{error && <p className="form-message">{error}</p>}
			<ul className="admin-list">
				{rows.map((row) => (
					<li key={row.id} className={row.stock <= 1 ? 'low-stock' : ''}>
						<div>
							<strong>{row.title}</strong>
							<span>{[row.sku, row.brand, row.model].filter(Boolean).join(' · ') || 'Sem marca/modelo'} · {money(row.sale_price)} · estoque {row.stock}</span>
						</div>
						<button
							type="button"
							onClick={() => {
								setEditing(row);
								setPhotoPreview(row.photo || '');
							}}
						>
							Editar
						</button>
					</li>
				))}
			</ul>
		</>
	);
}

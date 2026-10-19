import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import { query, execute } from '@/db.server';
import { FILM_TYPES, money } from '@/data/brand';
import fs from 'node:fs';
import path from 'node:path';

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

export async function loader() {
  const cats = await query<any>(
    'SELECT id, name, kind FROM inventory_categories WHERE active = 1 ORDER BY name ASC',
  );
  const rows = await query<any>(
    'SELECT * FROM inventory_products ORDER BY id DESC LIMIT 200',
  );
  const categories: Category[] = cats.map((c) => ({ id: c.id, name: c.name, kind: c.kind ?? '' }));
  const products: Product[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    brand: r.brand ?? '',
    model: r.model ?? '',
    color: r.color ?? '',
    sku: r.sku ?? '',
    stock: r.stock ?? 0,
    min_stock: 1,
    sale_price: r.sale_price ?? 0,
    cost_price: 0,
    film_type: r.film_type ?? '',
    description: r.description ?? '',
    photo: r.photo ?? '',
    photo_file: r.photo_file ?? '',
    category_id: r.category_id ?? null,
    active: !!r.active,
  }));
  return { categories, products };
}

const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const intent = String(form.get('intent') || 'create');
  const id = Number(form.get('id') || 0);

  const title = String(form.get('title') || '').trim();
  if (!title) return { error: 'Informe o nome do produto.' };

  let photo = String(form.get('photo') || '').trim();
  const photoFile = form.get('photo_file') as File | null;

  if (photoFile && photoFile.size > 0) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(photoFile.type)) {
      return { error: 'Use uma foto JPG, PNG ou WebP.' };
    }
    if (photoFile.size > 5 * 1024 * 1024) {
      return { error: 'A foto deve ter no máximo 5 MB.' };
    }
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const ext = photoFile.type === 'image/png' ? 'png' : photoFile.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await photoFile.arrayBuffer());
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
    photo = `/uploads/${filename}`;
  }

  const values = {
    title,
    brand: String(form.get('brand') || '').trim(),
    model: String(form.get('model') || '').trim(),
    color: String(form.get('color') || '').trim(),
    sale_price: Math.round(Number(form.get('sale_price') || 0) * 100),
    sku: String(form.get('sku') || '').trim(),
    stock: Number(form.get('stock') || 0),
    film_type: String(form.get('film_type') || ''),
    description: String(form.get('description') || ''),
    category_id: Number(form.get('category_id')) || null,
    active: 1,
  };

  try {
    if (intent === 'update' && id) {
      await execute(
        `UPDATE inventory_products SET title=?, brand=?, model=?, color=?, sale_price=?, sku=?, stock=?, film_type=?, description=?, category_id=?${photo ? ', photo=?' : ''} WHERE id=?`,
        photo
          ? [values.title, values.brand, values.model, values.color, values.sale_price, values.sku, values.stock, values.film_type, values.description, values.category_id, photo, id]
          : [values.title, values.brand, values.model, values.color, values.sale_price, values.sku, values.stock, values.film_type, values.description, values.category_id, id],
      );
    } else {
      await execute(
        `INSERT INTO inventory_products (title, brand, model, color, sale_price, sku, stock, film_type, description, category_id, photo, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [values.title, values.brand, values.model, values.color, values.sale_price, values.sku, values.stock, values.film_type, values.description, values.category_id, photo || null],
      );
    }
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao salvar produto.' };
  }
}

export default function ProductsPage() {
  const fetcher = useFetcher<typeof action>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [kind, setKind] = useState('outro');
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');

  async function load() {
    const res = await fetch('/admin/produtos').then((r) => r.json());
    setCategories(res.categories ?? []);
    setRows(res.products ?? []);
  }

  useEffect(() => {
    load().catch(() => setError('Falha ao carregar produtos.'));
  }, []);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const data = fetcher.data as { error?: string };
      if (data.error) setError(data.error);
      else {
        setError('');
        setEditing(null);
        setPhotoPreview('');
        load();
      }
    }
  }, [fetcher.state, fetcher.data]);

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

  return (
    <>
      <h1>Produtos e estoque</h1>
      <fetcher.Form method="post" className="admin-form" key={editing?.id || 'new'} encType="multipart/form-data">
        <input type="hidden" name="intent" value={editing ? 'update' : 'create'} />
        <input type="hidden" name="id" value={editing?.id ?? ''} />
        <label className="field">
          Categoria
          <select
            name="category_id"
            required
            defaultValue={editing?.category_id ?? ''}
            onChange={(e) => onCategory(e.target.value)}
          >
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
        <button className="button" type="submit" disabled={fetcher.state !== 'idle'}>
          {fetcher.state !== 'idle' ? 'Salvando…' : editing ? 'Salvar alterações' : 'Cadastrar produto'}
        </button>
      </fetcher.Form>
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

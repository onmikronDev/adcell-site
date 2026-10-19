import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase-client';
import { FILM_TYPES, PHONE_BRANDS, PHONE_MODELS, money } from '@/data/brand';
type Category = { id: string; name: string; kind: string };
type Product = { id: string; title: string; brand: string; model: string; color: string; sku: string; stock: number; min_stock: number; sale_price: number; cost_price: number; film_type: string; description: string; photo: string; category: string[]; active: boolean };

const safeImageUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
};

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [kind, setKind] = useState('outro');
  const [brand, setBrand] = useState('Samsung');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  async function load() {
    const [cats, products] = await Promise.all([pb.collection('categories').getFullList<Category>({ sort: 'name', filter: 'active = true' }), pb.collection('inventory_products').getFullList<Product>({ sort: '-created' })]);
    setCategories(cats);
    setRows(products);
  }
  useEffect(() => { load().catch(() => setError('Falha ao carregar produtos.')); }, []);
  function onCategory(id: string) { setKind(categories.find(item => item.id === id)?.kind || 'outro'); }
  async function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Use uma foto JPG, PNG ou WebP.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('A foto deve ter no máximo 5 MB.'); return; }
    setUploading(true); setError('');
    try {
      const form = new FormData();
      form.append('photo', file);
      const created = await pb.collection('product_photos').create(form);
      const input = document.querySelector<HTMLInputElement>('input[name="photo"]');
      if (input) input.value = created.photo || '';
    } catch { setError('Não foi possível enviar a foto.'); } finally { setUploading(false); event.target.value = ''; }
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selected = data.getAll('category').map(String);
    const payload = { title: data.get('title'), brand: data.get('brand'), model: data.get('model'), color: data.get('color') || '', photo: safeImageUrl(String(data.get('photo') || '')), sale_price: Math.round(Number(data.get('sale_price')) * 100), cost_price: Math.round(Number(data.get('cost_price') || 0) * 100), sku: data.get('sku'), stock: Number(data.get('stock') || 0), min_stock: Number(data.get('min_stock') || 1), film_type: data.get('film_type') || '', description: data.get('description') || '', category: selected, active: true };
    try {
      if (editing) await pb.collection('inventory_products').update(editing.id, payload);
      else await pb.collection('inventory_products').create(payload);
      setEditing(null);
      event.currentTarget.reset();
      await load();
    } catch { setError('Confira os campos obrigatórios e se o SKU já existe.'); }
  }
  return <><h1>Produtos e estoque</h1><form onSubmit={save} className="admin-form" key={editing?.id || 'new'}><label className="field">Categorias<select name="category" multiple required defaultValue={editing?.category || []} onChange={event => onCategory(event.target.selectedOptions[0]?.value)}>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="field">Nome<input name="title" required defaultValue={editing?.title} /></label><div className="form-row"><label className="field">Marca<select name="brand" value={editing?.brand || brand} onChange={event => setBrand(event.target.value)}>{PHONE_BRANDS.map(item => <option key={item}>{item}</option>)}</select></label><label className="field">Modelo<select name="model" defaultValue={editing?.model}>{(PHONE_MODELS[editing?.brand || brand] || []).map(item => <option key={item}>{item}</option>)}</select></label></div>{kind === 'capinha' && <label className="field">Cor<input name="color" required defaultValue={editing?.color} /></label>}{kind === 'pelicula' && <label className="field">Tipo de película<select name="film_type" defaultValue={editing?.film_type}>{FILM_TYPES.map(item => <option key={item}>{item}</option>)}</select></label>}<label className="field">Foto do produto<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={uploading} /></label><label className="field">Ou cole uma URL segura (https)<input name="photo" defaultValue={editing?.photo} placeholder="https://exemplo.com/foto.jpg" /></label>{uploading && <p className="image-note">Enviando foto…</p>}<div className="form-row"><label className="field">Preço de venda (R$)<input name="sale_price" type="number" min="0" step="0.01" required defaultValue={editing ? editing.sale_price / 100 : ''} /></label><label className="field">Preço de custo (R$)<input name="cost_price" type="number" min="0" step="0.01" defaultValue={editing ? editing.cost_price / 100 : ''} /></label></div><div className="form-row"><label className="field">SKU<input name="sku" required defaultValue={editing?.sku} /></label><label className="field">Estoque<input name="stock" type="number" min="0" required defaultValue={editing?.stock ?? 0} /></label><label className="field">Mínimo de segurança<input name="min_stock" type="number" min="0" defaultValue={editing?.min_stock ?? 1} /></label></div><label className="field">Descrição<textarea name="description" rows={3} defaultValue={editing?.description} /></label><button className="button" type="submit">{editing ? 'Salvar alterações' : 'Cadastrar produto'}</button></form>{error && <p className="form-message">{error}</p>}<ul className="admin-list">{rows.map(row => <li key={row.id} className={row.stock <= row.min_stock ? 'low-stock' : ''}><div><strong>{row.title}</strong><span>{row.sku} · {row.brand} {row.model} · {money(row.sale_price)} · estoque {row.stock}{row.stock <= row.min_stock ? ' · abaixo do mínimo' : ''}</span></div><button type="button" onClick={() => { setEditing(row); setBrand(row.brand); }}>Editar</button></li>)}</ul></>;
}

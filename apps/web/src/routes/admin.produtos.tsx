import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase-client';
import { FILM_TYPES, PHONE_BRANDS, PHONE_MODELS, money } from '@/data/brand';
type Category = { id: string; name: string; kind: string };
type Product = { id: string; title: string; brand: string; model: string; color: string; sku: string; stock: number; min_stock: number; sale_price: number; cost_price: number; film_type: string; description: string; photo: string; category: string[]; active: boolean };
export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [kind, setKind] = useState('outro');
  const [brand, setBrand] = useState('Samsung');
  const [error, setError] = useState('');
  async function load() {
    const [cats, products] = await Promise.all([pb.collection('categories').getFullList<Category>({ sort: 'name', filter: 'active = true' }), pb.collection('inventory_products').getFullList<Product>({ sort: '-created' })]);
    setCategories(cats);
    setRows(products);
  }
  useEffect(() => { load().catch(() => setError('Falha ao carregar produtos.')); }, []);
  function onCategory(id: string) { setKind(categories.find(item => item.id === id)?.kind || 'outro'); }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selected = data.getAll('category').map(String);
    const payload = { title: data.get('title'), brand: data.get('brand'), model: data.get('model'), color: data.get('color') || '', photo: data.get('photo') || '', sale_price: Math.round(Number(data.get('sale_price')) * 100), cost_price: Math.round(Number(data.get('cost_price') || 0) * 100), sku: data.get('sku'), stock: Number(data.get('stock') || 0), min_stock: Number(data.get('min_stock') || 1), film_type: data.get('film_type') || '', description: data.get('description') || '', category: selected, active: true };
    try {
      if (editing) await pb.collection('inventory_products').update(editing.id, payload);
      else await pb.collection('inventory_products').create(payload);
      setEditing(null);
      event.currentTarget.reset();
      await load();
    } catch { setError('Confira os campos obrigatórios e se o SKU já existe.'); }
  }
  return <><h1>Produtos e estoque</h1><form onSubmit={save} className="admin-form" key={editing?.id || 'new'}><label className="field">Categorias<select name="category" multiple required defaultValue={editing?.category || []} onChange={event => onCategory(event.target.selectedOptions[0]?.value)}>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="field">Nome<input name="title" required defaultValue={editing?.title} /></label><div className="form-row"><label className="field">Marca<select name="brand" value={editing?.brand || brand} onChange={event => setBrand(event.target.value)}>{PHONE_BRANDS.map(item => <option key={item}>{item}</option>)}</select></label><label className="field">Modelo<select name="model" defaultValue={editing?.model}>{(PHONE_MODELS[editing?.brand || brand] || []).map(item => <option key={item}>{item}</option>)}</select></label></div>{kind === 'capinha' && <label className="field">Cor<input name="color" required defaultValue={editing?.color} /></label>}{kind === 'pelicula' && <label className="field">Tipo de película<select name="film_type" defaultValue={editing?.film_type}>{FILM_TYPES.map(item => <option key={item}>{item}</option>)}</select></label>}<label className="field">Foto (URL)<input name="photo" defaultValue={editing?.photo} placeholder="https://" /></label><div className="form-row"><label className="field">Preço de venda (R$)<input name="sale_price" type="number" min="0" step="0.01" required defaultValue={editing ? editing.sale_price / 100 : ''} /></label><label className="field">Preço de custo (R$)<input name="cost_price" type="number" min="0" step="0.01" defaultValue={editing ? editing.cost_price / 100 : ''} /></label></div><div className="form-row"><label className="field">SKU<input name="sku" required defaultValue={editing?.sku} /></label><label className="field">Estoque<input name="stock" type="number" min="0" required defaultValue={editing?.stock ?? 0} /></label><label className="field">Mínimo de segurança<input name="min_stock" type="number" min="0" defaultValue={editing?.min_stock ?? 1} /></label></div><label className="field">Descrição<textarea name="description" rows={3} defaultValue={editing?.description} /></label><button className="button button-red" type="submit">{editing ? 'Salvar alterações' : 'Cadastrar produto'}</button></form>{error && <p className="form-message">{error}</p>}<ul className="admin-list">{rows.map(row => <li key={row.id} className={row.stock <= row.min_stock ? 'low-stock' : ''}><div><strong>{row.title}</strong><span>{row.sku} · {row.brand} {row.model} · {money(row.sale_price)} · estoque {row.stock}{row.stock <= row.min_stock ? ' · abaixo do mínimo' : ''}</span></div><button type="button" onClick={() => { setEditing(row); setBrand(row.brand); }}>Editar</button></li>)}</ul></>;
}

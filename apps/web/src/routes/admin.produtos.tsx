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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  async function load() {
    const [cats, products] = await Promise.all([pb.collection('categories').getFullList<Category>({ sort: 'name', filter: 'active = true' }), pb.collection('inventory_products').getFullList<Product>({ sort: '-created' })]);
    setCategories(cats);
    setRows(products);
  }
  useEffect(() => { load().catch(() => setError('Falha ao carregar produtos.')); }, []);
  function onCategory(id: string) { setKind(categories.find(item => item.id === id)?.kind || 'outro'); }
  function onPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : '');
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) setError('Use uma foto JPG, PNG ou WebP.');
    else if (file && file.size > 5 * 1024 * 1024) setError('A foto deve ter no máximo 5 MB.');
    else setError('');
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selected = data.getAll('category').map(String);
    const brandValue = String(data.get('brand') || '').trim();
    const modelValue = String(data.get('model') || '').trim();
    const finalBrand = brandValue === 'Outro' ? String(data.get('custom_brand') || '').trim() : brandValue;
    const finalModel = modelValue === 'Outro modelo' ? String(data.get('custom_model') || '').trim() : modelValue;
    if (!finalBrand || !finalModel) { setError('Informe a marca e o modelo do produto.'); return; }
    const payload: Record<string, unknown> = { title: data.get('title'), brand: finalBrand, model: finalModel, color: data.get('color') || '', photo: safeImageUrl(String(data.get('photo') || '')), sale_price: Math.round(Number(data.get('sale_price')) * 100), cost_price: Math.round(Number(data.get('cost_price') || 0) * 100), sku: String(data.get('sku') || '').trim(), stock: Number(data.get('stock') || 0), min_stock: Number(data.get('min_stock') || 1), film_type: data.get('film_type') || '', description: data.get('description') || '', category: selected, active: true };
    if (photoFile) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(photoFile.type) || photoFile.size > 5 * 1024 * 1024) { setError('Use uma foto JPG, PNG ou WebP de até 5 MB.'); return; }
      payload.photo = photoFile;
    }
    setUploading(true); setError('');
    try {
      if (editing) await pb.collection('inventory_products').update(editing.id, payload);
      else await pb.collection('inventory_products').create(payload);
      setEditing(null); setPhotoFile(null); setPhotoPreview('');
      event.currentTarget.reset();
      await load();
    } catch { setError('Não foi possível salvar. Confira categoria, marca, modelo e se o SKU já existe.'); } finally { setUploading(false); }
  }
  return <><h1>Produtos e estoque</h1><form onSubmit={save} className="admin-form" key={editing?.id || 'new'}><label className="field">Categorias<select name="category" multiple required defaultValue={editing?.category || []} onChange={event => onCategory(event.target.selectedOptions[0]?.value)}>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="field">Nome<input name="title" required defaultValue={editing?.title} /></label><div className="form-row"><label className="field">Marca<select name="brand" value={editing?.brand || brand} onChange={event => setBrand(event.target.value)}>{PHONE_BRANDS.map(item => <option key={item}>{item}</option>)}</select></label>{(editing?.brand || brand) === 'Outro' && <label className="field">Digite a marca<input name="custom_brand" required /></label>}<label className="field">Modelo<input name="model" required list="model-options" defaultValue={editing?.model} /></label><datalist id="model-options">{(PHONE_MODELS[editing?.brand || brand] || []).map(item => <option key={item} value={item} />)}<option value="Outro modelo" /></datalist></div>{(editing?.model || '') === 'Outro modelo' && <label className="field">Digite o modelo<input name="custom_model" required /></label>}{kind === 'capinha' && <label className="field">Cor<input name="color" required defaultValue={editing?.color} /></label>}{kind === 'pelicula' && <label className="field">Tipo de película<select name="film_type" defaultValue={editing?.film_type}>{FILM_TYPES.map(item => <option key={item}>{item}</option>)}</select></label>}<label className="field">Foto do produto (do PC)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} disabled={uploading} /></label>{photoPreview && <img src={photoPreview} alt="Prévia da foto" style={{ maxWidth: 160, borderRadius: 8, marginBottom: 12 }} />}<label className="field">Ou cole uma URL segura (https)<input name="photo" defaultValue={editing?.photo} placeholder="https://exemplo.com/foto.jpg" /></label>{uploading && <p className="image-note">Salvando produto…</p>}<div className="form-row"><label className="field">Preço de venda (R$)<input name="sale_price" type="number" min="0" step="0.01" required defaultValue={editing ? editing.sale_price / 100 : ''} /></label><label className="field">Preço de custo (R$)<input name="cost_price" type="number" min="0" step="0.01" defaultValue={editing ? editing.cost_price / 100 : ''} /></label></div><div className="form-row"><label className="field">SKU (opcional)<input name="sku" defaultValue={editing?.sku} placeholder="Ex.: CAP-SAM-A15-PT" /></label><label className="field">Estoque<input name="stock" type="number" min="0" required defaultValue={editing?.stock ?? 0} /></label><label className="field">Mínimo de segurança<input name="min_stock" type="number" min="0" defaultValue={editing?.min_stock ?? 1} /></label></div><label className="field">Descrição<textarea name="description" rows={3} defaultValue={editing?.description} /></label><button className="button" type="submit" disabled={uploading}>{uploading ? 'Salvando…' : editing ? 'Salvar alterações' : 'Cadastrar produto'}</button></form>{error && <p className="form-message">{error}</p>}<ul className="admin-list">{rows.map(row => <li key={row.id} className={row.stock <= row.min_stock ? 'low-stock' : ''}><div><strong>{row.title}</strong><span>{row.sku ? `${row.sku} · ` : ''}{row.brand} {row.model} · {money(row.sale_price)} · estoque {row.stock}{row.stock <= row.min_stock ? ' · abaixo do mínimo' : ''}</span></div><button type="button" onClick={() => { setEditing(row); setBrand(row.brand); setPhotoPreview(row.photo || ''); }}>Editar</button></li>)}</ul></>;
}

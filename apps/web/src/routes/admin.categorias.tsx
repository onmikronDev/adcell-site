import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase-client';
type Category = { id: string; name: string; slug: string; kind: string; active: boolean };
export default function CategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [error, setError] = useState('');
  async function load() { setRows(await pb.collection('categories').getFullList<Category>({ sort: 'name' })); }
  useEffect(() => { load().catch(() => setError('Não foi possível carregar as categorias.')); }, []);
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name')).trim();
    try {
      await pb.collection('categories').create({ name, slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 80), kind: data.get('kind'), active: true });
      event.currentTarget.reset();
      await load();
    } catch { setError('Não foi possível criar a categoria. O nome pode já existir.'); }
  }
  return <><h1>Categorias</h1><form onSubmit={create} className="inline-form"><input name="name" required placeholder="Nova categoria" aria-label="Nome da categoria" /><select name="kind" aria-label="Tipo de ficha"><option value="capinha">Ficha de capinha</option><option value="pelicula">Ficha de película</option><option value="outro">Ficha padrão</option></select><button className="button button-red" type="submit">Criar</button></form>{error && <p className="form-message">{error}</p>}<ul className="admin-list">{rows.map(row => <li key={row.id}><strong>{row.name}</strong><span>{row.kind}</span><button type="button" onClick={() => pb.collection('categories').update(row.id, { active: !row.active }).then(load)}>{row.active ? 'Ativa' : 'Oculta'}</button></li>)}</ul></>;
}

import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import { query, execute } from '@/db.server';

type Category = { id: number; name: string; kind: string };

const KINDS = [
  { id: 'capinha', label: 'Capinha' },
  { id: 'pelicula', label: 'Película' },
  { id: 'outro', label: 'Outro' },
];

export async function loader() {
  const rows = await query<any>('SELECT id, name, kind FROM inventory_categories WHERE active = 1 ORDER BY name ASC');
  return { categories: rows.map((r) => ({ id: Number(r.id), name: r.name, kind: r.kind ?? 'outro' })) };
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const intent = String(form.get('intent') || 'create');
  const id = Number(form.get('id') || 0);
  const name = String(form.get('name') || '').trim();
  const kind = String(form.get('kind') || 'outro');

  if (!name) return { error: 'Informe o nome da categoria.' };

  try {
    if (intent === 'update' && id) {
      await execute('UPDATE inventory_categories SET name = ?, kind = ? WHERE id = ?', [name, kind, id]);
    } else if (intent === 'delete' && id) {
      await execute('UPDATE inventory_categories SET active = 0 WHERE id = ?', [id]);
    } else {
      await execute('INSERT INTO inventory_categories (name, kind, active) VALUES (?, ?, 1)', [name, kind]);
    }
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao salvar categoria.' };
  }
}

export default function CategoriesPage() {
  const fetcher = useFetcher<typeof action>();
  const [rows, setRows] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch('/admin/categorias').then((r) => r.json());
    setRows(res.categories ?? []);
  }

  useEffect(() => {
    load().catch(() => setError('Falha ao carregar categorias.'));
  }, []);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const data = fetcher.data as { error?: string };
      if (data.error) setError(data.error);
      else {
        setError('');
        setEditing(null);
        load();
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      <h1>Categorias</h1>
      <fetcher.Form method="post" className="admin-form" key={editing?.id || 'new'}>
        <input type="hidden" name="intent" value={editing ? 'update' : 'create'} />
        <input type="hidden" name="id" value={editing?.id ?? ''} />
        <div className="form-row">
          <label className="field">Nome<input name="name" required defaultValue={editing?.name} placeholder="Ex.: Capinhas Samsung" /></label>
          <label className="field">Tipo
            <select name="kind" defaultValue={editing?.kind || 'outro'}>
              {KINDS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
        </div>
        <button className="button" type="submit" disabled={fetcher.state !== 'idle'}>
          {fetcher.state !== 'idle' ? 'Salvando…' : editing ? 'Salvar alterações' : 'Criar categoria'}
        </button>
        {editing && <button type="button" className="text-link" onClick={() => setEditing(null)}>Cancelar edição</button>}
      </fetcher.Form>
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
              <fetcher.Form method="post" style={{ display: 'inline' }}>
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={row.id} />
                <button type="submit">Excluir</button>
              </fetcher.Form>
            </div>
          </li>
        ))}
        {!rows.length && <li>Nenhuma categoria criada ainda.</li>}
      </ul>
    </>
  );
}

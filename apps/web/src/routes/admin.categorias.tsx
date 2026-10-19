import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import { query, execute } from '@/db.server';

type Category = { id: number; name: string; slug: string; kind: string; active: boolean };

export async function loader() {
  const rows = await query<any>(
    'SELECT id, name, slug, kind, active FROM inventory_categories ORDER BY name ASC',
  );
  const categories: Category[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    kind: r.kind ?? '',
    active: !!r.active,
  }));
  return { categories };
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const intent = String(form.get('intent') || '');

  if (intent === 'create') {
    const name = String(form.get('name') || '').trim();
    const kind = String(form.get('kind') || 'outro');
    if (!name) return { error: 'Informe o nome da categoria.' };
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
    try {
      await execute(
        'INSERT INTO inventory_categories (name, slug, kind, active) VALUES (?, ?, ?, 1)',
        [name, slug, kind],
      );
      return { ok: true };
    } catch {
      return { error: 'Não foi possível criar a categoria. O nome pode já existir.' };
    }
  }

  if (intent === 'toggle') {
    const id = Number(form.get('id'));
    const active = String(form.get('active')) === '1';
    await execute(
      'UPDATE inventory_categories SET active = ? WHERE id = ?',
      [active ? 0 : 1, id],
    );
    return { ok: true };
  }

  return { error: 'Ação desconhecida.' };
}

export default function CategoriesPage() {
  const fetcher = useFetcher<typeof action>();
  const [rows, setRows] = useState<Category[]>([]);
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch('/admin/categorias').then((r) => r.json());
    setRows(res.categories ?? []);
  }

  useEffect(() => {
    load().catch(() => setError('Não foi possível carregar as categorias.'));
  }, []);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const data = fetcher.data as { error?: string };
      if (data.error) setError(data.error);
      else {
        setError('');
        load();
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      <h1>Categorias</h1>
      <fetcher.Form method="post" className="inline-form">
        <input type="hidden" name="intent" value="create" />
        <input name="name" required placeholder="Nova categoria" aria-label="Nome da categoria" />
        <select name="kind" aria-label="Tipo de ficha">
          <option value="capinha">Ficha de capinha</option>
          <option value="pelicula">Ficha de película</option>
          <option value="outro">Ficha padrão</option>
        </select>
        <button className="button button-red" type="submit">Criar</button>
      </fetcher.Form>
      {error && <p className="form-message">{error}</p>}
      <ul className="admin-list">
        {rows.map((row) => (
          <li key={row.id}>
            <strong>{row.name}</strong>
            <span>{row.kind}</span>
            <fetcher.Form method="post" style={{ display: 'inline' }}>
              <input type="hidden" name="intent" value="toggle" />
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="active" value={row.active ? '1' : '0'} />
              <button type="submit">{row.active ? 'Ativa' : 'Oculta'}</button>
            </fetcher.Form>
          </li>
        ))}
      </ul>
    </>
  );
}

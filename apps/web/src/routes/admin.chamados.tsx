import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import { query, execute } from '@/db.server';

type Ticket = { id: number; name: string; whatsapp: string; email: string; brand: string; model: string; problem: string; status: string };

export async function loader() {
  const rows = await query<any>('SELECT id, name, whatsapp, email, brand, model, problem, status FROM problem_reports ORDER BY created DESC LIMIT 200');
  return {
    tickets: rows.map((r) => ({ ...r, id: Number(r.id) })),
  };
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const id = Number(form.get('id'));
  const status = String(form.get('status') || 'novo');
  await execute('UPDATE problem_reports SET status = ? WHERE id = ?', [status, id]);
  return { ok: true };
}

export default function TicketsPage() {
  const fetcher = useFetcher<typeof action>();
  const [rows, setRows] = useState<Ticket[]>([]);
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch('/admin/chamados').then((r) => r.json());
    setRows(res.tickets ?? []);
  }

  useEffect(() => {
    load().catch(() => setError('Chamados indisponíveis.'));
  }, []);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const data = fetcher.data as { error?: string };
      if (data.error) setError(data.error);
      else load();
    }
  }, [fetcher.state, fetcher.data]);

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
            <fetcher.Form method="post">
              <input type="hidden" name="id" value={row.id} />
              <select
                aria-label="Status do chamado"
                name="status"
                defaultValue={row.status || 'novo'}
                onChange={(e) => fetcher.submit(e.currentTarget.form)}
              >
                <option value="novo">Novo</option>
                <option value="em_atendimento">Em atendimento</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </fetcher.Form>
          </li>
        ))}
        {!rows.length && <li>Nenhum chamado ainda.</li>}
      </ul>
    </>
  );
}

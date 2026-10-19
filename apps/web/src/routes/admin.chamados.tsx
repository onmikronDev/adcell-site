import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase-client';
type Ticket = { id: string; name: string; whatsapp: string; email: string; brand: string; model: string; problem: string; status: string };
export default function TicketsPage() {
  const [rows, setRows] = useState<Ticket[]>([]);
  const [error, setError] = useState('');
  function load() { return pb.collection('problem_reports').getFullList<Ticket>({ sort: '-created' }).then(setRows); }
  useEffect(() => { load().catch(() => setError('Chamados indisponíveis.')); }, []);
  return <><h1>Chamados</h1>{error && <p className="form-message">{error}</p>}<ul className="admin-list">{rows.map(row => <li key={row.id}><div><strong>{row.name}</strong><span>{row.brand} {row.model} · {row.whatsapp} · {row.email}</span><p>{row.problem}</p></div><select aria-label="Status do chamado" value={row.status || 'novo'} onChange={event => pb.collection('problem_reports').update(row.id, { status: event.target.value }).then(load)}><option value="novo">Novo</option><option value="em_atendimento">Em atendimento</option><option value="encerrado">Encerrado</option></select></li>)}{!rows.length && <li>Nenhum chamado ainda.</li>}</ul></>;
}

import { useEffect, useState } from 'react';
import { useFetcher, useSearchParams } from 'react-router';
import { CHECKLIST, OS_STATUS, PHONE_BRANDS, PHONE_MODELS } from '@/data/brand';
import { query, execute, queryOne } from '@/db.server';

type Tech = { id: number; name: string };
type Order = { id: number; os_number: string; customer_name: string; status: string; brand: string; model: string; whatsapp: string };
type Event = { id: number; note: string; parts: string; status: string; author: string; created: string };

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const osId = Number(url.searchParams.get('os') || 0);
  const orders = await query<any>('SELECT id, os_number, customer_name, status, brand, model, whatsapp FROM service_orders ORDER BY id DESC LIMIT 200');
  const techs = await query<any>('SELECT id, name FROM technicians WHERE active = 1 ORDER BY name ASC');
  const events = osId
    ? await query<any>('SELECT id, note, parts, status, author, created FROM os_events WHERE order_id = ? ORDER BY created DESC', [osId])
    : [];
  return {
    orders: orders.map((o) => ({ ...o, id: Number(o.id) })),
    techs: techs.map((t) => ({ id: Number(t.id), name: t.name })),
    events: events.map((e) => ({ ...e, id: Number(e.id) })),
    openId: osId,
  };
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const intent = String(form.get('intent') || '');

  if (intent === 'add_tech') {
    await execute('INSERT INTO technicians (name, active) VALUES (?, 1)', [String(form.get('name') || '').trim()]);
    return { ok: true };
  }

  if (intent === 'create_os') {
    const checklist: Record<string, boolean> = {};
    CHECKLIST.forEach((item) => {
      checklist[item.key] = form.get(item.key) === 'on';
    });
    const count = await queryOne<any>('SELECT COUNT(*) AS total FROM service_orders');
    const osNumber = `OS-${String((count?.total ?? 0) + 1).padStart(4, '0')}`;
    const result = await execute(
      `INSERT INTO service_orders
        (os_number, customer_name, cpf, whatsapp, email, brand, model, imei, problem, checklist, status, technician, public_note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'em_analise', ?, 'Aparelho recebido para análise.')`,
      [
        osNumber,
        String(form.get('customer_name') || ''),
        String(form.get('cpf') || '').replace(/\D/g, ''),
        String(form.get('whatsapp') || ''),
        String(form.get('email') || ''),
        String(form.get('brand') || ''),
        String(form.get('model') || ''),
        String(form.get('imei') || ''),
        String(form.get('problem') || ''),
        JSON.stringify(checklist),
        String(form.get('technician') || ''),
      ],
    );
    await execute(
      'INSERT INTO os_events (order_id, status, note, author) VALUES (?, ?, ?, ?)',
      [result.insertId, 'em_analise', 'Entrada registrada com checklist.', 'Balcão'],
    );
    return { ok: true };
  }

  if (intent === 'update_os') {
    const id = Number(form.get('id'));
    const status = String(form.get('status') || '');
    await execute(
      'UPDATE service_orders SET status=?, technician=?, public_note=? WHERE id=?',
      [status, String(form.get('technician') || ''), String(form.get('public_note') || ''), id],
    );
    await execute(
      'INSERT INTO os_events (order_id, status, note, parts, author) VALUES (?, ?, ?, ?, ?)',
      [id, status, String(form.get('note') || ''), String(form.get('parts') || ''), 'Técnico'],
    );
    return { ok: true };
  }

  return { error: 'Ação desconhecida.' };
}

export default function OrdersPage() {
  const fetcher = useFetcher<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [techs, setTechs] = useState<Tech[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [brand, setBrand] = useState('Samsung');
  const [error, setError] = useState('');
  const open = orders.find((o) => String(o.id) === searchParams.get('os')) || null;

  async function load() {
    const res = await fetch(`/admin/ordens?${searchParams.toString()}`).then((r) => r.json());
    setOrders(res.orders ?? []);
    setTechs(res.techs ?? []);
    setEvents(res.events ?? []);
  }

  useEffect(() => {
    load().catch(() => setError('Falha ao carregar ordens.'));
  }, [searchParams]);

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

  function show(order: Order) {
    setSearchParams({ os: String(order.id) });
  }

  return (
    <>
      <h1>Ordens de serviço</h1>
      <fetcher.Form method="post" className="inline-form">
        <input type="hidden" name="intent" value="add_tech" />
        <input name="name" required placeholder="Nome do técnico" aria-label="Nome do técnico" />
        <button className="button" type="submit">Adicionar técnico</button>
      </fetcher.Form>
      <fetcher.Form method="post" className="admin-form">
        <input type="hidden" name="intent" value="create_os" />
        <h2>Nova O.S.</h2>
        <div className="form-row">
          <label className="field">Cliente<input name="customer_name" required /></label>
          <label className="field">CPF<input name="cpf" /></label>
          <label className="field">WhatsApp<input name="whatsapp" required /></label>
        </div>
        <label className="field">E-mail<input name="email" type="email" /></label>
        <div className="form-row">
          <label className="field">Marca<select name="brand" value={brand} onChange={(e) => setBrand(e.target.value)}>{PHONE_BRANDS.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field">Modelo<select name="model">{(PHONE_MODELS[brand] || []).map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field">IMEI / série<input name="imei" /></label>
        </div>
        <label className="field">Problema<textarea name="problem" required rows={3} /></label>
        <fieldset className="checklist">
          <legend>Checklist de entrada</legend>
          {CHECKLIST.map((item) => (
            <label key={item.key}><input type="checkbox" name={item.key} /> {item.label}</label>
          ))}
        </fieldset>
        <label className="field">Técnico<select name="technician"><option value="">Não atribuído</option>{techs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <button className="button button-red" type="submit">Abrir O.S.</button>
      </fetcher.Form>
      {error && <p className="form-message">{error}</p>}
      <ul className="admin-list">
        {orders.map((order) => (
          <li key={order.id}>
            <button type="button" onClick={() => show(order)}>
              <strong>{order.os_number}</strong> {order.customer_name} · {OS_STATUS[order.status as keyof typeof OS_STATUS] || order.status}
            </button>
          </li>
        ))}
      </ul>
      {open && (
        <fetcher.Form method="post" className="admin-form">
          <input type="hidden" name="intent" value="update_os" />
          <input type="hidden" name="id" value={open.id} />
          <h2>{open.os_number}</h2>
          <label className="field">Status<select name="status" defaultValue={open.status}>{Object.entries(OS_STATUS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          <label className="field">Técnico<select name="technician"><option value="">Não atribuído</option>{techs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="field">Nota visível ao cliente<input name="public_note" /></label>
          <label className="field">Observação interna<textarea name="note" rows={3} /></label>
          <label className="field">Peças utilizadas<input name="parts" /></label>
          <button className="button" type="submit">Registrar tramitação</button>
          <ul className="admin-list">
            {events.map((item) => (
              <li key={item.id}>
                <span>{OS_STATUS[item.status as keyof typeof OS_STATUS] || item.status} · {item.author}</span>
                <p>{item.note} {item.parts}</p>
              </li>
            ))}
          </ul>
        </fetcher.Form>
      )}
    </>
  );
}

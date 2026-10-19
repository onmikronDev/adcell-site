import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase-client';
import { CHECKLIST, OS_STATUS, PHONE_BRANDS, PHONE_MODELS } from '@/data/brand';
type Tech = { id: string; name: string };
type Order = { id: string; os_number: string; customer_name: string; status: keyof typeof OS_STATUS; brand: string; model: string; whatsapp: string };
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [techs, setTechs] = useState<Tech[]>([]);
  const [open, setOpen] = useState<Order | null>(null);
  const [events, setEvents] = useState<{ id: string; note: string; parts: string; status: string; author: string; created: string }[]>([]);
  const [brand, setBrand] = useState('Samsung');
  const [error, setError] = useState('');
  async function load() {
    const [list, people] = await Promise.all([pb.collection('service_orders').getFullList<Order>({ sort: '-created' }), pb.collection('technicians').getFullList<Tech>({ filter: 'active = true' })]);
    setOrders(list);
    setTechs(people);
  }
  useEffect(() => { load().catch(() => setError('Falha ao carregar ordens.')); }, []);
  async function show(order: Order) {
    setOpen(order);
    setEvents(await pb.collection('os_events').getFullList({ filter: `order = '${order.id}'`, sort: '-created' }));
  }
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const checklist = Object.fromEntries(CHECKLIST.map(item => [item.key, data.get(item.key) === 'on']));
    const count = await pb.collection('service_orders').getList(1, 1);
    const osNumber = `OS-${String(count.totalItems + 1).padStart(4, '0')}`;
    try {
      const created = await pb.collection('service_orders').create({ os_number: osNumber, customer_name: data.get('customer_name'), cpf: String(data.get('cpf') || '').replace(/\D/g, ''), whatsapp: data.get('whatsapp'), email: data.get('email') || '', brand: data.get('brand'), model: data.get('model'), imei: data.get('imei') || '', problem: data.get('problem'), checklist, status: 'em_analise', technician: data.get('technician') || '', public_note: 'Aparelho recebido para análise.' });
      await pb.collection('os_events').create({ order: created.id, status: 'em_analise', note: 'Entrada registrada com checklist.', author: 'Balcão' });
      event.currentTarget.reset();
      await load();
    } catch { setError('Não foi possível abrir a O.S. Confira os dados.'); }
  }
  async function addTech(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get('name');
    await pb.collection('technicians').create({ name, active: true });
    event.currentTarget.reset();
    await load();
  }
  async function update(event: React.FormEvent<HTMLFormElement>) {
    if (!open) return;
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const status = String(data.get('status'));
    await pb.collection('service_orders').update(open.id, { status, technician: data.get('technician') || '', public_note: data.get('public_note') || '' });
    await pb.collection('os_events').create({ order: open.id, status, note: data.get('note') || '', parts: data.get('parts') || '', author: 'Técnico' });
    await load();
    await show({ ...open, status: status as Order['status'] });
  }
  return <><h1>Ordens de serviço</h1><form onSubmit={addTech} className="inline-form"><input name="name" required placeholder="Nome do técnico" aria-label="Nome do técnico" /><button className="button" type="submit">Adicionar técnico</button></form><form onSubmit={create} className="admin-form"><h2>Nova O.S.</h2><div className="form-row"><label className="field">Cliente<input name="customer_name" required /></label><label className="field">CPF<input name="cpf" /></label><label className="field">WhatsApp<input name="whatsapp" required /></label></div><label className="field">E-mail<input name="email" type="email" /></label><div className="form-row"><label className="field">Marca<select name="brand" value={brand} onChange={event => setBrand(event.target.value)}>{PHONE_BRANDS.map(item => <option key={item}>{item}</option>)}</select></label><label className="field">Modelo<select name="model">{(PHONE_MODELS[brand] || []).map(item => <option key={item}>{item}</option>)}</select></label><label className="field">IMEI / série<input name="imei" /></label></div><label className="field">Problema<textarea name="problem" required rows={3} /></label><fieldset className="checklist"><legend>Checklist de entrada</legend>{CHECKLIST.map(item => <label key={item.key}><input type="checkbox" name={item.key} /> {item.label}</label>)}</fieldset><label className="field">Técnico<select name="technician"><option value="">Não atribuído</option>{techs.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className="button button-red" type="submit">Abrir O.S.</button></form>{error && <p className="form-message">{error}</p>}<ul className="admin-list">{orders.map(order => <li key={order.id}><button type="button" onClick={() => show(order)}><strong>{order.os_number}</strong> {order.customer_name} · {OS_STATUS[order.status]}</button></li>)}</ul>{open && <form onSubmit={update} className="admin-form"><h2>{open.os_number}</h2><label className="field">Status<select name="status" defaultValue={open.status}>{Object.entries(OS_STATUS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label className="field">Técnico<select name="technician" defaultValue=""><option value="">Não atribuído</option>{techs.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="field">Nota visível ao cliente<input name="public_note" /></label><label className="field">Observação interna<textarea name="note" rows={3} /></label><label className="field">Peças utilizadas<input name="parts" /></label><button className="button" type="submit">Registrar tramitação</button><ul className="admin-list">{events.map(item => <li key={item.id}><span>{OS_STATUS[item.status as keyof typeof OS_STATUS] || item.status} · {item.author}</span><p>{item.note} {item.parts}</p></li>)}</ul></form>}</>;
}

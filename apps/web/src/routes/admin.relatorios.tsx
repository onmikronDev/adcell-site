import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLoaderData } from 'react-router';
import { money } from '@/data/brand';
import { query } from '@/db.server';

type Sale = { id: number; total: number; cost_total: number; payment: string; created: string };
type Item = { title: string; category_name: string; quantity: number; unit_price: number; unit_cost: number; created: string };

export async function loader() {
  const sales = await query<any>('SELECT id, total, cost_total, payment, created FROM counter_sales ORDER BY created DESC LIMIT 500');
  const items = await query<any>('SELECT title, category_name, quantity, unit_price, unit_cost, created FROM sale_items ORDER BY created DESC LIMIT 500');
  return {
    sales: sales.map((s) => ({ ...s, id: Number(s.id) })),
    items: items.map((i) => ({ ...i, quantity: Number(i.quantity) })),
  };
}

export default function ReportsPage() {
  const { sales, items } = useLoaderData<typeof loader>();
  const [range, setRange] = useState<'day' | 'week' | 'month'>('day');

  const since = Date.now() - (range === 'day' ? 1 : range === 'week' ? 7 : 30) * 86400000;
  const filtered = sales.filter((sale) => new Date(sale.created).getTime() >= since);
  const filteredItems = items.filter((item) => new Date(item.created).getTime() >= since);
  const total = filtered.reduce((sum, sale) => sum + sale.total, 0);
  const cost = filtered.reduce((sum, sale) => sum + (sale.cost_total || 0), 0);
  const byPayment = ['pix', 'credito', 'debito', 'dinheiro'].map((id) => ({
    name: id,
    total: filtered.filter((sale) => sale.payment === id).reduce((sum, sale) => sum + sale.total, 0) / 100,
  }));
  const byCategory = Object.values(
    filteredItems.reduce<Record<string, { name: string; qty: number }>>((acc, item) => {
      const name = item.category_name || 'Sem categoria';
      acc[name] = acc[name] || { name, qty: 0 };
      acc[name].qty += item.quantity;
      return acc;
    }, {}),
  ).sort((a, b) => b.qty - a.qty);

  return <><h1>Faturamento</h1><div className="category-chips">{(['day', 'week', 'month'] as const).map((id) => <button key={id} type="button" className={range === id ? 'selected' : ''} onClick={() => setRange(id)}>{id === 'day' ? 'Diário' : id === 'week' ? 'Semanal' : 'Mensal'}</button>)}</div><div className="stat-grid"><div><strong>{money(total)}</strong><span>Vendas</span></div><div><strong>{money(total - cost)}</strong><span>Lucro bruto</span></div><div><strong>{filtered.length}</strong><span>Lançamentos</span></div></div><div className="chart-box"><ResponsiveContainer width="100%" height={240}><BarChart data={byPayment}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#1f7a45" /></BarChart></ResponsiveContainer></div><h2>Mais vendidos por categoria</h2><ul className="admin-list">{byCategory.map((item) => <li key={item.name}><strong>{item.name}</strong><span>{item.qty} un</span></li>)}{!byCategory.length && <li>Nenhuma venda neste período.</li>}</ul></>;
}

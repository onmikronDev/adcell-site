import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import pb from '@/lib/pocketbase-client';
export default function AdminHome() {
  const [stats, setStats] = useState({ low: 0, openOs: 0, tickets: 0 });
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([
      pb.collection('inventory_products').getList(1, 200),
      pb.collection('service_orders').getList(1, 1, { filter: "status != 'entregue'" }),
      pb.collection('problem_reports').getList(1, 1, { filter: "status = 'novo'" }),
    ]).then(([products, orders, tickets]) => {
      setStats({ low: products.items.filter(item => Number(item.stock) <= Number(item.min_stock || 0)).length, openOs: orders.totalItems, tickets: tickets.totalItems });
    }).catch(() => setError('Não foi possível carregar os indicadores.'));
  }, []);
  return <><h1>Painel</h1><p className="page-intro">Estoque, assistência e chamados do dia.</p>{error && <p className="form-message">{error}</p>}<div className="stat-grid"><div><strong className={stats.low ? 'alert' : ''}>{stats.low}</strong><span>Itens no estoque mínimo</span></div><div><strong>{stats.openOs}</strong><span>O.S. em aberto</span></div><div><strong>{stats.tickets}</strong><span>Chamados novos</span></div></div><div className="admin-links"><Link to="/admin/produtos">Cadastrar produto</Link><Link to="/admin/ordens">Abrir O.S.</Link><Link to="/admin/pdv">Lançar venda</Link></div></>;
}

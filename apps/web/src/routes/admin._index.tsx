import { Link, useLoaderData } from 'react-router';
import { queryOne } from '@/db.server';

export async function loader() {
	const low = await queryOne<any>('SELECT COUNT(*) AS total FROM inventory_products WHERE stock <= COALESCE(min_stock, 0)');
	const openOs = await queryOne<any>("SELECT COUNT(*) AS total FROM service_orders WHERE status != 'entregue'");
	const tickets = await queryOne<any>("SELECT COUNT(*) AS total FROM problem_reports WHERE status = 'novo'");
	return { stats: { low: Number(low?.total || 0), openOs: Number(openOs?.total || 0), tickets: Number(tickets?.total || 0) } };
}

export default function AdminHome() {
	const { stats } = useLoaderData<typeof loader>();
	return <><h1>Painel</h1><p className="page-intro">Estoque, assistência e chamados do dia.</p><div className="stat-grid"><div><strong className={stats.low ? 'alert' : ''}>{stats.low}</strong><span>Itens no estoque mínimo</span></div><div><strong>{stats.openOs}</strong><span>O.S. em aberto</span></div><div><strong>{stats.tickets}</strong><span>Chamados novos</span></div></div><div className="admin-links"><Link to="/admin/produtos">Cadastrar produto</Link><Link to="/admin/ordens">Abrir O.S.</Link><Link to="/admin/pdv">Lançar venda</Link></div></>;
}

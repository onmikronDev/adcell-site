import { useEffect, useState } from 'react';
import { Link } from 'react-router';

type Stats = { low: number; openOs: number; tickets: number };

export default function AdminHome() {
	const [stats, setStats] = useState<Stats>({ low: 0, openOs: 0, tickets: 0 });

	useEffect(() => {
		fetch('/api/admin/stats')
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (data?.stats) {
					setStats({
						low: Number(data.stats.low || 0),
						openOs: Number(data.stats.openOs || 0),
						tickets: Number(data.stats.tickets || 0),
					});
				}
			})
			.catch(() => {});
	}, []);

	return <><h1>Painel</h1><p className="page-intro">Estoque, assistência e chamados do dia.</p><div className="stat-grid"><div><strong className={stats.low ? 'alert' : ''}>{stats.low}</strong><span>Itens no estoque mínimo</span></div><div><strong>{stats.openOs}</strong><span>O.S. em aberto</span></div><div><strong>{stats.tickets}</strong><span>Chamados novos</span></div></div><div className="admin-links"><Link to="/admin/produtos">Cadastrar produto</Link><Link to="/admin/ordens">Abrir O.S.</Link><Link to="/admin/pdv">Lançar venda</Link></div></>;
}

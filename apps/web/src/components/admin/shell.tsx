import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
const links = [
  ['/admin', 'Painel'],
  ['/admin/categorias', 'Categorias'],
  ['/admin/produtos', 'Produtos'],
  ['/admin/ordens', 'Ordens de serviço'],
  ['/admin/pdv', 'Frente de caixa'],
  ['/admin/relatorios', 'Relatórios'],
  ['/admin/chamados', 'Chamados'],
  ['/admin/config', 'Loja'],
];
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return <div className="admin-shell"><aside><strong>ADCELL</strong><nav>{links.map(([href, label]) => <NavLink key={href} to={href} end={href === '/admin'}>{label}</NavLink>)}</nav><button type="button" onClick={() => { logout(); navigate('/entrar'); }}>Sair</button></aside><div className="admin-main">{children}</div></div>;
}

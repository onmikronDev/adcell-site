import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { Route } from './+types/entrar';
import { seo } from '@/lib/seo';
import { useAuth } from '@/hooks/use-auth';
import { isStaff } from '@/lib/staff';
import { LOGO } from '@/data/brand';
export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, { title: 'Acesso da equipe — ADCELL CASE', description: 'Entrada restrita da equipe ADCELL CASE.', noindex: true });
}
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const raw = String(data.get('email')).trim();
      const identity = raw.toLowerCase() === 'admin' ? 'admin@adcellcase.com' : raw;
      const auth = await login(identity, String(data.get('password')));
      if (!isStaff(auth.record.role)) {
        setError('Esta conta não tem acesso ao painel.');
        return;
      }
      navigate('/admin');
    } catch {
      setError('E-mail ou senha incorretos.');
    } finally {
      setBusy(false);
    }
  }
  return <main className="section login-page"><img src={LOGO} alt="ADCELL CASE" className="login-logo" /><h1>Painel da loja</h1><form onSubmit={submit} className="login-form"><label className="field">E-mail ou usuário<input name="email" type="text" required autoComplete="username" /></label><label className="field">Senha<input name="password" type="password" required autoComplete="current-password" /></label><button className="button button-red" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>{error && <p className="form-message" role="alert">{error}</p>}</form><Link to="/" className="text-link">Voltar ao site</Link></main>;
}

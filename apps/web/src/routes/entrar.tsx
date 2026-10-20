import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { Route } from './+types/entrar';
import { seo } from '@/lib/seo';
import { LOGO } from '@/data/brand';

export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, { title: 'Acesso da equipe — ADCELL CASE', description: 'Entrada restrita da equipe ADCELL CASE.', noindex: true });
}

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: String(form.get('email') || ''), password: String(form.get('password') || '') }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) navigate('/admin');
      else setError(data.error || 'E-mail ou senha incorretos.');
    } catch {
      setError('Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section login-page">
      <img src={LOGO} alt="ADCELL CASE" className="login-logo" />
      <h1>Painel da loja</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <label className="field">E-mail ou usuário<input name="email" type="text" required autoComplete="username" /></label>
        <label className="field">Senha<input name="password" type="password" required autoComplete="current-password" /></label>
        <button className="button button-red" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
        {error && <p className="form-message" role="alert">{error}</p>}
      </form>
      <Link to="/" className="text-link">Voltar ao site</Link>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useFetcher } from 'react-router';
import type { Route } from './+types/entrar';
import { seo } from '@/lib/seo';
import { LOGO } from '@/data/brand';
import { createHash } from 'node:crypto';
import { queryOne } from '@/db.server';

export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, { title: 'Acesso da equipe — ADCELL CASE', description: 'Entrada restrita da equipe ADCELL CASE.', noindex: true });
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const raw = String(form.get('email') || '').trim().toLowerCase();
  const identity = raw === 'admin' ? 'admin@adcellcase.com' : raw;
  const password = String(form.get('password') || '');
  const hash = createHash('sha256').update(password).digest('hex');

  const user = await queryOne<any>(
    'SELECT id, email FROM admin_users WHERE email = ? AND senha_hash = ?',
    [identity, hash],
  );

  if (!user) {
    return { error: 'E-mail ou senha incorretos.' };
  }
  return { ok: true };
}

export default function Login() {
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const data = fetcher.data as { error?: string; ok?: boolean };
      if (data.error) setError(data.error);
      else if (data.ok) navigate('/admin');
    }
  }, [fetcher.state, fetcher.data, navigate]);

  return (
    <main className="section login-page">
      <img src={LOGO} alt="ADCELL CASE" className="login-logo" />
      <h1>Painel da loja</h1>
      <fetcher.Form method="post" className="login-form">
        <label className="field">E-mail ou usuário<input name="email" type="text" required autoComplete="username" /></label>
        <label className="field">Senha<input name="password" type="password" required autoComplete="current-password" /></label>
        <button className="button button-red" disabled={fetcher.state !== 'idle'}>
          {fetcher.state !== 'idle' ? 'Entrando…' : 'Entrar'}
        </button>
        {error && <p className="form-message" role="alert">{error}</p>}
      </fetcher.Form>
      <Link to="/" className="text-link">Voltar ao site</Link>
    </main>
  );
}

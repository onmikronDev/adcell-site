import { useState } from 'react';

type Page = 'home' | 'contato' | 'os' | 'admin';

export default function App() {
  const [page, setPage] = useState<Page>('home');

  return (
    <div className="site">
      <header className="header">
        <strong>ADCELL CASE</strong>
        <nav>
          <button onClick={() => setPage('home')} className={page === 'home' ? 'active' : ''}>Início</button>
          <button onClick={() => setPage('contato')} className={page === 'contato' ? 'active' : ''}>Contato</button>
          <button onClick={() => setPage('os')} className={page === 'os' ? 'active' : ''}>Consulta O.S.</button>
          <button onClick={() => setPage('admin')} className={page === 'admin' ? 'active' : ''}>Admin</button>
        </nav>
      </header>

      <main className="main">
        {page === 'home' && <Home />}
        {page === 'contato' && <Contato />}
        {page === 'os' && <Os />}
        {page === 'admin' && <Admin />}
      </main>

      <footer className="footer">© {new Date().getFullYear()} ADCELL CASE</footer>
    </div>
  );
}

function Home() {
  return (
    <section>
      <h1>Assistência técnica e acessórios</h1>
      <p>Capinhas, películas e conserto de celulares.</p>
    </section>
  );
}

function Contato() {
  const [status, setStatus] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus('Enviando...');
    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          message: form.get('message'),
        }),
      });
      if (!res.ok) throw new Error();
      setStatus('Mensagem enviada!');
    } catch {
      setStatus('Não foi possível enviar agora.');
    }
  }

  return (
    <section>
      <h1>Fale conosco</h1>
      <form onSubmit={submit} className="form">
        <input name="name" placeholder="Nome" required />
        <input name="email" type="email" placeholder="E-mail" required />
        <textarea name="message" placeholder="Mensagem" required />
        <button>Enviar</button>
      </form>
      {status && <p>{status}</p>}
    </section>
  );
}

function Os() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get('q') || '');
    setLoading(true);
    try {
      const res = await fetch(`/api/os?q=${encodeURIComponent(q)}`);
      setResult(await res.json());
    } catch {
      setResult({ found: false, message: 'Não foi possível consultar.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Consulta de O.S.</h1>
      <form onSubmit={submit} className="form">
        <input name="q" placeholder="Número da O.S. ou CPF" required />
        <button disabled={loading}>{loading ? 'Consultando...' : 'Consultar'}</button>
      </form>
      {result && !result.found && <p>{result.message || 'Nenhuma O.S. encontrada.'}</p>}
      {result?.found && (
        <ul>
          {result.items.map((item: any) => (
            <li key={item.os}>
              <strong>{item.os}</strong> — {item.status}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Admin() {
  const [status, setStatus] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus('Entrando...');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      if (!res.ok) throw new Error();
      setStatus('Login realizado.');
    } catch {
      setStatus('E-mail ou senha incorretos.');
    }
  }

  return (
    <section>
      <h1>Área da equipe</h1>
      <form onSubmit={submit} className="form">
        <input name="email" placeholder="E-mail" required />
        <input name="password" type="password" placeholder="Senha" required />
        <button>Entrar</button>
      </form>
      {status && <p>{status}</p>}
    </section>
  );
}

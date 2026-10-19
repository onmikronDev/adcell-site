import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import { PAYMENTS, money } from '@/data/brand';
import { query, execute } from '@/db.server';

type Product = { id: number; title: string; sale_price: number; cost_price: number; stock: number; category_name: string };

export async function loader() {
  const rows = await query<any>(
    `SELECT p.id, p.title, p.sale_price, p.stock, p.sku, c.name AS category_name
     FROM inventory_products p
     LEFT JOIN inventory_categories c ON c.id = p.category_id
     WHERE p.active = 1 ORDER BY p.title ASC`,
  );
  return {
    products: rows.map((r) => ({
      id: Number(r.id),
      title: r.title,
      sale_price: r.sale_price ?? 0,
      cost_price: 0,
      stock: r.stock ?? 0,
      category_name: r.category_name ?? '',
    })),
  };
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const cart = JSON.parse(String(form.get('cart') || '[]')) as { id: number; quantity: number }[];
  if (!cart.length) return { error: 'Carrinho vazio.' };

  const payment = String(form.get('payment') || '');
  let total = 0;
  const items: { id: number; title: string; category: string; quantity: number; price: number }[] = [];

  for (const line of cart) {
    const product = await queryOne<any>('SELECT id, title, sale_price, stock FROM inventory_products WHERE id = ?', [line.id]);
    if (!product) continue;
    const quantity = Math.max(1, Number(line.quantity) || 1);
    total += (product.sale_price ?? 0) * quantity;
    items.push({ id: product.id, title: product.title, category: '', quantity, price: product.sale_price ?? 0 });
  }

  if (!items.length) return { error: 'Nenhum item válido.' };

  const sale = await execute(
    'INSERT INTO counter_sales (payment, total, cost_total, note) VALUES (?, ?, 0, ?)',
    [payment, total, 'Balcão'],
  );

  for (const item of items) {
    await execute(
      'INSERT INTO sale_items (sale_id, product_id, title, category_name, quantity, unit_price, unit_cost) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [sale.insertId, item.id, item.title, item.category, item.quantity, item.price],
    );
    await execute(
      'UPDATE inventory_products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
      [item.quantity, item.id],
    );
  }

  return { ok: true, message: 'Venda lançada e estoque atualizado.' };
}

export default function PdvPage() {
  const fetcher = useFetcher<typeof action>();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const res = await fetch('/admin/pdv').then((r) => r.json());
    setProducts(res.products ?? []);
  }

  useEffect(() => {
    load().catch(() => setMessage('Estoque indisponível.'));
  }, []);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const data = fetcher.data as { message?: string; error?: string };
      setMessage(data.message || data.error || '');
      if (!data.error) {
        setCart([]);
        load();
      }
    }
  }, [fetcher.state, fetcher.data]);

  const total = cart.reduce((sum, line) => sum + line.product.sale_price * line.quantity, 0);

  return (
    <>
      <h1>Frente de caixa</h1>
      <div className="pdv">
        <select
          aria-label="Produto"
          onChange={(event) => {
            const product = products.find((item) => String(item.id) === event.target.value);
            if (product) setCart((prev) => [...prev, { product, quantity: 1 }]);
            event.target.value = '';
          }}
        >
          <option value="">Adicionar item</option>
          {products.map((item) => (
            <option key={item.id} value={item.id}>{item.title} · {money(item.sale_price)} · {item.stock} un</option>
          ))}
        </select>
        <ul className="admin-list">
          {cart.map((line, index) => (
            <li key={`${line.product.id}-${index}`}>
              <span>{line.product.title}</span>
              <input
                type="number"
                min={1}
                max={line.product.stock || 1}
                value={line.quantity}
                aria-label="Quantidade"
                onChange={(event) =>
                  setCart((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: Number(event.target.value) } : item)))
                }
              />
              <button type="button" onClick={() => setCart((prev) => prev.filter((_, i) => i !== index))}>Remover</button>
            </li>
          ))}
        </ul>
        <fetcher.Form method="post">
          <input type="hidden" name="cart" value={JSON.stringify(cart.map((l) => ({ id: l.product.id, quantity: l.quantity })))} />
          <p>Total {money(total)}</p>
          <label className="field">
            Pagamento
            <select name="payment" required>
              {PAYMENTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <button className="button button-red" disabled={fetcher.state !== 'idle' || !cart.length}>
            {fetcher.state !== 'idle' ? 'Lançando…' : 'Finalizar venda'}
          </button>
        </fetcher.Form>
        {message && <p className="form-message success" role="status">{message}</p>}
      </div>
    </>
  );
}

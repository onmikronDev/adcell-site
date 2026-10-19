import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase-client';
import { PAYMENTS, money } from '@/data/brand';
type Product = { id: string; title: string; sale_price: number; cost_price: number; stock: number; sku: string; expand?: { category?: { name: string }[] | { name: string } } };
export default function PdvPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { pb.collection('inventory_products').getFullList<Product>({ filter: 'active = true', expand: 'category', sort: 'title' }).then(setProducts).catch(() => setMessage('Estoque indisponível.')); }, []);
  const total = cart.reduce((sum, line) => sum + line.product.sale_price * line.quantity, 0);
  const cost = cart.reduce((sum, line) => sum + (line.product.cost_price || 0) * line.quantity, 0);
  async function sell(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart.length) return;
    setBusy(true);
    try {
      const sale = await pb.collection('counter_sales').create({ payment: new FormData(event.currentTarget).get('payment'), total, cost_total: cost, note: 'Balcão' });
      for (const [index, line] of cart.entries()) {
        const category = line.product.expand?.category;
        const categoryName = Array.isArray(category) ? category[0]?.name : category?.name;
        await pb.collection('sale_items').create({ sale: sale.id, product: line.product.id, title: line.product.title, category_name: categoryName || '', quantity: line.quantity, unit_price: line.product.sale_price, unit_cost: line.product.cost_price || 0 }, { requestKey: `sale-item-${index}` });
        await pb.collection('inventory_products').update(line.product.id, { stock: Math.max(0, line.product.stock - line.quantity) }, { requestKey: `stock-${index}` });
      }
      setCart([]);
      setMessage('Venda lançada e estoque atualizado.');
      setProducts(await pb.collection('inventory_products').getFullList<Product>({ filter: 'active = true', expand: 'category', sort: 'title' }));
    } catch { setMessage('Não foi possível concluir a venda.'); } finally { setBusy(false); }
  }
  return <><h1>Frente de caixa</h1><div className="pdv"><select aria-label="Produto" onChange={event => { const product = products.find(item => item.id === event.target.value); if (product) setCart(prev => [...prev, { product, quantity: 1 }]); event.target.value = ''; }}><option value="">Adicionar item</option>{products.map(item => <option key={item.id} value={item.id}>{item.title} · {money(item.sale_price)} · {item.stock} un</option>)}</select><ul className="admin-list">{cart.map((line, index) => <li key={`${line.product.id}-${index}`}><span>{line.product.title}</span><input type="number" min={1} max={line.product.stock || 1} value={line.quantity} aria-label="Quantidade" onChange={event => setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity: Number(event.target.value) } : item))} /><button type="button" onClick={() => setCart(prev => prev.filter((_, i) => i !== index))}>Remover</button></li>)}</ul><form onSubmit={sell}><p>Total {money(total)} · custo {money(cost)} · lucro {money(total - cost)}</p><label className="field">Pagamento<select name="payment" required>{PAYMENTS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><button className="button button-red" disabled={busy || !cart.length}>{busy ? 'Lançando…' : 'Finalizar venda'}</button></form>{message && <p className="form-message success" role="status">{message}</p>}</div></>;
}

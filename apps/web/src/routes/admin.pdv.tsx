import { useEffect, useState } from 'react';
import { PAYMENTS, money } from '@/data/brand';

type Product = { id: number; title: string; sale_price: number; cost_price: number; stock: number; category_name: string };

export default function PdvPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
	const [payment, setPayment] = useState(PAYMENTS[0]?.id || 'pix');
	const [message, setMessage] = useState('');
	const [saving, setSaving] = useState(false);

	async function load() {
		const res = await fetch('/api/admin/pdv');
		if (!res.ok) throw new Error('fetch failed');
		const data = await res.json();
		setProducts(data.products ?? []);
	}

	useEffect(() => {
		load().catch(() => setMessage('Estoque indisponível.'));
	}, []);

	async function finishSale() {
		setSaving(true);
		setMessage('');
		try {
			const res = await fetch('/api/admin/pdv', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					cart: cart.map((line) => ({ id: line.product.id, quantity: line.quantity })),
					payment,
				}),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok || data.error) throw new Error(data.error || 'Erro ao lançar venda.');
			setMessage(data.message || 'Venda lançada e estoque atualizado.');
			setCart([]);
			await load();
		} catch (e) {
			setMessage(e instanceof Error ? e.message : 'Erro ao lançar venda.');
		} finally {
			setSaving(false);
		}
	}

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
				<div>
					<p>Total {money(total)}</p>
					<label className="field">
						Pagamento
						<select value={payment} onChange={(event) => setPayment(event.currentTarget.value)} required>
							{PAYMENTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
						</select>
					</label>
					<button className="button button-red" onClick={finishSale} disabled={saving || !cart.length}>
						{saving ? 'Lançando…' : 'Finalizar venda'}
					</button>
				</div>
				{message && <p className="form-message success" role="status">{message}</p>}
			</div>
		</>
	);
}

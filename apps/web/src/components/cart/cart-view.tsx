import { Link, useSearchParams } from 'react-router';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, LockKeyhole } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { STORE_NAME } from '@/data/store';

const WHATSAPP_NUMBER = '5511999999999';

export function CartView() {
  const { lines, loading, quantity, remove } = useCart();
  const [params] = useSearchParams();
  const total = lines.reduce((n, l) => n + l.price * l.quantity, 0);

  const money = (value: number) => (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  function whatsapp() {
    const items = lines.map(l => `• ${l.quantity}x ${l.title} — ${money(l.price * l.quantity)}`).join('\n');
    const message = `Olá! Quero finalizar esta compra na ${STORE_NAME}:\n\n${items}\n\nTotal: ${money(total)}\n\nPodem confirmar disponibilidade, frete e forma de pagamento?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  }

  return <main className="section cart-page"><div className="breadcrumb"><Link to="/">Início</Link><span>/</span>Carrinho</div><span className="eyebrow">SUAS ESCOLHAS, EM UM SÓ LUGAR</span><h1>Seu carrinho.</h1>{params.has('cancelado') && <div className="notice">A compra não foi finalizada. Nenhum pagamento foi realizado e seus itens continuam aqui.</div>}{loading ? <div className="empty-state" role="status">Carregando seu carrinho…</div> : !lines.length ? <div className="empty-state"><ShoppingBag size={40} strokeWidth={1.3}/><h2>Sua próxima conexão começa aqui.</h2><p>Seu carrinho está vazio. Explore o catálogo para escolher seus acessórios.</p><Link className="button" to="/catalogo">Explorar catálogo <ArrowRight size={18}/></Link></div> : <div className="cart-layout"><div className="cart-lines">{lines.map(l => <article className="cart-item" key={l.variantId}>{l.image && <img src={l.image} alt={l.title}/>}<div><h3>{l.title}</h3><p>{money(l.price)}</p><div className="quantity-control"><button aria-label={`Diminuir quantidade de ${l.title}`} onClick={() => quantity(l.variantId,l.quantity-1)} disabled={l.quantity <= 1}><Minus size={15}/></button><span>{l.quantity}</span><button aria-label={`Aumentar quantidade de ${l.title}`} onClick={() => quantity(l.variantId,l.quantity+1)}><Plus size={15}/></button></div></div><button className="remove-item" aria-label={`Remover ${l.title}`} onClick={() => remove(l.variantId)}><Trash2 size={19}/></button><strong>{money(l.price*l.quantity)}</strong></article>)}</div><aside className="cart-summary"><h2>Resumo da compra</h2><div><span>Subtotal</span><strong>{money(total)}</strong></div><p>Frete, descontos e forma de pagamento são confirmados no WhatsApp antes de finalizar.</p><button className="button button-red" onClick={whatsapp}>Finalizar pelo WhatsApp</button><span className="secure-label"><LockKeyhole size={15}/> Atendimento direto com a loja</span></aside></div>}<Link className="text-link" to="/catalogo">← Continuar explorando</Link></main>;
}

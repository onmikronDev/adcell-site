import { Link } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/cart-provider';

export function CartFloat() {
  const { lines } = useCart();
  const count = lines.reduce((total, line) => total + line.quantity, 0);

  return (
    <Link
      to="/carrinho"
      className="cart-float"
      aria-label={`Abrir carrinho com ${count} ${count === 1 ? 'item' : 'itens'}`}
    >
      <ShoppingCart size={22} />
      Carrinho
      {count > 0 && <span className="cart-float-count">{count}</span>}
    </Link>
  );
}

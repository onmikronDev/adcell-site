import { Link } from 'react-router';
import { money, whatsappLink } from '@/data/brand';
import type { PublicProduct } from '@/lib/inventory.server';
export function categoryName(product: PublicProduct) {
  const value = product.expand?.category;
  if (!value) return '';
  return Array.isArray(value) ? value.map(item => item.name).join(', ') : value.name;
}
export function InventoryGrid({ products, phone }: { products: PublicProduct[]; phone: string }) {
  if (!products.length) return <div className="empty-state"><h3>Nenhum acessório compatível ainda.</h3><p>A loja ainda não cadastrou itens para esse filtro. Fale no WhatsApp e a equipe confere o estoque.</p><a className="button button-red" href={whatsappLink(phone, 'Olá! Quero saber a disponibilidade de um acessório.')}>Chamar no WhatsApp</a></div>;
  return <div className="product-grid">{products.map(product => <article className="product-card" key={product.id}><div className="product-image">{product.photo ? <img src={product.photo} alt={product.title} /> : <span className="sku-fallback">{product.brand}</span>}{product.stock <= 0 && <span className="product-badge">Esgotado</span>}</div><h3>{product.title}</h3><p className="compat">{product.brand} · {product.model}{product.color ? ` · ${product.color}` : ''}</p><div className="product-price">{money(product.sale_price)}<span>{categoryName(product)}</span></div><a className="button button-red buy-mini" href={whatsappLink(phone, `Olá! Quero o item ${product.title} (${product.sku}) para ${product.brand} ${product.model}.`)}>Pedir no WhatsApp</a><Link className="text-link" to={`/item/${product.id}`}>Detalhes</Link></article>)}</div>;
}

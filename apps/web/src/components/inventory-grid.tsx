import { Link } from 'react-router';
import { money } from '@/data/brand';
import { useCart } from '@/components/cart-provider';
import pb from '@/lib/pocketbase-client';
import type { Product, ProductVariant } from '@/api/ecommerce-api';
import type { PublicProduct } from '@/lib/inventory.server';

export function categoryName(product: PublicProduct) {
  const value = product.expand?.category;
  if (!value) return '';
  return Array.isArray(value) ? value.map(item => item.name).join(', ') : value.name;
}

function photoUrl(product: PublicProduct) {
  if (!product.photo) return '';
  if (product.photo.startsWith('http')) return product.photo;
  return `${pb.baseUrl}/api/files/inventory_products/${product.id}/${product.photo}`;
}

function toCartProduct(product: PublicProduct): Product {
  return { id: product.id, title: product.title, image: photoUrl(product), type: { value: 'physical' }, purchasable: product.stock > 0, variants: [] } as unknown as Product;
}

function toCartVariant(product: PublicProduct): ProductVariant {
  return { id: product.id, title: product.title, image_url: photoUrl(product), price_in_cents: Math.round(product.sale_price * 100), sale_price_in_cents: Math.round(product.sale_price * 100), currency_info: null, donation: false, manage_inventory: false } as unknown as ProductVariant;
}

export function InventoryGrid({ products }: { products: PublicProduct[]; phone?: string }) {
  const { add } = useCart();
  if (!products.length) return <div className="empty-state"><h3>Nenhum acessório compatível ainda.</h3><p>A loja ainda não cadastrou itens para esse filtro. Explore o catálogo completo.</p><Link className="button" to="/catalogo">Ver catálogo</Link></div>;
  return <div className="product-grid">{products.map(product => <article className="product-card" key={product.id}><div className="product-image">{photoUrl(product) ? <img src={photoUrl(product)} alt={product.title} loading="lazy" /> : <span className="sku-fallback">{product.brand}</span>}{product.stock <= 0 && <span className="product-badge">Esgotado</span>}</div><h3>{product.title}</h3><p className="compat">{product.brand} · {product.model}{product.color ? ` · ${product.color}` : ''}</p><div className="product-price">{money(product.sale_price)}<span>{categoryName(product)}</span></div><button className="button buy-mini" type="button" disabled={product.stock <= 0} onClick={() => add(toCartProduct(product), toCartVariant(product), 1, [])}>{product.stock > 0 ? 'Adicionar ao carrinho' : 'Esgotado'}</button><Link className="text-link" to={`/item/${product.id}`}>Detalhes</Link></article>)}</div>;
}

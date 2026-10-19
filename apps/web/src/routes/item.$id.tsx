import { Link } from 'react-router';
import type { Route } from './+types/item.$id';
import { seo } from '@/lib/seo';
import { pocketbaseAdmin } from '@/lib/pocketbase-client.server';
import { money, whatsappLink, LOGO } from '@/data/brand';
import { loadSettings, type PublicProduct } from '@/lib/inventory.server';
import { categoryName } from '@/components/inventory-grid';
export async function loader({ params }: Route.LoaderArgs) {
  try {
    const product = await pocketbaseAdmin.getRecord<PublicProduct & { active?: boolean; cost_price?: number; min_stock?: number }>('inventory_products', params.id, { expand: 'category' });
    if (product.active === false) throw new Response('Indisponível', { status: 404 });
    const { cost_price: _cost, min_stock: _min, active: _active, ...safe } = product;
    return { product: safe as PublicProduct, settings: await loadSettings() };
  } catch {
    throw new Response('Produto não encontrado', { status: 404 });
  }
}
export function meta({ matches, location, loaderData }: Route.MetaArgs) {
  const product = loaderData?.product;
  return seo({ matches, location }, { title: product ? `${product.title} — ADCELL CASE` : 'Item', description: product?.description?.slice(0, 150) || 'Acessório ADCELL CASE', image: product?.photo || LOGO });
}
export default function ItemPage({ loaderData }: Route.ComponentProps) {
  const { product, settings } = loaderData;
  return <main className="section product-layout"><div className="gallery-main">{product.photo ? <img src={product.photo} alt={product.title} /> : <span>{product.brand}</span>}</div><div className="product-info"><div className="breadcrumb"><Link to="/catalogo">Catálogo</Link><span>/</span>{product.title}</div><h1>{product.title}</h1><p className="compat">{categoryName(product)} · {product.brand} {product.model} {product.color}</p><p className="detail-price">{money(product.sale_price)}</p><p className="product-description">{product.description}</p><p className="image-note">SKU {product.sku} · {product.stock > 0 ? `${product.stock} em estoque` : 'Consulte a disponibilidade'}</p>{product.film_type && <p className="image-note">Tipo de película: {product.film_type}</p>}<a className="button button-red" href={whatsappLink(settings.whatsapp, `Quero reservar ${product.title} (${product.sku}).`)}>Reservar no WhatsApp</a></div></main>;
}

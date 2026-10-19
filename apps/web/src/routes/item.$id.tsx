import { Link } from 'react-router';
import type { Route } from './+types/item.$id';
import { seo } from '@/lib/seo';
import { money, whatsappLink, LOGO } from '@/data/brand';
import { loadSettings, type PublicProduct } from '@/lib/inventory.server';
import { categoryName, photoUrl } from '@/components/inventory-grid';
import { queryOne } from '@/db.server';

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const row = await queryOne<any>(
      `SELECT p.*, c.id AS cat_id, c.name AS cat_name, c.kind AS cat_kind
       FROM inventory_products p
       LEFT JOIN inventory_categories c ON c.id = p.category_id
       WHERE p.id = ? AND p.active = 1`,
      [params.id],
    );
    if (!row) throw new Response('Produto não encontrado', { status: 404 });
    const product: PublicProduct = {
      id: String(row.id),
      title: row.title,
      brand: row.brand ?? '',
      model: row.model ?? '',
      color: row.color ?? '',
      photo: row.photo ?? '',
      photo_file: row.photo_file ?? '',
      sale_price: row.sale_price ?? 0,
      sku: row.sku ?? '',
      stock: row.stock ?? 0,
      film_type: row.film_type ?? '',
      description: row.description ?? '',
      category: row.cat_id ? [String(row.cat_id)] : [],
      expand: row.cat_id
        ? { category: { id: String(row.cat_id), name: row.cat_name, kind: row.cat_kind ?? '' } }
        : undefined,
    };
    return { product, settings: await loadSettings() };
  } catch {
    throw new Response('Produto não encontrado', { status: 404 });
  }
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
  const product = loaderData?.product;
  return seo({ matches, location }, { title: product ? `${product.title} — ADCELL CASE` : 'Item', description: product?.description?.slice(0, 150) || 'Acessório ADCELL CASE', image: product ? photoUrl(product) || LOGO : LOGO });
}

export default function ItemPage({ loaderData }: Route.ComponentProps) {
  const { product, settings } = loaderData;
  const image = photoUrl(product);
  return <main className="section product-layout"><div className="gallery-main">{image ? <img src={image} alt={product.title} /> : <span>{product.brand}</span>}</div><div className="product-info"><div className="breadcrumb"><Link to="/catalogo">Catálogo</Link><span>/</span>{product.title}</div><h1>{product.title}</h1><p className="compat">{categoryName(product)} · {product.brand} {product.model} {product.color}</p><p className="detail-price">{money(product.sale_price)}</p><p className="product-description">{product.description}</p><p className="image-note">SKU {product.sku} · {product.stock > 0 ? `${product.stock} em estoque` : 'Consulte a disponibilidade'}</p>{product.film_type && <p className="image-note">Tipo de película: {product.film_type}</p>}<a className="button button-red" href={whatsappLink(settings.whatsapp || '5511999999999', `Quero reservar ${product.title} (${product.sku}).`)}>Reservar no WhatsApp</a></div></main>;
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { Route } from './+types/item.$id';
import { seo } from '@/lib/seo';
import { money, whatsappLink, LOGO } from '@/data/brand';
import { categoryName, photoUrl } from '@/components/inventory-grid';

export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, { title: 'Item — ADCELL CASE', description: 'Acessório ADCELL CASE', image: LOGO });
}

export default function ItemPage({ params }: Route.ComponentProps) {
  const [product, setProduct] = useState<any>(null);
  const [settings, setSettings] = useState<any>({ whatsapp: '' });
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/inventory/${params.id}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => { setProduct(d.product); setSettings(d.settings || { whatsapp: '' }); })
      .catch(() => setNotFound(true));
  }, [params.id]);

  if (notFound) return <main className="section"><h1>Produto não encontrado</h1><Link to="/catalogo">Voltar ao catálogo</Link></main>;
  if (!product) return <main className="section"><p>Carregando…</p></main>;

  const image = photoUrl(product);
  return <main className="section product-layout"><div className="gallery-main">{image ? <img src={image} alt={product.title} /> : <span>{product.brand}</span>}</div><div className="product-info"><div className="breadcrumb"><Link to="/catalogo">Catálogo</Link><span>/</span>{product.title}</div><h1>{product.title}</h1><p className="compat">{categoryName(product)} · {product.brand} {product.model} {product.color}</p><p className="detail-price">{money(product.sale_price)}</p><p className="product-description">{product.description}</p><p className="image-note">SKU {product.sku} · {product.stock > 0 ? `${product.stock} em estoque` : 'Consulte a disponibilidade'}</p>{product.film_type && <p className="image-note">Tipo de película: {product.film_type}</p>}<a className="button button-red" href={whatsappLink(settings.whatsapp || '5511999999999', `Quero reservar ${product.title} (${product.sku}).`)}>Reservar no WhatsApp</a></div></main>;
}

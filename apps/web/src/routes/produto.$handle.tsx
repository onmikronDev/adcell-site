import { useEffect, useState } from 'react';
import type { Route } from './+types/produto.$handle';
import { getProductByHandle } from '@/api/ecommerce-api';
import { seo } from '@/lib/seo';
import { ProductDetails } from '@/components/product/product-details';

export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, { title: 'Produto — Conecta', description: 'Detalhes do produto.', noindex: true });
}

export default function ProductPage({ params }: Route.ComponentProps) {
  const [product, setProduct] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getProductByHandle(params.handle)
      .then(setProduct)
      .catch(() => setNotFound(true));
  }, [params.handle]);

  if (notFound) return <main className="section"><h1>Produto não encontrado</h1></main>;
  if (!product) return <main className="section"><p>Carregando…</p></main>;
  return <ProductDetails key={product.id} product={product} />;
}

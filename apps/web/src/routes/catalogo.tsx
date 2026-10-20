import { useEffect, useState } from 'react';
import type { Route } from './+types/catalogo';
import { seo } from '@/lib/seo';
import { SOCIAL_IMAGE, categories as editorial } from '@/data/store';
import { CatalogView } from '@/components/catalog/catalog-view';

export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Catálogo por modelo — ADCELL CASE', description: 'Capinhas, películas e acessórios compatíveis com a marca e o modelo do seu celular.', image: SOCIAL_IMAGE, jsonLd: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Catálogo ADCELL CASE' } }); }

export default function Catalog() {
  const [data, setData] = useState<any>({ products: [], count: 0, categories: editorial, query: '', category: '', page: 1, error: null, inventory: [], brand: '', model: '', phone: '' });
  useEffect(() => { fetch('/api/catalogo').then(r => r.ok ? r.json() : null).then(d => d && setData(prev => ({ ...prev, ...d }))).catch(() => {}); }, []);
  return <CatalogView {...data} />;
}

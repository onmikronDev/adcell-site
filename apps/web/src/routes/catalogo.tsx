import type { Route } from './+types/catalogo';
import { seo } from '@/lib/seo';
import { SOCIAL_IMAGE, categories as editorial } from '@/data/store';
import { loadProducts, loadCategories } from '@/lib/store.server';
import { loadCatalog, loadSettings } from '@/lib/inventory.server';
import { CatalogView } from '@/components/catalog/catalog-view';
export async function loader({ url }: Route.LoaderArgs) {
 const query = (url.searchParams.get('q') || '').slice(0,100); const category = url.searchParams.get('categoria') || ''; const brand = url.searchParams.get('marca') || ''; const model = url.searchParams.get('modelo') || ''; const page = Math.max(1, Math.min(100, Number(url.searchParams.get('pagina')) || 1)); const inventory = await loadCatalog(brand, model); const settings = await loadSettings(); const categories = await loadCategories(); const actualCategory = categories.find(c => c.id === category || c.title.toLocaleLowerCase('pt-BR') === editorial.find(e => e.query === category)?.name.toLocaleLowerCase('pt-BR'));
 const data = await loadProducts({ limit: query || (category && !actualCategory) ? 200 : 24, offset: query || (category && !actualCategory) ? 0 : (page-1)*24, ...(actualCategory ? { collection_ids: actualCategory.id } : {}) });
 if ((query || (category && !actualCategory)) && !data.error) {
  let offset = data.products.length;
  while (offset < data.count) {
   const next = await loadProducts({ limit: 200, offset, ...(actualCategory ? { collection_ids: actualCategory.id } : {}) });
   if (next.error || !next.products.length) break;
   data.products.push(...next.products); offset += next.products.length;
  }
 }
 const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
 const filtered = data.products.filter(p => (!query || normalize(p.title).includes(normalize(query))) && (!category || actualCategory || normalize(p.title).includes(normalize(category))));
 const localFilter = Boolean(query || (category && !actualCategory));
 return { products: localFilter ? filtered.slice((page-1)*24,page*24) : filtered, count: localFilter ? filtered.length : data.count, categories, query, category, page, error: data.error, inventory: inventory.products, brand, model, phone: settings.whatsapp };
}
export function meta({ matches, location, loaderData }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Catálogo por modelo — ADCELL CASE', description: 'Capinhas, películas e acessórios compatíveis com a marca e o modelo do seu celular.', image: SOCIAL_IMAGE, noindex: Boolean(loaderData?.query), jsonLd: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Catálogo ADCELL CASE' } }); }
export default function Catalog({ loaderData }: Route.ComponentProps) { return <CatalogView {...loaderData}/>; }

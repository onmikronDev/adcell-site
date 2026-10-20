import type { Route } from './+types/home';
import { seo } from '@/lib/seo';
import { LOGO } from '@/data/brand';
import { Hero } from '@/components/home/hero';
import { Categories } from '@/components/home/categories';
import { ValueStrip } from '@/components/home/value-strip';
import { Featured } from '@/components/home/featured';
import { StoreStory } from '@/components/home/store-story';
import { FaqBand } from '@/components/home/faq-band';
import { Reviews } from '@/components/home/reviews';

export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, { title: 'ADCELL CASE — acessórios e assistência técnica', description: 'Capas, películas, carregadores e conserto de celulares. Filtre pelo modelo do aparelho e acompanhe sua ordem de serviço.', image: LOGO, jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'ADCELL CASE' }, { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'ADCELL CASE', description: 'Venda de acessórios e assistência técnica de celulares.', image: LOGO }] });
}

export default function HomePage() {
  return <main><Hero /><ValueStrip /><Categories /><Featured products={[]} error={null} /><FaqBand /><Reviews items={[]} /><StoreStory /></main>;
}

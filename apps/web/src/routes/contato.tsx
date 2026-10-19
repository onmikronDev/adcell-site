import type { Route } from './+types/contato';
import { seo } from '@/lib/seo';
import { SOCIAL_IMAGE } from '@/data/store';
import { loadProducts } from '@/lib/store.server';
import { loadSettings } from '@/lib/inventory.server';
import { ContactContent } from '@/components/contact/contact-content';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Fale conosco — ADCELL CASE', description: 'Endereço, horário, redes sociais e formulário de contato da ADCELL CASE.', image: SOCIAL_IMAGE }); }
export async function loader() { const [data, settings] = await Promise.all([loadProducts({ type: 'booking' }), loadSettings()]); return { bookings: data.products, settings }; }
export default function Contact({ loaderData }: Route.ComponentProps) { return <ContactContent bookings={loaderData.bookings} settings={loaderData.settings}/>; }

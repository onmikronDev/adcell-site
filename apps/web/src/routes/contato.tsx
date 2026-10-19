import type { Route } from './+types/contato';
import { seo } from '@/lib/seo';
import { SOCIAL_IMAGE } from '@/data/store';
import { loadProducts } from '@/lib/store.server';
import { loadSettings } from '@/lib/inventory.server';
import { execute } from '@/db.server';
import { ContactContent } from '@/components/contact/contact-content';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Fale conosco — ADCELL CASE', description: 'Endereço, horário, redes sociais e formulário de contato da ADCELL CASE.', image: SOCIAL_IMAGE }); }
export async function loader() { const [data, settings] = await Promise.all([loadProducts({ type: 'booking' }), loadSettings()]); return { bookings: data.products, settings }; }
export async function action({ request }: { request: Request }) {
	const form = await request.formData();
	const name = String(form.get('name') || '').trim();
	const email = String(form.get('email') || '').trim();
	const subject = String(form.get('subject') || '').trim();
	const message = String(form.get('message') || '').trim();
	const consent = form.get('consent') === 'on' ? 1 : 0;
	if (!name || !email || !message) {
		return new Response('Dados inválidos', { status: 400 });
	}
	await execute(
		'INSERT INTO store_contacts (name, email, subject, message, consent) VALUES (?, ?, ?, ?, ?)',
		[name, email, subject, message, consent],
	);
	return { ok: true };
}
export default function Contact({ loaderData }: Route.ComponentProps) { return <ContactContent bookings={loaderData.bookings} settings={loaderData.settings}/>; }

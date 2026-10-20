import { useEffect, useState } from 'react';
import type { Route } from './+types/contato';
import { seo } from '@/lib/seo';
import { SOCIAL_IMAGE } from '@/data/store';
import { ContactContent } from '@/components/contact/contact-content';

export function meta({ matches, location }: Route.MetaArgs) {
	return seo({ matches, location }, { title: 'Fale conosco — ADCELL CASE', description: 'Endereço, horário, redes sociais e formulário de contato da ADCELL CASE.', image: SOCIAL_IMAGE });
}

type Bookings = any[];
type Settings = any;

export default function Contact() {
	const [bookings, setBookings] = useState<Bookings>([]);
	const [settings, setSettings] = useState<Settings | null>(null);

	useEffect(() => {
		fetch('/api/contato')
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (data?.bookings) setBookings(data.bookings);
				if (data?.settings) setSettings(data.settings);
			})
			.catch(() => {});
	}, []);

	return <ContactContent bookings={bookings} settings={settings} />;
}

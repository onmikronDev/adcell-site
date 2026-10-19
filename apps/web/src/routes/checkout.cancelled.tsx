import type { Route } from './+types/checkout.cancelled';
import { seo } from '@/lib/seo';
import { SOCIAL_IMAGE } from '@/data/store';
import { CheckoutResult } from '@/components/cart/checkout-result';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Compra não finalizada — Conecta', description: 'Sua compra não foi finalizada e nenhum pagamento foi realizado. Volte ao carrinho da Conecta para continuar quando quiser.', image: SOCIAL_IMAGE, noindex: true }); }
export default function Cancelled() { return <CheckoutResult success={false}/>; }

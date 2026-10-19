import type { Route } from './+types/checkout.success';
import { seo } from '@/lib/seo';
import { SOCIAL_IMAGE } from '@/data/store';
import { CheckoutResult } from '@/components/cart/checkout-result';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Compra concluída — Conecta', description: 'Obrigado pela sua compra na Conecta. Confira a confirmação enviada ao e-mail informado durante a finalização do pedido.', image: SOCIAL_IMAGE, noindex: true }); }
export default function Success() { return <CheckoutResult success/>; }

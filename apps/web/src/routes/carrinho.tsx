import type { Route } from './+types/carrinho';
import { seo } from '@/lib/seo';
import { SOCIAL_IMAGE } from '@/data/store';
import { CartView } from '@/components/cart/cart-view';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Seu carrinho — Conecta', description: 'Revise os acessórios escolhidos, ajuste as quantidades e continue para a finalização da sua compra na Conecta Acessórios.', image: SOCIAL_IMAGE, noindex: true }); }
export default function CartPage() { return <CartView/>; }

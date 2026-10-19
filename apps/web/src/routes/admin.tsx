import { Outlet } from 'react-router';
import type { Route } from './+types/admin';
import { seo } from '@/lib/seo';
import { AdminShell } from '@/components/admin/shell';
export function meta({ matches, location }: Route.MetaArgs) {
  return seo({ matches, location }, { title: 'Painel — ADCELL CASE', description: 'Gestão interna da ADCELL CASE.', noindex: true });
}
export default function AdminLayout() { return <AdminShell><Outlet /></AdminShell>; }

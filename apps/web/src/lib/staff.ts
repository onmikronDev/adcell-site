import { redirect } from 'react-router';
import pb from '@/lib/pocketbase-client';

export function isStaff(role: unknown) {
  return role === 'admin' || role === 'technician';
}

export function isAdmin(role: unknown) {
  return role === 'admin';
}

export function requireStaff() {
  if (!pb.authStore.isValid || !pb.authStore.record || !isStaff(pb.authStore.record.role)) {
    if (pb.authStore.record && !isStaff(pb.authStore.record.role)) pb.authStore.clear();
    throw redirect('/entrar');
  }
  return pb.authStore.record;
}

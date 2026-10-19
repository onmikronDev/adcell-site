import { redirect } from 'react-router';

export function isStaff(role: unknown) {
  return role === 'admin' || role === 'technician';
}

export function isAdmin(role: unknown) {
  return role === 'admin';
}

export function requireStaff() {
  throw redirect('/entrar');
}

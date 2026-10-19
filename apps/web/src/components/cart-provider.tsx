import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { CurrencyInfo, Product, ProductVariant } from '@/api/ecommerce-api';
export type CartLine = { productId: string; variantId: string; title: string; image: string; quantity: number; price: number; currency: CurrencyInfo | null; customFields: { custom_field_id: string; value: string }[] };
const CartContext = createContext<{ lines: CartLine[]; loading: boolean; add: (p: Product, v: ProductVariant, q: number, fields: CartLine['customFields']) => void; quantity: (id: string, q: number) => void; remove: (id: string) => void; clear: () => void } | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
 const [lines, setLines] = useState<CartLine[]>([]);
 const [loading, setLoading] = useState(true);
 useEffect(() => { try { const stored: unknown = JSON.parse(localStorage.getItem('e-commerce-cart') || '[]'); if (Array.isArray(stored)) setLines(stored.filter(l => l && typeof l.variantId === 'string' && Number.isInteger(l.quantity) && l.quantity > 0)); } catch { localStorage.removeItem('e-commerce-cart'); } setLoading(false); }, []);
 useEffect(() => { if (!loading) { try { localStorage.setItem('e-commerce-cart', JSON.stringify(lines)); } catch { /* Cart remains usable when browser storage is unavailable. */ } } }, [lines, loading]);
 const clear = useCallback(() => setLines([]), []);
 const add = (p: Product, v: ProductVariant, q: number, fields: CartLine['customFields']) => { if (p.type.value === 'booking' || v.donation) return; setLines(prev => { const found = prev.find(l => l.variantId === v.id); if (found) return prev.map(l => l.variantId === v.id ? { ...l, quantity: l.quantity + q, customFields: fields } : l); return [...prev, { productId: p.id, variantId: v.id, title: p.title + (p.variants.length > 1 ? ` — ${v.title}` : ''), image: v.image_url || p.image, quantity: q, price: v.sale_price_in_cents ?? v.price_in_cents, currency: v.currency_info, customFields: fields }]; }); };
 return <CartContext.Provider value={{ lines, loading, add, clear, quantity: (id, q) => setLines(prev => prev.map(l => l.variantId === id ? { ...l, quantity: Math.max(1, Math.min(99, q)) } : l)), remove: id => setLines(prev => prev.filter(l => l.variantId !== id)) }}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error('Carrinho indisponível.'); return context; }

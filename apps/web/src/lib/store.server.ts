import { EcommerceApiError, getProducts, getCategories, type GetProductsParams } from '@/api/ecommerce-api';
export async function loadProducts(params: GetProductsParams = {}) {
 try { const data = await getProducts({ limit: 24, sort_by: 'order', order: 'ASC', ...params, exclude_types: 'subscription' }); return { ...data, error: false }; }
 catch (error) { if (error instanceof EcommerceApiError && error.status === 404) throw new Response('Catálogo não encontrado', { status: 404 }); return { products: [], count: 0, offset: 0, limit: 24, error: true }; }
}
export async function loadCategories() { try { return (await getCategories()).categories; } catch { return []; } }

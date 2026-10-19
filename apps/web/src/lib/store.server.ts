import { EcommerceApiError, getProducts, getCategories, type GetProductsParams } from '@/api/ecommerce-api';
export async function loadProducts(params: GetProductsParams = {}) {
 try { const data = await getProducts({ limit: 24, sort_by: 'order', order: 'ASC', ...params, exclude_types: 'subscription' }); return { ...data, error: false }; }
 catch { return { products: [], count: 0, offset: 0, limit: 24, error: true }; }
}
export async function loadCategories() { try { return (await getCategories()).categories; } catch { return []; } }

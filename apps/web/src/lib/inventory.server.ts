import { pocketbaseAdmin } from '@/lib/pocketbase-client.server';

export type PublicProduct = {
  id: string;
  title: string;
  brand: string;
  model: string;
  color: string;
  photo: string;
  photo_file: string;
  sale_price: number;
  sku: string;
  stock: number;
  film_type: string;
  description: string;
  category: string[];
  expand?: { category?: { id: string; name: string; kind: string } | { id: string; name: string; kind: string }[] };
};

export type PublicCategory = { id: string; name: string; slug: string; kind: string; active: boolean };
export type StoreSettings = {
  id: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  address: string;
  maps_url: string;
  hours: string;
};
export type PublicTestimonial = { id: string; name: string; text: string; rating: number };

const strip = (row: PublicProduct): PublicProduct => {
  const { id, title, brand, model, color, photo, photo_file, sale_price, sku, stock, film_type, description, category, expand } = row;
  return { id, title, brand, model, color: color || '', photo: photo || '', photo_file: photo_file || '', sale_price: sale_price || 0, sku, stock: stock || 0, film_type: film_type || '', description: description || '', category: Array.isArray(category) ? category : category ? [category] : [], expand };
};

export async function loadCatalog(brand = '', model = '') {
  try {
    const filter = ['active = true', brand && `brand = '${brand.replaceAll("'", '')}'`, model && `model = '${model.replaceAll("'", '')}'`].filter(Boolean).join(' && ');
    const data = await pocketbaseAdmin.listRecords<PublicProduct>('inventory_products', { page: 1, perPage: 200, filter, sort: 'title', expand: 'category' });
    const categories = await pocketbaseAdmin.listRecords<PublicCategory>('categories', { page: 1, perPage: 100, filter: 'active = true', sort: 'name' });
    return { products: data.items.map(strip), categories: categories.items, error: false };
  } catch {
    return { products: [] as PublicProduct[], categories: [] as PublicCategory[], error: true };
  }
}

export async function loadSettings(): Promise<StoreSettings> {
  try {
    const data = await pocketbaseAdmin.listRecords<StoreSettings>('store_settings', { page: 1, perPage: 1 });
    return data.items[0] || { id: '', whatsapp: '', instagram: '', facebook: '', address: '', maps_url: '', hours: '' };
  } catch {
    return { id: '', whatsapp: '', instagram: '', facebook: '', address: '', maps_url: '', hours: '' };
  }
}

export async function loadTestimonials() {
  try {
    const data = await pocketbaseAdmin.listRecords<PublicTestimonial>('testimonials', { page: 1, perPage: 12, filter: 'published = true', sort: '-created' });
    return data.items;
  } catch {
    return [];
  }
}

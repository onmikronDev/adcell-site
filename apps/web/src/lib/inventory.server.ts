/**
 * Inventário, configurações da loja e depoimentos — MySQL.
 * Substitui o PocketBase; mantém os mesmos tipos e funções.
 */
import { query, queryOne } from "@/db.server";

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
  expand?: {
    category?:
      | { id: string; name: string; kind: string }
      | { id: string; name: string; kind: string }[];
  };
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  active: boolean;
};

export type StoreSettings = {
  id: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  address: string;
  maps_url: string;
  hours: string;
};

export type PublicTestimonial = {
  id: string;
  name: string;
  text: string;
  rating: number;
};

const EMPTY_SETTINGS: StoreSettings = {
  id: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  address: "",
  maps_url: "",
  hours: "",
};

export async function loadCatalog(brand = "", model = "") {
  try {
    const params: unknown[] = [];
    let sql = `
      SELECT p.*, c.id AS cat_id, c.name AS cat_name, c.kind AS cat_kind
      FROM inventory_products p
      LEFT JOIN inventory_categories c ON c.id = p.category_id
      WHERE p.active = 1
    `;
    if (brand) {
      sql += " AND p.brand = ?";
      params.push(brand);
    }
    if (model) {
      sql += " AND p.model = ?";
      params.push(model);
    }
    sql += " ORDER BY p.title ASC LIMIT 200";

    const rows = await query<any>(sql, params);
    const products: PublicProduct[] = rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      brand: row.brand ?? "",
      model: row.model ?? "",
      color: row.color ?? "",
      photo: row.photo ?? "",
      photo_file: row.photo_file ?? "",
      sale_price: row.sale_price ?? 0,
      sku: row.sku ?? "",
      stock: row.stock ?? 0,
      film_type: row.film_type ?? "",
      description: row.description ?? "",
      category: row.cat_id ? [String(row.cat_id)] : [],
      expand: row.cat_id
        ? {
            category: {
              id: String(row.cat_id),
              name: row.cat_name,
              kind: row.cat_kind ?? "",
            },
          }
        : undefined,
    }));

    const categories = await query<any>(
      "SELECT id, name, slug, kind, active FROM inventory_categories WHERE active = 1 ORDER BY name ASC LIMIT 100",
    );
    const mappedCategories: PublicCategory[] = categories.map((c) => ({
      id: String(c.id),
      name: c.name,
      slug: c.slug,
      kind: c.kind ?? "",
      active: !!c.active,
    }));

    return { products, categories: mappedCategories, error: false };
  } catch {
    return {
      products: [] as PublicProduct[],
      categories: [] as PublicCategory[],
      error: true,
    };
  }
}

export async function loadSettings(): Promise<StoreSettings> {
  try {
    const row = await queryOne<any>(
      "SELECT id, whatsapp, instagram, facebook, address, maps_url, hours FROM store_settings ORDER BY id ASC LIMIT 1",
    );
    if (!row) return EMPTY_SETTINGS;
    return {
      id: String(row.id),
      whatsapp: row.whatsapp ?? "",
      instagram: row.instagram ?? "",
      facebook: row.facebook ?? "",
      address: row.address ?? "",
      maps_url: row.maps_url ?? "",
      hours: row.hours ?? "",
    };
  } catch {
    return EMPTY_SETTINGS;
  }
}

export async function loadTestimonials(): Promise<PublicTestimonial[]> {
  try {
    const rows = await query<any>(
      "SELECT id, name, text, rating FROM testimonials WHERE published = 1 ORDER BY created DESC LIMIT 12",
    );
    return rows.map((t) => ({
      id: String(t.id),
      name: t.name,
      text: t.text,
      rating: t.rating ?? 5,
    }));
  } catch {
    return [];
  }
}

/**
 * Camada de dados da loja — MySQL.
 * Mantém o mesmo contrato usado pelas rotas (loadProducts/loadCategories),
 * mas agora lê do banco via @/api/store.server.
 */
import {
  getProducts,
  getCategories,
  type Produto,
} from "@/api/store.server";

export type LoadedProduct = {
  id: string;
  url_handle: string;
  title: string;
  subtitle: string | null;
  description: string;
  image: string;
  price_in_cents: number;
  price_formatted: string;
  purchasable: boolean;
  collections: { collection_id: string }[];
  type: { value: string };
};

export type LoadedCategory = {
  id: string;
  title: string;
  slug: string;
};

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function mapProduto(p: Produto): LoadedProduct {
  const priceInCents = p.preco_promocional_centavos ?? p.preco_centavos;
  return {
    id: String(p.id),
    url_handle: p.slug,
    title: p.nome,
    subtitle: null,
    description: p.descricao ?? "",
    image: p.foto ?? "",
    price_in_cents: priceInCents,
    price_formatted: formatBRL(priceInCents),
    purchasable: p.ativo,
    collections: p.categoria ? [{ collection_id: p.categoria.slug }] : [],
    type: { value: "physical" },
  };
}

export async function loadProducts(params: {
  limit?: number;
  offset?: number;
  collection_ids?: string | string[];
} = {}): Promise<{
  products: LoadedProduct[];
  count: number;
  offset: number;
  limit: number;
  error: boolean;
}> {
  try {
    const { limit = 24, offset = 0, collection_ids } = params;
    const categorySlug = Array.isArray(collection_ids)
      ? collection_ids[0]
      : collection_ids;
    const produtos = await getProducts({
      categorySlug: categorySlug || undefined,
      limit,
      offset,
    });
    return {
      products: produtos.map(mapProduto),
      count: produtos.length,
      offset,
      limit,
      error: false,
    };
  } catch {
    return { products: [], count: 0, offset: 0, limit: 24, error: true };
  }
}

export async function loadCategories(): Promise<LoadedCategory[]> {
  try {
    const categorias = await getCategories();
    return categorias.map((c) => ({
      id: c.slug,
      title: c.nome,
      slug: c.slug,
    }));
  } catch {
    return [];
  }
}

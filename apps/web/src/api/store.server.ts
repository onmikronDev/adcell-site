/**
 * Camada de dados da loja — MySQL.
 * Substitui gradualmente a ecommerce-api.ts (Hostinger Store).
 * Preços são sempre em centavos.
 */
import { query, queryOne, insert, execute } from "~/db.server";

export type Categoria = {
  id: number;
  nome: string;
  slug: string;
  criado_em: string;
};

export type Produto = {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  preco_centavos: number;
  preco_promocional_centavos: number | null;
  foto: string | null;
  destaque: boolean;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  categoria: { id: number; nome: string; slug: string } | null;
};

const PRODUTO_SELECT = `
  SELECT p.*, c.id AS categoria_id, c.nome AS categoria_nome, c.slug AS categoria_slug
  FROM produtos p
  LEFT JOIN categorias c ON c.id = p.categoria_id
`;

function mapProduto(row: any): Produto {
  return {
    id: row.id,
    nome: row.nome,
    slug: row.slug,
    descricao: row.descricao,
    preco_centavos: row.preco_centavos,
    preco_promocional_centavos: row.preco_promocional_centavos,
    foto: row.foto,
    destaque: !!row.destaque,
    ativo: !!row.ativo,
    criado_em: row.criado_em,
    atualizado_em: row.atualizado_em,
    categoria: row.categoria_id
      ? { id: row.categoria_id, nome: row.categoria_nome, slug: row.categoria_slug }
      : null,
  };
}

export async function getCategories(): Promise<Categoria[]> {
  return query<Categoria>(
    "SELECT id, nome, slug, criado_em FROM categorias ORDER BY nome ASC",
  );
}

export async function getCategoryBySlug(slug: string): Promise<Categoria | null> {
  return queryOne<Categoria>(
    "SELECT id, nome, slug, criado_em FROM categorias WHERE slug = ?",
    [slug],
  );
}

export async function getProducts(options: {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
} = {}): Promise<Produto[]> {
  const { categorySlug, featured, limit = 50, offset = 0, includeInactive = false } = options;
  const params: unknown[] = [];
  let sql = PRODUTO_SELECT;
  const where: string[] = [];

  if (!includeInactive) where.push("p.ativo = 1");
  if (categorySlug) {
    where.push("c.slug = ?");
    params.push(categorySlug);
  }
  if (featured) {
    where.push("p.destaque = 1");
  }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY p.criado_em DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const rows = await query<any>(sql, params);
  return rows.map(mapProduto);
}

export async function getProductBySlug(slug: string): Promise<Produto | null> {
  const row = await queryOne<any>(
    PRODUTO_SELECT + " WHERE p.slug = ? AND p.ativo = 1",
    [slug],
  );
  return row ? mapProduto(row) : null;
}

export async function searchProducts(term: string, limit = 20): Promise<Produto[]> {
  const like = `%${term}%`;
  const rows = await query<any>(
    PRODUTO_SELECT +
      " WHERE p.ativo = 1 AND (p.nome LIKE ? OR p.descricao LIKE ?) ORDER BY p.nome ASC LIMIT ?",
    [like, like, limit],
  );
  return rows.map(mapProduto);
}

export type ProdutoInput = {
  nome: string;
  slug: string;
  descricao?: string | null;
  preco_centavos: number;
  preco_promocional_centavos?: number | null;
  categoria_id?: number | null;
  foto?: string | null;
  destaque?: boolean;
  ativo?: boolean;
};

export async function createProduto(data: ProdutoInput): Promise<number> {
  return insert(
    `INSERT INTO produtos
      (nome, slug, descricao, preco_centavos, preco_promocional_centavos, categoria_id, foto, destaque, ativo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nome,
      data.slug,
      data.descricao ?? null,
      data.preco_centavos,
      data.preco_promocional_centavos ?? null,
      data.categoria_id ?? null,
      data.foto ?? null,
      data.destaque ?? false,
      data.ativo ?? true,
    ],
  );
}

export async function updateProduto(id: number, data: Partial<ProdutoInput>): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];
  const map: Record<string, unknown> = {
    nome: data.nome,
    slug: data.slug,
    descricao: data.descricao,
    preco_centavos: data.preco_centavos,
    preco_promocional_centavos: data.preco_promocional_centavos,
    categoria_id: data.categoria_id,
    foto: data.foto,
    destaque: data.destaque,
    ativo: data.ativo,
  };
  for (const [key, value] of Object.entries(map)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      params.push(value);
    }
  }
  if (!fields.length) return;
  params.push(id);
  await execute(`UPDATE produtos SET ${fields.join(", ")} WHERE id = ?`, params);
}

export async function deleteProduto(id: number): Promise<void> {
  await execute("DELETE FROM produtos WHERE id = ?", [id]);
}

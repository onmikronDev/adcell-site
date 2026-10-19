import mysql from "mysql2/promise";
import { createHash } from "node:crypto";

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var __schemaReady: Promise<void> | undefined;
}

function getConfig() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    throw new Error(
      "Variáveis de ambiente do MySQL ausentes: DB_HOST, DB_USER, DB_NAME",
    );
  }

  return { host, user, password, database };
}

export const pool: mysql.Pool =
  global.__mysqlPool ??
  mysql.createPool({
    ...getConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4",
    timezone: "Z",
    dateStrings: true,
  });

if (process.env.NODE_ENV !== "production") {
  global.__mysqlPool = pool;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL UNIQUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    descricao TEXT NULL,
    preco_centavos INT NOT NULL DEFAULT 0,
    preco_promocional_centavos INT NULL,
    foto VARCHAR(500) NULL,
    destaque TINYINT(1) NOT NULL DEFAULT 0,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    categoria_id INT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  )`,
  `CREATE TABLE IF NOT EXISTS inventory_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    kind VARCHAR(40) NOT NULL DEFAULT 'outro',
    active TINYINT(1) NOT NULL DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS inventory_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    brand VARCHAR(120) NULL,
    model VARCHAR(120) NULL,
    color VARCHAR(120) NULL,
    sku VARCHAR(80) NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 1,
    sale_price INT NOT NULL DEFAULT 0,
    cost_price INT NOT NULL DEFAULT 0,
    film_type VARCHAR(80) NULL,
    description TEXT NULL,
    photo VARCHAR(500) NULL,
    photo_file VARCHAR(300) NULL,
    category_id INT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES inventory_categories(id)
  )`,
  `CREATE TABLE IF NOT EXISTS technicians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS service_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    os_number VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(160) NOT NULL,
    cpf VARCHAR(20) NULL,
    whatsapp VARCHAR(30) NULL,
    email VARCHAR(160) NULL,
    brand VARCHAR(80) NULL,
    model VARCHAR(120) NULL,
    imei VARCHAR(60) NULL,
    problem TEXT NULL,
    checklist TEXT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'em_analise',
    technician VARCHAR(160) NULL,
    public_note TEXT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS os_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status VARCHAR(40) NOT NULL,
    note TEXT NULL,
    parts VARCHAR(300) NULL,
    author VARCHAR(120) NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES service_orders(id)
  )`,
  `CREATE TABLE IF NOT EXISTS problem_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    whatsapp VARCHAR(30) NOT NULL,
    email VARCHAR(160) NULL,
    brand VARCHAR(80) NULL,
    model VARCHAR(120) NULL,
    problem TEXT NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'novo',
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS store_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    email VARCHAR(160) NOT NULL,
    subject VARCHAR(200) NULL,
    message TEXT NOT NULL,
    consent TINYINT(1) NOT NULL DEFAULT 0,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS counter_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment VARCHAR(20) NOT NULL,
    total INT NOT NULL DEFAULT 0,
    cost_total INT NOT NULL DEFAULT 0,
    note VARCHAR(200) NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NULL,
    title VARCHAR(200) NOT NULL,
    category_name VARCHAR(120) NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price INT NOT NULL DEFAULT 0,
    unit_cost INT NOT NULL DEFAULT 0,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES counter_sales(id)
  )`,
  `CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(160) NOT NULL UNIQUE,
    senha_hash VARCHAR(64) NOT NULL,
    role VARCHAR(40) NOT NULL DEFAULT 'admin',
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
];

async function runSchema() {
  for (const sql of SCHEMA) {
    await pool.query(sql);
  }
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM admin_users");
  const total = Number((rows as any[])[0]?.total || 0);
  if (!total) {
    const hash = createHash("sha256").update("admin123").digest("hex");
    await pool.query(
      "INSERT INTO admin_users (email, senha_hash, role) VALUES (?, ?, 'admin')",
      ["admin@adcellcase.com", hash],
    );
  }
}

export function ensureSchema(): Promise<void> {
  global.__schemaReady ??= runSchema().catch((error) => {
    global.__schemaReady = undefined;
    throw error;
  });
  return global.__schemaReady;
}

function friendlyError(error: unknown): never {
  if (error instanceof AggregateError) {
    throw new Error(
      "Falha na conexão MySQL: verifique se o MariaDB/MySQL está rodando e se DB_HOST, DB_USER, DB_PASSWORD e DB_NAME estão corretos no .env. Se DB_HOST for 'localhost', tente '127.0.0.1'.",
    );
  }
  throw error;
}

export async function query<T = any>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  try {
    await ensureSchema();
    const [rows] = await pool.query(sql, params);
    return rows as T[];
  } catch (error) {
    friendlyError(error);
  }
}

export async function queryOne<T = any>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function insert(sql: string, params: unknown[] = []) {
  try {
    await ensureSchema();
    const [result] = await pool.query(sql, params);
    const { insertId } = result as mysql.ResultSetHeader;
    return insertId;
  } catch (error) {
    friendlyError(error);
  }
}

export async function execute(sql: string, params: unknown[] = []) {
  try {
    await ensureSchema();
    const [result] = await pool.query(sql, params);
    return result as mysql.ResultSetHeader;
  } catch (error) {
    friendlyError(error);
  }
}

export async function checkConnection() {
  const row = await queryOne<{ ok: number }>("SELECT 1 AS ok");
  return row?.ok === 1;
}

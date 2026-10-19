import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
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

export async function query<T = any>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

export async function queryOne<T = any>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function insert(sql: string, params: unknown[] = []) {
  const [result] = await pool.query(sql, params);
  const { insertId } = result as mysql.ResultSetHeader;
  return insertId;
}

export async function execute(sql: string, params: unknown[] = []) {
  const [result] = await pool.query(sql, params);
  return result as mysql.ResultSetHeader;
}

export async function checkConnection() {
  const row = await queryOne<{ ok: number }>("SELECT 1 AS ok");
  return row?.ok === 1;
}

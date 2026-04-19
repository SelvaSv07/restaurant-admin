import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/db/schema";

const globalForDb = globalThis as unknown as { pool?: Pool };

function createPool() {
  const url =
    process.env.DATABASE_URL ?? "postgresql://localhost:5432/restaurant_admin";
  return new Pool({ connectionString: url, max: 10 });
}

export const pool = globalForDb.pool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export type DbClient = typeof db;

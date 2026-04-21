import { and, desc, eq, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { cloudInventoryItems, stores } from "@/lib/db/schema";
import type { StoreScope } from "@/lib/store-cookie";

export type InventoryListStatus = "all" | "available" | "low" | "out";

/** Matches `getInventoryStatus` in `lib/inventory.ts` (POS parity). */
const invOut = sql`${cloudInventoryItems.quantity} <= 0`;

const invLow = sql`(
  ${cloudInventoryItems.quantity} > 0
  AND (
    (${cloudInventoryItems.reorderQty} > 0 AND ${cloudInventoryItems.quantity} <= ${cloudInventoryItems.reorderQty})
    OR (
      ${cloudInventoryItems.maxStock} IS NOT NULL
      AND ${cloudInventoryItems.maxStock} > 0
      AND ${cloudInventoryItems.quantity} * 100 < ${cloudInventoryItems.maxStock} * 20
    )
  )
)`;

const invAvailable = sql`(
  ${cloudInventoryItems.quantity} > 0
  AND NOT (
    (${cloudInventoryItems.reorderQty} > 0 AND ${cloudInventoryItems.quantity} <= ${cloudInventoryItems.reorderQty})
    OR (
      ${cloudInventoryItems.maxStock} IS NOT NULL
      AND ${cloudInventoryItems.maxStock} > 0
      AND ${cloudInventoryItems.quantity} * 100 < ${cloudInventoryItems.maxStock} * 20
    )
  )
)`;

function storeFilter(scope: StoreScope): SQL | undefined {
  if (scope === "all") return undefined;
  return eq(cloudInventoryItems.storeId, scope);
}

function buildListWhere(scope: StoreScope, q: string, status: InventoryListStatus): SQL | undefined {
  const clauses: SQL[] = [];
  const sf = storeFilter(scope);
  if (sf) clauses.push(sf);

  const trimmed = q.trim();
  if (trimmed) {
    clauses.push(sql`lower(${cloudInventoryItems.name}) like ${`%${trimmed.toLowerCase()}%`}`);
  }

  if (status === "out") clauses.push(invOut);
  else if (status === "low") clauses.push(invLow);
  else if (status === "available") clauses.push(invAvailable);

  if (clauses.length === 0) return undefined;
  return clauses.length === 1 ? clauses[0]! : and(...clauses)!;
}

export async function getAdminInventoryOverview(scope: StoreScope) {
  const base = storeFilter(scope);
  const whereBase = base ?? sql`true`;

  const [{ totalProducts }] = await db
    .select({ totalProducts: sql<number>`count(*)::int` })
    .from(cloudInventoryItems)
    .where(whereBase);

  const [{ outCount }] = await db
    .select({ outCount: sql<number>`count(*)::int` })
    .from(cloudInventoryItems)
    .where(base ? and(base, invOut)! : invOut);

  const [{ lowCount }] = await db
    .select({ lowCount: sql<number>`count(*)::int` })
    .from(cloudInventoryItems)
    .where(base ? and(base, invLow)! : invLow);

  const [{ inCount }] = await db
    .select({ inCount: sql<number>`count(*)::int` })
    .from(cloudInventoryItems)
    .where(base ? and(base, invAvailable)! : invAvailable);

  return {
    totalProducts: Number(totalProducts ?? 0),
    inCount: Number(inCount ?? 0),
    lowCount: Number(lowCount ?? 0),
    outCount: Number(outCount ?? 0),
  };
}

export async function getInventoryPage(params: {
  scope: StoreScope;
  q: string;
  status: InventoryListStatus;
  page: number;
  pageSize: number;
}) {
  const { scope, q, status, page, pageSize } = params;

  const where = buildListWhere(scope, q, status);

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(cloudInventoryItems)
    .where(where ?? sql`true`);

  const total = Number(n ?? 0);
  const offset = Math.max(0, (page - 1) * pageSize);

  const rows = await db
    .select({
      item: cloudInventoryItems,
      storeName: stores.name,
    })
    .from(cloudInventoryItems)
    .innerJoin(stores, eq(stores.id, cloudInventoryItems.storeId))
    .where(where ?? sql`true`)
    .orderBy(desc(cloudInventoryItems.updatedAt))
    .limit(pageSize)
    .offset(offset);

  return {
    items: rows,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

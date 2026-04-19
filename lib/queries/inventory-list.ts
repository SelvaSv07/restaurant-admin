import { and, desc, eq, like, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { cloudInventoryItems, stores } from "@/lib/db/schema";
import type { StoreScope } from "@/lib/store-cookie";

export async function getInventoryPage(params: {
  scope: StoreScope;
  q: string;
  page: number;
  pageSize: number;
}) {
  const { scope, q, page, pageSize } = params;

  const clauses: SQL[] = [];
  if (scope !== "all") clauses.push(eq(cloudInventoryItems.storeId, scope));
  const trimmed = q.trim();
  if (trimmed) clauses.push(like(cloudInventoryItems.name, `%${trimmed}%`));

  const where = clauses.length ? and(...clauses)! : undefined;

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

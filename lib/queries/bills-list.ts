import { and, desc, eq, gte, like, lte, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { cloudBills, stores } from "@/lib/db/schema";
import type { StoreScope } from "@/lib/store-cookie";

export type BillsListStatus = "all" | "draft" | "completed" | "voided";

function inDateRange(from: Date, to: Date, scope: StoreScope) {
  const parts: SQL[] = [gte(cloudBills.createdAt, from), lte(cloudBills.createdAt, to)];
  if (scope !== "all") parts.push(eq(cloudBills.storeId, scope));
  return and(...parts)!;
}

export async function getBillsPage(params: {
  scope: StoreScope;
  from: Date;
  to: Date;
  status: BillsListStatus;
  q: string;
  page: number;
  pageSize: number;
}) {
  const { scope, from, to, status, q, page, pageSize } = params;

  const clauses: SQL[] = [inDateRange(from, to, scope)];
  if (status !== "all") clauses.push(eq(cloudBills.status, status));
  const trimmed = q.trim();
  if (trimmed) {
    clauses.push(like(cloudBills.billNumber, `%${trimmed}%`));
  }

  const where = and(...clauses)!;

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(cloudBills)
    .where(where);

  const total = Number(n ?? 0);
  const offset = Math.max(0, (page - 1) * pageSize);

  const rows = await db
    .select({
      bill: cloudBills,
      storeName: stores.name,
    })
    .from(cloudBills)
    .innerJoin(stores, eq(stores.id, cloudBills.storeId))
    .where(where)
    .orderBy(desc(cloudBills.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    items: rows,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

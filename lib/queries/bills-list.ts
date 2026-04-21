import { and, desc, eq, gte, inArray, like, lte, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { cloudBillLines, cloudBills, stores } from "@/lib/db/schema";
import type { StoreScope } from "@/lib/store-cookie";

export type BillsListStatus = "all" | "draft" | "completed" | "voided";

/** Bills with at least one line and positive total line qty (matches POS list). */
const billHasPositiveLineQty = sql`(select coalesce(sum(${cloudBillLines.qty}), 0) from ${cloudBillLines} where ${cloudBillLines.storeId} = ${cloudBills.storeId} and ${cloudBillLines.deviceBillId} = ${cloudBills.deviceBillId}) > 0`;

function inDateRange(from: Date, to: Date, scope: StoreScope) {
  const parts: SQL[] = [gte(cloudBills.createdAt, from), lte(cloudBills.createdAt, to)];
  if (scope !== "all") parts.push(eq(cloudBills.storeId, scope));
  return and(...parts)!;
}

function listWhere(scope: StoreScope, from: Date, to: Date, status: BillsListStatus, q: string) {
  const clauses: SQL[] = [inDateRange(from, to, scope), billHasPositiveLineQty];
  if (status !== "all") clauses.push(eq(cloudBills.status, status));
  const trimmed = q.trim();
  if (trimmed) {
    clauses.push(like(cloudBills.billNumber, `%${trimmed}%`));
  }
  return and(...clauses)!;
}

export async function getAdminBillStatusCounts(scope: StoreScope, from: Date, to: Date) {
  const where = and(inDateRange(from, to, scope), billHasPositiveLineQty)!;
  const rows = await db
    .select({
      status: cloudBills.status,
      count: sql<number>`count(*)::int`,
    })
    .from(cloudBills)
    .where(where)
    .groupBy(cloudBills.status);

  let draft = 0;
  let completed = 0;
  let voided = 0;
  for (const r of rows) {
    const n = Number(r.count);
    if (r.status === "draft") draft = n;
    else if (r.status === "completed") completed = n;
    else if (r.status === "voided") voided = n;
  }
  return { total: draft + completed, draft, completed, voided };
}

export async function getAdminOrderTypeCounts(scope: StoreScope, from: Date, to: Date) {
  const where = and(
    inDateRange(from, to, scope),
    billHasPositiveLineQty,
    inArray(cloudBills.status, ["draft", "completed"]),
  )!;

  const rows = await db
    .select({
      orderType: cloudBills.orderType,
      count: sql<number>`count(*)::int`,
    })
    .from(cloudBills)
    .where(where)
    .groupBy(cloudBills.orderType);

  let dineIn = 0;
  let takeaway = 0;
  for (const r of rows) {
    const n = Number(r.count);
    if (r.orderType === "dine_in") dineIn = n;
    else if (r.orderType === "takeaway") takeaway = n;
  }
  return { dineIn, takeaway, total: dineIn + takeaway };
}

export type BillLineQtyKey = `${string}:${number}`;

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

  const where = listWhere(scope, from, to, status, q);

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

  const lineQtyByBillKey: Map<BillLineQtyKey, number> = new Map();
  if (rows.length > 0) {
    const orClauses = rows.map(({ bill: b }) =>
      and(eq(cloudBillLines.storeId, b.storeId), eq(cloudBillLines.deviceBillId, b.deviceBillId)),
    );
    const qtyRows = await db
      .select({
        storeId: cloudBillLines.storeId,
        deviceBillId: cloudBillLines.deviceBillId,
        qty: sql<number>`coalesce(sum(${cloudBillLines.qty}), 0)::int`,
      })
      .from(cloudBillLines)
      .where(or(...orClauses))
      .groupBy(cloudBillLines.storeId, cloudBillLines.deviceBillId);

    for (const r of qtyRows) {
      const key = `${r.storeId}:${r.deviceBillId}` as BillLineQtyKey;
      lineQtyByBillKey.set(key, Number(r.qty));
    }
  }

  return {
    items: rows,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    lineQtyByBillKey,
  };
}

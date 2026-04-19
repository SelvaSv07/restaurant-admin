import { and, desc, eq, gte, inArray, lte, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { cloudBillLines, cloudBills, stores } from "@/lib/db/schema";
import { pctChange } from "@/lib/dashboard-trends";
import {
  chartBucketForPreset,
  resolvePreviousComparisonRange,
  type PeriodPreset,
} from "@/lib/ist";
import type { StoreScope } from "@/lib/store-cookie";

export type DashboardChartPoint = { label: string; revenue: number };

function execRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows: unknown }).rows)
  ) {
    return (result as { rows: T[] }).rows;
  }
  return [];
}

function billRangeWhere(scope: StoreScope, from: Date, to: Date): SQL {
  const parts: SQL[] = [
    gte(cloudBills.createdAt, from),
    lte(cloudBills.createdAt, to),
  ];
  if (scope !== "all") parts.push(eq(cloudBills.storeId, scope));
  return and(...parts)!;
}

async function sumCompletedRevenue(scope: StoreScope, from: Date, to: Date): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${cloudBills.totalRupee}), 0)` })
    .from(cloudBills)
    .where(and(eq(cloudBills.status, "completed"), billRangeWhere(scope, from, to)));

  return Number(row?.total ?? 0);
}

async function countCompletedBills(scope: StoreScope, from: Date, to: Date): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(cloudBills)
    .where(and(eq(cloudBills.status, "completed"), billRangeWhere(scope, from, to)));

  return Number(row?.n ?? 0);
}

async function sumItemsSold(scope: StoreScope, from: Date, to: Date): Promise<number> {
  const joinOn = and(
    eq(cloudBillLines.storeId, cloudBills.storeId),
    eq(cloudBillLines.deviceBillId, cloudBills.deviceBillId),
  );

  const billWhere = and(eq(cloudBills.status, "completed"), billRangeWhere(scope, from, to));

  const [row] = await db
    .select({ n: sql<number>`coalesce(sum(${cloudBillLines.qty}), 0)` })
    .from(cloudBillLines)
    .innerJoin(cloudBills, joinOn)
    .where(billWhere);

  return Number(row?.n ?? 0);
}

async function chartSeries(
  scope: StoreScope,
  from: Date,
  to: Date,
  period: PeriodPreset,
): Promise<DashboardChartPoint[]> {
  const bucket = chartBucketForPreset(period);

  const storeSql =
    scope === "all"
      ? sql`true`
      : sql`cb.store_id = ${scope}::uuid`;

  if (bucket === "hour") {
    const rows = await db.execute(sql`
      select to_char(cb.created_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI') as bucket,
             coalesce(sum(cb.total_rupee), 0)::int as revenue
      from cloud_bills cb
      where cb.status = 'completed'
        and cb.created_at >= ${from}
        and cb.created_at <= ${to}
        and ${storeSql}
      group by 1
      order by 1
    `);

    const list = execRows<{ bucket: string; revenue: number }>(rows);
    return list.map((r) => ({
      label: String(r.bucket ?? ""),
      revenue: Number(r.revenue ?? 0),
    }));
  }

  if (bucket === "month") {
    const rows = await db.execute(sql`
      select to_char(date_trunc('month', cb.created_at at time zone 'Asia/Kolkata'), 'YYYY-MM') as bucket,
             coalesce(sum(cb.total_rupee), 0)::int as revenue
      from cloud_bills cb
      where cb.status = 'completed'
        and cb.created_at >= ${from}
        and cb.created_at <= ${to}
        and ${storeSql}
      group by 1
      order by 1
    `);

    const list = execRows<{ bucket: string; revenue: number }>(rows);
    return list.map((r) => ({
      label: String(r.bucket ?? ""),
      revenue: Number(r.revenue ?? 0),
    }));
  }

  const rows = await db.execute(sql`
    select to_char(date_trunc('day', cb.created_at at time zone 'Asia/Kolkata'), 'YYYY-MM-DD') as bucket,
           coalesce(sum(cb.total_rupee), 0)::int as revenue
    from cloud_bills cb
    where cb.status = 'completed'
      and cb.created_at >= ${from}
      and cb.created_at <= ${to}
      and ${storeSql}
    group by 1
    order by 1
  `);

  const list = execRows<{ bucket: string; revenue: number }>(rows);
  return list.map((r) => ({
    label: String(r.bucket ?? ""),
    revenue: Number(r.revenue ?? 0),
  }));
}

export async function getDashboardPageData(
  scope: StoreScope,
  range: { from: Date; to: Date },
  opts: { period: PeriodPreset },
) {
  const { prevFrom, prevTo } = resolvePreviousComparisonRange(opts.period, range.from, range.to);

  const revenue = await sumCompletedRevenue(scope, range.from, range.to);
  const prevRevenue = await sumCompletedRevenue(scope, prevFrom, prevTo);
  const orders = await countCompletedBills(scope, range.from, range.to);
  const prevOrders = await countCompletedBills(scope, prevFrom, prevTo);
  const itemsSold = await sumItemsSold(scope, range.from, range.to);
  const prevItemsSold = await sumItemsSold(scope, prevFrom, prevTo);

  const chart = await chartSeries(scope, range.from, range.to, opts.period);

  return {
    stats: {
      totalRupee: revenue,
      billCount: orders,
      revenueTrendPct: pctChange(revenue, prevRevenue),
      ordersTrendPct: pctChange(orders, prevOrders),
      itemsTrendPct: pctChange(itemsSold, prevItemsSold),
    },
    itemsSold,
    chart,
  };
}

export async function getRecentBillsAdmin(
  scope: StoreScope,
  range: { from: Date; to: Date },
  limit: number,
) {
  const parts: SQL[] = [
    inArray(cloudBills.status, ["draft", "completed"]),
    gte(cloudBills.createdAt, range.from),
    lte(cloudBills.createdAt, range.to),
  ];
  if (scope !== "all") parts.push(eq(cloudBills.storeId, scope));

  const list = await db
    .select({
      bill: cloudBills,
      storeName: stores.name,
    })
    .from(cloudBills)
    .innerJoin(stores, eq(stores.id, cloudBills.storeId))
    .where(and(...parts))
    .orderBy(desc(cloudBills.createdAt))
    .limit(limit);

  if (list.length === 0) return [];

  const tuples = list.map((r) =>
    and(eq(cloudBillLines.storeId, r.bill.storeId), eq(cloudBillLines.deviceBillId, r.bill.deviceBillId)),
  );

  const lineWhere = tuples.length === 1 ? tuples[0]! : or(...tuples)!;

  const lines = await db.select().from(cloudBillLines).where(lineWhere);

  const byKey = new Map<string, typeof lines>();
  for (const line of lines) {
    const key = `${line.storeId}:${line.deviceBillId}`;
    const arr = byKey.get(key) ?? [];
    arr.push(line);
    byKey.set(key, arr);
  }

  return list.map(({ bill, storeName }) => {
    const key = `${bill.storeId}:${bill.deviceBillId}`;
    const bl = byKey.get(key) ?? [];
    const menuLabel = bl[0]?.productNameSnapshot ?? "—";
    const qty = bl.reduce((s, l) => s + l.qty, 0);
    return { bill, storeName, menuLabel, qty };
  });
}

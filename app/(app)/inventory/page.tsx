import { Suspense } from "react";

import { AdminInventoryProductsTable } from "@/components/app/admin-inventory-products-table";
import { InventoryStockLevelCard } from "@/components/app/inventory-stock-level-card";
import { InventoryToolbar } from "@/components/app/inventory-toolbar";
import {
  getAdminInventoryOverview,
  getInventoryPage,
  type InventoryListStatus,
} from "@/lib/queries/inventory-list";
import { getStoreScopeFromCookie } from "@/lib/store-cookie";

const PAGE_SIZE = 10;

type Search = {
  q?: string;
  status?: string;
  page?: string;
};

function parseStatus(raw: string | undefined): InventoryListStatus {
  if (raw === "available" || raw === "low" || raw === "out") return raw;
  return "all";
}

export default async function InventoryPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const scope = await getStoreScopeFromCookie();
  const q = (params.q ?? "").trim();
  const status = parseStatus(params.status);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const overview = await getAdminInventoryOverview(scope);

  const listFirst = await getInventoryPage({
    scope,
    q,
    status,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(listFirst.total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const listResult =
    safePage === page
      ? listFirst
      : await getInventoryPage({
          scope,
          q,
          status,
          page: safePage,
          pageSize: PAGE_SIZE,
        });

  function hrefForPage(p: number) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", params.q ?? "");
    if (status !== "all") sp.set("status", status);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `/inventory?${s}` : "/inventory";
  }

  return (
    <div className="min-w-0 space-y-6">
      <InventoryStockLevelCard
        totalProducts={overview.totalProducts}
        inCount={overview.inCount}
        lowCount={overview.lowCount}
        outCount={overview.outCount}
      />

      <div className="rounded-xl bg-white p-4 shadow-none ring-1 ring-black/[0.06]">
        <Suspense fallback={<div className="h-14 rounded-xl bg-white/60" />}>
          <InventoryToolbar />
        </Suspense>
        <div className="mt-4">
          <AdminInventoryProductsTable
            rows={listResult.items.map((r) => r.item)}
            page={safePage}
            pageSize={PAGE_SIZE}
            totalFiltered={listResult.total}
            hrefForPage={hrefForPage}
          />
        </div>
      </div>
    </div>
  );
}

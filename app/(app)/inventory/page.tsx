import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getInventoryPage } from "@/lib/queries/inventory-list";
import { getStoreScopeFromCookie } from "@/lib/store-cookie";

const PAGE_SIZE = 25;

type Search = {
  q?: string;
  page?: string;
};

export default async function InventoryPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const scope = await getStoreScopeFromCookie();
  const q = params.q ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const { items, total, totalPages } = await getInventoryPage({
    scope,
    q,
    page,
    pageSize: PAGE_SIZE,
  });

  const base = new URLSearchParams();
  if (q.trim()) base.set("q", q.trim());

  function hrefForPage(p: number) {
    const sp = new URLSearchParams(base.toString());
    if (p <= 1) sp.delete("page");
    else sp.set("page", String(p));
    return `/inventory?${sp.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#333]">Inventory</h1>
          <p className="mt-1 text-sm text-[#858585]">
            Latest quantities synced from each restaurant&apos;s POS.
          </p>
        </div>
        <form className="flex w-full max-w-md gap-2 sm:w-auto" action="/inventory" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search item name"
            className="h-10 w-full rounded-full border-0 bg-[#f7f7f7] px-4 text-sm ring-1 ring-[#ebebeb] outline-none focus:ring-2 focus:ring-[#ff6b1e]/35"
          />
        </form>
      </header>

      <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(51,51,51,0.06)] ring-1 ring-[#ebebeb]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Reorder</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(({ item, storeName }) => (
              <TableRow key={`${item.storeId}:${item.deviceInventoryId}`}>
                <TableCell className="font-medium text-[#333]">{item.name}</TableCell>
                <TableCell className="text-[#858585]">{storeName}</TableCell>
                <TableCell className="text-[#858585]">{item.category}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell className="text-right tabular-nums text-[#858585]">{item.reorderQty}</TableCell>
                <TableCell className="text-right text-[#858585]">{item.updatedAt.toLocaleString("en-IN")}</TableCell>
              </TableRow>
            ))}
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-[#858585]">
                  No inventory rows yet (sync POS after configuring cloud sync).
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#858585]">
        <span>
          {total.toLocaleString("en-IN")} rows · Page {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <Link
            className={`rounded-full px-3 py-1 ring-1 ring-[#ebebeb] ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-[#f7f7f7]"}`}
            href={hrefForPage(page - 1)}
          >
            Prev
          </Link>
          <Link
            className={`rounded-full px-3 py-1 ring-1 ring-[#ebebeb] ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-[#f7f7f7]"}`}
            href={hrefForPage(page + 1)}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}

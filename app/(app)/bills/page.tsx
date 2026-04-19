import Link from "next/link";

import { TimeframeSelector } from "@/components/app/timeframe-selector";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getBillsPage, type BillsListStatus } from "@/lib/queries/bills-list";
import {
  resolveCustomRange,
  resolvePresetRange,
  toDateInput,
  type PeriodPreset,
} from "@/lib/ist";
import { formatINR } from "@/lib/money";
import { getStoreScopeFromCookie } from "@/lib/store-cookie";

const PAGE_SIZE = 20;

type Search = {
  period?: PeriodPreset;
  from?: string;
  to?: string;
  status?: string;
  q?: string;
  page?: string;
};

function parseStatus(raw: string | undefined): BillsListStatus {
  if (raw === "draft" || raw === "completed" || raw === "voided") return raw;
  return "all";
}

export default async function BillsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const period = params.period ?? "today";
  const range =
    period === "custom" && params.from && params.to
      ? resolveCustomRange(params.from, params.to)
      : resolvePresetRange(period === "custom" ? "today" : period);

  const scope = await getStoreScopeFromCookie();
  const status = parseStatus(params.status);
  const q = params.q ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const { items, total, totalPages } = await getBillsPage({
    scope,
    from: range.from,
    to: range.to,
    status,
    q,
    page,
    pageSize: PAGE_SIZE,
  });

  const base = new URLSearchParams();
  base.set("period", period);
  if (period === "custom" && params.from && params.to) {
    base.set("from", params.from);
    base.set("to", params.to);
  }
  if (q.trim()) base.set("q", q.trim());
  if (status !== "all") base.set("status", status);

  function hrefForPage(p: number) {
    const sp = new URLSearchParams(base.toString());
    if (p <= 1) sp.delete("page");
    else sp.set("page", String(p));
    return `/bills?${sp.toString()}`;
  }

  const periodLabel =
    period === "custom"
      ? `${toDateInput(range.from)} – ${toDateInput(range.to)}`
      : period === "today"
        ? "Today"
        : period === "week"
          ? "Past 7 days"
          : period === "month"
            ? "This month"
            : "This year";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#333]">Bills</h1>
          <p className="mt-1 text-sm text-[#858585]">{periodLabel}</p>
        </div>
        <TimeframeSelector variant="header" />
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["draft", "Draft"],
              ["completed", "Completed"],
              ["voided", "Voided"],
            ] as const
          ).map(([value, label]) => {
            const sp = new URLSearchParams(base.toString());
            if (value === "all") sp.delete("status");
            else sp.set("status", value);
            sp.delete("page");
            const active = status === value;
            return (
              <Link
                key={value}
                href={`/bills?${sp.toString()}`}
                className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-[#ebebeb] transition ${
                  active ? "bg-[#ffeee0] text-[#333]" : "bg-white text-[#858585] hover:bg-[#f7f7f7]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <form className="ml-auto flex max-w-md flex-1 gap-2" action="/bills" method="get">
          <input type="hidden" name="period" value={period} />
          {period === "custom" && params.from && params.to ? (
            <>
              <input type="hidden" name="from" value={params.from} />
              <input type="hidden" name="to" value={params.to} />
            </>
          ) : null}
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search bill #"
            className="h-10 w-full rounded-full border-0 bg-[#f7f7f7] px-4 text-sm ring-1 ring-[#ebebeb] outline-none focus:ring-2 focus:ring-[#ff6b1e]/35"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(51,51,51,0.06)] ring-1 ring-[#ebebeb]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(({ bill, storeName }) => (
              <TableRow key={`${bill.storeId}:${bill.deviceBillId}`}>
                <TableCell className="font-medium text-[#333]">{bill.billNumber}</TableCell>
                <TableCell className="text-[#858585]">{storeName}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="rounded-full bg-[#f7f7f7] text-[#333]">
                    {bill.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#858585]">{bill.createdAt.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right font-semibold text-[#333]">{formatINR(bill.totalRupee)}</TableCell>
              </TableRow>
            ))}
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-[#858585]">
                  No bills found for this filter.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#858585]">
        <span>
          {total.toLocaleString("en-IN")} bills · Page {page} / {totalPages}
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

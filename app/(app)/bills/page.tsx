import { BillsAnalyticsSection } from "@/components/app/bills-analytics-section";
import { BillsHeader } from "@/components/app/bills-header";
import {
  AdminBillsRecentOrders,
  type AdminBillsStatusTab,
} from "@/components/app/admin-bills-recent-orders";
import {
  getAdminBillStatusCounts,
  getAdminOrderTypeCounts,
  getBillsPage,
} from "@/lib/queries/bills-list";
import {
  resolveCustomRange,
  resolvePresetRange,
  toDateInput,
  type PeriodPreset,
} from "@/lib/ist";
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

function periodLabel(period: PeriodPreset, from: Date, to: Date): string {
  if (period === "custom") {
    return `${toDateInput(from)} – ${toDateInput(to)}`;
  }
  const map: Record<Exclude<PeriodPreset, "custom">, string> = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
  };
  return map[period];
}

function parseStatus(raw: string | undefined): AdminBillsStatusTab {
  if (raw === "completed" || raw === "voided") return raw;
  // Legacy ?status=draft ("On Process") — filter removed; show all
  return "all";
}

function buildBaseSearchParams(
  period: PeriodPreset,
  fromInput: string | undefined,
  toInput: string | undefined,
  q: string,
): URLSearchParams {
  const sp = new URLSearchParams();
  sp.set("period", period);
  if (period === "custom" && fromInput && toInput) {
    sp.set("from", fromInput);
    sp.set("to", toInput);
  }
  if (q.trim()) sp.set("q", q.trim());
  return sp;
}

function buildPaginationItems(page: number, totalPages: number, base: URLSearchParams) {
  const href = (p: number) => {
    const qs = new URLSearchParams(base.toString());
    if (p <= 1) qs.delete("page");
    else qs.set("page", String(p));
    return `/bills?${qs.toString()}`;
  };

  const items: {
    type: "page" | "ellipsis";
    value?: number;
    href?: string;
    active?: boolean;
  }[] = [];

  if (totalPages <= 1) {
    return { prev: null as string | null, next: null as string | null, items };
  }

  const pages: number[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);
    if (left > 2) pages.push(-1);
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push(-1);
    pages.push(totalPages);
  }

  for (const p of pages) {
    if (p === -1) items.push({ type: "ellipsis" });
    else items.push({ type: "page", value: p, href: href(p), active: p === page });
  }

  return {
    prev: page > 1 ? href(page - 1) : null,
    next: page < totalPages ? href(page + 1) : null,
    items,
  };
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

  function tabHref(next: AdminBillsStatusTab) {
    const s = buildBaseSearchParams(period, params.from, params.to, q);
    if (next === "all") s.delete("status");
    else s.set("status", next);
    s.delete("page");
    return `/bills?${s.toString()}`;
  }

  const tabLinks: Record<AdminBillsStatusTab, string> = {
    all: tabHref("all"),
    completed: tabHref("completed"),
    voided: tabHref("voided"),
  };

  const [stats, orderTypes, listFirst] = await Promise.all([
    getAdminBillStatusCounts(scope, range.from, range.to),
    getAdminOrderTypeCounts(scope, range.from, range.to),
    getBillsPage({
      scope,
      from: range.from,
      to: range.to,
      status,
      q,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(listFirst.total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const listResult =
    safePage === page
      ? listFirst
      : await getBillsPage({
          scope,
          from: range.from,
          to: range.to,
          status,
          q,
          page: safePage,
          pageSize: PAGE_SIZE,
        });

  const base = buildBaseSearchParams(period, params.from, params.to, q);
  if (status !== "all") base.set("status", status);

  const pagination = buildPaginationItems(safePage, totalPages, base);

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <BillsHeader />
      <div className="min-w-0 space-y-6">
        <BillsAnalyticsSection
          stats={stats}
          orderTypes={orderTypes}
          periodLabel={periodLabel(period, range.from, range.to)}
        />

        <form
          className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
          action="/bills"
          method="get"
        >
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
            className="h-10 w-full rounded-full border-0 bg-[#f7f7f7] px-4 text-sm ring-1 ring-[#ebebeb] outline-none focus:ring-2 focus:ring-[#ff6b1e]/35 sm:max-w-xs"
          />
        </form>

        <AdminBillsRecentOrders
          rows={listResult.items.map((i) => i.bill)}
          lineQtyByBillKey={listResult.lineQtyByBillKey}
          total={listResult.total}
          page={safePage}
          pageSize={PAGE_SIZE}
          status={status}
          tabLinks={tabLinks}
          pagination={pagination}
        />
      </div>
    </div>
  );
}

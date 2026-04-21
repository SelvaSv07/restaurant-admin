import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AdminBillsRecentOrdersTable } from "@/components/app/admin-bills-recent-orders-table";
import { DashboardPanel } from "@/components/app/dashboard-panel";
import { cloudBills } from "@/lib/db/schema";
import type { BillLineQtyKey } from "@/lib/queries/bills-list";
import { cn } from "@/lib/utils";

type BillRow = InferSelectModel<typeof cloudBills>;

export type AdminBillsStatusTab = "all" | "completed" | "voided";

export function AdminBillsRecentOrders({
  rows,
  lineQtyByBillKey,
  total,
  page,
  pageSize,
  status,
  tabLinks,
  pagination,
}: {
  rows: BillRow[];
  lineQtyByBillKey: Map<BillLineQtyKey, number>;
  total: number;
  page: number;
  pageSize: number;
  status: AdminBillsStatusTab;
  tabLinks: Record<AdminBillsStatusTab, string>;
  pagination: {
    prev: string | null;
    next: string | null;
    items: { type: "page" | "ellipsis"; value?: number; href?: string; active?: boolean }[];
  };
}) {
  const tabs: { id: AdminBillsStatusTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "completed", label: "Completed" },
    { id: "voided", label: "Canceled" },
  ];

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const tabActions = (
    <div className="flex w-full flex-wrap justify-start gap-2 sm:w-auto sm:justify-end">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tabLinks[tab.id]}
          className={cn(
            "cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition-colors",
            status === tab.id
              ? "bg-[#ff6b1e] text-white"
              : "bg-[#f7f7f7] text-[#858585] hover:bg-[#ebebeb]",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );

  return (
    <DashboardPanel
      title="Recent Orders"
      subtitle="Latest bills in the selected period · filter by status"
      action={tabActions}
    >
      <div className="-mx-1 max-w-full overflow-x-auto px-1 sm:mx-0 sm:px-0">
        <AdminBillsRecentOrdersTable rows={rows} lineQtyByBillKey={lineQtyByBillKey} />
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[#ebebeb] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#858585]">
          Showing{" "}
          <span className="inline-flex items-center gap-1 font-medium text-[#333]">
            <span className="rounded-md border border-[#ebebeb] bg-white px-2 py-0.5 text-xs">{pageSize}</span>
          </span>{" "}
          <span className="text-[#333]">
            {from}-{to} of {total}
          </span>
        </p>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {pagination.prev ? (
            <Link
              href={pagination.prev}
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-[#ebebeb] bg-white text-[#333] hover:bg-[#f7f7f7]"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Link>
          ) : (
            <span className="inline-flex size-9 items-center justify-center rounded-lg border border-[#ebebeb] bg-[#f7f7f7] text-[#bebfc2]">
              <ChevronLeft className="size-4" />
            </span>
          )}
          {pagination.items.map((item, i) =>
            item.type === "ellipsis" ? (
              <span key={`e-${i}`} className="px-2 text-sm text-[#858585]">
                …
              </span>
            ) : (
              <Link
                key={`${item.href}-${item.value}`}
                href={item.href!}
                className={cn(
                  "inline-flex min-w-9 cursor-pointer items-center justify-center rounded-lg border px-2 py-1.5 text-sm",
                  item.active
                    ? "border-[#ff6b1e] bg-[#ff6b1e] font-semibold text-white"
                    : "border-[#ebebeb] bg-white text-[#333] hover:bg-[#f7f7f7]",
                )}
              >
                {item.value}
              </Link>
            ),
          )}
          {pagination.next ? (
            <Link
              href={pagination.next}
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-[#ebebeb] bg-white text-[#333] hover:bg-[#f7f7f7]"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span className="inline-flex size-9 items-center justify-center rounded-lg border border-[#ebebeb] bg-[#f7f7f7] text-[#bebfc2]">
              <ChevronRight className="size-4" />
            </span>
          )}
        </div>
      </div>
    </DashboardPanel>
  );
}

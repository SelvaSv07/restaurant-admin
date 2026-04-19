import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import type { InferSelectModel } from "drizzle-orm";

import { cloudBills } from "@/lib/db/schema";
import { formatINR } from "@/lib/money";

type BillRow = InferSelectModel<typeof cloudBills>;

export function AdminRecentBills({
  rows,
}: {
  rows: { bill: BillRow; storeName: string; menuLabel: string; qty: number }[];
}) {
  return (
    <div className="rounded-xl bg-white shadow-[0_4px_24px_rgba(51,51,51,0.06)] ring-1 ring-[#ebebeb]">
      <div className="flex items-center justify-between border-b border-[#ebebeb] px-4 py-3">
        <p className="text-sm font-semibold text-[#333]">Recent bills</p>
        <Link href="/bills" className="text-sm font-medium text-[#ff6b1e] hover:underline">
          View all
        </Link>
      </div>
      <div className="divide-y divide-[#ebebeb]">
        {rows.map(({ bill, storeName, menuLabel, qty }) => (
          <div key={`${bill.storeId}:${bill.deviceBillId}`} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-[#333]">{bill.billNumber}</span>
                <Badge variant="secondary" className="rounded-full bg-[#f7f7f7] text-[#333]">
                  {bill.status}
                </Badge>
                <Badge variant="outline" className="rounded-full border-[#ebebeb] text-[#858585]">
                  {storeName}
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm text-[#858585]">
                {menuLabel} · Qty {qty}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#333]">{formatINR(bill.totalRupee)}</p>
              <p className="text-xs text-[#858585]">{bill.createdAt.toLocaleString("en-IN")}</p>
            </div>
          </div>
        ))}
        {rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-[#858585]">No bills in this period.</div>
        ) : null}
      </div>
    </div>
  );
}

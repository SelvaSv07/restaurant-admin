import type { InferSelectModel } from "drizzle-orm";

import { formatIstParts, OrderTypeBadge, StatusBadge } from "@/components/app/bills-order-display";
import { cloudBills } from "@/lib/db/schema";
import { formatINR, shouldHideDraftZeroAmount, shouldHideDraftZeroQty } from "@/lib/money";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { BillLineQtyKey } from "@/lib/queries/bills-list";

type BillRow = InferSelectModel<typeof cloudBills>;

export function AdminBillsRecentOrdersTable({
  rows,
  lineQtyByBillKey,
}: {
  rows: BillRow[];
  lineQtyByBillKey: Map<BillLineQtyKey, number>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[#ebebeb] hover:bg-transparent">
          <TableHead className="text-xs font-normal text-[#858585]">Order ID</TableHead>
          <TableHead className="text-xs font-normal text-[#858585]">Date</TableHead>
          <TableHead className="text-xs font-normal text-[#858585]">Time</TableHead>
          <TableHead className="text-center text-xs font-normal text-[#858585]">Order type</TableHead>
          <TableHead className="text-right text-xs font-normal text-[#858585]">Qty</TableHead>
          <TableHead className="text-right text-xs font-normal text-[#858585]">Amount</TableHead>
          <TableHead className="text-center text-xs font-normal text-[#858585]">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="py-12 text-center text-sm text-[#858585]">
              No orders match your filters.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((bill) => {
            const { dateLine, timeLine } = formatIstParts(bill.createdAt);
            const key = `${bill.storeId}:${bill.deviceBillId}` as BillLineQtyKey;
            const qty = lineQtyByBillKey.get(key) ?? 0;
            return (
              <TableRow key={key} className="border-[#ebebeb] hover:bg-[#fafafa]">
                <TableCell className="align-middle">
                  <span className="text-sm font-medium text-[#333]">ORD-{bill.billNumber}</span>
                </TableCell>
                <TableCell className="align-middle">
                  <span className="text-sm font-medium text-[#333]">{dateLine}</span>
                </TableCell>
                <TableCell className="align-middle">
                  <span className="text-sm tabular-nums text-[#333]">{timeLine}</span>
                </TableCell>
                <TableCell className="align-middle text-center">
                  <OrderTypeBadge orderType={bill.orderType} />
                </TableCell>
                <TableCell className="align-middle text-right text-sm tabular-nums">
                  {shouldHideDraftZeroQty(bill.status, qty) ? (
                    <span className="font-medium text-[#858585]">—</span>
                  ) : (
                    <span className="text-[#333]">{qty}</span>
                  )}
                </TableCell>
                <TableCell className="align-middle text-right text-sm font-semibold tabular-nums">
                  {shouldHideDraftZeroAmount(bill.status, bill.totalRupee) ? (
                    <span className="font-medium text-[#858585]">—</span>
                  ) : (
                    <span className="text-[#ff6b1e]">{formatINR(bill.totalRupee)}</span>
                  )}
                </TableCell>
                <TableCell className="align-middle text-center">
                  <StatusBadge status={bill.status} />
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

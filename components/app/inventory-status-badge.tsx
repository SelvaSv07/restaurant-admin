import { cn } from "@/lib/utils";
import type { InventoryStatus } from "@/lib/inventory";

export function InventoryStatusBadge({ status }: { status: InventoryStatus }) {
  if (status === "out") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#ebebeb] px-2 py-1 text-xs text-[#333]">
        <span className="size-[7px] rounded-sm bg-[#333]" />
        Out of Stock
      </span>
    );
  }
  if (status === "low") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f7f7f7] px-2 py-1 text-xs text-[#333]">
        <span className="size-[7px] rounded-sm bg-[#858585]" />
        Low
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[#333]",
        "bg-[#ffeee0]",
      )}
    >
      <span className="size-[7px] rounded-sm bg-[#fdcea1]" />
      Available
    </span>
  );
}

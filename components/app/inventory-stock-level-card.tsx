"use client";

import { splitStockBars } from "@/lib/inventory";

const BAR_COLORS = {
  in: "bg-[#ff6b1e]",
  low: "bg-[#fdcea1]",
  out: "bg-[#333]",
  muted: "bg-[#ebebeb]",
} as const;

export function InventoryStockLevelCard({
  totalProducts,
  inCount,
  lowCount,
  outCount,
}: {
  totalProducts: number;
  inCount: number;
  lowCount: number;
  outCount: number;
}) {
  const bars = splitStockBars(inCount, lowCount, outCount);

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 rounded-xl bg-white p-4 shadow-none ring-1 ring-black/[0.06]">
      <h2 className="text-base font-semibold text-[#333]">Stock Level</h2>

      <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[32px] font-semibold leading-none tabular-nums text-[#333]">
            {totalProducts.toLocaleString("en-IN")}
          </span>
          <span className="text-sm leading-none text-[#858585]">Products</span>
        </div>

        <div className="flex h-12 w-full gap-1">
          {bars.map((b, i) => (
            <div key={i} className={`min-w-px flex-1 rounded-sm ${BAR_COLORS[b]}`} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-[#ebebeb] pt-4 sm:grid-cols-3 sm:gap-4">
          <StockLegend color="bg-[#ff6b1e]" label="In Stock" value={inCount} />
          <StockLegend color="bg-[#fdcea1]" label="Low Stock" value={lowCount} />
          <StockLegend color="bg-[#333]" label="Out of Stock" value={outCount} />
        </div>
      </div>
    </div>
  );
}

function StockLegend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={`mt-1.5 size-2 shrink-0 rounded-sm ${color}`} aria-hidden />
      <div className="min-w-0 flex flex-col gap-1">
        <p className="text-xs leading-tight text-[#858585]">{label}</p>
        <p className="text-lg font-semibold leading-tight tabular-nums text-[#333]">
          {value.toLocaleString("en-IN")}
          <span className="ml-1 text-xs font-normal text-[#858585]">Products</span>
        </p>
      </div>
    </div>
  );
}

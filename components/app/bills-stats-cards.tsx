import { Ban, CheckCircle2, CircleDashed, MoreHorizontal, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BillsStatsCards({
  total,
  onProcess,
  completed,
  canceled,
}: {
  total: number;
  onProcess: number;
  completed: number;
  canceled: number;
}) {
  const items = [
    {
      label: "Total Orders",
      value: total,
      icon: Receipt,
    },
    {
      label: "On Process",
      value: onProcess,
      icon: CircleDashed,
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
    },
    {
      label: "Canceled",
      value: canceled,
      icon: Ban,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-[0_4px_24px_rgba(51,51,51,0.06)] ring-1 ring-[#ebebeb]"
        >
          <div className="flex items-start justify-between">
            <span className="flex size-[26px] items-center justify-center text-[#ff6b1e]">
              <Icon className="size-[22px]" strokeWidth={1.75} />
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-md text-[#858585]"
              aria-label="More"
            >
              <MoreHorizontal className="size-5" />
            </Button>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-[22px] font-semibold leading-tight text-[#333]">{value}</p>
            <p className="text-sm leading-snug text-[#858585]">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

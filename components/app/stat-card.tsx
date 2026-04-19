import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatSignedPercent } from "@/lib/dashboard-trends";

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  trendPct?: number | null;
};

export function StatCard({ label, value, icon: Icon, trendPct }: StatCardProps) {
  const showTrend = trendPct != null && Number.isFinite(trendPct);
  const positive = (trendPct ?? 0) >= 0;
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-[0_4px_24px_rgba(51,51,51,0.06)] ring-1 ring-[#ebebeb]">
      <div className="flex shrink-0 items-center justify-center rounded-[10px] bg-[#ff6b1e] p-3 text-white">
        <Icon className="size-[30px]" strokeWidth={1.75} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
        <p className="text-sm leading-tight text-[#858585]">{label}</p>
        <div className="flex items-end justify-between gap-2">
          <p className="text-2xl font-semibold leading-none tracking-tight text-[#333]">{value}</p>
          {showTrend ? (
            <div className="flex shrink-0 items-center gap-1">
              <span className="flex items-center rounded-xl bg-[#ffeee0] p-0.5">
                <TrendIcon className="size-2.5 text-[#ff6b1e]" strokeWidth={2.5} />
              </span>
              <span className="text-xs text-[#858585]">{formatSignedPercent(trendPct!)}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

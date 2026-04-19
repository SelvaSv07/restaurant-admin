import { IndianRupee, Package, Receipt } from "lucide-react";

import { AdminRecentBills } from "@/components/app/admin-recent-bills";
import { AdminRevenueChart } from "@/components/app/admin-revenue-chart";
import { DashboardHeader } from "@/components/app/dashboard-header";
import { StatCard } from "@/components/app/stat-card";

import { getDashboardPageData, getRecentBillsAdmin } from "@/lib/queries/dashboard";
import {
  chartBucketForPreset,
  resolveCustomRange,
  resolvePresetRange,
  type PeriodPreset,
} from "@/lib/ist";
import { formatINR } from "@/lib/money";
import { getStoreScopeFromCookie } from "@/lib/store-cookie";

type Search = {
  period?: PeriodPreset;
  from?: string;
  to?: string;
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const period = params.period ?? "today";
  const range =
    period === "custom" && params.from && params.to
      ? resolveCustomRange(params.from, params.to)
      : resolvePresetRange(period === "custom" ? "today" : period);

  const scope = await getStoreScopeFromCookie();
  const chartBucket = period === "custom" ? "day" : chartBucketForPreset(period);

  const data = await getDashboardPageData(scope, range, { period });
  const recent = await getRecentBillsAdmin(scope, range, 12);

  const revenue = data.stats.totalRupee;
  const orders = data.stats.billCount;

  const periodLabel =
    period === "custom"
      ? `Selected range · ${data.chart.length} ${chartBucket === "month" ? "months" : "days"}`
      : period === "today"
        ? "Today · hourly"
        : period === "week"
          ? `Past 7 days · ${data.chart.length} buckets`
          : period === "month"
            ? `This month · ${data.chart.length} days`
            : `This year · ${data.chart.length} months`;

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader />

      <div className="min-w-0 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total orders"
            value={orders.toLocaleString("en-IN")}
            icon={Receipt}
            trendPct={data.stats.ordersTrendPct}
          />
          <StatCard
            label="Items sold"
            value={data.itemsSold.toLocaleString("en-IN")}
            icon={Package}
            trendPct={data.stats.itemsTrendPct}
          />
          <StatCard
            label="Total revenue"
            value={formatINR(revenue)}
            icon={IndianRupee}
            trendPct={data.stats.revenueTrendPct}
          />
        </div>

        <div className="rounded-xl bg-white p-4 shadow-[0_4px_24px_rgba(51,51,51,0.06)] ring-1 ring-[#ebebeb]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-3">
            <div>
              <p className="text-sm font-semibold text-[#333]">Revenue</p>
              <p className="text-xs text-[#858585]">{periodLabel}</p>
            </div>
          </div>
          <AdminRevenueChart data={data.chart} />
        </div>

        <AdminRecentBills rows={recent} />
      </div>
    </div>
  );
}

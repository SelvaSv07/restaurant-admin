"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardChartPoint } from "@/lib/queries/dashboard";

import { formatINR } from "@/lib/money";

export function AdminRevenueChart({ data }: { data: DashboardChartPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    revenueLabel: formatINR(d.revenue),
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebebeb" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value) => [formatINR(Number(value ?? 0)), "Revenue"]}
            labelFormatter={(label) => String(label)}
            contentStyle={{ borderRadius: 12, border: "1px solid #ebebeb" }}
          />
          <Bar dataKey="revenue" fill="#ff6b1e" radius={[8, 8, 0, 0]} maxBarSize={56} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
